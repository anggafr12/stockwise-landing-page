BEGIN;

CREATE TABLE IF NOT EXISTS public.membership_tiers (
  code varchar PRIMARY KEY,                  -- 'FREE' | 'PREMIUM' | 'VIP'
  name varchar NOT NULL,
  sort_order int NOT NULL,
  badge_color varchar,
  icon_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Seed 3 tier (idempotent)
INSERT INTO public.membership_tiers (code, name, sort_order, badge_color)
VALUES
  ('FREE','Free',1,'#9CA3AF'),
  ('PREMIUM','Premium',2,'#3B82F6'),
  ('VIP','VIP',3,'#F59E0B')
ON CONFLICT (code) DO UPDATE
SET name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    badge_color = EXCLUDED.badge_color,
    is_active = true;

-- Lepas CHECK constraints lama yang hard-coded
ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_min_tier_check;

ALTER TABLE public.membership_plans
  DROP CONSTRAINT IF EXISTS membership_plans_membership_tier_granted_check;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_membership_tier_check;

-- Pastikan kolom default masih 'FREE'
ALTER TABLE public.courses
  ALTER COLUMN min_tier SET DEFAULT 'FREE';

ALTER TABLE public.users
  ALTER COLUMN membership_tier SET DEFAULT 'FREE';

-- Tambahkan FK baru ke lookup table
ALTER TABLE public.courses
  ADD CONSTRAINT courses_min_tier_fk
  FOREIGN KEY (min_tier) REFERENCES public.membership_tiers(code);

ALTER TABLE public.membership_plans
  ADD CONSTRAINT membership_plans_tier_fk
  FOREIGN KEY (membership_tier_granted) REFERENCES public.membership_tiers(code);

ALTER TABLE public.users
  ADD CONSTRAINT users_tier_fk
  FOREIGN KEY (membership_tier) REFERENCES public.membership_tiers(code);

-- Index bantu sort
CREATE INDEX IF NOT EXISTS ix_membership_tiers_sort ON public.membership_tiers(sort_order);

COMMIT;

