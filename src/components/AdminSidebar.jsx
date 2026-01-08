import { Link } from 'react-router-dom'
import { Home, LogOut } from 'lucide-react'

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 min-h-screen fixed left-0 top-0 shadow-xl">
      {/* Logo Header */}
      <div className="h-16 border-b border-gray-200/50 flex items-center justify-center px-4 bg-gradient-to-r from-primary-50/50 to-white">
        <Link to="/" className="flex items-center space-x-2 group">
          <img 
            src="/images/logo.svg" 
            alt="Kampusten.org Logo" 
            className="h-8 w-8 transition-transform duration-200 group-hover:scale-105"
          />
          <div className="text-lg font-bold text-primary-600">
            KAMPÜSTEN
          </div>
        </Link>
      </div>
      
      <div className="p-4 space-y-2 pt-4">
        <Link
          to="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100/50 hover:text-primary-600 transition-all duration-200 group"
        >
          <Home size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-medium">Ana Sayfa</span>
        </Link>
        
        <div className="pt-8 border-t border-gray-200/50 mt-8">
          <button className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100/50 hover:text-red-600 transition-all duration-200 w-full group">
            <LogOut size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar

