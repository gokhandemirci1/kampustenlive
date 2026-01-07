import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables!\n' +
    'Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.\n' +
    'You can copy .env.example to .env and fill in your values.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'kampusten-org',
    },
  },
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Helper function to get user profile
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle() // single() yerine maybeSingle() kullan (null dönebilir)

    if (error) {
      console.error('getUserProfile error:', error)
      throw error
    }
    
    // Eğer profile yoksa, oluştur
    if (!data && userId) {
      // Profile yoksa, varsayılan bir profile oluştur
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          role: 'student',
          full_name: '',
        })
        .select()
        .single()
      
      if (insertError) {
        console.error('createProfile error:', insertError)
        throw insertError
      }
      
      return newProfile
    }
    
    return data
  } catch (error) {
    console.error('getUserProfile error:', error)
    throw error
  }
}

// Helper function to check if user is admin
export const checkIsAdmin = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const profile = await getUserProfile(user.id)
    return profile?.role === 'admin'
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Helper function to check if user is teacher
export const checkIsTeacher = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return false

    const profile = await getUserProfile(user.id)
    return profile?.role === 'teacher'
  } catch (error) {
    console.error('Error checking teacher status:', error)
    return false
  }
}

// Helper function to check if teacher is approved
export const checkTeacherApproval = async (teacherId) => {
  try {
    const { data, error } = await supabase
      .from('teacher_details')
      .select('is_approved')
      .eq('id', teacherId)
      .single()

    if (error) throw error
    return data?.is_approved || false
  } catch (error) {
    console.error('Error checking teacher approval:', error)
    return false
  }
}

export default supabase

