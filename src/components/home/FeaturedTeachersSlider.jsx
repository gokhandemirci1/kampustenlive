import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, GraduationCap, Award, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { handleApiError } from '../../utils/toast'

const FeaturedTeachersSlider = () => {
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    fetchApprovedTeachers()
  }, [])

  const fetchApprovedTeachers = async () => {
    setIsLoading(true)
    try {
      // Onaylı öğretmenleri çek - university, department ve profil bilgileriyle
      // Public olarak okuyabilmek için profiles RLS politikası gerekiyor
      const { data, error } = await supabase
        .from('teacher_details')
        .select(`
          id,
          university,
          department,
          yks_rank,
          is_approved,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('is_approved', true)
        .limit(10)

      console.log('Teachers query result:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data && data.length > 0) {
        const teachersData = data
          .filter(teacher => teacher.profiles !== null) // profiles null olanları filtrele
          .map(teacher => ({
            id: teacher.id,
            name: teacher.profiles?.full_name || 'İsimsiz Öğretmen',
            university: teacher.university || '',
            department: teacher.department || '',
            avatar_url: teacher.profiles?.avatar_url || null,
            yks_rank: teacher.yks_rank || null
          }))
        console.log('Processed teachers data:', teachersData)
        setTeachers(teachersData)
      } else {
        console.log('No approved teachers found')
        setTeachers([])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      // handleApiError hatayı toast olarak gösterebilir, sessizce geçelim
      // handleApiError(error)
      setTeachers([])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollLeft = () => {
    const container = document.getElementById('teachers-slider')
    if (container) {
      container.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('teachers-slider')
    if (container) {
      container.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center py-12 text-gray-500">Eğitmenler yükleniyor...</div>
      </div>
    )
  }

  // Eğer öğretmen yoksa, bölümü gösterme ama null döndürme (debug için mesaj göster)
  if (teachers.length === 0) {
    console.log('No teachers to display')
    return null
  }

  console.log('Rendering teachers slider with', teachers.length, 'teachers')

  return (
    <div id="teachers" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Eğitmenlerimiz
        </h2>
        <p className="text-base sm:text-lg text-gray-600">
          Deneyimli ve başarılı öğretmenlerimizle tanışın
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 border border-gray-200 hidden sm:flex items-center justify-center"
          aria-label="Önceki"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 hover:scale-110 border border-gray-200 hidden sm:flex items-center justify-center"
          aria-label="Sonraki"
        >
          <ChevronRight size={24} className="text-gray-700" />
        </button>

        {/* Teachers Cards */}
        <div
          id="teachers-slider"
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 px-1 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex-shrink-0 w-[280px] sm:w-[300px] bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 group"
            >
              {/* Teacher Avatar Section */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                {teacher.avatar_url ? (
                  <img
                    src={teacher.avatar_url}
                    alt={teacher.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                    <User size={64} className="text-primary-400" />
                  </div>
                )}
                {/* YKS Badge - Belirgin şekilde */}
                {teacher.yks_rank && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-[#ffde59] to-[#ffd700] text-black px-3 py-1.5 rounded-full shadow-lg border-2 border-black/20 z-10">
                    <div className="flex items-center space-x-1">
                      <Award size={16} className="font-bold" />
                      <span className="text-xs font-bold">YKS #{teacher.yks_rank.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Teacher Info Section */}
              <div className="p-5 space-y-3">
                {/* Name */}
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {teacher.name}
                </h3>

                {/* University & Department */}
                <div className="space-y-1.5">
                  <div className="flex items-start space-x-2">
                    <GraduationCap size={18} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {teacher.university}
                      </p>
                      {teacher.department && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          {teacher.department}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* YKS Rank Highlight */}
                {teacher.yks_rank && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 font-medium">YKS Sıralaması</span>
                      <span className="text-lg font-bold text-primary-600">
                        #{teacher.yks_rank.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator (Mobile) */}
        <div className="sm:hidden flex justify-center mt-4 space-x-2">
          <div className="h-1 w-12 bg-primary-200 rounded-full"></div>
          <div className="text-xs text-gray-500">Kaydırarak devam edin →</div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedTeachersSlider
