-- Migration: harden_chat_privileges
-- Forward-only security hardening for FrameWork Team Chat.
-- 1. Strips broad default privileges (TRUNCATE, UPDATE, DELETE, REFERENCES, TRIGGER) from ordinary client roles on project_chat_messages.
-- 2. Preserves authenticated SELECT and INSERT permissions required for chat participation (further gated by RLS).
-- 3. Revokes PUBLIC/anon EXECUTE privileges from chat helper functions and RPCs to eliminate unauthenticated RPC surface.
-- 4. Revokes direct EXECUTE on the broadcast trigger function from client roles (PUBLIC, anon, authenticated).
--    In PostgreSQL, trigger execution does NOT check DML-caller EXECUTE privileges at runtime;
--    revoking direct EXECUTE prevents client RPC exposure while allowing the AFTER INSERT trigger to fire normally.

-- ============================================================================
-- 1. Table Privilege Hardening: public.project_chat_messages
-- ============================================================================

-- Strip all default table permissions from unauthenticated users and PUBLIC
REVOKE ALL ON TABLE public.project_chat_messages FROM PUBLIC, anon;

-- Strip all broad default table permissions (including TRUNCATE, UPDATE, DELETE, REFERENCES, TRIGGER) from authenticated
-- Note: PostgreSQL Row-Level Security (RLS) does NOT apply to TRUNCATE. Explicitly revoking TRUNCATE is essential.
REVOKE ALL ON TABLE public.project_chat_messages FROM authenticated;

-- Explicitly grant only SELECT and INSERT to authenticated clients (content and sender access remain enforced by RLS)
GRANT SELECT, INSERT ON TABLE public.project_chat_messages TO authenticated;

-- Ensure administrative service_role retains full access
GRANT ALL ON TABLE public.project_chat_messages TO service_role;


-- ============================================================================
-- 2. Function Privilege Hardening: Chat Helpers, RPCs, and Trigger
-- ============================================================================

-- Helper: can_access_project_chat(bigint)
-- Used in RLS policies and called via RPC by authenticated clients to check room access.
REVOKE ALL ON FUNCTION public.can_access_project_chat(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_project_chat(bigint) TO authenticated, service_role;

-- Helper: can_access_project_topic(text)
-- Used in realtime.messages SELECT policy when authenticated clients subscribe to project chat channels.
REVOKE ALL ON FUNCTION public.can_access_project_topic(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_access_project_topic(text) TO authenticated, service_role;

-- RPC: get_project_chat_members(bigint)
-- Called via RPC by authenticated clients to retrieve authorized member roster.
REVOKE ALL ON FUNCTION public.get_project_chat_members(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_project_chat_members(bigint) TO authenticated, service_role;

-- Trigger Function: broadcast_project_chat_message()
-- Invoked AFTER INSERT on project_chat_messages.
-- In PostgreSQL, DML callers do NOT need direct EXECUTE privileges on the trigger function at runtime.
-- Revoking direct EXECUTE from PUBLIC, anon, and authenticated removes unnecessary client RPC exposure
-- and resolves Supabase Security Advisor linter warnings, while the table trigger continues to fire on INSERT.
REVOKE ALL ON FUNCTION public.broadcast_project_chat_message() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.broadcast_project_chat_message() TO service_role;
