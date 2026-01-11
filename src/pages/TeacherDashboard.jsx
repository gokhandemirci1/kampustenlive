import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { supabase, getCurrentUser, checkTeacherApproval } from '../lib/supabase'
import CourseRequestModal from '../components/teacher/CourseRequestModal'
import ContentUploadForm from '../components/teacher/ContentUploadForm'
import MyCoursesList from '../components/teacher/MyCoursesList'
import TeacherStatistics from '../components/teacher/TeacherStatistics'

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const [isApproved, setIsApproved] = useState(null) // null = loading, true/false = loaded
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  useEffect(() => {
    const checkApprovalStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          navigate('/login/teacher')
          return
        }

        const approved = await checkTeacherApproval(user.id)
        setIsApproved(approved)
      } catch (error) {
        console.error('Onay durumu kontrol edilirken hata:', error)
        setIsApproved(false)
      }
    }

    checkApprovalStatus()
  }, [navigate])

  const handleCourseSubmit = (courseData) => {
    console.log('Yeni ders talebi:', courseData)
    // İstatistikleri yenile
    setStatsRefreshKey(prev => prev + 1)
  }

  const handleContentUpload = () => {
    // İstatistikleri yenile
    setStatsRefreshKey(prev => prev + 1)
  }

  if (isApproved === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-yellow-900 mb-2">
                  Hesabınız Onay Sürecindedir
                </h2>
                <p className="text-yellow-800">
                  Hesabınız yönetici tarafından onaylandıktan sonra tüm özelliklere
                  erişebileceksiniz. Onay süreci genellikle 1-2 iş günü sürmektedir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            Öğretmen Paneli
          </h1>
          <p className="text-gray-500">Derslerinizi yönetin ve içerik paylaşın</p>
        </div>

        {/* Action Button */}
        <div className="mb-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-[#ffde59] text-gray-900 rounded-sm hover:bg-[#ffd700] transition-colors duration-200 font-medium text-sm tracking-wide"
          >
            Canlı Ders Talep Et
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Content Upload Form */}
          <div>
            <ContentUploadForm onSuccess={handleContentUpload} />
          </div>

          {/* Quick Stats */}
          <TeacherStatistics key={statsRefreshKey} />
        </div>

        {/* My Courses List */}
        <MyCoursesList />

        {/* Course Request Modal */}
        <CourseRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCourseSubmit}
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
    </div>
  )
}

export default TeacherDashboard
