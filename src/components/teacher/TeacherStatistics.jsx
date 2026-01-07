import { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Clock, FileText } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const TeacherStatistics = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    pendingCourses: 0,
    totalContent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      // Öğretmenin kendi derslerini getir
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('status')
        .eq('teacher_id', user.id)

      if (coursesError) throw coursesError

      // Öğretmenin kendi içeriklerini getir
      const { data: contents, error: contentsError } = await supabase
        .from('contents')
        .select('id')
        .eq('uploader_id', user.id)

      if (contentsError) throw contentsError

      // İstatistikleri hesapla
      const totalCourses = courses?.length || 0
      const publishedCourses = courses?.filter(c => c.status === 'published').length || 0
      const pendingCourses = courses?.filter(c => c.status === 'pending').length || 0
      const totalContent = contents?.length || 0

      setStats({
        totalCourses,
        publishedCourses,
        pendingCourses,
        totalContent,
      })
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-light text-gray-900 mb-6 uppercase tracking-wider">
          Hızlı İstatistikler
        </h2>
        <div className="text-center py-4 text-gray-400">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h2 className="text-sm font-light text-gray-900 mb-8 uppercase tracking-wider">
        Hızlı İstatistikler
      </h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <BookOpen size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-light">Toplam Ders</span>
          </div>
          <span className="text-xl font-light text-gray-900">
            {stats.totalCourses}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <CheckCircle size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-light">Yayında Olan</span>
          </div>
          <span className="text-xl font-light text-[#ffde59]">
            {stats.publishedCourses}
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Clock size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-light">Onay Bekleyen</span>
          </div>
          <span className="text-xl font-light text-gray-900">
            {stats.pendingCourses}
          </span>
        </div>

        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3">
            <FileText size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600 font-light">Toplam İçerik</span>
          </div>
          <span className="text-xl font-light text-gray-900">
            {stats.totalContent}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TeacherStatistics

