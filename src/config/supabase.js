import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fqgaitfmuoensaesdwyi.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZ2FpdGZtdW9lbnNhZXNkd3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NTU4NzAsImV4cCI6MjA2NDQzMTg3MH0.HKVjNvyzohgX3jq4R2VPlWyVyL2vKrTGDDz7BE7zLgQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Use the existing user ID from database for consistency
const DEMO_USER_ID = '35d79892-6471-411c-9264-5f7551076819';

// Generate a simple UUID v4 (fallback only)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Get or create a consistent user ID for this session
const getUserId = () => {
  // Always return the existing demo user ID to maintain profile ownership
  return DEMO_USER_ID;
}

// Helper function to get current user from JWT token
export const getCurrentUser = () => {
  const token = localStorage.getItem('jwt_token')
  if (!token) return null
  
  try {
    // For demo purposes, use the existing user ID that owns the profiles
    return {
      id: getUserId(), // Uses the existing database user ID
      email: 'demo@ragSystem.com' // This matches the database user
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

// Helper function to ensure user exists in database
export const ensureUserExists = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userData.id)
      .single()

    if (error && error.code === 'PGRST116') {
      // User doesn't exist, create them
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: userData.id,
          email: userData.email,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return null
      }
      return newUser
    } else if (error) {
      console.error('Error checking user existence:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error ensuring user exists:', error)
    return null
  }
} 