import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'Ayşe Yılmaz',
      role: 'Öğrenci',
      university: 'Boğaziçi Üniversitesi - Tıp',
      image: null,
      rating: 5,
      text: 'KAMPÜSTEN sayesinde YKS\'de 18.000. sıralama elde ettim. Öğretmenlerimiz gerçekten çok deneyimli ve anlayışlı. Canlı dersler çok verimli geçiyor.'
    },
    {
      name: 'Mehmet Demir',
      role: 'Öğrenci',
      university: 'ODTÜ - Bilgisayar Mühendisliği',
      image: null,
      rating: 5,
      text: 'Ücretsiz içerikler ve canlı derslerin kombinasyonu harika! Özellikle soru çözüm videoları çok faydalı oldu. Tüm öğrenci arkadaşlarıma tavsiye ediyorum.'
    },
    {
      name: 'Zeynep Kaya',
      role: 'Öğrenci',
      university: 'İTÜ - Elektrik-Elektronik Mühendisliği',
      image: null,
      rating: 5,
      text: 'Öğrenciden öğrenciye eğitim konsepti çok mantıklı. Öğretmenlerimiz bizim gibi YKS sürecinden geçtiği için hangi konularda zorlanacağımızı çok iyi biliyorlar.'
    },
    {
      name: 'Burak Şahin',
      role: 'Öğrenci',
      university: 'Koç Üniversitesi - İşletme',
      image: null,
      rating: 5,
      text: 'Fiyat performans açısından mükemmel! Diğer platformlarla karşılaştırdığımda hem daha uygun hem de daha verimli. Kesinlikle tavsiye ederim.'
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const current = testimonials[currentIndex]

  return (
    <div className="relative z-10 bg-gradient-to-br from-primary-50 via-white to-primary-50 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Öğrencilerimiz <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Ne Diyor?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Binlerce başarı hikayesinden birkaçı
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
            {/* Quote Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <Quote className="text-white" size={32} />
              </div>
            </div>

            {/* Rating */}
            <div className="flex justify-center mb-6 space-x-1">
              {[...Array(current.rating)].map((_, i) => (
                <Star key={i} className="text-[#ffde59] fill-[#ffde59]" size={24} />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-lg sm:text-xl text-gray-700 text-center mb-8 leading-relaxed italic">
              "{current.text}"
            </p>

            {/* Author Info */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mb-4">
                <span className="text-white text-xl font-bold">
                  {current.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900 text-lg">
                  {current.name}
                </div>
                <div className="text-sm text-gray-600">
                  {current.role}
                </div>
                <div className="text-sm text-primary-600 font-medium mt-1">
                  {current.university}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
            aria-label="Önceki"
          >
            <ChevronLeft className="text-gray-700" size={24} />
          </button>
          
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 border border-gray-200"
            aria-label="Sonraki"
          >
            <ChevronRight className="text-gray-700" size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-primary-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Testimonials
