import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import { supabase } from './lib/supabase'

// Component to handle Supabase auth hash fragments
const AuthHandler = () => {
  const location = useLocation()

  useEffect(() => {
    // Check if URL has hash fragment (Supabase auth tokens or errors)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')
      const error = hashParams.get('error')
      const errorCode = hashParams.get('error_code')
      const errorDescription = hashParams.get('error_description')

      console.log('AuthHandler - Hash params:', { 
        hasAccessToken: !!accessToken, 
        type, 
        error, 
        errorCode,
        errorDescription 
      })

      // If there's an error in the hash, handle it
      if (error) {
        console.error('Auth error in URL hash:', { error, errorCode, errorDescription })
        
        // If it's a password recovery error and we're on the home page, redirect to forgot password
        if (location.pathname === '/' && (errorCode === 'otp_expired' || error === 'access_denied')) {
          // Try to extract type from error description or use default
          // For now, redirect to student forgot password as default
          const resetPasswordMatch = errorDescription?.match(/reset-password\/(student|teacher)/)
          const userType = resetPasswordMatch ? resetPasswordMatch[1] : 'student'
          
          console.log('Redirecting to forgot password:', userType)
          window.location.href = `/forgot-password/${userType}?error=expired`
          return
        }
      }

      // If it's a password recovery token, let Supabase handle it
      if (accessToken && type === 'recovery') {
        console.log('Password recovery token detected in URL hash')
        // Supabase will automatically handle this with detectSessionInUrl: true
        supabase.auth.getSession().then(({ data, error }) => {
          console.log('Session after hash processing:', { hasSession: !!data.session, error })
        })
      }
    }
  }, [location])

  return null
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <AuthHandler />
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

