import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black via-black/90 to-[#ffde59] border-t border-gray-200/50 mt-auto shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start space-y-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/images/logo.jpg" 
                alt="Kampusten.org Logo" 
                className="h-12 w-12 rounded-full object-cover shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg border-2 border-white/50"
              />
              <div className="text-lg font-bold text-white">
                KAMPÜSTEN
              </div>
            </Link>
            <div className="text-sm text-white/70 text-center md:text-left">
              © {new Date().getFullYear()} KAMPÜSTEN. Tüm hakları saklıdır.
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            {/* Instagram */}
            <a
              href="https://instagram.com/kampusten.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-[#ffde59] transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>

            {/* Privacy Policy */}
            <Link
              to="/privacy"
              className="text-sm text-white/80 hover:text-[#ffde59] transition-colors duration-200"
            >
              Gizlilik Politikası
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer


