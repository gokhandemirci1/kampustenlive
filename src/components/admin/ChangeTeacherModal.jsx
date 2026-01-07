import { useState, useEffect } from 'react'
import { X, User, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const ChangeTeacherModal = ({ isOpen, onClose, camp, onSuccess }) => {
  const [teachers, setTeachers] = useState([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && camp) {
      setSelectedTeacherId(camp.teacher_id)
      fetchApprovedTeachers()
    }
  }, [isOpen, camp])

  const fetchApprovedTeachers = async () => {
    setIsLoadingTeachers(true)
    try {
      // Önce onaylı öğretmenlerin ID'lerini al
      const { data: approvedTeachers, error: teachersError } = await supabase
        .from('teacher_details')
        .select('id, university, department')
        .eq('is_approved', true)

      if (teachersError) throw teachersError

      if (approvedTeachers && approvedTeachers.length > 0) {
        const teacherIds = approvedTeachers.map(t => t.id)
        
        // Sonra bu ID'lere sahip profile'ları çek
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'teacher')
          .in('id', teacherIds)
          .order('full_name', { ascending: true })

        if (profilesError) throw profilesError

        // Verileri birleştir
        const combined = profiles?.map(profile => {
          const teacherDetail = approvedTeachers.find(td => td.id === profile.id)
          return {
            id: profile.id,
            full_name: profile.full_name,
            teacher_details: teacherDetail ? [teacherDetail] : []
          }
        }) || []

        setTeachers(combined)
      } else {
        setTeachers([])
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoadingTeachers(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedTeacherId) {
      showToast.error('Lütfen bir öğretmen seçin')
      return
    }

    if (selectedTeacherId === camp.teacher_id) {
      showToast.info('Öğretmen değişikliği yapılmadı')
      onClose()
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('courses')
        .update({ teacher_id: selectedTeacherId })
        .eq('id', camp.id)

      if (error) throw error

      showToast.success('Öğretmen başarıyla değiştirildi!')
      onSuccess?.()
      onClose()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !camp) return null

  const currentTeacher = teachers.find(t => t.id === camp.teacher_id)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Öğretmen Değiştir
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kamp
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-900">
              {camp.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mevcut Öğretmen
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
              {currentTeacher?.full_name || camp.teacher_name || 'Bilinmeyen'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <User size={16} />
              <span>Yeni Öğretmen *</span>
            </label>
            {isLoadingTeachers ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                Öğretmenler yükleniyor...
              </div>
            ) : teachers.length === 0 ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                Onaylı öğretmen bulunamadı.
              </div>
            ) : (
              <select
                required
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Öğretmen Seçin</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || 'İsimsiz'} 
                    {teacher.teacher_details?.[0]?.university && 
                      ` - ${teacher.teacher_details[0].university}`
                    }
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedTeacherId}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Güncelleniyor...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Değiştir</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangeTeacherModal

