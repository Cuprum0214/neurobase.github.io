# NeuroBase · 神经与认知科学基础知识库

> 面向脑机接口（BCI）方向的神经与认知科学**中英双语**学习平台：术语检索、科普说明、学习自测、互动可视化、内容生态与学习社区。
>
> **当前版本：V5.0.0**（2026-11-20；词库已扩至 333 条，迭代文档至 V5.0.2） · 原生 HTML/CSS/JS · 27 页 · 333 条词条 · 可完全离线使用

---

## 一分钟了解

NeuroBase 把分散在教材、百科与论文中的神经科学 / 认知科学概念，整理成一套可检索、可自测、可追溯来源的术语体系。项目面向智能医学工程（BCI 方向）本科生与入门自学者，强调三件事：

1. **查得到**：中文名、英文名、缩写、拼音全拼、拼音首字母、同义别名全部可搜，支持模块筛选与结果高亮。
2. **看得懂**：每条词条给出定义、机制、工程关联、相关术语、来源与核验时间；互动实验室用 3D / 2D / Canvas 把抽象概念可视化。
3. **用得上**：拼写与缩写训练、单选 / 多选 / 填空测验、错题本、收藏、进度统计，形成学习闭环。

站点为**零构建依赖的原生静态站**：不装 Node、不起服务器、不连 CDN，双击 `outputs/neurobase/index.html` 即可使用；配置 Supabase 后可选用登录、云同步、社区与 AI 助教。

---

## 快速开始

### 方式一：在线访问（已上线）

GitHub Pages 地址：

```text
https://cuprum0214.github.io/neurobase.github.io/
```

### 方式二：本地离线（推荐用于课堂演示 / 无网环境）

```powershell
# 直接双击打开即可，无需安装任何依赖
outputs\neurobase\index.html
```

也可以在仓库根目录起一个静态服务器（可选）：

```powershell
npx.cmd serve outputs/neurobase
```

> 离线模式下检索、词条、学习工具、互动实验室、内容生态、文档阅读全部可用；登录 / 云同步 / 社区云端共享 / AI 助教会自动降级为本机模式或提示未配置。

---

## 功能地图

| 栏目 | 页面 | 你能做什么 |
| --- | --- | --- |
| 首页 | `index.html` | 快速检索、每日一词、学习进度、便签本打卡 |
| 术语检索 | `terms.html` | 关键词 / 英文 / 缩写 / 拼音 / 首字母检索，11 模块筛选、结果高亮 |
| 词条详情 | `term.html` | 定义、机制、工程关联、来源与核验时间、相关术语、上 / 下一条 |
| 互动实验室 | `lab.html` | 3D 脑解剖、认知实验模拟、神经信号与范式、BCI 案例拆解 |
| 学习工具 | `learn.html` | 拼写与缩写训练、测验、错题本、收藏、进度统计 |
| 社区 | `community.html` | 论坛式问答：发帖、楼层回复、点赞、收藏、举报、管理员审核 |
| 我的学习 | `dashboard.html` | 学习目标、今日进度、模块掌握度、薄弱项推荐 |
| 教材导读 | `reading.html` | 55 本教材 / 文献、9 个分类、5 条学习路径，官方网页外链 |
| 内容生态 | `explore.html` | BCI 专区、神经科学 ↔ 工程对照、科研前沿速览、数据来源 |
| 关于 | `about.html` | 项目定位、准确性声明、使用指南、项目文件、反馈箱 |
| 使用指南 | `guide.html` | 一分钟上手、各功能区说明、个性化与无障碍、数据与隐私、免责声明 |
| 数据来源 | `updates.html` | 41 个来源登记、同步记录、待审更新队列 |

<details>
<summary>完整页面清单（27 页）</summary>

`index.html`、`terms.html`、`term.html`、`reading.html`、`docs.html`、`about.html`、`admin.html`、`learn.html`、`spelling.html`、`spelling-run.html`、`spelling-result.html`、`quiz.html`、`quiz-run.html`、`quiz-result.html`、`lab.html`、`lab-anatomy.html`、`lab-cogsim.html`、`lab-signals.html`、`lab-bci.html`、`explore.html`、`bci.html`、`bridge.html`、`frontier.html`、`community.html`、`dashboard.html`、`guide.html`、`updates.html`

</details>

### 内容规模（V5.0.0，词库 333 条）

| 维度 | 当前数量 |
| --- | --- |
| 知识模块 | 11 个（神经元与神经信号、突触与神经递质、脑解剖、感觉与知觉、运动控制、注意、记忆、语言、情绪、认知方法、BCI 基础） |
| 词条 | 333 条（11 模块 29–32 条；每条含中英名、缩写、别名、拼音、定义、机制、工程关联、相关术语、来源与时间戳） |
| 检索别名 | 755 条（平均每词条 2.27 条，每词至少 2 条） |
| 教材 / 文献 | 55 本，9 个分类，5 条学习路径 |
| 来源登记 | 41 个唯一来源，聚合 334 条引用；无来源词条 0 |
| BCI 专区 | 5 个主题、24 个术语、6 环节链路、4 个案例入口 |
| 工程对照 | 5 组、20 行双列映射 |
| 科研前沿 | 13 条（含 DOI / 来源与日期） |
| 互动模块 | 3D 脑解剖（真实皮层网格 + 分区部件）、3 个认知实验、4 组信号范式、4 个 BCI 案例 |
| 双语覆盖 | 中文 / English 全站切换（界面 + 主要文案） |

---

## V0–V5 版本路线

> 自 V5.0.0 起，版本号从旧的线性 `v1.x` 体系切换为**阶段版本 `V0–V5`**：一个主版本对应一个可交付里程碑，补丁用 `V5.0.x`，内容扩容用 `V5.x.0`。历史条目不重写，旧号与新号的对照见 `docs/CHANGELOG.md` 顶部。

| 版本 | 对应阶段 | 主题 | 主要交付 | 状态 |
| --- | --- | --- | --- | --- |
| **V0** | Phase 0 | 规范与原型 | 词条 schema 冻结、11 模块、110 条打样词条（V5 扩至 333）、Vue 原型（已归档） | 已交付 |
| **V1** | Phase 1–2 | 词条与检索 | 原生离线站、词条详情、关键词 / 缩写 / 拼音检索、模块筛选、高亮 | 已交付 |
| **V2** | Phase 3 | 学习工具 | 拼写与缩写训练、测验（单选 / 多选 / 填空）、错题本、收藏、进度 | 已交付 |
| **V3** | Phase 4–5 | 互动与内容生态 | 3D 脑解剖、认知实验、信号范式、BCI 案例；BCI 专区 / 工程对照 / 前沿 / 教材导读 | 已交付 |
| **V4** | Phase 6–8 | 云端、数据与社区 | 账号与云同步、AI 助教、反馈箱、来源登记与定时同步、论坛社区、个性化、无障碍与双语 | 已交付（云端能力可选） |
| **V5** | Phase 9 | 适配与发布 | 320–1920px 响应式收口、性能优化、使用指南、GitHub 仓库与 Pages 发布；词库 110 → 333 条 | **当前版本** |

后续计划：

- `V5.x`：词条已从 110 条扩容到 333 条（分模块产出、逐条来源核验）——2026-11-20 完成；
- `V5.x`：云端 Human Gate（换设备登录同步、社区多人共享）按需复验；
- 不再以 Vercel 作为交付前提，GitHub Pages 为默认发布通道。

---

## 技术架构

```text
浏览器
  ├─ 原生 HTML / CSS / JS（无框架、无构建步骤、无 CDN）
  ├─ 本地数据层：data/*.json → assets/js/data/*.js（构建期内联，file:// 可读）
  ├─ 本地持久化：localStorage（进度 / 收藏 / 错题 / 偏好 / 打卡 / 论坛本机数据）
  └─ 可选云端：Supabase Auth + PostgREST + Realtime / AI 助教 Edge Function
```

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端 | 原生 HTML/CSS/JS | 双击即用；无打包器、无运行时依赖 |
| 数据 | JSON 源文件 + 构建期内联 | `data/` 是唯一数据源，`outputs/neurobase/assets/js/data/` 是产物 |
| 3D | three.js（本地化） | 真实皮层表面 fsaverage5 + MNI152 aseg 深部结构 + 程序化解剖建模 |
| 云端 | Supabase（可选） | Auth / RLS / PostgREST / Realtime；未配置时全站优雅降级 |
| AI 助教 | Supabase Edge Function（可选） | Provider Key 只存平台 Secrets，前端只拿公开 publishable key |
| 定时同步 | GitHub Actions / Cloudflare Cron | 拉取来源元数据、比对更新、写入待审队列 |
| 发布 | GitHub Pages | Actions 构建并上传 `outputs/neurobase`（项目站点） |

---

## 目录结构

```text
.
├─ README.md                  # 本文件
├─ VERSION                    # 当前发布版本（V5.0.0）
├─ AGENTS.md                  # 项目常驻维护规则（记录 + 密钥）
├─ docs/                      # 计划、范围、变更日志、决策、错误档案、部署手册
│  ├─ CHANGELOG.md            # 版本迭代日志（按日期）
│  ├─ DEV_LOG.md              # 开发日志（阶段总览 + 按日期条目）
│  ├─ DECISIONS.md            # 决策记录（D-001 …）
│  ├─ ERROR_LOG.md            # 错误档案（E-001 …，五问模板）
│  ├─ PLAN.md                 # 计划与验收基线
│  ├─ PROJECT_SCOPE.md        # 范围与成功标准
│  ├─ DEPLOY.md               # 部署与云端开通手册
│  ├─ READING_LIST.md/.json   # 教材 / 文献基准
│  └─ supabase/               # schema.sql / community-v2.sql / 说明
├─ outputs/neurobase/         # 交付站点（27 页 + assets，file:// 直接打开）
├─ outputs/Tong Wang_NeuroBase.pdf  # 课程项目报告（A4 / 19 页，V5.0.2 同步 333 条词库）
├─ data/                      # 词条、来源、教材、内容生态数据源
├─ scripts/                   # 构建与来源同步脚本（Node）
├─ workers/                   # Cloudflare Workers（AI 助教 / 来源巡检）
├─ supabase/functions/        # Supabase Edge Function（AI 助教）
└─ .github/workflows/         # 来源同步 + GitHub Pages 发布
```

---

## 开发与自测

项目不依赖前端构建，但数据与自测需要 Node.js（建议 20+）。

```powershell
# 1) 重建前端数据（词条 / 文案 / 教材 / 内容生态）
node scripts/build-site.mjs

# 2) 校验来源登记、引用完整性与词条唯一性
node scripts/check-sources.mjs

# 3) 全站回归（jsdom 静态渲染 + 断言）
node .deepworks/tmp/checks/verify-native.mjs
```

> `verify-native.mjs` 位于本地维护目录（不随仓库发布），V5.0.0 基线为 **1138 项通过、0 失败**。仓库内的 `scripts/build-site.mjs` 与 `scripts/check-sources.mjs` 可直接运行。

修改任何 `outputs/neurobase/**` 下的 JS / CSS / HTML 后，必须同步 bump 27 个 HTML 的 `?v=` 缓存指纹，否则 `file://` 下会出现「页面是新的、逻辑是旧的」。

---

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/pages.yml`：推送到 `main` 后自动上传 `outputs/neurobase` 并发布。

1. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**；
2. 推送到 `main` 触发 `Deploy NeuroBase to GitHub Pages`；
3. 发布地址：`https://cuprum0214.github.io/neurobase.github.io/`。

也可以在本地用任意静态服务器托管 `outputs/neurobase/`；站点内所有资源均为相对路径，部署在子路径下无需改配置。

---

## 安全与隐私

- **不入库**：`.env*`、`.dev.vars`、`*.pem`、`*.key`、`*.p12`、`*token*.txt`、`*secret*.txt`、`supabase/.temp/`、`uploads/`、`.deepworks/`。
- **前端唯一的密钥形态**是 `assets/js/cloud-config.js` 中的 Supabase **publishable / anon** key——这是设计允许公开的凭据，权限完全由数据库 RLS 约束；仓库内**没有** `service_role`、AI Provider Key、Cloudflare API Token 或任何管理员口令明文。
- AI 助教的 Provider Key 只存在于 Supabase Edge Function Secrets；来源同步的 `service_role` 只存在于 Cloudflare / GitHub Actions Secrets。
- 学习进度、收藏、错题、偏好、打卡默认只保存在浏览器本机；登录后才会按账号同步。无痕 / 受限存储环境会给出提示并降级。

---

## 文档

| 想知道 | 看这里 |
| --- | --- |
| 每个版本改了什么 | [`docs/CHANGELOG.md`](docs/CHANGELOG.md) |
| 每个阶段做了什么、遇到什么问题 | [`docs/DEV_LOG.md`](docs/DEV_LOG.md) |
| 为什么这样选、放弃了什么 | [`docs/DECISIONS.md`](docs/DECISIONS.md) |
| 踩过的坑与可复用教训 | [`docs/ERROR_LOG.md`](docs/ERROR_LOG.md) |
| 计划、验收标准与 Human Gate | [`docs/PLAN.md`](docs/PLAN.md) |
| 范围、成功标准与非目标 | [`docs/PROJECT_SCOPE.md`](docs/PROJECT_SCOPE.md) |
| 部署、Supabase、AI 助教开通 | [`docs/DEPLOY.md`](docs/DEPLOY.md) |
| 教材与文献基准 | [`docs/READING_LIST.md`](docs/READING_LIST.md) |

站内也可以直接打开 `outputs/neurobase/docs.html` 阅读全部项目文档。

---

## 数据、来源与免责声明

- 每条词条标注来源类型、来源与核验时间；来源表提供 Crossref / WorldCat 检索入口，用于自行核对版本与页码，**不伪造原文链接、不复制版权原文**。
- 内容由 AI 起草 + 人工逐条审核，**不宣称 100% 正确**；发现错误请通过站内反馈箱提交。
- 本站用于学习与教学演示，**不构成医学诊断或治疗建议**。
- 教材、论文、脑图谱的版权归原作者与出版方所有；本站仅做知识点关联与导读。

---

## 路线图

- [x] 词条扩容：110 → 333（11 模块 29–32 条，2026-11-20 完成；逐条来源与核验时间齐备）
- [ ] 云端复验：换设备登录同步、社区多人共享、AI 助教限流与内容安全
- [ ] 无障碍持续复核：键盘全流程、对比度、屏幕阅读器、减少动效
- [x] V5.0.0：响应式收口、性能优化、使用指南、GitHub Pages 发布

---

**项目负责人**：王童（WT） · **仓库**：[Cuprum0214/neurobase.github.io](https://github.com/Cuprum0214/neurobase.github.io)
