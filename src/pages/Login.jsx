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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{getTitle()}</h2>
          <p className="mt-2 text-gray-600">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link
              to={`/register/${type}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Kayıt olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

