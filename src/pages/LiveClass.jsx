import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import LiveClassTeacher from '../components/live/LiveClassTeacher'
import LiveClassStudent from '../components/live/LiveClassStudent'
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase'
import { showToast, handleApiError } from '../utils/toast'
import { generateChannelName } from '../lib/agora'

const LiveClass = () => {
  const { courseId, sessionId } = useParams()
  const navigate = useNavigate()
  const [userRole, setUserRole] = useState(null)
  const [liveSession, setLiveSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTeacher, setIsTeacher] = useState(false)

  useEffect(() => {
    checkAccessAndLoadSession()
  }, [courseId, sessionId])

  const checkAccessAndLoadSession = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        showToast.error('Giriş yapmanız gerekiyor')
        navigate('/login/student')
        return
      }

      const profile = await getUserProfile(user.id)
      setUserRole(profile.role)
      setIsTeacher(profile.role === 'teacher')

      // Load live session
      let session
      if (sessionId) {
        // Existing session
        const { data, error } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (error) throw error
        session = data
      } else if (courseId) {
        // Check if there's an active session for this course
        const { data, error } = await supabase
          .from('live_sessions')
          .select('*')
          .eq('course_id', courseId)
          .eq('status', 'live')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) throw error

        if (!data && profile.role === 'teacher') {
          // Teacher wants to start a new session
          await createNewSession(courseId, user.id)
          return
        } else if (!data && profile.role === 'student') {
          showToast.error('Bu kurs için aktif canlı ders bulunamadı')
          navigate(`/student/dashboard`)
          return
        }

        session = data
      }

      if (session) {
        // Verify access
        if (profile.role === 'student') {
          // Check if student is enrolled
          const { data: enrollment, error: enrollError } = await supabase
            .from('enrollments')
            .select('*')
            .eq('student_id', user.id)
            .eq('course_id', session.course_id)
            .maybeSingle()

          if (enrollError || !enrollment) {
            showToast.error('Bu derse katılmak için kursa kayıt olmanız gerekiyor')
            navigate(`/student/dashboard`)
            return
          }
        } else if (profile.role === 'teacher') {
          // Check if teacher owns this course
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('teacher_id')
            .eq('id', session.course_id)
            .single()

          if (courseError || course.teacher_id !== user.id) {
            showToast.error('Bu dersi yönetme yetkiniz yok')
            navigate(`/teacher/dashboard`)
            return
          }
        }

        setLiveSession(session)
      }

      setIsLoading(false)
    } catch (error) {
      console.error('Error loading live session:', error)
      handleApiError(error)
      setIsLoading(false)
      navigate('/')
    }
  }

  const createNewSession = async (courseId, teacherId) => {
    try {
      const channelName = generateChannelName(courseId)
      const agoraAppId = import.meta.env.VITE_AGORA_APP_ID

      const { data: session, error } = await supabase
        .from('live_sessions')
        .insert({
          course_id: courseId,
          teacher_id: teacherId,
          channel_name: channelName,
          agora_app_id: agoraAppId,
          status: 'live',
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Update course is_live status
      await supabase
        .from('courses')
        .update({ is_live: true })
        .eq('id', courseId)

      setLiveSession(session)
      setIsLoading(false)

      showToast.success('Canlı ders oturumu oluşturuldu!')
    } catch (error) {
      console.error('Error creating session:', error)
      handleApiError(error)
      setIsLoading(false)
    }
  }

  const handleLeave = () => {
    navigate(isTeacher ? '/teacher/dashboard' : '/student/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!liveSession) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Canlı ders oturumu bulunamadı</p>
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Geri Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {isTeacher ? (
        <LiveClassTeacher
          courseId={courseId || liveSession.course_id}
          channelName={liveSession.channel_name}
          onLeave={handleLeave}
        />
      ) : (
        <LiveClassStudent
          courseId={courseId || liveSession.course_id}
          channelName={liveSession.channel_name}
          onLeave={handleLeave}
        />
      )}
    </>
  )
}

export default LiveClass

