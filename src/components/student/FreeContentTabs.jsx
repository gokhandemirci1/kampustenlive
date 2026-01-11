import { useState, useEffect } from 'react'
import { FileText, Video, HelpCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const FreeContentTabs = () => {
  const [activeTab, setActiveTab] = useState('notes')
  const [contents, setContents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const tabs = [
    { id: 'notes', label: 'Notlar', icon: FileText, type: 'pdf' },
    { id: 'videos', label: 'Videolar', icon: Video, type: 'video' },
    { id: 'questions', label: 'Soru Çözümü', icon: HelpCircle, type: 'question' },
  ]

  useEffect(() => {
    const fetchContents = async () => {
      try {
        setIsLoading(true)
        const contentType = activeTab === 'notes' ? 'pdf' : activeTab === 'videos' ? 'video' : 'question'
        
        const { data, error } = await supabase
          .from('contents')
          .select('*')
          .eq('is_free', true)
          .eq('is_hidden', false)
          .eq('type', contentType)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setContents(data)
      } catch (error) {
        handleApiError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContents()
  }, [activeTab])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleContentClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const activeTabData = tabs.find((tab) => tab.id === activeTab)

  return (
    <div className="bg-white rounded-lg border border-gray-200/50 p-8">
      <h2 className="text-xl font-light text-gray-900 mb-8 tracking-tight">Ücretsiz İçerikler</h2>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setIsLoading(true)
                }}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-light text-sm transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Content List */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-400 font-light">Yükleniyor...</div>
      ) : contents.length === 0 ? (
        <div className="text-center py-8 text-gray-400 font-light">
          Bu kategoride içerik bulunmuyor.
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map((content) => {
            const Icon = activeTabData?.icon || FileText
            return (
              <div
                key={content.id}
                onClick={() => handleContentClick(content.url)}
                className="flex items-start space-x-4 p-4 border border-gray-200/50 rounded-lg hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon className="text-primary-500" size={20} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-normal text-gray-900 mb-1 tracking-tight">
                    {content.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400 font-light">
                    <span>{content.category}</span>
                    <span>•</span>
                    <span>{formatDate(content.created_at)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 text-xs font-light bg-green-50 text-green-600 rounded-full">
                    Ücretsiz
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FreeContentTabs

