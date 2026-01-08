import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { showToast, handleApiError } from '../utils/toast'
import { CheckCircle, ArrowLeft } from 'lucide-react'

const ResetPassword = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Supabase auth state change'i dinle - password recovery için
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session)
      
      if (event === 'PASSWORD_RECOVERY') {
        // Password recovery token geldi, session oluşturuldu
        console.log('Password recovery event detected')
      }
    })

    // URL hash'inde recovery token var mı kontrol et
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const typeParam = hashParams.get('type')

    console.log('URL hash params:', { accessToken: !!accessToken, typeParam })

    // Eğer hash'te token yoksa ve session da yoksa, biraz bekle
    // Supabase token'ı işliyor olabilir
    if (!accessToken) {
      setTimeout(async () => {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Delayed session check:', { hasSession: !!session, error })
        
        if (!session && !accessToken) {
          // Token yok ve session da yok, muhtemelen yanlış link
          showToast.error('Geçersiz veya süresi dolmuş link. Lütfen yeni bir şifre sıfırlama isteği yapın.')
          setTimeout(() => {
            navigate(`/forgot-password/${type}`)
          }, 2000)
        }
      }, 2000)
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [type, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation
      if (password.length < 6) {
        throw new Error('Şifre en az 6 karakter olmalıdır')
      }

      if (password !== confirmPassword) {
        throw new Error('Şifreler eşleşmiyor')
      }

      // Önce session kontrolü yap
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Geçersiz veya süresi dolmuş link. Lütfen yeni bir şifre sıfırlama isteği yapın.')
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: password,
      })

      if (error) throw error

      showToast.success('Şifreniz başarıyla güncellendi!')
      setIsSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate(`/login/${type}`)
      }, 2000)
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'student':
        return 'Yeni Şifre Belirle'
      case 'teacher':
        return 'Yeni Şifre Belirle'
      default:
        return 'Yeni Şifre Belirle'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/images/logo.svg" 
              alt="KAMPÜSTEN Logo" 
              className="h-20 w-20 mx-auto transition-transform duration-200 hover:scale-105"
            />
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-gray-500 font-light">
            {isSuccess 
              ? 'Şifreniz başarıyla güncellendi' 
              : 'Yeni şifrenizi belirleyin'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200/50 p-8 shadow-sm">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-xl font-light text-gray-900 mb-2">Başarılı!</h2>
              <p className="text-sm text-gray-500 font-light mb-6">
                Şifreniz başarıyla güncellendi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-light text-gray-700 mb-2"
                >
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-light text-gray-900 placeholder-gray-400"
                  placeholder="En az 6 karakter"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-light text-gray-700 mb-2"
                >
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-light text-gray-900 placeholder-gray-400"
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-light text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200/50 text-center">
            <Link
              to={`/login/${type}`}
              className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 font-light transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Giriş sayfasına dön</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

