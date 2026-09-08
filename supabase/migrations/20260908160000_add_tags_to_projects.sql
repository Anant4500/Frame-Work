-- Migration: add_tags_to_projects
-- Adds tags text array column to public.projects with default empty array

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
