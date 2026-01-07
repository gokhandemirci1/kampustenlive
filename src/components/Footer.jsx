import { Link } from 'react-router-dom'
import { Instagram } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Kampusten.org. Tüm hakları saklıdır.
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            {/* Instagram */}
            <a
              href="https://instagram.com/kampusten.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-600 transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>

            {/* Privacy Policy */}
            <Link
              to="/privacy"
              className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
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


