import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { supabase, getCurrentUser } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const WeeklySchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [enrolledCourses, setEnrolledCourses] = useState([])

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            *,
            courses!inner(*)
          `)
          .eq('student_id', user.id)

        if (error) throw error
        if (data) setEnrolledCourses(data)
      } catch (error) {
        handleApiError(error)
      }
    }

    fetchEnrolledCourses()
  }, [])

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday
    startOfWeek.setDate(diff)

    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      days.push(date)
    }
    return days
  }

  const getDayName = (date) => {
    return date.toLocaleDateString('tr-TR', { weekday: 'long' })
  }

  const getDayNumber = (date) => {
    return date.getDate()
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
  }

  const parseSchedule = (scheduleText) => {
    if (!scheduleText) return { day: '', time: '', startDate: null, endDate: null }
    
    // Format: "Başlangıç: YYYY-MM-DD HH:MM | Bitiş: YYYY-MM-DD HH:MM | Ek bilgi"
    // veya: "Pazartesi 18:00-20:00"
    const parts = scheduleText.split('|').map(p => p.trim())
    let day = ''
    let time = ''
    let startDate = null
    let endDate = null

    parts.forEach(part => {
      if (part.startsWith('Başlangıç:')) {
        const dateTimeStr = part.replace('Başlangıç:', '').trim()
        const [date, timeStr] = dateTimeStr.split(' ')
        if (date) {
          startDate = date
          if (timeStr) time = timeStr
        }
      } else if (part.startsWith('Bitiş:')) {
        const dateTimeStr = part.replace('Bitiş:', '').trim()
        const [date] = dateTimeStr.split(' ')
        if (date) endDate = date
      } else if (part && !part.startsWith('Başlangıç:') && !part.startsWith('Bitiş:')) {
        // Eski format: "Pazartesi 18:00-20:00"
        const words = part.split(' ')
        if (words.length >= 2) {
          day = words[0]
          time = words.slice(1).join(' ')
        }
      }
    })

    return { day, time, startDate, endDate }
  }

  const getCoursesForDay = (dayName, date) => {
    return enrolledCourses.filter((enrollment) => {
      if (!enrollment.course || !enrollment.course.schedule_text) return false
      
      const schedule = parseSchedule(enrollment.course.schedule_text)
      
      // Tarih bazlı kontrol (eğer başlangıç tarihi varsa)
      if (schedule.startDate) {
        try {
          // YYYY-MM-DD formatını parse et
          const [year, month, day] = schedule.startDate.split('-')
          const courseStartDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
          courseStartDate.setHours(0, 0, 0, 0)
          
          const currentDate = new Date(date)
          currentDate.setHours(0, 0, 0, 0)
          
          let courseEndDate = null
          if (schedule.endDate) {
            const [endYear, endMonth, endDay] = schedule.endDate.split('-')
            courseEndDate = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay))
            courseEndDate.setHours(0, 0, 0, 0)
          }
          
          // Tarih bu hafta içindeyse göster
          if (currentDate >= courseStartDate && (!courseEndDate || currentDate <= courseEndDate)) {
            return true
          }
        } catch (error) {
          console.error('Date parsing error:', error)
        }
      }
      
      // Gün adı bazlı kontrol (eski format)
      if (schedule.day) {
        return schedule.day.toLowerCase() === dayName.toLowerCase()
      }
      
      return false
    })
  }

  const weekDays = getWeekDays()
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="text-primary-500" size={24} />
          <span>Haftalık Program</span>
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Bugün
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-600 font-medium">
        {getMonthName(currentWeek)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => {
          const dayName = dayNames[index]
          const dayNumber = getDayNumber(date)
          const isToday =
            date.toDateString() === new Date().toDateString()
          const coursesForDay = getCoursesForDay(dayName, date)

          return (
            <div
              key={index}
              className={`border rounded-lg p-3 min-h-[120px] ${
                isToday
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div
                className={`text-sm font-semibold mb-2 ${
                  isToday ? 'text-primary-600' : 'text-gray-700'
                }`}
              >
                {dayName}
              </div>
              <div
                className={`text-lg font-bold mb-2 ${
                  isToday ? 'text-primary-600' : 'text-gray-900'
                }`}
              >
                {dayNumber}
              </div>
              <div className="space-y-1">
                {coursesForDay.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded truncate"
                    title={enrollment.course.title}
                  >
                    {enrollment.course.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {enrolledCourses.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Henüz kayıt olduğunuz ders bulunmuyor.
        </div>
      )}
    </div>
  )
}

export default WeeklySchedule

