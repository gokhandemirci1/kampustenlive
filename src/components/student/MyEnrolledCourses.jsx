import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Calendar, User, GraduationCap, Video, Play } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const MyEnrolledCourses = () => {
  const navigate = useNavigate()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        // Önce enrollments'ları çek
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('course_id, enrolled_at')
          .eq('student_id', user.id)
          .order('enrolled_at', { ascending: false })

        if (enrollmentsError) throw enrollmentsError

        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([])
          return
        }

        // Sonra kursları çek
        const courseIds = enrollments.map(e => e.course_id)
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select(`
            *,
            profiles!teacher_id(
              full_name,
              teacher_details(university, department)
            )
          `)
          .in('id', courseIds)

        if (coursesError) throw coursesError

        // is_live alanını ayrı bir sorgu ile çek (eğer varsa)
        let isLiveMap = {}
        try {
          const { data: coursesWithLive, error: liveError } = await supabase
            .from('courses')
            .select('id, is_live')
            .in('id', courseIds)

          if (!liveError && coursesWithLive) {
            coursesWithLive.forEach(course => {
              isLiveMap[course.id] = course.is_live || false
            })
          }
        } catch (e) {
          // is_live alanı yoksa, tüm kurslar için false kullan
          console.log('is_live alanı henüz eklenmemiş, varsayılan olarak false kullanılıyor')
        }

        // Verileri birleştir
        if (courses) {
          const transformedData = courses.map((course) => {
            const enrollment = enrollments.find(e => e.course_id === course.id)
            return {
              ...course,
              is_live: isLiveMap[course.id] || false,
              teacher_name: course.profiles?.full_name || 'Bilinmeyen Öğretmen',
              teacher_university: course.profiles?.teacher_details?.[0]?.university || null,
              teacher_department: course.profiles?.teacher_details?.[0]?.department || null,
              enrolled_at: enrollment?.enrolled_at || course.created_at,
            }
          })
          setEnrolledCourses(transformedData)
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrolledCourses()

    // Real-time subscription for is_live changes
    const channel = supabase
      .channel('courses_is_live_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'courses',
        },
        () => {
          fetchEnrolledCourses()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const handleJoinCourse = (courseId, courseTitle) => {
    // Navigate to live class page
    navigate(`/live/${courseId}`)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/50 p-8">
        <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">
          Satın Aldığım Kamplar
        </h2>
        <div className="text-center py-8 text-gray-400 font-light">Yükleniyor...</div>
      </div>
    )
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/50 p-8">
        <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">
          Satın Aldığım Kamplar
        </h2>
        <div className="text-center py-8 text-gray-400 font-light">
          Henüz hiç kampa kayıt olmadınız.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200/50 p-8">
      <h2 className="text-xl font-light text-gray-900 mb-8 tracking-tight">
        Satın Aldığım Kamplar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrolledCourses.map((course) => (
          <div
            key={course.id}
            className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
              course.is_live
                ? 'border-green-400 shadow-lg shadow-green-100 hover:shadow-xl'
                : 'border-gray-200/50 hover:border-primary-300 hover:shadow-xl'
            } hover:scale-[1.02] bg-white/80 backdrop-blur-sm`}
          >
            {/* Ders Görseli */}
            {course.image_url ? (
              <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                {course.is_live && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>CANLI</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center relative">
                <Video className="text-primary-300" size={48} />
                {course.is_live && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center space-x-1 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>CANLI</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-6">
              <h3 className="text-lg font-normal text-gray-900 mb-2 tracking-tight">
                {course.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2 font-light">
                {course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 font-light">
                  <User size={16} className="text-gray-400" />
                  <span>{course.teacher_name}</span>
                </div>
                {(course.teacher_university || course.teacher_department) && (
                  <div className="flex items-start space-x-2 text-sm text-gray-400 font-light">
                    <GraduationCap size={16} className="text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      {course.teacher_university && course.teacher_department ? (
                        <span>{course.teacher_university} - {course.teacher_department}</span>
                      ) : course.teacher_university ? (
                        <span>{course.teacher_university}</span>
                      ) : (
                        <span>{course.teacher_department}</span>
                      )}
                    </div>
                  </div>
                )}
                {course.schedule_text && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 font-light">
                    <Clock size={16} className="text-gray-400" />
                    <span className="line-clamp-1">{course.schedule_text}</span>
                  </div>
                )}
              </div>

              {/* Derse Gir Butonu */}
              <button
                onClick={() => handleJoinCourse(course.id, course.title)}
                disabled={!course.is_live}
                className={`w-full px-4 py-3 rounded-lg transition-all duration-200 text-sm font-light flex items-center justify-center space-x-2 ${
                  course.is_live
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {course.is_live ? (
                  <>
                    <Play size={18} />
                    <span>Derse Gir</span>
                  </>
                ) : (
                  <>
                    <Clock size={18} />
                    <span>Ders Başlamadı</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyEnrolledCourses

