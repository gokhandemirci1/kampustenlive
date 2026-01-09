import { useState, useEffect, useRef } from 'react'
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react'

const StatsCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            animateCount()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasAnimated])

  const animateCount = () => {
    const startTime = Date.now()
    const startValue = 0
    const endValue = end

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = Math.floor(startValue + (endValue - startValue) * eased)
      setCount(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: 1250,
      suffix: '+',
      label: 'Aktif Öğrenci',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: GraduationCap,
      value: 85,
      suffix: '+',
      label: 'Uzman Öğretmen',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: BookOpen,
      value: 500,
      suffix: '+',
      label: 'Canlı Ders',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      value: 92,
      suffix: '%',
      label: 'Başarı Oranı',
      color: 'from-primary-500 to-primary-600'
    }
  ]

  return (
    <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Rakamlarla <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffde59] to-[#ffd700]">KAMPÜSTEN</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Binlerce öğrencinin tercih ettiği platform
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ffde59]/20"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} mb-4 shadow-lg`}>
                  <Icon className="text-white" size={32} />
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                  <StatsCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm sm:text-base text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StatsSection
