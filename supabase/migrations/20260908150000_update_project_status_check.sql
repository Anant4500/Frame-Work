-- Migration: update_project_status_check
-- Updates projects_status_check to include canonical statuses: OPEN, IN_PRODUCTION, COMPLETED, CLOSED
-- Preserves backwards compatibility for IN_PROGRESS and CANCELLED

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check
  CHECK (status = ANY (ARRAY['OPEN'::text, 'IN_PRODUCTION'::text, 'COMPLETED'::text, 'CLOSED'::text, 'IN_PROGRESS'::text, 'CANCELLED'::text]));
