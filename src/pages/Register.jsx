import { useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Image, Upload, XCircle, User } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { showToast, handleApiError } from '../utils/toast'

const Register = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    // Student specific
    grade_level: '',
    // Teacher specific
    university: '',
    department: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  const isStudent = type === 'student'
  const isTeacher = type === 'teacher'

  const getTitle = () => {
    if (isStudent) return 'Öğrenci Kaydı'
    if (isTeacher) return 'Öğretmen Kaydı'
    return 'Kayıt Ol'
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      showToast.error('Lütfen bir görsel dosyası seçin')
      return
    }

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast.error('Profil resmi boyutu 2MB\'dan küçük olmalıdır')
      return
    }

    setSelectedAvatar(file)
    
    // Preview oluştur
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setSelectedAvatar(null)
    setAvatarPreview(null)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  const uploadAvatar = async (file, userId) => {
    try {
      // Dosya adını oluştur
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Supabase Storage'a yükle
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Public URL'yi al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Şifreler eşleşmiyor')
      }

      if (formData.password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır')
      }

      if (isStudent && !formData.grade_level) {
        throw new Error('Sınıf seviyesi gereklidir')
      }

      if (isTeacher && (!formData.university || !formData.department)) {
        throw new Error('Üniversite ve bölüm bilgileri gereklidir')
      }

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
        },
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Kayıt işlemi başarısız oldu')
      }

      // Eğer profil resmi seçildiyse yükle
      let avatarUrl = null
      if (selectedAvatar && isTeacher) {
        setIsUploadingAvatar(true)
        try {
          avatarUrl = await uploadAvatar(selectedAvatar, authData.user.id)
        } catch (error) {
          handleApiError(error)
          setIsUploadingAvatar(false)
          setIsLoading(false)
          return
        }
        setIsUploadingAvatar(false)
      }

      // Create profile (trigger devre dışı, biz oluşturuyoruz)
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: type,
          full_name: formData.full_name,
          avatar_url: avatarUrl || null,
        })

      if (profileError) {
        // Eğer profile zaten varsa (trigger çalıştıysa), update yap
        if (profileError.code === '23505') {
          // Duplicate key - profile zaten var, update yap
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: type,
              full_name: formData.full_name,
              avatar_url: avatarUrl || null,
            })
            .eq('id', authData.user.id)
          
          if (updateError) throw updateError
        } else {
          throw profileError
        }
      }

      // Create role-specific details
      if (isStudent) {
        const { error: studentError } = await supabase
          .from('student_details')
          .insert({
            id: authData.user.id,
            grade_level: formData.grade_level,
          })

        if (studentError) throw studentError
      }

      if (isTeacher) {
        const { error: teacherError } = await supabase
          .from('teacher_details')
          .insert({
            id: authData.user.id,
            university: formData.university,
            department: formData.department,
            is_approved: false, // Requires admin approval
          })

        if (teacherError) throw teacherError
      }

      showToast.success(
        isTeacher
          ? 'Kayıt başarılı! Hesabınız onaylandıktan sonra giriş yapabilirsiniz.'
          : 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...'
      )

      // Redirect to login
      setTimeout(() => {
        navigate(`/login/${type}`)
      }, 2000)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Link to="/">
              <img 
                src="/images/logo.svg" 
                alt="Kampusten.org Logo" 
                className="h-16 w-16 mx-auto transition-transform duration-200 hover:scale-105"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{getTitle()}</h2>
          <p className="mt-2 text-gray-600">Hesap oluşturun ve başlayın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Ad Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="ornek@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Şifre <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="En az 6 karakter"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Şifrenizi tekrar girin"
            />
          </div>

          {isStudent && (
            <div>
              <label
                htmlFor="grade_level"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sınıf Seviyesi <span className="text-red-500">*</span>
              </label>
              <select
                id="grade_level"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Seçiniz</option>
                <option value="9. Sınıf">9. Sınıf</option>
                <option value="10. Sınıf">10. Sınıf</option>
                <option value="11. Sınıf">11. Sınıf</option>
                <option value="12. Sınıf">12. Sınıf</option>
                <option value="Mezun">Mezun</option>
              </select>
            </div>
          )}

          {isTeacher && (
            <>
              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Üniversite <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Boğaziçi Üniversitesi"
                />
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bölüm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Örn: Matematik"
                />
              </div>

              {/* Profil Resmi Yükleme (Opsiyonel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <User size={16} />
                  <span>Profil Resmi (Opsiyonel)</span>
                </label>
                {avatarPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Upload className="text-gray-400" size={24} />
                      </div>
                      <span className="text-sm text-gray-600">
                        Profil resmi yüklemek için tıklayın
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG, GIF (Max 2MB)
                      </span>
                    </label>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Not:</strong> Öğretmen hesapları yönetici onayından sonra aktif
                  olacaktır. Onay süreci genellikle 1-2 iş günü sürmektedir.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading || isUploadingAvatar}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isLoading || isUploadingAvatar) ? (
              isUploadingAvatar ? 'Profil resmi yükleniyor...' : 'Kayıt yapılıyor...'
            ) : (
              'Kayıt Ol'
            )}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link
              to={`/login/${type}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register

