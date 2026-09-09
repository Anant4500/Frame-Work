-- Migration: update_chat_broadcast_minimal_notification
-- Updates broadcast_project_chat_message to send only minimal notification (id, project_id).
-- Prevents stale/unauthorized sockets from receiving message bodies, sender identities, or private content.
-- Authorized clients must fetch full message details from public.project_chat_messages protected by RLS.

CREATE OR REPLACE FUNCTION public.broadcast_project_chat_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Send only minimal notification: message ID and project ID
  -- No message body, sender name, avatar, or private content is broadcast.
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
