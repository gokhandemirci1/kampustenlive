import { useState } from 'react'
import { Upload, FileText, Video, Link as LinkIcon } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const ContentUploadForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    url: '',
    category: '',
    is_free: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Konu Anlatımı',
    'Soru Çözümü',
    'Ders Notları',
    'Deneme Sınavı',
    'Video Ders',
    'PDF Döküman',
  ]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      const { data, error } = await supabase
        .from('contents')
        .insert({
          title: formData.title,
          type: formData.type,
          url: formData.url,
          category: formData.category,
          is_free: formData.is_free,
          uploader_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      showToast.success('İçerik başarıyla yüklendi!')
      setFormData({
        title: '',
        type: 'pdf',
        url: '',
        category: '',
        is_free: true,
      })
      
      // Callback çağır
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h2 className="text-sm font-light text-gray-900 mb-8 uppercase tracking-wider">İçerik Yükle</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            İçerik Başlığı
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
            placeholder="Örn: Matematik - Türev Konu Anlatımı"
          />
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-semibold text-gray-700 mb-3"
          >
            İçerik Tipi
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center space-x-3 p-4 border rounded-sm cursor-pointer transition-all duration-200 ${
                formData.type === 'pdf'
                  ? 'border-[#ffde59] bg-[#ffde59]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="pdf"
                checked={formData.type === 'pdf'}
                onChange={handleChange}
                className="sr-only"
              />
              <FileText className={formData.type === 'pdf' ? 'text-gray-900' : 'text-gray-400'} size={20} />
              <span className={`text-sm font-light ${formData.type === 'pdf' ? 'text-gray-900' : 'text-gray-600'}`}>PDF</span>
            </label>

            <label
              className={`flex items-center justify-center space-x-3 p-4 border rounded-sm cursor-pointer transition-all duration-200 ${
                formData.type === 'video'
                  ? 'border-[#ffde59] bg-[#ffde59]/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="type"
                value="video"
                checked={formData.type === 'video'}
                onChange={handleChange}
                className="sr-only"
              />
              <Video className={formData.type === 'video' ? 'text-gray-900' : 'text-gray-400'} size={20} />
              <span className={`text-sm font-light ${formData.type === 'video' ? 'text-gray-900' : 'text-gray-600'}`}>Video</span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="url"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            {formData.type === 'video' ? 'Video Linki' : 'PDF Linki'}
          </label>
          <div className="relative">
            <LinkIcon
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              required
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              placeholder={
                formData.type === 'video'
                  ? 'https://youtube.com/watch?v=...'
                  : 'https://example.com/document.pdf'
              }
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Kategori
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
          >
            <option value="">Kategori seçin</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3 py-4 border-t border-gray-100">
          <input
            type="checkbox"
            id="is_free"
            name="is_free"
            checked={formData.is_free}
            onChange={handleChange}
            className="w-4 h-4 text-[#ffde59] border-gray-300 rounded-sm focus:ring-[#ffde59] focus:ring-1 cursor-pointer"
          />
          <label htmlFor="is_free" className="text-sm font-light text-gray-600 cursor-pointer">
            Ücretsiz içerik olarak paylaş
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#ffde59] text-gray-900 rounded-sm hover:bg-[#ffd700] transition-colors duration-200 font-light text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload size={18} />
          <span>{isSubmitting ? 'Yükleniyor...' : 'İçeriği Yükle'}</span>
        </button>
      </form>
    </div>
  )
}

export default ContentUploadForm

