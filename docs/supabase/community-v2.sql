-- ============================================================================
--  NeuroBase · 学习社区 v2（论坛化升级）
--  论坛帖子 / 楼层回复 / 点赞 / 收藏 / 举报 / 置顶 / 精华 / 锁定 / 禁言 + 实时
--
--  用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
--        幂等脚本，可重复执行；不会删除既有数据。
--
--  安全模型：
--    * 匿名（anon）只能「读」公开内容，不能写；发帖/回复/互动需要登录（authenticated）。
--    * 管理操作走 SECURITY DEFINER 的 community_admin() RPC，函数内校验口令摘要。
--    * 仓库与前端源码只保存「加盐 SHA-256 摘要」，不包含口令明文。
--      ⚠️ 口令是短数字时仍可能被离线枚举，正式运营请替换为强口令，
--         更稳妥的做法是把管理员改为 Supabase Auth 账号 + public.admins 白名单。
-- ============================================================================

-- Supabase 默认把 pgcrypto 安装在 extensions schema。若不显式加入 search_path，
-- 在 SQL Editor / Management API 下调用 digest() 会报
--   ERROR 42883: function digest(text, unknown) does not exist
-- 因此整段脚本执行前统一声明一次（本脚本所有语句在同一会话内运行）。
set search_path = public, extensions;

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1. 基础表（首次执行时创建；已存在则跳过）
-- ---------------------------------------------------------------------------
create table if not exists public.community_posts (
  id          text primary key,
  user_id     uuid references auth.users(id) on delete set null,
  author      text,
  title       text not null check (char_length(title) between 1 and 80),
  body        text not null check (char_length(body) between 1 and 2000),
  module      text,
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.community_posts add column if not exists hidden     boolean not null default false;
alter table public.community_posts add column if not exists pinned     boolean not null default false;
alter table public.community_posts add column if not exists featured   boolean not null default false;
alter table public.community_posts add column if not exists locked     boolean not null default false;
alter table public.community_posts add column if not exists updated_at timestamptz not null default now();
alter table public.community_posts add column if not exists author     text;
alter table public.community_posts add column if not exists module     text;

-- 旧版正文上限 1000，论坛化后放宽到 2000
alter table public.community_posts drop constraint if exists community_posts_body_check;
alter table public.community_posts
  add constraint community_posts_body_check check (char_length(body) between 1 and 2000);

create index if not exists community_posts_created_idx on public.community_posts (created_at desc);
create index if not exists community_posts_pinned_idx  on public.community_posts (pinned desc, created_at desc);

create table if not exists public.community_replies (
  id          text primary key,
  post_id     text not null references public.community_posts(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author      text,
  body        text not null check (char_length(body) between 1 and 1000),
  hidden      boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.community_replies add column if not exists hidden boolean not null default false;
create index if not exists community_replies_post_idx on public.community_replies (post_id, created_at);

create table if not exists public.community_reports (
  id          text primary key,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id   text not null,
  reason      text not null,
  note        text,
  user_id     uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists community_reports_target_idx on public.community_reports (target_id);

create table if not exists public.community_checkins (
  user_id    uuid not null references auth.users(id) on delete cascade,
  day        date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

-- ---------------------------------------------------------------------------
-- 2. v2 新增表：点赞 / 收藏、禁言
-- ---------------------------------------------------------------------------
create table if not exists public.community_reactions (
  id         text primary key,
  target_id  text not null,
  kind       text not null check (kind in ('like', 'fav')),
  user_id    uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (target_id, kind, user_id)
);
create index if not exists community_reactions_target_idx on public.community_reactions (target_id, kind);

create table if not exists public.community_bans (
  key        text primary key,
  name       text,
  until      timestamptz,
  reason     text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. 行级安全（RLS）
-- ---------------------------------------------------------------------------
alter table public.community_posts     enable row level security;
alter table public.community_replies   enable row level security;
alter table public.community_reports   enable row level security;
alter table public.community_checkins  enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_bans      enable row level security;

-- 帖子：公开可读（隐藏内容除外）；登录用户只能增删改自己的；管理员函数可越过
drop policy if exists posts_public_read on public.community_posts;
create policy posts_public_read on public.community_posts
  for select using (hidden = false or (auth.uid() is not null and public.is_admin()));

drop policy if exists posts_insert_own on public.community_posts;
create policy posts_insert_own on public.community_posts
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists posts_update_own on public.community_posts;
create policy posts_update_own on public.community_posts
  for update to authenticated using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists posts_delete_own on public.community_posts;
create policy posts_delete_own on public.community_posts
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- 回复
drop policy if exists replies_public_read on public.community_replies;
create policy replies_public_read on public.community_replies
  for select using (hidden = false or (auth.uid() is not null and public.is_admin()));

drop policy if exists replies_insert_own on public.community_replies;
create policy replies_insert_own on public.community_replies
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists replies_update_own on public.community_replies;
create policy replies_update_own on public.community_replies
  for update to authenticated using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists replies_delete_own on public.community_replies;
create policy replies_delete_own on public.community_replies
  for delete to authenticated using (auth.uid() = user_id or public.is_admin());

-- 举报：本人可提交与查看，管理员可读全部
drop policy if exists rep_insert_own on public.community_reports;
create policy rep_insert_own on public.community_reports
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists rep_self_read on public.community_reports;
create policy rep_self_read on public.community_reports
  for select using (auth.uid() = user_id);

drop policy if exists rep_admin_read on public.community_reports;
create policy rep_admin_read on public.community_reports
  for select using (auth.uid() is not null and public.is_admin());

drop policy if exists rep_admin_delete on public.community_reports;
create policy rep_admin_delete on public.community_reports
  for delete using (auth.uid() is not null and public.is_admin());

-- 点赞 / 收藏：全员可读（用于计数），本人可写
drop policy if exists reactions_public_read on public.community_reactions;
create policy reactions_public_read on public.community_reactions
  for select using (true);

drop policy if exists reactions_insert_own on public.community_reactions;
create policy reactions_insert_own on public.community_reactions
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists reactions_delete_own on public.community_reactions;
create policy reactions_delete_own on public.community_reactions
  for delete to authenticated using (auth.uid() = user_id);

-- 禁言名单：全员可读（前端展示禁言状态），只能由管理 RPC 写入
drop policy if exists bans_public_read on public.community_bans;
create policy bans_public_read on public.community_bans
  for select using (true);

drop policy if exists bans_admin_write on public.community_bans;
create policy bans_admin_write on public.community_bans
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 打卡：只能读写自己
drop policy if exists checkin_all_own on public.community_checkins;
create policy checkin_all_own on public.community_checkins
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. 授权
-- ---------------------------------------------------------------------------
grant select on public.community_posts     to anon, authenticated;
grant select on public.community_replies   to anon, authenticated;
grant select on public.community_reactions to anon, authenticated;
grant select on public.community_bans      to anon, authenticated;

grant select, insert, update, delete on public.community_posts     to authenticated;
grant select, insert, update, delete on public.community_replies   to authenticated;
grant select, insert, delete         on public.community_reports   to authenticated;
grant select, insert, delete         on public.community_reactions to authenticated;
grant select, insert, delete         on public.community_checkins  to authenticated;

-- ---------------------------------------------------------------------------
-- 5. updated_at 自动维护
-- ---------------------------------------------------------------------------
create or replace function public.community_touch_updated_at()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists community_posts_touch on public.community_posts;
create trigger community_posts_touch
  before update on public.community_posts
  for each row execute function public.community_touch_updated_at();

-- ---------------------------------------------------------------------------
-- 6. 管理 RPC（口令摘要校验；服务端执行，绕过 RLS）
--    摘要与前端 core.js 的 ADMIN_HASH 一致：hex(sha256('nb-admin::v1::' + 口令))
-- ---------------------------------------------------------------------------
create or replace function public.community_admin_ok(p_pass text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select coalesce(
    encode(digest(coalesce(p_pass, '') || 'nb-admin::v1::', 'sha256'), 'hex')
      = '2a8a664b72feba7fbe773df50b2720b3e3a5a4c4b6089a591ad6098e8dcdac59',
    false);
$$;

create or replace function public.community_admin(
  p_pass   text,
  p_action text,
  p_id     text default null,
  p_key    text default null,
  p_name   text default null,
  p_days   int  default 7,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_until timestamptz;
begin
  if not public.community_admin_ok(p_pass) then
    raise exception 'not_admin' using errcode = '42501';
  end if;

  case p_action
    when 'delete_post' then
      delete from public.community_posts where id = p_id;
    when 'hide_post' then
      update public.community_posts set hidden = true where id = p_id;
    when 'unhide_post' then
      update public.community_posts set hidden = false where id = p_id;
    when 'pin' then
      update public.community_posts set pinned = true where id = p_id;
    when 'unpin' then
      update public.community_posts set pinned = false where id = p_id;
    when 'feature' then
      update public.community_posts set featured = true where id = p_id;
    when 'unfeature' then
      update public.community_posts set featured = false where id = p_id;
    when 'lock' then
      update public.community_posts set locked = true where id = p_id;
    when 'unlock' then
      update public.community_posts set locked = false where id = p_id;
    when 'delete_reply' then
      delete from public.community_replies where id = p_id;
    when 'hide_reply' then
      update public.community_replies set hidden = true where id = p_id;
    when 'unhide_reply' then
      update public.community_replies set hidden = false where id = p_id;
    when 'clear_reports' then
      delete from public.community_reports where target_id = p_id;
    when 'ban' then
      v_until := case when coalesce(p_days, 0) > 0
                      then now() + (p_days || ' days')::interval
                      else null end;
      insert into public.community_bans (key, name, until, reason)
      values (p_key, p_name, v_until, p_reason)
      on conflict (key) do update
        set name = excluded.name, until = excluded.until, reason = excluded.reason;
    when 'unban' then
      delete from public.community_bans where key = p_key;
    else
      raise exception 'unknown_action' using errcode = '22023';
  end case;

  return jsonb_build_object('ok', true, 'action', p_action);
end;
$$;

revoke all on function public.community_admin(text, text, text, text, text, int, text) from public;
grant execute on function public.community_admin(text, text, text, text, text, int, text) to anon, authenticated;
grant execute on function public.community_admin_ok(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 7. 实时（Realtime）
--    把社区表加入 supabase_realtime publication；已加入则跳过。
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  tables text[] := array['community_posts', 'community_replies', 'community_reactions', 'community_bans'];
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
  foreach t in array tables loop
    if not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end
$$;

-- ---------------------------------------------------------------------------
-- 8. 自检（执行后应全部返回 t / 无报错）
-- ---------------------------------------------------------------------------
--   select public.community_admin_ok('错误的测试口令');          -- 期望 f
--   select count(*) from information_schema.columns
--    where table_schema = 'public' and table_name = 'community_posts'
--      and column_name in ('pinned', 'featured', 'locked', 'updated_at');  -- 期望 4
--   select tablename from pg_publication_tables
--    where pubname = 'supabase_realtime' and schemaname = 'public';        -- 期望含 4 张社区表
