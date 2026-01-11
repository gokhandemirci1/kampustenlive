import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LiveCoursesGrid from '../components/student/LiveCoursesGrid'
import FreeContentTabs from '../components/student/FreeContentTabs'
import MyEnrolledCourses from '../components/student/MyEnrolledCourses'
import CartWidget from '../components/student/CartWidget'
import { getCurrentUser, getUserProfile, supabase } from '../lib/supabase'
import { showToast } from '../utils/toast'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState([])

  // Sepet localStorage'dan yükle
  useEffect(() => {
    const savedCart = localStorage.getItem('student_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // Sepet değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('student_cart', JSON.stringify(cart))
  }, [cart])


  const handleAddToCart = async (course) => {
    try {
      // Zaten sepette var mı kontrol et
      if (cart.some(item => item.id === course.id)) {
        showToast.info('Bu kamp zaten sepetinizde')
        return
      }

      // Öğrencinin bu kursa zaten kayıtlı olup olmadığını kontrol et
      const user = await getCurrentUser()
      if (user) {
        const { data: enrollment, error } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', course.id)
          .maybeSingle()

        if (error) throw error

        if (enrollment) {
          showToast.error('Bu kampa zaten kayıtlısınız!')
          return
        }
      }

      // Kayıtlı değilse sepete ekle
      setCart([...cart, course])
      showToast.success('Kamp sepete eklendi')
    } catch (error) {
      console.error('Error checking enrollment:', error)
      showToast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const handleRemoveFromCart = (courseId) => {
    setCart(cart.filter(item => item.id !== courseId))
    showToast.success('Kamp sepetten çıkarıldı')
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          navigate('/login/student')
          return
        }

        // Check if user is a student
        const profile = await getUserProfile(user.id)
        if (profile.role !== 'student' && profile.role !== 'admin') {
          navigate('/login/student')
          return
        }
      } catch (error) {
        console.error('Auth check error:', error)
        navigate('/login/student')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-3 tracking-tight">
            Öğrenci Paneli
          </h1>
          <p className="text-gray-500 text-base font-light">
            Kampüsten uygulamasını telefonuza indirerek anlık bilgi alın ve öğrenmeye devam edin
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="space-y-6">
          {/* My Enrolled Courses */}
          <MyEnrolledCourses />

          {/* Live Courses */}
          <LiveCoursesGrid 
            onAddToCart={handleAddToCart}
          />

          {/* Free Content */}
          <FreeContentTabs />
        </div>
      </div>

      {/* Cart Widget */}
      <CartWidget 
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onCartUpdate={setCart}
      />

      {/* Footer */}
      <footer className="relative py-20 overflow-hidden mt-12">
        {/* Gradient Background - Güven Veren Tonlar */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E0F7FA]/30 via-[#E1BEE7]/20 to-[#FFCCBC]/25"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)' }}>
            Sen yaparsın,<br />
            <span className="bg-gradient-to-r from-[#1a73e8] via-[#8e24aa] to-[#e91e63] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(255,255,255,0.9)]" style={{ textShadow: '0 2px 8px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.6)' }}>
              biz destekleriz.
            </span>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default StudentDashboard
