-- ============================================================
-- 八字排盘 v0.25.0 — 用户宫位配置表（Supabase SQL Editor 执行）
-- 表：user_gongwei_config（单行/用户：user_id 即 PK，upsert on conflict）
-- 流程：DDL → GRANT → RLS（沿用 v0.24 paipan_records 已验证流程）
-- 执行前请确认 Supabase 项目：vugckrqxqufiyfrpptwt
-- ============================================================

-- 1. 建表
create table if not exists public.user_gongwei_config (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  groups         jsonb not null default '[]'::jsonb,
  trash          jsonb not null default '[]'::jsonb,
  selected       jsonb not null default '[]'::jsonb,
  fav            jsonb not null default '[]'::jsonb,
  schema_version int   not null default 1,
  updated_at     timestamptz not null default now()
);

-- 2. 开启行级安全
alter table public.user_gongwei_config enable row level security;

-- 3. RLS 4 策略（对齐 paipan_records：user_id = auth.uid()）
create policy "own gongwei config select" on public.user_gongwei_config
  for select using (auth.uid() = user_id);

create policy "own gongwei config insert" on public.user_gongwei_config
  for insert with check (auth.uid() = user_id);

create policy "own gongwei config update" on public.user_gongwei_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own gongwei config delete" on public.user_gongwei_config
  for delete using (auth.uid() = user_id);

-- 4. 授权（authenticated 角色；沿用 v0.24 手动 GRANT 流程）
grant select, insert, update, delete on public.user_gongwei_config to authenticated;

-- 5. 验证（可选）：
-- select * from public.user_gongwei_config limit 5;
-- select * from pg_policies where tablename = 'user_gongwei_config';
