import { useState, useEffect } from 'react'
import { Check, X, DollarSign, Calendar, Clock, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const PendingCoursesList = ({ onCourseApproved }) => {
  const [pendingCourses, setPendingCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState(null)
  const [priceValue, setPriceValue] = useState('')

  useEffect(() => {
    fetchPendingCourses()
  }, [])

  const fetchPendingCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_teacher_id_fkey(full_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      if (data) {
        setPendingCourses(data)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (courseId, price) => {
    if (!price || parseFloat(price) <= 0) {
      showToast.error('Lütfen geçerli bir fiyat girin')
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({
          status: 'published',
          price: parseFloat(price),
        })
        .eq('id', courseId)

      if (error) throw error

      showToast.success('Ders talebi başarıyla onaylandı ve yayınlandı!')
      setPendingCourses((prev) => prev.filter((c) => c.id !== courseId))
      setEditingPrice(null)
      setPriceValue('')

      if (onCourseApproved) {
        onCourseApproved()
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleReject = async (courseId) => {
    if (!window.confirm('Bu ders talebini reddetmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId)

      if (error) throw error

      showToast.success('Ders talebi reddedildi')
      setPendingCourses((prev) => prev.filter((c) => c.id !== courseId))
    } catch (error) {
      handleApiError(error)
    }
  }

  const startEditingPrice = (courseId, currentPrice) => {
    setEditingPrice(courseId)
    setPriceValue(currentPrice || '')
  }

  const cancelEditingPrice = () => {
    setEditingPrice(null)
    setPriceValue('')
  }

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
        <p className="text-gray-500 text-center py-8">Yükleniyor...</p>
      </div>
    )
  }

  if (pendingCourses.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Onay Bekleyen Ders Talepleri
        </h2>
        <p className="text-gray-500 text-center py-8">
          Onay bekleyen ders talebi bulunmuyor.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-6">
        Onay Bekleyen Ders Talepleri
      </h2>
      <div className="space-y-4">
        {pendingCourses.map((course) => (
          <div
            key={course.id}
            className="p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:border-primary-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {course.title}
                    </h3>
                    {course.image_url && (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full max-w-xs h-32 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>

                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>
                      <strong>Öğretmen:</strong> {course.profiles?.full_name || 'Bilinmeyen'}
                    </span>
                  </div>

                  {course.schedule_text && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>
                        <strong>Program:</strong> {course.schedule_text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:ml-4">
                {editingPrice === course.id ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-500" />
                      <input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="Fiyat"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        autoFocus
                      />
                      <span className="text-sm text-gray-600">TL</span>
                    </div>
                    <button
                      onClick={() => handleApprove(course.id, priceValue)}
                      className="flex items-center space-x-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                    >
                      <Check size={16} />
                      <span>Onayla</span>
                    </button>
                    <button
                      onClick={cancelEditingPrice}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Fiyat: <strong className="text-gray-900">{course.price || 0} TL</strong>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditingPrice(course.id, course.price)}
                        className="flex items-center space-x-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 text-sm font-medium"
                      >
                        <DollarSign size={16} />
                        <span>Fiyat Ata & Onayla</span>
                      </button>
                      <button
                        onClick={() => handleReject(course.id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                      >
                        <X size={16} />
                        <span>Reddet</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingCoursesList

