import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase, getUserProfile } from '../lib/supabase'
import { showToast, handleApiError } from '../utils/toast'

const Login = () => {
  const { type } = useParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const getTitle = () => {
    switch (type) {
      case 'student':
        return 'Öğrenci Girişi'
      case 'teacher':
        return 'Öğretmen Girişi'
      case 'admin':
        return 'Yönetici Girişi'
      default:
        return 'Giriş Yap'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to check role
      const profile = await getUserProfile(data.user.id)

      // Verify role matches login type
      if (type && profile.role !== type && profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Bu hesap için uygun giriş sayfasını kullanın.')
      }

      showToast.success('Giriş başarılı! Yönlendiriliyorsunuz...')

      // Redirect based on role
      setTimeout(() => {
        switch (profile.role) {
          case 'student':
            navigate('/student/dashboard')
            break
          case 'teacher':
            navigate('/teacher/dashboard')
            break
          case 'admin':
            navigate('/admin/dashboard')
            break
          default:
            navigate('/')
        }
      }, 1000)
    } catch (error) {
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
              src="/images/logo.svg" 
              alt="KAMPÜSTEN Logo" 
              className="h-20 w-20 mx-auto transition-transform duration-200 hover:scale-105"
            />
          </Link>
          <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-gray-500 font-light">Hesabınıza giriş yapın</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg border border-gray-200/50 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Email
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

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-light text-gray-700 mb-2"
              >
                Şifre
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 font-light text-gray-900 placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all duration-200 font-light text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200/50 text-center">
            <p className="text-sm text-gray-500 font-light">
              Hesabınız yok mu?{' '}
              <Link
                to={`/register/${type}`}
                className="text-primary-500 hover:text-primary-600 font-normal transition-colors"
              >
                Kayıt olun
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

