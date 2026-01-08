// Supabase Edge Function: Agora Token Server
// Bu function Agora RTC token'ları üretir
// NOT: Bu dosyayı Supabase projenize deploy etmeniz gerekiyor

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { RtcTokenBuilder, RtcRole } from 'npm:agora-access-token@2.0.4'

const AGORA_APP_ID = Deno.env.get('AGORA_APP_ID') || ''
const AGORA_APP_CERTIFICATE = Deno.env.get('AGORA_APP_CERTIFICATE') || ''

interface TokenRequest {
  channelName: string
  uid: string | number
  role: number // 1 = publisher, 2 = subscriber
}

serve(async (req) => {
  // CORS headers - Supabase Edge Functions için
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }

  // Handle OPTIONS request (CORS preflight) - Supabase'in beklediği format
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify Supabase auth token
    const authToken = authHeader.replace('Bearer ', '')
    const userResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          apikey: Deno.env.get('SUPABASE_ANON_KEY') || '',
        },
      }
    )

    if (!userResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const body: TokenRequest = await req.json()
    const { channelName, uid, role } = body

    if (!channelName || !uid) {
      return new Response(
        JSON.stringify({ error: 'Missing channelName or uid' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return new Response(
        JSON.stringify({ error: 'Agora configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate RTC token
    const agoraToken = generateRtcToken(channelName, uid, role || 2)

    console.log('Token generated successfully, length:', agoraToken.length)

    return new Response(
      JSON.stringify({ token: agoraToken, appId: AGORA_APP_ID }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error generating token:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateRtcToken(channelName: string, uid: string | number, role: number): string {
  const appId = AGORA_APP_ID
  const appCertificate = AGORA_APP_CERTIFICATE
  
  // Token expiration time (24 hours from now)
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const expirationTimeInSeconds = currentTimestamp + (3600 * 24)
  
  // Determine Agora role
  const agoraRole = role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
  
  // Convert uid to number - if it's a string, try to convert to number
  // If conversion fails or is 0, use 0 (Agora will auto-generate)
  let uidNumber: number
  if (typeof uid === 'string') {
    // Try to parse as number, if it's a UUID substring, use 0
    const parsed = parseInt(uid, 10)
    uidNumber = isNaN(parsed) ? 0 : parsed
  } else {
    uidNumber = uid || 0
  }
  
  // Validate inputs
  if (!appId || !appCertificate) {
    throw new Error('Missing Agora App ID or Certificate')
  }
  
  if (!channelName) {
    throw new Error('Missing channel name')
  }
  
  console.log('Generating token with:', {
    appId: appId.substring(0, 8) + '...',
    channelName,
    uid: uidNumber,
    role: agoraRole,
    expirationTime: expirationTimeInSeconds
  })
  
  // Generate RTC token using Agora's official token builder
  let token: string
  try {
    token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uidNumber,
      agoraRole,
      expirationTimeInSeconds
    )
    
    console.log('Token generation result:', {
      success: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
    })
    
    if (!token || token.length === 0) {
      throw new Error('Token generation failed - empty token returned')
    }
    
    // Validate token format (should be a JWT-like string)
    if (typeof token !== 'string' || token.split('.').length !== 3) {
      console.error('Invalid token format - not a valid JWT structure')
      throw new Error('Token format validation failed')
    }
    
    console.log('Token generated successfully')
    
  } catch (error) {
    console.error('Token generation error:', error)
    throw error
  }
  
  return token
}

/* 
NOT: Bu Edge Function'ı deploy etmek için:

1. Supabase CLI kurun: npm install -g supabase
2. Supabase projenize login olun: supabase login
3. Link edin: supabase link --project-ref your-project-ref
4. Secret'ları ekleyin:
   supabase secrets set AGORA_APP_ID=your_app_id
   supabase secrets set AGORA_APP_CERTIFICATE=your_app_certificate
5. Deploy edin: supabase functions deploy agora-token

ALTERNATIF: Daha basit bir Node.js server da kullanabilirsiniz.
Örnek Node.js server dosyası: server/agora-token-server.js
*/

