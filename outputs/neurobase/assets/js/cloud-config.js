/* ============================================================================
   NeuroBase · 云端配置（唯一需要手动填写的前端文件）
   ----------------------------------------------------------------------------
   留空 = 纯离线模式：站点所有功能照常可用，只是不做云同步、AI 助教不可用。
   填好 = 自动升级为「在线模式」，工具栏出现登录入口。

   填写位置：
     url       Supabase → Project Settings → API → Project URL
     anonKey   Supabase → Project Settings → API → anon public（可公开）
     workerUrl AI 助教的转发端点（可选）。两种写法都支持：
               · Supabase Edge Function：https://<ref>.supabase.co/functions/v1/<slug>
               · Cloudflare Worker：https://<worker>.workers.dev（自动拼 /api/tutor）

   ⚠️ 安全红线：**绝对不要**把 service_role key 写进这个文件。
      anon key 是公开密钥，能否读写完全由数据库 RLS 决定（见 docs/supabase/schema.sql）。
   ============================================================================ */
window.NB_CLOUD = {
  enabled: true,
  url: 'https://flayytlvrbhuainebzjd.supabase.co',
  anonKey: 'sb_publishable_XHCGlRZ37jVZ_DFDF52qbg_HiKtCNom',
  workerUrl: 'https://flayytlvrbhuainebzjd.supabase.co/functions/v1/hyper-worker',
  realtime: true
};
