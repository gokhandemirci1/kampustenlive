import { useState, useEffect } from 'react'
import { X, BookOpen, FileText, UserCheck, GraduationCap, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const TeacherDetailModal = ({ isOpen, onClose, teacher }) => {
  const [courses, setCourses] = useState([])
  const [contents, setContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen && teacher) {
      fetchTeacherData()
    }
  }, [isOpen, teacher])

  const fetchTeacherData = async () => {
    if (!teacher) return
    
    setIsLoading(true)
    try {
      // Öğretmenin oluşturduğu kursları çek
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Öğretmenin yüklediği içerikleri çek
      const { data: contentsData, error: contentsError } = await supabase
        .from('contents')
        .select('*')
        .eq('uploader_id', teacher.id)
        .order('created_at', { ascending: false })

      if (contentsError) throw contentsError
      setContents(contentsData || [])
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Onaylandı', class: 'bg-blue-100 text-blue-700' },
      published: { label: 'Yayında', class: 'bg-green-100 text-green-700' },
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (!isOpen || !teacher) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Öğretmen Detayları
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {teacher.full_name || 'İsimsiz'}
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
          {/* Öğretmen Bilgileri */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Ad Soyad:</span>
                <span className="ml-2 text-gray-900">{teacher.full_name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Üniversite:</span>
                <span className="ml-2 text-gray-900">{teacher.teacher_details?.university || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Bölüm:</span>
                <span className="ml-2 text-gray-900">{teacher.teacher_details?.department || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600">Durum:</span>
                <span className="ml-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      teacher.teacher_details?.is_approved
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {teacher.teacher_details?.is_approved ? 'Onaylı' : 'Onay Bekliyor'}
                  </span>
                </span>
              </div>
              <div>
                <span className="text-gray-600">Kayıt Tarihi:</span>
                <span className="ml-2 text-gray-900">{formatDate(teacher.created_at)}</span>
              </div>
              <div>
                <span className="text-gray-600">Kullanıcı ID:</span>
                <span className="ml-2 text-gray-900 font-mono text-xs">{teacher.id}</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
          ) : (
            <>
              {/* Oluşturduğu Kurslar */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BookOpen size={20} />
                  <span>Oluşturduğu Kurslar ({courses.length})</span>
                </h3>
                {courses.length === 0 ? (
                  <p className="text-gray-500 text-sm">Henüz kurs oluşturmamış.</p>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {course.title}
                            </h4>
                            {course.description && (
                              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                {course.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">{formatCurrency(course.price || 0)}</span>
                              </div>
                              {course.schedule_text && (
                                <div className="flex items-center space-x-1">
                                  <Calendar size={14} />
                                  <span>{course.schedule_text}</span>
                                </div>
                              )}
                              <span className="text-xs">
                                Oluşturulma: {formatDate(course.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex flex-col items-end space-y-2">
                            {getStatusBadge(course.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Yüklediği İçerikler */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText size={20} />
                  <span>Yüklediği İçerikler ({contents.length})</span>
                </h3>
                {contents.length === 0 ? (
                  <p className="text-gray-500 text-sm">Henüz içerik yüklememiş.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {contents.map((content) => (
                      <div
                        key={content.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {content.title}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {content.type === 'video' ? 'Video' : content.type === 'pdf' ? 'PDF' : 'Soru'}
                              </span>
                              {content.category && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-500">{content.category}</span>
                                </>
                              )}
                              <span
                                className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                                  content.is_free
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-primary-100 text-primary-700'
                                }`}
                              >
                                {content.is_free ? 'Ücretsiz' : 'Ücretli'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(content.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
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

export default TeacherDetailModal

