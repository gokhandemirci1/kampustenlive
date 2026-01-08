import { useState, useEffect, useRef } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users, Settings, Share2 } from 'lucide-react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { createAgoraClient, fetchAgoraToken, AGORA_ROLES, AGORA_APP_ID } from '../../lib/agora'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const LiveClassTeacher = ({ courseId, channelName, onLeave }) => {
  const [client, setClient] = useState(null)
  const [isPublished, setIsPublished] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [remoteUsers, setRemoteUsers] = useState([])
  const [participantCount, setParticipantCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const localVideoTrack = useRef(null)
  const localAudioTrack = useRef(null)
  const localVideoContainer = useRef(null)
  const rtcUid = useRef(null)

  useEffect(() => {
    initAgora()
    return () => {
      cleanup()
    }
  }, [])

  // Play local video when container is ready (useEffect as backup)
  useEffect(() => {
    if (isPublished && isVideoEnabled && localVideoTrack.current) {
      const timeoutId = setTimeout(() => {
        playLocalVideo()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [isPublished, isVideoEnabled])

  // Play remote user videos when they're added (via useEffect)
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const playRemoteVideo = async () => {
          const container = document.getElementById(`remote-${user.uid}`)
          if (container) {
            // Check if container is rendered
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
              try {
                await user.videoTrack.play(container)
                console.log('Teacher: Remote user video played successfully', {
                  uid: user.uid,
                  containerWidth: container.offsetWidth,
                  containerHeight: container.offsetHeight
                })
              } catch (err) {
                console.error('Error playing remote video:', err)
                // Retry after delay
                setTimeout(playRemoteVideo, 300)
              }
            } else {
              // Retry if container not rendered yet
              setTimeout(playRemoteVideo, 200)
            }
          } else {
            console.log('Teacher: Container not found for user', user.uid)
          }
        }
        playRemoteVideo()
      }
    })
  }, [remoteUsers])

  const initAgora = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Kullanıcı girişi gerekli')
      }

      // UID için user ID'den numeric bir değer oluştur (Agora numeric UID bekliyor)
      // UUID'yi numeric'e çevirmek için hash benzeri bir yöntem kullan
      const userIdHash = user.id.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
      }, 0)
      // Pozitif bir sayı yap ve makul bir aralığa al
      rtcUid.current = Math.abs(userIdHash) % 2147483647 // Max 32-bit signed int

      // Create Agora client
      const agoraClient = createAgoraClient()
      setClient(agoraClient)

      // Set client role as host
      await agoraClient.setClientRole('host')

      // Fetch token
      const tokenResponse = await fetchAgoraToken(channelName, rtcUid.current, AGORA_ROLES.PUBLISHER)
      console.log('Raw token response:', tokenResponse)
      
      const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse.token
      const appIdFromServer = typeof tokenResponse === 'string' ? null : tokenResponse.appId
      
      // Use App ID from server response, fallback to env variable
      const appId = appIdFromServer || AGORA_APP_ID

      console.log('Join Parameters:', { 
        tokenType: typeof token,
        tokenLength: token?.length, 
        tokenPreview: token ? token.substring(0, 30) + '...' : 'null',
        appIdFromServer, 
        appIdFromEnv: AGORA_APP_ID,
        finalAppId: appId,
        uid: rtcUid.current,
        uidType: typeof rtcUid.current,
        channelName,
        channelNameLength: channelName?.length
      })

      if (!token || typeof token !== 'string') {
        console.error('Invalid token:', token)
        throw new Error('Token is empty or invalid')
      }

      if (!appId || typeof appId !== 'string') {
        console.error('Invalid App ID:', appId)
        throw new Error('App ID is empty or invalid')
      }

      // Join channel - App ID must match the one used to generate token
      console.log('Attempting to join channel...')
      try {
        await agoraClient.join(appId, channelName, token, rtcUid.current)
        console.log('Successfully joined channel!')
      } catch (joinError) {
        console.error('Join error details:', {
          error: joinError,
          appId,
          channelName,
          uid: rtcUid.current,
          tokenLength: token.length,
          tokenStart: token.substring(0, 20)
        })
        throw joinError
      }

      // Create local tracks
      await createLocalTracks()
      
      // Publish tracks to channel
      await publishTracks(agoraClient)
      console.log('✅ Teacher: Tracks published successfully')
      
      // Log current remote users to verify publish
      console.log('Teacher: Current connection state:', agoraClient.connectionState)
      console.log('Teacher: Current remote users count:', agoraClient.remoteUsers?.length || 0)

      // Update is_live status in database
      if (courseId) {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ is_live: true })
          .eq('id', courseId)
        
        if (updateError) {
          console.error('Error updating is_live status:', updateError)
        } else {
          console.log('Course is_live status updated to true')
        }
      }

      setIsPublished(true)
      setIsLoading(false)
      
      // Play local video after publish and state update
      // Retry mechanism to ensure container is rendered
      let retries = 0
      const maxRetries = 10
      const tryPlayVideo = async () => {
        retries++
        const played = await playLocalVideo()
        if (!played && retries < maxRetries) {
          setTimeout(tryPlayVideo, 200)
        } else if (!played) {
          console.warn('Failed to play video after', maxRetries, 'retries')
        }
      }
      setTimeout(tryPlayVideo, 300)

      // Listen for remote users
      agoraClient.on('user-published', handleUserPublished)
      agoraClient.on('user-unpublished', handleUserUnpublished)
      agoraClient.on('user-joined', handleUserJoined)
      agoraClient.on('user-left', handleUserLeft)

      showToast.success('Canlı yayın başlatıldı!')
    } catch (error) {
      console.error('Error initializing Agora:', error)
      handleApiError(error)
      setIsLoading(false)
    }
  }

  const createLocalTracks = async () => {
    try {
      console.log('Creating local tracks...')
      
      // Detect mobile device for optimal settings
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (typeof window !== 'undefined' && window.innerWidth < 768)
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
      
      console.log('Device info:', { isMobile, isIOS, userAgent: navigator.userAgent })
      
      // Mobile devices, especially iOS, have better performance with lower resolution
      const videoConfig = isMobile 
        ? (isIOS ? '480p_1' : '480p') // iOS'ta 480p_1 (daha düşük bitrate) kullan
        : '720p'
      
      console.log('Creating video track with config:', videoConfig)
      
      // Create video track with device-appropriate config
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: videoConfig,
        optimizationMode: 'motion', // Motion optimization for better performance on mobile
      })
      console.log('Video track created:', localVideoTrack.current)
      
      // Create audio track
      console.log('Creating audio track...')
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack({
        encoderConfig: 'speech_standard', // Optimize for speech on mobile
      })
      console.log('Audio track created:', localAudioTrack.current)

      // Verify tracks are created
      if (!localVideoTrack.current) {
        throw new Error('Video track creation failed')
      }
      if (!localAudioTrack.current) {
        throw new Error('Audio track creation failed')
      }

      console.log('Tracks verified:', {
        videoTrack: !!localVideoTrack.current,
        audioTrack: !!localAudioTrack.current,
        videoTrackId: localVideoTrack.current?.getTrackId?.(),
        audioTrackId: localAudioTrack.current?.getTrackId?.(),
      })

      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
    } catch (error) {
      console.error('Error creating local tracks:', error)
      showToast.error('Kamera veya mikrofon erişimi reddedildi: ' + error.message)
      throw error
    }
  }
  
  // Separate function to play local video
  const playLocalVideo = async () => {
    if (!localVideoTrack.current || !localVideoContainer.current) {
      console.log('Cannot play video: track or container missing', {
        track: !!localVideoTrack.current,
        container: !!localVideoContainer.current
      })
      return false
    }

    const container = localVideoContainer.current
    
    // Check if container is rendered with dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.log('Container not rendered yet, dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight
      })
      return false
    }

    try {
      await localVideoTrack.current.play(container)
      console.log('Local video played successfully', {
        containerWidth: container.offsetWidth,
        containerHeight: container.offsetHeight
      })
      return true
    } catch (playError) {
      console.error('Error playing video:', playError)
      return false
    }
  }

  const publishTracks = async (agoraClient) => {
    try {
      console.log('Publishing tracks...', {
        videoTrack: !!localVideoTrack.current,
        audioTrack: !!localAudioTrack.current,
        clientState: agoraClient.connectionState,
      })
      
      // Publish video track
      if (localVideoTrack.current) {
        try {
          await agoraClient.publish(localVideoTrack.current)
          console.log('Video track published successfully')
        } catch (videoError) {
          console.error('Error publishing video track:', videoError)
          showToast.error('Video yayını başlatılamadı: ' + videoError.message)
          // Continue with audio even if video fails
        }
      } else {
        console.warn('No video track to publish')
      }
      
      // Publish audio track
      if (localAudioTrack.current) {
        try {
          await agoraClient.publish(localAudioTrack.current)
          console.log('Audio track published successfully')
        } catch (audioError) {
          console.error('Error publishing audio track:', audioError)
          showToast.error('Ses yayını başlatılamadı: ' + audioError.message)
          // Continue even if audio fails
        }
      } else {
        console.warn('No audio track to publish')
      }
      
      // Verify published tracks
      const publishedTracks = await agoraClient.getLocalVideoStats()
      const publishedAudioTracks = await agoraClient.getLocalAudioStats()
      console.log('Published tracks verification:', {
        videoStats: publishedTracks,
        audioStats: publishedAudioTracks,
      })
    } catch (error) {
      console.error('Error publishing tracks:', error)
      showToast.error('Yayın başlatılamadı: ' + error.message)
      throw error
    }
  }

  const handleUserPublished = async (user, mediaType) => {
    console.log('Teacher: User published', { uid: user.uid, mediaType })
    await client.subscribe(user, mediaType)
    console.log('Teacher: Subscribed to user', user.uid)
    
    if (mediaType === 'video') {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid)
        if (!exists) {
          console.log('Teacher: Adding remote user to list', user.uid)
          return [...prev, user]
        }
        return prev
      })
    }

    if (mediaType === 'audio') {
      user.audioTrack?.play()
    }
  }

  const handleUserUnpublished = (user, mediaType) => {
    if (mediaType === 'video') {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
    }
  }

  const handleUserJoined = (user) => {
    setParticipantCount((prev) => prev + 1)
    showToast.info('Yeni bir öğrenci katıldı')
  }

  const handleUserLeft = (user) => {
    setParticipantCount((prev) => Math.max(0, prev - 1))
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid))
  }

  const toggleVideo = async () => {
    if (!localVideoTrack.current) return

    if (isVideoEnabled) {
      await localVideoTrack.current.setEnabled(false)
      setIsVideoEnabled(false)
    } else {
      await localVideoTrack.current.setEnabled(true)
      setIsVideoEnabled(true)
    }
  }

  const toggleAudio = async () => {
    if (!localAudioTrack.current) return

    if (isAudioEnabled) {
      await localAudioTrack.current.setEnabled(false)
      setIsAudioEnabled(false)
    } else {
      await localAudioTrack.current.setEnabled(true)
      setIsAudioEnabled(true)
    }
  }

  const handleLeave = async () => {
    await cleanup()
    if (onLeave) onLeave()
  }

  const cleanup = async () => {
    try {
      // Stop and close local tracks
      if (localVideoTrack.current) {
        localVideoTrack.current.stop()
        localVideoTrack.current.close()
        localVideoTrack.current = null
      }

      if (localAudioTrack.current) {
        localAudioTrack.current.stop()
        localAudioTrack.current.close()
        localAudioTrack.current = null
      }

      // Leave channel
      if (client) {
        await client.leave()
        client.removeAllListeners()
      }

      // Update session status in database
      if (courseId) {
        await supabase
          .from('live_sessions')
          .update({ status: 'ended', ended_at: new Date().toISOString() })
          .eq('course_id', courseId)
          .eq('status', 'live')

        await supabase
          .from('courses')
          .update({ is_live: false })
          .eq('id', courseId)
      }
    } catch (error) {
      console.error('Error cleaning up:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yayın başlatılıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main video area */}
      <div className="flex-1 flex flex-wrap gap-4 p-4 overflow-auto">
        {/* Local video (teacher) */}
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', minHeight: '400px', flex: '1 1 300px' }}>
          <div
            ref={localVideoContainer}
            className="w-full h-full"
            style={{ width: '100%', height: '100%', minHeight: '400px' }}
          ></div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="w-16 h-16 text-gray-400" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            Sen (Öğretmen)
          </div>
        </div>

        {/* Remote users (students) */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', minHeight: '400px', flex: '1 1 300px' }}>
            <div
              id={`remote-${user.uid}`}
              className="w-full h-full"
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
            ></div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              Öğrenci
            </div>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-white">
            <Users className="w-5 h-5" />
            <span className="font-medium">{participantCount} Katılımcı</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isVideoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full transition-colors ${
              isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isAudioEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={handleLeave}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="Yayını Sonlandır"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Render remote user videos */}
      {remoteUsers.map((user) => {
        if (user.videoTrack) {
          setTimeout(() => {
            const container = document.getElementById(`remote-${user.uid}`)
            if (container) {
              user.videoTrack.play(container)
            }
          }, 100)
        }
        return null
      })}
    </div>
  )
}

export default LiveClassTeacher

