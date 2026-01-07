import { useState, useEffect } from 'react'
import { Trash2, Video, FileText, HelpCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const ContentManagement = () => {
  const [contents, setContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const { data, error } = await supabase
          .from('contents')
          .select(`
            *,
            profiles!contents_uploader_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) {
          const transformed = data.map((content) => ({
            ...content,
            uploader: content.profiles?.full_name || 'Bilinmeyen',
          }))
          setContents(transformed)
        }
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContents()
  }, [])

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
        return 'Soru'
      default:
        return type
    }
  }

  const handleDelete = async (contentId) => {
    if (!window.confirm('Bu içeriği silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('contents')
        .delete()
        .eq('id', contentId)

      if (error) throw error

      showToast.success('İçerik başarıyla silindi!')
      setContents((prev) => prev.filter((c) => c.id !== contentId))
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Kurs/İçerik Yönetimi
        </h2>
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Kurs/İçerik Yönetimi
        </h2>
        <div className="text-sm text-gray-500">
          Toplam {contents.length} içerik
        </div>
      </div>

      {contents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          Sistemde içerik bulunmuyor.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  İçerik
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Tip
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Kategori
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Yükleyen
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Tarih
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  Durum
                </th>
                <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {contents.map((content) => {
                const Icon = getTypeIcon(content.type)
                return (
                  <tr
                    key={content.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {content.title}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Icon
                          size={16}
                          className="text-primary-500"
                        />
                        <span className="text-sm text-gray-600">
                          {getTypeLabel(content.type)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {content.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {content.uploader}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {formatDate(content.created_at)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          content.is_free
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary-100 text-primary-700'
                        }`}
                      >
                        {content.is_free ? 'Ücretsiz' : 'Ücretli'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ContentManagement

