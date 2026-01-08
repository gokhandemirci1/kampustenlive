import { useState } from 'react'
import { ShoppingBag, X, Check, Trash2 } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'

const CartWidget = ({ cart, onRemoveFromCart, onCartUpdate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price || 0), 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast.error('Sepetiniz boş')
      return
    }

    setIsProcessing(true)
    try {
      const user = await getCurrentUser()
      if (!user) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      // Tüm kampları kaydet
      const enrollments = cart.map(course => ({
        student_id: user.id,
        course_id: course.id,
      }))

      const { error } = await supabase
        .from('enrollments')
        .insert(enrollments)

      if (error) {
        // Duplicate key hatası varsa, sadece yeni olanları ekle
        if (error.message?.includes('duplicate key')) {
          // Zaten kayıtlı olanları filtrele ve sadece yeni olanları ekle
          const existingEnrollments = await supabase
            .from('enrollments')
            .select('course_id')
            .eq('student_id', user.id)
            .in('course_id', cart.map(c => c.id))

          if (existingEnrollments.data) {
            const existingIds = existingEnrollments.data.map(e => e.course_id)
            const newEnrollments = enrollments.filter(
              e => !existingIds.includes(e.course_id)
            )

            if (newEnrollments.length > 0) {
              const { error: insertError } = await supabase
                .from('enrollments')
                .insert(newEnrollments)

              if (insertError) throw insertError
            }
          }
        } else {
          throw error
        }
      }

      showToast.success(`${cart.length} kampa başarıyla kayıt oldunuz!`)
      
      // Sepeti temizle
      onCartUpdate([])
      setIsOpen(false)
      
      // Takvimi yenilemek için event dispatch
      window.dispatchEvent(new CustomEvent('cart-checkout-success'))
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Sepet İkonu */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#ffde59] text-gray-900 rounded-full shadow-lg hover:bg-[#ffd700] transition-all duration-200 flex items-center justify-center z-40"
      >
        <ShoppingBag size={24} />
        {cart.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {cart.length}
          </span>
        )}
      </button>

      {/* Sepet Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
              <h2 className="text-lg font-light text-gray-900 tracking-tight">
                Sepet ({cart.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-light">Sepetiniz boş</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-start space-x-4 p-4 border border-gray-200"
                      >
                        {course.image_url && (
                          <div className="w-20 h-20 flex-shrink-0 overflow-hidden bg-gray-100">
                            <img
                              src={course.image_url}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-normal text-gray-900 mb-1 tracking-tight">{course.title}</h3>
                          <p className="text-sm text-gray-400 font-light line-clamp-1">
                            {course.teacher_name}
                          </p>
                          <p className="text-sm font-light text-gray-900 mt-2">
                            {formatCurrency(course.price)}
                          </p>
                        </div>
                        <button
                          onClick={() => onRemoveFromCart(course.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200/50 pt-6">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-sm font-light text-gray-500 tracking-tight">
                        Toplam
                      </span>
                      <span className="text-xl font-light text-gray-900">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={isProcessing}
                      className="w-full px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200 font-light text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={18} />
                      <span>{isProcessing ? 'İşleniyor...' : 'Onayla ve Kayıt Ol'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CartWidget

