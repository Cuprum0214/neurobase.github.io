-- ============================================================================
--  NeuroBase · 神经与认知科学基础知识库
--  Phase 6-8 全栈数据库结构（账号 / 云端进度 / 收藏 / 错题 / 测验统计 /
--  间隔重复卡 / 反馈箱 / 管理员 / 来源登记 / 待审队列 / 同步记录 /
--  学习社区：打卡 / 问答 / 回答 / 举报）
--
--  用法：Supabase Dashboard → SQL Editor → New query → 整段粘贴 → Run
--  特性：**幂等**，可重复执行；重复运行不报错、不丢数据、不覆盖业务数据
--
--  安全模型（务必先读）：
--    * 所有 user_* 表与 profiles 开启 RLS，策略统一为 auth.uid() = user_id；
--      任何登录用户只能读写自己的行，拿不到别人的数据。
--    * anon（未登录）没有任何表级策略，只能通过两个受控 RPC 通信：
--        - submit_feedback()      提交反馈（SECURITY DEFINER + IP 限流）
--        - get_feedback_by_code() 凭 6 位查询码取回自己的那一条
--    * 管理端（authenticated）必须邮箱落在 public.admins 白名单，由 is_admin() 放行。
--    * 本文件不需要 service_role；前端只使用 anon key。
-- ============================================================================

create extension if not exists pgcrypto;


-- ============================================================================
-- 0. 通用：updated_at 自动维护
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;


-- ============================================================================
-- 1. 用户档案 profiles
--    1:1 对应 auth.users；主题 / 字号 / 语言等偏好也放这里，换设备可恢复
-- ============================================================================
create table if not exists public.profiles (
  id           uuid        primary key references auth.users (id) on delete cascade,
  email        text,
  display_name text,
  locale       text        not null default 'zh',
  theme        text        not null default 'system',
  font_pct     int         not null default 100,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 兼容早期版本：缺列则补（幂等）
alter table public.profiles add column if not exists email        text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists locale       text not null default 'zh';
alter table public.profiles add column if not exists theme        text not null default 'system';
alter table public.profiles add column if not exists font_pct     int  not null default 100;
alter table public.profiles add column if not exists prefs        jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists created_at   timestamptz not null default now();
alter table public.profiles add column if not exists updated_at   timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_locale_chk') then
    alter table public.profiles
      add constraint profiles_locale_chk check (locale in ('zh', 'en'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_theme_chk') then
    alter table public.profiles
      add constraint profiles_theme_chk check (theme in ('light', 'dark', 'system'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_font_chk') then
    alter table public.profiles
      add constraint profiles_font_chk check (font_pct between 25 and 300);
  end if;
end
$$;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles
  for delete to authenticated using (auth.uid() = id);


-- ============================================================================
-- 2. 学习进度 user_progress
--    本地 nb-progress.visited[] 的云端化：一条 (用户, 词条) 一行
-- ============================================================================
create table if not exists public.user_progress (
  user_id       uuid        not null references auth.users (id) on delete cascade,
  term_id       text        not null,
  visits        int         not null default 1,
  first_seen_at timestamptz not null default now(),
  last_seen_at  timestamptz not null default now(),
  primary key (user_id, term_id)
);

alter table public.user_progress add column if not exists visits        int not null default 1;
alter table public.user_progress add column if not exists first_seen_at timestamptz not null default now();
alter table public.user_progress add column if not exists last_seen_at  timestamptz not null default now();

create index if not exists user_progress_last_idx on public.user_progress (user_id, last_seen_at desc);

alter table public.user_progress enable row level security;

drop policy if exists "progress_all_own" on public.user_progress;
create policy "progress_all_own" on public.user_progress
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- 3. 收藏 user_favorites
--    本地 nb-favorites[] 的云端化；取消收藏直接删行（无需软删）
-- ============================================================================
create table if not exists public.user_favorites (
  user_id    uuid        not null references auth.users (id) on delete cascade,
  term_id    text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, term_id)
);

alter table public.user_favorites add column if not exists created_at timestamptz not null default now();
alter table public.user_favorites add column if not exists updated_at timestamptz not null default now();

create index if not exists user_favorites_updated_idx on public.user_favorites (user_id, updated_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists "favorites_all_own" on public.user_favorites;
create policy "favorites_all_own" on public.user_favorites
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- 4. 错题本 user_mistakes
--    本地 nb-mistakes[] 的云端化；本地 id 作为联合主键的一部分，保证幂等
-- ============================================================================
create table if not exists public.user_mistakes (
  user_id        uuid        not null references auth.users (id) on delete cascade,
  id             text        not null,
  term_id        text,
  source         text,
  prompt         text,
  your_answer    text,
  correct_answer text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.user_mistakes add column if not exists term_id        text;
alter table public.user_mistakes add column if not exists source         text;
alter table public.user_mistakes add column if not exists prompt         text;
alter table public.user_mistakes add column if not exists your_answer    text;
alter table public.user_mistakes add column if not exists correct_answer text;
alter table public.user_mistakes add column if not exists created_at     timestamptz not null default now();
alter table public.user_mistakes add column if not exists updated_at     timestamptz not null default now();

create index if not exists user_mistakes_updated_idx on public.user_mistakes (user_id, updated_at desc);

alter table public.user_mistakes enable row level security;

drop policy if exists "mistakes_all_own" on public.user_mistakes;
create policy "mistakes_all_own" on public.user_mistakes
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- 5. 测验统计 user_quiz_stats
--    本地 nb-quiz-stats {taken, correct, wrong} 的云端化，一人一行
-- ============================================================================
create table if not exists public.user_quiz_stats (
  user_id    uuid        primary key references auth.users (id) on delete cascade,
  taken      int         not null default 0,
  correct    int         not null default 0,
  wrong      int         not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.user_quiz_stats add column if not exists taken      int not null default 0;
alter table public.user_quiz_stats add column if not exists correct    int not null default 0;
alter table public.user_quiz_stats add column if not exists wrong      int not null default 0;
alter table public.user_quiz_stats add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quiz_stats_nonneg_chk') then
    alter table public.user_quiz_stats
      add constraint quiz_stats_nonneg_chk check (taken >= 0 and correct >= 0 and wrong >= 0);
  end if;
end
$$;

alter table public.user_quiz_stats enable row level security;

drop policy if exists "quiz_stats_all_own" on public.user_quiz_stats;
create policy "quiz_stats_all_own" on public.user_quiz_stats
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- 6. 间隔重复卡 sr_cards（SM-2 简化版：ease / interval_days / due_at）
--    Phase 6 只落库与同步；复习调度由前端计算并回写
-- ============================================================================
create table if not exists public.sr_cards (
  user_id       uuid         not null references auth.users (id) on delete cascade,
  term_id       text         not null,
  ease          numeric(4,2) not null default 2.50,
  interval_days int          not null default 0,
  due_at        timestamptz  not null default now(),
  reps          int          not null default 0,
  lapses        int          not null default 0,
  updated_at    timestamptz  not null default now(),
  primary key (user_id, term_id)
);

alter table public.sr_cards add column if not exists ease          numeric(4,2) not null default 2.50;
alter table public.sr_cards add column if not exists interval_days int not null default 0;
alter table public.sr_cards add column if not exists due_at        timestamptz not null default now();
alter table public.sr_cards add column if not exists reps          int not null default 0;
alter table public.sr_cards add column if not exists lapses        int not null default 0;
alter table public.sr_cards add column if not exists updated_at    timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sr_cards_ease_chk') then
    alter table public.sr_cards
      add constraint sr_cards_ease_chk check (ease between 1.30 and 3.00);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'sr_cards_nonneg_chk') then
    alter table public.sr_cards
      add constraint sr_cards_nonneg_chk check (interval_days >= 0 and reps >= 0 and lapses >= 0);
  end if;
end
$$;

create index if not exists sr_cards_due_idx on public.sr_cards (user_id, due_at);

alter table public.sr_cards enable row level security;

drop policy if exists "sr_cards_all_own" on public.sr_cards;
create policy "sr_cards_all_own" on public.sr_cards
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ============================================================================
-- 6.1 查询码生成器（6 位，去掉易混淆的 0 o 1 l i）
--     必须先于 feedback 表定义：建表时列默认值会解析该函数
-- ============================================================================
create or replace function public.gen_feedback_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  alphabet text := 'abcdefghjkmnpqrstuvwxyz23456789';
  out_code text := '';
  i        int;
begin
  for i in 1..6 loop
    out_code := out_code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return out_code;
end;
$$;


-- ============================================================================
-- 7. 反馈箱主表 feedback
--    保留旧版字段（视觉学习站时期）以保证数据不丢；新增 user_id / source / updated_at
-- ============================================================================
create table if not exists public.feedback (
  id          uuid        primary key default gen_random_uuid(),
  code        text        not null unique default public.gen_feedback_code(),
  type        text        not null default '其他',
  type_other  text,
  body        text        not null,
  contact     text,
  page        text,
  device      text,
  width       int,
  ip          text,
  status      text        not null default 'new',
  reply       text,
  replied_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- 兼容补列（幂等）
alter table public.feedback add column if not exists user_id    uuid references auth.users (id) on delete set null;
alter table public.feedback add column if not exists source     text not null default 'neurobase';
alter table public.feedback add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'feedback_status_chk') then
    alter table public.feedback
      add constraint feedback_status_chk check (status in ('new', 'read', 'replied', 'closed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_body_len_chk') then
    alter table public.feedback
      add constraint feedback_body_len_chk check (char_length(body) between 1 and 8000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'feedback_code_len_chk') then
    alter table public.feedback
      add constraint feedback_code_len_chk check (char_length(code) = 6);
  end if;
end
$$;

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_status_idx     on public.feedback (status);
create index if not exists feedback_ip_time_idx    on public.feedback (ip, created_at desc);
create index if not exists feedback_user_idx       on public.feedback (user_id, created_at desc);


-- ============================================================================
-- 8. 管理员白名单 admins
--    必须是 Supabase Auth 里真实存在、且你知道密码的邮箱
-- ============================================================================
create table if not exists public.admins (
  email      text        primary key,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- 管理员邮箱不在此处硬编码（避免把无关邮箱写成管理员）。
-- 本文件执行完后，请用下面的模板单独插入你自己的邮箱：
--   insert into public.admins (email) values ('你的邮箱@example.com') on conflict (email) do nothing;
--   select * from public.admins;

drop policy if exists "admins_read_self" on public.admins;
create policy "admins_read_self" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));


-- ============================================================================
-- 9. is_admin()：当前登录者是否在白名单（供 RLS 与 RPC 复用）
-- ============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;


-- ============================================================================
-- 10. 反馈箱 RLS
--     匿名没有表级策略；登录用户只能读自己提交的；管理员可读全表 / 改状态 / 删
-- ============================================================================
alter table public.feedback enable row level security;

drop policy if exists "fb_admin_select" on public.feedback;
drop policy if exists "fb_admin_update" on public.feedback;
drop policy if exists "fb_admin_delete" on public.feedback;
drop policy if exists "fb_self_select" on public.feedback;

create policy "fb_admin_select" on public.feedback
  for select to authenticated using (public.is_admin());
create policy "fb_admin_update" on public.feedback
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "fb_admin_delete" on public.feedback
  for delete to authenticated using (public.is_admin());
create policy "fb_self_select" on public.feedback
  for select to authenticated using (user_id is not null and user_id = auth.uid());

-- 注意：故意不给 anon 任何表级策略 → 匿名拿不到全表，只能走下面的 RPC
grant select, insert, update, delete on public.profiles        to authenticated;
grant select, insert, update, delete on public.user_progress   to authenticated;
grant select, insert, update, delete on public.user_favorites  to authenticated;
grant select, insert, update, delete on public.user_mistakes   to authenticated;
grant select, insert, update, delete on public.user_quiz_stats to authenticated;
grant select, insert, update, delete on public.sr_cards        to authenticated;
grant select, update, delete          on public.feedback       to authenticated;
grant select                          on public.admins         to authenticated;


-- ============================================================================
-- 11. 查询码生成器
--     注意：该函数已前移到第 7 节之前定义。
--     PostgreSQL 在 CREATE TABLE 时会解析列默认值，函数必须先存在。
-- ============================================================================


-- ============================================================================
-- 12. RPC：匿名/登录均可提交反馈（SECURITY DEFINER + IP 限流）
--     同一 IP 60 秒内最多 12 条；登录用户自动关联 user_id
-- ============================================================================
create or replace function public.submit_feedback(
  p_type       text,
  p_type_other text default null,
  p_body       text default null,
  p_contact    text default null,
  p_page       text default null,
  p_device     text default null,
  p_width      int  default null
)
returns table (code text, id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_headers jsonb;
  v_ip      text;
  v_recent  int;
  v_body    text;
  v_type    text;
  v_row     public.feedback;
  v_i       int;
begin
  v_body := btrim(coalesce(p_body, ''));
  if v_body = '' then
    raise exception 'invalid_body' using errcode = 'P0001';
  end if;
  if char_length(v_body) > 8000 then
    raise exception 'body_too_long' using errcode = 'P0001';
  end if;

  v_type := left(btrim(coalesce(nullif(p_type, ''), '其他')), 40);

  v_headers := coalesce(current_setting('request.headers', true), '{}')::jsonb;
  v_ip := coalesce(
    nullif(btrim(split_part(coalesce(v_headers ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'unknown'
  );

  if v_ip <> 'unknown' then
    select count(*) into v_recent
      from public.feedback f
     where f.ip = v_ip
       and f.created_at > now() - interval '60 seconds';
    if v_recent >= 12 then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;

  -- 极小概率撞码时重试
  for v_i in 1..5 loop
    begin
      insert into public.feedback (
        type, type_other, body, contact, page, device, width, ip, user_id, source
      )
      values (
        v_type,
        nullif(left(btrim(coalesce(p_type_other, '')), 40), ''),
        v_body,
        nullif(left(btrim(coalesce(p_contact, '')), 80), ''),
        nullif(left(btrim(coalesce(p_page, '')), 120), ''),
        nullif(left(btrim(coalesce(p_device, '')), 20), ''),
        p_width,
        v_ip,
        auth.uid(),
        'neurobase'
      )
      returning * into v_row;
      exit;
    exception when unique_violation then
      if v_i = 5 then raise; end if;
    end;
  end loop;

  return query select v_row.code, v_row.id;
end;
$$;

revoke all on function public.submit_feedback(text, text, text, text, text, text, int) from public;
grant execute on function public.submit_feedback(text, text, text, text, text, text, int) to anon, authenticated;


-- ============================================================================
-- 13. RPC：凭查询码查看自己的反馈与回复
--     只返回命中那一条，且不暴露 ip / contact / user_id
-- ============================================================================
create or replace function public.get_feedback_by_code(p_code text)
returns table (
  code       text,
  type       text,
  status     text,
  body       text,
  created_at timestamptz,
  reply      text,
  replied_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select f.code, f.type, f.status, f.body, f.created_at, f.reply, f.replied_at
    from public.feedback f
   where f.code = lower(btrim(coalesce(p_code, '')))
   limit 1;
$$;

revoke all on function public.get_feedback_by_code(text) from public;
grant execute on function public.get_feedback_by_code(text) to anon, authenticated;


-- ============================================================================
-- 14. RPC：管理端列表（仅白名单邮箱；非管理员调用会抛 not_admin）
-- ============================================================================
create or replace function public.admin_list_feedback(
  p_status text default null,
  p_limit  int  default 50,
  p_offset int  default 0
)
returns setof public.feedback
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;

  return query
    select f.*
      from public.feedback f
     where p_status is null or f.status = p_status
     order by f.created_at desc
     limit least(greatest(coalesce(p_limit, 50), 1), 200)
    offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke all on function public.admin_list_feedback(text, int, int) from public;
grant execute on function public.admin_list_feedback(text, int, int) to authenticated;


-- ============================================================================
-- 15. RPC：管理端回复 / 改状态（仅白名单邮箱）
-- ============================================================================
create or replace function public.admin_reply_feedback(
  p_id     uuid,
  p_reply  text,
  p_status text default 'replied'
)
returns public.feedback
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row  public.feedback;
  v_text text;
  v_stat text;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = 'P0001';
  end if;

  v_text := nullif(btrim(coalesce(p_reply, '')), '');
  v_stat := coalesce(nullif(btrim(p_status), ''), 'replied');
  if v_stat not in ('new', 'read', 'replied', 'closed') then
    raise exception 'bad_status' using errcode = 'P0001';
  end if;

  update public.feedback
     set reply      = coalesce(v_text, reply),
         status     = v_stat,
         replied_at = case when v_text is null then replied_at else now() end
   where id = p_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'not_found' using errcode = 'P0001';
  end if;

  return v_row;
end;
$$;

revoke all on function public.admin_reply_feedback(uuid, text, text) from public;
grant execute on function public.admin_reply_feedback(uuid, text, text) to authenticated;


-- ============================================================================
-- 16. RPC：清空我的全部学习数据（隐私 / 换号前自助清理）
--     保留 profiles 基本信息与已提交的反馈
-- ============================================================================
create or replace function public.delete_my_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = 'P0001';
  end if;

  delete from public.user_progress   where user_id = auth.uid();
  delete from public.user_favorites  where user_id = auth.uid();
  delete from public.user_mistakes   where user_id = auth.uid();
  delete from public.user_quiz_stats where user_id = auth.uid();
  delete from public.sr_cards        where user_id = auth.uid();
end;
$$;

revoke all on function public.delete_my_data() from public;
grant execute on function public.delete_my_data() to authenticated;


-- ============================================================================
-- 17. 触发器：新用户注册自动建档案；各表自动维护 updated_at
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_favorites_touch on public.user_favorites;
create trigger trg_favorites_touch
  before update on public.user_favorites
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_mistakes_touch on public.user_mistakes;
create trigger trg_mistakes_touch
  before update on public.user_mistakes
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_quiz_stats_touch on public.user_quiz_stats;
create trigger trg_quiz_stats_touch
  before update on public.user_quiz_stats
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_sr_cards_touch on public.sr_cards;
create trigger trg_sr_cards_touch
  before update on public.sr_cards
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_feedback_touch on public.feedback;
create trigger trg_feedback_touch
  before update on public.feedback
  for each row execute function public.touch_updated_at();


-- ============================================================================
-- 18. Realtime：把需要跨设备实时刷新的表加入 supabase_realtime publication
--     幂等：已加入则跳过
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array['feedback', 'user_progress', 'user_favorites', 'user_mistakes', 'sr_cards']
  loop
    if not exists (
      select 1
        from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
exception
  when undefined_object then
    -- 该项目未启用 supabase_realtime publication（极少见）：跳过，不阻断建表
    raise notice 'supabase_realtime publication 不存在，已跳过 Realtime 配置';
end
$$;


-- ============================================================================
-- 12. Phase 7 · 来源登记与知识更新
--    terms           词条镜像（公开只读；供同步任务比对与未来服务端检索）
--    sources         唯一来源登记（教材 / 论文 / 综述 / 百科 / 官方数据）
--    term_references 词条 → 来源（多对多，带核验时间戳）
--    update_queue    自动比对产生的待审变更（人工抽检后 approved / rejected）
--    sync_runs       每次同步的运行记录（含降级与链接失败计数）
--
--    写权限：以上 5 张表只给 service_role（Worker / 本地同步脚本）；
--            anon / authenticated 仅可读，避免前端伪造来源或篡改待审队列。
-- ============================================================================
create table if not exists public.terms (
  id          text primary key,
  module      text not null,
  name_zh     text not null,
  name_en     text default '',
  abbr        text default '',
  difficulty  text default '',
  definition  text default '',
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists terms_module_idx on public.terms(module);

create table if not exists public.sources (
  id          text primary key,
  type        text not null check (type in ('textbook','review','paper','official','encyclopedia','lecture')),
  title       text not null unique,
  url         text not null,
  via         text default '',
  note        text default '',
  verified_at date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists sources_type_idx on public.sources(type);
create index if not exists sources_verified_idx on public.sources(verified_at desc);

create table if not exists public.term_references (
  term_id     text not null references public.terms(id) on delete cascade,
  source_id   text not null references public.sources(id) on delete cascade,
  verified_at date not null,
  primary key (term_id, source_id)
);
create index if not exists term_references_source_idx on public.term_references(source_id);

create table if not exists public.update_queue (
  id          text primary key,
  kind        text not null check (kind in ('term','frontier','source-link','reference')),
  target_id   text not null,
  field       text not null,
  old_value   text default '',
  new_value   text default '',
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  source      text default '',
  detected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer    text default '',
  note        text default ''
);
create index if not exists update_queue_status_idx on public.update_queue(status, detected_at desc);

create table if not exists public.sync_runs (
  id            text primary key,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  trigger       text not null default 'manual',
  mode          text not null default 'online',
  checked       int not null default 0,
  changed       int not null default 0,
  queued        int not null default 0,
  links_checked int not null default 0,
  links_failed  int not null default 0,
  status        text not null default 'running',
  note          text default ''
);

drop trigger if exists sources_touch_updated on public.sources;
create trigger sources_touch_updated before update on public.sources
  for each row execute function public.touch_updated_at();

alter table public.terms enable row level security;
alter table public.sources enable row level security;
alter table public.term_references enable row level security;
alter table public.update_queue enable row level security;
alter table public.sync_runs enable row level security;

drop policy if exists terms_public_read on public.terms;
create policy terms_public_read on public.terms for select using (true);

drop policy if exists sources_public_read on public.sources;
create policy sources_public_read on public.sources for select using (true);

drop policy if exists term_refs_public_read on public.term_references;
create policy term_refs_public_read on public.term_references for select using (true);

drop policy if exists queue_public_read on public.update_queue;
create policy queue_public_read on public.update_queue for select using (true);

drop policy if exists runs_public_read on public.sync_runs;
create policy runs_public_read on public.sync_runs for select using (true);

-- 人工抽检：管理员把待审项标记为 approved / rejected（发布动作由人工执行）
create or replace function public.review_update(p_id text, p_status text)
returns public.update_queue
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.update_queue;
begin
  if not public.is_admin() then
    raise exception 'not_admin';
  end if;
  if p_status not in ('approved', 'rejected') then
    raise exception 'bad_status';
  end if;
  update public.update_queue
     set status = p_status,
         reviewed_at = now(),
         reviewer = coalesce((select email from auth.users where id = auth.uid()), 'admin')
   where id = p_id
  returning * into r;
  if r.id is null then
    raise exception 'not_found';
  end if;
  return r;
end;
$$;

grant execute on function public.review_update(text, text) to authenticated;
grant select on public.terms to anon, authenticated;
grant select on public.sources to anon, authenticated;
grant select on public.term_references to anon, authenticated;
grant select on public.update_queue to anon, authenticated;
grant select on public.sync_runs to anon, authenticated;


-- ============================================================================
-- Phase 8. 学习社区：打卡 / 问答 / 回答 / 举报
--  · 帖子与回答：公开可读（隐藏内容仅管理员可见）；登录用户只能写自己的行。
--  · 举报：仅本人与管理员可读；普通用户不能看别人的举报记录。
--  · 打卡：一人一天一行（user_id + day 主键），只能读写自己的。
-- ============================================================================
create table if not exists public.community_posts (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  author text,
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 1000),
  module text,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists community_posts_created_idx on public.community_posts (created_at desc);

create table if not exists public.community_replies (
  id text primary key,
  post_id text not null references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author text,
  body text not null check (char_length(body) between 1 and 1000),
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists community_replies_post_idx on public.community_replies (post_id, created_at);

create table if not exists public.community_reports (
  id text primary key,
  target_type text not null check (target_type in ('post', 'reply')),
  target_id text not null,
  reason text not null,
  note text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists community_reports_target_idx on public.community_reports (target_id);

create table if not exists public.community_checkins (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.community_posts enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_checkins enable row level security;

-- 帖子：未隐藏内容公开读；本人可写/删；管理员可读全部、改隐藏标记、删除
create policy posts_public_read on public.community_posts
  for select using (hidden = false or public.is_admin());
create policy posts_insert_own on public.community_posts
  for insert with check (auth.uid() = user_id);
create policy posts_update_own on public.community_posts
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy posts_delete_own on public.community_posts
  for delete using (auth.uid() = user_id or public.is_admin());

-- 回答：与帖子同规则（父帖隐藏时回答仍按自身 hidden 判断）
create policy replies_public_read on public.community_replies
  for select using (hidden = false or public.is_admin());
create policy replies_insert_own on public.community_replies
  for insert with check (auth.uid() = user_id);
create policy replies_update_own on public.community_replies
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy replies_delete_own on public.community_replies
  for delete using (auth.uid() = user_id or public.is_admin());

-- 举报：本人可提交并读回自己的那条；管理员可读全部
create policy rep_insert_own on public.community_reports
  for insert with check (auth.uid() = user_id);
create policy rep_self_read on public.community_reports
  for select using (auth.uid() = user_id);
create policy rep_admin_read on public.community_reports
  for select using (public.is_admin());
create policy rep_admin_delete on public.community_reports
  for delete using (public.is_admin());

-- 打卡：只能读写自己的记录
create policy checkin_all_own on public.community_checkins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.community_posts to authenticated;
grant select, insert, update, delete on public.community_replies to authenticated;
grant select, insert, delete on public.community_reports to authenticated;
grant select, insert, delete on public.community_checkins to authenticated;
grant select on public.community_posts to anon;
grant select on public.community_replies to anon;


-- ============================================================================
-- 19. 账号名唯一性（profiles.display_name + 唯一索引 + RPC）
--     账号名是公开署名，必须全站唯一（大小写 / 首尾空白 / 连续空白不敏感）。
--     旧版把名字存在 prefs.displayName；这里先规范化、清重名并迁移，
--     之后客户端只通过 account_set_name() 改名，避免并发抢占同一名字。
-- ============================================================================

-- 19.0a 兜底规范化：即使绕过 RPC 直接 PATCH，也先折叠空白 / 去首尾 / 截 24 字
create or replace function public.normalize_display_name()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.display_name := nullif(left(btrim(regexp_replace(coalesce(new.display_name, ''), '\s+', ' ', 'g')), 24), '');
  return new;
end;
$$;

drop trigger if exists trg_profiles_normalize_name on public.profiles;
create trigger trg_profiles_normalize_name
  before insert or update of display_name on public.profiles
  for each row execute function public.normalize_display_name();

-- 19.0 先规范化已有 display_name（去首尾、连续空白折叠）
update public.profiles
   set display_name = btrim(regexp_replace(display_name, '\s+', ' ', 'g'))
 where display_name is not null;

-- 19.1 清理既有重名：同一 lower(name) 只保留最早更新的一条，其余置空（回退邮箱前缀）
with ranked as (
  select id,
         row_number() over (
           partition by lower(btrim(display_name))
           order by updated_at asc nulls last, id asc
         ) as rn
  from public.profiles
  where coalesce(btrim(display_name), '') <> ''
)
update public.profiles p
   set display_name = null
  from ranked r
 where p.id = r.id
   and r.rn > 1;

-- 19.2 把旧版 prefs.displayName 迁移到 display_name（只迁合法且不冲突的）
with cand as (
  select id,
         btrim(prefs ->> 'displayName') as nm,
         updated_at
    from public.profiles
   where coalesce(btrim(prefs ->> 'displayName'), '') <> ''
     and coalesce(btrim(display_name), '') = ''
     and char_length(btrim(prefs ->> 'displayName')) <= 24
), ranked as (
  select id, nm,
         row_number() over (partition by lower(nm) order by updated_at asc nulls last, id asc) as rn
    from cand
), free as (
  select r.id, r.nm
    from ranked r
   where r.rn = 1
     and not exists (
       select 1 from public.profiles p
        where p.id <> r.id
          and lower(btrim(p.display_name)) = lower(r.nm)
     )
)
update public.profiles p
   set display_name = f.nm
  from free f
 where p.id = f.id;

-- 19.3 唯一索引：display_name 为空 = 使用邮箱前缀，不参与唯一约束
create unique index if not exists profiles_display_name_uniq
  on public.profiles (lower(btrim(display_name)))
  where coalesce(btrim(display_name), '') <> '';

-- 19.4 RPC：设置 / 清除自己的账号名（仅登录用户；并发同名串行化 + 唯一索引兜底）
create or replace function public.account_set_name(p_name text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v   text := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'code', 'auth');
  end if;

  if v = '' then
    insert into public.profiles (id, display_name, prefs)
    values (uid, null, '{}'::jsonb)
    on conflict (id) do update
      set display_name = null,
          prefs = coalesce(profiles.prefs, '{}'::jsonb) - 'displayName',
          updated_at = now();
    /* 清空后署名回退邮箱前缀，论坛历史行同一事务内跟上 */
    select coalesce(split_part(email, '@', 1), '') into v
      from public.profiles where id = uid;
    if coalesce(v, '') <> '' then
      update public.community_posts   set author = v where user_id = uid;
      update public.community_replies set author = v where user_id = uid;
      if to_regclass('public.community_bans') is not null then
        execute 'update public.community_bans set name = $1 where key = $2' using v, uid::text;
      end if;
    end if;
    return jsonb_build_object('ok', true, 'name', '');
  end if;

  if char_length(v) > 24 then
    return jsonb_build_object('ok', false, 'code', 'bad_name');
  end if;

  perform pg_advisory_xact_lock(hashtext(lower(v)));

  if exists (
    select 1 from public.profiles
     where id <> uid
       and lower(btrim(display_name)) = lower(v)
  ) then
    return jsonb_build_object('ok', false, 'code', 'name_taken');
  end if;

  insert into public.profiles (id, display_name, prefs)
  values (uid, v, jsonb_build_object('displayName', v))
  on conflict (id) do update
    set display_name = excluded.display_name,
        prefs = jsonb_set(coalesce(profiles.prefs, '{}'::jsonb), '{displayName}', to_jsonb(v), true),
        updated_at = now();

  /* 论坛历史帖 / 回复与本机署名同一事务回填（按 user_id 只改本人行） */
  update public.community_posts   set author = v where user_id = uid;
  update public.community_replies set author = v where user_id = uid;
  if to_regclass('public.community_bans') is not null then
    execute 'update public.community_bans set name = $1 where key = $2' using v, uid::text;
  end if;

  return jsonb_build_object('ok', true, 'name', v);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'name_taken');
end;
$$;

grant execute on function public.account_set_name(text) to authenticated;


-- ============================================================================
-- 完成。自检（可选，逐条执行应全部正常）：
--   select count(*) from information_schema.tables
--    where table_schema = 'public'
--      and table_name in ('profiles','user_progress','user_favorites',
--                         'user_mistakes','user_quiz_stats','sr_cards',
--                         'feedback','admins','terms','sources','term_references',
--                         'update_queue','sync_runs',
--                         'community_posts','community_replies',
--                         'community_reports','community_checkins');   -- 期望 17
--   select tablename, rowsecurity from pg_tables
--    where schemaname = 'public';                       -- 全部 t
--   select public.get_feedback_by_code('zzzzzz') is null as ok;  -- 期望 t
--   select * from public.admins;                       -- 只有你的邮箱
-- ============================================================================

