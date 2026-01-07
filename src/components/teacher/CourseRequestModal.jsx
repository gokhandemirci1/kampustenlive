import { useState, useRef, useEffect } from 'react'
import { X, Image, Upload, XCircle, Calendar, Clock } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const CourseRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    schedule_text: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  // Modal kapandığında state'i temizle
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        schedule_text: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      })
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

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
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadImage = async (file) => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
      }

      // Dosya adını oluştur (timestamp + random)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `course-images/${fileName}`

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Public URL'yi al
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
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
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      let imageUrl = null

      // Eğer görsel seçildiyse yükle
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

      // Tarih ve saat bilgisini birleştir
      const scheduleInfo = []
      if (formData.start_date && formData.start_time) {
        scheduleInfo.push(`Başlangıç: ${formData.start_date} ${formData.start_time}`)
      }
      if (formData.end_date && formData.end_time) {
        scheduleInfo.push(`Bitiş: ${formData.end_date} ${formData.end_time}`)
      }
      const fullSchedule = scheduleInfo.length > 0 
        ? scheduleInfo.join(' | ') + (formData.schedule_text ? ` | ${formData.schedule_text}` : '')
        : formData.schedule_text

      // En az bir tarih/saat veya ek program bilgisi olmalı
      if (!fullSchedule || fullSchedule.trim() === '') {
        showToast.error('Lütfen en az bir tarih/saat seçin veya ek program bilgisi girin')
        setIsSubmitting(false)
        return
      }

      const { data, error } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description,
          schedule_text: fullSchedule || null,
          price: 0, // Fiyat admin tarafından atanacak
          image_url: imageUrl || null,
          teacher_id: user.id,
          status: 'pending',
        })
        .select()
        .single()

      if (error) throw error

      showToast.success('Ders talebi başarıyla oluşturuldu!')
      onSubmit(data)
      setFormData({
        title: '',
        description: '',
        schedule_text: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
      })
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-light text-gray-900 uppercase tracking-wider">Canlı Ders Talep Et</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ders Adı
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              placeholder="Örn: Matematik Özel Ders"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 resize-none bg-white"
              placeholder="Ders hakkında detaylı bilgi verin..."
            />
          </div>

          {/* Tarih ve Saat Seçimi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar size={14} className="text-gray-400" />
                <span>Başlangıç Tarihi</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-light text-gray-700 mb-2 flex items-center space-x-2">
                <Clock size={14} className="text-gray-400" />
                <span>Başlangıç Saati</span>
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar size={16} className="text-primary-600" />
                <span>Bitiş Tarihi</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-2">
                <Clock size={16} className="text-primary-600" />
                <span>Bitiş Saati</span>
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="schedule_text"
              className="block text-sm font-light text-gray-700 mb-2"
            >
              Ek Program Bilgisi
            </label>
            <input
              type="text"
              id="schedule_text"
              name="schedule_text"
              value={formData.schedule_text}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:border-[#ffde59] transition-colors duration-200 bg-white"
              placeholder="Örn: Hafta içi 19:00-21:00, Cumartesi 10:00-12:00"
            />
            <p className="mt-2 text-sm text-gray-500">
              Tarih ve saat seçtiyseniz bu alan opsiyoneldir
            </p>
          </div>

          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2 flex items-center space-x-2">
              <Image size={14} className="text-gray-400" />
              <span>Ders Görseli</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                >
                  <XCircle size={18} />
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 p-8 text-center hover:border-gray-400 transition-colors duration-200 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="course-image-upload"
                />
                <label
                  htmlFor="course-image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-3"
                >
                  <Upload className="text-gray-400" size={28} />
                  <span className="text-sm font-light text-gray-600">
                    Ders görseli yüklemek için tıklayın
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG, GIF (Max 5MB)
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors duration-200 font-light text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImage}
              className="px-8 py-2 bg-[#ffde59] text-gray-900 rounded-sm hover:bg-[#ffd700] transition-colors duration-200 font-light text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(isSubmitting || isUploadingImage) ? (
                isUploadingImage ? 'Görsel yükleniyor...' : 'Kaydediliyor...'
              ) : (
                'Talep Et'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CourseRequestModal

