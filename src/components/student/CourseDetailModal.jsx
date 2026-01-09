import { useState } from 'react'
import { X, Calendar, Clock, User, DollarSign, ShoppingBag, GraduationCap } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast } from '../../utils/toast'

const CourseDetailModal = ({ isOpen, onClose, course, onAddToCart }) => {
  const [isChecking, setIsChecking] = useState(false)

  if (!isOpen || !course) return null

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const handleAddToCart = async () => {
    setIsChecking(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        showToast.error('Giriş yapmanız gerekiyor')
        setIsChecking(false)
        return
      }

      // Öğrencinin bu kursa zaten kayıtlı olup olmadığını kontrol et
      const { data: enrollment, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id)
        .eq('course_id', course.id)
        .maybeSingle()

      if (error) throw error

      if (enrollment) {
        showToast.error('Bu kampa zaten kayıtlısınız!')
        setIsChecking(false)
        return
      }

      // Kayıtlı değilse sepete ekle
      onAddToCart(course)
      onClose()
    } catch (error) {
      console.error('Error checking enrollment:', error)
      showToast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-light text-gray-900 uppercase tracking-wider">Kamp Detayları</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Görsel */}
          {course.image_url ? (
            <div className="w-full h-64 overflow-hidden bg-gray-100 mb-6 rounded-lg">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}

          {/* Başlık */}
          <h3 className="text-2xl font-light text-gray-900 mb-4">{course.title}</h3>

          {/* Açıklama */}
          {course.description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
          )}

          {/* Detaylar */}
          <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <User size={18} className="text-gray-400" />
              <div>
                <span className="text-xs font-light text-gray-500 uppercase tracking-wider">Öğretmen</span>
                <p className="text-gray-900 font-light">{course.teacher_name || 'Bilinmeyen Öğretmen'}</p>
              </div>
            </div>

            {(course.teacher_university || course.teacher_department) && (
              <div className="flex items-start space-x-3">
                <GraduationCap size={18} className="text-gray-400 mt-1" />
                <div>
                  <span className="text-xs font-light text-gray-500 uppercase tracking-wider">Okul & Bölüm</span>
                  <p className="text-gray-900 font-light">
                    {course.teacher_university && course.teacher_department ? (
                      `${course.teacher_university} - ${course.teacher_department}`
                    ) : course.teacher_university ? (
                      course.teacher_university
                    ) : (
                      course.teacher_department
                    )}
                  </p>
                </div>
              </div>
            )}

            {course.schedule_text && (
              <div className="flex items-start space-x-3">
                <Clock size={18} className="text-gray-400 mt-1" />
                <div>
                  <span className="text-xs font-light text-gray-500 uppercase tracking-wider">Program</span>
                  <p className="text-gray-900 font-light">{course.schedule_text}</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <DollarSign size={18} className="text-gray-400" />
              <div>
                <span className="text-xs font-light text-gray-500 uppercase tracking-wider">Fiyat</span>
                {course.total_hours && course.total_hours > 0 ? (
                  <p className="text-gray-900 font-light text-lg">
                    {formatCurrency(course.price / course.total_hours)}/1 saat
                  </p>
                ) : (
                  <p className="text-gray-900 font-light text-lg">{formatCurrency(course.price)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Çantaya Ekle Butonu */}
          <button
            onClick={handleAddToCart}
            disabled={isChecking}
            className="w-full px-6 py-3 bg-[#ffde59] text-gray-900 rounded-sm hover:bg-[#ffd700] transition-colors duration-200 font-light text-sm tracking-wide flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            <span>{isChecking ? 'Kontrol ediliyor...' : 'Çantaya Ekle'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourseDetailModal

