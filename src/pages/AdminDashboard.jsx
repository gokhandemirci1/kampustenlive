import { useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import PendingTeachersList from '../components/admin/PendingTeachersList'
import PendingCoursesList from '../components/admin/PendingCoursesList'
import FinancialSummary from '../components/admin/FinancialSummary'
import ContentManagement from '../components/admin/ContentManagement'
import CreateContentModal from '../components/admin/CreateContentModal'
import CreateCampModal from '../components/admin/CreateCampModal'
import UsersList from '../components/admin/UsersList'
import CampsList from '../components/admin/CampsList'
import StatisticsCards from '../components/admin/StatisticsCards'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isContentModalOpen, setIsContentModalOpen] = useState(false)
  const [isCampModalOpen, setIsCampModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [statsRefreshKey, setStatsRefreshKey] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <AdminSidebar />
      
      <div className="ml-64 pt-16">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-primary-400/5 to-transparent rounded-2xl blur-3xl"></div>
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-2">
                Yönetici Paneli
              </h1>
              <p className="text-gray-600 text-lg">
                Sistem yönetimi ve istatistikler
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-sm p-2">
            <nav className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'overview', label: 'Genel Bakış' },
                { id: 'teachers', label: 'Öğretmenler' },
                { id: 'course-requests', label: 'Ders Talepleri' },
                { id: 'users', label: 'Kullanıcılar' },
                { id: 'contents', label: 'İçerik Yönetimi' },
                { id: 'camps', label: 'Ders Kampları' },
                { id: 'financial', label: 'Finansal Özet' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <PendingTeachersList 
                  onTeacherApproved={() => setStatsRefreshKey(prev => prev + 1)} 
                />
                <PendingCoursesList 
                  onCourseApproved={() => {
                    setStatsRefreshKey(prev => prev + 1)
                    setRefreshKey(prev => prev + 1)
                  }} 
                />
                <StatisticsCards key={statsRefreshKey} />
              </div>
            )}

            {activeTab === 'teachers' && <PendingTeachersList />}

            {activeTab === 'course-requests' && (
              <PendingCoursesList 
                onCourseApproved={() => {
                  setStatsRefreshKey(prev => prev + 1)
                  setRefreshKey(prev => prev + 1)
                }} 
              />
            )}

            {activeTab === 'users' && <UsersList />}

            {activeTab === 'contents' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsContentModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 font-medium"
                  >
                    <span className="text-xl">+</span>
                    <span>Yeni İçerik Oluştur</span>
                  </button>
                </div>
                <ContentManagement key={refreshKey} />
              </div>
            )}

            {activeTab === 'camps' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsCampModalOpen(true)}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 font-medium"
                  >
                    <span className="text-xl">+</span>
                    <span>Yeni Ders Kampı Oluştur</span>
                  </button>
                </div>
                <CampsList key={refreshKey} />
              </div>
            )}

            {activeTab === 'financial' && <FinancialSummary />}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateContentModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onSuccess={() => {
          setIsContentModalOpen(false)
          setRefreshKey(prev => prev + 1)
          setStatsRefreshKey(prev => prev + 1)
        }}
      />
      <CreateCampModal
        isOpen={isCampModalOpen}
        onClose={() => setIsCampModalOpen(false)}
        onSuccess={() => {
          setIsCampModalOpen(false)
          setRefreshKey(prev => prev + 1)
          setStatsRefreshKey(prev => prev + 1)
        }}
      />
    </div>
  )
}

export default AdminDashboard
