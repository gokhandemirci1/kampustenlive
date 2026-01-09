import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase'
import { LogOut, User, Menu, X } from 'lucide-react'

const Navbar = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const userProfile = await getUserProfile(currentUser.id)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        // User not logged in
        setUser(null)
        setProfile(null)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        checkUser()
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      navigate('/')
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getDashboardPath = () => {
    if (!profile) return '/'
    switch (profile.role) {
      case 'student':
        return '/student/dashboard'
      case 'teacher':
        return '/teacher/dashboard'
      case 'admin':
        return '/admin/dashboard'
      default:
        return '/'
    }
  }

  return (
    <nav className="bg-gradient-to-r from-black via-black/90 to-[#ffde59] border-b border-gray-200/50 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/images/logo.jpg" 
              alt="Kampusten.org Logo" 
              className="h-10 w-10 rounded-full object-cover shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg border-2 border-primary-100"
            />
            <div className="text-xl font-bold text-white">
              KAMPÜSTEN
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user && profile ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                >
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                  >
                    <User size={18} />
                    <span>{profile.full_name || user.email}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut size={16} />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login/student"
                  className="text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register/student"
                  className="px-4 py-2 bg-[#ffde59] text-black rounded-lg hover:bg-[#ffd700] transition-all duration-200 font-light text-sm font-semibold shadow-md"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-[#ffde59] transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            {user && profile ? (
              <div className="space-y-3">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                >
                  <LogOut size={18} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/login/student"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white/90 hover:text-[#ffde59] transition-colors duration-200 font-light"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register/student"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 bg-[#ffde59] text-black rounded-lg hover:bg-[#ffd700] transition-all duration-200 font-light text-sm text-center font-semibold shadow-md"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
