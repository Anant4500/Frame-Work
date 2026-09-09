/**
 * Chat Data Schema & Constants
 * Real messages and members are queried directly from Supabase via:
 * - Table: `public.project_chat_messages`
 * - RPC: `get_project_chat_members(p_project_id bigint)`
 * - Realtime Private Broadcast: `project:<projectId>:chat`
 */

export const MOCK_CHAT_MEMBERS = []
export const MOCK_PINNED_MESSAGE = null
export const MOCK_CHAT_MESSAGES = []
