import { useState, useEffect } from 'react'
import { Users, GraduationCap, UserCheck, Search, Trash2, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showToast, handleApiError } from '../../utils/toast'
import StudentDetailModal from './StudentDetailModal'
import TeacherDetailModal from './TeacherDetailModal'

const UsersList = () => {
  const [activeTab, setActiveTab] = useState('students') // 'students' or 'teachers'
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false)
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [activeTab])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'students') {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            student_details(grade_level)
          `)
          .eq('role', 'student')
          .order('created_at', { ascending: false })

        if (error) throw error
        setStudents(data || [])
      } else {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            teacher_details(university, department, is_approved)
          `)
          .eq('role', 'teacher')
          .order('created_at', { ascending: false })

        if (error) throw error
        setTeachers(data || [])
      }
    } catch (error) {
      handleApiError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = activeTab === 'students'
    ? students.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.student_details?.grade_level?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teachers.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.teacher_details?.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.teacher_details?.department?.toLowerCase().includes(searchQuery.toLowerCase())
      )

  const handleDeleteUser = async (userId, userName, userType) => {
    const confirmMessage = userType === 'student'
      ? `"${userName}" adlı öğrenciyi silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve kullanıcının tüm verileri (kayıtlar, kurslar, içerikler) silinecektir.`
      : `"${userName}" adlı öğretmeni silmek istediğinize emin misiniz?\n\nBu işlem geri alınamaz ve kullanıcının tüm verileri (kayıtlar, kurslar, içerikler) silinecektir.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Profiles tablosundan sil (CASCADE ile teacher_details/student_details otomatik silinir)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      showToast.success(
        userType === 'student'
          ? 'Öğrenci başarıyla silindi!'
          : 'Öğretmen başarıyla silindi!'
      )

      // Listeyi yenile
      fetchUsers()
    } catch (error) {
      handleApiError(error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Kullanıcı Yönetimi
        </h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('students')
                setSearchQuery('')
              }}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'students'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <GraduationCap size={16} />
                <span>Öğrenciler ({students.length})</span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('teachers')
                setSearchQuery('')
              }}
              className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'teachers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserCheck size={16} />
                <span>Öğretmenler ({teachers.length})</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'students' ? 'Öğrenci ara...' : 'Öğretmen ara...'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Students List */}
      {activeTab === 'students' && (
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz öğrenci kaydı yok'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sınıf
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <GraduationCap className="text-primary-600" size={20} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {student.full_name || 'İsimsiz'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {student.student_details?.grade_level || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(student.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsStudentModalOpen(true)
                          }}
                          className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Detayları Görüntüle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(
                            student.id,
                            student.full_name || 'İsimsiz',
                            'student'
                          )}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Öğrenciyi Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Teachers List */}
      {activeTab === 'teachers' && (
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz öğretmen kaydı yok'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Üniversite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bölüm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kayıt Tarihi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <UserCheck className="text-primary-600" size={20} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.full_name || 'İsimsiz'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {teacher.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {teacher.teacher_details?.university || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {teacher.teacher_details?.department || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          teacher.teacher_details?.is_approved
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {teacher.teacher_details?.is_approved ? 'Onaylı' : 'Onay Bekliyor'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(teacher.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher)
                            setIsTeacherModalOpen(true)
                          }}
                          className="inline-flex items-center justify-center p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors duration-200"
                          title="Detayları Görüntüle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(
                            teacher.id,
                            teacher.full_name || 'İsimsiz',
                            'teacher'
                          )}
                          className="inline-flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Öğretmeni Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modals */}
      <StudentDetailModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false)
          setSelectedStudent(null)
        }}
        student={selectedStudent}
      />
      <TeacherDetailModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false)
          setSelectedTeacher(null)
        }}
        teacher={selectedTeacher}
      />
    </div>
  )
}

export default UsersList

