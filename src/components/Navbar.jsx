import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut } from 'lucide-react'
import { getCurrentUser, supabase } from '../lib/supabase'
import { showToast } from '../utils/toast'

const Navbar = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef(null)

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setIsLoggedIn(!!user)
      } catch (error) {
        setIsLoggedIn(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      showToast.success('Çıkış yapıldı')
      navigate('/')
      setIsMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
      showToast.error('Çıkış yapılırken bir hata oluştu')
    }
  }

  const loginOptions = [
    { type: 'student', label: 'Öğrenci Girişi', path: '/login/student' },
    { type: 'teacher', label: 'Öğretmen Girişi', path: '/login/teacher' },
  ]

  const registerOptions = [
    { type: 'student', label: 'Öğrenci Kaydı', path: '/register/student' },
    { type: 'teacher', label: 'Öğretmen Kaydı', path: '/register/teacher' },
  ]

  return (
    <nav className="bg-[#ffde59] border-b border-[#ffd700] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/images/logo.svg" 
              alt="Kampusten.org Logo" 
              className="h-10 w-10 transition-transform duration-200 group-hover:scale-105"
            />
            <div className="text-xl font-bold text-gray-900 hidden sm:block">
              Kampusten<span className="text-gray-700">.org</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/about"
              className="text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium"
            >
              Hakkımızda
            </Link>

            {!isLoading && (
              <>
                {!isLoggedIn ? (
                  <>
                    {/* Register Button */}
                    <Link
                      to="/register/student"
                      className="btn-secondary text-sm"
                    >
                      Kayıt Ol
                    </Link>

                    {/* Login Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-1 text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium"
                      >
                        <span>Giriş Yap</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isDropdownOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                          {loginOptions.map((option) => (
                            <Link
                              key={option.type}
                              to={option.path}
                              onClick={() => setIsDropdownOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                            >
                              {option.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Logout Button */
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-900 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-900 hover:text-gray-700 transition-colors p-2 -mr-2"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-4 border-t border-[#ffd700]">
            <Link
              to="/about"
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 text-gray-900 hover:text-gray-700 transition-colors duration-200 font-medium"
            >
              Hakkımızda
            </Link>

            {!isLoading && (
              <>
                {!isLoggedIn ? (
                  <>
                    <div className="space-y-2 px-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Kayıt Ol</div>
                      {registerOptions.map((option) => (
                        <Link
                          key={option.type}
                          to={option.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2.5 text-gray-900 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors duration-200"
                        >
                          {option.label}
                        </Link>
                      ))}
                    </div>

                    <div className="space-y-2 px-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Giriş Yap</div>
                      {loginOptions.map((option) => (
                        <Link
                          key={option.type}
                          to={option.path}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-3 py-2.5 text-gray-900 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors duration-200"
                        >
                          {option.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2.5 text-gray-900 hover:text-red-600 hover:bg-white/50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut size={18} />
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

