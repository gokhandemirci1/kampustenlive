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

  // Play local video when container is ready
  useEffect(() => {
    const playLocalVideo = async () => {
      if (localVideoTrack.current && localVideoContainer.current && isPublished && isVideoEnabled) {
        try {
          // Ensure container has dimensions
          if (localVideoContainer.current.offsetWidth > 0 && localVideoContainer.current.offsetHeight > 0) {
            await localVideoTrack.current.play(localVideoContainer.current)
            console.log('Local video played via useEffect - container ready')
          } else {
            // Wait for container to be rendered
            setTimeout(playLocalVideo, 100)
          }
        } catch (err) {
          console.error('Error playing local video in useEffect:', err)
        }
      }
    }
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(playLocalVideo, 100)
    return () => clearTimeout(timeoutId)
  }, [isPublished, isVideoEnabled])

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

      // Create and publish local tracks
      await createLocalTracks()
      await publishTracks(agoraClient)

      setIsPublished(true)
      setIsLoading(false)

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
      
      // Create video track
      localVideoTrack.current = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: '720p',
      })
      console.log('Video track created:', localVideoTrack.current)
      
      // Create audio track
      localAudioTrack.current = await AgoraRTC.createMicrophoneAudioTrack()
      console.log('Audio track created:', localAudioTrack.current)

      // Wait for container to be available and play video
      const playVideo = async () => {
        if (localVideoContainer.current && localVideoTrack.current) {
          try {
            await localVideoTrack.current.play(localVideoContainer.current)
            console.log('Local video track played successfully in container')
          } catch (playError) {
            console.error('Error playing video in container:', playError)
            // Retry after a short delay
            setTimeout(playVideo, 200)
          }
        } else {
          console.log('Container or track not ready, retrying...', {
            container: !!localVideoContainer.current,
            track: !!localVideoTrack.current
          })
          // Retry after a short delay if container not ready
          setTimeout(playVideo, 200)
        }
      }
      
      // Wait a bit for container to be rendered
      setTimeout(playVideo, 300)

      setIsVideoEnabled(true)
      setIsAudioEnabled(true)
    } catch (error) {
      console.error('Error creating local tracks:', error)
      showToast.error('Kamera veya mikrofon erişimi reddedildi: ' + error.message)
      throw error
    }
  }

  const publishTracks = async (agoraClient) => {
    try {
      if (localVideoTrack.current) {
        await agoraClient.publish(localVideoTrack.current)
      }
      if (localAudioTrack.current) {
        await agoraClient.publish(localAudioTrack.current)
      }
    } catch (error) {
      console.error('Error publishing tracks:', error)
      showToast.error('Yayın başlatılamadı')
    }
  }

  const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType)
    
    if (mediaType === 'video') {
      setRemoteUsers((prev) => {
        const exists = prev.find((u) => u.uid === user.uid)
        if (!exists) {
          // Add user and play video track
          setTimeout(() => {
            const container = document.getElementById(`remote-${user.uid}`)
            if (container && user.videoTrack) {
              user.videoTrack.play(container)
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
        <div className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', flex: '1 1 300px' }}>
          <div
            ref={localVideoContainer}
            className="w-full h-full"
            style={{ minHeight: '400px', width: '100%', height: '100%' }}
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
          <div key={user.uid} className="relative bg-black rounded-lg overflow-hidden" style={{ minWidth: '300px', flex: '1 1 300px' }}>
            <div
              id={`remote-${user.uid}`}
              className="w-full h-full"
              style={{ minHeight: '400px' }}
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

