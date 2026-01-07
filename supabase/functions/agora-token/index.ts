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
    const token = authHeader.replace('Bearer ', '')
    const userResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
    const token = generateRtcToken(channelName, uid, role || 2)

    return new Response(
      JSON.stringify({ token, appId: AGORA_APP_ID }),
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
  
  // Token expiration time (24 hours)
  const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + 3600 * 24
  
  // Determine Agora role
  const agoraRole = role === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER
  
  // Convert uid to number (0 means auto-generate UID)
  const uidNumber = typeof uid === 'string' ? parseInt(uid) || 0 : uid || 0
  
  // Generate RTC token using Agora's official token builder
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uidNumber,
    agoraRole,
    expirationTimeInSeconds
  )
  
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

