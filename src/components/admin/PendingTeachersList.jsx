import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const PendingTeachersList = ({ onTeacherApproved }) => {
  const [pendingTeachers, setPendingTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPendingTeachers = async () => {
      try {
        const { data, error } = await supabase
          .from('teacher_details')
          .select(`
            *,
            profiles!teacher_details_id_fkey(full_name)
          `)
          .eq('is_approved', false)

        if (error) throw error
        if (data) {
          const transformed = data.map((td) => ({
            id: td.id,
            profile_id: td.id,
            full_name: td.profiles?.full_name || 'Bilinmeyen',
            university: td.university || '',
            department: td.department || '',
          }))
          setPendingTeachers(transformed)
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPendingTeachers()
  }, [])

  const handleApprove = async (teacherId) => {
    try {
      const { error } = await supabase
        .from('teacher_details')
        .update({ is_approved: true })
        .eq('id', teacherId)

      if (error) throw error

      showToast.success('Öğretmen başarıyla onaylandı!')
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId))
      
      // İstatistikleri yenile
      if (onTeacherApproved) {
        onTeacherApproved()
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  const handleReject = async (teacherId) => {
    if (!window.confirm('Bu öğretmeni reddetmek istediğinize emin misiniz?')) {
      return
    }

    try {
      // Option 1: Delete teacher_details record
      const { error } = await supabase
        .from('teacher_details')
        .delete()
        .eq('id', teacherId)

      if (error) throw error

      showToast.success('Öğretmen reddedildi')
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId))
      
      // İstatistikleri yenile
      if (onTeacherApproved) {
        onTeacherApproved()
      }
    } catch (error) {
      handleApiError(error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Onay Bekleyen Öğretmenler
        </h2>
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (pendingTeachers.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Onay Bekleyen Öğretmenler
        </h2>
        <p className="text-gray-500 text-center py-8">
          Onay bekleyen öğretmen bulunmuyor.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
      <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-6">
        Onay Bekleyen Öğretmenler
      </h2>
      <div className="space-y-4">
        {pendingTeachers.map((teacher) => (
          <div
            key={teacher.id}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50 hover:border-primary-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
          >
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{teacher.full_name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {teacher.university} - {teacher.department}
              </p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleApprove(teacher.profile_id)}
                className="flex items-center space-x-1 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-medium shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 hover:scale-105"
              >
                <Check size={16} />
                <span>Onayla</span>
              </button>
              <button
                onClick={() => handleReject(teacher.profile_id)}
                className="flex items-center space-x-1 px-5 py-2.5 bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-sm font-medium hover:scale-105"
              >
                <X size={16} />
                <span>Reddet</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingTeachersList

