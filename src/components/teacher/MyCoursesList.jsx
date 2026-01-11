import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, Play, Square, Video, Users } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { handleApiError, showToast } from '../../utils/toast'

const MyCoursesList = () => {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState({}) // { courseId: [{ student_name, enrolled_at }] }
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          setCourses(data)
          // Her kurs için kayıtlı öğrencileri getir
          fetchEnrollmentsForCourses(data.map(c => c.id))
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const fetchEnrollmentsForCourses = async (courseIds) => {
    if (!courseIds || courseIds.length === 0) return

    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          enrolled_at,
          profiles!enrollments_student_id_fkey(full_name)
        `)
        .in('course_id', courseIds)

      if (error) throw error

      if (data) {
        // Kurs ID'lerine göre grupla
        const enrollmentsByCourse = {}
        data.forEach((enrollment) => {
          if (!enrollmentsByCourse[enrollment.course_id]) {
            enrollmentsByCourse[enrollment.course_id] = []
          }
          enrollmentsByCourse[enrollment.course_id].push({
            student_name: enrollment.profiles?.full_name || 'Bilinmeyen Öğrenci',
            enrolled_at: enrollment.enrolled_at,
          })
        })
        setEnrollments(enrollmentsByCourse)
      }
    } catch (error) {
      console.error('Error fetching enrollments:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return CheckCircle
      case 'published':
        return CheckCircle
      case 'pending':
        return Clock
      default:
        return AlertCircle
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı'
      case 'published':
        return 'Yayında'
      case 'pending':
        return 'Onay Bekliyor'
      default:
        return status
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'published':
        return 'bg-primary-100 text-primary-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  // Schedule_text'ten başlangıç ve bitiş tarih/saatlerini parse et
  const parseSchedule = (scheduleText) => {
    if (!scheduleText) return { startDate: null, startTime: null, endDate: null, endTime: null, extra: null }

    const parts = scheduleText.split('|').map(p => p.trim())
    let startDate = null
    let startTime = null
    let endDate = null
    let endTime = null
    let extra = null

    parts.forEach(part => {
      if (part.startsWith('Başlangıç:')) {
        const dateTimeStr = part.replace('Başlangıç:', '').trim()
        const [date, time] = dateTimeStr.split(' ')
        if (date && time) {
          startDate = date
          startTime = time
        }
      } else if (part.startsWith('Bitiş:')) {
        const dateTimeStr = part.replace('Bitiş:', '').trim()
        const [date, time] = dateTimeStr.split(' ')
        if (date && time) {
          endDate = date
          endTime = time
        }
      } else if (part && !part.startsWith('Başlangıç:') && !part.startsWith('Bitiş:')) {
        extra = part
      }
    })

    return { startDate, startTime, endDate, endTime, extra }
  }

  // Tarihi Türkçe formatında göster (YYYY-MM-DD formatından)
  const formatDateTurkish = (dateString) => {
    if (!dateString) return ''
    try {
      // YYYY-MM-DD formatını parse et
      const [year, month, day] = dateString.split('-')
      if (year && month && day) {
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        return date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
      // Eğer farklı bir format ise direkt Date parse et
      const date = new Date(dateString)
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      }
      return dateString
    } catch {
      return dateString
    }
  }

  // Saati formatla
  const formatTime = (timeString) => {
    if (!timeString) return ''
    // Eğer zaten HH:MM formatındaysa direkt döndür
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString
    }
    return timeString
  }

  const handleStartCourse = async (courseId, courseTitle) => {
    try {
      // Set is_live to true before navigating
      const { error } = await supabase
        .from('courses')
        .update({ is_live: true })
        .eq('id', courseId)

      if (error) throw error

      showToast.success(`"${courseTitle}" dersi başlatılıyor...`)
      
      // Navigate to live class page - it will create session automatically
      navigate(`/live/${courseId}`)
      
      // Refresh courses list after a short delay to update UI
      setTimeout(async () => {
        const user = await getCurrentUser()
        if (user) {
          const { data, error: fetchError } = await supabase
            .from('courses')
            .select('*')
            .eq('teacher_id', user.id)
            .order('created_at', { ascending: false })

          if (!fetchError && data) {
            setCourses(data)
          }
        }
      }, 500)
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleStopCourse = async (courseId, courseTitle) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_live: false })
        .eq('id', courseId)

      if (error) throw error

      showToast.success(`"${courseTitle}" dersi durduruldu.`)
      
      // Kurs listesini yenile
      const user = await getCurrentUser()
      if (user) {
        const { data, error: fetchError } = await supabase
          .from('courses')
          .select('*')
          .eq('teacher_id', user.id)
          .order('created_at', { ascending: false })

        if (!fetchError && data) {
          setCourses(data)
        }
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Derslerim</h2>
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Derslerim</h2>
        <div className="text-center py-8 text-gray-500">
          Henüz ders oluşturmadınız.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h2 className="text-sm font-light text-gray-900 mb-8 uppercase tracking-wider">Derslerim</h2>
      <div className="space-y-4">
        {courses.map((course) => {
          const StatusIcon = getStatusIcon(course.status)
          const schedule = parseSchedule(course.schedule_text)
          const isPublished = course.status === 'published'
          
          return (
            <div
              key={course.id}
              className={`p-6 border transition-colors duration-200 ${
                isPublished
                  ? 'bg-white border-[#ffde59]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        course.status
                      )}`}
                    >
                      <StatusIcon size={14} />
                      <span>{getStatusLabel(course.status)}</span>
                    </span>
                  </div>
                  
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  )}

                  {/* Canlı yayındaki dersler için belirgin tarih/saat gösterimi */}
                  {isPublished && (schedule.startDate || schedule.endDate) && (
                    <div className="mb-4 p-4 bg-white border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        {schedule.startDate && schedule.startTime && (
                          <div>
                            <div className="text-xs font-light text-gray-500 uppercase tracking-wider mb-2">
                              Başlangıç
                            </div>
                            <div className="flex items-center space-x-2 text-gray-900 mb-1">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-sm font-light">
                                {formatDateTurkish(schedule.startDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-sm font-light">
                                {formatTime(schedule.startTime)}
                              </span>
                            </div>
                          </div>
                        )}

                        {schedule.endDate && schedule.endTime && (
                          <div>
                            <div className="text-xs font-light text-gray-500 uppercase tracking-wider mb-2">
                              Bitiş
                            </div>
                            <div className="flex items-center space-x-2 text-gray-900 mb-1">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-sm font-light">
                                {formatDateTurkish(schedule.endDate)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-sm font-light">
                                {formatTime(schedule.endTime)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dersi Başlat/Durdur Butonu - Published kurslar için */}
                  {isPublished && (
                    <div className="mb-4 p-4 bg-white border border-gray-200">
                      <div className="pt-2">
                        {course.is_live ? (
                          <button
                            onClick={() => handleStopCourse(course.id, course.title)}
                            className="w-full px-6 py-2 bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors duration-200 font-light text-sm tracking-wide flex items-center justify-center space-x-2"
                          >
                            <Square size={18} />
                            <span>Dersi Durdur</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartCourse(course.id, course.title)}
                            className="w-full px-6 py-2 bg-[#ffde59] text-gray-900 rounded-sm hover:bg-[#ffd700] transition-colors duration-200 font-light text-sm tracking-wide flex items-center justify-center space-x-2"
                          >
                            <Video size={18} />
                            <span>Dersi Başlat</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Kayıtlı Öğrenciler */}
                  {enrollments[course.id] && enrollments[course.id].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-xs font-light text-gray-600 uppercase tracking-wider">
                          Kayıtlı Öğrenciler ({enrollments[course.id].length})
                        </span>
                      </div>
                      <div className="space-y-2">
                        {enrollments[course.id].slice(0, 5).map((enrollment, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-light">
                              {enrollment.student_name}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(enrollment.enrolled_at).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </span>
                          </div>
                        ))}
                        {enrollments[course.id].length > 5 && (
                          <div className="text-xs text-gray-400 font-light pt-2">
                            +{enrollments[course.id].length - 5} öğrenci daha
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Diğer bilgiler */}
                  <div className="flex flex-wrap items-center gap-4 text-sm mt-4 pt-4 border-t border-gray-100">
                    {!isPublished && course.schedule_text && (
                      <span className="flex items-center space-x-1 text-gray-500">
                        <Clock size={14} />
                        <span>{course.schedule_text}</span>
                      </span>
                    )}
                    {schedule.extra && (
                      <span className="flex items-center space-x-1 text-gray-500">
                        <Clock size={14} />
                        <span>{schedule.extra}</span>
                      </span>
                    )}
                    <span className="font-light text-gray-700">
                      {formatCurrency(course.price)}
                    </span>
                    <span className="text-gray-500 text-xs">
                      Oluşturulma: {formatDate(course.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyCoursesList

