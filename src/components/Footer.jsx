import { Link } from 'react-router-dom'
import { Instagram, Home, Info, Users, GraduationCap, BookOpen, Shield } from 'lucide-react'

const Footer = () => {
  const quickLinks = [
    { to: '/', label: 'Anasayfa', icon: Home },
    { to: '#teachers', label: 'Eğitmenlerimiz', icon: GraduationCap },
    { to: '#how-it-works', label: 'Nasıl Çalışır?', icon: BookOpen },
    { to: '#testimonials', label: 'Yorumlar', icon: Users }
  ]

  const companyLinks = [
    { to: '/about', label: 'Hakkımızda', icon: Info },
    { to: '/privacy', label: 'Gizlilik Politikası', icon: Shield }
  ]

  const handleAnchorClick = (e, anchor) => {
    if (anchor.startsWith('#')) {
      e.preventDefault()
      const element = document.querySelector(anchor)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <footer className="bg-gradient-to-r from-black via-black/90 to-[#ffde59] border-t border-gray-200/50 mt-auto shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8">
          {/* Logo and Brand */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/images/logo.jpg" 
                alt="Kampusten.org Logo" 
                className="h-12 w-12 rounded-full object-cover shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg border-2 border-white/50"
              />
              <div className="text-base sm:text-lg font-bold text-white">
                KAMPÜSTEN
              </div>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Öğrenciden öğrenciye, samimi ve etkili eğitim platformu. YKS'ye hazırlanırken yanınızdayız.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Home size={18} />
              <span>Hızlı Linkler</span>
            </h3>
            <nav className="flex flex-col space-y-2">
              {quickLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <Link
                    key={index}
                    to={link.to}
                    onClick={(e) => handleAnchorClick(e, link.to)}
                    className="flex items-center space-x-2 text-sm text-white/80 hover:text-[#ffde59] transition-all duration-200 group"
                  >
                    <Icon size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Şirket */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <Info size={18} />
              <span>Şirket</span>
            </h3>
            <nav className="flex flex-col space-y-2">
              {companyLinks.map((link, index) => {
                const Icon = link.icon
                return (
                  <Link
                    key={index}
                    to={link.to}
                    className="flex items-center space-x-2 text-sm text-white/80 hover:text-[#ffde59] transition-all duration-200 group"
                  >
                    <Icon size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* İletişim */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-base font-bold text-white mb-2">İletişim</h3>
            <div className="flex flex-col space-y-3">
              <a
                href="https://instagram.com/kampusten.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-sm text-white/80 hover:text-[#ffde59] transition-all duration-200 group"
                aria-label="Instagram"
              >
                <Instagram size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-sm text-white/70 text-center sm:text-left">
              © {new Date().getFullYear()} KAMPÜSTEN. Tüm hakları saklıdır.
            </div>
            <div className="flex items-center space-x-4 text-sm text-white/70">
              <span>YKS'ye hazırlanırken yanınızdayız</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


