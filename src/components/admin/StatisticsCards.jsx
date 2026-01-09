import { useState, useEffect } from 'react'
import { Users, GraduationCap, BookOpen, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const StatisticsCards = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    activeCourses: 0,
    pendingApprovals: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setIsLoading(true)
    try {
      // Toplam Öğrenci sayısı
      const { count: studentsCount, error: studentsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student')

      if (studentsError) throw studentsError

      // Toplam Öğretmen sayısı
      const { count: teachersCount, error: teachersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'teacher')

      if (teachersError) throw teachersError

      // Aktif Kurslar (published)
      const { count: coursesCount, error: coursesError } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')

      if (coursesError) throw coursesError

      // Onay Bekleyen Öğretmenler
      const { count: pendingCount, error: pendingError } = await supabase
        .from('teacher_details')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)

      if (pendingError) throw pendingError

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        activeCourses: coursesCount || 0,
        pendingApprovals: pendingCount || 0,
      })

      // Son Aktiviteler
      await fetchRecentActivities()
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const activities = []

      // Son kayıt olan öğretmen
      const { data: recentTeacher, error: teacherError } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!teacherError && recentTeacher && recentTeacher.length > 0) {
        activities.push({
          type: 'teacher_registered',
          message: `Yeni öğretmen kaydı: ${recentTeacher[0].full_name || 'İsimsiz'}`,
          time: recentTeacher[0].created_at,
        })
      }

      // Son onaylanan kurs
      const { data: recentCourse, error: courseError } = await supabase
        .from('courses')
        .select('title, updated_at, status')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)

      if (!courseError && recentCourse && recentCourse.length > 0) {
        activities.push({
          type: 'course_approved',
          message: `Kurs onaylandı: ${recentCourse[0].title}`,
          time: recentCourse[0].updated_at,
        })
      }

      // Son yüklenen içerik
      const { data: recentContent, error: contentError } = await supabase
        .from('contents')
        .select('title, created_at')
        .order('created_at', { ascending: false })
        .limit(1)

      if (!contentError && recentContent && recentContent.length > 0) {
        activities.push({
          type: 'content_uploaded',
          message: `Yeni içerik yüklendi: ${recentContent[0].title}`,
          time: recentContent[0].created_at,
        })
      }

      // Zaman sırasına göre sırala (en yeni önce)
      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivities(activities.slice(0, 3)) // En son 3 aktivite
    } catch (error) {
      console.error('Error fetching recent activities:', error)
    }
  }

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Bilinmiyor'
    
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) {
      return 'Az önce'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} dakika önce`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} saat önce`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} gün önce`
    } else {
      return new Date(dateString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hızlı İstatistikler
          </h2>
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Son Aktiviteler
          </h2>
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-6">
          Hızlı İstatistikler
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl hover:from-primary-100 hover:to-primary-200/50 transition-all duration-200 hover:scale-[1.02] border border-primary-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <GraduationCap className="text-primary-600" size={20} />
              </div>
              <span className="text-gray-700 font-medium">Toplam Öğrenci</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalStudents)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl hover:from-purple-100 hover:to-purple-200/50 transition-all duration-200 hover:scale-[1.02] border border-purple-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={20} />
              </div>
              <span className="text-gray-700 font-medium">Toplam Öğretmen</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.totalTeachers)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl hover:from-green-100 hover:to-green-200/50 transition-all duration-200 hover:scale-[1.02] border border-green-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BookOpen className="text-green-600" size={20} />
              </div>
              <span className="text-gray-700 font-medium">Aktif Kurslar</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(stats.activeCourses)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl hover:from-yellow-100 hover:to-yellow-200/50 transition-all duration-200 hover:scale-[1.02] border border-yellow-200/50">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={20} />
              </div>
              <span className="text-gray-700 font-medium">Onay Bekleyen</span>
            </div>
            <span className="text-2xl font-bold text-primary-600">
              {formatNumber(stats.pendingApprovals)}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
          Son Aktiviteler
        </h2>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Henüz aktivite yok
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-primary-50 hover:to-primary-100/50 transition-all duration-200 border border-gray-200/50">
                <p className="text-gray-900 font-medium">{activity.message}</p>
                <p className="text-gray-500 text-sm mt-1">
                  {formatTimeAgo(activity.time)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatisticsCards

