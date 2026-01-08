import AgoraRTC from 'agora-rtc-sdk-ng'

// Agora App ID from environment
export const AGORA_APP_ID = import.meta.env.VITE_AGORA_APP_ID

// Detect if running on mobile device
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.innerWidth < 768)
}

// Detect if running on iOS
export const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// Get optimal codec for device
export const getOptimalCodec = () => {
  // iOS ve mobil cihazlarda H264 daha iyi desteklenir
  if (isMobileDevice() || isIOS()) {
    return 'h264'
  }
  // Desktop'ta VP8 genellikle daha iyi performans gösterir
  return 'vp8'
}

// Agora Client helper
export const createAgoraClient = () => {
  if (!AGORA_APP_ID) {
    throw new Error('AGORA_APP_ID is not set in environment variables')
  }

  const codec = getOptimalCodec()
  const isMobile = isMobileDevice()
  
  console.log('Creating Agora client with config:', {
    codec,
    isMobile,
    isIOS: isIOS(),
    userAgent: navigator.userAgent
  })

  // Create client with configuration
  const client = AgoraRTC.createClient({ 
    mode: 'live', 
    codec: codec,
  })
  
  // Set client to reduce unnecessary network requests
  // This helps reduce ERR_NETWORK_CHANGED errors from stats collector
  try {
    // Disable automatic stats reporting to reduce network errors
    // Note: This is optional and doesn't affect video/audio quality
    client.enableAudioVolumeIndicator = false
  } catch (e) {
    // Ignore if option is not available
    console.debug('Stats collector configuration not available')
  }

  return client
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
      
      // UID'yi numeric olarak gönder (Agora numeric bekliyor)
      const numericUid = typeof uid === 'string' ? parseInt(uid, 10) || 0 : uid || 0
      
      const { data, error } = await supabaseClient.functions.invoke('agora-token', {
        body: {
          channelName,
          uid: numericUid, // Numeric UID gönder
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

      // Return token and appId from server response
      return { token: data.token, appId: data.appId }
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
    return { token: data.token, appId: data.appId || AGORA_APP_ID }
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

