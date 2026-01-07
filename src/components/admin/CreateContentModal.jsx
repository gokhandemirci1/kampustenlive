import { useState, useRef, useEffect } from 'react'
import { X, Plus, Image, Upload, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const CreateContentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'pdf',
    url: '',
    category: '',
    is_free: true,
    image_url: '',
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  // Modal kapandığında state'i temizle
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        type: 'pdf',
        url: '',
        category: '',
        is_free: true,
        image_url: '',
      })
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error('Lütfen bir görsel dosyası seçin')
      return
    }

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error('Görsel boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setSelectedImage(file)
    
    // Preview oluştur
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setFormData({ ...formData, image_url: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
      }

      // Dosya adını oluştur (timestamp + random)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `content-images/${fileName}`

      // Supabase Storage'a yükle
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('content-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Public URL'yi al
      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
      }

      let imageUrl = formData.image_url

      // Eğer yeni görsel seçildiyse yükle
      if (selectedImage) {
        setIsUploadingImage(true)
        try {
          imageUrl = await uploadImage(selectedImage)
        } catch (error) {
          handleApiError(error)
          setIsUploadingImage(false)
          setIsSubmitting(false)
          return
        }
        setIsUploadingImage(false)
      }

      // URL veya görsel olmalı
      if (!formData.url && !imageUrl) {
        showToast.error('Lütfen bir URL girin veya görsel yükleyin')
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase
        .from('contents')
        .insert({
          title: formData.title,
          type: formData.type,
          url: formData.url || null,
          category: formData.category || null,
          is_free: formData.is_free,
          image_url: imageUrl || null,
          uploader_id: user.id,
        })

      if (error) throw error

      showToast.success('İçerik başarıyla oluşturuldu!')
      setFormData({
        title: '',
        type: 'pdf',
        url: '',
        category: '',
        is_free: true,
        image_url: '',
      })
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onSuccess?.()
      onClose()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Yeni İçerik Oluştur
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik Başlığı *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: Matematik Temel Kavramlar PDF"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              İçerik Tipi *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="question">Soru Çözümü</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL/Link {!formData.image_url && <span className="text-red-500">*</span>}
            </label>
            <input
              type="url"
              required={!formData.image_url && !selectedImage}
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://example.com/content.pdf"
            />
            <p className="mt-1 text-sm text-gray-500">
              PDF, video veya içerik linkini buraya yapıştırın {formData.image_url || selectedImage ? '(veya görsel yükleyin)' : ''}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: Matematik, Fizik, Kimya"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_free"
              checked={formData.is_free}
              onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="is_free" className="ml-2 block text-sm text-gray-700">
              Ücretsiz içerik (Open Source)
            </label>
          </div>

          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Image size={16} />
              <span>İçerik Görseli (Opsiyonel)</span>
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">
                    Görsel yüklemek için tıklayın
                  </span>
                  <span className="text-xs text-gray-500">
                    PNG, JPG, GIF (Max 5MB)
                  </span>
                </label>
              </div>
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
              disabled={isSubmitting || isUploadingImage}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {(isSubmitting || isUploadingImage) ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{isUploadingImage ? 'Görsel yükleniyor...' : 'Oluşturuluyor...'}</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateContentModal

