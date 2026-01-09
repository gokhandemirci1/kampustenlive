import { useState, useEffect } from 'react'
import { Trash2, Calendar, DollarSign, Users, UserCog } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'
import ChangeTeacherModal from './ChangeTeacherModal'

const CampsList = () => {
  const [camps, setCamps] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCamp, setSelectedCamp] = useState(null)
  const [isChangeTeacherModalOpen, setIsChangeTeacherModalOpen] = useState(false)

  useEffect(() => {
    fetchCamps()
  }, [])

  const fetchCamps = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles!courses_teacher_id_fkey(full_name, role)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) {
        const transformed = data.map((camp) => ({
          ...camp,
          teacher_name: camp.profiles?.full_name || 'Admin',
        }))
        setCamps(transformed)
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (campId) => {
    if (!window.confirm('Bu ders kampını silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', campId)

      if (error) throw error

      showToast.success('Ders kampı başarıyla silindi!')
      setCamps((prev) => prev.filter((c) => c.id !== campId))
    } catch (error) {
      handleApiError(error)
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

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'bg-yellow-100 text-yellow-700' },
      approved: { label: 'Onaylandı', class: 'bg-primary-100 text-primary-700' },
      published: { label: 'Yayında', class: 'bg-green-100 text-green-700' },
    }
    const statusInfo = statusMap[status] || statusMap.pending
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Canlı Ders Kampları
        </h2>
        <div className="text-sm text-gray-500">
          Toplam {camps.length} kamp
        </div>
      </div>

      {camps.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Henüz ders kampı oluşturulmamış.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Kamp Adı
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Oluşturan
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Program
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Ücret
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Durum
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Oluşturulma
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {camps.map((camp) => (
                <tr
                  key={camp.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium text-gray-900">
                      {camp.title}
                    </div>
                    {camp.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {camp.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {camp.teacher_name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar size={14} />
                      <span className="max-w-xs truncate">
                        {camp.schedule_text || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                      <DollarSign size={14} />
                      <span>{formatCurrency(camp.price || 0)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(camp.status)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {formatDate(camp.created_at)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCamp(camp)
                          setIsChangeTeacherModalOpen(true)
                        }}
                        className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                        title="Öğretmen Değiştir"
                      >
                        <UserCog size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Change Teacher Modal */}
      <ChangeTeacherModal
        isOpen={isChangeTeacherModalOpen}
        onClose={() => {
          setIsChangeTeacherModalOpen(false)
          setSelectedCamp(null)
        }}
        camp={selectedCamp}
        onSuccess={() => {
          fetchCamps() // Refresh list
        }}
      />
    </div>
  )
}

export default CampsList

