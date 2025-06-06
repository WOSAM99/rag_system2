import { supabase, getCurrentUser } from '../config/supabase'
import { deleteCollection } from './backendApi'

// Get all profiles for the current user
export const getProfiles = async () => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      documentCount: profile.document_count || 0,
      createdAt: profile.created_at.split('T')[0], // Format as YYYY-MM-DD
      lastUsed: profile.last_used ? profile.last_used.split('T')[0] : profile.created_at.split('T')[0]
    }))
  } catch (error) {
    console.error('Error fetching profiles:', error)
    throw error
  }
}

// Create a new profile
export const createProfile = async (profileData) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Verify user exists in database first
    const { data: userCheck, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User verification failed:', userError)
      throw new Error('User not found in database. Please log out and log in again.')
    }

    console.log('User verified, creating profile...') // Debug log

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        user_id: user.id,
        name: profileData.name,
        description: profileData.description,
        document_count: 0,
        created_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Profile creation error:', error)
      throw error
    }

    console.log('Profile created successfully in database:', data) // Debug log

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      documentCount: data.document_count || 0,
      createdAt: data.created_at.split('T')[0],
      lastUsed: data.last_used.split('T')[0]
    }
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

// Update an existing profile
export const updateProfile = async (profileId, profileData) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name: profileData.name,
        description: profileData.description,
        last_used: new Date().toISOString()
      })
      .eq('id', profileId)
      .eq('user_id', user.id) // Ensure user can only update their own profiles
      .select()
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      documentCount: data.document_count || 0,
      createdAt: data.created_at.split('T')[0],
      lastUsed: data.last_used.split('T')[0]
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

// Delete a profile
export const deleteProfile = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First, delete the ChromaDB collection
    try {
      await deleteCollection(profileId)
      console.log('Successfully deleted ChromaDB collection')
    } catch (error) {
      console.error('Error deleting ChromaDB collection:', error)
      // Continue with profile deletion even if collection deletion fails
      // as the collection might not exist or other non-critical errors
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', user.id) // Ensure user can only delete their own profiles

    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting profile:', error)
    throw error
  }
}

// Get a single profile by ID
export const getProfile = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      documentCount: data.document_count || 0,
      createdAt: data.created_at.split('T')[0],
      lastUsed: data.last_used.split('T')[0]
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    throw error
  }
}

// Update profile's last used timestamp
export const updateProfileLastUsed = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('profiles')
      .update({ last_used: new Date().toISOString() })
      .eq('id', profileId)
      .eq('user_id', user.id)

    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error updating profile last used:', error)
    throw error
  }
} 