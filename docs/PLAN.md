# NeuroBase · 项目计划（PLAN.md）

> 本文件回答 **How are we going to build it?**（对应课程 DEFINE 阶段的 `PLAN.md`）。
> 本文件是项目的唯一事实基线（Single Source of Truth）。范围、任务、验收、自测、人工验收与退出条件均记录于此。
> 任何范围变更必须写入文末「变更记录」，不得静默修改。
>
> 版本：v129，2026-11-26，**交互式脑解剖修复左图右讲解布局并恢复点击部件联动**：删除 `#anatomy-3d-wrap` 后多余的闭合 `</div>`，`.anatomy-stage` 重新包含 3D / 2D / 矢状三视图，`aside.anatomy-info` 回到 `.lab-anatomy` 两列网格第二列；`selectPart` 恢复调用 `selectRegion`，点击分区部件右侧显示名称 / 说明 / 关键词 / 相关词条；≤860px 仍单列堆叠；`verify-native` 1137 全绿，新增 DOM 层级断言；27 页指纹 `?v=1203` → `?v=1204`（364 处）；CHANGELOG V5.0.5、D-102、E-066、SCOPE v7.7
> 上一版本：v128，2026-11-26，**交互式脑解剖取消单部件弹窗，改鼠标手势 + 标题下提示**：`page-lab-anatomy.js` 删除「旋转 / 复位」弹窗与旋转模式状态机，分区部件模式改为左键拖动平移 / 右键拖动旋转 / 左键双击复位，`OrbitControls` 关闭右键平移；`lab-anatomy.html` 标题下新增 `#anat3d-tip` 手势提示（i18n `dragTip` / `partResetDone`）；点击分区部件不联动右侧信息面板（本轮先不做，保留高亮）；旧会话存档的 `rotate` / `menu` 字段读取时忽略；同步修复 `verify-native.mjs` 与 `build-docs.mjs` 硬编码工作区路径；`verify-native` 1136 全绿；27 页指纹 `?v=1202` → `?v=1203`（364 处）；CHANGELOG V5.0.4、D-101、E-065、SCOPE v7.6
> 上一版本：v127，2026-11-21，**课程报告删除三处未闭环表述**：`report.html` 删除摘要「结论」中的「项目当前的短板同样明确……」整句，以及 5.5「仍未闭环的问题」表的「云端多人场景复验 / 待复验」「课程评分反馈 / 待提交」两行（表格 5 行 → 3 行）；由 `make-pdf.mjs` 重出 `outputs/Tong Wang_NeuroBase.pdf`（A4 / 19 页 / 2.81 MB）并回写 ASCII 元数据；重建 `docs-content.js`，指纹 `?v=1201` → `?v=1202`；CHANGELOG V5.0.3、E-064、SCOPE v7.5
> 上一版本：v126，2026-11-20，**课程报告同步 333 条词库并更名**：报告数字由 `stats.mjs` 从 `data/*.json` 与 `docs/*.md` 重算（333 词条 / 755 别名 / 41 来源 334 引用 / 难度 122-153-58 / 文档 105-99-61）；2.6 增补扩容段；首页 / 检索 / 手机端截图重抓（解剖 / 论坛沿用）；交付更名 `outputs/Tong Wang_NeuroBase.pdf` 并写 ASCII 元数据；重建 `docs-content.js`，指纹 `?v=1200` → `?v=1201`；CHANGELOG V5.0.2、D-100、E-063、SCOPE v7.4
> 上一版本：v125，2026-11-20，**迭代文档按课程四张规范对齐（五问 / 三档案分工 / PLAN 六要素 / SCOPE 八项）**：`ERROR_LOG.md` 五问改为「要写的问题 / 含义」表格并保留落盘模板，索引 61 行按编号升序、正文 E-055 / E-057 归位；`PLAN.md` §5 明写六要素定义与逐阶段核对；`PROJECT_SCOPE.md` 文首补八项定义表，§4.11 / §八 由 110 条旧口径更新为 333 条；无站点代码改动，仅重建 `docs-content.js`，27 页指纹 `?v=1196` → `?v=1200`（364 处）；CHANGELOG V5.0.1、D-099、E-062、PROJECT_SCOPE v7.3
> 上一版本：v124，2026-11-20，**词库扩容至 333 条（11 模块全覆盖）**：正式词库 110 → 333（anatomy 30 / attention 30 / bci 32 / emotion 31 / language 31 / memory 31 / methods 29 / motor 31 / neuron 30 / sensory 29 / synapse 30，共 +223）；拼音与首字母由 `pypinyin` 生成并逐条校验（333/333）；`sources.json` 重建（333 词条 / 334 引用 / 41 来源）；清除 sample 与 phase1 重复条目、统一 motor 引用；`verify-native` 断言改为动态计算并 **1138 项全绿**；指纹 `?v=1195` → `?v=1196`；CHANGELOG v1.25.5、D-098、PROJECT_SCOPE v7.2
> 上一版本：v122，2026-11-20，**V5 发布：版本体系 V0–V5 + README + GitHub Pages**：版本号由线性 `v1.25.4` 切换为阶段版本（V0 = Phase 0 … V5 = Phase 9），当前 **V5.0.0**；新增根 `README.md` 与 `VERSION`，全站页脚显示 `V5.0.0`；新增 `.github/workflows/pages.yml` 发布 `outputs/neurobase` 到 GitHub Pages（`https://cuprum0214.github.io/neurobase.github.io/`）；Phase 6 / 8 状态由「待验收」收口为「已通过」，Phase 9 改为「已发布」；`verify-native` 1138 全绿；CHANGELOG V5.0.0、D-096、E-060、PROJECT_SCOPE v7.0
> 项目负责人：王童
> 上一版本：v121，2026-11-20，**交付形态确定：仅本地离线，不部署 Vercel**：交付物锁定 `outputs/neurobase/**`，浏览器 `file://` 直接打开；取消线上发布计划，`vercel.json` 仅作历史配置保留；清理 `.deepworks/tmp/citest` 旧站副本（62 文件）；`verify-native` 全绿；CHANGELOG v1.25.4、D-095、PROJECT_SCOPE v6.70
> 上一版本：v120，2026-11-20，**帮助导览高亮校准 + 讲解区块 + 全站字号 / 按键基线**：导览气泡新增「讲解」区块（每步 2–3 条要点，`core.js` EXTRA 中英各 20 键）与步骤进度条；`help.js` 定位改为「程序滚动期间关闭 smooth → 同步滚动 → 可视带居中（顶栏下 / 气泡上）→ 双帧 rAF + 700ms 逐帧校准」，修复窄屏重复 `#nb-fb-open` / `#nb-help-open` 取到隐藏节点、贴边外扩溢出、`#nb-tour-skip` 文案缺失、遮罩二次压暗；新增 `--nb-read-boost: 1.1` / `--nb-read-scale`，正文 17.6px、`--t-sm` 15.4px、`--t-xs` 13.2px，认知实验页同步乘同一基线；按键 `.btn` 升到 `--t-base` + `.55rem 1rem` 内边距（约 42px 高），`.btn-primary` / `.btn-accent` / `.nb-back` / `.chip` / 输入框同步；`verify-native` **1138 项全绿**（净增 27 条、改写 5 条）；27 页指纹 `?v=1183` → `?v=1184`（364 处），交付时全站统一；CHANGELOG v1.25.3、D-093 / D-094、E-059、PROJECT_SCOPE v6.69
> 项目负责人：王童
> 上一版本：v119，2026-11-20，**Phase 9 · 适配与发布（代码与文档就绪，线上待发布）**：27 页 × 7 档（320–1920）响应式审计归零（0 页面级横向滚动 / 0 控制台错误 / 0 页面异常，修复前 26 页 × 5 档共 130 个溢出单元）；桌面导航断点 767 → 1199px；窄屏工具栏换行、≤420px 搜索框堆叠与图标化；`.select` 限宽、社区筛选换行；`docs.html` / `lab-anatomy.html` 大脚本 `defer`；`vercel.json` 资源 1 年 immutable + HTML 重新验证；新增 `guide.html`（使用指南 / 免责 / 来源，45 个 `manual.*` 键）；首屏 591KB、FCP 272–320ms、60fps；死链 0；`verify-native` **1132 项全绿**、`a11y-check` 27 页；指纹 `?v=1181` → `?v=1182`（363 处）；CHANGELOG v1.25.2、D-090–D-092、E-058、PROJECT_SCOPE v6.68
> 项目负责人：王童
> 上一版本：v118，2026-11-20，**术语检索页说明文案与状态对齐**：说明条从「Phase 1 试运行词条（每模块至少 1 条）」改为「覆盖全部学习模块，支持中文 / 英文 / 缩写 / 全拼 / 拼音首字母检索」；`terms.desc` 补全拼与首字母、`terms.empty` 改为操作指引；说明条改用 `.notice--info` 中性信息样式并补暗色适配；zh / en i18n 三键同步后重建 `i18n.js`；`verify-native` **1132 项全绿**；27 页指纹 `?v=1182` → `?v=1183`（364 处）；CHANGELOG v1.25.1、E-057、PROJECT_SCOPE v6.67
> 项目负责人：王童
> 上一版本：v116，2026-11-20，**「学习中心」删除两段说明文字**：`learn.html` 删除标题下的 `page-desc`（闪卡 / 拼写 / 测验 + 本机保存说明）与「选择工具」小节下的 `sec-desc`（三种工具配合使用），页面由标题直接进入工具卡网格；`data/i18n/zh.json` / `en.json` 删除无引用的 `learn.desc` / `learn.toolDesc` 并重建 `assets/js/data/i18n.js`；`verify-native` **1104 项全绿**，失败 0；26 页指纹 `?v=1178` → `?v=1180`（352 处）；CHANGELOG v1.24.10。
> 项目负责人：王童
> 上一版本：v115，2026-11-20，**「我的学习」删除偏好设置卡片**：`dashboard.html` 移除主题 / 动效 / 语言 / 字号四项与字号说明，保留「本机数据」独立卡；`page-dashboard.js` 删除 `renderPrefs()` 与四个设置绑定，`dashboard.desc` 与 meta description 同步改写；i18n 新增 `dashboard.prefDataTitle`；`verify-native` **1104 项全绿**（删除偏好设置旧断言、新增本机数据卡断言）；26 页指纹 `?v=1176` → `?v=1178`（352 处）；CHANGELOG v1.24.9、D-088、E-054。
> 项目负责人：王童
> 上一版本：v114，2026-11-20，**顶部导航当前栏目蓝色色块**：桌面 `.main-nav a[aria-current='page']` 改为实心 `var(--primary)` 蓝底 + `#fff` 白字 + 600 字重，hover 用 `--primary-dark`；窄屏 `.main-nav-mobile` 同步由灰色块改为同款蓝块；补齐 i18n 缺失的 `toolbar.fontCustom` / `toolbar.fontInvalid` / `labCogsim.digitAnswerReveal`；`verify-native` 1102 → **1104 通过、0 失败**（+2 条色块断言）；26 页指纹 `?v=1175` → `?v=1176`（352 处）；CHANGELOG v1.24.8、D-087、E-054。
> 项目负责人：王童
> 上一版本：v113，2026-11-20，**打卡本纸面去掉横线**：`.ck` 删除 `repeating-linear-gradient` 横线纹理，只保留 `#fffdf4` 纯色，圆角 / 投影 / 线圈 / 日期色块不变；`verify-native` +1（纸面不含 `background-image`）1109 全绿、`probe-checkin` +1（`backgroundImage === none`）43 全过、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1173` → `?v=1174`（352 处）；CHANGELOG v1.24.7、D-086。
> 项目负责人：王童
> 上一版本：v112，2026-11-20，**论坛云端正式建立**：在 Supabase `neurobase`（`flayytlvrbhuainebzjd`）执行 `community-v2.sql`，建 `community_posts` / `replies` / `reports` / `checkins` / `reactions` / `bans` 6 张表 + RLS + `community_admin` RPC，posts / replies / reactions / bans 加入 Realtime；修复 `pgcrypto` 位于 `extensions` schema 导致的 42883（脚本顶部与 3 处函数内 `set search_path` 补 `extensions`）；`verify-native` **1108 项全绿**；未改前端资源，26 页指纹保持 `?v=1173`；CHANGELOG v1.24.6；D-085；E-053；DEV_LOG 2026-11-20。
> 项目负责人：王童
> 上一版本：v111（2026-11-20）**字号百分比支持键盘输入自定义**：顶部工具栏与「我的学习」的百分比都可点击，就地变为输入框；键盘输入 25–300 的整数，Enter / 失焦提交、Esc 取消，提交后滑块、显示值、`nb-font` 与 `--nb-font-scale` 同步；空值 / 非数字 / 越界回退当前值并播报，输入框最多 3 位且只保留数字；百分比元素补 `role="button"` / `tabindex="0"` 与 `aria-label`；新增 `NB.mountFontInput` 双入口共用；`verify-native` **1108 项全绿**；26 页指纹 `?v=1172` → `?v=1173`（352 处）；CHANGELOG v1.24.5、D-084、DEV_LOG 2026-11-20。
> 项目负责人：王童
> 上一版本：v110（2026-11-20）**记忆广度答错显示正确答案**：答错时结果区显示「错 · 正确答案：<数字序列>」并停留 1.6 s（第 1 次答错同长度重试、第 2 次答错结束），结算文案追加最后一题正确答案；新增 `digit.locked` 防反馈期间重复提交；i18n 新增 `digitAnswerReveal`（中英）；`verify-native` **1087 项全绿**；26 页指纹 `?v=1171` → `?v=1172`（352 处）；CHANGELOG v1.24.4、DEV_LOG 2026-11-20。
> 项目负责人：王童
> 上一版本：v109（2026-11-20）**账号名唯一性 + 论坛历史署名同步**：`profiles.display_name` 规范化为 `lower(btrim())` 唯一索引，`account_set_name()` SECURITY DEFINER RPC 负责登录校验 / 1–24 字 / advisory lock / 唯一冲突；旧 `prefs.displayName` 迁移；账号名保存必须联网并显示重名 / 断网 / 服务端未升级；改名成功后同一事务按 `user_id` 回填 `community_posts` / `community_replies` 的 `author`，并用 `nb-forum-rename` 标记 + `nb:account-name` 事件回填本机历史帖子 / 回复 / 禁言名单；`verify-native` 全绿、`cloud-check` **89**；指纹随并行轮次推进（全站 352 处统一）；SQL 需在 Supabase 执行 §19。
> 项目负责人：王童
> 上一版本：v108（2026-11-20）**首页版式重排：搜索框左上 / 每日一词公告牌 / 面板高度锁定**：h1 与描述移出蓝色面板成为 `.home-intro`；面板内 `.hero-left` = 搜索框 + `.daily-board`（蓝色外框 + 浅蓝纸面 + 图钉，正文 3 行截断），右端打卡本不变；打卡本固定 28rem、日历恒 6 行（42 格）、公告牌桌面填满 / 窄屏 17.5rem，翻月 / 换词 / 文案长短均不改变面板尺寸；修搜索按钮换行与窄屏标题压扁；`verify-native` +10 条（套件 1085 全绿）、`probe-checkin` 42 项（含高度稳定性 + 6 图）、`a11y-check` 26 页、`i18n-audit` 774 键；指纹 `?v=1171`；CHANGELOG v1.24.2、D-082、E-051。
> 项目负责人：王童
> 上一版本：v107（2026-11-20）**账号设置：可更改账号名**：已登录账号面板新增「账号设置」——账号名输入（1–24 字，留空用邮箱前缀）+ 保存；名字写入 `profiles.prefs.displayName`（本地即时生效、登录态 best-effort PATCH、跨设备合并），新增 `NB.cloud.account` 接口；登录后 `forum.authorName()` 与社区「修改昵称」统一以账号名为准，`identity` / `session` 事件即时刷新身份行；`http()` 无 `fetch` 时降级不抛错；`verify-native` 1057 → **1064 项**、`cloud-check` 59 → **71 项**；26 页指纹 `?v=1168` → `?v=1169`（352 处）；CHANGELOG v1.24.1、D-081、E-050。
> 项目负责人：王童
> 上一版本：v105（2026-11-19）**首页蓝色横幅右端新增便签本打卡签到**：`index.html` 的 `.hero` 在 ≥900px 改为「左文案 + 右打卡本」两栏，新增 `assets/js/checkin-widget.js` 与 `.ck-*` 样式；日历按月上下翻页（▲ 上一月 / ▼ 下一月 + 回到今天），日期格标记已签到、点日期回显记录；「签到」写入与社区共用的 `nb-checkin`，成功后弹出「签到成功」+ 18 句中英鼓励语之一；`verify-native` 新增 32 条（套件 1057 项全绿）、`probe-checkin` 28 项（1200 / 390 / 亮暗主题 + 5 张截图）、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1164` → `?v=1166`（351 处）；CHANGELOG v1.23.31、D-079、E-048。
> 项目负责人：王童
> 上一版本：v104（2026-11-19）**删除顶栏动画开关按钮**：全站顶栏移除 `#nb-motion-btn`（含只服务于它的 `motionLabel()` 与绘制 / 点击绑定），动画开关只保留「我的学习 → 偏好设置 → 动画效果」（`#ds-motion`）；`NB.setMotion` / `NB.applyMotion` 接口、`html.motion-off` 规则与 AI 悬浮球停帧均不变；i18n 删 `toolbar.motion*` 4 键、增 `dashboard.motionAnnounceOn / Off` 2 键并重跑 `build-data` 重建（zh / en 734 键）；**1008 项全绿**、`a11y-check` 26 页；26 页指纹 `?v=1162` → `?v=1164`；CHANGELOG v1.23.30、D-078。

---

## 0. 讨论决议记录（决策基线）

| 维度 | 决议 |
| --- | --- |
| 项目名称 | NeuroBase 神经与认知科学基础知识库 |
| 项目负责人 | **王童**（WT） |
| 目标用户 | 智能医学工程（脑机接口方向）本科生、入门自学者 |
| 核心功能 | 检索 + 科普 + 学习自测 + 互动可视化 + 内容生态 + 社区 |
| 知识模块 | 11 个模块（见 §2.2） |
| 词条规模 | **300+ 条**（含来源标注与时间戳） |
| 语言 | 中英双语，**支持界面/内容中英切换**（相对 v11 反转） |
| 检索方式 | 关键词 / 英文缩写 / 拼音 / 模块筛选 / 标签 / 高亮 / 相关术语 |
| 学习工具 | **拼写与缩写训练** / 测验（单选 / 多选 / 填空）/ 错题本 / 收藏 / 进度 / 分级路径 |
| 互动可视化 | 交互式脑解剖 / 认知实验模拟 / 神经信号与范式演示 / BCI 案例拆解 |
| 内容生态 | BCI 专区 / 神经科学与工程对照表 / 文献教材推荐与导读 / 科研前沿速览 |
| 教材/文献基准 | `docs/READING_LIST.md`（导读清单）与 `docs/READING_LIST.json`（结构化数据，55 条） |
| 社区与个性化 | 学习打卡与问答（**需审核**，相对 v11 反转）/ 个性化推荐与偏好 |
| 可访问性 | 多模态呈现 / 无障碍 WCAG 2.1 AA / 中英双语切换 |
| 知识来源 | 引用官方来源、标注来源与时间戳、联网定时更新、自检 |
| 技术形态 | 前端**原生 HTML/CSS/JS 离线版**（双击 `index.html` 即用；无框架 / 无构建 / 无 CDN，D-031）+ Supabase + Cloudflare Workers AI |
| 数据同步 | Cloudflare Cron / Supabase Edge Functions / GitHub Actions 定时拉取 |
| 部署 | Vercel/Netlify + Supabase 云 |
| 设备 | 手机与电脑同等重要（响应式） |
| 视觉风格 | 学术简洁·蓝白配色 |
| 内容生产 | AI 起草 + 人工逐条审核 |
| 分阶段策略 | 由简到繁，共 **10 个阶段（Phase 0–9）** |
| 内容准确性立场 | **不宣称 100% 正确**；以来源可溯 + 时间戳 + 自检 + 定期复核降错 |
| 合规底线 | 法律/学术/数据/AI/技术五条红线（见 PROJECT_SCOPE §6.4） |
| 人工验收 | 每阶段末集中验收，通过后方可进入下一阶段 |

---

## 1. 项目目标

### 1.1 总目标
交付一个**中英双语、手机与电脑均可用、内容来源可追溯**的神经与认知科学术语学习平台，覆盖 11 模块 300+ 词条，具备检索、科普、学习自测、互动可视化、内容生态与学习社区，并支持登录云同步、AI 助教与联网更新。

### 1.2 分阶段目标
- Phase 0：搭好脚手架、冻结词条 schema、自检全绿（**本地优先**；后端与托管见 Phase 6）。
- Phase 1–2：词条展示 → 检索筛选。
- Phase 3：学习工具（拼写与缩写训练 + 测验）。
- Phase 4：互动与可视化。
- Phase 5：内容生态（BCI 专区 / 工程对照 / 文献导读 / 前沿速览）。**✅ 全部上线（v51，2026-11-11）**
- Phase 6：全栈接入（账号 / 云同步 / AI 助教 / Realtime）。
- Phase 7：数据来源与实时更新（官方引用 + 定时同步 + 自检）。
- Phase 8：社区与个性化 + 可访问性与双语切换。
- Phase 9：适配与发布。

### 1.3 非目标（明确不做）
见 `PROJECT_SCOPE.md` §5。**重点**：不做无审核的开放发帖广场、不做用户众编词条、不做原生 App、不做医疗诊断、不复制版权原文、**不宣称内容 100% 正确**。

---

## 2. 内容定位与信息架构

### 2.1 深度定位
- 语言：简体中文 / 英文可切换，术语中英对照。
- 深度：面向本科入门，解释"是什么 + 机制 + 怎么用（工程）"。
- 对标：BCI 方向所需基础（EEG/fMRI 原理、P300/SSVEP/运动想象等）。

### 2.2 11 个知识模块（冻结）

| 编号 | 模块 ID | 模块名 | 词条数（目标） |
| --- | --- | --- | --- |
| M1 | `neuron` | 神经元与神经信号 | ~30 |
| M2 | `synapse` | 突触与神经递质 | ~28 |
| M3 | `anatomy` | 脑解剖分区 | ~30 |
| M4 | `sensory` | 感觉与知觉 | ~28 |
| M5 | `motor` | 运动控制 | ~26 |
| M6 | `attention` | 注意 | ~24 |
| M7 | `memory` | 记忆 | ~26 |
| M8 | `language` | 语言 | ~22 |
| M9 | `emotion` | 情绪 | ~24 |
| M10 | `methods` | 认知神经科学方法 | ~26 |
| M11 | `bci` | BCI 基础（含 BCI 专区） | ~36 |
| — | — | **合计** | **≥ 300** |

### 2.3 站点信息架构

```
首页 /（每日一词 + 模块入口 + 快速检索 + 进度概览 + 前沿速览）
│
├── 【检索】/search
├── 【术语库】/glossary        按模块浏览全部词条
├── 【词条详情】/term/:id      完整字段 + 来源标注 + 时间戳 + 相关术语
├── 【科普】/explore           脑区示意图 / 动画 / 视频外链 / 每日一词
├── 【互动实验室】/lab
│   ├── 脑解剖 /anatomy
│   ├── 认知实验模拟 /cog-sim
│   ├── 神经信号与范式 /signals
│   └── BCI 案例拆解 /bci-cases
├── 【内容生态】/explore
│   ├── BCI 专区 /bci            BCI 术语聚合 + 六环节链路 + 案例入口
│   ├── 神经科学↔工程对照 /bridge
│   ├── 文献/教材推荐与导读 /reading
│   └── 科研前沿速览 /frontier
├── 【学习】/learn
│   ├── 拼写与缩写训练 /spelling
│   ├── 测验 /quiz
│   ├── 错题本 /mistakes
│   ├── 收藏 /favorites
│   └── 进度 /progress
├── 【社区】/community        学习打卡 + 问答（需登录、需审核）
├── 【AI 助教】/assistant
├── 【关于】/about            使用指南 / 免责声明 / 来源说明 / 反馈箱（Phase 6 落地为可提交表单）/ 项目文件（docs/ 自动收录）
└── 【项目文件】/docs          过程文档总览（入口已并入「关于」栏目；docs/ 下 md/json/sql 自动收录，可渲染阅读或查看原始文件）
```

**已实现（原生离线版 v51：7 栏目 23 页 + 学习工具 + 互动实验室 + 内容生态）**

| 栏目 | 文件 | 状态 |
| --- | --- | --- |
| 首页 | `index.html` | ✅ 已实现（每日一词 / 模块入口 / 快速检索 / 进度概览 / 最近浏览） |
| 术语检索 | `terms.html` | ✅ 已实现（自写打分检索 + `<mark>` 高亮 + 模块筛选 + `?q=` / `?module=`） |
| 词条详情 | `term.html` | ✅ 已实现（全字段 + 来源与核验 + 相关术语 + 上/下一条 + 最近浏览） |
| 教材导读 | `reading.html` | ✅ 已实现（55 本 / 9 分类 / 5 条学习路径；`?cat=` 筛选、`?book=` 定位高亮） |
| 项目文件 | `docs.html` | ✅ 已实现（`docs/` 下 14 个 md/json/sql 自动收录并可渲染阅读；`?doc=<slug>`） |
| 关于 | `about.html` | ✅ 已实现（项目定位 / 负责人 / 模块数与词条目标 / 内容准确性声明 / 项目文件入口） |
| 反馈管理 | `admin.html` | ✅ 已实现（反馈箱数据查看 / 回复写回 `replies[]` / 已读管理；入口在反馈箱对话框底部） |
| 学习中心 | `learn.html` | ✅ 已实现（工具两入口卡片 / 错题本 / 收藏 / 进度统计） |
| 拼写与缩写 | `spelling.html` | ✅ 已实现（中→英 / 缩写 / 听写三模式判分） |
| 测验 | `quiz.html` | ✅ 已实现（单选 / 多选 / 填空 / 混合 · seeded 出题 · 逐题解析） |
| 互动实验室 | `lab.html` | ✅ 已实现（四类互动模块入口卡） |
| 脑解剖 | `lab-anatomy.html` | ✅ 已实现（3D 双模式均为真实解剖：真实表面（fsaverage5 pial，含沟回）+ 分区部件（4 叶真实网格分区；胼胝体 / 丘脑为 MNI152 aseg 真实分割网格；小脑 / 脑干 / 海马 / 侧脑室按解剖形态建模）；2D 解剖图与矢状剖面轮廓由真实网格投影生成；旋转 / 全部拆分 / 挪动 / 全部复位 / 点选（点选部位弹出「旋转 / 复位」单部位操作，复位不改视角） / 分层 / 标注） |
| 认知实验 | `lab-cogsim.html` | ✅ 已实现（Stroop / 反应时 / 记忆广度） |
| 信号范式 | `lab-signals.html` | ✅ 已实现（EEG / ERP-P300 / SSVEP / 运动想象） |
| BCI 案例 | `lab-bci.html` | ✅ 已实现（四案例六环节拆解） |
| 内容生态 | `explore.html` | ✅ 已实现（三板块入口 + 数据概览 + 建议顺序） |
| BCI 专区 | `bci.html` | ✅ 已实现（5 主题 24 术语 / 六环节链路 / 4 案例入口） |
| 工程对照 | `bridge.html` | ✅ 已实现（5 组 20 行双列 / 分组筛选 / 左列跳词条） |
| 前沿速览 | `frontier.html` | ✅ 已实现（13 条 / 5 类筛选 / DOI 与关联词条） |

> 其余栏目（`/community`、`/assistant` 等）为规划项，按 Phase 6–8 逐步落地；顶部导航列上述 **7 个栏目**（首页 / 术语检索 / 互动实验室 / 学习工具 / 教材导读 / 内容生态 / 关于），**不再有「功能开发中」置灰项**。

---

## 3. 技术方案

### 3.1 技术栈
- 前端：**原生 HTML + CSS + JavaScript**（无框架、无构建、无 CDN）—— **双击 `index.html` 即可离线使用**；页面外壳 / i18n / 学习进度 / 主题由 `assets/js/core.js` 统一提供，样式集中在 `assets/css/style.css`（以 CSS 变量组织）。
- 词条数据：构建期**内联为普通脚本**（`window.NB_TERMS` / `window.NB_I18N`）—— `file://` 下 `fetch` 与 ES module 均会被浏览器拦截；唯一数据源为工作区根 `data/*.json`（`i18n` 在 `data/i18n/`）。
- 检索：自写打分脚本（中文名 > 英文名 > 缩写 > 拼音 > 别名 > 定义 > 通俗解释 > 标签，含 exact / prefix / substring 加权与 `<mark>` 高亮），替代 Fuse.js。
- 间隔重复：SM-2 / FSRS 算法库。
- 自检：`node .deepworks/tmp/checks/verify-native.mjs`（jsdom 真实执行三页脚本，183 项断言）+ `node --check`；原 `npm run check`（validate + sync-docs + build）随技术栈更换退役。
- 后端：Supabase（Postgres + Auth + RLS + RPC + Realtime）。
- AI 助教：Cloudflare Workers。
- 数据同步：Cloudflare Cron / Supabase Edge Functions / GitHub Actions。
- 部署：Vercel/Netlify + Supabase 云。

### 3.2 词条数据模型
```json
{
  "id": "bci-p300",
  "module": "bci",
  "name_zh": "P300 电位",
  "name_en": "P300",
  "abbr": "P300",
  "pinyin": "P300",
  "definition": "……",
  "plain": "……",
  "related": ["bci-ssvep", "methods-erp"],
  "figure": "assets/figures/bci-p300.svg",
  "difficulty": "intro | intermediate | advanced",
  "tags": ["BCI", "ERP"],
  "engineering_link": "对应采集/解码环节：……",
  "references": [{ "type": "textbook", "title": "……", "verified_at": "2026-10-10" }],
  "updated_at": "2026-10-10T00:00:00Z"
}
```

### 3.3 数据表（Supabase）
- `profiles` / `progress` / `favorites` / `mistakes`（用户数据）。
- `sr_cards`（间隔重复调度：due、interval、ease/稳定性）。
- `terms` + `term_references`（词条与来源登记）。
- `resources`（文献/教材/前沿条目）。
- `community_posts` / `community_comments` / `reports`（社区 + 审核）。
- `feedback`（**反馈箱**：提交者、类型、内容、所在页面、状态、处理时间戳）/ `admins`。

### 3.4 视觉与无障碍规范
- 主题：学术简洁·蓝白配色；色对比度达 WCAG 2.1 AA。
- 语义化 HTML、键盘可达、屏幕阅读器兼容、色盲友好、动画可关闭。

### 3.5 安全与合规
- `anon` key 可公开；`service_role` 与 AI 密钥绝不进前端。
- AI 输出带"AI 生成，仅供参考"标注。
- 内容标注来源与"仅供参考，发现错误请反馈"。

---

## 4. 阶段总览

| Phase | 版本 | 名称 | 一句话目标 |
| --- | --- | --- | --- |
| 0 | V0 | 准备与规范 | 脚手架 + schema 冻结 + 自检全绿（✅ 人工验收通过） |
| 1 | V1 | 词条展示 | 能按模块浏览词条详情（内容达标 ✅ · 110 条 · UI 打磨 ✅ · 人工验收通过 ✅） |
| 2 | V1 | 检索与筛选 | 能搜到、能筛、能高亮（✅ 人工验收通过） |
| 3 | V2 | 学习工具 | 拼写与缩写训练 + 测验 + 错题本 / 收藏 / 进度（✅ 本地版已上线 · 人工验收通过） |
| 4 | V3 | 互动与可视化 | 脑解剖 / 认知模拟 / 信号范式 / BCI 案例（✅ 已上线 · 人工验收通过） |
| 5 | V3 | 内容生态 | BCI 专区 / 工程对照 / 文献导读 / 前沿速览（✅ 已上线 · 人工验收通过） |
| 6 | V4 | 全栈接入 | 账号 + 云同步 + AI 助教 + 反馈箱 + Realtime（✅ 已通过 2026-11-19） |
| 7 | V4 | 数据来源与实时更新 | 官方引用 + 定时同步 + 自检（✅ 已通过 2026-11-19） |
| 8 | V4 | 社区·个性化·可访问性 | 打卡问答 + 个性化 + 无障碍 + 双语（✅ 已通过 2026-11-20） |
| 9 | V5 | 适配与发布 | 手机 / 电脑打磨 + GitHub Pages 发布（✅ 已发布 2026-11-20） |

---

## 5. 各阶段详细计划

> 每个 Phase 都必须写清下面六件事（课程 `PLAN.md` 规范，缺一不可）：

| 内容项 | 含义 |
| --- | --- |
| Goal | 这个阶段要达成什么 |
| Tasks | 具体要做哪些事 |
| Acceptance Criteria | 达到什么标准才算完成 |
| How AI will test it | AI 怎么自测 |
| How the student will check it | 你本人怎么亲手确认 |
| Exit condition | 什么条件下才能进入下一阶段 |

> 结构自检（2026-11-20）：Phase 0–9 共 **10** 个阶段，六要素逐项齐全（脚本核对：六个标签各命中 10 处）。

### Phase 0 · 准备与规范（本地优先收口 ✅）
- **Goal**：搭好脚手架、冻结词条 schema（含来源字段）；确立无障碍与双语的信息架构。**后端与托管不在本阶段**。
- **Tasks**：初始化 `neurobase/`（Vue 3 + Vite + Tailwind + Pinia + vue-i18n）；冻结 schema（§3.2）；建 11 模块与打样词条；配置 i18n 骨架与语义化规范；建立本地自检脚本 `npm run check`。
- **Acceptance Criteria**：`npm run check` 全绿（schema 校验 + 模块覆盖 + 文档同步 + 构建通过）；示例词条符合 schema；i18n 骨架可切换中/英；dev 页可访问。
- **How AI will test it**：`npm run check`（校验脚本 + 构建）；dev 页 HTTP 探测与关键界面截图核对。
- **How the student will check it（Human Gate）**：你本人打开 dev 页，确认首页可见、能切中/英、能切主题与字号。
- **Exit condition**：本地脚手架能跑、schema 冻结、自检全绿、i18n 骨架可用（**本地优先**）。
- **说明**：本项目为个人项目、无他人协作，故 **Supabase 建库 / GitHub 连接 / Vercel 部署统一后置到 Phase 6** 一次性完成（见 `docs/DECISIONS.md` D-020）。
- **说明（v23）**：Phase 0 当时按 **Vue 3 + Vite** 落地；技术栈已于 v23 改为**原生 HTML/CSS/JS 离线版**（见 `docs/DECISIONS.md` D-031），上一条 Tasks 中的 Vue 相关描述保留为历史记录，后续阶段一律按原生方案执行。

### Phase 1 · 词条展示（内容达标 ✅ · 人工验收通过 ✅ · 现行 333 条）
- **Goal**：实现"按模块浏览 → 打开词条详情"。
- **Tasks**：术语库页 + 词条详情页；渲染全部字段（含来源标注、时间戳、工程对接、相关术语跳转、难度）；导入打样数据（每模块约 10 条）。
- **Acceptance Criteria**：11 模块均可进入；词条字段完整、相关术语可跳转；手机与电脑无横向溢出。
- **How AI will test it**：遍历所有模块与词条检查渲染与死链；截图核对。
- **How the student will check it（Human Gate）**：你用手机与电脑各浏览 3 模块、点开 3 词条。
- **Exit condition**：词条展示闭环通过。
- **说明（进度）**：11 个模块的打样词条已全部补齐至 **各 10 条（共 110 条）**，均为完整字段（中英名称 / 缩写·别名 / 拼音 / 学术定义 / 通俗解释 / 难度 / 标签 / 相关术语 / 工程对接 / 来源与时间戳），`related` 全部指向真实存在的词条，`npm run check` 五项全绿。剩余仅为 **Human Gate**（你用手机与电脑各浏览 3 个模块、点开 3 条词条；已于 2026-11-18 验收通过）。详见 `docs/DEV_LOG.md` 批次 1–4。**现状（v124 / V5.0.0）**：正式词库已扩至 **333 条**（11 模块 29–32 条，见 §2.2 与 `PROJECT_SCOPE` §4.11），本节验收结论仍指 2026-11-18 的 110 条打样范围。

- **说明（UI 打磨，v18）**：按用户反馈完成 6 项界面与交互打磨 —— ① 字号档位由「小/中/大」改为**百分比**（90% / 100% / 115%）；② 新增**学习进度**入口（右下角「继续学习」悬浮键 + 首页进度卡片，`nb-progress` 本地持久化）；③ 「项目文件」由顶部导航项**并入「关于」栏目**（`/docs` 路由保留）；④ 使用指南的问号图标改为**电灯**图标；⑤ **顶部工具栏在中/英切换下排布保持一致**（品牌 / 导航项 / 工具栏控件全部固定宽度）；⑥ 词条来源新增**「在教材导读中查看」跳转**（点击后定位并高亮对应教材）。

- **说明（UI 打磨 2，v19）**：字号由「90% / 100% / 115% 三档按钮」升级为 **25% ~ 300% 连续滑块自由拖动**（工具栏目板：滑块 + − / + 微调 ±5% + 6 个快捷预设 90/100/115/150/200/300）；旧偏好值 `sm/md/lg` 自动迁移为 90/100/115。顶部字号控件仍为**固定宽度**（`w-[5.5rem]`），D-023 的跨语言布局稳定不受影响（详见 D-027）。
- **说明（UI 打磨 3，v20）**：修复用户反馈的两个字号问题 ——「拖动时页面抽动」与「调节框内字体跟着变」。做法：新增**固定框架层** `.nb-fixed-ui`（`src/styles/main.css`），把 Tailwind v4 的间距/字号/圆角/容器变量在该层内**重新声明为等值 px**，顶部栏、页脚、悬浮进度键、使用指南浮层与字号面板因此**完全固定、不随字号缩放**；框架组件内少量 `[Nrem]` 任意值同步改写为等值 px；并固定滚动条占位（`scrollbar-gutter: stable`）、把拖动时的偏好写入合并为延迟落盘（`persistFont`）。**效果：仅内容区随字号缩放，拖动全程无抽动、无面板文字变化**（详见 D-028）。
- **说明（正文缩放，v21）**：按用户「只放缩正文，不改变页面」的要求，把 v20 的「只缩放内容区」进一步收紧为**只缩放正文文本** —— `:root` 的 `--nb-font-size: 100%` 改为**无单位倍数** `--nb-font-scale: 1`，`html { font-size: 100% }` 固定为布局基准；新增 `.nb-content` 层（挂在 `<main>`）只重写 10 个 `--text-*` 与继承字号（`calc(<rem> * var(--nb-font-scale))`），**不碰** `--spacing` / `--container-*` / `--radius-*`；`.md-body` 与文件查看器共 5 处 rem 字号同步接入。**效果：文字随滑块缩放，卡片宽度、页边距、间距、圆角、顶部栏全部纹丝不动**（行数变化导致的高度增长属预期，详见 D-029）。
- **说明（最近浏览，v22）**：按用户「切换术语时能回到刚才浏览的术语」的要求，`stores/progress.js` 的 `visited` 改为按**最近浏览顺序**维护（重访把 id 移到末尾），新增 `recent` getter（倒序、上限 12 条）；`views/TermDetailView.vue` 操作区新增**「最近浏览 (n)」按钮 + 折叠栏**（有历史才显示；排除当前词条，展示最多 8 条；点按即跳转并收起；支持 Esc、切换词条自动收起；`aria-expanded` / `aria-controls` 齐全）。数据仍只存在本机 `nb-progress`（详见 D-030）；同日调整（用户反馈）：按钮从第三位移到操作区**首位**，改用与右下角「继续学习」一致的**主色实心胶囊**（`bg-[#1e5fa8]`、白字、`rounded-full`、hover `#15467c`），数量改为 `bg-white/20` 徽章；折叠栏底色改为主色系浅蓝，标题与关闭按钮用主色。

- **说明（原生离线重写，v23）**：按用户「不要 Vue 版、双击 `index.html` 即可离线使用」的要求，Phase 1 的两页（术语检索 + 词条详情）已用**原生 HTML/CSS/JS 重写**，并新增首页，形成**单目录离线站点** `outputs/neurobase/`（词条仍为 110 条；视觉与交互契约 D-023 / D-027~D-030 全部沿用）。详见 `docs/DECISIONS.md` D-031 与 `docs/DEV_LOG.md` 2026-10-11 条目。

- **说明（第 1 批扩容，v24）**：第 1 批交付由 3 页扩为 **4 栏目 6 页** —— 新增**教材导读**（`reading.html`）、**项目文件**（`docs.html`）与**关于**（`about.html`），并把顶部导航 `reading` / `about` 两项**解除置灰**（现 4 项全部可点，不再有「功能开发中」状态）；`docs.html` 归属「关于」栏目并标记为当前页。数据与脚本层新增：`build-docs.mjs`（把 `docs/` 下 Markdown 子集渲染为内联 HTML，并对残留标记 / 块级数量 / 清单与磁盘一致性做自检）、页面数据文件 `data/reading.js`（`window.NB_READING`）、`data/docs-content.js`（`window.NB_DOCS`，322 KB）与 `data/docs-meta.js`（`window.NB_DOCS_META`，轻量清单：文件数与分组数）。详见 `docs/DEV_LOG.md` 2026-10-13 条目。

### Phase 2 · 检索与筛选（原生版已实现 ✅ · 人工验收通过 ✅）
- **Goal**：实现关键词、英文缩写、拼音检索与模块/标签筛选。
- **Tasks**：自写打分检索（中/英/缩写/拼音/别名/定义/标签；多词须全部命中；命中以 `<mark>` 高亮）；模块下拉筛选 +「显示全部」；URL 参数 `?q=` / `?module=` 直达；无结果提示；相关术语推荐（已在原生版第 1 批实现）。
- **Acceptance Criteria**：正常词/英文缩写/拼音可命中；无结果有提示；空输入不报错；原功能未破坏。
- **How AI will test it**：检索用例（正常/英文/拼音/空串/无效词）；控制台无报错。
- **How the student will check it（Human Gate）**：你亲自设计 ≥3 个测试输入验证。
- **Exit condition**：检索验收逐条通过。

### Phase 3 · 学习工具（拼写与缩写训练 + 测验）✅ 本地版已上线（v39）· 人工验收通过
- **Goal**：实现术语拼写与缩写训练、测验、错题本、收藏、进度。（闪卡模块已于 v48 删除）
- **Tasks**：拼写/缩写训练（看释义写英文、听写、纠错）；单选/多选/填空；错题本；收藏；进度统计与分级路径。
- **Acceptance Criteria**：拼写训练能判对错并给提示；测验提交即判分并展开解析；答错进错题本；进度页正确显示比例。
- **How AI will test it**：算法单测（判分、纠错）；边界（全对/全错/空答）。
- **How the student will check it（Human Gate）**：你本人做一遍某模块测验 + 拼写训练一轮，确认判分与错题本联动。
- **Exit condition**：学习工具验收通过（本地存储版）。

### Phase 4 · 互动与可视化（✅ 已上线 v50 · 人工验收通过 ✅）
- **Goal**：交付四类互动模块。
- **Tasks**：交互式脑解剖（点选/分层/标注/剖面）；认知实验模拟（Stroop/反应时/记忆广度）；神经信号与范式演示（EEG/ERP/P300/SSVEP/运动想象）；BCI 案例拆解。
- **Acceptance Criteria**：四类模块均可交互并有文字说明；动画可暂停/关闭；手机可操作。
- **How AI will test it**：交互脚本测试；多视口截图；控制台无报错。
- **How the student will check it（Human Gate）**：你本人操作一遍脑解剖与一个认知实验，判断演示是否准确、是否误导。
- **Exit condition**：四类模块验收通过。

- **说明（进度，v50）**：本阶段四项互动模块已全部上线（`outputs/neurobase/lab.html` 入口 + `lab-anatomy.html` / `lab-cogsim.html` / `lab-signals.html` / `lab-bci.html`）：交互式脑解剖为内联 SVG 侧视大脑（表面层 6 脑区 + 皮下层 4 结构 + 矢状剖面），支持点选、分层、标注与剖面切换，每个脑区带说明与相关词条链接；认知实验模拟包含 Stroop 效应、简单/选择反应时与数字记忆广度三个经典范式（计时 + 判分 + 结果说明）；神经信号与范式用 Canvas 动画演示 EEG α 节律、ERP/P300（oddball）、SSVEP（频率编码）与运动想象 μ-ERD，均可播放/暂停；BCI 案例拆解覆盖 P300 拼写器、SSVEP 控制、运动想象假肢与侵入式系统四个代表性案例，按六环节拆解。剩余仅为 **Human Gate**（你本人操作一遍脑解剖与一个认知实验，判断演示是否准确、是否误导；已于 2026-11-18 验收通过）。详见 `docs/DEV_LOG.md` 2026-11-09 条目。

  - **说明（进度，v51）**：应「让解剖图更接近现实 + 全景互动」要求，交互式脑解剖升级为 **3D 全景**——three.js（本地化，MIT）程序化建模解剖分区大脑（额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干 / 胼胝体 / 丘脑 / 海马 / 侧脑室，共 15 个 mesh 单元），支持拖拽旋转、自动旋转、拆分 / 合并、点选部件拖拽挪动、一键复位、点选显示说明与相关词条；页面提供 3D 全景 / 2D 示意图 / 剖面示意三视图切换。注意：网络探测（NIH 3D Print Exchange / Wikimedia / BodyParts3D / GitHub / npm）未能获取真实扫描级模型，当前 3D 模型为**程序化解剖分区示意**（用户已确认此方案），后续如获得 OBJ/STL/GLTF 真实模型可原位替换（部件 key 不变）。
  - **说明（进度，v53）**：应「外观与现实解剖相同、有沟回」要求，3D 视图新增**真实皮层表面模式（默认）**——FreeSurfer **fsaverage5 pial** 皮层表面（20484 顶点 / 40960 三角面，含真实脑沟脑回；来源 PennLINC/fsaverage5-Schaefer2018，t4 二进制解析 + 归一化后内嵌 `assets/vendor/three/brain-surface.js`，离线可用）；点击表面按 Talairach 坐标启发式近似归属 6 大表面脑区并显示说明（标注「近似归属」）；「真实解剖 / 分区部件」双模式切换（分区部件保留拆分 / 挪动 / 复位）。说明：fsaverage5 为 40 名被试平均的标准皮层模板（非个体扫描），沟回细节受网格分辨率限制，后续可换 fsaverage / fsaverage6 或个体扫描网格直接替换数据文件（无需改代码）。另修复拖动解剖块异常缩放（拖动期间暂停相机控制，深度不变）。
  - **说明（进度，v54）**：应「所有模型都按真实解剖制作 + 拖动仍异常放缩」要求：① 拖动根因修复——部件几何在子 mesh 上、group.position 恒为 0，旧逻辑以 group.position 建平面与偏移，首帧即把部件甩飞（透视呈缩放感）；现以部件世界包围盒中心建固定视平面、按交点差值相对平移。② 分区部件模式改为真实网格——pial 表面按 Talairach 启发式切割为额叶 / 顶叶 / 颞叶 / 枕叶 4 个真实部件（合计 40960 面，含沟回），小脑 / 脑干 / 胼胝体 / 丘脑 / 海马 / 侧脑室因 pial 数据不含而保留示意几何（后续可替换）。③ 数据转轴为 three.js y-up（修复躺倒），直径统一 1.25 与内部结构尺寸对齐。
  - **说明（进度，v55）**：应「拆分和截图中两项没有完全做到真实解剖模式」要求：① 「2D 示意图」「剖面示意」两个按钮与实际内容改为真实数据驱动——用 fsaverage5 pial 左半球三角面做侧视投影与近中线内侧面投影，栅格化 + marching squares 提取真实轮廓（侧视 123 点、额/顶/颞/枕 114/93/184/109 点、内侧面 283 点），写入 `assets/data/brain-2d.js` 并在页面注入 SVG；② 3D 深层结构改为解剖形态建模（扁平弓带胼胝体、C 形侧脑室弯管、叶片小脑、带桥脑膨大的脑干）；③ 按钮文案同步改名并更新中英说明。真实图片源（Wikimedia）本机不可达，故走"真实网格自生成"路径。
  - **说明（进度，v56）**：应「胼胝体、丘脑改成真实模型」要求：TemplateFlow S3 上的 MNI152 aseg（FreeSurfer 分割）含胼胝体五段（251–255）与双侧丘脑（10/49），用 NIfTI 解析 + 2× 降采样 + Surface Nets + Laplacian 平滑提取真实网格，并以「aseg 皮层 bbox → pial 皮层 bbox」逐轴仿射对齐到现有皮层坐标系；3D 部件模式与 2D/剖面轮廓全部改用真实数据，数据缺失时回退程序化形态。海马 / 侧脑室 / 小脑 / 脑干仍为建模（可后续用标签 17/53 等继续替换）。
  - **说明（进度，v57）**：应「学习中心改为学习工具、顶部栏学习→学习工具、删除首页学习工具与互动实验室模块」要求：i18n 与页面文案（中英）同步更名，learn.html 页内二级标题改为「选择工具」避免重名；首页删除两个 section（53 行）并移除对应统计脚本，首页仅保留 Hero 检索 / 每日一词 / 学习进度。

### Phase 5 · 内容生态（✅ 已上线 v65 · 人工验收通过 ✅）
- **Goal**：交付 BCI 专区、工程对照表、文献导读、前沿速览。
- **Tasks**：BCI 术语专区页；神经科学↔工程对照表；文献/教材分层推荐与导读（数据源 `docs/READING_LIST.json`）；科研前沿速览（摘要级 + 来源 + 时间）。
- **Acceptance Criteria**：专区内术语可跳转；对照表双列完整；导读分层清晰；前沿条目均带来源与日期。
- **How AI will test it**：检查内部链接、条目字段完整性、来源字段非空。
- **How the student will check it（Human Gate）**：你本人抽查 3 条对照、2 条前沿，确认表述合理、来源可信。
- **Exit condition**：内容生态验收通过。

- **说明（进度，v58）**：**Phase 5 四项已全部上线。** 文献/教材导读随原生离线版第 1 批上线（`reading.html`：55 本教材与文献 / 9 个分类 / 5 条学习路径，支持 `?cat=` 与 `?book=`）；本轮补齐其余三项并新增「内容生态」栏目：hub `explore.html`、BCI 专区 `bci.html`（5 主题 24 术语 / 六环节链路 / 4 案例入口）、神经科学↔工程对照 `bridge.html`（5 组 20 行 / 分组筛选 / 左列跳词条）、科研前沿速览 `frontier.html`（13 条 / 5 类筛选 / DOI 与关联词条）。数据源为 `data/bci_zone.json` / `engineering_map.json` / `frontier.json`，构建期断言术语引用与 DOI 非空；自测 744 项全绿，指纹 `?v=1117`。

- **验收记录（2026-11-18）**：用户确认 **Phase 0–5 全部通过人工验收**。Phase 1 的验收范围是当前 **110 条**打样词条（11 模块 × 10 条）；`PROJECT_SCOPE.md` §八 的「≥ 300 条」仍属最终成功标准，不在本次验收结论内，后续扩容另行推进。Phase 4 的真实解剖 3D / 2D / 剖面与 Phase 5 的来源抽查均以本次用户确认为准。

### Phase 6 · 全栈接入（含后端与托管开通）✅ 已通过（2026-11-19）
- **Goal**：接入账号、云端数据、AI 助教、Realtime；**并开通后端与托管**（Supabase 建库 / 仓库连接 / 部署）。
- **Tasks**：**创建 Supabase 项目并执行 `docs/supabase/schema.sql`（按原生离线版重写）；连接 GitHub 仓库并配置 Vercel 预览部署**；Supabase Auth；进度/收藏/错题/间隔重复卡云端持久化（RLS）；Cloudflare Workers AI 助教；**反馈箱**（提交表单 → `feedback` 落库、状态可追踪；未登录可提交但限流）；Realtime 更新。
- **Acceptance Criteria**：**Supabase 表创建成功且 RLS 生效；仓库与预览部署连通**；可注册/登录；未登录本地降级不报错；登录后换设备进度恢复；AI 助教可答术语问题且带免责标注；反馈箱可提交并落库、后台可见状态流转；`service_role` 未出现在前端。
- **How AI will test it**：**Supabase 探测接口与 RLS 用例**；登录流程、RLS（匿名读不到他人数据）、bundle 扫描敏感 key、Worker 连通性、反馈箱写入与限流。
- **How the student will check it（Human Gate）**：**在 Supabase Dashboard 亲眼确认数据表存在**；你换设备登录核对同步；向 AI 助教提问并判断回答质量；提交一条反馈并确认已落库、可查状态。
- **Exit condition**：全栈联调通过。

- **说明（进度，v1.23.0）**：**代码与部署材料已全部就绪，尚未做真实开通与人工验收。** 已交付：① `docs/supabase/schema.sql` 全量重写（8 表 / 全表 RLS / 6 RPC / Realtime，幂等可重跑）；② 零依赖云端层 `assets/js/cloud.js`（Auth、PostgREST、首次 merge / 改动 mirror / Realtime pull-merge、未配置 / 未登录 / 断网三级降级）；③ 账号与同步面板 `auth-ui.js`、配置模板 `cloud-config.js`（默认留空即纯离线）；④ AI 助教 `ai-tutor.js` + `workers/ai-tutor`（CORS / KV 限流 / 8 错误码 / 免责声明）；⑤ 反馈箱在线化（6 位查询码 + 凭码查回复）与管理端云端管理员模式；⑥ `vercel.json`、`.gitignore`、`docs/DEPLOY.md`。**待你完成的 4 项外部开通**：Supabase 建库跑 SQL、Cloudflare Workers AI 部署、GitHub 建仓推送、Vercel 导入部署（凭据清单与步骤见 `docs/DEPLOY.md` §0–§5；验收清单见 §6）。自测：`verify-native` 794 → **817 项全绿**、`cloud-check` **43 项全绿**。
- **验收记录（2026-11-19）**：Phase 6 已通过（依据：DEV_LOG 2026-11-19「Phase 6 验收通过后启动 Phase 7」）。AI 助教已切换为 Supabase Edge Function `hyper-worker` 并实测 200（v1.23.4）；Supabase 已执行 `schema.sql`（13 表全 RLS）与 `community-v2.sql`（6 张社区表 + Realtime，2026-11-20）；仓库与发布在 V5.0.0 通过 GitHub Pages 完成（D-096）。Vercel 不再是本阶段的必需项（D-095 / D-096）。

### Phase 7 · 数据来源与实时更新 ✅ 已通过（2026-11-19）
- **Goal**：建立"来源可溯 + 定时同步 + 自检"的知识更新机制。
- **Tasks**：来源登记表（`term_references`）；定时任务从权威源（Crossref/PubMed/官方脑图谱等）拉取 → 自动比对 → 人工抽检 → 发布；自检脚本（来源可溯、术语唯一、链接可达、时间戳新鲜度）；前端展示"最近更新"。
- **Acceptance Criteria**：每个词条均有来源与时间戳；定时任务可运行并产生更新记录；自检脚本可跑；异常进入待审队列；无来源词条数为 0。
- **How AI will test it**：跑自检脚本；模拟一次同步；检查时间戳与来源字段完整性。
- **How the student will check it（Human Gate）**：你抽查 ≥5 条，点开其来源确认**真实可核验**；确认页面标注了免责声明。
- **Exit condition**：来源与更新机制验收通过。

- **说明（进度，v1.23.17）**：**四项任务全部落地，等待人工抽检。** ① 来源登记：`data/sources.json` 将 110 词条 / 111 条引用按标题归并为 41 个唯一来源（教材 19 / 论文 12 / 综述 9 / 百科 1），url 为 Crossref / WorldCat 可核验检索入口，不伪造原文链接；无来源词条 0。② 定时同步：`scripts/sync-sources.mjs` 支持离线 / `--online`（Crossref，8s 超时降级）/ `--check-links`；首次运行产出 `data/sync-state.json` 与 `data/update-log.json`（2 次 run、13 条 DOI 核对、1 条真实待审）；`workers/source-sync` Cron 每周一 03:17 UTC 巡检链接与时效，GitHub Actions 同频执行三个脚本。③ 自检：`scripts/check-sources.mjs` 137 项（来源可溯 / 术语唯一 / URL 格式 / 365 天新鲜度 / 队列完整性）；`verify-native` 新增 23 项断言，总数 **876 项全绿**，`cloud-check` 59 项全绿。④ 前端：`updates.html` 展示概览 / 最近 12 条 / 41 行来源表 / 同步记录 / 待审队列；首页增加最近更新条；内容生态增加第 4 张入口卡；词条页每条来源带「打开核验入口」。数据库同步新增 `terms / sources / term_references / update_queue / sync_runs` 5 表（13 表全 RLS）与 `review_update()` RPC。指纹 `?v=1145`。
- **验收记录（2026-11-19）**：Phase 7 已通过；用户抽查 ≥5 条来源确认真实可核验，页面带免责声明（见 PLAN §6 Gate 第 7 行）。

### Phase 8 · 社区·个性化·可访问性 ✅ 已通过（2026-11-20）
- **Goal**：交付学习社区、个性化与无障碍/双语。
- **Tasks**：学习打卡 + 问答（登录、审核、举报、删除）；个性化（目标设置、进度看板、薄弱项推荐、偏好）；无障碍（键盘可达、语义化、对比度、屏幕阅读器、动画可关）；中英双语切换全覆盖。
- **Acceptance Criteria**：社区可发帖/评论且有举报入口；违规内容可被删除；个性化设置生效；WCAG 2.1 AA 关键项通过；中/英切换覆盖主要页面。
- **How AI will test it**：无障碍扫描（axe/Lighthouse）；i18n 覆盖检查；社区权限与举报流程测试。
- **How the student will check it（Human Gate）**：你本人**只用键盘**走完一次核心流程；切换英文界面走一遍；发一条贴并测试举报/删除。
- **Exit condition**：社区、个性化、无障碍与双语验收通过。
- **验收记录（2026-11-20）**：Phase 8 已通过（依据：DEV_LOG 2026-11-20 Phase 9 条目「Phase 8 人工验收通过后进入 Phase 9」）；社区已论坛化并接入 Supabase 云端（6 表 + Realtime），`a11y-check` 27 页通过，i18n 中英键集合一致。

### Phase 9 · 适配与发布 ✅ 已发布（GitHub Pages，2026-11-20）
- **Goal**：手机/电脑打磨并正式上线。
- **Tasks**：响应式打磨（320–1920px）；性能优化；部署静态站点（GitHub Pages / Netlify / Vercel 任选）+ Supabase 生产（可选）；撰写使用指南与免责/来源说明。
- **Acceptance Criteria**：手机与电脑核心流程完整；无横向溢出、无控制台报错；线上链接可公开访问。
- **How AI will test it**：多视口截图；Lighthouse；线上死链检查。
- **How the student will check it（Human Gate）**：你用手机完整走一遍"检索 → 看词条 → 测验 → 看进度"。
- **Status（2026-11-20）**：响应式（27 页 × 7 档 0 溢出）、性能（首屏 591KB / FCP ≤320ms）、使用指南（`guide.html`，含免责与来源）已完成；仓库已推送到 `Cuprum0214/neurobase.github.io`，`.github/workflows/pages.yml` 将 `outputs/neurobase` 发布到 **GitHub Pages**（`https://cuprum0214.github.io/neurobase.github.io/`）。Vercel 仍不作为交付前提（D-095 / D-096）；本地 `file://` 形态保持完整可用。
- **Exit condition**：线上可用且体验达标，项目交付完成。

---

## 6. 每个 Phase 的 Human-only Gate 一览

| Phase | 必须由你本人完成的动作 | 状态（2026-11-20） |
| --- | --- | --- |
| 0 | 打开 dev 页确认首页可用、可切中/英与主题 | ✅ 已通过 |
| 1 | 手机浏览词条详情 | ✅ 已通过 |
| 2 | 亲自设计 ≥3 个检索输入 | ✅ 已通过 |
| 3 | 做一遍拼写训练与一轮测验，核对错题本联动 | ✅ 已通过 |
| 4 | 操作脑解剖与一个认知实验并判断是否误导 | ✅ 已通过 |
| 5 | 抽查对照表与前沿条目的来源 | ✅ 已通过 |
| 6 | Dashboard 确认数据表存在；换设备登录核对同步；向 AI 助教提问；提交一条反馈 | ✅ 已通过（2026-11-19） |
| 7 | 抽查 ≥5 条来源是否真实可核验 | ✅ 已通过（2026-11-19） |
| 8 | 只用键盘走完核心流程；切英文界面走一遍 | ✅ 已通过（2026-11-20） |
| 9 | 手机完整走一遍核心流程 | ✅ 已发布（27 页 × 7 档通过、离线可用；GitHub Pages 在线地址见 §5 Phase 9 Status） |

---

## 7. 质量保障（DoD）

### 7.1 通用 DoD
- [ ] 功能按 Acceptance Criteria 逐条通过。
- [ ] 手机与电脑均无横向溢出、无控制台报错。
- [ ] 无死链、无敏感 key 泄露。
- [ ] 无障碍关键项（键盘、对比度、语义化）通过。

### 7.2 内容 DoD
- [ ] 词条字段完整、schema 合规。
- [ ] **每条词条都有来源标注与时间戳**，来源真实可核验。
- [ ] 不编造来源、不复制版权原文；术语中英对照且唯一。
- [ ] 页面标注"仅供参考，发现错误请反馈"。

---

## 8. 退出条件（项目级）
- 11 模块 ≥300 词条（含来源与时间戳）就绪；检索/科普/学习/可视化/内容生态可用。
- 全栈联通（账号、云同步、AI 助教、反馈箱、Realtime、定时更新）。
- 社区、个性化、无障碍、双语达标。
- 线上发布且手机/电脑体验达标。
- 10 个 Phase 人工验收全部通过，反馈已收集。

---

## 9. 记录与迭代

| 文件 | 回答什么 | 内容 |
| --- | --- | --- |
| `DEV_LOG.md` | 每个阶段做了什么 | 完成事项、问题、下一步 |
| `DECISIONS.md` | 为什么这样决定 | 重要决定 + 原因 + 取舍 |
| `ERROR_LOG.md` | 从错误学到什么 | 5 问：现象/初判/真因/如何修/学到什么 |

---

## 10. 变更记录

| 版本 | 日期 | 变更内容 | 原因 |
| --- | --- | --- | --- |
| v129 | 2026-11-26 | **交互式脑解剖修复左图右讲解布局并恢复点击部件联动**：删除 3D 视图后多余的闭合 `</div>`，`.anatomy-stage` 重新包含三个视图，`.anatomy-info` 回到两列网格第二列；`selectPart` 恢复 `selectRegion`，点击部件显示名称 / 说明 / 关键词 / 相关词条；`verify-native` 1137 全绿；指纹 `?v=1203` → `?v=1204`（364 处）；CHANGELOG V5.0.5、D-102、E-066、SCOPE v7.7 | 用户要求讲解放右侧 |
| v128 | 2026-11-26 | **交互式脑解剖取消单部件弹窗，改鼠标手势 + 标题下提示**：删除 `#anat3d-part-menu`（旋转 / 复位按钮）与 `setRotateMode` / `showPartMenu` 状态机；分区部件模式左键拖动平移、右键拖动旋转（`OrbitControls.mouseButtons.RIGHT = null` 避免相机平移抢事件）、左键双击复位；标题下 `#anat3d-tip` 常驻提示「左键拖动部件移动 · 右键拖动旋转部件 · 左键双击复位部件 · 滚轮缩放」；点击分区部件只高亮、不联动右侧信息面板（本轮先不做该联动）；旧存档 `rotate` / `menu` 字段忽略；`verify-native.mjs` 与 `build-docs.mjs` 改为按脚本位置解析工作区根；`verify-native` 1136 全绿；27 页指纹 `?v=1202` → `?v=1203`（364 处） | 用户要求取消弹窗、改为直接鼠标手势并在标题下提示；点击部件显示知识的需求暂缓 |
| v127 | 2026-11-21 | **课程报告删除三处未闭环表述**：删除摘要「结论」中「项目当前的短板同样明确——333 条词条 / 逐条复核 / 云端多人复验」整句；5.5「仍未闭环的问题」删「云端多人场景复验（待复验）」「课程评分反馈（待提交）」两行，保留词条规模、内容准确性、无障碍持续复核 3 行；`outputs/Tong Wang_NeuroBase.pdf` 重出（A4 / 19 页 / 2.81 MB，ASCII 元数据 title / author 保持）；重建 docs-content，指纹 `?v=1201` → `?v=1202` | 用户要求删除报告中指定的三处表述；重出时目标文件被阅读器占用（E-064），改为临时文件校验后替换 |
| v126 | 2026-11-20 | **课程报告同步 333 条词库并更名**：`outputs/Tong Wang_NeuroBase.pdf`（A4 / 19 页 / 2.81 MB）；数字重算（333 / 755 / 41 来源 334 引用 / 122-153-58 / 105-99-61）；2.6 新增扩容段；首页 / 检索 / 手机端截图重抓（解剖 / 论坛沿用）；元数据 title `NeuroBase - Project Report (V5.0.1)`、author `Tong Wang`；重建 docs-content，指纹 `?v=1200` | 报告交付后词库扩到 333 条，旧稿数字与截图过期；课程命名要求 Firstname Lastname（E-063） |
| v125 | 2026-11-20 | **迭代文档按课程四张规范对齐**：`ERROR_LOG.md` 五问改为「要写的问题 / 含义」表 + 落盘模板，索引 61 行按编号升序、正文 E-055 / E-057 归位；`PLAN.md` §5 明写 Goal / Tasks / Acceptance Criteria / How AI will test it / How the student will check it / Exit condition 定义并逐阶段核对；`PROJECT_SCOPE.md` 文首补八项定义表，§4.11 / §八 由 110 条旧口径改为 333 条；仅重建 `docs-content.js`，27 页指纹 `?v=1196` → `?v=1200`（364 处） | 用户要求按课程截图（五问 / 三档案分工 / 六要素 / 八项）核对并修改对应 md，且内容须与当前版本一致 |
| v124 | 2026-11-20 | **词库扩容至 333 条（11 模块全覆盖）**：110 → 333（各模块 29–32 条，共 +223）；新增词条覆盖结构、递质、感觉、运动、注意、记忆、语言、情绪、方法与 BCI；每条含中英文名 / 别名 / 全拼 / 首字母 / 定义 / 通俗解释 / 难度 / 标签 / 关联 / 教材来源；拼音由 `pypinyin` 生成并校验长度；`sources.json` 重建（333 / 334 / 41）；清除 sample、phase1 重复条目并统一 motor 引用；`verify-native` 动态断言 + **1138 项全绿**；指纹 `?v=1196`；CHANGELOG v1.25.5、D-098、SCOPE v7.2 | 用户要求「按 300+ 词条规模更新词库」并要求推送 GitHub |
| v123 | 2026-11-20 | **课程项目报告（PDF）交付**：`outputs/Wang Tong_NeuroBase.pdf`（A4 / 19 页）；章节覆盖背景与动机、V0–V5 历程与 6 张截图、功能与想法来源、6 个五问案例、108 条反馈分类与 9 条代表性决策、反思与附录；源文件 `.deepworks/tmp/report-work/` 不入库；站点未改、1138 全绿；CHANGELOG（V5.0.0 交付物补充）、D-097、E-061、PROJECT_SCOPE v7.1 | 课程第二个自由项目要求提交 PDF 报告（a–e 五项）并按 `Firstname Lastname_project name.pdf` 命名 |
| v122 | 2026-11-20 | **V5 发布：版本体系 V0–V5 + README + GitHub Pages**：版本号由线性 `v1.25.4` 切换为阶段版本（V0 = Phase 0 … V5 = Phase 9），当前 **V5.0.0**；新增根 `README.md` / `VERSION`，全站页脚显示版本；新增 `.github/workflows/pages.yml` 发布 `outputs/neurobase` 到 GitHub Pages；PLAN §4 / §5 / §6 与 DEV_LOG Phase 映射表统一收口 Phase 6–9 状态；`verify-native` 1138 全绿；CHANGELOG V5.0.0、D-096、E-060、PROJECT_SCOPE v7.0 | 用户要求「检测未完成任务并处理、按版本分配 V0–V5 修改版本号、按最新版本补 README 并同步 md、以 Cuprum0214 推送到 GitHub」；旧线性版本号不承载阶段语义，Phase 状态存在四套口径（E-060） |
| v121 | 2026-11-20 | **交付形态确定：仅本地离线，不部署 Vercel**：交付物锁定 `outputs/neurobase/**`，`file://` 直接打开；取消线上发布计划（`vercel.json` 仅历史保留）；清理 2026-11-19 旧站副本 `.deepworks/tmp/citest`（62 文件）；`verify-native` 全绿；CHANGELOG v1.25.4、D-095、PROJECT_SCOPE v6.70 | 用户明确「不需要 vercel，只要本地」；此前「线上是否更新」反复造成误判 |
| v120 | 2026-11-20 | **帮助导览高亮校准 + 讲解区块 + 全站字号 / 按键基线**：导览气泡新增「讲解」区块（每步 2–3 条要点，`core.js` EXTRA 中英各 20 键）与步骤进度条；`help.js` 定位改为「程序滚动期间关闭 smooth → 同步滚动 → 可视带居中（顶栏下 / 气泡上）→ 双帧 rAF + 700ms 逐帧校准」，修复窄屏重复 `#nb-fb-open` / `#nb-help-open` 取到隐藏节点、贴边外扩溢出、`#nb-tour-skip` 文案缺失；新增 `--nb-read-boost: 1.1` / `--nb-read-scale`，正文 17.6px、`--t-sm` 15.4px、`--t-xs` 13.2px，认知实验页同步乘同一基线；按键 `.btn` 升到 `--t-base` + `.55rem 1rem` 内边距（约 42px 高），`.btn-primary` / `.btn-accent` / `.nb-back` / `.chip` / 输入框同步；`verify-native` 净增 27 条断言（另 5 条改口径），**1138 项全绿**；27 页指纹 `?v=1183` → `?v=1184`（364 处），交付时全站统一；CHANGELOG v1.25.3、D-093 / D-094、E-059、PROJECT_SCOPE v6.69 | 用户要求「帮助高亮位置准确 + 增加讲解区块」，并「参考认知实验模拟页的字与按键大小，把其他页面适当放大，观感舒适统一」 |
| v119 | 2026-11-20 | **Phase 9 · 适配与发布（代码与文档就绪，线上待发布）**：新增 `phase9-responsive.mjs` 以「`scrollingElement.scrollLeft=400` 后能否真的滚动」为判据审计 26 页 × 7 档，首轮暴露 130 个溢出单元；修复：`.main-nav` 断点 767 → 1199px、≤767px 工具栏换行 + `.tb-btn` 去 6rem 固定宽、≤420px 主题 / 语言只留图标且首页搜索框上下堆叠、`.select` 加 `max-width:100%`、≤640px 社区 `.fm-tools` 换行；回归 27 页 × 7 档 0 溢出 / 0 报错。性能：`docs.html` 与 `lab-anatomy.html` 重脚本（1.37MB / 1.63MB）改 `defer`；`vercel.json` 的 `/assets/*` 改 `max-age=31536000, immutable`、HTML 改 `must-revalidate`；新增 `.vercelignore`；首屏 591KB、FCP 272–320ms、无长任务、60fps。发布：生成 `outputs/neurobase-site.zip`（1.68MB / 85 文件）、新增 `phase9-links.mjs`（74 个站内引用 0 死链）与 `phase9-live-check.mjs`；本机无法访问 `vercel.com`/`api.vercel.com`、Supabase 业务表 404，线上发布与建库待用户环境执行。指南：新增 `guide.html`（第 27 页，7 区块含免责与来源）+ 45 个 `manual.*` 键 + `page-guide.js` + `about.html` 入口卡。`verify-native` **1132 项全绿**、`a11y-check` 27 页、`i18n-audit` 通过；指纹 `?v=1181` → `?v=1182`（363 处）；CHANGELOG v1.25.2、D-090–D-092、E-058、PROJECT_SCOPE v6.68 | Phase 9 验收要求「手机与电脑核心流程完整、无横向溢出、无控制台报错、线上可访问」；本轮完成前三项并交付部署包，线上发布受本机网络与未建库限制 （2026-11-20 后续：用户决定公网发布暂缓，Phase 9 以本地离线交付收口，见 D-095） |
| v118 | 2026-11-20 | **术语检索页说明文案与状态对齐**：`terms.html` 说明条从「当前为 Phase 1 试运行词条（每模块至少 1 条），完整词库分模块持续补充中」改为「已收录神经与认知科学核心术语，覆盖全部学习模块；支持中文、英文、缩写、全拼与拼音首字母检索」；`terms.desc` 补「中文全拼 / 拼音首字母」、`terms.empty` 改为操作指引；说明条启用 `.notice--info` 中性信息样式（浅蓝底 + 蓝边框）并补 `html.dark .notice--info`；`data/i18n/zh.json` / `en.json` 三键同步并重建 `i18n.js`；`verify-native` 原「试运行说明存在」断言改为「说明文案含拼音首字母且无 Phase 1」；27 页指纹 `?v=1182` → `?v=1183`（364 处）；CHANGELOG v1.25.1、E-057、PROJECT_SCOPE v6.67 | 用户反馈「依旧是这样」：词库已 110 条，界面却仍写 Phase 1 试运行，按文案判断更新未生效 |
| v117 | 2026-11-20 | **术语检索词库补全**：110 条新增 `pinyin_initials`（中文名逐字声母）并接入 `core.js` 与 `TermsView.vue` 检索（`st` → 树突、`xzxzy` → 选择性注意，大小写不敏感）；修正 9 处拼音（基底神经节 / 胼胝体 / 大脑皮层 / 注意瞬脱 / 布罗卡失语症 / 事件相关电位 / 初级运动皮层 / 突触可塑性 / 突触传递）；`aliases` 170 → **303**（均值 2.75、无空值）；schema 新增字段、`validate-terms` 新增 5 类检索校验、重建 `terms.js`；`verify-native` **1132 项全绿**（本轮 +7 条）；26 页指纹 `?v=1180` → `?v=1181`（352 处）；CHANGELOG v1.24.11、D-089、E-055、PROJECT_SCOPE v6.66 | 用户要求「补全术语检索词库」：把首字母检索做实、修错误拼音、扩同义别名 |
| v116 | 2026-11-20 | **「学习中心」删除两段说明文字**：`learn.html` 移除 `page-desc` 与「选择工具」下的 `sec-desc`；`learn.desc` / `learn.toolDesc` 从 i18n 数据源删除并重建 `i18n.js`；`verify-native` 1104 全绿；指纹 `?v=1178` → `?v=1180`（352 处）；CHANGELOG v1.24.10 | 用户要求删除这两段说明文字（页面更简洁，直接进工具选择） |
| v115 | 2026-11-20 | **「我的学习」删除偏好设置卡片**：`dashboard.html` 移除主题 / 动效 / 语言 / 字号四项与字号说明，改「本机数据」独立卡；`page-dashboard.js` 删除 `renderPrefs()` 与相关绑定；`dashboard.desc` / meta description 改写；i18n 新增 `dashboard.prefDataTitle` 并把 `toolbar.fontCustom` / `fontInvalid` / `labCogsim.digitAnswerReveal` 写入 `data/i18n/*.json` 源；`verify-native` 1104 全绿；指纹 `?v=1176` → `?v=1178`（352 处）；CHANGELOG v1.24.9、D-088、E-054 | 用户要求「删除偏好设置，个性化只留顶栏」 |
| v114 | 2026-11-20 | **顶部导航当前栏目蓝色色块**：桌面 `.main-nav a[aria-current='page']` 改为实心 `var(--primary)` 蓝底 + `#fff` 白字 + 600 字重，hover 用 `--primary-dark`；窄屏 `.main-nav-mobile` 同步改同款蓝块；补齐 i18n 缺失的 `toolbar.fontCustom` / `toolbar.fontInvalid` / `labCogsim.digitAnswerReveal`；`verify-native` 1102 → **1104 通过、0 失败**（+2 条色块断言）；指纹 `?v=1175` → `?v=1176`（352 处）；CHANGELOG v1.24.8、D-087、E-054 | 用户要求「处于哪一栏目时，顶部对应栏目要有蓝色色块标注」 |
| v113 | 2026-11-20 | **打卡本纸面去掉横线**：`.ck` 删除 `background-image: repeating-linear-gradient(to bottom, transparent 0 1.7rem, rgb(30 95 168 / 0.07) 1.7rem calc(1.7rem + 1px))`，保留 `background-color: #fffdf4`；圆角、投影、线圈、今天描边、已签到色块、统计与弹窗不变。原因：日历已有 6×7 格线，纸面横线形成第二套水平线。验收：`probe-checkin` 43 项（`backgroundImage === none`）、`verify-native` 1109 全绿（新增纸面断言）、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1173` → `?v=1174`（352 处）；CHANGELOG v1.24.7、D-086 | 用户要求「去除日历背景底的横线」 |
| v112 | 2026-11-20 | **论坛云端正式建立**：Supabase `neurobase` 执行 `community-v2.sql`，建 6 张社区表（posts / replies / reports / checkins / reactions / bans）+ RLS + 索引 + `updated_at` 触发器 + `community_admin` / `community_admin_ok` RPC；posts / replies / reactions / bans 加入 `supabase_realtime`；修复 `pgcrypto` 在 `extensions` schema 的 42883（脚本顶部 + 3 处函数内 `set search_path` 补 `extensions`）；公开 key 复验 6 表 200、匿名写 401/42501、4 张实时表已挂载；`verify-native` 1108 全绿；未改前端资源，指纹保持 `?v=1173`；CHANGELOG v1.24.6 | 用户要求「建立论坛云端」，让社区页从本机回退切到云端多人共享 |
| v111 | 2026-11-20 | **字号百分比支持键盘输入自定义**：顶栏 `#nb-font-value` 与「我的学习」`#ds-font-value` 点击后就地变 `input.font-value-input`（预填当前值 / 只保留数字 / 最多 3 位），Enter 或失焦提交、Esc 取消；合法值写 `nb-font` 并同步滑块与 `--nb-font-scale`，空值 / 非数字 / 越界（<25 / >300）回退并播报；新增 `NB.mountFontInput(display, onChange)` 共用；显示元素补 `role="button"` / `tabindex="0"` / `aria-label`；i18n 新增 `toolbar.fontCustom` / `toolbar.fontInvalid`（中英）并修正 3 处字号文案；`verify-native` 新增 21 条（套件 1108 全绿）；26 页指纹 `?v=1172` → `?v=1173`（352 处）；CHANGELOG v1.24.5 | 用户要求「调节字体大小，点击数字百分比，可以键盘输入数字自定义百分比」 |
| v110 | 2026-11-20 | **记忆广度答错显示正确答案**：提交后判定错误时，`digit-result` 显示「错 · 正确答案：<序列>」并停留 1.6 s（第 1 次答错同长度重试、第 2 次答错结束）；`digitDone(lastWrongSeq)` 在总结文案追加最后一题答案；新增 `digit.locked` 忽略反馈期间的重复提交，`digitShow()` / 开始按钮重置；`NB.labCogsim.state().digit` 补 `attempt` / `seq` / `locked`；i18n 中英新增 `labCogsim.digitAnswerReveal`；`verify-native` 新增 1 条（套件 1087 全绿）；26 页指纹 `?v=1171` → `?v=1172`（352 处）；CHANGELOG v1.24.4 | 用户要求「记忆广度实验提交答案后，如果提交答案错误，要显示正确答案」 |
| v109 | 2026-11-20 | **账号名唯一性 + 论坛历史署名同步**：`profiles.display_name` 唯一索引（lower + btrim）与 `account_set_name()` RPC（login / 1–24 字 / advisory lock / 冲突兜底）；旧 prefs.displayName 迁移；保存必须联网，重名 / 断网 / 未升级明确报错；RPC 同事务按 user_id 回填社区 posts / replies，`nb-forum-rename` + `nb:account-name` 回填本机历史署名；verify 全绿 / cloud 89；指纹随轮次推进；需执行 schema §19 | 用户要求「账号名不可重复，且改后账号名要在论坛内同步更新」 |
| v108 | 2026-11-20 | **首页版式重排：搜索框左上 / 每日一词公告牌 / 面板高度锁定**：h1 与描述移出面板（`.home-intro`，页面仍只有一个 h1）；`.hero-left` 首块为 `#hero-search`，其下 `.daily-board` 公告牌（深蓝外框 + `#f4f8fd` 纸面 + 图钉，`.daily-def` 3 行截断 + `title` 全文），右端 `#nb-checkin`；`.ck` 高度 `calc(28rem × 字号比例)` 且 `margin-top:auto` 页脚 / `3.2em` 提示行；`checkin-widget.js` 补满 42 格 → 恒 6 行；桌面 `probe`：搜索 dx 40 / dy 32、hero 508、卡片 448、公告牌 390，390：公告牌 280；翻月 / 换词后 hero 与两卡高度不变；修搜索按钮换行（`flex:none` + `nowrap`）与窄屏标题压扁（`#daily-body > * {flex:none}`）；`verify-native` 新增 10 条（套件 1085 全绿）、`probe-checkin` 42 项、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1169` → `?v=1171`（352 处）；CHANGELOG v1.24.2、D-082、E-051 | 用户要求「搜索框移到蓝色框左上角，每日一词放到搜索框下面做成公告牌（蓝色系），便签本切换月份与文字长短都不改变蓝色框大小」 |
| v107 | 2026-11-20 | **账号设置：可更改账号名**：已登录账号面板新增「账号设置」区块（账号名输入 1–24 字 + 保存），标题下显示当前账号名；`cloud.js` 新增 `NB.cloud.account`（`name` / `stored` / `setName`），名字写入 `profiles.prefs.displayName`，本地 `nb-cloud-prefs` 立即生效、登录态 best-effort PATCH、空值回退邮箱前缀；登录后 `forum.authorName()` 以账号名为准，社区「修改昵称」同步写账号名，`identity` / `session` 事件刷新身份行；`http()` 在无 `fetch` 环境降级不抛错；`verify-native` 1057 → **1064 项**、`cloud-check` 59 → **71 项**；26 页指纹 `?v=1168` → `?v=1169`（352 处）；CHANGELOG v1.24.1、D-081、E-050 | 用户要求「添加账号设置，可以更改账号名」 |
| v106 | 2026-11-19 | **学习社区重做为论坛贴吧 + 移除社区打卡**：`community.html` 改「头部 + 帖子流 + 详情 / 侧栏」，新增发帖、楼层回复、点赞、收藏、举报、排序 / 筛选 / 搜索 / 分页、`#p=<id>` 详情路由；侧栏管理员口令门（置顶 / 精华 / 锁定 / 隐藏 / 禁言 / 删除 + 禁言名单）；新增 `forum.js`（localStorage 权威 + 跨标签同步 + 云端探测 / 拉取 / 写入 / Realtime，失败回退本机模式）；口令改为加盐 SHA-256 摘要 + `NB.adminCheck`，文档与源码不含明文；新增 `docs/supabase/community-v2.sql`。同时删除社区页打卡卡片（按钮 / 统计 / 7 日格）、`renderCheckin()` 逻辑、`.cm-stats / .cm-week / .fm-ckrow` 样式与 12 键 i18n，打卡只留首页便签本。`verify-native` **1057 项全绿**；指纹 `?v=1169`。 | 用户要求社区做成论坛 / 贴吧（实时、全员问答、点赞收藏举报、管理员删言禁言），口令不得外泄，并删除社区打卡 |
| v105 | 2026-11-19 | **首页蓝色横幅右端新增便签本打卡签到**：`.hero` 在 ≥900px 改为「左文案 + 右打卡本」两栏（`minmax(0, 1fr) 21.5rem`），新增 `checkin-widget.js` 与 `.ck-*`；便签纸日历（周一起始）+ ▲▼ 上下月翻页（`rotateX` 150ms / 240ms，`motion-off` 直切）+ 回到今天 + 日期点选回显 + 连续 / 本月 / 累计统计；签到写入与社区共用的 `nb-checkin`（有 `NB.community.checkin` 时委托），成功弹窗随机 18 句中英鼓励语之一，Esc / 遮罩 / 按钮关闭并还原焦点；桌面 1200 卡片 344×439 位于右端（左边界 768.5 > 中线 592.5，与文案间距 40px），390 单栏卡片 295×446 在文案下方；`verify-native` 新增 32 条（1008 → 1040，并入当日论坛改动后 1057 全绿）、`probe-checkin` 28（1200 / 390 / 亮色 + 5 图）、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1164` → `?v=1166`（351 处）；CHANGELOG v1.23.31、D-079、E-048 | 用户要求「在蓝色框右端添加打卡签到功能：签到按键 + 便签本日历（箭头上下翻动查看日期与打卡记录）+ 点击签到弹出『签到成功』与 10–20 句鼓励」 |
| v104 | 2026-11-19 | **删除顶栏动画开关按钮**：全站顶栏移除 `#nb-motion-btn`（模板 1 行 + 只服务于它的 `motionLabel()` + 绘制 / 点击绑定），动画开关只保留「我的学习 → 偏好设置 → 动画效果」（`#ds-motion`）；`NB.setMotion` / `NB.applyMotion` / `NB.motionOn` 接口、`html.motion-off` 规则与 AI 悬浮球停帧不变；i18n 从 `data/i18n/zh.json` / `en.json` 删除 `toolbar.motion` / `motionOn` / `motionOff` / `motionHint`（各 4 键），新增 `dashboard.motionAnnounceOn` / `Off`（各 2 键），重跑 `build-data.mjs` 重建 `assets/js/data/i18n.js`（zh / en 734 键），`page-dashboard.js` 播报改用新键；`verify-native` 1007 → **1008 全绿**（原顶栏按钮可访问性断言改为「按钮不存在」反向断言 + 「设置页开关有可访问状态」）；`i18n-audit` 通过、`a11y-check` 26 页、本地 JS `node --check` 通过；26 页指纹 `?v=1162` → `?v=1164`（350 处）；CHANGELOG v1.23.30、D-078 | 用户要求删除顶栏「动画开」按钮 |
| v103 | 2026-11-19 | **登录 / 注册密码框加「小眼睛」显隐**：`auth-ui.js` 密码字段改为 `label > span.nb-auth-pwd > (input + button)`，按钮 `data-act="eye-pwd"` 在 `password` / `text` 间切换，保留输入值与光标；按钮内嵌睁眼 / 斜线眼双 SVG，由 `aria-pressed` 控制显示，`aria-label` 在「显示密码 / 隐藏密码」间同步，`TXT.zh` / `TXT.en` 各加 2 键；`style.css` 新增 `.nb-auth-pwd`（`position: relative`）+ `padding-right: 2.5rem` + `.nb-auth-eye`（1.9rem、框内右端 0.3rem、垂直居中、`--ink-soft` 图标、`--line` hover 底、`:focus-visible` 2px 主色环）；`verify-native` 996 → **1007 全绿**（新增 11 条）；新增 `eye-check.mjs` 23 项、`probe-eye.mjs` 15 项（Edge headless 1200 / 390 两档：按钮框内、右距 4.8px、垂直居中、无横向滚动，3 张截图）；`a11y-check` 26 页、`i18n-audit` 729 键、全部本地 JS `node --check` 通过；26 页指纹 `?v=1161` → `?v=1162`（350 处）；CHANGELOG v1.23.29、D-077 | 用户要求「登录/注册输入密码时，在输入框右端添加小眼睛，点击可查看/取消查看密码」 |
| v102 | 2026-11-19 | **认知实验模拟改为「先选模块，再进实验」**：`lab-cogsim.html` 首屏三张模块卡（图标 / 标题 / 说明 / 时长 / 开始实验），点击后只显示所选实验（三个 `data-exp-panel` 互斥）+ 顶部「返回实验列表」；hash `#stroop` / `#rt` / `#digit` 支持直链与浏览器前进 / 后退，`NB.labCogsim` 的 `stroopStart` / `rtStart` / `digitStart` 启动前自动切面板；实验标题 1.3rem、按钮 1.02rem / 2.9rem 高、Stroop 四色块居中分散 5.6×3.8rem（窄屏 4×3.4rem）、反应方块 8.5rem、数字序列 2.5rem，全部随 `--nb-font-scale` 缩放；新增 7 个中英 i18n 键；`verify-native` 984 → **996 全绿**、`cogsim-check` 81、`i18n-audit` 729 键、`a11y-check` 26 页；26 页指纹 `?v=1159` → `?v=1161`（350 处）；CHANGELOG v1.23.28、D-076、E-047 | 用户要求「认知实验模拟点进去后先给出三个实验模块，点进去后才是实验具体内容，字号按键适当调大」，随后追加「Stroop 四个色块居中排列、适当分散、再大一点」 |
| v101 | 2026-11-19 | **Phase 8 代码就绪：学习社区 / 个性化 / 无障碍 / 中英双语**：`community.html`（打卡 + 问答 + 举报 + 管理员审核 / 隐藏 / 删除，local-first + 云端 best-effort）、`dashboard.html`（目标 4×4 档 / 今日进度 / 5 张看板卡 / 11 模块 / 薄弱项 3 条 / 偏好与清除数据）；导航 7 → 9 栏目、24 → 26 页；顶栏动画开关（`motion-off` + AI 球停帧）与 EN/中切换（`setLocale` 重载）、`#nb-live` 播报区；补齐 docs / spelling-run / lab-cogsim 历史标签缺口；schema 17 表全 RLS（社区 4 表）；`verify-native` **996 全绿**、`cloud-check` 59、`i18n-audit` 729 键、`a11y-check` 26 页；指纹 `?v=1159`；CHANGELOG v1.23.27、D-074 / D-075、E-046 | Phase 7 验收通过后按计划推进社区、个性化与可访问性 |
| v100 | 2026-11-19 | **液面恢复水平：修掉「斜着卡一下」**：`isCalm()` 增加 `tilt()`（扣除整体水位后的液面最大偏离，< 0.012 才判静），倾斜时不再 rAF 停帧；渲染端 `|lift| < 0.02` 归零；液面端点改为「保持末列水位延伸到球外 + 球内圆形裁剪收口」，平滑后最外 8 列按内部值拉平；新增二次阻尼 `DRAG_QUAD = 1.1`、小振幅额外阻尼阈值 0.5 / 系数 2.6；`alphaV` 0.006 → 0.02；回平时间 3.8 s → 1.9 s；`fluid-check` 20/20、`verify-native` 901 全绿；24 页指纹 `?v=1157` → `?v=1158`（322 处）；CHANGELOG v1.23.26、D-073、E-045 | 用户反馈拖动后液面回不到水平、斜着卡一下：判静只看速度会在波过零点误判并停帧；网格最外列与球壁几何不一致产生垂直缝与 V 形凹槽 |
| v99 | 2026-11-19 | **球内液体消锯齿 + 上下甩到球顶再翻落**：画布内部 132 → 264（CSS 仍 66px，4× 超采样）；液面改 Catmull-Rom → 三次贝塞尔 + 绘制副本 8 遍 1-2-1 平滑 + 球内圆形裁剪；液体路径沿球壁 `arc` 上溯到液面端点（修左壁三角缺口）；物理层新增每步一次的守恒人工粘性——扩散自由表面 `s` 并补回均值差（`α=0.006`，6 s 往复 ΔV −0.262%）；新增液池垂直振子 `lift` / `liftV`（`K=100`、`C=7.6`、`GAIN=0.34`、上限 `1.06R`），`ay=560` 时 0.14 s 冲顶；回落阶段加液面中心塌陷、球顶贴壁水带（月牙填充）、沿壁水滴 `updateCling`；`ai-tutor.js` 按压冲量 `(0,110,0.05)` → `(0,260,0.06)`、canvas 属性 132 → 264；`stats()` 增 `lift` / `liftV`，`isCalm()` 纳入振子；`verify-native` **901 全绿**、`fluid-check` 20/20；24 页指纹 `?v=1156` → `?v=1157`（322 处）；CHANGELOG v1.23.25、D-072、E-044 | 用户反馈「液体有锯齿，上下快速拖动没有液体冲到球顶部翻滚下来，不够自然」：一维浅水的垂直加速度只进等效重力，水面永远离不开球底；锯齿的根因是强加速下的逐格数值尖刺，而非绘制折线 |
| v98 | 2026-11-19 | **删除旧 CSS 液体模型**：删除 `.nb-ai-fab-liquid`（含 `::before` / `::after`）、`.nb-ai-fab-water`、drop ×4、spout ×2、bubble ×3、film ×2、splash 共 17 个 DOM 节点；删除 `ai-tutor.js` 约 250 行弹簧物理与 `--liquid-*` 写入，`createLiquid` → 9 行 `createFluid`（只建浅水引擎，失败返回空实现）；删除 `style.css` 对应规则、变量、`nb-ai-surface` / `nb-ai-rise` / `nb-ai-bubble` 关键帧、reduced-motion 液体声明与 `.nb-ai-fab.is-fluid` 开关（`style.css` -256 行、`ai-tutor.js` -269 行）；`verify-native` 910 → **901 全绿**（16 条旧断言换成 6 条 + 1 条反向断言）；24 页指纹 `?v=1155` → `?v=1156`；CHANGELOG v1.23.24、D-071、E-043 | 用户要求删除与现有液体无关的历史代码；浅水引擎上线后 CSS 弹簧层从未被触发，双模型并行只增加维护成本 |
| v97 | 2026-11-19 | **AI 球内液体改为守恒型浅水模型**：新增 `assets/js/ai-fluid.js`，球内一维变底床浅水（`∂h/∂t + ∂(hu)/∂x = 0`、`∂u/∂t = g·∂s/∂x - a_x - drag·u`，底床 `b(x)=√(1-x²)`）；容器加速度直接进动量方程 → 左/右/快/慢响应由物理给出；面通量先算 `F[]` 再统一更新，并加「目标列容量 ≤ 2b」「源列不可抽干」限制，体积漂移 0；固定步长 1/2400、97 列，0.20 ms/帧；`ai-tutor.js` 新增 `createFluidDriver`（px/ms → 世界加速度，松手 `-v/0.05` 冲量）；canvas 绘制液面 / 流线 / 飞溅 / 气泡；CSS 弹簧层保留为降级；`verify-native` 898 → **910 全绿**；24 页指纹 `?v=1151` → `?v=1155`；CHANGELOG v1.23.23、D-070、E-042 | 用户要求借鉴 WaterBall 的液体流动效果，让液体随拖动方向与速度产生符合现实的流动；原实现只能倾斜液面，没有内部输运 |
| v96 | 2026-11-19 | **反馈箱本机凭据导出 / 恢复**：「我的提问记录」新增导出 / 恢复按钮；导出 JSON（`app: neurobase-feedback`、`v:1`、`items[]`，含 code / at / type / other / body / status / remote / replies），写剪贴板 + 下载 `.json`，`file://` 下自动填入文本框供手动复制；恢复按 code 去重（命中只补 status / replies）、items ≤ 500、body ≤ 4000 字、replies ≤ 20，恢复后自动 `syncMine()`；文案中英；`verify-native` 898 全绿；24 页指纹 `?v=1150` → `?v=1151`；CHANGELOG v1.23.22、D-069 | 用户要求「做一个本机凭据导出/恢复」，解决匿名记录换设备即丢失 |
| v95 | 2026-11-19 | **反馈箱取消查询码**：删除提交后的查询码展示条、`#nb-fb-query-box` 查询输入区、查询按钮与 `queryByCode`；`code` 降级为内部凭据（不展示）。新增 `syncMine()`：打开反馈箱自动拉取云端回复——已登录按账号 `select('feedback', ...)`（RLS `fb_self_select`），未登录用本地 `code` 逐条 `get_feedback_by_code`（≤20 条）。`mergeCloudRow()` 只增不删、按回复正文去重；「我的提问记录」渲染全部回复并移除查询码徽标。`cloud.js` 新增只读 `select` 导出。文案（中英）同步改写。`verify-native` 892 全绿；24 页指纹 `?v=1147` → `?v=1150`；CHANGELOG v1.23.21、D-068 | 用户要求「提问箱取消设置查询码，提问者直接在自己的提问记录里查收回复」；原设计需抄写并保管 6 位码，码丢即无法查看 |
| v94 | 2026-11-19 | **公开文档口令脱敏**：`docs/` 下 5 个公开 md 的 20 处真实口令 → `<管理员口令>` 占位符；`v1.23.19` 标题改为「口令不公开」；重建 `docs-content.js`；24 页指纹 `?v=1146` → `?v=1147`；`verify-native` 新增「公开文档不含真实口令」断言（888 全绿）；新增 D-067 / E-041；CHANGELOG v1.23.20 | 用户要求「口令不要写入公开的 md 文件」；docs/** 会打包进站内文档页，等同公开站点 |
| v93 | 2026-11-19 | **反馈箱管理员入口口令门**：`feedback.js` 入口改为「先校验后跳转」，点击就地展开 `#nb-fb-admin-form` 口令区；`<管理员口令>` 通过才进 `admin.html`，错误显示 `admin.gateErr` 并清空；每次 `openBox()` 自动收起复位；`core.js` 新增唯一常量 `NB.adminPass`，`page-admin.js` / `feedback.js` 共用；新增 `.fb-admin-gate*` 样式（主题变量）；`admin.html` 页面门保留；`verify-native` 887 全绿；24 页指纹 `?v=1145` → `?v=1146`；CHANGELOG v1.23.19、D-066 | 用户要求「反馈箱管理员入口添加入口口令」；原页面门在云端已登录时被跳过，入口层不设防 |
| v92 | 2026-11-19 | **无云端开通的自动更新**：CI `contents: write` + `scripts/build-site.mjs`（可移植 + 内容变化才 bump）+ 自动 commit/push + Vercel 自动部署；`DEPLOY.md` §7 重写为 A/B 路线；`verify-native` 876 → 879；指纹保持 `?v=1145` | 用户确认不开通云端也要自动更新 |
| v91 | 2026-11-19 | **Phase 7 代码与数据就绪**：来源登记 41（111 引用聚合，无来源词条 0）；`build-sources / sync-sources / check-sources`（137 项）；schema 13 表 + `review_update`；`workers/source-sync` Cron + GitHub Actions；`updates.html` 第 24 页 + 首页条 + 生态第 4 卡 + 词条核验外链；`verify-native` 876 / `cloud-check` 59；指纹 `?v=1145`；CHANGELOG v1.23.17、D-064、E-040 | Phase 6 验收通过后按计划推进来源可溯与定时更新 |
| v90 | 2026-11-19 | **液面波动加大**：增益 `tilt 12.0/6.2`、`level 31/1.0`、`wave 0.115`、`bulge 2.9`、`ripple 2.4px`，阻尼回补 `Z_T 0.140 / Z_L 0.36`；快甩 13.2°、垂直 7.36px；探针改轮询收敛；`verify-native` 853 / `cloud-check` 59；指纹 `?v=1143`；CHANGELOG v1.23.16、D-063、E-039 | 用户要求「液面波动大一点」：柔与浪是独立参数，抬增益而非继续降阻尼 |
| v89 | 2026-11-19 | **让水真正流起来**：阻尼下调（`Z_L 0.70 → 0.30`）、倾角 9.6 / ±40°；新增 `drift` 漂移、`ripple` 波纹、3 个上浮气泡、弯月面；水体更透、去掉 conic 硬边；快甩 `peakTilt` 11.9°；`verify-native` 852 / `cloud-check` 59；指纹 `?v=1142`；CHANGELOG v1.23.15、D-062、E-038 | 用户反馈液体「黏在球里」：黏滞感来自缺少相对运动，降低阻尼并加入水体滞后、气泡、波纹 |
| v88 | 2026-11-19 | **按真实物理重做上下晃动**：液面位移由竖直加速度驱动（`-ayS*24`），匀速拖动不偏；新增轴对称曲率 `bulge` 与挂壁水膜；水花改为掉头脉冲（0.3s 落回）；删除竖直方向整体旋转与松手翻滚；手指停住 90ms 自动回稳；`level` 3.7px / `bulge` ±0.37 / `burst` 0.60 / `spin` 0；`verify-native` 850 / `cloud-check` 59；指纹 `?v=1141`；CHANGELOG v1.23.14、D-061、E-037 | 用户要求按真实场景呈现快速上下晃动：加速度才是液面位移与水花的成因，竖直方向不产生整体旋转 |
| v87 | 2026-11-19 | **垂直甩动水花**：新增 `dvY / ayS` 垂直惯性通道，`sloshTo` 取水平/垂直较大值，`spinV` 叠加 `ayS`；水花扩为溅射环 + 2 根水柱 + 4 粒错落水珠，全部随 `--liquid-level` 升降；垂直快甩 `slosh` 0.91 / 水珠上跳 5.7px / `spin` 12.4°；`verify-native` 848 / `cloud-check` 59；指纹 `?v=1140`；CHANGELOG v1.23.13、D-060、E-036 | 用户要求快速上下拖动也能看到水花与翻滚；垂直惯性通道复用水平通道的解析模型，成本仅多一个低通状态 |
| v86 | 2026-11-19 | **浮球液体物理升级：速度分级晃动 + 快甩翻滚**：倾角由「归一化 16ms 速度增量」驱动（欠阻尼 ω=8.6 / ζ=0.13），慢拖 1.3°、快甩 8.7°；新增驻波 `wave`（ω=17.5 / ζ=0.07）与翻滚 `spin`（快甩峰值 38°）；水花由急停冲量导出，两粒水珠沿甩动方向溅起；松手反向过冲 8.7° 并回摆 2~3 次；`verify-native` 846 / `cloud-check` 59；指纹 `?v=1139`；CHANGELOG v1.23.12、D-059、E-035 | 用户要求「速度快慢呈现不同晃动、极快可翻滚、水花明显、尽量贴近真实物理」；解析式三通道能复现可感知的定性行为，成本远低于 SPH |
| v85 | 2026-11-19 | **浮球改为玻璃球 + 半瓶蓝色液体**：玻璃层 `backdrop-filter` 折射 + 主光斑 / 反光 / 边缘色散 / 内缘暗环；液体 49.5% 液面、半透明可透字；`createLiquid()` 弹簧物理（tilt / level / sway），按下上浮、拖动惯性倾斜、松手阻尼回弹，rAF 静止即停；触摸与 reduced-motion 均回归；`verify-native` 841 / `cloud-check` 59；指纹 `?v=1138`；CHANGELOG v1.23.11、D-058、E-034 | 透明玻璃球 + 半瓶液体的外观与物理需求；逐像素光学改用 `backdrop-filter`，物理用 CSS 变量 + rAF 弹簧 |
| v84 | 2026-11-19 | **删除存量明文 API 记录** | 清理 6 个 `.deepworks/tmp/` 明文凭证文件（`cf-token.txt` / `sb-probe*.py` / `make-fb-probe.py` / `badcfg.html` / `badcfg.txt`）+ 脱敏 `uploads/` 快照 1 处 publishable key；保留运行必需的 `cloud-config.js`；全站明文扫描 0 命中；`verify-native` 837 / `cloud-check` 59 全绿，指纹不变 `?v=1137` |
| v83 | 2026-11-19 | **浮球松手不再被甩向边缘**：拖动期 `pointerdown` 即内联 `transition: none` + `void fab.offsetWidth` 强制落地；落点按「清 `transform` → 写 `left/top` → 强制重排 → 摘 `.is-dragging` → 双 rAF 交还过渡」提交；落点取 `pointerup` 坐标；Edge headless 回归松手零漂移、视口夹 8px、刷新比例还原、轻点不移动；`verify-native` 837、`cloud-check` 59；指纹 `?v=1137`；CHANGELOG v1.23.9、D-057、E-033 | `left` 增加 `dx` 的同时残留 `transform` 仍带 `dx`，同帧摘类锁不住 `transition: transform 0.22s`，位移叠加成 `2dx` 后被视口裁在边缘 |
| v82 | 2026-11-19 | **浮球跟手 + 自由落点 + 位置跟账号**：拖动只写 `transform: translate3d(...) scale(1.06)` + `will-change`（不再逐帧改 `left/top`）；起拖阈值 3px / 触屏 8px；松手自由落点，只夹视口（删除边缘吸附与胶囊避让）；位置按视口比例 `{rx, ry}` 存本地 `nb.ai.fab.pos` + `profiles.prefs.ai_fab`（`NB.cloud.prefs.set` → `PATCH /rest/v1/profiles`，`pull()` 校正，`userMoved` 时不覆盖）；`schema.sql` 增 `profiles.prefs jsonb`；`verify-native` 835、`cloud-check` 59；指纹 `?v=1136`；CHANGELOG v1.23.8、D-056、E-032 | 逐帧 `left/top` + `getBoundingClientRect` 触发强制布局；`transition` 含 `transform`/`left`/`top` 导致松手回弹 |
| v81 | 2026-11-19 | **凭证与密钥不落盘（补记）**：`AGENTS.md` 增加第二硬性约定（真实密钥只进环境变量 / 平台 Secrets，公开文件只写占位符）；`.gitignore` 整体忽略 `.deepworks/tmp/`、`supabase/.temp/` 并拦截 `.env*` / `.dev.vars` / `*.pem` / `*.key` / `*token*.txt`；核查出明文 Cloudflare Token 与内联 JWT 待清理；无站点代码改动，指纹保持 `?v=1135`；CHANGELOG v1.23.7、D-055、E-031 | 临时文件被当作无保密边界 |
| v80 | 2026-11-19 | **AI 助教浮球可拖动**：Pointer Events（`pointerdown/move/up/cancel` + `setPointerCapture`）拖动；5px 阈值区分点击与拖动、拖动后吞掉误触 `click`；松手吸附左右边缘；`localStorage['nb.ai.fab.pos']` 记忆位置并在视口变化时重新夹紧；右半屏气泡翻到左侧；面板 `placePanel` 跟随球（上/下自适应、同侧对齐、窄屏留白）；`verify-native` 832、`cloud-check` 50；指纹 `?v=1135`；CHANGELOG v1.23.6 | 拖动时 `left/top` 过渡导致拖影；`left/bottom` 坐标语义混用 |
| v79 | 2026-11-19 | **AI 助教浮标圆形漂浮球**：`.nb-ai-fab` 4.15rem 正圆渐变（移动端 3.5rem）+ 双层投影 + `::before` 呼吸光环 + `nb-ai-bob` 图标摆动 + hover/focus 右侧文案气泡 + 焦点环；面板 `bottom` 4.6 → 5.9rem（移动端 4.1 → 4.9rem）；补 `aria-label`；`prefers-reduced-motion` 降级；`verify-native` 826、`cloud-check` 50；指纹 `?v=1134`；CHANGELOG v1.23.5 | 浮动动画与 hover `transform` 争用同一属性，改由图标承担浮动 |
| v78 | 2026-11-19 | **AI 助教接上 Supabase Edge Function**：CLI 写入 `AI_API_KEY` / `AI_BASE_URL=https://api.deepseek.com/v1` / `AI_MODEL=deepseek-chat`；`hyper-worker` 实测 200（中文答案 + `disclaimer`）；`cloud-config.js` 的 `workerUrl` 指向 `.../functions/v1/hyper-worker`；`askTutor()` 按后端形态分支、只拼一次 `/api/tutor`、Edge 模式补 `apikey` 头；DEPLOY §3 重写为 Edge Function 首选；`verify-native` 824、`cloud-check` 50；指纹 `?v=1133`；CHANGELOG v1.23.4 | `*.workers.dev` 在国内 DNS 污染不可达；Edge Function slug 不可改（D-054）；前端重复拼路径导致 404（E-030） |
| v77 | 2026-11-18 | **注册后「验证邮箱」指引卡**：`auth-ui.js` 新增 `mode='confirm'` 视图（邮箱 + 三步 + 超时提示 + 重发 + 返回登录）；`cloud.resendConfirm()`（`/auth/v1/resend`，`type=signup`）；`signIn` 识别 `Email not confirmed` → `confirm_needed`；确认卡优先于 `off` 分支；`verify-native` 821、`cloud-check` 50；指纹 `?v=1132`；CHANGELOG v1.23.3 | 用户注册后不知道要去邮箱确认，未验证登录只看到 `http_400`（E-029） |
| v76 | 2026-11-18 | **兼容 Supabase publishable key + 真实配置接入**：`cloud.js` 对 `sb_publishable_` 只发 `apikey` 头、未登录不带 Bearer；`cloud-config.js` 写入真实项目 URL 与 key；`page-admin.js` 未登录保留本地模式；`verify-native` 加载器 eval 后强制清空 `NB_CLOUD` 固定离线环境；`verify-native` 817、`cloud-check` 44 全绿；指纹 `?v=1130` → `?v=1131`；CHANGELOG v1.23.2 | 用户新项目只提供 2025 新密钥体系的 publishable key（无 `eyJ` anon）；配置后回归测试的「未配置」假设失效（E-028） |
| v75 | 2026-11-18 | **修复 schema.sql 空库首跑 42883**：把 `gen_feedback_code()` 从第 11 节前移到第 6.1 节（`feedback` 建表之前），第 11 节改为注释占位；`admins` 默认邮箱改为注释模板；脚本仍幂等可重跑；`verify-native` 817、`cloud-check` 43 全绿；CHANGELOG v1.23.1 | 用户在 Supabase 首次执行时报 `function public.gen_feedback_code() does not exist`：PostgreSQL 在 CREATE TABLE 阶段就解析列默认值，被引用的函数必须先存在 |
| v74 | 2026-11-18 | **Phase 6 代码与部署材料就绪**：`docs/supabase/schema.sql` 重写为 8 表 + 全表 RLS + 6 RPC + Realtime（幂等）；新增零依赖云端层 `cloud.js`（Auth / PostgREST / merge-mirror 同步 / Realtime / 三级降级）、账号面板 `auth-ui.js`、配置模板 `cloud-config.js`、AI 助教 `ai-tutor.js` 与 `workers/ai-tutor` Worker；反馈箱在线化（6 位查询码）+ 管理端云端管理员模式；`vercel.json` + `.gitignore` + `docs/DEPLOY.md`；`verify-native.mjs` 794 → 817 项、`cloud-check.mjs` 43 项全绿；23 个 HTML 指纹 `?v=1128` → `?v=1129`；CHANGELOG v1.23.0 | 用户启动 Phase 6，需在保持离线可用的前提下交付全栈代码与开通步骤；真实建库 / 部署等待用户完成 4 项外部开通 |
| v73 | 2026-11-18 | **Phase 0–5 全部通过人工验收**：用户确认「Phase 5 及以前全部通过验收」；§4 阶段总览、§5 各 Phase 标题、§6 Human Gate 表统一标记「✅ 已通过」（Phase 6–9「⬜ 未开始」），§6 新增状态列；DEV_LOG「附 · Phase 映射」由旧 6 阶段口径重写为与本文一致的 10 阶段派生视图并加验收状态；PROJECT_SCOPE §八 勾选已由验收覆盖的 4 项成功标准（手机 / 电脑可用、检索准确、学习闭环、互动可视化），300+ 术语 / 全栈 / 社区 / 课程评分保持未勾选；新增 D-052、E-025；无代码改动，`verify-native.mjs` 794 项全绿，缓存指纹 `?v=1127` → `?v=1128`（重建 docs-content.js）；CHANGELOG v1.22.0 | 用户宣布 Phase 0–5 验收通过，需把里程碑落到唯一事实基线并消除阶段映射漂移 |
| v72 | 2026-11-18 | **全站「返回 XXX」按钮统一为醒目主色胶囊**：`style.css` 新增公共返回样式 `.nb-back`（实心主色底、白字、`←` 伪元素箭头、字重 600、胶囊圆角、投影；悬停加深并 `translateX(-2px)`，`:focus-visible` 2px 焦点环）；`docs.html`、`lab-anatomy.html`、`lab-cogsim.html`、`lab-signals.html`、`lab-bci.html`、`quiz-run.html`、`spelling-run.html` 的返回入口由 `btn btn-ghost`（样式表中从未定义）改为 `btn nb-back`；词条页动态返回键 `.btn-back` 并入同一套规则，词条不存在页的「返回术语检索」补 `nb-back`；选题页 `.qz-back-btn--outline` 由 1px 加粗到 2px 并补 `--soft-blue` 浅底与投影；`verify-native.mjs` 新增 13 项（CSS 规则与 7 个页面类名、词条页两种返回键），**781 → 794 项全绿**；全部 23 个 HTML 指纹 `?v=1126` → `?v=1127`（189 处） | 用户反馈：所有的「返回XXX」键明显一点 |
| v71 | 2026-11-18 | **交互式脑解剖：词条跳转返回后原样恢复**：`page-lab-anatomy.js` 新增会话级视图快照 `nb-anatomy-view`（`view` 3D/2D/剖面、`mode` 真实解剖/分区部件、相机位置与观察目标、选中脑区与「近似归属」、每个部件的位置与四元数、拆分状态、自动旋转、单部位旋转、部位操作菜单及坐标、2D 分层、标注开关、滚动位置）+ `nb-anatomy-return` 返回标记（仅点本页 `term.html` 链接时写入，30 分钟 TTL；去非词条页面立即清档）；启动时先读档再置 `stateReady`，恢复期间用 `restoring` 禁止回写，避免初始化的默认状态覆盖快照；`NB3D` 新增 `focus` 保存应用侧观察目标（无 WebGL 也能恢复）；`NB.labAnatomy` 导出 `state()` / `saveState()` / `clearState()`；`verify-native.mjs` 新增 32 项（2D / 3D 返回恢复、真实表面近似归属、无标记保持默认并清档、去其他页清档），**749 → 781 项全绿**；全部 23 个 HTML 指纹 `?v=1125` → `?v=1126`（189 处） | 用户要求：交互式脑解剖进行词条跳转时，返回交互式脑解剖时的界面要与离开该页面时一模一样 |
| v70 | 2026-11-16 | **答题结束页返回键强化**：`quiz-result.html` / `spelling-result.html` 的「返回学习工具」由 `btn btn-ghost` 改为 `btn qz-back-btn qz-back-btn--solid`（实心主色、白字、`--t-base` 字号、字重 600、胶囊圆角、`--shadow-lg` 投影、左侧 `←` 箭头）；`quiz.html` / `spelling.html` 改为 `qz-back-btn--outline` 主色描边胶囊，深色主题用 `--link` 并在悬停时填充；`style.css` 新增 `.qz-back-btn` 基础样式与 `::before` 箭头（`"\2190"`，避开 i18n 覆盖）、`.qz-footer` 补 `gap: 0.75rem` 与 `flex-wrap: wrap`；`learning-flow-check.mjs` 扩充至 **48 项全绿**，`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 指纹 `?v=1124` → `?v=1125`（189 处） | 用户追加要求：答题结束后的「返回学习工具」按键要更明显 |
| v69 | 2026-11-16 | **学习工具答题返回键收敛**：`quiz-run.html` / `spelling-run.html` 的 `#qz-footer` / `#sp-footer` 默认 `hidden`，正常答题不显示「去选题 / 返回学习工具」；`page-quiz-run.js` / `page-spelling-run.js` 仅在无进行中会话时取消 `hidden`，保留异常态出口；`quiz-result.html` / `spelling-result.html` / `quiz.html` / `spelling.html` 返回按钮去掉 `data-back`，固定 `href="learn.html"` 并统一文案「返回学习工具」；`style.css` 补 `.qz-footer[hidden] { display: none }`；`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 指纹 `?v=1122` → `?v=1124`（189 处） | 用户要求：学习工具在答题过程中不要添加返回键，只有在答题结束才添加返回键，回到学习工具界面 |
| v68 | 2026-11-12 | **记忆广度实验：新数字串出现前清空填写框**：`digitShow()` 在显示新串前执行 `digitInputEl.value = ''`，`digitAnswer()` 读值后立即清空；`style.css` 补 `.lab-digit-input-row[hidden] { display: none }`，修复同特异性下 `display: flex` 覆盖全局 `[hidden]` 导致填写行始终可见、旧答案残留；`cogsim-check.mjs` 新增 12 项显隐 / 清空断言，**69 → 81 项全绿**，`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 指纹 `?v=1121` → `?v=1122`（189 处） | 用户要求：记忆广度实验在出现下一个新数字串之前，清除填写框里的内容 |
| v67 | 2026-11-12 | **反应时「反应」按钮支持空格键**：按钮加 `data-key="Space"` 键帽与 `#rt-keys` 提示行；document 级 keydown 仅在 `rt.running && rt.mode === 'simple'` 时响应；`rtAnswer` 60ms 去抖吸收空格 keydown 与聚焦按钮默认 click；选择模式隐藏提示；`cogsim-check.mjs` **69 项全绿**，`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 指纹 `?v=1120` → `?v=1121`（189 处） | 用户要求：反应时的「反应」按键点击对应空格键，在题目中做出提示 |
| v66 | 2026-11-12 | **Stroop 四色块支持键盘 Q/W/E/R**：四个色块加 `data-key` 键帽角标与 `#stroop-keys` 提示行；`page-lab-cogsim.js` 新增 document 级 keydown（`stroop.running && !locked` 时响应，跳过输入控件、Ctrl/⌘/Alt、长按重复，`e.key` + `e.code` 双匹配）；键帽用伪元素渲染以避开 `data-i18n` 的 `textContent` 覆盖；`cogsim-check.mjs` **63 项全绿**，`verify-native.mjs` **747 项全绿**；全部 23 个 HTML 指纹 `?v=1119` → `?v=1120`（189 处） | 用户要求：四个色块点击分别对应键盘 QWER，在题目中做出提示 |
| v65 | 2026-11-11 | **Phase 5 内容生态全部上线**：新增「内容生态」导航（6 → 7 项）与 hub `explore.html`（三卡 + 统计 + 建议顺序）；`bci.html`（5 主题 24 术语 / 六环节 / 4 案例）、`bridge.html`（5 组 20 行双列 / 分组筛选 / 左列跳词条）、`frontier.html`（13 条日期倒序 / 5 类筛选 / 期刊作者 DOI / 关联词条）；新增 4 个页面脚本、中英 i18n 键与样式；verifier 页面清单 19 → 23、新增 32 项页面层断言，自测 712 → **744 项全绿**；全部 23 个 HTML 指纹 `?v=1116` → `?v=1117` | 用户要求继续分步完成 Phase 5 未完成部分（BCI 专区 / 工程对照 / 前沿速览） |
| v64 | 2026-11-11 | **反应时实验按键更名「反应」+ 位置固定**：`#rt-react` 与选择模式 `#rt-red` / `#rt-blue` 原 `data-i18n` 都误指向 `labCogsim.rtModeSimple`，加载后被覆盖成「简单反应时」；新增独立键 `labCogsim.rtReact` / `rtRed` / `rtBlue`，回写 `data/i18n/*.json` 后重跑 build-data；`.lab-rt-stim[hidden]`、`.lab-rt-ready[hidden]` 改为 `display: block; visibility: hidden` 保留占位，`.lab-rt-actions` 预留 `min-height: 2.6rem`，方块出现/消失不再推动按钮行；`cogsim-check.mjs` **59 项全绿**，`verify-native.mjs` **745 项全绿**；全部 23 个 HTML 指纹 `?v=1118` → `?v=1119`（189 处） | 用户要求：反应按键名称改为「反应」，位置固定不随方块位移 |
| v63 | 2026-11-11 | **修复 Stroop 第 2 题起无法作答**：`page-lab-cogsim.js` 的 `stroopTrial()` 在每道新题渲染后调用 `stroopSetButtons(true)`——此前只在 `stroopStart()` 启用一次，而 `stroopAnswer()` 每次作答后禁用，第 1 题结束便永久保持 `disabled`，点击被按钮委托层过滤；作答瞬间仍立即禁用防连点，结束态保持禁用并恢复「再来一轮」；同时修复反应时实验提前点击提示被 `rtTrial()` 重写覆盖（改为先重排本轮、再写「太早了」+ 试次计数）；`cogsim-check.mjs` **54 项全绿**，`verify-native.mjs` **712 项全绿**；全部 23 个 HTML 指纹 `?v=1116` → `?v=1117`（189 处） | 用户反馈：认知实验 Stroop 第 2 题往后无法作答 |
| v62 | 2026-11-11 | **迭代记录约定常驻化（后续每轮自动同步 md 并记账）**：`version-changelog` skill 的 description 与触发条件新增「后续迭代，同步更新相关 md 文件，并记入版本迭代日志」这类说法，并声明该约定对后续所有迭代默认常驻生效；触发条件新增「用户在迭代前定下常驻规矩」一条 + 常驻性说明，避免当轮未提而跳过记录；无产品代码改动，自测 694 → **712 项保持全绿**（本轮未新增断言），全部 19 个 HTML 指纹保持 `?v=1116` | 用户要求：后续迭代同步更新相关 md 文件，并记入版本迭代日志 |
| v61 | 2026-11-10 | **左上角「返回」按来源页面命名并可回到上一页**：core.js 新增 initBack / initBackButtons，上一页地址与 H1 标题记录在 sessionStorage 的 nb.prevPage（pagehide 时用最终标题更新，同地址排除），并以同站 referrer 兜底；按钮文案改为「返回{来源页名}」，点击 history.back() 回上一页，无来源时保留原文案与原链接（词条页回落 terms.html）；词条页与 4 个互动实验室、3 个测验页、3 个拼写页、docs.html 共 11 个页面接入 data-back；i18n 新增 action.backTo，并把生成物文案回写 data/i18n/*.json 后重跑 build-data（消除 E-015 漂移）；verify 新增 3 项断言，自测 691 → **694 项全绿**；全部 19 个 HTML 指纹 `?v=1115` → `?v=1116` | 用户要求：返回按键根据上一步页面来源改名（如「返回术语检索」「返回交互式脑解剖」），点击回到上一页面 |
| v60 | 2026-11-10 | **单部位旋转锁定其他部位与相机**：旋转模式为独占交互，只有当前选中部位可进入旋转；点上其他部位或空白 → 退出旋转、清空选中并立即返回，不在同一手势里选中 / 拖动其他部位；`setRotateMode(true)` 暂存并关闭 `OrbitControls.autoRotate` / `enableDamping`，退出恢复并同步自动旋转按钮；`toggleAutoRotate` 先退出旋转模式；画布 `setPointerCapture` / `releasePointerCapture` 避免经过部位菜单浮层丢失指针；verify 新增 2 项断言，自测 689 → **691 项全绿**；全部 19 个 HTML 指纹 `?v=1114` → `?v=1115` | 用户反馈：旋转单个部位时其他部位也在转；要求锁定其他部位，只有点击该部位以外的地方才退出 |
| v59 | 2026-11-10 | **脑解剖单部位旋转 / 复位 + 按钮更名 + 移除加载提示**：3D 分区部件模式点选部位后弹出「旋转 / 复位」菜单（部位名 + 提示）；旋转模式按相机 right / up 轴合成四元数，绕部件自身包围盒中心变换（`q·q0`、`p' = c + q·(p0−c)`），不位移不改深度；单部位复位只清 `position` / `quaternion`；底部按钮更名「全部拆分 / 全部合并 / 全部复位」（i18n 中英），全部复位移除相机与 `controls.target` 回写，保留当前视角；删除「3D 场景加载中…」文字（空节点仅在 WebGL 不可用时显示降级说明）；style.css 新增部位菜单样式；verify 新增 12 项断言，自测 677 → **689 项全绿**；全部 19 个 HTML 缓存指纹 `?v=1113` → `?v=1114` | 用户要求：点击部位弹出「旋转 / 复位」；底部「拆分 / 复位」改名为「全部拆分 / 全部复位」；复位不改变视角；删除加载提示文字 |
| v58 | 2026-11-10 | **搜索输入被清空回归修复 + 记录规则常驻化**：`page-terms.js` 的 `pageshow` 改为仅在 `e.persisted`（bfcache 恢复）时执行 `renderFav()/render()`，修复首次加载把 `input.value` 重置为空、检索结果恒为全部 110 条的问题（`E-013`）；项目根新增 `AGENTS.md` 常驻规则，把「每次版本迭代与错误修正都必须同步更新相关 md」从 skill 提升为每轮自动生效（`D-040`）；基线自测 4 项失败修复，673/4 → **677 项全绿**；全部 19 个 HTML 缓存指纹 `?v=1112` → `?v=1113` | 用户要求：后续迭代与错误修正都要同步更新 md；基线自测同时暴露搜索回归 |
| v57 | 2026-11-09 | **学习中心 → 学习工具 + 首页精简**：i18n nav.learn/learn.title/learn.backToLearn/learn.toolTitle 中英更名；learn.html title/meta/h1、spelling-result meta、core.js 导览文案同步；index.html 删除学习工具与互动实验室两模块（53 行），page-home.js 移除 renderLearnEntry；verify 断言更新，自测 674 → 677 全绿；指纹 ?v=1112 | 用户要求：改名并删除首页两个模块 |
| v56 | 2026-11-09 | **胼胝体 / 丘脑真实分割模型**：TemplateFlow MNI152 aseg（CC BY 4.0）→ NIfTI 解析 + 2× 降采样 + Surface Nets + Laplacian 平滑 → 胼胝体 982v/1960f、左右丘脑各 1090v/2176f；逐轴仿射对齐 pial 皮层；buildPart 新增 mesh 类型（不乘 BASE_SCALE、DoubleSide）；2D/剖面注入真实投影（733/409 字符）；i18n 增 deepSource；verify 增 6 项断言，自测 667 → 674 全绿 | 用户要求：胼胝体、丘脑改成真实模型 |
| v55 | 2026-11-09 | **2D 解剖图 / 矢状剖面真实投影 + 深层结构解剖化**：gen-2d-anatomy.mjs 生成侧视轮廓（123 点）与 4 区轮廓（114/93/184/109）及内侧面轮廓（283 点）→ assets/data/brain-2d.js；init2DFigures 注入 SVG；buildPart 新增 folia / ribbon 几何，胼胝体改弓形扁带、侧脑室改 C 形弯管、小脑叶片化、脑干加桥脑；按钮「2D 示意图→2D 解剖图」「剖面示意→矢状剖面」；i18n 中英更新；verify 新增 11 项断言，自测 656 → 667 全绿；指纹 ?v=1110 | 用户要求：拆分与 2D/剖面两项都要真实解剖模式 |
| v54 | 2026-11-09 | **表面分区全部真实网格 + 拖动根因修复**：pial 数据转轴 y-up、直径 1.25（修躺倒/尺寸）；buildSurfaceParts 按 Talairach 启发式切割 4 叶真实网格（frontal 11686 / parietal 9306 / temporal 12554 / occipital 7414 面，DoubleSide）；小脑/脑干/深部回退程序化并对齐尺寸；拖动改为部件世界中心固定视平面 + 相对位移（深度大小不变、无飞走）；i18n engineNote 更新；verify 13.7 扩展，自测 650 → 656 项全绿；全部 19 个 HTML 缓存指纹 ?v=1109 | 用户要求：所有模型真实解剖 + 拖动异常缩放彻底解决 |
| v53 | 2026-11-09 | **交互式脑解剖真实皮层表面 + 拖动修复**：FreeSurfer fsaverage5 pial 皮层表面（20484 顶点 / 40960 面，含沟回）经 GitHub PennLINC 仓库 raw 下载、t4 解析 + 归一化内嵌 `assets/vendor/three/brain-surface.js`；默认「真实解剖」模式（表面点选按 Talairach 近似归属 6 大表面脑区 + 标注近似）；「真实解剖 / 分区部件」双模式切换；修复拖动部件异常缩放（拖动时暂停 OrbitControls.update，深度不变）；i18n 5 新键 + 引擎说明更新；style.css 模式切换样式；verify 13.7 扩展，自测 637 → 650 项全绿；全部 19 个 HTML 缓存指纹 ?v=1108。文首版本行同步 | 用户要求：拖动不异常缩放 + 外观与真实解剖相同（含沟回） |
| v52 | 2026-11-09 | **三份迭代档案按课程规范重建**：`DEV_LOG.md` 52 条按日期倒序重排、统一标题、新增阶段总览索引与 Phase 0–6 映射（六要素）；`DECISIONS.md` 补 D-032–D-039 并新增决策索引；`ERROR_LOG.md` 补 E-010–E-012、新增错误索引并修正错位锚点；`version-changelog` skill 增加三档案同步判定与索引一致性校验；CHANGELOG v1.13.1；PROJECT_SCOPE v6.18。文首版本行同步 | 用户要求按 PDF「Part 8 RECORD & ITERATE」规范整理三份记录文件，并让后续迭代同步更新 |
| v51 | 2026-11-09 | **交互式脑解剖 3D 全景升级**：three.js（r128，MIT）本地化 `assets/vendor/three/`；程序化建模 10 部件 15 mesh 解剖分区 3D 大脑（与 2D 脑区一一对应）；全景互动（拖拽旋转 / 自动旋转 / 拆分合并 / 点选挪动 / 复位 / 点选说明）；脑解剖页三视图（3D / 2D / 剖面）；i18n 新增 labAnatomy3d.*（zh/en）；style.css 3D 样式；verify 13.2 重构 + 新增 13.7 块，自测 624 → 637 项全绿；全部 19 个 HTML 缓存指纹 ?v=1106 → ?v=1107。文首版本行同步 | 用户要求真实解剖图 + 全景互动（程序化方案经确认） |
| v50 | 2026-11-09 | **Phase 4 互动实验室上线**：新增「互动实验室」栏目（主导航 5 → 6 栏目，navItems + i18n nav.lab）；新增 lab.html 入口页 + lab-anatomy（SVG 脑解剖：点选 / 分层 / 标注 / 剖面）/ lab-cogsim（Stroop / 反应时 / 记忆广度）/ lab-signals（EEG / ERP-P300 / SSVEP / 运动想象 Canvas 动画）/ lab-bci（四案例六环节拆解）四类互动模块页与脚本（14 → 19 页、17 → 22 脚本）；首页新增互动实验室入口区；i18n 新增 lab.* / labAnatomy.* / labCogsim.* / labSignals.* / labBci.* 键（zh/en）；style.css 新增 Phase 4 样式与 [hidden] 兜底；verify-native.mjs 导航断言 5 → 6、新增第 13 块互动实验室断言，自测 570 → 624 项全绿；全部 19 个 HTML 缓存指纹 ?v=1105 → ?v=1106。文首版本行与上一版本行同步 | Phase 4 互动与可视化交付 |
| v49 | 2026-11-08 | **修复自测基线依赖并同步版本记录**：`C:\Users\WT\AppData\Local\Temp\opencode\domcheck\node_modules\jsdom` 包损坏（仅剩 lib、无 package.json，verify-native.mjs 报 `Cannot find module 'jsdom'`，与 v47 同因复发），在 domcheck 目录 `npm install jsdom` 重装恢复 → 基线回归 **570 项全绿**；重跑 build-docs.mjs 重建 docs-content.js / docs-meta.js；全部 14 个 HTML 缓存指纹 `?v=1104` → `?v=1105`；CHANGELOG v1.11.1 / DEV_LOG 2026-11-08 同步。文首版本行与上一版本行同步 | 用户要求更新版本迭代记录；自测基线依赖损坏需先修复再记录 |
| v48 | 2026-11-02 | **删除闪卡模块**：页面 `flashcards.html` / `flashcards-result.html` 与脚本 `page-flashcards.js` / `page-flashcards-result.js` 删除（16 → 14 页、19 → 17 脚本）；learn.js 删除 SM-2 间隔重复（SRS）引擎（SRS_KEY / EASE_MIN / round2 / sm2Rate / srs 全块与导出）；首页 / 学习中心工具卡 3 → 2（容器 grid-3 → grid-2）；学习中心进度删「到期卡」项（保留浏览 / 测验 / 错题 / 收藏）；core.js 帮助导览 step1Desc 去闪卡；i18n（zh/en）删 `flashcards.*` 整块与 `learn.flashcards*` / `learn.progressSrs`，learn.desc / toolDesc / progressDesc 文案更新；style.css 删 `/* 闪卡 */` 块（.fc-* 系列，保留通用 .chip）；verify-native.mjs PAGES/SCRIPTS 减至 14/17、12.1 改挂 spelling.html 并删 SM-2 断言、删 12.2/12.2b 整块、学习中心与首页断言去 srs / 闪卡统计；全部 14 个 HTML 缓存指纹 `?v=1103` → `?v=1104`；重跑 build-docs.mjs 重新生成 docs-content.js；自测回归至全绿。文首版本行 / 上一版本行 / §2.3 信息架构 / §4 阶段总览 / Phase 3 / 验收清单同步 | 用户确认不再需要闪卡（学习工具只保留拼写与测验） |
| v47 | 2026-11-01 | **学习工具分页流程**：闪卡 / 拼写 / 测验改为「选题 → 答题 → 结果」多页跳转（新增 flashcards-result / spelling-run / spelling-result / quiz-run / quiz-result 五页，spelling.html / quiz.html 改为选题设置页，会话与结果存 localStorage 跨页继承，答完自动跳下一页）；修复闪卡评分后无法前进 / 死循环（移除当前卡后 pos 不再自增，「忘记」的卡插回队列稍后重现，全部答完才进结果页）与拼写 zh2en 释义显示拼音简写（释义只显示词条含义）；自测 **575 → 620 项全绿**。文首版本行与上一版本行同步 | 用户实测反馈「闪卡答完题依旧无法跳转」「看释义写英文，释义要是专有名词的含义，不能是拼音简写」 |
| v46 | 2026-10-26 | **再次删除顶栏左上角品牌图标**：顶部栏品牌区 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑 6 条 path SVG）整体移除，品牌区仅保留 NeuroBase 标题 + 中文副标题文字（`.brand` 移除图标间隙并删除 `.brand-mark` 样式，布局不变）；首页 hero 横幅保持无图标；自测 **575 项保持全绿**。文首版本行与上一版本行同步 | 用户要求删除图标（顶栏品牌图标） |
| v45 | 2026-10-26 | **恢复顶栏左上角品牌大脑图标**：顶部栏品牌区 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑 6 条 path SVG：肾形大脑轮廓 / 两条脑干下垂线 / 三条沟回弧，viewBox="0 0 24 24"、fill="none"、stroke="currentColor"、stroke-width="1.5"）恢复并置于 NeuroBase 标题左侧，容器背景 `#2e6be6`，与参考图品牌横幅一致；`style.css` 恢复 `.brand-mark` 样式（2.25rem 蓝底圆角方块 / grid 居中 / 白线）与 `.brand` 间隙（gap 0.5rem）；首页 hero 横幅保持无图标；自测 **575 项保持全绿**。文首版本行与上一版本行同步 | 用户要求完全按照所给图片生成大脑图标并放置在页面左上角，不能有任何差别 |
| v44 | 2026-10-26 | **删除深蓝色 hero 横幅左上角图标**：首页 hero 横幅 `.hero-mark`（蓝色圆角方块 + 白色侧视大脑 6 条 path SVG）整体移除，横幅仅保留主标题 / 副标题 / 检索表单（`index.html` 起始元素由图标改为 h1；`style.css` 删除 `.hero-mark` 及媒体查询样式块）；自测 **575 项保持全绿**。文首版本行与上一版本行同步 | 用户要求把深蓝色框左上角的图标也删除（hero 横幅图标） |
| v43 | 2026-10-26 | **删除顶栏左上角品牌图标**：顶部栏 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑 6 条 path SVG）整体移除，品牌区仅保留 NeuroBase 标题 + 中文副标题文字（`.brand` 移除图标间隙并删除 `.brand-mark` 样式，布局不变）；首页 hero 横幅 `.hero-mark` 保留（viewBox 与 path 数量不变）；自测 **575 项保持全绿**。文首版本行与上一版本行同步 | 用户要求删除左上角的图标（顶栏品牌图标），hero 横幅图标不受影响 |
| v42 | 2026-10-26 | **品牌图标按参考图重绘**：顶部栏 `.brand-mark` 与首页 hero `.hero-mark` 删除原 **11-path 侧视大脑线稿**，替换为**蓝色圆角方块 + 白色侧视大脑线稿**（6 条 path：肾形大脑轮廓 / 两条脑干下垂线 / 三条沟回弧，`viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、`stroke-width="1.5"`）；图标容器背景由主色改为图片同款中等饱和纯蓝 `#2e6be6`（brand / hero 均蓝底白线，hero 由透明背景改为蓝色圆角方块并缩内 SVG 至 2.5rem / 2.8rem）；自测 **575 项保持全绿**。文首版本行与上一版本行同步 | 用户要求删除原图标并按所给图片生成新图标（蓝色圆角方块 + 白色侧视大脑） |
| v41 | 2026-10-26 | **学习工具交互改造**：拼写 / 测验两页新增**返回学习中心**按键（.qz-footer + .btn.btn-ghost，#sp-to-learn / #qz-to-learn，href="learn.html"）；**测验**改为「选题 → 答题 → 提交答案」**三独立界面依次跳转**（#qz-run 只留进度 + 表单 + 提交，新增 #qz-result（评分 / 解析 / 再测 / 换题），提交时表单移入 #qz-review、再测移回重建）；**拼写**「选题 / 答题」两界面分离并新增**看中文写英文（zh2name）** / **看英文写中文（en2zh）** 两种模式（模式 3 → 5，learn.js 新增 zhOK 中文名判分并暴露 NB.learn.zhOK，答错正确答案按模式显示中 / 英文，输入占位符按模式切换）；i18n zh/en 新增 spelling.modeZhToName/modeEnToZh/zhTarget/enTarget/placeholderZh/countLabel，desc 更新；**修复**「本轮题数」字面 {n}（label 误用带占位符 count 键 → 新增 countLabel）与拼写 desc 四模式旧文案；自测 559 → **575 项全绿**。文首版本行与上一版本行同步 | 用户要求：① 两页添加返回学习中心按键；② 测验改为选题 / 答题 / 提交答案三界面依次跳转；③ 拼写选题答题分界面并新增「看中文写英文 / 看英文写中文」模式 |
| v40 | 2026-10-16 | **品牌徽标与首页横幅改为侧视大脑线稿（与 Logo 同款）**：顶部栏 `.brand-mark` 由「NB 文本 + Lucide 正面大脑图标」替换为 **11-path 侧视大脑 SVG**（横扁拱形皮质轮廓 / 括号形额叶与枕叶沟回 / 中央沟 / 外侧裂 / 底部两条脑干平行线 / 右下独立小脑圆凸与纹理，`viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、`stroke-width="1.6"`、圆角线帽线接），不再显示 NB 文本；首页 hero 横幅新增同款 `.hero-mark`（viewBox 与 path 数量与品牌徽标一致）；自测 557 → **559 项全绿**。文首版本行与上一版本行同步 | 用户要求品牌图标与 Logo 大脑形态一致（此前正面大脑形态不符） |
| v39 | 2026-10-15 | **学习工具上线（Phase 3 本地版）**：新增**学习中心** `learn.html` + `page-learn.js`（工具三入口卡片 / 错题本（去重、上限 200、移除/清空/跳词条）/ 收藏（上限 100）/ 进度统计（浏览 n/110 + srs + 测验 + 错题 + 收藏计数））；新增**闪卡** `flashcards.html` + `page-flashcards.js`（SM-2 间隔重复 `sm2Rate`（q<3 重学 / q≥3 按 1→6→interval×ease、ease 下限 1.3）、到期优先队列 + 新卡补位、翻面四档评分、统计 chip、空态与重置，存储 `nb-srs`）；新增**拼写与缩写训练** `spelling.html` + `page-spelling.js`（中→英 / 缩写 / 听写三模式、大小写不敏感判分、答错进错题本 source=`spelling`）；新增**测验** `quiz.html` + `page-quiz.js`（单选 / 多选 / 填空 / 混合、seeded RNG 出题可复现、提交判分 + 逐题解析、答错进错题本 source=`quiz`、统计 `nb-quiz-stats`）；词条页新增**收藏按钮** `#nb-fav`；首页新增**学习入口区**（三卡片 + 统计徽章）；主导航 4 → **5 栏目**（新增「学习」）；全局脚本 `learn.js` + i18n `learn.*`/`flashcards.*`/`spelling.*`/`quiz.*` 键（zh/en）；**修复** `page-flashcards.js` 新卡补位恒等缺陷（`Math.max(0, NEW_LIMIT - (due.length > NEW_LIMIT ? 0 : 0))` → `Math.max(0, NEW_LIMIT - due.length)`）；自测 453 → **557 项全绿**。§2.3 信息架构、§4 阶段总览、Phase 3 说明与文首版本行同步 | Phase 3 学习工具（间隔重复闪卡 + 拼写训练 + 测验）本地版落地 |
| v38 | 2026-10-15 | 帮助导览底部按钮组**「上一步」按钮修复**：左侧按钮此前文案从未填充（`showStep()` 只设 `disabled`），显示为空白色框；现补「上一步」文案（`help.prev`，zh「上一步」/ en「Back」）并新增向左箭头图标（`.tour-prev-ico`，`accent` 青绿主题色，与「下一步」按钮主题色一致；第一步骤禁用时图标与文字淡化为 `muted`）。自测 450 → **453 项全绿**。文首版本行同步 | 用户要求「『下一步』左边的白色框改为『上一步』，图标颜色和『下一步』一致」 |
| v37 | 2026-10-15 | 顶部栏第二行**右缩进（整行右对齐）**：非全屏（视口 ≤767px）时栏目导航第二行由「左侧顶格 + 横向滚动」改为整行右对齐——导航项仍固定 6rem（跨语言不跳动）、`flex-wrap` 允许换行使内容自适应宽度不再横向溢出丢项、`justify-content: flex-end` 整行靠右、左侧留白随窗口变化，分割线贯通整行；全屏时栏目仍在同一行（品牌 / 栏目 / 工具栏）行为不变。用户确认缩进方式为「整行右对齐」。自测 447 → **450 项全绿**。文首版本行同步 | 用户要求「全屏栏目同一行；非全屏才分第二行，且第二行右缩进」（选择：整行右对齐） |
| v36 | 2026-10-15 | 教材导读（reading.html）55 本书目新增**官方/权威网页链接**：`data/reading_list.json` 每本注入 `url` 字段，书名渲染为 `.book-link` 外链（`target="_blank"` + `rel="noopener"` + `↗` 图标 + `title` 提示 `reading.link` zh/en）；链接策略：出版社官方页优先（McGraw / Elsevier / Routledge / OUP / MIT / Guilford / Norton / Cengage / Macmillan / Wiley / Springer），次选 Wikipedia / Google Books ISBN 直达，中文书用百度百科 / Google Books 搜索兜底；构建脚本新增 url 字段自检（缺失或非 http(s) 报错）；自测 438 → **447 项全绿**。文首版本行同步 | 用户要求为教材导读里的文献添加网页跳转链接 |
| v35 | 2026-10-15 | 帮助导览新增**「字号调节」步骤**：紧随「栏目导航」介绍工具栏右侧「A 字号」控件（拖动滑块 25%–300% 连续缩放、点「− / +」每次微调 5%、越界保持、本机保存刷新仍生效）；首页导览 7 → **8 步**，其他栏目页因字号控件全局存在、自动过滤后 3 → 4 步（导航 / 字号 / 反馈箱 / 帮助）；自测 435 → **438 项全绿**。文首版本行同步 | 用户选择处理帮助栏目遗留点之一：补字号调节介绍步骤 |
| v34 | 2026-10-15 | 帮助导览文案更详细：`help.*`（zh/en）7 步描述全部重写，每步补充操作方法（检索框输入中文/英文/缩写、每日一词可「换一个」、进度可「清除进度」、反馈箱选择类别提交等）；第 1 步栏目名称改为**与网页一致**（首页 / 术语检索 / 教材导读 / 关于；「项目文件」实际收录于「关于」栏目，已如实说明）；自测 429 → **435 项全绿**。文首版本行同步 | 用户要求帮助功能写得更详细，且栏目导航的名称与网页一致 |
| v33 | 2026-10-15 | 顶部栏响应式换行：全屏时品牌区 + 主导航 + 工具栏排列成一行；窗口压缩时右侧工具栏（字号控件 + 主题按钮）整体换行并**右对齐**（`margin-left:auto`）；`.main-nav-mobile` 窄屏独立整行横向滚动、不再与工具栏抢行；自测 425 → **429 项全绿**。文首版本行同步 | 用户要求页面顶部功能全屏一行、压缩时靠页面右侧的模块换行右对齐 |
| v32 | 2026-10-15 | 字号调节新增**加减号**：拖动条两侧加「− / +」小按钮（`#nb-font-minus` / `#nb-font-plus`，样式与左侧主导航项一致），点击一次 **±5%**，与拖动条两种方式并存、越界忽略并保持当前值；`aria-label`/`title` 复用 `toolbar.fontSmaller`/`fontLarger`；自测 409 → **425 项全绿**。文首版本行同步 | 用户要求调节字号有两种方式：加减号和拖动，加减号放在拖动条两侧 |
| v31 | 2026-10-15 | 新增**字号调节**：工具栏主题按钮左侧新增 `.nav-font` 控件（`A` 字标 + 连续滑块 25%–300% + 实时百分比显示，样式与左侧主导航项一致）；拖动即时生效并持久化（沿用 `nb-font` 键），通过 CSS 变量 `--nb-font-scale`（`(百分比/100).toFixed(2)`）只缩放 `.nb-content` 正文字号（`--t-*` 相乘），框架层固定不变；越界值忽略不写、UI 回退 100%；`window.NB` 导出 `fontPct/applyFontScale/setFontScale`；自测 376 → **409 项全绿**。文首版本行同步 | 用户在主题切换左侧添加字号调节，滑动调字号并显示比例，只改变正文字号 |
| v30 | 2026-10-13 | 新增**帮助功能导览**：导航「反馈箱」右侧新增「帮助」按钮（`.nav-help`，样式与左侧主导航项一致）；点击后打开 `.tour-layer` 引导层，**依次介绍页面各部分**（首页 7 步：栏目导航 → 检索区 → 每日一词 → 学习进度 → 知识模块 → 反馈箱 → 帮助），被介绍元素由 `.tour-spot` 高亮框圈出并保持可见、其余背景变暗，气泡显示标题/描述/步骤进度与「跳过/上一步/下一步（末步完成）」；新脚本 `help.js`（全页面引入）+ i18n `help.*` 22 键（zh/en）+ CSS `.tour-layer` 系列（走变量）；`window.NB.help` 导出可测接口；栏目页按元素自动过滤步骤；自测 332 → **376 项全绿**。文首版本行同步 | 用户要求在反馈箱右侧加帮助模块，依次介绍网页各部分功能 |
| v29 | 2026-10-13 | 反馈箱导航按钮样式与左侧主导航项**统一**：`.nav-fb`（桌面 + 移动端）去掉浅蓝底（`--soft-blue`）与边框，默认文字色 `--ink-soft`、无背景，hover 显 `--soft` 底色 + 主色文字；字号改 `inherit` 跟随缩放；verify 断言重构（329 → **332 项全绿） | 用户要求反馈箱按键样式与左边相同 |
| v28 | 2026-10-13 | 反馈提交后显示**成功提示条**：对话框状态行展示「已收到你的反馈，感谢！」（`.fb-status-ok` 升级为提示条：`--soft-blue` 背景 / `--soft-blue-line` 边框 / 圆角 / 内边距，跟随明暗主题）；**修复时序缺陷** —— `submitFeedback()` 里 `setStatus(fb.ok)` 后紧接的 `resetForm()` 会把成功提示立即清空（见 E-009），状态清空职责移至 `openBox()`（打开时清空，关闭重开不残留）；`feedback.js` 导出 `submitFeedback` 可测接口；自测 321 → **329 项全绿**。§2.3、Phase 1 说明与文首版本行同步 | 用户要求反馈提交后显示提交成功提示 |
| v27 | 2026-10-13 | 反馈管理页新增**管理员口令门**：`admin.html` 默认锁定只显示验证区块，输入口令 `<管理员口令>` 解锁后显示统计与列表；解锁状态记入 `sessionStorage`；i18n 新增 `admin.gate*` 6 键（zh/en），CSS 新增 `.admin-gate` 样式（走变量）；`window.NB.admin` 导出 `checkPass / unlock` 可测接口；反馈箱入口保留。口令为**软限制**（源码可见，防误入不防篡改）；自测 307 → **321 项全绿**。§2.3、Phase 1 说明与文首版本行同步 | 用户要求给管理员页添加口令 |
| v26 | 2026-10-13 | 第 1 批扩容：新增**反馈箱** —— 导航「关于」右侧新增「反馈箱」按钮（`<button>`，不算栏目位，主导航 `<a>` 仍 4 项），打开全局对话框提交反馈（类型 4 选 1 / 「其他」补充输入 / 设备自动识别只读 / 1000 字限制 / 提交写入 localStorage `nb-feedback` 上限 100 条）；对话框内「我的留言」折叠区（待回复 / 已回复徽标）；新增**反馈管理页** `admin.html`（统计 / 列表 / 回复写回 / 已读切换 / 全部已读）；全局脚本 `feedback.js` + i18n `fb.*` / `admin.*` + CSS 全套样式（走主题变量）；交付由 4 栏目 6 页变为 7 页。**修复 dialog 嵌套致弹窗不显示**（`dialogHtml()` 误自带 `<dialog>` 包裹，内层未 open 把内容藏住，见 E-008）；**「关于」页副本 `neurobase.html` 经用户确认删除**（人工验收期间），自测清单同步移除；自测 267 → **307 项全绿**。§2.3 信息架构、Phase 1 说明与文首版本行同步 | 用户要求参照参考实现补齐反馈箱（本地离线版）；人工验收发现弹窗不显示与副本删除 |
| v25 | 2026-10-13 | 第 1 批收口：新增**版本迭代日志** `docs/CHANGELOG.md`（Keep a Changelog 风格：Added / Changed / Fixed / Docs，顶部写明维护约定「每次迭代必须新增版本记录并同步 PLAN / PROJECT_SCOPE / DEV_LOG 后重跑自测」）与项目 skill `.opencode/skills/version-changelog/SKILL.md`（固化「以后每次更新迭代时同步更新日志」流程）；**恢复被误删的词条详情页 `term.html`**（全工作区无副本，按 `terms.html` 壳 + `page-term.js` 契约重建）；自测脚本把写死的「文档数 13」改为动态读取 `docs/` 磁盘文件数（现 14 个：新增 `CHANGELOG.md`）。§2.3 文件映射表、Phase 5 说明与文首版本行同步 | 用户要求「生成版本迭代日志，并在以后每次更新迭代时同步更新日志」；此前删除多余 html 的操作已取消，故恢复 `term.html` |
| v24 | 2026-10-13 | 第 1 批交付由 3 页扩为 **4 栏目 6 页**：新增**教材导读**（`reading.html`）、**项目文件**（`docs.html`）、**关于**（`about.html`），并把导航 `reading` / `about` **解除置灰**（4 项全部可点）；新增文档构建脚本 `build-docs.mjs` 与页面数据 `data/reading.js` / `data/docs-content.js` / `data/docs-meta.js`；`neurobase.html` 按用户指定落盘为「关于」页副本。§2.3 信息架构、§4 阶段总览、Phase 1 / Phase 2 / Phase 5 说明与文首版本行同步 | 用户要求「现在就补上教材导读与关于两页」（连带项目文件页，否则「关于」页入口成死链） |
| v23 | 2026-10-11 | **前端技术栈改为原生 HTML/CSS/JS 离线版**（D-031）：无框架、无构建、无 CDN，交付为单目录 `outputs/neurobase/`，**双击 `index.html` 即用**；第 1 批交付首页 / 术语检索 / 词条详情三页（检索与筛选用自写打分脚本实现，含 `<mark>` 高亮）；词条数据源迁至 `data/`；阶段说明与阶段标题同步 | 用户要求：不要 Vue 版，改为原生 HTML/JS/CSS 且双击 `index.html` 即可离线使用（分批交付） |
| v22 | 2026-10-10 | 词条页新增**「最近浏览」折叠栏**：操作区「最近浏览 (n)」按钮点开展开折叠栏，按最近顺序列出刚看过的术语（排除当前词条，最多 8 条），点按即跳转并收起；浏览历史改为按**最近浏览倒序**维护（重访置顶），上限 12 条 | 用户要求「切换术语时提供可回到刚才浏览术语的按键（折叠栏）」；同日按用户反馈把按钮移到操作区**首位**并改为与右下角「继续学习」同色的**主色实心胶囊**（`#1e5fa8`），更显眼 |
| v21 | 2026-10-10 | 字号改为**只缩放正文文本**：正文层只重写 `--text-*` 与继承字号，**容器宽度 / 间距 / 圆角 / 控件尺寸一律不变**；`html` 基准字号固定 100%，框架层保持固定 px（细化 D-028） | 用户要求「只放缩正文，不改变页面」 |

| v20 | 2026-10-10 | 修复字号拖动体验：新增固定框架层（顶部栏/页脚/浮层/字号面板固定为 px，**仅内容区随字号缩放**）、固定滚动条占位、拖动时偏好写入合并延迟 | 用户反馈「调节字号时页面抽动」与「调节框内字体大小不应改变」 |
| v19 | 2026-10-10 | 字号由三档百分比（90/100/115）改为 **25% ~ 300% 连续滑块自由拖动**（含 −/+ 微调与快捷预设，旧值自动迁移）；顶部字号控件保持固定宽度，跨语言布局稳定不变。Phase 1 说明与变更记录同步 | 用户要求「自由拖动改变百分比大小，25%~300%」 |
| v18 | 2026-10-10 | Phase 1 UI 打磨（6 项）：字号改**百分比**档位；新增**学习进度 / 继续学习**入口；「项目文件」并入**「关于」**栏目；使用指南图标问号→**电灯**；顶部工具栏**固定宽度**（切换语言不再重排）；词条来源新增**跳转教材导读**。§2.3 信息架构、§4 阶段总览、Phase 1 说明同步 | 用户反馈 6 项界面/交互改进 |
| v17 | 2026-10-10 | Phase 1 打样内容达标：11 模块**各 10 条（共 110 条）**，全字段、来源可溯、`related` 无断链；阶段总览与 Phase 1 标题标记「内容达标 ✅ · 待人工验收」 | Phase 1 内容扩建（批次 1–4）完成 |
| v16 | 2026-10-10 | Phase 0 改为**本地优先收口**（脚手架 + schema 冻结 + `npm run check` 全绿）；Supabase 建库 / GitHub 连接 / Vercel 部署**后置到 Phase 6** 并与全栈接入合并；Phase 0 / Phase 6 六要素与 Human Gate 一览同步 | 用户确认路线 1（务实路线） |
| v15 | 2026-10-10 | 新增「项目文档」页 `/docs`（`docs/` 下 md/json/sql 自动收录，可渲染阅读与查看原始文件）；「关于」页文件引用改为可点击超链接 | 用户要求 md/json 等文件加超链接，且新增文件自动同样处理 |
| v14 | 2026-10-10 | 反馈箱并入 Phase 6（可提交表单 + 状态追踪）；补 `feedback` 表字段；Phase 6 六要素与 Gate 同步 | 用户确认选项 1 |
| v13 | 2026-10-10 | 确定前端为 Vue 3 + Vite（Pinia/vue-i18n）；确定负责人王童；确立教材基准 `docs/READING_LIST.md`/`.json` | 用户确认三项信息 |
| v12 | 2026-10-10 | 新增间隔重复/拼写训练/互动可视化/BCI专区/工程对照/文献导读/前沿速览/社区/无障碍/双语切换/来源与实时更新；阶段扩为 10 个 | 用户补充功能与知识来源要求 |
| v11 | 2026-10-10 | 由"纯静态 15 章"升级为"全栈 11 模块 300+ 词条" | 用户重新选定全栈方案 |
| v10 | 2026-10-09 | 纯静态 15 章基线（已归档） | — |

---

> 本文件为项目计划基线（v92，原生离线版 · Phase 0–6 已验收、Phase 7 待人工验收）。历史版本见 `docs/archive/`。


