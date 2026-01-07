import { useState, useEffect, useRef } from 'react'
import { X, Plus, Calendar, Clock, DollarSign, User, Image, Upload, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const CreateCampModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    schedule_text: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    teacher_id: '',
  })
  const [teachers, setTeachers] = useState([])
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      fetchApprovedTeachers()
    } else {
      // Modal kapandığında state'i temizle
      setFormData({
        title: '',
        description: '',
        price: '',
        schedule_text: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        teacher_id: '',
      })
      setSelectedImage(null)
      setImagePreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen])

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
      const { data: { user } } = await supabase.auth.getUser()
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
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

      if (!formData.teacher_id) {
        throw new Error('Lütfen bir öğretmen seçin')
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

      const { error } = await supabase
        .from('courses')
        .insert({
          title: formData.title,
          description: formData.description || null,
          teacher_id: formData.teacher_id,
          price: parseFloat(formData.price) || 0,
          schedule_text: fullSchedule || null,
          image_url: imageUrl || null,
          status: 'published', // Admin oluşturduğu için direkt published
        })

      if (error) throw error

      showToast.success('Canlı ders kampı başarıyla oluşturuldu!')
      setFormData({
        title: '',
        description: '',
        price: '',
        schedule_text: '',
        start_date: '',
        start_time: '',
        end_date: '',
        end_time: '',
        teacher_id: '',
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
            Yeni Canlı Ders Kampı Oluştur
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
              Kamp Adı *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: YKS Matematik Yoğunlaştırılmış Kamp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Kamp hakkında detaylı bilgi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar size={16} />
                <span>Başlangıç Tarihi</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Clock size={16} />
                <span>Başlangıç Saati</span>
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Calendar size={16} />
                <span>Bitiş Tarihi</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Clock size={16} />
                <span>Bitiş Saati</span>
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ek Program Bilgisi
            </label>
            <input
              type="text"
              value={formData.schedule_text}
              onChange={(e) => setFormData({ ...formData, schedule_text: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Örn: Hafta içi 19:00-21:00, Cumartesi 10:00-12:00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <User size={16} />
              <span>Öğretmen *</span>
            </label>
            {isLoadingTeachers ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                Öğretmenler yükleniyor...
              </div>
            ) : teachers.length === 0 ? (
              <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                Onaylı öğretmen bulunamadı. Önce öğretmenleri onaylamanız gerekiyor.
              </div>
            ) : (
              <select
                required
                value={formData.teacher_id}
                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Ücret (₺) *</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* Fotoğraf Yükleme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Image size={16} />
              <span>Kamp Görseli (Opsiyonel)</span>
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
                  id="camp-image-upload"
                />
                <label
                  htmlFor="camp-image-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="text-gray-400" size={32} />
                  <span className="text-sm text-gray-600">
                    Kamp görseli yüklemek için tıklayın
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
                  <span>Kamp Oluştur</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCampModal

