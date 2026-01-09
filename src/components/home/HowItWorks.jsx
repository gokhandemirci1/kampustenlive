import { useState, useEffect, useRef } from 'react'
import { UserPlus, Search, Calendar, GraduationCap, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState([])
  const stepRefs = useRef([])
  const steps = [
    {
      icon: UserPlus,
      title: 'Hesap Oluştur',
      description: 'Ücretsiz hesabınızı oluşturun ve profilinizi tamamlayın',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Search,
      title: 'Öğretmen Seç',
      description: 'Alanında uzman öğretmenlerimizden size en uygun olanı seçin',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Calendar,
      title: 'Ders Planla',
      description: 'Öğretmeninizle birlikte uygun ders saatlerini belirleyin',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: GraduationCap,
      title: 'Başarıya Ulaş',
      description: 'Canlı dersler ve ücretsiz içeriklerle hedefinize ulaşın',
      color: 'from-primary-500 to-primary-600'
    }
  ]

  useEffect(() => {
    const observers = []

    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setTimeout(() => {
                  setVisibleSteps((prev) => {
                    if (!prev.includes(index)) {
                      return [...prev, index]
                    }
                    return prev
                  })
                }, index * 150) // Staggered animation: 150ms delay per step
              }
            })
          },
          {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
          }
        )

        observer.observe(ref)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  return (
    <div className="relative z-10 bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Nasıl <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Çalışır?</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Sadece 4 adımda YKS'ye hazırlanmaya başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isVisible = visibleSteps.includes(index)
            return (
              <div
                key={index}
                ref={(el) => (stepRefs.current[index] = el)}
                className="relative group"
              >
                {/* Step Number */}
                <div
                  className={`absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10 transition-all duration-700 ${
                    isVisible
                      ? 'animate-step-number-in scale-100 rotate-0 opacity-100'
                      : 'scale-0 rotate-180 opacity-0'
                  }`}
                >
                  {index + 1}
                </div>

                {/* Card */}
                <div
                  className={`bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 sm:p-8 h-full transform transition-all duration-700 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/20 ${
                    isVisible
                      ? 'animate-step-card-in opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} mb-6 shadow-lg transition-all duration-700 group-hover:scale-110 ${
                      isVisible ? 'animate-step-icon-in scale-100' : 'scale-0'
                    }`}
                  >
                    <Icon className="text-white" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector Arrow */}
                {index < steps.length - 1 && (
                  <div
                    className={`hidden lg:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary-500 to-transparent z-0 transition-all duration-1000 ${
                      isVisible && visibleSteps.includes(index + 1)
                        ? 'animate-arrow-draw opacity-100'
                        : 'opacity-0'
                    }`}
                  >
                    <ArrowRight
                      className={`absolute -right-2 -top-2 text-primary-500 transition-all duration-1000 ${
                        isVisible && visibleSteps.includes(index + 1)
                          ? 'animate-arrow-slide opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-4'
                      }`}
                      size={16}
                      strokeWidth={2}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <Link
            to="/register/student"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
          >
            <span>Hemen Başla</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
