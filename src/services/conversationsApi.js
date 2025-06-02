import { supabase, getCurrentUser } from '../config/supabase'

// Get all conversations for a specific profile
export const getConversationsByProfile = async (profileId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!inner(id, user_id),
        system_prompts(id, name)
      `)
      .eq('profile_id', profileId)
      .eq('profiles.user_id', user.id) // Ensure user can only access their own profile's conversations
      .order('updated_at', { ascending: false })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(conv => ({
      id: conv.id,
      title: conv.title,
      profileId: conv.profile_id,
      systemPromptId: conv.system_prompt_id,
      systemPromptName: conv.system_prompts?.name || 'Unknown',
      createdAt: conv.created_at,
      updatedAt: conv.updated_at
    }))
  } catch (error) {
    console.error('Error fetching conversations:', error)
    throw error
  }
}

// Create a new conversation
export const createConversation = async (profileId, title = 'New Conversation', systemPromptId = null) => {
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
      .from('conversations')
      .insert([{
        profile_id: profileId,
        title: title,
        system_prompt_id: systemPromptId,
        user_id: user.id, // Add user_id for conversations
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        system_prompts(id, name)
      `)
      .single()

    if (error) throw error

    // Transform data to match frontend expectations
    return {
      id: data.id,
      title: data.title,
      profileId: data.profile_id,
      systemPromptId: data.system_prompt_id,
      systemPromptName: data.system_prompts?.name || 'Unknown',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error creating conversation:', error)
    throw error
  }
}

// Update conversation title
export const updateConversationTitle = async (conversationId, title) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .update({
        title: title,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select(`
        *,
        profiles!inner(user_id),
        system_prompts(id, name)
      `)
      .eq('profiles.user_id', user.id) // Ensure user can only update their own conversations
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      profileId: data.profile_id,
      systemPromptId: data.system_prompt_id,
      systemPromptName: data.system_prompts?.name || 'Unknown',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error updating conversation title:', error)
    throw error
  }
}

// Delete a conversation and all its messages
export const deleteConversation = async (conversationId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // Verify ownership before deletion
    const { data: convCheck, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        profiles!inner(user_id)
      `)
      .eq('id', conversationId)
      .eq('profiles.user_id', user.id)
      .single()

    if (convError) throw new Error('Conversation not found or access denied')

    // Delete all messages first (due to foreign key constraint)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId)

    if (messagesError) throw messagesError

    // Then delete the conversation
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)

    if (error) throw error
    
    return true
  } catch (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

// Get messages for a conversation
export const getMessagesByConversation = async (conversationId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First verify the user owns this conversation
    const { data: convCheck, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        profiles!inner(user_id)
      `)
      .eq('id', conversationId)
      .eq('profiles.user_id', user.id)
      .single()

    if (convError) throw new Error('Conversation not found or access denied')

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    
    // Transform data to match frontend expectations
    return data.map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      role: msg.role, // 'user' or 'assistant'
      content: msg.content,
      systemPromptId: msg.system_prompt_id,
      createdAt: msg.created_at
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw error
  }
}

// Add a message to a conversation
export const createMessage = async (conversationId, role, content, systemPromptId = null) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    // First verify the user owns this conversation
    const { data: convCheck, error: convError } = await supabase
      .from('conversations')
      .select(`
        id,
        profile_id,
        profiles!inner(user_id)
      `)
      .eq('id', conversationId)
      .eq('profiles.user_id', user.id)
      .single()

    if (convError) throw new Error('Conversation not found or access denied')

    const { data, error } = await supabase
      .from('messages')
      .insert([{
        conversation_id: conversationId,
        profile_id: convCheck.profile_id, // Add profile_id for messages
        user_id: user.id, // Add user_id for messages
        role: role,
        content: content,
        system_prompt_id: systemPromptId,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Transform data to match frontend expectations
    return {
      id: data.id,
      conversationId: data.conversation_id,
      role: data.role,
      content: data.content,
      systemPromptId: data.system_prompt_id,
      createdAt: data.created_at
    }
  } catch (error) {
    console.error('Error creating message:', error)
    throw error
  }
}

// Get a single conversation with its details
export const getConversation = async (conversationId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        profiles!inner(id, name, user_id),
        system_prompts(id, name, prompt_content)
      `)
      .eq('id', conversationId)
      .eq('profiles.user_id', user.id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      profileId: data.profile_id,
      profileName: data.profiles.name,
      systemPromptId: data.system_prompt_id,
      systemPromptName: data.system_prompts?.name || 'Unknown',
      systemPromptContent: data.system_prompts?.prompt_content || '', // Fixed field mapping
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error fetching conversation:', error)
    throw error
  }
}

// Update conversation's system prompt
export const updateConversationSystemPrompt = async (conversationId, systemPromptId) => {
  try {
    const user = getCurrentUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .update({
        system_prompt_id: systemPromptId,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select(`
        *,
        profiles!inner(user_id),
        system_prompts(id, name)
      `)
      .eq('profiles.user_id', user.id)
      .single()

    if (error) throw error

    return {
      id: data.id,
      title: data.title,
      profileId: data.profile_id,
      systemPromptId: data.system_prompt_id,
      systemPromptName: data.system_prompts?.name || 'Unknown',
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
  } catch (error) {
    console.error('Error updating conversation system prompt:', error)
    throw error
  }
} 