# Supabase Integration Guide

## Overview

Your React RAG system is now integrated with Supabase for real database operations. This integration provides:

- **Real data persistence** instead of mock data
- **User authentication** support (keeping your existing JWT approach)
- **Profile-based data separation** with proper security
- **Scalable database architecture** ready for production

## 🗄️ Database Schema

### Tables

| Table | Purpose | Key Features |
|-------|---------|-------------|
| `users` | User profiles | Stores user data, email, avatar |
| `profiles` | AI Profiles | User-specific AI assistants with document collections |
| `system_prompts` | AI Behaviors | Global system prompts defining AI behavior |
| `documents` | File Metadata | Document tracking (no file storage, just metadata) |
| `conversations` | Chat Sessions | Profile-specific conversation threads |
| `messages` | Chat History | Individual messages with role tracking |

### Key Features

- **Row Level Security (RLS)** - Users can only access their own data
- **Profile ID separation** - Each AI profile has isolated data
- **System prompt linking** - Messages track which AI behavior was used
- **Document count tracking** - Automatic counts for UI display

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (not committed to git):

```env
VITE_SUPABASE_URL=https://fqgaitfmuoensaesdwyi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase Client

The client is configured in `src/config/supabase.js` with fallback values.

## 📝 API Services

### Profiles API (`src/services/profilesApi.js`)

```javascript
import { getProfiles, createProfile, updateProfile, deleteProfile } from './services/profilesApi'

// Get all user profiles
const profiles = await getProfiles()

// Create new profile
const newProfile = await createProfile({
  name: "Research Assistant",
  description: "Specialized in academic research..."
})

// Update profile
const updated = await updateProfile(profileId, { name: "New Name" })

// Delete profile
await deleteProfile(profileId)
```

### System Prompts API (`src/services/systemPromptsApi.js`)

```javascript
import { getSystemPrompts, createSystemPrompt, toggleSystemPromptActive } from './services/systemPromptsApi'

// Get all system prompts
const prompts = await getSystemPrompts()

// Create new prompt
const prompt = await createSystemPrompt({
  name: "Legal Advisor",
  description: "Legal document analysis",
  prompt: "You are a legal advisor..."
})

// Toggle active status
await toggleSystemPromptActive(promptId, true)
```

### Documents API (`src/services/documentsApi.js`)

```javascript
import { getDocumentsByProfile, createDocument, updateDocumentStatus } from './services/documentsApi'

// Get documents for a profile
const docs = await getDocumentsByProfile(profileId)

// Create document record (metadata only)
const doc = await createDocument(profileId, {
  filename: "report.pdf",
  fileType: "application/pdf",
  fileSize: 1024000
})

// Update processing status
await updateDocumentStatus(docId, "completed")
```

### Conversations API (`src/services/conversationsApi.js`)

```javascript
import { 
  getConversationsByProfile, 
  createConversation, 
  getMessagesByConversation,
  createMessage 
} from './services/conversationsApi'

// Get conversations for a profile
const conversations = await getConversationsByProfile(profileId)

// Create new conversation
const conv = await createConversation(profileId, "New Chat", systemPromptId)

// Get messages
const messages = await getMessagesByConversation(conversationId)

// Add message
await createMessage(conversationId, "user", "Hello AI!", systemPromptId)
```

## 🔒 Authentication Approach

### Current Implementation

**Hybrid Approach**: Keeps your existing JWT authentication while storing user data in Supabase.

```javascript
// Login flow
const handleLogin = async (credentials) => {
  // Your existing JWT logic
  const mockToken = 'your-jwt-token'
  localStorage.setItem('jwt_token', mockToken)
  
  // Ensure user exists in Supabase
  const userData = { id: 'user_1', email: credentials.email }
  await ensureUserExists(userData)
}
```

### Why This Approach?

✅ **Pros:**
- Keep existing UX and login flow
- Users don't need to change anything
- Easy migration path to full Supabase Auth later
- Store real user data in database

❌ **Cons:**
- Manual user management
- No built-in auth features (password reset, etc.)

### Alternative: Full Supabase Auth

If you want to switch to Supabase Auth later:

```javascript
// Example migration to Supabase Auth
import { supabase } from './config/supabase'

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

## 🚀 Key Integration Points

### 1. Login Dashboard (`src/pages/login-dashboard/index.jsx`)

- ✅ **Replaced:** Mock profiles with real database calls
- ✅ **Added:** User creation in Supabase on login
- ✅ **Enhanced:** Real CRUD operations for profiles

### 2. System Prompts (`src/pages/system-prompts/index.jsx`)

- ✅ **Replaced:** Mock system prompts with database
- ✅ **Added:** Real-time active/inactive toggling
- ✅ **Enhanced:** Persistent storage of AI behaviors

### 3. Security & Data Isolation

- ✅ **Profile-based security:** Users can only access their own profiles
- ✅ **RLS policies:** Database-level security enforcement
- ✅ **Data validation:** Proper foreign key relationships

## 📋 Usage Examples

### Creating a Profile with Documents

```javascript
// 1. Create profile
const profile = await createProfile({
  name: "Legal Research Assistant",
  description: "Specialized in legal document analysis"
})

// 2. Add documents (metadata only)
const doc = await createDocument(profile.id, {
  filename: "contract.pdf",
  fileType: "application/pdf", 
  fileSize: 2048000
})

// 3. Start conversation
const conversation = await createConversation(
  profile.id, 
  "Contract Analysis", 
  legalSystemPromptId
)

// 4. Add messages
await createMessage(conversation.id, "user", "Analyze this contract")
await createMessage(conversation.id, "assistant", "Based on the contract...")
```

## 🔧 Development Workflow

### 1. Database Changes

If you need to modify the schema:

```bash
# Use Supabase dashboard or SQL editor
# The schema is already optimized for your use case
```

### 2. API Services

Add new functions to service files as needed:

```javascript
// In profilesApi.js
export const getProfileByName = async (name) => {
  // Implementation
}
```

### 3. Type Safety

Use the generated TypeScript types:

```typescript
import { Database } from './types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
```

## 🎯 Next Steps

### Immediate

1. **Test the integration** - Login and create profiles
2. **Verify data persistence** - Check Supabase dashboard
3. **Update other components** - Document upload, chat interface

### Backend Integration

When ready for backend:

1. **API Endpoints** - Create backend that reads from same database
2. **Document Processing** - Update document status after processing
3. **Vector Storage** - ChromaDB integration using profile IDs
4. **Real-time Features** - Supabase subscriptions for live updates

### Production Readiness

1. **Environment Variables** - Move to production Supabase project
2. **RLS Policies** - Review and enhance security policies
3. **Performance** - Add indexes for large datasets
4. **Monitoring** - Set up Supabase analytics

## 🐛 Troubleshooting

### Common Issues

**1. "User not authenticated" errors**
- Check if `localStorage.getItem('jwt_token')` returns a value
- Ensure `ensureUserExists()` was called after login

**2. "Profile not found" errors**
- Verify profile ID is correct
- Check if user owns the profile (RLS policies)

**3. Database connection issues**
- Verify environment variables
- Check Supabase project status
- Confirm anon key permissions

### Debug Mode

Enable console logging in services for debugging:

```javascript
// In any service file
console.log('API call:', { profileId, userData })
```

## 📊 Database Monitoring

### Supabase Dashboard

Monitor your integration:

1. **Tables** - View data directly
2. **API** - Monitor request volume
3. **Logs** - Debug issues
4. **Performance** - Query optimization

### Key Metrics to Watch

- User registration rate
- Profile creation patterns
- Document upload volume
- Conversation activity
- System prompt usage

---

Your RAG system is now fully integrated with Supabase! 🎉

The integration maintains your existing user experience while providing a robust, scalable backend foundation for your AI-powered document processing system. 