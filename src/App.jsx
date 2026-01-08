import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LiveClass from './pages/LiveClass'

// Component to handle Supabase auth hash fragments
const HashHandler = () => {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check if URL has hash fragment with password recovery token
    if (window.location.hash && location.pathname === '/') {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      const error = hashParams.get('error')

      console.log('HashHandler - Hash detected:', { 
        hasAccessToken: !!accessToken, 
        type, 
        error,
        pathname: location.pathname 
      })

      // If it's a password recovery token, extract type from current URL or hash
      if (accessToken && type === 'recovery') {
        // Try to get type from URL search params or hash, default to 'student'
        const urlParams = new URLSearchParams(window.location.search)
        const userType = urlParams.get('type') || hashParams.get('user_type') || 'student'
        
        console.log('Password recovery token detected, redirecting to:', `/reset-password/${userType}`)
        // Hash fragment'i koruyarak yönlendir
        navigate(`/reset-password/${userType}${window.location.hash}`, { replace: true })
      } else if (error) {
        // If there's an error, try to extract type and redirect to forgot password
        console.log('Auth error detected in hash:', error)
        const urlParams = new URLSearchParams(window.location.search)
        const userType = urlParams.get('type') || 'student'
        navigate(`/forgot-password/${userType}`, { replace: true })
      }
    }
  }, [location, navigate])

  return null
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <HashHandler />
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login/:type" element={<Login />} />
            <Route path="/register/:type" element={<Register />} />
            <Route path="/forgot-password/:type" element={<ForgotPassword />} />
            <Route path="/reset-password/:type" element={<ResetPassword />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/live/:courseId" element={<LiveClass />} />
            <Route path="/live/:courseId/:sessionId" element={<LiveClass />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  )
}

export default App

