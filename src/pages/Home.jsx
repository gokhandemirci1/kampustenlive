import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Users, ArrowRight } from 'lucide-react'

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full text-sm font-medium text-primary-700 mb-6">
              <GraduationCap size={16} />
              <span>Öğrenciden Öğrenciye Özel Ders</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              YKS'ye Hazırlanırken
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                Yanınızdayız
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Deneyimli öğretmenlerle özel ders alın, hedefinize ulaşın.
              <br />
              <span className="text-primary-600 font-medium">
                Öğrenciden öğrenciye, samimi ve etkili eğitim.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                to="/register/student"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span>Hemen Başla</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/register/teacher"
                className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 border-2 border-primary-200 rounded-lg font-semibold hover:bg-primary-50 transition-all duration-200"
              >
                <Users size={20} />
                <span>Öğretmen Ol</span>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
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
    </div>
  )
}

export default Home
