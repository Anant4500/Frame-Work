-- Migration: create_project_chat_and_realtime_broadcast
-- Creates project_chat_messages table, security definer membership functions,
-- RLS policies, real member roster RPC, and realtime broadcast trigger for Team Chat.

-- 1. Security Definer Helper: check if caller is project owner or accepted collaborator
CREATE OR REPLACE FUNCTION public.can_access_project_chat(p_project_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT (
    auth.uid() IS NOT NULL
    AND (
      -- 1. Project Owner / Creator
      EXISTS (
        SELECT 1
        FROM public.projects p
        WHERE p.id = p_project_id
          AND p.creator_id = auth.uid()
      )
      OR
      -- 2. Currently Accepted Collaborator
      EXISTS (
        SELECT 1
        FROM public.applications a
        WHERE a.project_id = p_project_id
          AND a.applicant_id = auth.uid()
          AND UPPER(a.status) = 'ACCEPTED'
      )
    )
  );
$$;

-- 2. Security Definer Helper: parse 'project:<projectId>:chat' topic and authorize
CREATE OR REPLACE FUNCTION public.can_access_project_topic(p_topic text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_parts text[];
  v_project_id bigint;
BEGIN
  IF p_topic IS NULL THEN
    RETURN false;
  END IF;

  -- Format expected: project:<projectId>:chat
  v_parts := string_to_array(p_topic, ':');
  IF array_length(v_parts, 1) != 3 OR v_parts[1] != 'project' OR v_parts[3] != 'chat' THEN
    RETURN false;
  END IF;

  BEGIN
    v_project_id := v_parts[2]::bigint;
  EXCEPTION WHEN OTHERS THEN
    RETURN false;
  END;

  RETURN public.can_access_project_chat(v_project_id);
END;
$$;

-- 3. Database Message Storage Table
CREATE TABLE IF NOT EXISTS public.project_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id bigint NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_chat_messages_body_check 
    CHECK (char_length(trim(body)) >= 1 AND char_length(trim(body)) <= 2000)
);

-- Index for ordering message history by project_id and created_at
CREATE INDEX IF NOT EXISTS idx_project_chat_messages_history 
  ON public.project_chat_messages (project_id, created_at DESC, id DESC);

-- Enable RLS
ALTER TABLE public.project_chat_messages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies on project_chat_messages
DROP POLICY IF EXISTS "authorized_crew_can_select_messages" ON public.project_chat_messages;
CREATE POLICY "authorized_crew_can_select_messages"
  ON public.project_chat_messages
  FOR SELECT
  TO authenticated
  USING (public.can_access_project_chat(project_id));

DROP POLICY IF EXISTS "authorized_crew_can_insert_messages" ON public.project_chat_messages;
CREATE POLICY "authorized_crew_can_insert_messages"
  ON public.project_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_access_project_chat(project_id)
  );

-- Note: No UPDATE or DELETE policies are granted to authenticated clients, preventing message tampering.

-- 5. Authorized Member Roster RPC (returns only allowed display fields)
CREATE OR REPLACE FUNCTION public.get_project_chat_members(p_project_id bigint)
RETURNS TABLE (
  id uuid,
  name text,
  avatar text,
  is_creator boolean,
  roles text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  -- Authorization check: only owner or accepted collaborators can get the roster
  IF NOT public.can_access_project_chat(p_project_id) THEN
    RETURN;
  END IF;

  RETURN QUERY
  WITH raw_roster AS (
    -- 1. Project Creator
    SELECT 
      p.creator_id AS member_id,
      COALESCE(prof.name, 'Project Creator') AS member_name,
      prof.profile_photo_url AS member_avatar,
      true AS member_is_creator,
      'Creator'::text AS member_role
    FROM public.projects p
    JOIN public.profiles prof ON prof.id = p.creator_id
    WHERE p.id = p_project_id

    UNION ALL

    -- 2. Accepted Collaborators
    SELECT 
      a.applicant_id AS member_id,
      COALESCE(prof.name, 'Collaborator') AS member_name,
      prof.profile_photo_url AS member_avatar,
      false AS member_is_creator,
      COALESCE(pr.role, 'Collaborator')::text AS member_role
    FROM public.applications a
    JOIN public.profiles prof ON prof.id = a.applicant_id
    LEFT JOIN public.project_roles pr ON pr.id = a.project_role_id
    WHERE a.project_id = p_project_id
      AND UPPER(a.status) = 'ACCEPTED'
  )
  SELECT 
    r.member_id AS id,
    r.member_name AS name,
    r.member_avatar AS avatar,
    bool_or(r.member_is_creator) AS is_creator,
    array_agg(DISTINCT r.member_role) AS roles
  FROM raw_roster r
  GROUP BY r.member_id, r.member_name, r.member_avatar
  ORDER BY bool_or(r.member_is_creator) DESC, r.member_name ASC;
END;
$$;

-- 6. Database Trigger to Broadcast Minimal Notification via realtime.send
CREATE OR REPLACE FUNCTION public.broadcast_project_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Send only minimal notification: message ID and project ID
  -- No message body, sender name, avatar, or private content is broadcast.
  -- Authorized clients fetch full message details via RLS-protected SELECT.
  PERFORM realtime.send(
    jsonb_build_object(
      'id', NEW.id,
      'project_id', NEW.project_id
    ),
    'new_message',
    'project:' || NEW.project_id::text || ':chat',
    true -- private channel
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_broadcast_project_chat_message ON public.project_chat_messages;
CREATE TRIGGER trg_broadcast_project_chat_message
  AFTER INSERT ON public.project_chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_project_chat_message();

-- 7. Realtime.messages RLS Policy for Private Channel Authorization
DROP POLICY IF EXISTS "authenticated can receive project chat broadcast" ON realtime.messages;
CREATE POLICY "authenticated can receive project chat broadcast"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    realtime.messages.extension = 'broadcast'
    AND public.can_access_project_topic(realtime.topic())
  );

-- 8. Explicit Execution and Table Grants
GRANT SELECT, INSERT ON public.project_chat_messages TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_project_chat(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_access_project_topic(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_chat_members(bigint) TO authenticated;
