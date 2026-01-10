import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = [
    {
      question: 'KAMPÜSTEN nedir ve nasıl çalışır?',
      answer: 'KAMPÜSTEN, YKS\'ye hazırlanan öğrenciler için öğrenciden öğrenciye özel ders platformudur. YKS\'de başarılı olmuş öğretmenlerimizle canlı dersler alabilir, ücretsiz içeriklere erişebilir ve hedefinize ulaşabilirsiniz.'
    },
    {
      question: 'Ders ücretleri nasıl belirleniyor?',
      answer: 'Ders ücretleri yönetimiz tarafından belirlenir ve ders saatine göre hesaplanır. Fiyatlar öğretmenin deneyimi ve YKS başarısına göre değişiklik göstermez.'
    },
    {
      question: 'Canlı dersler nasıl yapılıyor?',
      answer: 'Canlı derslerimiz platform üzerindeki video konferans sistemi ile yapılır. Öğretmeninizle anlık etkileşim kurabilir, sorularınızı sorabilir ve interaktif bir öğrenme deneyimi yaşayabilirsiniz. Tüm dersler kaydedilir ve sonradan tekrar izleyebilirsiniz.'
    },
    {
      question: 'Ücretsiz içeriklere nasıl erişebilirim?',
      answer: 'Ücretsiz içeriklere erişmek için sadece bir hesap oluşturmanız yeterlidir. Hesabınızı oluşturduktan sonra PDF\'ler, video dersler ve soru çözümleri gibi tüm ücretsiz içeriklere sınırsız erişim sağlayabilirsiniz.'
    },
    {
      question: 'Ödeme güvenli mi?',
      answer: 'Evet, tüm ödemeler şifrelenmiş bağlantılarla ve güvenli ödeme sistemleri üzerinden yapılır. Kredi kartı bilgileriniz asla saklanmaz ve tüm işlemler banka seviyesinde güvenlik ile korunur.'
    },
    {
      question: 'Dersi kaçırırsam ne olur?',
      answer: 'Öğrenci destek hattıızdan ve mobil uygulamamızdan ders saati gelmeden bilgi alırsınız. Kaçırırsanız panelinizde kaydolduğunuz dersin ders kaydı mevcuttur. Ayrıca uygulama üzerinden sorunuz olursa eğitmeninize iletebilirsiniz'}
  ]

  return (
    <div className="relative z-10 bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Sık Sorulan <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Sorular</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Merak ettiklerinizin cevapları
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="text-primary-600 flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5 pt-0">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
