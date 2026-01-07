import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const FinancialSummary = () => {
  const [financialData, setFinancialData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    recentTransactions: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    setIsLoading(true)
    try {
      // Tüm enrollments'ları kurs fiyatlarıyla birlikte çek
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses!inner(
            id,
            title,
            price
          ),
          profiles!enrollments_student_id_fkey(
            full_name
          )
        `)
        .order('enrolled_at', { ascending: false })

      if (enrollmentsError) throw enrollmentsError

      if (enrollments && enrollments.length > 0) {
        // Toplam ciro hesapla
        const totalRevenue = enrollments.reduce((sum, enrollment) => {
          const price = parseFloat(enrollment.courses?.price || 0)
          return sum + price
        }, 0)

        // Aylık ciro hesapla (bu ay)
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthlyEnrollments = enrollments.filter((enrollment) => {
          const enrolledDate = new Date(enrollment.enrolled_at)
          return enrolledDate >= startOfMonth
        })
        const monthlyRevenue = monthlyEnrollments.reduce((sum, enrollment) => {
          const price = parseFloat(enrollment.courses?.price || 0)
          return sum + price
        }, 0)

        // Son işlemler (en son 10 kayıt)
        const recentTransactions = enrollments.slice(0, 10).map((enrollment) => ({
          id: `${enrollment.student_id}-${enrollment.course_id}`,
          student: enrollment.profiles?.full_name || 'İsimsiz',
          course: enrollment.courses?.title || 'Bilinmeyen Kurs',
          amount: parseFloat(enrollment.courses?.price || 0),
          date: enrollment.enrolled_at,
          status: 'completed', // Enrollments zaten tamamlanmış sayılır
        }))

        setFinancialData({
          totalRevenue,
          monthlyRevenue,
          totalTransactions: enrollments.length,
          recentTransactions,
        })
      } else {
        setFinancialData({
          totalRevenue: 0,
          monthlyRevenue: 0,
          totalTransactions: 0,
          recentTransactions: [],
        })
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  }

  // Aylık artış yüzdesini hesapla (basit bir hesaplama)
  const calculateMonthlyGrowth = () => {
    if (financialData.totalRevenue === 0) return 0
    const percentage = (financialData.monthlyRevenue / financialData.totalRevenue) * 100
    return percentage.toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Toplam Ciro</h3>
            <DollarSign className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialData.totalRevenue)}
          </p>
          {financialData.totalRevenue > 0 && (
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp size={16} />
              <span className="ml-1">
                {calculateMonthlyGrowth()}% bu ay
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Aylık Ciro</h3>
            <CreditCard className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(financialData.monthlyRevenue)}
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>{getCurrentMonthName()}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Toplam İşlem</h3>
            <ArrowUpRight className="text-primary-500" size={20} />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {financialData.totalTransactions.toLocaleString('tr-TR')}
          </p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>Tüm zamanlar</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Son İşlemler
        </h2>
        {financialData.recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz işlem bulunmuyor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Öğrenci
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Kurs
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Tutar
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Tarih
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-600">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody>
                {financialData.recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {transaction.student}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {transaction.course}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {transaction.status === 'completed'
                          ? 'Tamamlandı'
                          : 'Beklemede'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancialSummary

