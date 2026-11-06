-- Tangent · Memoria y recordatorios. Correr una vez en el SQL Editor de Supabase.
alter table public.bubbles add column if not exists remind_at   timestamptz;
alter table public.bubbles add column if not exists remind_said text;
alter table public.bubbles add column if not exists photo       jsonb;
alter table public.bubbles add column if not exists pauses      integer not null default 0;
create index if not exists bubbles_user_remind_idx on public.bubbles (user_id, remind_at) where remind_at is not null;
