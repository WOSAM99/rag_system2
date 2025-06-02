import { supabase, getCurrentUser } from '../config/supabase'

// Get all documents for a specific profile
export const getDocumentsByProfile = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles!inner(id, user_id)
      `)
      .eq('profile_id', profileId)
      .eq('profiles.user_id', user.id) // Ensure user can only access their own profile's documents
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(doc => ({
      id: doc.id,
      filename: doc.file_name,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      processingStatus: doc.processing_status,
      createdAt: doc.created_at,
      updatedAt: doc.created_at,
      profileId: doc.profile_id
    }))
  } catch (error) {
    console.error('Error fetching documents:', error)
    throw error
  }
}

// Create a new document record (metadata only)
export const createDocument = async (profileId, documentData) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First verify the profile belongs to the user
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError) throw new Error('Profile not found or access denied')

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        profile_id: profileId,
        user_id: user.id,
        file_name: documentData.filename,
        file_type: documentData.fileType,
        file_size: documentData.fileSize,
        processing_status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Update profile document count
    await updateProfileDocumentCount(profileId)

    // Transform data to match frontend expectations
    return {
      id: data.id,
      filename: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      processingStatus: data.processing_status,
      createdAt: data.created_at,
      updatedAt: data.created_at,
      profileId: data.profile_id
    }
  } catch (error) {
    console.error('Error creating document:', error)
    throw error
  }
}

// Update document processing status
export const updateDocumentStatus = async (documentId, status) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .update({
        processing_status: status,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', documentId)
      .select(`
        *,
        profiles!inner(user_id)
      `)
      .eq('profiles.user_id', user.id) // Ensure user can only update their own documents
      .single()

    if (error) throw error

    return {
      id: data.id,
      filename: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      processingStatus: data.processing_status,
      createdAt: data.created_at,
      updatedAt: data.processed_at || data.created_at,
      profileId: data.profile_id
    }
  } catch (error) {
    console.error('Error updating document status:', error)
    throw error
  }
}

// Delete a document
export const deleteDocument = async (documentId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Get the document to find its profile ID before deleting
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select(`
        profile_id,
        profiles!inner(user_id)
      `)
      .eq('id', documentId)
      .eq('profiles.user_id', user.id)
      .single()

    if (docError) throw new Error('Document not found or access denied')

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (error) throw error

    // Update profile document count
    await updateProfileDocumentCount(docData.profile_id)
    
    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    throw error
  }
}

// Get document by ID
export const getDocument = async (documentId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        profiles!inner(user_id)
      `)
      .eq('id', documentId)
      .eq('profiles.user_id', user.id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      filename: data.file_name,
      fileType: data.file_type,
      fileSize: data.file_size,
      processingStatus: data.processing_status,
      createdAt: data.created_at,
      updatedAt: data.processed_at || data.created_at,
      profileId: data.profile_id
    }
  } catch (error) {
    console.error('Error fetching document:', error)
    throw error
  }
}

// Helper function to update profile document count
const updateProfileDocumentCount = async (profileId) => {
  try {
    // Count documents for this profile
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)

    if (countError) throw countError

    // Update the profile's document count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ document_count: count })
      .eq('id', profileId)

    if (updateError) throw updateError
  } catch (error) {
    console.error('Error updating profile document count:', error)
    // Don't throw here as it's a secondary operation
  }
}

// Get document count for a profile
export const getDocumentCount = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First verify the profile belongs to the user
    const { data: profileCheck, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (profileError) throw new Error('Profile not found or access denied')

    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', profileId)

    if (error) throw error
    
    return count || 0
  } catch (error) {
    console.error('Error getting document count:', error)
    return 0
  }
} 