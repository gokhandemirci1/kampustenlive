import { useState, useEffect, useRef } from 'react'
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react'
import AgoraRTC from 'agora-rtc-sdk-ng'
import { createAgoraClient, fetchAgoraToken, AGORA_ROLES, AGORA_APP_ID } from '../../lib/agora'
import { getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const LiveClassStudent = ({ courseId, channelName, onLeave }) => {
  const [client, setClient] = useState(null)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false) // Default kapalı
  const [isAudioEnabled, setIsAudioEnabled] = useState(false) // Default kapalı
  const [remoteUsers, setRemoteUsers] = useState([])
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

  // Play remote user videos when they're added
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack) {
        const container = document.getElementById(`remote-${user.uid}`)
        if (container) {
          user.videoTrack.play(container).catch(err => {
            console.error('Error playing remote video:', err)
          })
        }
      }
    })
  }, [remoteUsers])

  // Play local video when enabled and container is ready
  useEffect(() => {
    const playLocalVideo = async () => {
      if (isVideoEnabled && localVideoTrack.current && localVideoContainer.current) {
        try {
          await localVideoTrack.current.play(localVideoContainer.current)
          console.log('Student local video played successfully')
        } catch (err) {
          console.error('Error playing student local video:', err)
        }
      }
    }
    
    playLocalVideo()
  }, [isVideoEnabled, localVideoTrack.current, localVideoContainer.current])

  const initAgora = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Kullanıcı girişi gerekli')
      }

      // UID için user ID'den numeric bir değer oluştur (Agora numeric UID bekliyor)
      const userIdHash = user.id.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0)
      }, 0)
      rtcUid.current = Math.abs(userIdHash) % 2147483647 // Max 32-bit signed int

      // Create Agora client
      const agoraClient = createAgoraClient()
      setClient(agoraClient)

      // Set client role as audience (default - subscriber)
      await agoraClient.setClientRole('audience')

      // Fetch token with subscriber role (audience)
      const tokenResponse = await fetchAgoraToken(channelName, rtcUid.current, AGORA_ROLES.SUBSCRIBER)
      const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse.token
      const appIdFromServer = typeof tokenResponse === 'string' ? null : tokenResponse.appId
      
      // Use App ID from server response, fallback to env variable
      const appId = appIdFromServer || AGORA_APP_ID

      console.log('Student Token Response:', { 
        tokenLength: token?.length, 
        appIdFromServer, 
        appIdFromEnv: AGORA_APP_ID,
        finalAppId: appId,
        uid: rtcUid.current,
        channelName 
      })

      if (!token) {
        throw new Error('Token is empty or invalid')
      }

      // Join channel - App ID must match the one used to generate token
      await agoraClient.join(appId, channelName, token, rtcUid.current)

      setIsLoading(false)
      showToast.success('Canlı derse katıldınız!')

      // Listen for remote users (teacher and other students)
      agoraClient.on('user-published', handleUserPublished)
      agoraClient.on('user-unpublished', handleUserUnpublished)
    } catch (error) {
      console.error('Error initializing Agora:', error)
      handleApiError(error)
      setIsLoading(false)
    }
  }

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType)

    if (mediaType === 'video') {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid)
        if (!exists) {
          // Play video track when user is added
          setTimeout(() => {
            const container = document.getElementById(`remote-${user.uid}`)
            if (container && user.videoTrack) {
              user.videoTrack.play(container).catch(err => {
                console.error('Error playing remote video:', err)
              })
              console.log('Remote user video track played:', user.uid)
            }
          }, 100)
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

  const enableVideo = async () => {
    try {
      console.log('Student enabling video...')
      
      // Switch to host role to publish
      await client.setClientRole('host')

      // Create and publish video track
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '480p', // Lower resolution for students
      })
      console.log('Student video track created:', localVideoTrack.current)

      // Play video in container with retry mechanism
      const playVideo = async () => {
        if (localVideoContainer.current && localVideoTrack.current) {
          const container = localVideoContainer.current
          if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            try {
              await localVideoTrack.current.play(container)
              console.log('Student local video track played successfully', {
                containerWidth: container.offsetWidth,
                containerHeight: container.offsetHeight
              })
            } catch (playError) {
              console.error('Error playing student video in container:', playError)
              setTimeout(playVideo, 300)
            }
          } else {
            console.log('Student container not rendered yet, retrying...')
            setTimeout(playVideo, 200)
          }
        } else {
          console.log('Student container or track not ready, retrying...')
          setTimeout(playVideo, 200)
        }
      }

      // Start playing video
      playVideo()

      await client.publish(localVideoTrack.current)
      setIsVideoEnabled(true)
      
      // Also try to play after state update
      setTimeout(async () => {
        if (localVideoTrack.current && localVideoContainer.current) {
          try {
            await localVideoTrack.current.play(localVideoContainer.current)
            console.log('Student video played after publish')
          } catch (err) {
            console.error('Error playing student video after publish:', err)
          }
        }
      }, 500)
    } catch (error) {
      console.error('Error enabling video:', error)
      showToast.error('Kamera açılamadı: ' + error.message)
      // Revert to audience if failed
      await client.setClientRole('audience')
    }
  }

  const disableVideo = async () => {
    if (localVideoTrack.current) {
      await client.unpublish(localVideoTrack.current)
      localVideoTrack.current.stop()
      localVideoTrack.current.close()
      localVideoTrack.current = null
    }
    await client.setClientRole('audience')
    setIsVideoEnabled(false)
  }

  const enableAudio = async () => {
    try {
      // Switch to host role to publish
      await client.setClientRole('host')

      // Create and publish audio track
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack()
      await client.publish(localAudioTrack.current)
      setIsAudioEnabled(true)
    } catch (error) {
      console.error('Error enabling audio:', error)
      showToast.error('Mikrofon açılamadı')
      // Revert to audience if failed
      await client.setClientRole('audience')
    }
  }

  const disableAudio = async () => {
    if (localAudioTrack.current) {
      await client.unpublish(localAudioTrack.current)
      localAudioTrack.current.stop()
      localAudioTrack.current.close()
      localAudioTrack.current = null
    }
    
    // If both video and audio are disabled, switch back to audience
    if (!isVideoEnabled) {
      await client.setClientRole('audience')
    }
    
    setIsAudioEnabled(false)
  }

  const toggleVideo = async () => {
    if (isVideoEnabled) {
      await disableVideo()
    } else {
      await enableVideo()
    }
  }

  const toggleAudio = async () => {
    if (isAudioEnabled) {
      await disableAudio()
    } else {
      await enableAudio()
    }
  }

  const handleLeave = async () => {
    await cleanup()
    if (onLeave) onLeave()
  }

  const cleanup = async () => {
    try {
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

      if (client) {
        await client.leave()
        client.removeAllListeners()
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
          <p className="text-gray-600">Canlı derse katılıyorsunuz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Main video area */}
      <div className="flex-1 flex flex-wrap gap-4 p-4 overflow-auto">
        {/* Remote users (teacher and other students) */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', flex: '1 1 300px' }}>
            <div
              id={`remote-${user.uid}`}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            ></div>
          </div>
        ))}

        {/* Local video (only if enabled) */}
        {isVideoEnabled && (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', flex: '1 1 300px' }}>
            <div
              ref={localVideoContainer}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
            ></div>
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              Sen
            </div>
          </div>
        )}

        {remoteUsers.length === 0 && (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center text-white">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-400">Öğretmen yayına başladığında burada görünecek</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-2">
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={isVideoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-white'
          }`}
          title={isAudioEnabled ? 'Mikrofonu Kapat' : 'Mikrofonu Aç'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Dersden Ayrıl"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Remote user videos are rendered above and played via useEffect */}
    </div>
  )
}

export default LiveClassStudent

