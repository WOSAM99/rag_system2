import { BACKEND_CONFIG, buildUrl, getHeaders } from '../config/backend'
import { getCurrentUser } from '../config/supabase'
import * as jose from 'jose'

// Helper function to get JWT token from localStorage
const getAuthToken = async () => {
  const user = getCurrentUser()
  if (!user) {
    console.warn('No user found')
    return null
  }

  // Create a new token with the correct signature
  const secret = new TextEncoder().encode('123456') // This should match the backend's JWT_SECRET_KEY
  const payload = {
    user_id: user.id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }

  try {
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secret)
    return token
  } catch (error) {
    console.error('Error generating JWT token:', error)
    return null
  }
}

// Helper function to get headers with authentication
const getAuthHeaders = async (contentType = 'application/json') => {
  const headers = getHeaders(contentType)
  const token = await getAuthToken()
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else {
    throw new Error('No authentication token found. Please log in again.')
  }
  
  return headers
}

// Upload document to FastAPI backend for processing
export const uploadDocumentToBackend = async (file, profileId, onProgress = null) => {
  try {
    console.log(`Uploading document to backend: ${file.name} for profile: ${profileId}`)
    
    const token = await getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('profileID', profileId) // Backend expects 'profileID'
    
    console.log('Upload form data - Profile ID:', profileId)
    
    const xhr = new XMLHttpRequest()
    
    return new Promise((resolve, reject) => {
      // Handle upload progress if callback provided
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100
            onProgress(percentComplete)
          }
        })
      }
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log('Document upload successful:', response)
            resolve(response)
          } catch (error) {
            console.error('Error parsing upload response:', error)
            reject(new Error('Invalid response format from server'))
          }
        } else {
          console.error('Upload failed with status:', xhr.status)
          let errorMessage = 'Upload failed'
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            errorMessage = errorResponse.detail || errorResponse.message || errorMessage
          } catch (e) {
            // Use default error message if can't parse response
          }
          
          // Handle authentication errors specifically
          if (xhr.status === 401 || xhr.status === 403) {
            errorMessage = 'Authentication failed. Please log in again.'
          }
          
          reject(new Error(errorMessage))
        }
      })
      
      xhr.addEventListener('error', () => {
        console.error('Network error during upload')
        reject(new Error('Network error occurred during upload'))
      })
      
      xhr.addEventListener('timeout', () => {
        console.error('Upload timeout')
        reject(new Error('Upload timed out'))
      })
      
      xhr.timeout = BACKEND_CONFIG.TIMEOUTS.UPLOAD
      xhr.open('POST', buildUrl(BACKEND_CONFIG.ENDPOINTS.UPLOAD_DOCUMENT))
      
      // Set authorization header AFTER opening the request
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      
      xhr.send(formData)
    })
    
  } catch (error) {
    console.error('Error in uploadDocumentToBackend:', error)
    throw error
  }
}

// Query the RAG pipeline for chat responses
export const queryRagPipeline = async (query, profileId, systemPrompt, kRetrieval = 3, retrieverFilter = null) => {
  try {
    console.log(`Querying RAG pipeline: "${query}" for profile: ${profileId}`)
    
    const token = await getAuthToken()
    if (!token) {
      throw new Error('No authentication token found. Please log in again.')
    }

    // Match exactly what the backend ChatRequest model expects
    const requestBody = {
      query: query,
      profile_id: profileId,
      k_retrieval: kRetrieval,
      system_prompt: systemPrompt || null,
      retriever_filter: retrieverFilter || null
    }
    
    console.log('Request body:', requestBody)
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(buildUrl(BACKEND_CONFIG.ENDPOINTS.CHAT_QUERY), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      let errorMessage = `Chat query failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.detail || errorMessage
      } catch (e) {
        // Use default error message if can't parse response
      }
      
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.'
      }
      
      throw new Error(errorMessage)
    }
    
    const result = await response.json()
    console.log('RAG query successful:', result)
    return result.result // Extract the actual response data from the result wrapper
    
  } catch (error) {
    console.error('Error in queryRagPipeline:', error)
    throw error
  }
}

// Delete a collection from ChromaDB
export const deleteCollection = async (profileId) => {
  try {
    console.log(`Deleting collection for profile: ${profileId}`)
    
    const requestBody = {
      collection_name: profileId // Backend expects 'collection_name'
    }
    
    console.log('Delete collection request body:', requestBody)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.TIMEOUTS.DEFAULT)
    
    const headers = await getAuthHeaders('application/json')
    const response = await fetch(buildUrl(BACKEND_CONFIG.ENDPOINTS.DELETE_COLLECTION), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      let errorMessage = `Collection deletion failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        // Use default error message if can't parse response
      }
      
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.'
      }
      
      throw new Error(errorMessage)
    }
    
    const result = await response.json()
    console.log('Collection deletion successful:', result)
    
    return result
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Collection deletion timeout')
      throw new Error('Collection deletion timed out')
    }
    console.error('Error in deleteCollection:', error)
    throw error
  }
}

// Delete a file from a ChromaDB collection
export const deleteFileFromCollection = async ({ collection_name, file_id }) => {
  try {
    console.log(`Deleting file ${file_id} from collection: ${collection_name}`)
    
    const requestBody = {
      collection_name,
      file_id
    }
    
    console.log('Delete file request body:', requestBody)
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), BACKEND_CONFIG.TIMEOUTS.DEFAULT)
    
    const headers = await getAuthHeaders('application/json')
    const response = await fetch(buildUrl(BACKEND_CONFIG.ENDPOINTS.DELETE_FILE), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      let errorMessage = `File deletion failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
      } catch (e) {
        // Use default error message if can't parse response
      }
      
      // Handle authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication failed. Please log in again.'
      }
      
      throw new Error(errorMessage)
    }
    
    const result = await response.json()
    console.log('File deletion successful:', result)
    
    return result
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('File deletion timeout')
      throw new Error('File deletion timed out')
    }
    console.error('Error in deleteFileFromCollection:', error)
    throw error
  }
}

// Health check to verify backend connectivity
export const checkBackendHealth = async () => {
  try {
    // Simple connectivity test without authentication
    console.log('Checking backend connectivity...')
    const response = await fetch(buildUrl('/'), {
      method: 'GET',
      timeout: 5000
    })
    
    return response.status < 500 // Any non-server error is considered healthy
    
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
} 