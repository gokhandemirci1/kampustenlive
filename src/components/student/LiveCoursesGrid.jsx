import { useState, useEffect } from 'react'
import { User, Clock, DollarSign, BookOpen, GraduationCap } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

import CourseDetailModal from './CourseDetailModal'

const LiveCoursesGrid = ({ onEnrollSuccess, onAddToCart }) => {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles!teacher_id(
              full_name,
              teacher_details(university, department)
            )
          `)
          .eq('status', 'published')
          .eq('is_hidden', false)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          // Transform data to include teacher_name, university, and department
          const transformedData = data.map((course) => ({
            ...course,
            teacher_name: course.profiles?.full_name || 'Bilinmeyen Öğretmen',
            teacher_university: course.profiles?.teacher_details?.[0]?.university || null,
            teacher_department: course.profiles?.teacher_details?.[0]?.department || null,
          }))
          setCourses(transformedData)
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const handleEnroll = async (courseId) => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      const { error } = await supabase.from('enrollments').insert({
        student_id: user.id,
        course_id: courseId,
      })

      if (error) throw error
      showToast.success('Kursa başarıyla kayıt oldunuz!')
      
      // Takvimi yenile
      if (onEnrollSuccess) {
        onEnrollSuccess()
      }
    } catch (error) {
      if (error.message?.includes('duplicate key')) {
        showToast.error('Bu kursa zaten kayıtlısınız')
      } else {
        handleApiError(error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/50 p-8">
        <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Canlı Dersler</h2>
        <div className="text-center py-8 text-gray-400 font-light">Yükleniyor...</div>
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200/50 p-8">
        <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Canlı Dersler</h2>
        <div className="text-center py-8 text-gray-400 font-light">
          Şu anda yayında olan ders bulunmuyor.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200/50 p-8">
      <h2 className="text-xl font-light text-gray-900 mb-8 tracking-tight">Canlı Dersler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border border-gray-200/50 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200 bg-white"
          >
            {/* Ders Görseli */}
            {course.image_url ? (
              <div className="w-full h-48 overflow-hidden bg-gray-100">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                <BookOpen className="text-primary-300" size={48} />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-1 text-xs font-light bg-primary-50 text-primary-600 rounded-full">
                  Yayında
                </span>
              </div>

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
                <div className="flex items-center space-x-2 text-sm text-gray-500 font-light">
                  <Clock size={16} className="text-gray-400" />
                  <span className="line-clamp-1">{course.schedule_text}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-normal text-gray-900">
                  <DollarSign size={16} className="text-gray-500" />
                  {course.total_hours && course.total_hours > 0 ? (
                    <span>
                      {formatCurrency(course.price / course.total_hours)}/1 saat
                    </span>
                  ) : (
                    <span>{formatCurrency(course.price)}</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCourse(course)
                  setIsModalOpen(true)
                }}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 text-sm font-light"
              >
                Kampa Katıl
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Course Detail Modal */}
      <CourseDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCourse(null)
        }}
        course={selectedCourse}
        onAddToCart={onAddToCart}
      />
    </div>
  )
}

export default LiveCoursesGrid

