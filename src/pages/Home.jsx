import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowRight, BookOpen, Sparkles, UserPlus } from 'lucide-react'
import FeaturedTeachersSlider from '../components/home/FeaturedTeachersSlider'

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()

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

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Search functionality - can navigate to course search or filter
      console.log('Search query:', searchQuery)
      // TODO: Implement search functionality
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden">
      {/* Hero Section - "Kaos Yok, Akış Var" */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 mesh-gradient opacity-40"></div>
        
        {/* Floating 3D Shape - Mesh Gradient Topu */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full mesh-gradient opacity-60 animate-float blur-3xl"></div>
        <div className="absolute left-10 top-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-[#E0F7FA]/40 to-[#E1BEE7]/40 animate-float blur-2xl" style={{ animationDelay: '2s' }}></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <img 
                src="/images/logo.jpg" 
                alt="Kampusten.org Logo" 
                className="h-24 w-24 rounded-full object-cover shadow-2xl border-4 border-white/50 animate-fade-in"
              />
            </div>

            {/* Main Heading - Çok Büyük, İnce Font */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-6 leading-tight tracking-tight">
              <span className="text-gray-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)' }}>
                Seni En İyi,
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#1a73e8] via-[#8e24aa] to-[#e91e63] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.6)' }}>
                Senin Yolundan Geçen Anlar.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-gray-800 mb-12 max-w-3xl mx-auto font-normal leading-relaxed drop-shadow-[0_1px_3px_rgba(255,255,255,0.8)]" style={{ textShadow: '0 1px 4px rgba(255,255,255,0.9), 0 0 10px rgba(255,255,255,0.5)' }}>
              YKS maratonunda yalnız değilsin. Derece yapmış akranlarından,<br />
              sana özel butik gruplarda ders dinle.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/register/student"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1a73e8] via-[#8e24aa] to-[#e91e63] text-white rounded-full font-light text-lg hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
              >
                <span>Hemen Başla</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/register/teacher"
                className="inline-flex items-center gap-2 px-8 py-4 glass-strong text-gray-700 rounded-full hover:text-gray-900 transition-all duration-300 font-light text-lg border border-gray-200/50 hover:border-gray-300/50"
              >
                <UserPlus className="w-5 h-5" />
                <span>Eğitmenimiz Ol</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sosyal Kanıt & Mentorlar - "Bizden Birileri" */}
      <section className="relative py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-light text-center mb-16 text-gray-900 tracking-tight">
            Bizden Birileri
          </h2>
          <FeaturedTeachersSlider />
        </div>
      </section>

      {/* İçerik Ayrımı - "Özgür Seçim" */}
      <section className="relative py-32 overflow-hidden">
        {/* Duman gibi geçiş - Mesh Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Sol Taraf - Ücretsiz: "Hemen Başla" */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA]/20 to-emerald-200/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative glass rounded-3xl p-12 lg:p-16 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-4xl font-light text-gray-900">Hemen Başla</h3>
                </div>
                <p className="text-lg text-gray-700 mb-8 font-light leading-relaxed">
                  Notlar, kısa taktik videoları ve ücretsiz içeriklerle yoluna başla.
                </p>
                <Link
                  to="/register/student"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full font-light text-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                  Ücretsiz İçeriklere Eriş
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Sağ Taraf - Ücretli/Premium: "Derinleş" */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#E1BEE7]/30 to-purple-300/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative glass-strong rounded-3xl p-12 lg:p-16 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center relative">
                    <Sparkles className="w-8 h-8 text-white" />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300/50 to-orange-300/50 animate-pulse"></div>
                  </div>
                  <h3 className="text-4xl font-light text-gray-900">Derinleş</h3>
                </div>
                <p className="text-lg text-gray-700 mb-8 font-light leading-relaxed">
                  Butik grup dersleri, koçluk ve kişiselleştirilmiş eğitim programları.
                </p>
                <Link
                  to="/register/student"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-light text-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                  Premium'a Geç
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dinamik Program - "Canlı Akış" */}
      <section className="relative py-20 bg-gradient-to-b from-white/50 to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-light text-center mb-16 text-gray-900 tracking-tight">
            Canlı Akış
          </h2>
          {/* Timeline will be implemented here */}
          <div className="text-center text-gray-500 font-light">
            Yaklaşan dersler yakında burada görünecek
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="relative py-16 bg-gradient-to-b from-[#FAFAFA] to-white/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">
            Sen yaparsın,<br />
            <span className="bg-gradient-to-r from-[#E0F7FA] via-[#E1BEE7] to-[#FFCCBC] bg-clip-text text-transparent">
              biz destekleriz.
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
