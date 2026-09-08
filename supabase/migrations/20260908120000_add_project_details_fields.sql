-- Migration: add_project_details_fields
-- Adds project details fields to public.projects: format, shoot dates, language, budget range, and target

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS format text,
  ADD COLUMN IF NOT EXISTS shoot_start_date date,
  ADD COLUMN IF NOT EXISTS shoot_end_date date,
  ADD COLUMN IF NOT EXISTS language text,
  ADD COLUMN IF NOT EXISTS budget_min numeric,
  ADD COLUMN IF NOT EXISTS budget_max numeric,
  ADD COLUMN IF NOT EXISTS target text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_budget_min_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_budget_min_check
      CHECK (budget_min IS NULL OR budget_min >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_budget_max_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_budget_max_check
      CHECK (budget_max IS NULL OR budget_max >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_shoot_dates_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_shoot_dates_check
      CHECK (shoot_start_date IS NULL OR shoot_end_date IS NULL OR shoot_end_date >= shoot_start_date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_budget_range_check'
  ) THEN
    ALTER TABLE public.projects
      ADD CONSTRAINT projects_budget_range_check
      CHECK (budget_min IS NULL OR budget_max IS NULL OR budget_max >= budget_min);
  END IF;
END $$;
