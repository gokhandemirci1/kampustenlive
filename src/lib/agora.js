import AgoraRTC from 'agora-rtc-sdk-ng'

// Agora App ID from environment
export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID

// Agora Client helper
export const createAgoraClient = () => {
  if (!AGORA_APP_ID) {
    throw new Error('AGORA_APP_ID is not set in environment variables')
  }

  return AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
}

// Token server URL - Supabase Edge Function veya custom backend
export const getTokenServerUrl = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const customTokenServer = import.meta.env.VITE_AGORA_TOKEN_SERVER_URL
  
  // Önce custom token server URL'i kontrol et
  if (customTokenServer) {
    return customTokenServer
  }
  
  // Supabase Edge Function için:
  if (supabaseUrl) {
    return `${supabaseUrl}/functions/v1/agora-token`
  }
  
  // Fallback to local development server
  return 'http://localhost:3001/api/agora-token'
}

/**
 * Agora RTC Token almak için backend'e istek gönderir
 * @param {string} channelName - Agora channel name
 * @param {string|number} uid - User ID (0 = auto-generate)
 * @param {number} role - 1 = host/broadcaster, 2 = audience
 * @returns {Promise<string>} RTC Token
 */
export const fetchAgoraToken = async (channelName, uid, role = 2) => {
  try {
    const tokenServerUrl = getTokenServerUrl()
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    
    // Supabase Edge Function kullanıyorsak, Supabase client ile çağıralım (CORS sorununu çözer)
    if (tokenServerUrl.includes('/functions/v1/')) {
      const { supabase: supabaseClient } = await import('./supabase')
      
      const { data, error } = await supabaseClient.functions.invoke('agora-token', {
        body: {
          channelName,
          uid: uid.toString(),
          role, // 1 = publisher (teacher), 2 = subscriber (student)
        },
      })

      if (error) {
        console.error('Supabase function invoke error:', error)
        throw new Error(`Token server error: ${error.message || 'Failed to invoke function'}`)
      }

      if (!data || !data.token) {
        console.error('Invalid token response:', data)
        throw new Error('Invalid token response from server')
      }

      return data.token
    }
    
    // Custom token server kullanıyorsak fetch ile çağıralım
    const { supabase } = await import('./supabase')
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers = {
      'Content-Type': 'application/json',
    }
    
    if (session) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
    
    const response = await fetch(tokenServerUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        channelName,
        uid: uid.toString(),
        role,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Token server error: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Error fetching Agora token:', error)
    throw error
  }
}

/**
 * Channel name oluşturur (course_id + timestamp formatı)
 * @param {string} courseId - Course ID
 * @returns {string} Channel name
 */
export const generateChannelName = (courseId) => {
  return `course_${courseId}_${Date.now()}`
}

/**
 * Parse channel name'den course_id çıkarır
 * @param {string} channelName - Channel name
 * @returns {string|null} Course ID
 */
export const parseCourseIdFromChannel = (channelName) => {
  const match = channelName.match(/^course_(.+?)_/)
  return match ? match[1] : null
}

// Agora role constants
export const AGORA_ROLES = {
  PUBLISHER: 1, // Host/Broadcaster (Öğretmen)
  SUBSCRIBER: 2, // Audience (Öğrenci)
}

