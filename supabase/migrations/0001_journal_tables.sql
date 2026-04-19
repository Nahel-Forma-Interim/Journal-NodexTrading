-- ============================================================
-- Nodex Trading — Journal tables (trades, plans, notes, settings)
-- À exécuter une fois dans Supabase SQL Editor.
-- Tables préfixées `journal_` pour ne pas entrer en conflit avec
-- le projet Nodex Trading Simulator qui partage le même Supabase.
-- ============================================================

-- TRADES --------------------------------------------------------
create table if not exists public.journal_trades (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  id text not null,
  date text,
  pair text,
  trade_type text,
  entry_price numeric,
  exit_price numeric,
  amount_invested numeric,
  fee_percent numeric,
  fees numeric,
  pnl numeric,
  pnl_percent numeric,
  notes text,
  tags text[],
  screenshot text,
  quantity numeric,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- PLANS ---------------------------------------------------------
create table if not exists public.journal_plans (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  id text not null,
  name text,
  strategy text,
  trading_hours text,
  preferred_sessions text,
  description text,
  created_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- NOTES ---------------------------------------------------------
create table if not exists public.journal_notes (
  user_id uuid not null references auth.users on delete cascade default auth.uid(),
  id text not null,
  title text,
  content text,
  folder text,
  created_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- SETTINGS (1 ligne par utilisateur) ----------------------------
create table if not exists public.journal_settings (
  user_id uuid primary key references auth.users on delete cascade default auth.uid(),
  starting_capital numeric default 1000,
  display_name text default 'Nahel',
  updated_at timestamptz not null default now()
);

-- RLS -----------------------------------------------------------
alter table public.journal_trades enable row level security;
alter table public.journal_plans enable row level security;
alter table public.journal_notes enable row level security;
alter table public.journal_settings enable row level security;

-- Politiques : chaque utilisateur ne voit que ses propres lignes
drop policy if exists "journal_trades_owner" on public.journal_trades;
create policy "journal_trades_owner" on public.journal_trades
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "journal_plans_owner" on public.journal_plans;
create policy "journal_plans_owner" on public.journal_plans
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "journal_notes_owner" on public.journal_notes;
create policy "journal_notes_owner" on public.journal_notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "journal_settings_owner" on public.journal_settings;
create policy "journal_settings_owner" on public.journal_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
