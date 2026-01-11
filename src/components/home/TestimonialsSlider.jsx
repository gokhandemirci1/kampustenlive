import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const TestimonialsSlider = () => {
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // İsimsiz öğrenci yorumları
  const testimonials = [
    {
      id: 1,
      text: "Matematik netlerimi 5 ayda 30'a çıkardım. Eğitmenin anlattığı taktikler gerçekten işe yarıyor. Artık soruları daha hızlı çözebiliyorum.",
      subject: "Matematik"
    },
    {
      id: 2,
      text: "Organik kimyayı hiç anlamıyordum, ama burada adım adım öğrendim. Şimdi denemelerde organik kimyadan full yapıyorum!",
      subject: "Kimya"
    },
    {
      id: 3,
      text: "Fizik derslerinde özellikle mekanik konusunda çok yardımcı oldular. Öğretmenin çizdiği şemalar ve açıklamaları çok net.",
      subject: "Fizik"
    },
    {
      id: 4,
      text: "Edebiyat konularını ezberlemek yerine anlamaya dayalı öğrendim. Sınavda çok işime yaradı. Özellikle metin analizi kısmı çok güçlendi.",
      subject: "Edebiyat"
    },
    {
      id: 5,
      text: "Biyoloji konularını görselleştirerek anlatmaları çok etkili oldu. Özellikle hücre bölünmesi konusunu artık çok iyi biliyorum.",
      subject: "Biyoloji"
    },
    {
      id: 6,
      text: "Tarih derslerinde kronolojik sırayı takip ederek öğrenmek çok daha kolay oldu. Artık olayları birbirine bağlayabiliyorum.",
      subject: "Tarih"
    },
    {
      id: 7,
      text: "Coğrafya haritalarını ezberlemek yerine mantığını öğrendim. Şimdi soruları mantık yürüterek çözebiliyorum.",
      subject: "Coğrafya"
    },
    {
      id: 8,
      text: "Geometri sorularını çözerken kullandıkları kısa yollar gerçekten zaman kazandırıyor. Sınavda çok yardımcı oldu.",
      subject: "Geometri"
    }
  ]

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftButton(scrollLeft > 0)
      setShowRightButton(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      return () => container.removeEventListener('scroll', checkScrollButtons)
    }
  }, [])

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      {/* Scroll Buttons */}
      {showLeftButton && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-strong backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-gray-900"
          aria-label="Önceki yorumlar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {showRightButton && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full glass-strong backdrop-blur-xl bg-white/80 border border-gray-200/50 shadow-lg hover:bg-white/90 transition-all duration-200 flex items-center justify-center text-gray-700 hover:text-gray-900"
          aria-label="Sonraki yorumlar"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        id="testimonials-slider"
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 px-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="flex-shrink-0 w-96 glass rounded-2xl p-8 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/50 backdrop-blur-sm"
          >
            {/* Quote Icon */}
            <div className="mb-4">
              <Quote className="w-8 h-8 text-gray-400" />
            </div>

            {/* Testimonial Text */}
            <p className="text-gray-700 mb-6 font-light leading-relaxed text-base">
              "{testimonial.text}"
            </p>

            {/* Subject Badge */}
            <div className="flex items-center justify-between">
              <span className="px-4 py-2 bg-gradient-to-r from-[#E0F7FA]/50 to-[#E1BEE7]/50 rounded-full text-sm font-light text-gray-700 border border-white/50">
                {testimonial.subject}
              </span>
              <span className="text-xs text-gray-500 font-light">
                Öğrenci Yorumu
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialsSlider
