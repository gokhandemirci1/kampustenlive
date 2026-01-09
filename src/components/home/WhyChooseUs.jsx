import { CheckCircle2, Award, Clock, HeadphonesIcon, Shield, TrendingUp } from 'lucide-react'

const WhyChooseUs = () => {
  const features = [
    {
      icon: Award,
      title: 'Uzman Öğretmenler',
      description: 'YKS\'de ilk 5000\'e girmiş, üniversitelerin en iyi bölümlerinden mezun öğretmenler',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Clock,
      title: 'Esnek Ders Programı',
      description: 'Size en uygun saatlerde canlı dersler, istediğiniz zaman ücretsiz içeriklere erişim',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: HeadphonesIcon,
      title: '7/24 Destek',
      description: 'Her zaman yanınızdayız! Sorularınız için anında destek alın',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Shield,
      title: 'Güvenli Platform',
      description: 'Ödeme bilgileriniz güvende, tüm işlemler şifrelenmiş bağlantılarla yapılır',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      title: 'Kanıtlanmış Başarı',
      description: 'Öğrencilerimizin %92\'si hedeflediği üniversiteye yerleşti',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: CheckCircle2,
      title: 'Para İade Garantisi',
      description: 'İlk dersinizden memnun kalmazsanız %100 para iade garantisi',
      color: 'from-primary-500 to-primary-600'
    }
  ]

  return (
    <div className="relative z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 sm:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Neden <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffde59] to-[#ffd700]">KAMPÜSTEN?</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Binlerce öğrencinin tercih etmesinin sebepleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ffde59]/20 group"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WhyChooseUs
