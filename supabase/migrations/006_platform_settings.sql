-- Platform-wide settings (single row)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'Pentarch Agency',
  domain TEXT NOT NULL DEFAULT 'pentarch.agency',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed the single settings row
INSERT INTO public.platform_settings (platform_name, domain, timezone, maintenance_mode)
VALUES ('Pentarch Agency', 'pentarch.agency', 'UTC', false)
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Only founders can read/update
CREATE POLICY "Founders can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );

CREATE POLICY "Founders can update platform settings"
  ON public.platform_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'founder'
    )
  );
