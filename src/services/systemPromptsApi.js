import { supabase } from '../config/supabase'

// Get all system prompts (these are global, not user-specific)
export const getSystemPrompts = async () => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt_content,
      createdAt: new Date(prompt.created_at),
      updatedAt: new Date(prompt.updated_at),
      isActive: prompt.is_active
    }))
  } catch (error) {
    console.error('Error fetching system prompts:', error)
    throw error
  }
}

// Create a new system prompt
export const createSystemPrompt = async (promptData) => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .insert([{
        name: promptData.name,
        description: promptData.description,
        prompt_content: promptData.prompt,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      prompt: data.prompt_content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error creating system prompt:', error)
    throw error
  }
}

// Update an existing system prompt
export const updateSystemPrompt = async (promptId, promptData) => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .update({
        name: promptData.name,
        description: promptData.description,
        prompt_content: promptData.prompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      prompt: data.prompt_content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error updating system prompt:', error)
    throw error
  }
}

// Delete a system prompt
export const deleteSystemPrompt = async (promptId) => {
  try {
    const { error } = await supabase
      .from('system_prompts')
      .delete()
      .eq('id', promptId)

    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting system prompt:', error)
    throw error
  }
}

// Toggle system prompt active status
export const toggleSystemPromptActive = async (promptId, isActive) => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      prompt: data.prompt_content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error toggling system prompt active status:', error)
    throw error
  }
}

// Get a single system prompt by ID
export const getSystemPrompt = async (promptId) => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('id', promptId)
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      prompt: data.prompt_content,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      isActive: data.is_active
    }
  } catch (error) {
    console.error('Error fetching system prompt:', error)
    throw error
  }
}

// Get active system prompts only
export const getActiveSystemPrompts = async () => {
  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(prompt => ({
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      prompt: prompt.prompt_content,
      createdAt: new Date(prompt.created_at),
      updatedAt: new Date(prompt.updated_at),
      isActive: prompt.is_active
    }))
  } catch (error) {
    console.error('Error fetching active system prompts:', error)
    throw error
  }
} 