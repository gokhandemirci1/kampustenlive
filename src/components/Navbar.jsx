import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, getUserProfile } from '../lib/supabase'
import { LogOut, User, Menu, X, LogIn, UserPlus } from 'lucide-react'

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
            <div className="text-base sm:text-lg font-bold text-white">
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
                  className="group relative inline-flex items-center space-x-2 px-5 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  <span>Giriş Yap</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/register/student"
                  className="group relative inline-flex items-center space-x-2 px-6 py-2.5 bg-[#ffde59] text-gray-900 rounded-lg hover:bg-[#ffd700] transition-all duration-300 font-bold text-sm shadow-xl hover:shadow-2xl hover:shadow-[#ffde59]/50 transform hover:scale-105 active:scale-95 border-2 border-gray-900/20 hover:border-gray-900/30"
                >
                  <UserPlus size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Kayıt Ol</span>
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300"></div>
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
                  className="group flex items-center justify-center space-x-2 w-full px-5 py-3 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition-all duration-300 font-semibold border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl active:scale-95"
                >
                  <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform duration-300" />
                  <span>Giriş Yap</span>
                </Link>
                <Link
                  to="/register/student"
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center justify-center space-x-2 w-full px-5 py-3 bg-[#ffde59] text-gray-900 rounded-lg hover:bg-[#ffd700] transition-all duration-300 font-bold text-sm shadow-xl hover:shadow-2xl hover:shadow-[#ffde59]/50 active:scale-95 border-2 border-gray-900/20"
                >
                  <UserPlus size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>Kayıt Ol</span>
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
