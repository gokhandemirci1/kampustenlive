import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { GraduationCap, BookOpen, Users, ArrowRight } from 'lucide-react'
import FeaturedTeachersSlider from '../components/home/FeaturedTeachersSlider'
import StatsSection from '../components/home/StatsCounter'
import HowItWorks from '../components/home/HowItWorks'
import Testimonials from '../components/home/Testimonials'
import WhyChooseUs from '../components/home/WhyChooseUs'
import FAQ from '../components/home/FAQ'

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    // Check if URL has hash fragment with password recovery token
    if (window.location.hash && location.pathname === '/') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      const error = hashParams.get('error')

      console.log('HashHandler - Hash detected:', { 
        hasAccessToken: !!accessToken, 
        type, 
        error,
        pathname: location.pathname 
      })

      // If it's a password recovery token, extract type from current URL or hash
      if (accessToken && type === 'recovery') {
        // Try to get type from URL search params or hash, default to 'student'
        const urlParams = new URLSearchParams(window.location.search)
        const userType = urlParams.get('type') || hashParams.get('user_type') || 'student'
        
        console.log('Password recovery token detected, redirecting to:', `/reset-password/${userType}`)
        // Hash fragment'i koruyarak yönlendir
        navigate(`/reset-password/${userType}${window.location.hash}`, { replace: true })
      } else if (error) {
        // If there's an error, try to extract type and redirect to forgot password
        console.log('Auth error detected in hash:', error)
        const urlParams = new URLSearchParams(window.location.search)
        const userType = urlParams.get('type') || 'student'
        navigate(`/forgot-password/${userType}`, { replace: true })
      }
    }
  }, [location, navigate])

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Image - Mobile Responsive */}
        <div 
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat ${!isMobile ? 'md:bg-fixed' : ''}`}
          style={{
            backgroundImage: 'url(/images/hero_background.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: isMobile ? 'center top' : 'center center',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            width: '100%'
          }}
        >
          {/* Professional Gradient Overlay - Semi-transparent yellow background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#ffde59]/30 via-[#ffde59]/25 to-[#ffde59]/35"></div>
          
          {/* Additional subtle overlay for better contrast and readability */}
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Content Layer - z-index to ensure it's above background */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-6 sm:mb-8 flex justify-center">
              <img 
                src="/images/logo.jpg" 
                alt="Kampusten.org Logo" 
                className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-full object-cover shadow-xl border-4 border-white/50 animate-fade-in hover:shadow-2xl transition-all duration-300 hover:scale-105"
              />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/95 backdrop-blur-md border-2 border-[#ffde59] rounded-full text-xs sm:text-sm font-bold text-gray-900 mb-4 sm:mb-6 shadow-xl">
              <GraduationCap size={14} className="sm:w-4 sm:h-4 text-[#ffde59]" />
              <span className="px-1">Öğrenciden Öğrenciye Özel Ders</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              <span className="text-gray-900 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3), 0 0 2px rgba(255,255,255,0.8)' }}>
                YKS'ye Hazırlanırken
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffde59] via-[#ffd700] to-[#ffde59] drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 4px rgba(255,222,89,0.6)' }}>
                Yanınızdayız
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-900 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 0 2px rgba(255,255,255,0.9)' }}>
              Deneyimli öğretmenlerle özel ders alın, hedefinize ulaşın.
              <br />
              <span className="text-[#ffd700] font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 2px rgba(0,0,0,0.5)' }}>
                Öğrenciden öğrenciye, samimi ve etkili eğitim.
              </span>
            </p>

            {/* Featured Teachers Slider */}
            <FeaturedTeachersSlider />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 mt-8 sm:mt-12">
              <Link
                to="/register/student"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                <span>Hemen Başla</span>
                <ArrowRight size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <Link
                to="/register/teacher"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 border-2 border-primary-200 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200 text-sm sm:text-base"
              >
                <Users size={18} className="sm:w-5 sm:h-5" />
                <span>Öğretmen Ol</span>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12 md:mt-16 max-w-4xl mx-auto px-4">
              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <BookOpen className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Canlı Dersler</h3>
                <p className="text-sm text-gray-600">
                  Uzman öğretmenlerle canlı, interaktif dersler
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <GraduationCap className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Ücretsiz İçerikler</h3>
                <p className="text-sm text-gray-600">
                  PDF'ler, videolar ve soru çözümleri
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Users className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Topluluk</h3>
                <p className="text-sm text-gray-600">
                  Öğrenciler ve öğretmenlerle iletişim
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* Testimonials Section */}
      <Testimonials />

      {/* FAQ Section */}
      <FAQ />

      {/* Final CTA Section */}
      <div className="relative z-10 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Hemen Başlayın, Hedefinize Ulaşın!
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            YKS'ye hazırlanırken yalnız değilsiniz. Binlerce öğrenciyle birlikte başarıya ulaşın.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register/student"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 text-lg"
            >
              <span>Ücretsiz Hesap Oluştur</span>
              <ArrowRight size={22} />
            </Link>
            <Link
              to="/register/teacher"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-lg font-bold hover:bg-white/20 transition-all duration-200 text-lg"
            >
              <Users size={22} />
              <span>Öğretmen Ol</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
