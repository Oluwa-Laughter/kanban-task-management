-- Kanban schema
-- Run this in the Supabase SQL editor for your project.
-- Tables: boards -> columns -> tasks -> subtasks
-- All rows belong to an auth.users id, with RLS so users can only access their own.

-- =============================================================
-- TABLES
-- =============================================================

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  column_id uuid not null references public.columns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================================
-- INDEXES
-- =============================================================

create index if not exists boards_user_id_idx on public.boards (user_id, position);
create index if not exists columns_board_id_idx on public.columns (board_id, position);
create index if not exists tasks_column_id_idx on public.tasks (column_id, position);
create index if not exists subtasks_task_id_idx on public.subtasks (task_id, position);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;

-- boards
drop policy if exists "boards owner select" on public.boards;
drop policy if exists "boards owner insert" on public.boards;
drop policy if exists "boards owner update" on public.boards;
drop policy if exists "boards owner delete" on public.boards;

create policy "boards owner select" on public.boards
  for select using (auth.uid() = user_id);
create policy "boards owner insert" on public.boards
  for insert with check (auth.uid() = user_id);
create policy "boards owner update" on public.boards
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "boards owner delete" on public.boards
  for delete using (auth.uid() = user_id);

-- columns
drop policy if exists "columns owner select" on public.columns;
drop policy if exists "columns owner insert" on public.columns;
drop policy if exists "columns owner update" on public.columns;
drop policy if exists "columns owner delete" on public.columns;

create policy "columns owner select" on public.columns
  for select using (auth.uid() = user_id);
create policy "columns owner insert" on public.columns
  for insert with check (auth.uid() = user_id);
create policy "columns owner update" on public.columns
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "columns owner delete" on public.columns
  for delete using (auth.uid() = user_id);

-- tasks
drop policy if exists "tasks owner select" on public.tasks;
drop policy if exists "tasks owner insert" on public.tasks;
drop policy if exists "tasks owner update" on public.tasks;
drop policy if exists "tasks owner delete" on public.tasks;

create policy "tasks owner select" on public.tasks
  for select using (auth.uid() = user_id);
create policy "tasks owner insert" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "tasks owner update" on public.tasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks owner delete" on public.tasks
  for delete using (auth.uid() = user_id);

-- subtasks
drop policy if exists "subtasks owner select" on public.subtasks;
drop policy if exists "subtasks owner insert" on public.subtasks;
drop policy if exists "subtasks owner update" on public.subtasks;
drop policy if exists "subtasks owner delete" on public.subtasks;

create policy "subtasks owner select" on public.subtasks
  for select using (auth.uid() = user_id);
create policy "subtasks owner insert" on public.subtasks
  for insert with check (auth.uid() = user_id);
create policy "subtasks owner update" on public.subtasks
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subtasks owner delete" on public.subtasks
  for delete using (auth.uid() = user_id);
