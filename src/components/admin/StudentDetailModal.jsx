import { useState, useEffect } from 'react'
import { X, BookOpen, Video, FileText, HelpCircle, DollarSign, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const StudentDetailModal = ({ isOpen, onClose, student }) => {
  const [enrollments, setEnrollments] = useState([])
  const [freeContents, setFreeContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentData()
    }
  }, [isOpen, student])

  const fetchStudentData = async () => {
    if (!student) return
    
    setIsLoading(true)
    try {
      // Öğrencinin kayıt olduğu kursları çek
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(
            id,
            title,
            description,
            price,
            schedule_text,
            status,
            created_at,
            profiles!courses_teacher_id_fkey(full_name)
          )
        `)
        .eq('student_id', student.id)
        .order('enrolled_at', { ascending: false })

      if (enrollmentsError) throw enrollmentsError
      setEnrollments(enrollmentsData || [])

      // Ücretsiz içerikleri çek (tüm öğrenciler erişebilir)
      const { data: contentsData, error: contentsError } = await supabase
        .from('contents')
        .select('*')
        .eq('is_free', true)
        .order('created_at', { ascending: false })

      if (contentsError) throw contentsError
      setFreeContents(contentsData || [])
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return Video
      case 'pdf':
        return FileText
      case 'question':
        return HelpCircle
      default:
        return FileText
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'Video'
      case 'pdf':
        return 'PDF'
      case 'question':
        return 'Soru Çözümü'
      default:
        return type
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (!isOpen || !student) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Öğrenci Detayları
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {student.full_name || 'İsimsiz'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Öğrenci Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ad Soyad:</span>
                <span className="ml-2 text-gray-900">{student.full_name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Sınıf:</span>
                <span className="ml-2 text-gray-900">{student.student_details?.grade_level || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Kayıt Tarihi:</span>
                <span className="ml-2 text-gray-900">{formatDate(student.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-600">Kullanıcı ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{student.id}</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : (
            <>
              {/* Aldığı Kurslar */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BookOpen size={20} />
                  <span>Aldığı Kurslar ({enrollments.length})</span>
                </h3>
                {enrollments.length === 0 ? (
                  <p className="text-gray-500 text-sm">Henüz kurs kaydı yok.</p>
                ) : (
                  <div className="space-y-3">
                    {enrollments.map((enrollment) => (
                      <div
                        key={`${enrollment.student_id}-${enrollment.course_id}`}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {enrollment.courses?.title || 'Bilinmeyen Kurs'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Öğretmen: {enrollment.courses?.profiles?.full_name || 'Bilinmeyen'}
                            </p>
                            {enrollment.courses?.description && (
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {enrollment.courses.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <DollarSign size={14} />
                                <span>{formatCurrency(enrollment.courses?.price || 0)}</span>
                              </div>
                              {enrollment.courses?.schedule_text && (
                                <div className="flex items-center space-x-1">
                                  <Calendar size={14} />
                                  <span>{enrollment.courses.schedule_text}</span>
                                </div>
                              )}
                              <span className="text-xs">
                                Kayıt: {formatDate(enrollment.enrolled_at)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
                              enrollment.courses?.status === 'published'
                                ? 'bg-green-100 text-green-700'
                                : enrollment.courses?.status === 'approved'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {enrollment.courses?.status === 'published'
                              ? 'Yayında'
                              : enrollment.courses?.status === 'approved'
                              ? 'Onaylandı'
                              : 'Beklemede'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tükettiği İçerikler (Ücretsiz) */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Erişebildiği Ücretsiz İçerikler ({freeContents.length})</span>
                </h3>
                {freeContents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Henüz ücretsiz içerik yok.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {freeContents.map((content) => {
                      const Icon = getTypeIcon(content.type)
                      return (
                        <div
                          key={content.id}
                          className="border border-gray-200 rounded-lg p-3 hover:border-primary-200 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <Icon className="text-primary-500 flex-shrink-0 mt-1" size={18} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 text-sm truncate">
                                {content.title}
                              </h4>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {getTypeLabel(content.type)}
                                </span>
                                {content.category && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-gray-500">{content.category}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailModal

