import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { showToast, handleApiError } from '../utils/toast'
import { ArrowLeft, Mail } from 'lucide-react'

const ForgotPassword = () => {
  const { type } = useParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const getTitle = () => {
    switch (type) {
      case 'student':
        return 'Öğrenci Şifre Sıfırlama'
      case 'teacher':
        return 'Öğretmen Şifre Sıfırlama'
      default:
        return 'Şifre Sıfırlama'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Redirect URL'i oluştur - production domain kullan
      // Production'da her zaman www.kampusten.org kullan, localhost'ta ise localhost
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
      const baseUrl = isProduction 
        ? 'https://www.kampusten.org'
        : window.location.origin
      
      // Redirect URL'e type bilgisini query parameter olarak ekle
      const redirectUrl = `${baseUrl}/reset-password/${type}?type=${type}`
      
      console.log('Password reset request:', { 
        email, 
        redirectUrl, 
        hostname: window.location.hostname,
        isProduction 
      })

      // Supabase password reset email gönder
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })

      if (error) {
        console.error('Password reset error:', error)
        // Daha detaylı hata mesajı göster
        if (error.message?.includes('SMTP') || error.message?.includes('email')) {
          showToast.error('E-posta gönderilemedi. Lütfen Supabase SMTP ayarlarını kontrol edin.')
        } else {
          throw error
        }
        return
      }

      console.log('Password reset success:', data)
      showToast.success('Şifre sıfırlama linki e-posta adresinize gönderildi!')
      setIsSent(true)
    } catch (error) {
      console.error('Unexpected error:', error)
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-6">
            <img 
              src="/images/logo.jpg" 
              alt="KAMPÜSTEN Logo" 
              className="h-20 w-20 mx-auto rounded-full object-cover shadow-lg border-4 border-primary-100 transition-all duration-200 hover:scale-110 hover:shadow-xl"
            />
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-gray-500 font-light">
            {isSent 
              ? 'E-posta adresinizi kontrol edin' 
              : 'E-posta adresinizi girin, size şifre sıfırlama linki göndereceğiz'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200/50 p-8 shadow-sm">
          {isSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-primary-500" size={32} />
              </div>
              <h2 className="text-xl font-light text-gray-900 mb-2">E-posta Gönderildi</h2>
              <p className="text-sm text-gray-500 font-light mb-6">
                <span className="font-normal">{email}</span> adresine şifre sıfırlama linki gönderildi.
                Lütfen e-posta kutunuzu kontrol edin.
              </p>
              <div className="space-y-3">
                <Link
                  to={`/login/${type}`}
                  className="inline-flex items-center space-x-2 text-primary-500 hover:text-primary-600 font-light transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Giriş sayfasına dön</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-light text-gray-700 mb-2"
                >
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-light text-gray-900 placeholder-gray-400"
                  placeholder="ornek@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-light text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
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

export default ForgotPassword

