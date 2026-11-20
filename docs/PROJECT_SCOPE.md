---
title: "PROJECT_SCOPE · 项目范围说明"
project: "NeuroBase 神经与认知科学基础知识库"
version: "7.2"
author: "WT"
owner: "王童"
status: "Active"
last_updated: "2026-11-20"
language: "zh-CN"
aligned_with: "PLAN.md v124（词库扩容至 333 条；V5 发布：版本体系 V0–V5，当前 V5.0.0；根 README + VERSION；GitHub Pages 定向发布；Phase 6 / 7 通过（2026-11-19）、Phase 8 通过（2026-11-20）、Phase 9 已发布（GitHub Pages）；Phase 0–5 人工验收通过（2026-11-18）· 原生离线版 · 9 栏目 27 页 · 互动实验室（脑解剖 3D 双模式均为真实解剖 + 2D 解剖图 / 矢状剖面真实投影：真实表面 fsaverage5（含沟回）+ 分区部件（4 叶真实网格分区 + 胼胝体 / 丘脑真实分割网格）：旋转 / 全部拆分 / 挪动 / 全部复位 / 点选部位单独旋转与复位（复位不改视角，旋转时锁定其他部位；词条跳转返回原样恢复：视角 / 选中脑区 / 拆分与部件姿态 / 2D 分层与标注 / 滚动） / 认知模拟 / 信号范式 / BCI 案例） · 学习工具 = 拼写与缩写训练 + 测验（「选题 → 答题 → 结果」多页跳转 + 学习结果页） · 学习中心 / 拼写与缩写 / 测验 / 错题本 / 收藏 / 进度 · 4 栏目 7 页 · 反馈箱 + 反馈管理页 · 管理员口令门 · 反馈提交成功提示 · 导航按钮样式统一 · 帮助功能导览（详细文案 + 栏目名与网页一致 + 字号调节步骤 + 上一步按钮修复） · 字号调节（滑块 + 加减号） · 顶部栏响应式换行（第二行右缩进） · 教材导读书目官方网页外链 · 品牌徽标与首页横幅侧视大脑线稿（与 Logo 同款） · 全站「返回 XXX」入口统一为 `.nb-back` 实心主色胶囊（4 个实验页 / 文档详情页 / 学习工具异常态；词条页 `.btn-back` 同款、选题页描边加粗到 2px））"
textbook_baseline: "docs/READING_LIST.md（导读基准）/ docs/READING_LIST.json（结构化数据）"
supersedes: "v7.2，2026-11-20，词库扩容至 333 条（11 模块 29–32 条，+223；每条含别名 / 全拼 / 首字母 / 教材来源；sources.json 重建；verify 动态断言 1138 项全绿）；v7.0，2026-11-20，V5 发布：版本体系由 v1.x 切换为 V0–V5（当前 V5.0.0）+ 根 README + GitHub Pages 发布 + Phase 6 / 8 / 9 状态收口（D-096、E-060）；v6.70，2026-11-20，交付形态确定：仅本地离线静态站、不部署 Vercel（取消线上发布链路，交付物锁定 outputs/neurobase 目录，以 file:// 直接打开）；v6.69，2026-11-20，帮助导览高亮校准 + 讲解区块 + 全站字号 / 按键基线（正文 17.6px、`--t-sm` 15.4px、`--t-xs` 13.2px；按键统一 17.6px + `.55rem 1rem`；导览 8 步高亮偏差 0；verify 1138；交付时指纹全站统一（364 处））；v6.68，2026-11-20，Phase 9 适配与发布（响应式 27 页 × 7 档归零 / 导航断点 1199 / 性能 defer 与 immutable 缓存 / 新增 guide.html 使用指南含免责与来源 / 部署包就绪、线上待发布）；v6.67，2026-11-20，术语检索页说明文案与状态对齐（Phase 1 试运行口径 → 覆盖全部模块 + 全拼 / 拼音首字母；说明条改 .notice--info 中性样式；i18n desc / empty / sampleNotice 同步；verify 1132；指纹 ?v=1183）；v6.66，2026-11-20，术语检索词库补全（110 条新增 `pinyin_initials` 并接入检索；修正 9 处拼音；aliases 170 → 303；schema 与 validate-terms 同步；verify 1132（本轮 +7）；指纹 ?v=1181）；v6.65，2026-11-20，导航当前栏目蓝色色块 + 「我的学习」删除偏好设置（范围与交付物不变）；v6.63（2026-11-20｜论坛云端正式建立（Supabase 6 张社区表 + RLS + `community_admin` RPC + 4 张 Realtime 表；修复 `pgcrypto` 在 `extensions` schema 的 42883；verify 1108；指纹 ?v=1173）；v6.61（2026-11-20｜账号名唯一性 + 论坛历史署名同步（`profiles.display_name` 唯一索引 / `account_set_name()` RPC / 改名回填社区 posts-replies / cloud 89 / 指纹 ?v=1171）；v6.60（2026-11-20｜首页版式重排：搜索框左上 + 每日一词公告牌 + 面板高度锁定（打卡本 `28rem × 字号比例` / 日历 42 格 / 公告牌固定，翻月与换词不变尺寸）；v6.59（2026-11-20｜账号设置：可更改账号名（profiles.prefs.displayName / NB.cloud.account / 社区署名跟随，26 页指纹 ?v=1169））；v6.58（2026-11-19｜学习社区改论坛贴吧 + 移除社区打卡：community 论坛化 + forum.js（本机权威 / 云端可选）+ 口令摘要 + `docs/supabase/community-v2.sql`；26 页指纹 ?v=1169）；v6.57（2026-11-19｜首页蓝色横幅右端打卡本：Hero ≥900px 两栏，新增 `checkin-widget.js` + `.ck-*`；便签纸日历 / ▲▼ 上下月翻页 / 回到今天 / 日期点选回显 / 连续·本月·累计；签到共用 `nb-checkin`，成功弹窗 18 句中英鼓励语之一；新增 32 条断言、`probe-checkin` 28、a11y 26 页、i18n 774 键；指纹 ?v=1166）；v6.56（2026-11-19｜删除顶栏动画开关按钮：顶栏移除 `#nb-motion-btn` 与只服务于它的 `motionLabel()` / 点击绑定，动画开关收敛到「我的学习 → 偏好设置」（`#ds-motion`），`NB.setMotion` / `html.motion-off` 与 AI 球停帧不变；i18n 删 `toolbar.motion*` 4 键、增 `dashboard.motionAnnounceOn/Off` 2 键（zh/en 734 键）并重建产物；1008 全绿、a11y 26 页；指纹 ?v=1164）；v6.55（2026-11-19｜登录 / 注册密码框小眼睛：登录 / 注册密码框右端原生按钮 + 双内联 SVG（睁眼 / 斜线眼），`password ↔ text` 切换保留值与光标，`aria-pressed` / `aria-label` 同步、中英文案；1007 全绿、`eye-check` 23、`probe-eye` 15；指纹 ?v=1162）；v6.53（2026-11-19｜删除旧 CSS 液体模型：17 个 DOM 节点、约 250 行弹簧物理、15 条 CSS 规则与 `--liquid-*` 变量、3 个关键帧、`is-fluid` 开关全部移除；`createLiquid` → 9 行 `createFluid`；液体表现不变；901 全绿；指纹 ?v=1156）；v6.51（2026-11-19｜反馈箱本机凭据导出 / 恢复：JSON 含 code + 摘要 + 本地回复，恢复按 code 去重、上限 500 条；898 全绿；指纹 ?v=1151）；v6.46（2026-11-19｜Phase 7 数据来源与实时更新：41 个来源 / 111 条引用聚合、无来源词条 0；build/sync/check 三脚本与 137 项质量门；schema 13 表 + review_update；updates.html 第 24 页 + 首页最近更新条；verify 876 + cloud-check 59；指纹 ?v=1145）；v6.45（2026-11-19｜液面波动幅度加大：驱动增益整体抬高 tilt 12.0/6.2、level 31/1.0、wave 0.115·0.020·0.46、bulge 2.9、ripple 2.4px，阻尼回补 Z_T 0.140 / Z_L 0.36；verify 853 + cloud-check 59；指纹 ?v=1143）；v6.44（2026-11-19｜液体流动性增强：阻尼下调 Z_T 0.115 / Z_L 0.30、新增 drift 漂移与 ripple 波纹、3 个上浮气泡与弯月面、水体更透；verify 852 + cloud-check 59；指纹 ?v=1142）；v6.43（2026-11-19｜按真实物理重做上下晃动：液面位移由竖直加速度驱动、新增轴对称曲率 `bulge` 与挂壁水膜、水花改为掉头脉冲、删除竖直整体旋转；verify 850 + cloud-check 59；指纹 ?v=1141）；v6.42（2026-11-19｜垂直甩动水花：新增 `dvY / ayS` 通道，`sloshTo` 取水平/垂直较大值，水花扩为溅射环 + 2 水柱 + 4 粒错落水珠；垂直快甩 slosh 0.91 / 水珠上跳 5.7px / spin 12.4°；verify 848 + cloud-check 59；指纹 ?v=1140）；v6.41（2026-11-19｜浮球液体物理升级：惯性驱动倾角 + 二阶驻波 + 角动量翻滚 + 急停水花；慢拖 1.3° / 快甩 8.7° / 翻滚峰值 38°；verify 846 + cloud-check 59；指纹 ?v=1139）；v6.40（2026-11-19｜浮球改为玻璃球 + 半瓶蓝色液体：玻璃层 `backdrop-filter` 折射 + 主光斑 / 反光 / 边缘色散 / 内缘暗环；液体 49.5% 液面、半透明可透字；`createLiquid()` 弹簧物理 tilt / level / sway；verify 841 + cloud-check 59；指纹 ?v=1138）；v6.37（2026-11-19｜凭证与密钥不落盘：`AGENTS.md` 第二硬性约定 + `.gitignore` 整体忽略 `.deepworks/tmp/`、`supabase/.temp/` 并拦截 `.env*` / `.dev.vars` / `*.pem` / `*.key` / `*token*.txt`；核查出 `cf-token.txt` 明文 Cloudflare Token 与 3 个探测脚本内联 anon JWT 待清理；无站点代码改动，指纹保持 `?v=1135`）； v6.36（AI 助教浮球：位置改为视口比例并跟随账号同步（`profiles.prefs` jsonb + `NB.cloud.prefs`），拖动改合成层位移、松手自由落点；verify 835 + cloud-check 59；指纹 ?v=1136）；v6.35（Phase 6 代码与部署材料就绪：8 表 schema + 全表 RLS + 6 RPC、零依赖云层（Auth / REST / merge-mirror 同步 / Realtime / 降级）、账号面板、AI 助教 Worker + 面板、反馈箱在线化与管理端云端模式、`vercel.json` + `DEPLOY.md`；verify 817 + cloud-check 43 全绿；指纹 ?v=1129）；v6.34（Phase 0–5 全部通过人工验收 + DEV_LOG 阶段映射表对齐 PLAN 十阶段）；v6.33（全站「返回 XXX」入口统一为 `.nb-back` 实心主色胶囊）；v6.32（交互式脑解剖：词条跳转返回后原样恢复离开时的画面）；v6.31（学习工具答题返回键视觉强化：结果页实心主色胶囊 / 选题页主色描边）；v6.30（学习工具答题返回键收敛）；v6.29（Phase 5 内容生态全部上线）；v6.28（迭代记录约定常驻化）；v6.27（左上角「返回」按来源页面命名并可回到上一页 + 迭代记录约定常驻化）；v6.26（单部位旋转锁定其他部位与相机）；v6.25（单部位旋转 / 复位 + 按钮更名 + 移除加载提示）；v6.24（搜索回归修复 + 记录规则常驻化）；v6.22（胼胝体/丘脑真实模型 + 学习工具更名与首页精简）；v6.20（2D/剖面真实投影 + 深层结构解剖化）；v6.19（真实网格分区 + 拖动根因修复）；v6.18（真实皮层表面 + 拖动修复）；v6.17（三份迭代档案按课程规范重建）；v6.16（互动实验室 Phase 4）；v6.15（删除闪卡模块）；v5.2（版本迭代日志机制 + 恢复 term.html）；v5.1（第 1 批扩容 + 版本迭代日志机制）；v5.0（原生离线版首版）；v4.0（全栈版）；v3.9；v3.8；v3.7；v3.6；v3.5；v3.4；v3.3；v3.2；v3.1（全栈增强版）；v3.0（全栈首版）；v2.7（纯静态 15 章版，已归档）"
---

# PROJECT_SCOPE · 项目范围说明（原生离线版）

> 本文件回答 **What are we building?**（对应课程 DEFINE 阶段的 `PROJECT_SCOPE.md`）。
> 本文件以 `PLAN.md` 为准；冲突时以 `PLAN.md` 为准。
> 超出「范围内」条目的工作默认视为范围外，需走变更流程。

---

## 一、Project purpose（项目目的）

为**刚接触神经与认知科学、且面向脑机接口（BCI）方向**的本科生，提供一个**中英双语、可检索、可科普、可自测、互动可视化、且知识来源可追溯的术语与知识点学习平台**，把分散在教材、百科、论文里的零散概念整合成体系化入口，帮助学生快速建立术语体系与基础认知。

一句话定义：
> **NeuroBase = 面向脑机接口方向本科生的「神经与认知科学」中英双语术语检索 + 科普 + 互动可视化 + 自测学习平台，内容引用官方来源并可联网更新。**

---

## 二、Target users（目标用户）

| 维度 | 说明 |
| --- | --- |
| 主要用户 | 智能医学工程（脑机接口方向）本科生，刚入门该领域 |
| 次要用户 | 生物医学工程 / 神经科学 / 认知科学相关专业入门学生与自学者 |
| 前置基础 | 无硬性前置；具备高中生物基础更佳 |
| 使用设备 | 手机与电脑同等重要（响应式） |
| 典型场景 | 课后查术语、概念扫盲、交互理解、考前自测、BCI 方向入门补基础 |
| 可访问性需求 | 视/听障碍、色觉异常、非母语学习者 |

---

## 三、Core problem（核心问题）

1. 术语**数量多、英文缩写多**（EEG、fMRI、P300、SSVEP……），初学者记不住、对不上号。
2. 知识**散落在教材、百科、论文**中，缺少统一的"中文 + 英文 + 分类"检索入口。
3. 只读不练、**缺少自测与记忆巩固机制**，学了容易忘。
4. 面向 BCI 的**神经科学 ↔ 工程学**知识割裂，学生不知概念怎么用到工程。
5. 内容**准确性难保证、来源不透明**，且难以及时跟进前沿。

---

## 四、Core features（核心功能）

### 4.1 检索（Retrieval）
- 关键词、英文/缩写、拼音/首字母搜索；按 11 模块与标签筛选；结果高亮；相关术语推荐；词条互跳。

### 4.2 科普（Explain）
- 词条图文卡片、生活化类比、脑区示意图、动画/GIF、短视频外链；首页「每日一词 / 随机术语」。

### 4.3 学习与自测（Learn & Test）
- **术语拼写与缩写训练**（看释义写英文/缩写、听写、拼写纠错）。
- 单选题、多选/填空题；错题本；收藏/加星；学习进度统计；分级学习路径。（闪卡 / 间隔重复模块已于 v6.15 删除）

### 4.4 互动与可视化（Interactive & Visualization）
- **交互式脑解剖模型**：可点选、分层、标注开关、剖面。
- **认知实验小模拟**：Stroop、反应时、记忆广度等。
- **神经信号与范式演示**：EEG/ERP 波形、P300、SSVEP、运动想象等动态演示。
- **BCI 案例拆解**：真实/代表性 BCI 应用的逐步拆解。
  - **已实现（v6.26）**：四类互动模块已随 Phase 4 上线（`lab.html` 入口 + `lab-anatomy.html` / `lab-cogsim.html` / `lab-signals.html` / `lab-bci.html`，教学示意级）。交互式脑解剖三个视图均以真实解剖数据为准：**真实表面模式**（FreeSurfer fsaverage5 pial，20484 顶点 / 40960 面）、**分区部件模式**（4 叶为同一 pial 网格分区的真实部件；胼胝体与双侧丘脑为 MNI152 aseg 真实分割网格，TemplateFlow CC BY 4.0；小脑 / 脑干 / 海马 / 侧脑室按解剖形态建模）与 **2D 解剖图 / 矢状剖面**（轮廓由真实网格投影生成）；支持旋转 / 全部拆分 / 挪动 / 全部复位 / 点击部位单独旋转与复位（复位不改变视角；旋转时锁定其他部位与相机惯性） / 分层 / 标注。学习模块统一更名「学习工具」（顶部导航与页面标题），首页只保留 Hero 检索、每日一词与学习进度，学习工具与互动实验室入口走顶部导航。

### 4.5 BCI 专区与跨学科对照（BCI Zone & Mapping）
- **BCI 相关术语专区**：聚合 P300/SSVEP/运动想象/电极/解码等术语与范式。
- **神经科学与工程对照表**：神经概念 ↔ 工程实现（如"动作电位 ↔ 信号采集/放大"）双列对照。
  - **已实现（v6.29）**：**BCI 专区**（`bci.html`，5 主题 24 术语 / 六环节链路 / 4 案例入口）与**神经科学↔工程对照**（`bridge.html`，5 组 20 行双列 / 分组筛选 / 左列跳词条）已上线，入口为「内容生态」hub（`explore.html`）。

### 4.6 内容生态（Content Ecosystem）
- **文献/教材推荐与导读**：分层推荐（入门教材 → 进阶专著 → 综述论文），附导读说明。
  - **已实现（v5.1）**：**教材导读页**（`reading.html`）已随第 1 批交付上线 —— 收录 **55 本**教材与文献、**9 个分类**、**5 条学习路径**；支持按分类筛选（`?cat=`）与从词条来源定位高亮（`?book=<id>`）；数据源 `data/reading_list.json`。
- **科研前沿速览**：定期汇总代表性前沿进展（摘要级，标注来源与时间）。
  - **已实现（v6.29）**：**科研前沿速览**（`frontier.html`）收录 13 条代表性研究，按日期倒序，附期刊 / 作者 / DOI 与关联词条，支持 5 类筛选。

### 4.7 学习社区与个性化（Community & Personalization）
- **学习社区**：论坛 / 贴吧式提问与答疑——发帖、楼层回复、点赞、收藏、举报、多人实时同步与管理员治理（**需审核与举报机制**、可删除/禁言）。
- **学习打卡**：仅首页蓝色横幅右端的便签本打卡（含连续天数、月历翻页与签到成功弹窗）；社区页不再承担打卡入口。
- **个性化**：学习目标设置、进度看板、推荐薄弱项、偏好设置。

### 4.8 可访问性与包容性（Accessibility & Inclusion）
- **多模态呈现**：图文 + 音频朗读 + 动画替代文本。
- **无障碍设计**：键盘可达、语义化标签、色盲友好配色、对比度达标（WCAG 2.1 AA）、屏幕阅读器兼容。
- **中英双语切换**：界面与内容支持中/英切换。

### 4.9 词条内容模型（每个词条字段）
中文名、英文名 + 缩写、一句话定义、通俗解释/类比、所属模块、相关术语、示意图、难度分级、延伸阅读/参考来源、**来源标注与更新时间戳**。

### 4.10 用户与数据（全栈能力）
- 账号登录（Supabase Auth）、云端保存进度/收藏/错题/社区内容（Postgres + RLS）。
- AI 助教（Cloudflare Workers）；实时更新（Supabase Realtime）。

### 4.11 内容规模
- **11 个知识模块、300+ 词条**：神经元与神经信号、突触与神经递质、脑解剖分区、感觉与知觉、运动控制、注意、记忆、语言、情绪、认知神经科学方法、BCI 基础。
- **教材与文献 55 条**（`data/reading_list.json`）：9 个分类、5 条学习路径，已随第 1 批交付上线。

### 4.12 知识来源与实时更新（Knowledge Sourcing & Live Update）
- **引用官方/权威来源**并在词条标注来源与版本/时间戳。
- 建立**可联网更新的实时数据库**（Supabase + 定时任务同步）。
- **实时自检**：来源可溯、术语唯一、链接可达、时间戳新鲜度、事实交叉核对。

### 4.13 反馈与纠错（Feedback）— Phase 6
- **反馈箱**：在「关于」页提供**可提交表单**（类型：纠错 / 建议 / 术语补充 / 其他），提交后写入 `feedback` 表并可追踪处理状态。
- 未登录也可提交（限流），登录后自动关联账号；页面标注"仅供参考，发现错误请反馈"。

---

## 五、Non-goals（明确不做）

> ⚠️ 相对于 v3.0，以下两项因新增需求**已反转**：① 学习社区从"不做"改为"做（需审核）"；② 中英双语切换从"不做"改为"做"。

| 编号 | 不做的事项 | 说明 |
| --- | --- | --- |
| N1 | 不做**无审核的开放式**社交/匿名发帖广场 | 社区为学习主题论坛，须有审核、举报、删除与禁言机制 |
| N2 | 不做商业化/付费计划 | 课程项目，无营销与付费设计 |
| N3 | 不做用户上传/众编词条 | 内容由项目方与 AI 起草、人工审核维护 |
| N4 | 不做原生 App / 小程序 | 仅 Web（响应式） |
| N5 | 不做医疗诊断或临床建议 | 内容仅供教学，不构成医疗用途 |
| N6 | 不做科研级仿真/真实被试数据采集 | 演示与教学级即可 |
| N7 | 不复制受版权保护的教材原文与图表 | 仅自撰表述 + 自绘示意图 |
| N8 | 不承诺覆盖全部前沿文献 | 前沿速览为摘要级、代表性命中 |
| N9 | **不宣称"内容 100% 正确"** | 无法技术保证；以来源可溯 + 定期复核降错（见 §6.5） |

---

## 六、Constraints（约束条件）

### 6.1 内容约束
- 准确性优先；术语规范、中英对照、全站唯一；争议内容须标注。
- 不得复制版权原文；不得编造作者/书名/年份/DOI。

### 6.2 技术约束
- 前端：**原生 HTML + CSS + JavaScript**（无框架、无构建、无 CDN）；**双击 `index.html` 即可离线使用**；响应式 320px–1920px。
- 后端：Supabase（Postgres + Auth + RLS + RPC + Realtime），**不自建服务器**。
- AI：Cloudflare Workers 网关。
- **安全**：`anon` key 可放前端；`service_role` 与 AI Provider 密钥**绝不进前端**。

### 6.3 时间与过程约束
- 交付截止：**12 月 4 日前**（PDF），占成绩 5%。
- 一次只做一个 Phase，验收通过再进入下一阶段。
- 交付物存 `outputs/`、`docs/`；过程文件放 `_work/`。

### 6.4 合规红线（硬约束）
- **法律**：不碰政治、违法、色情、赌博、侵权。
- **学术**：不诊断、不伪造、不传播伪科学。
- **数据**：不滥收、不泄露，密钥不放前端。
- **AI**：不冒充权威、不输出有害建议、不忽视幻觉（须标注"AI 生成，仅供参考"）。
- **技术**：不滥用免费额度、不植入恶意代码。

### 6.5 知识来源与实时更新约束（新增）
- **来源要求**：仅引用官方/权威来源（权威教材、SfN、NIH/PubMed、官方脑图谱、标准数据集、Wikipedia 等），并按目录登记。
- **可溯要求**：每个词条标注来源类型 + 来源 + 更新时间戳；引用必须真实、可核验。
- **更新机制**：Supabase 建"实时更新数据库"，由定时任务（Cloudflare Cron / Supabase Edge Functions / GitHub Actions）从权威源拉取 → **自动比对 + 人工抽检** → 发布；前端经 Realtime 获取更新。
- **自检机制**：脚本校验来源可溯、术语唯一、链接可达、时间戳新鲜度；异常进入待审队列。
- **诚实声明（重要）**：**无法保证"完全严谨正确"**——AI、自动抓取与人工均可能出错。承诺的是"**来源透明、可追溯、可纠错、定期复核**"，而非绝对正确；所有内容标注"仅供参考，发现错误请反馈"。

---

## 七、Technical choices（技术选型）

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 前端 | **原生 HTML + CSS + JavaScript**（已定，D-031） | 无框架 / 无构建 / 无 CDN；双击 `index.html` 离线即用 |
| 样式 | 原生 CSS（自定义变量） | 学术简洁·蓝白配色；样式集中于 `assets/css/style.css` |
| 检索 | 自写打分脚本（`core.js`） | 关键词 / 英文缩写 / 拼音 / 别名，含 `<mark>` 高亮（原生实现，替代 Fuse.js） |
| 可视化 | D3.js / SVG / Canvas | 脑解剖、波形、范式演示 |
| 后端 | Supabase | Postgres + Auth + RLS + RPC + Realtime |
| AI 助教 | Cloudflare Workers | 推理网关，密钥服务端保管 |
| 数据同步 | Cloudflare Cron / Supabase Edge Functions / GitHub Actions | 定时拉取权威源、更新数据库 |
| 部署 | Vercel / Netlify + Supabase 云 | 前端托管 + 云后端 |

---

## 八、Success criteria（成功标准）

- [ ] 覆盖 **≥ 300 个**核心术语/知识点，双语字段与来源标注完整（当前 110 条打样内容，扩容属 V5.x 后续工作，故未勾选）。
- [x] **手机与电脑均可用**，无横向溢出，核心流程完整（2026-11-18 Phase 0–5 验收通过）。
- [x] **检索准确**：关键词、英文/缩写、拼音、模块筛选均可命中并高亮（2026-11-18 验收通过）。
- [x] 学习闭环：拼写与缩写训练、测验、错题本、进度均可用（2026-11-18 验收通过）。
- [x] 互动可视化：脑解剖模型、认知实验模拟、神经信号/范式演示、BCI 案例拆解可用（2026-11-18 验收通过）。
- [x] BCI 专区、神经科学与工程对照表、文献导读、前沿速览上线（2026-11-11，Phase 5 全部完成；自测 744 项；2026-11-18 Phase 0–5 整体验收通过）。
- [x] 全栈联通：登录后云同步、AI 助教、Realtime 更新可用（Phase 6 验收通过，2026-11-19；云端未配置时降级为本机模式）。
- [x] 社区与个性化可用（含审核机制）；无障碍达 WCAG 2.1 AA；中英可切换（Phase 8 验收通过，2026-11-20）。
- [x] **线上发布且手机 / 电脑体验达标**：GitHub Pages（`https://cuprum0214.github.io/neurobase.github.io/`，2026-11-20）+ 本地 `file://` 双形态。
- [ ] 通过课程 5% 评分要求并收集反馈。

---

## 九、交付物（Deliverables）

> **v6.68（2026-11-20）**：页面数 26 → **27**，新增 `guide.html`（使用指南 / 免责声明 / 来源与引用，侧入口在「关于」页）；栏目数仍为 9，其余交付物形态不变。部署产物新增 `outputs/neurobase-site.zip`（1.68MB / 85 文件）。

| 交付物 | 路径（计划） | 形态 |
| --- | --- | --- |
| 前端应用（源码即产物） | `outputs/neurobase/`（单目录，双击 `index.html` 离线可用；现为 **7 栏目共 23 页**（新增内容生态 hub `explore.html`、BCI 专区 `bci.html`、工程对照 `bridge.html`、前沿速览 `frontier.html`；互动实验室 `lab.html` 与 `lab-anatomy.html` / `lab-cogsim.html` / `lab-signals.html` / `lab-bci.html`；脑解剖含 three.js 本地化 3D 全景与 fsaverage5 pial 真实网格（真实表面 + 分区部件 + 2D/剖面真实投影），`assets/vendor/three/`）：`index.html` / `terms.html` / `term.html` / `reading.html` / `docs.html` / `about.html` / **`admin.html`（反馈管理页）** / **`learn.html`（学习中心：错题本 / 收藏 / 进度统计）** / **`spelling.html` / `spelling-run.html` / `spelling-result.html`（拼写与缩写训练：选题 → 答题 → 结果）** / **`quiz.html` / `quiz-run.html` / `quiz-result.html`（测验：选题 → 答题 → 结果）**（闪卡模块已于 v6.15 删除；「关于」页副本 `neurobase.html` 已于 2026-10-13 经用户确认删除）；反馈箱入口位于导航「关于」右侧，提交写入 localStorage `nb-feedback`） | HTML / CSS / JS |
| 词条与文案数据源（唯一） | `data/terms*.json`、`data/i18n/*.json`（来源登记见词条 `references` 字段） | JSON |
| 教材导读与文档数据源 | `data/reading_list.json`（55 条教材/文献）、`data/docs.json`（`docs/` 文件清单） | JSON |
| 数据生成与自测脚本 | `.deepworks/tmp/build-native/build-data.mjs`（词条 / 文案 / 教材导读）、`.deepworks/tmp/build-native/build-docs.mjs`（文档渲染 + 清单）、`.deepworks/tmp/checks/verify-native.mjs`（离线自测） | 脚本 |
| Supabase 结构与说明 | `docs/supabase/schema.sql`、`docs/supabase/README.md` | SQL / MD |
| 数据同步任务 | `jobs/*`（Phase 6 规划） | 脚本 |
| AI 助教 Worker | `workers/ai-assistant/`（Phase 6 规划） | Worker |
| 项目计划 / 范围 | `docs/PLAN.md`、`docs/PROJECT_SCOPE.md` | MD |
| 记录文件 | `docs/CHANGELOG.md`（版本迭代日志）、`docs/DEV_LOG.md`、`docs/DECISIONS.md`、`docs/ERROR_LOG.md`、`AGENTS.md`（项目根常驻规则） | MD |
| 调研报告 | `docs/RESEARCH.md` | MD |
| 教材导读清单 | `docs/READING_LIST.md`、`docs/READING_LIST.json` | MD / JSON |
| 课程项目报告（V5.0.0 交付物补充） | `outputs/Wang Tong_NeuroBase.pdf` | PDF / A4 19 页 |

---

## 十、风险与应对

| 风险 | 影响 | 应对 |
| --- | --- | --- |
| 300+ 词条内容量大 | 延期 | AI 分批生成 + 分模块审核 |
| **无法保证内容完全正确** | 误导数学生 | 来源可溯 + 时间戳 + 自检 + 定期复核 + 免责声明（不宣称 100%） |
| 联网实时更新成本/失败 | 更新中断 | 免费额度内定时同步；失败回退上次成功版本 |
| 自动抓取引入错误 | 污染词库 | 自动比对 + 人工抽检 + 待审队列 |
| 社区内容风险 | 违规内容 | 审核 + 举报 + 删除；限学习话题 |
| 无障碍改造工作量大 | 延期 | 从 Phase 0 起就用语义化与对比度规范，逐步达标 |
| 全栈复杂度高 | 联调耗时 | 由简到繁，先本地再上云 |
| 密钥泄露 | 安全事故 | `service_role`/AI 密钥绝不进前端 |
| 范围膨胀 | 无法收尾 | 以本文件「范围外」为准，走变更流程 |

---

## 十一、变更管理

- **v7.2（2026-11-20）｜词库扩容至 333 条（交付物规模变化）**：① 正式词库由 110 条扩充到 333 条，11 个模块分别达到 anatomy 30、attention 30、bci 32、emotion 31、language 31、memory 31、methods 29、motor 31、neuron 30、sensory 29、synapse 30。② 每条新增词条均含 id、中英文名、别名、全拼、拼音首字母、定义、通俗解释、难度、标签、关联词条与至少 1 条真实教材来源；拼音与首字母由 `pypinyin` 生成并校验长度（333/333 一致）。③ `data/sources.json` 重建为 333 词条 / 334 引用 / 41 个唯一来源；清除 `terms.sample.json` 与 `terms.phase1.json` 中与正式库重复的条目，并把 `motor-motor-cortex` 的引用统一为 `motor-primary-motor-cortex`。④ 验收：`validate-terms` 全通过、来源自检 360 项通过、`verify-native` **1138 项全绿**，27 页指纹 `?v=1195` → `?v=1196`（364 处）。依据见 `docs/PLAN.md` v124、`docs/CHANGELOG.md` v1.25.5、`docs/DECISIONS.md` D-098 与 `docs/DEV_LOG.md` 2026-11-20 条目。
- **v7.1（2026-11-20）｜课程项目报告（PDF）交付（功能与范围不变，新增交付物）**：① 新增 `outputs/Wang Tong_NeuroBase.pdf`（A4 / 19 页），按课程 a) 背景与动机、b) 开发历程（版本 / 截图）、c) 主要功能与想法来源、d) 问题与解决、e) 反馈与决策组织，并按 `Firstname Lastname_project name.pdf` 命名。② 报告中的数据（27 页 / 110 词条 / 303 别名 / 41 来源 / 111 引用 / 103 版本 / 96 决策 / 59 错误 / 1138 断言）均取自仓库实际文件；论坛截图为本地演示数据并已注明。③ 报告的源 HTML、截图与构建脚本只留在 `.deepworks/tmp/report-work/`，不进入站点产物；`outputs/neurobase/**` 与 `?v=1184` 指纹未改。④ 验收：`verify-native` **1138 项全绿**；PDF 19 页、6 图、无截断，元数据回读正常。依据见 `docs/PLAN.md` v123、`docs/DECISIONS.md` D-097、`docs/ERROR_LOG.md` E-061 与 `docs/DEV_LOG.md` 2026-11-20 补充条目。

- **v7.0（2026-11-20）｜V5 发布：版本体系 V0–V5 + 根 README + GitHub Pages（范围不变，交付形态与版本轴明确）**：① 版本号由线性 `v1.25.4` 切换为阶段版本 `V0–V5`（V0 = Phase 0、V1 = Phase 1–2、V2 = Phase 3、V3 = Phase 4–5、V4 = Phase 6–8、V5 = Phase 9），当前 **V5.0.0**；旧条目保留原号。② 新增根 `README.md`（功能地图 / 内容规模 / 版本路线 / 架构 / 目录 / 自测 / 部署 / 安全 / 免责 / 路线图）与 `VERSION`，全站页脚显示 `V5.0.0`。③ 新增 `.github/workflows/pages.yml`，把 `outputs/neurobase` 发布到 GitHub Pages（`https://cuprum0214.github.io/neurobase.github.io/`）；Vercel 仍不作为前提，`file://` 仍是完整交付形态。④ §八 勾选「全栈联通」「社区 / 个性化 / 无障碍 / 双语」「线上发布」三项，保留「≥300 词条」与「课程 5% 评分」未勾选。⑤ 验收：`verify-native` **1138 项全绿**；机密扫描 0 命中（仅保留 Supabase publishable 公开 key）；27 页指纹统一 bump。依据见 `docs/PLAN.md` v122、`docs/CHANGELOG.md` V5.0.0、`docs/DECISIONS.md` D-096、`docs/ERROR_LOG.md` E-060 与 `docs/DEV_LOG.md` 2026-11-20（V5）条目。
- **v6.70（2026-11-20）｜交付形态确定：仅本地离线，不部署 Vercel（范围收敛）**：① 交付物锁定 `outputs/neurobase/**`，以浏览器 `file://` 直接打开，不依赖服务器或域名。② 取消 Vercel / 线上发布计划，`vercel.json` 仅作历史配置保留；后续迭代不再询问部署方式，也不把部署列入验收。③ 清理 2026-11-19 遗留的整套旧站副本 `.deepworks/tmp/citest`（62 个文件）——该副本同样显示「找到 110 条」，曾导致「打开旧副本、误判更新未生效」。④ 验收：`verify-native` 全绿；核心功能与 27 页交付物不变。依据见 `docs/PLAN.md` v121、`docs/CHANGELOG.md` v1.25.4、`docs/DECISIONS.md` D-095 与 `docs/DEV_LOG.md` 2026-11-20 条目。
- **v6.69（2026-11-20）｜帮助导览高亮校准 + 讲解区块 + 全站字号 / 按键基线（范围 / 页面数不变，视觉与可用性验收项细化）**：① 导览气泡新增「讲解」区块（`#nb-tour-why` + `#nb-tour-points`，每步 2–3 条要点）与步骤进度条，文案走 `core.js` EXTRA 的 `help.stepNPointN`（中英各 20 键）。② 高亮定位改为「程序滚动期间临时 `scroll-behavior: auto` → 同步滚动 → 可视带居中（顶栏下沿到气泡上沿）→ 双帧 rAF + 700ms 逐帧校准」，并处理窄屏重复 ID、贴边外扩、跳过按钮文案。③ 新增 `--nb-read-boost: 1.1` 与 `--nb-read-scale: calc(--nb-font-scale × --nb-read-boost)`，字号声明统一乘基线：正文 16 → **17.6px**、`--t-sm` 14 → **15.4px**、`--t-xs` 12 → **13.2px**、`--t-2xl` 24 → **26.4px**；布局尺寸仍只认 rem。④ 按键统一到「认知实验模拟」页量级：`.btn` 字号 `--t-base`、内边距 `.55rem 1rem`（约 42px 高），`.btn-primary` / `.btn-accent` / `.nb-back` / `.chip` / 输入框同步。⑤ 验收：`verify-native` **1138 项全绿**（净增 27 条、改写 5 条），Edge CDP 实测 1440 宽 8 步 / 390 宽 7 步高亮偏差 0，320 / 390 / 1024 / 1440 四档无新增页面级横向滚动；27 页指纹 `?v=1183` → `?v=1184`（364 处）。依据见 `docs/PLAN.md` v120、`docs/CHANGELOG.md` v1.25.3、`docs/DECISIONS.md` D-093 / D-094、`docs/ERROR_LOG.md` E-059 与 `docs/DEV_LOG.md` 2026-11-20 条目。
- 范围变更须记录：变更内容、原因、影响、版本号，并同步写入 `PLAN.md` 变更记录。
- **v6.68（2026-11-20）｜Phase 9 适配与发布（页面 26 → 27，新增使用指南；验收口径补齐）**：① 响应式：新增 `phase9-responsive.mjs`，27 页 × 7 档（320/375/414/768/1024/1440/1920）审计页面级横向滚动与运行时错误；修复导航断点（767 → 1199px）、窄屏工具栏换行与按钮定宽、≤420px 首页搜索框堆叠与主题 / 语言图标化、`.select` 限宽、≤640px 社区筛选换行；结果 0 溢出 / 0 控制台错误 / 0 页面异常（修复前 26 页 × 5 档共 130 个溢出单元）。② 性能：`docs.html` 与 `lab-anatomy.html` 的重脚本改 `defer`；`vercel.json` 的 `/assets/*` 改 1 年 immutable、HTML 改 must-revalidate；新增 `.vercelignore`；首屏 591KB、FCP 272–320ms、无长任务、60fps。③ 发布：生成 `outputs/neurobase-site.zip`，新增 `phase9-links.mjs`（74 个站内引用 0 死链）与 `phase9-live-check.mjs`；本机网络无法访问 Vercel、Supabase 业务表未建，线上发布与云库建表列为后续执行项。④ 指南：新增 `guide.html`（第 27 页，7 区块含免责声明 / 来源与引用 / 反馈纠错），45 个 `manual.*` 中英键，`about.html` 增入口卡。⑤ 验收：`verify-native` **1132 项全绿**、`a11y-check` 27 页、`i18n-audit` 通过；指纹 `?v=1181` → `?v=1182`（363 处）。依据见 `docs/PLAN.md` v119、`docs/CHANGELOG.md` v1.25.2、`docs/DECISIONS.md` D-090–D-092、`docs/ERROR_LOG.md` E-058 与 `docs/DEV_LOG.md` 2026-11-20（Phase 9）条目。
- **v6.67（2026-11-20）｜术语检索页说明文案与状态对齐（范围 / 交付物 / 页面数不变）**：① 说明条由「当前为 Phase 1 试运行词条（每模块至少 1 条），完整词库分模块持续补充中。」改为「已收录神经与认知科学核心术语，覆盖全部学习模块；支持中文、英文、缩写、全拼与拼音首字母检索。」。② `terms.desc` 补充「中文全拼 / 拼音首字母」；`terms.empty` 由「词库正在建设中（Phase 1–2 上线）」改为操作指引。③ 说明条启用 `.notice--info` 中性信息样式（`--soft-blue` 底 + `--soft-blue-line` 边框），并新增 `html.dark .notice--info` 暗色适配。④ `data/i18n/zh.json` / `data/i18n/en.json` 三键同步并重建 `i18n.js`。⑤ 验收：`verify-native` **1132 项全绿**（原「试运行说明存在」断言改为「说明文案含拼音首字母且无 Phase 1」），27 页指纹 `?v=1182` → `?v=1183`（364 处）。依据见 `docs/PLAN.md` v118、`docs/CHANGELOG.md` v1.25.1、`docs/ERROR_LOG.md` E-057 与 `docs/DEV_LOG.md` 2026-11-20 条目。
- **v6.66（2026-11-20）｜术语检索词库补全（范围 / 交付物 / 页面数不变，检索验收项细化）**：① 110 条词条新增 `pinyin_initials`（中文名逐字声母、小写连写），`assets/js/core.js` 的 `fields()` 新增 70 权重、`TermsView.vue` 的 Fuse `keys` 同步接入；`st` → 树突、`xzxzy` → 选择性注意，大小写不敏感。② 修正 9 处与中文名不符的拼音：基底神经节 `jidishenjingjie`、胼胝体 `pianzhiti`、大脑皮层 `danaopiceng`、注意瞬脱 `zhuyishuntuo`、布罗卡失语症 `buluokashiyuzheng`、事件相关电位 `shijianxiangguandianwei`、初级运动皮层 `chujiyundongpiceng`、突触可塑性 `tuchukesuxing`、突触传递 `tuchuchuandi`。③ `aliases` 由 170 条扩到 **303 条**（均值 1.55 → 2.75，110 条全部 ≥1），新增均为真实同义 / 旧称 / 常用简称（如 动作电位 → 神经冲动 / 锋电位 / spike、杏仁核 → 杏仁体 / 杏仁复合体、音素 → 音位、去伪迹 → 独立成分分析 / ICA）。④ `docs/schema/term.schema.json` 新增 `pinyin_initials`，`neurobase/scripts/validate-terms.mjs` 新增 5 类检索字段校验（拼音格式 / 首字母格式 / 首字母长度 = 汉字数 / 别名非空 / 别名无重复且不等于中文名）。⑤ 验收：`verify-native` **1132 项全绿**（本轮 +7 条）（+2 条首字母检索、+5 条词库完整性）、`validate-terms` 全通过、`node --check core.js` / `terms.js` 通过、重建 `assets/js/data/terms.js`；26 页指纹 `?v=1180` → `?v=1181`（352 处）。核心功能、交付物（9 栏目 26 页）与非目标均无变化。依据见 `docs/PLAN.md` v117、`docs/CHANGELOG.md` v1.24.11、`docs/DECISIONS.md` D-089、`docs/ERROR_LOG.md` E-055 与 `docs/DEV_LOG.md` 2026-11-20 条目。
- **v6.65（2026-11-20）｜导航当前栏目蓝色色块 + 「我的学习」删除偏好设置（范围 / 交付物 / 页面数不变）**：① 顶部主导航当前项改为实心 `var(--primary)` 蓝底 + `#fff` 白字色块（`.main-nav a[aria-current='page']`），窄屏 `.main-nav-mobile` 同步，hover 用 `--primary-dark`；高亮仍由 `navHtml(active)` + `aria-current="page"` 决定，26 页延续子页映射。② `dashboard.html` 删除偏好设置卡片（主题 / 动效 / 语言 / 字号与说明），原「清除本机学习数据」独立为「本机数据」卡；`page-dashboard.js` 删除 `renderPrefs()` 及绑定；`dashboard.desc` 与 meta description 同步改写。③ 补齐 `toolbar.fontCustom` / `toolbar.fontInvalid` / `labCogsim.digitAnswerReveal` 三个 i18n 键（写入 `data/i18n/*.json` 源）。验收：`verify-native` **1104 项全绿**（含新增的桌面 / 窄屏色块断言）；26 页指纹 `?v=1175` → `?v=1178`（352 处）；核心功能、栏目（9 栏目 26 页）与非目标不变。依据 `docs/PLAN.md` v114–v115、`docs/CHANGELOG.md` v1.24.8–v1.24.9、`docs/DECISIONS.md` D-087 / D-088、`docs/ERROR_LOG.md` E-054。
- **v6.64（2026-11-20）｜论坛云端正式建立（范围不变，后端从「脚本就绪」变为「云端已上线」）**：在 Supabase 项目 `neurobase`（ref `flayytlvrbhuainebzjd`）执行 `docs/supabase/community-v2.sql`，正式创建 `community_posts` / `community_replies` / `community_reports` / `community_checkins` / `community_reactions` / `community_bans` 6 张社区表（RLS / 索引 / `updated_at` 触发器 / `community_admin` + `community_admin_ok` RPC），并把 posts / replies / reactions / bans 加入 `supabase_realtime` publication；社区页从「本机权威、云端可选且未建」切换为「云端已就绪、可多人实时共享」。修复 `pgcrypto` 位于 `extensions` schema 导致的 `42883`：脚本顶部新增 `set search_path = public, extensions;`，三处函数内 `set search_path` 同步补 `extensions`。验收：公开 key 复验 6 表 200、`community_admin_ok(错误口令)` 返回 `false`、匿名写 posts / replies / reactions 均 `401 / 42501`、`pg_publication_tables` 确认 4 张实时表；`verify-native` **1108 项全绿**；未改 `outputs/neurobase` 前端资源，26 页指纹保持 `?v=1173`。功能、栏目（9 栏目 26 页）与页面目标不变；数据源 `docs/PLAN.md` v112、`docs/CHANGELOG.md` v1.24.6、`docs/DECISIONS.md` D-085、`docs/ERROR_LOG.md` E-053、`docs/DEV_LOG.md` 2026-11-20。
- **v6.63（2026-11-20）｜字号百分比支持键盘输入自定义（范围与交付物不变，字号调节验收项细化）**：① 顶部工具栏的百分比与「我的学习 → 偏好设置」的百分比胶囊都可点击，就地变为输入框；键盘输入 25–300 的整数，Enter / 失焦提交、Esc 取消，提交后滑块、显示值、`nb-font` 与 `--nb-font-scale` 同步。② 空值 / 非数字 / 越界不写入存储，回退当前值并播报提示；输入框最多 3 位、只保留数字。③ 百分比显示元素补 `role="button"` / `tabindex="0"`，Enter / 空格进入编辑，`aria-label` 提示可输入。④ 验收：点百分比输入 175 回车生效；输入 999 回退并提示；Esc 不改值；工具栏与「我的学习」两个入口表现一致。核心功能、交付物（9 栏目 26 页）与非目标不变；`verify-native` 新增 21 条断言、套件 **1108 项全绿**；26 页指纹 `?v=1172` → `?v=1173`（352 处）。依据见 `docs/PLAN.md` v111、`docs/DECISIONS.md` D-084 与 `docs/DEV_LOG.md` 2026-11-20（v1.24.5）条目。
- **v6.62（2026-11-20）｜记忆广度答错显示正确答案（范围与交付物不变，实验反馈验收项细化）**：① 记忆广度实验提交后判定为错误时，结果区显示「错 · 正确答案：<数字序列>」（`labCogsim.digitAnswerReveal`，中英双语），停留 1.6 s 后再进入下一步。② 第 1 次答错按同长度重试，第 2 次答错结束；`digitDone(lastWrongSeq)` 在结算文案末尾追加「· 正确答案：<序列>」，正确答案不会一闪而过。③ 新增 `digit.locked`：正误反馈展示期间忽略重复提交（连点「确认」/ 重复回车），`digitShow()` 与「开始」按钮重置；`NB.labCogsim.state().digit` 补 `attempt` / `seq` / `locked` 供自测断言。④ 验收：故意输入错误答案两轮，均能看到本题正确答案；结束文案保留最后一题答案；失败重试与广度统计口径不变。核心功能、交付物（9 栏目 26 页）与非目标不变；`verify-native` 新增 1 条断言、套件 **1087 项全绿**；26 页指纹 `?v=1171` → `?v=1172`（352 处）。依据见 `docs/PLAN.md` v110 与 `docs/DEV_LOG.md` 2026-11-20（v1.24.4）条目。
- **v6.61（2026-11-20）｜账号名唯一性 + 论坛历史署名同步（交付物不变，账号验收项升级）**：① 自定义账号名全站唯一，大小写 / 首尾与连续空白不敏感；设置 / 清空通过 `account_set_name()` RPC，重名、断网、服务端未升级均明确报错且不本地生效。② 旧版 `prefs.displayName` 迁移到 `profiles.display_name`；空名回退邮箱前缀，邮箱前缀不占用唯一名。③ 改名成功后云端 `community_posts` / `community_replies` 按 `user_id` 回填 `author`；本机用 `nb-forum-rename` 标记 + `nb:account-name` 事件回填历史帖子、回复、禁言名单；社区页加载 / 在线立即显示新名。④ 部署：Supabase SQL Editor 重跑 `schema.sql`（或 §19）后功能才可用；未执行时仅账号名保存提示「服务端尚未升级」，登录 / 进度同步 / 发帖不受影响。⑤ 验收：重名被拒、改名后历史帖与新帖同名、刷新 / 换设备名不丢；`verify-native` 全绿、`cloud-check` **89**、`i18n-audit` **921** 键；指纹随并行轮次推进（全站 352 处统一）。核心功能、交付物（9 栏目 26 页）与非目标不变。
- **v6.60（2026-11-20）｜首页版式重排（范围与交付物不变，首页验收项细化）**：① 蓝色面板内左上角为搜索框（`#hero-search` 是 `.hero-left` 第一块），其下紧接「每日一词」公告牌（`.daily-board`：深蓝外框 + 浅蓝纸面 `#f4f8fd` + 图钉，正文 `.daily-def` 3 行截断并以 `title` 保留全文），右端打卡本 `#nb-checkin` 不变；h1 与描述移出面板成为 `.home-intro`，页面仍只有一个 h1。② 面板尺寸锁定：打卡本高度 `calc(28rem × 字号比例)`（flex 列 + `margin-top:auto` 页脚 + `3.2em` 提示行，同一字号下恒定），日历恒 6 行（42 格，空月补行），公告牌桌面填满左栏 / 窄屏 `calc(17.5rem × 字号比例)`；切月、换词、词条释义长短均不改变蓝框高度。③ 修复：宽屏搜索按钮被输入框挤成两行；窄屏公告牌标题被 flex 压缩裁切。④ 验收：`probe-checkin` 42 项全过（1200：搜索 dx 40 / dy 32、hero 508、卡片 448、公告牌 390；390：公告牌 280、卡片 448；翻月 / 换词后高度不变 + 6 张截图）；`verify-native` 新增 10 条、套件 1085 项全绿；`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1171`（352 处）。核心功能、交付物（9 栏目 26 页）与非目标均无变化。依据见 `docs/PLAN.md` v108、`docs/DECISIONS.md` D-082、`docs/ERROR_LOG.md` E-051 与 `docs/DEV_LOG.md` 2026-11-20（v1.24.2）条目。
- **v6.59（2026-11-20）｜账号设置：可更改账号名（交付物不变，账号与社区身份口径调整）**：① 已登录账号面板新增「账号设置」区块：账号名输入框（1–24 字，留空使用邮箱前缀）+「保存账号名」；面板标题下显示当前账号名，邮箱仍作为账号标识。② `cloud.js` 新增 `NB.cloud.account`（`name()` / `stored()` / `setName()`），账号名写入 `profiles.prefs.displayName`，沿用 `NB.cloud.prefs` 的本地缓存 + 登录态 PATCH + 拉取合并；空值清除自定义名。③ 登录后 `forum.authorName()` 以账号名（默认邮箱前缀）为准，社区「修改昵称」同步写账号名；`identity` / `session` 事件即时刷新「当前身份」行。④ 验收行为：改账号名后面板与社区署名立即更新，刷新 / 换设备后仍在；未登录时仍用本机昵称，离线保存保留本机值并提示待同步。核心功能、交付物（9 栏目 26 页）与非目标均无变化；`verify-native` 1057 → **1064 项**、`cloud-check` 59 → **71 项**；26 页指纹 `?v=1168` → `?v=1169`（352 处）。依据见 `docs/PLAN.md` v107、`docs/DECISIONS.md` D-081、`docs/ERROR_LOG.md` E-050 与 `docs/DEV_LOG.md` 2026-11-20（v1.24.1）条目。
- **v6.58（2026-11-19）｜学习社区改论坛贴吧 + 移除社区打卡（交付物不变，社区验收项重写）**：① `community.html` 改为「社区头部（主题 / 回复 / 参与者 + 发帖） + 左侧帖子流 + 详情 / 右侧侧栏」，新增发帖弹层、`#p=<id>` 详情路由、楼层回复、帖子与楼层点赞、收藏、举报（帖子 / 楼层）、最新·最热·回复最多排序、全部·我的帖子·我的收藏·精华·待审举报筛选、板块与全文搜索、加载更多分页。② 侧栏管理员口令门：解锁后可置顶 / 精华 / 锁定 / 隐藏 / 禁言 / 删除（二次确认），并可查看与解除禁言名单。③ 新增 `assets/js/forum.js`：localStorage 为权威，跨标签 `storage` + `BroadcastChannel` 即时同步；云端探测 `community_posts` 成功时拉取并订阅 Realtime，失败静默回退「本机模式」。④ 管理口令由明文常量改为加盐 SHA-256 摘要（`core.js` 的 `ADMIN_HASH` + `NB.adminCheck`），反馈箱与 `admin.html` 同步改用；公开源码与文档不含明文。⑤ 新增 `docs/supabase/community-v2.sql`（建表 / 补列 / RLS / 触发器 / Realtime / `community_admin` RPC）。⑥ **删除社区页打卡**：侧栏打卡卡片、`renderCheckin()`、按钮绑定、`.cm-stats / .cm-stat* / .cm-week / .cm-day* / .fm-ckrow` 样式与 12 键 i18n 全部移除；打卡唯一入口为首页便签本，`nb-checkin` 与 `community_checkins` 同步逻辑不变。⑦ 验收行为：发帖后进入详情、回复按楼层递增、点赞 / 收藏可取消、举报进入待审列表、管理员可删帖 / 禁言且普通用户看不到管理按钮、社区页无任何打卡节点且加载后不写 `nb-checkin`、490px 无横向溢出、明暗主题正常；`verify-native` **1064 项全绿**（社区段 6 条打卡断言改为 5 条「无打卡」断言），26 页指纹 `?v=1166` → `?v=1169`（352 处）。核心功能、交付物（9 栏目 26 页）与非目标均不变，仅把社区从「打卡 + 问答」改为「论坛 + 审核治理」。依据见 `docs/PLAN.md` v106、`docs/DECISIONS.md` D-080、`docs/ERROR_LOG.md` E-049 与 `docs/DEV_LOG.md` 2026-11-19（v1.24.0）条目。
- **v6.57（2026-11-19）｜首页蓝色横幅右端便签本打卡（范围与交付物不变，首页验收项细化）**：① `index.html` 的 hero 在 ≥900px 改为「左文案 + 右打卡本」两栏，`<900px` 单栏且打卡本落在搜索框下方居中；新增 `assets/js/checkin-widget.js` 与 `.ck-*` 样式（便签纸 + 横线 + 线圈，零依赖）。② 日历为周一起始的月视图，`▲` 上一月 / `▼` 下一月，切换时整页 `rotateX` 上下翻动（`html.motion-off` 下直切）；浏览其它月份出现「回到今天」；已签到日期带青色底与右上角圆点，今天有主色描边。③ 点任意日期在卡片下方回显「已签到 / 没有签到记录 / 还没到」；统计行为「连续 N 天 · 本月 N 天 · 累计 N 天」。④ 「签到」写入与「学习社区」共用的 `nb-checkin`（加载了 `community.js` 时委托 `NB.community.checkin`，登录且云层可用时 best-effort 同步 `community_checkins`）；成功后弹出便签纸对话框「签到成功」+ 日期 / 连续天数 + 18 句中英鼓励语之一，Esc / 遮罩 / 「继续学习」关闭并还原焦点。⑤ 验收行为：桌面右端不压左文案、窄屏不出 hero、页面无新增横向溢出（390px 顶栏工具条既有溢出不在本轮范围）；`verify-native` 新增 32 条（并入当日论坛改动后套件 1057 项全绿）、`probe-checkin` 28 项（1200 / 390 / 亮色 + 5 张截图）、`a11y-check` 26 页、`i18n-audit` 774 键；26 页指纹 `?v=1164` → `?v=1166`（351 处）。核心功能、交付物（9 栏目 26 页）与非目标均无变化。依据见 `docs/PLAN.md` v105、`docs/DECISIONS.md` D-079、`docs/ERROR_LOG.md` E-048 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.31）条目。
- **v6.56（2026-11-19）｜删除顶栏动画开关按钮（范围与交付物不变，验收项细化）**：① 全站顶栏移除「🌀 动画开」按钮（`#nb-motion-btn`）及其模板、只服务于它的 `motionLabel()` 与点击绑定；动画开关只保留「我的学习 → 偏好设置 → 动画效果」（`#ds-motion`），仍写 `nb-motion` 并同步 `aria-pressed`。② `NB.setMotion` / `NB.applyMotion` / `NB.motionOn` 接口、`html.motion-off` 全局规则与 AI 悬浮球停帧逻辑不变，站内仍可手动关闭动画。③ 文案：删除 `toolbar.motion` / `motionOn` / `motionOff` / `motionHint`（中 / EN 各 4 键），新增 `dashboard.motionAnnounceOn` / `Off`（各 2 键），重跑 `build-data.mjs` 重建 `assets/js/data/i18n.js`（zh / en 734 键）。④ 验收行为：任一页面顶栏只显示字号滑块、EN / 中切换与主题按钮；「我的学习 → 偏好设置」的动画开关仍可停 / 启动动画（含 AI 球停帧），并播报「动画效果已开启 / 已关闭」。核心功能、交付物（9 栏目 26 页）与非目标均无变化；`verify-native` 1007 → **1008 项**、`i18n-audit` 通过（zh / en 734 键）、`a11y-check` 26 页；26 页指纹 `?v=1162` → `?v=1164`（350 处）。依据见 `docs/PLAN.md` v104、`docs/DECISIONS.md` D-078 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.30）条目。
- **v6.55（2026-11-19）｜登录 / 注册密码框「小眼睛」显隐（范围与交付物不变，验收项细化）**：① 登录与注册弹窗的密码输入框右端新增原生 `<button type="button" data-act="eye-pwd">`，点击在 `password` / `text` 之间切换，保留已输入内容与光标位置（`selectionStart` / `selectionEnd`）；② 按钮内嵌「睁眼」与「斜线眼」两个内联 SVG，由 `aria-pressed` 控制 CSS 显隐，`aria-label` / `title` 在「显示密码 / 隐藏密码」（EN：Show / Hide password）之间同步；③ 密码字段结构改为 `label > span.nb-auth-pwd > (input + button)`，输入框 `padding-right: 2.5rem` 留位，按钮绝对定位在框内右端（实测右距 4.8px、垂直居中），`:focus-visible` 2px 主色焦点环；④ 验收行为：登录与注册两态均可点眼睛查看 / 取消查看密码，切换后输入值与光标不乱，英文界面提示为 Show / Hide password，390px 窄屏按钮仍在框内且无横向滚动。核心功能、交付物（9 栏目 26 页）与非目标均无变化；`verify-native` 996 → **1007 项**、新增 `eye-check` 23 项与 `probe-eye` 15 项（Edge headless 1200 / 390 两档）；`a11y-check` 26 页、`i18n-audit` 729 键；26 页指纹 `?v=1161` → `?v=1162`（350 处）。依据见 `docs/PLAN.md` v103、`docs/DECISIONS.md` D-077 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.29）条目。
- **v6.54（2026-11-19）｜Phase 8：学习社区 / 个性化 / 无障碍 / 中英双语（范围不变，按 PLAN Phase 8 交付）**：① 新增 **学习社区**（`community.html`）：学习打卡（连续 / 累计 / 7 日热力 / 今日新词）、问答（发布 / 回答 / 举报 / 删除）、管理员口令审核（隐藏 / 恢复 / 删除）；数据本机权威，云端已配置且登录时 best-effort 同步，普通用户只能删除自己的内容，违规内容可由管理员处理。② 新增 **我的学习**（`dashboard.html`）：学习目标（每日新词 / 每周测验各 4 档）、今日进度、进度看板（已读 / 收藏 / 错题 / 正确率 / 连续打卡）、11 模块进度、薄弱项推荐（错题模块优先，其次进度落后模块）、偏好设置（主题 / 动画 / 语言 / 字号 / 清除本机学习数据）。③ **无障碍**：顶栏动画开关（`html.motion-off`，同效系统减弱动效，AI 球液体同步停帧）、`#nb-live` 屏幕阅读器播报区、标签页方向键 / Home / End、举报面板焦点进入与返回；补齐 `docs.html` 双 h1、`spelling-run.html` 输入标签、`lab-cogsim.html` 数字输入标签，深色主题胶囊对比度修正。④ **中英双语**：新增 `community.*` / `dashboard.*` / `toolbar.motion*` 等文案，`data/i18n` 共 729 键；顶栏与偏好页均可切换，英文下标题 / 标签页 / 导航全部生效。⑤ 数据库 `docs/supabase/schema.sql` 13 → **17 表**，新增社区 4 表并全部启用 RLS；`cloud.js` 导出 `upsert` / `del`。⑥ 主导航 7 → **9 栏目**、页面 24 → **26 页**；26 页指纹 `?v=1158` → `?v=1159`；`verify-native` **996 项全绿**、`cloud-check` 59、`i18n-audit` 729 键、`a11y-check` 26 页。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v101、`docs/DECISIONS.md` D-074 / D-075、`docs/ERROR_LOG.md` E-046 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.27）条目。
- **v6.53（2026-11-19）｜删除旧 CSS 液体模型（范围与交付物不变）**：① 移除 AI 悬浮球的历史 CSS 弹簧液体实现——DOM 里 17 个节点（`.nb-ai-fab-liquid` 及其水体层 / 3 气泡、`.nb-ai-fab-water`、4 水珠、2 水柱、2 水膜、1 冲击环）、`ai-tutor.js` 约 250 行弹簧物理与 `--liquid-*` 写入、`style.css` 15 条液体规则 / `--liquid-*` 变量 / 3 个关键帧 / reduced-motion 液体声明 / `.nb-ai-fab.is-fluid` 开关，`style.css` 减 256 行、`ai-tutor.js` 减 269 行。② `createLiquid()` 收敛为 9 行 `createFluid()`：只创建 canvas 浅水引擎，失败返回空实现；液体状态不再经过 CSS 自定义属性。③ 液体表现与上一版完全一致（引擎、参数、渲染层未改）；`prefers-reduced-motion` 仍由引擎渲染一帧静态液面。④ `verify-native` 910 → **901 项全绿**（16 条旧断言换成 6 条新断言 + 1 条 reduced-motion 断言，并新增旧模型必须不存在的反向断言）；24 页指纹 `?v=1155` → `?v=1156`。页面数、导航、核心功能与验收标准均无变化。依据见 `docs/PLAN.md` v98、`docs/DECISIONS.md` D-071、`docs/ERROR_LOG.md` E-043 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.24）条目。

- **v6.52（2026-11-19）｜AI 球内液体改守恒型浅水（范围与交付物不变，交互质感调整）**：① 新增 `assets/js/ai-fluid.js`，把 AI 悬浮球的液体从「CSS 参数化弹簧 + 倾斜平面」换成**球内一维变底床浅水方程**：`∂h/∂t + ∂(h·u)/∂x = 0`、`∂u/∂t = g·∂s/∂x - a_x - drag·u`，底床取球内壁 `b(x)=√(1-x²)`；容器加速度直接进动量方程，因此**拖动方向决定水堆向哪侧、拖动快慢决定波峰高度**，贴壁处自然出现弯月面爬升。② 数值上「先算全部面通量、再统一更新水深」，并对每个面加「目标列容量 ≤ 2b」「源列不可抽干」两条限制，**体积漂移 0**；固定步长 1/2400、97 列，Node 实测 0.20 ms/帧。③ 渲染改 canvas：液面曲线 + 竖向蓝渐变 + 液面亮线 + 示踪流线 + 飞溅水珠 + 上浮气泡；`ai-tutor.js` 新增 `createFluidDriver`，把指针 px/ms 换算成容器加速度（除以球半径），松手用 `-v/0.05` 换算骤停冲量。④ 原 CSS 弹簧液体层**保留在 DOM**，作为无 canvas 环境与 `prefers-reduced-motion` 的降级路径与静帧，由 `.nb-ai-fab.is-fluid` 切换可见性。⑤ `verify-native` 新增 12 项断言，**910 项全绿**；24 页 HTML 指纹 `?v=1151` → `?v=1155`。页面数、导航、核心功能与非目标均无变化。依据见 `docs/PLAN.md` v97、`docs/DECISIONS.md` D-070、`docs/ERROR_LOG.md` E-042 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.23）条目。

- **v6.51（2026-11-19）｜反馈箱本机凭据导出 / 恢复（范围与交付物不变）**：① 「我的提问记录」底部新增「导出凭据」「恢复凭据」。② 导出为 JSON（`app: neurobase-feedback`、`v:1`、`items[]`，含 code / at / type / other / body / status / remote / replies），写剪贴板并下载 `neurobase-feedback-YYYY-MM-DD.json`；`file://` 下剪贴板不可用时自动填入文本框供手动复制。③ 恢复按 `code` 去重合并（命中只补 status / replies，不覆盖正文），防护：items ≤ 500、body ≤ 4000 字、replies ≤ 20，恢复后自动 `syncMine()`。④ 文案中英；凭据含提问正文，提示用户妥善保管。页面数、导航、云端表结构与 RPC 均无变化；**898 项全绿**，24 个 HTML 指纹 `?v=1150` → `?v=1151`。依据见 `docs/PLAN.md` v96、`docs/DECISIONS.md` D-069 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.22）条目。
- **v6.50（2026-11-19）｜反馈箱取消查询码（范围与交付物不变）**：① 反馈箱不再展示或要求 6 位查询码——删除提交后的查询码条、`#nb-fb-query-box` 查询输入区、查询按钮与 `queryByCode`；`code` 降级为云端记录内部凭据，仅保存在本地记录中用于匿名续查。② 回复唯一入口是「我的提问记录」：打开反馈箱时自动同步——已登录按账号执行 `select('feedback', ...)`（RLS `fb_self_select`，跨设备），未登录用本地 `code` 逐条调用 `get_feedback_by_code`（≤20 条/次，不跨设备）；`mergeCloudRow()` 只增不删、按回复正文去重，「我的提问记录」渲染全部回复。③ `cloud.js` 新增只读 `select: restGet` 导出；文案中英同步（我的提问记录 / 提交成功提示）。页面数、导航、云端表结构与 RPC 均无变化；**892 项全绿**，24 个 HTML 指纹 `?v=1147` → `?v=1150`。依据见 `docs/PLAN.md` v95、`docs/DECISIONS.md` D-068 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.21）条目。
- **v6.49（2026-11-19）｜公开文档口令脱敏（范围与交付物不变）**：① `docs/` 下 5 个公开 md（`CHANGELOG` / `DEV_LOG` / `DECISIONS` / `PLAN` / `PROJECT_SCOPE`）中的 20 处真实口令全部替换为 `<管理员口令>` 占位符；这些 md 会被 `build-docs.mjs` 打包进站内「文档」页，等同公开站点。② 重建 `assets/js/data/docs-content.js`，24 个 HTML 指纹 `?v=1146` → `?v=1147`，避免浏览器继续命中含口令的旧文档缓存。③ `verify-native.mjs` 新增「公开文档不含真实口令明文」断言：从 `core.js` 解析口令常量并扫描 `docs/**/*.md` 与 `docs-content.js`，命中即失败；脚本本身不保存明文。④ 运行时 JS 仍保留真实口令以维持前端软限制，文档只描述机制、不记录数值；新增 `D-067`（敏感值只写占位符）与 `E-041`（公开文档泄露口令教训）。页面数、导航、核心功能与验收标准均无变化；**888 项全绿**。依据见 `docs/PLAN.md` v94、`docs/DECISIONS.md` D-067、`docs/ERROR_LOG.md` E-041 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.20）条目。
- **v6.48（2026-11-19）｜反馈箱管理员入口口令门（范围与交付物不变）**：① 反馈箱对话框底部「管理员入口」由直接跳转改为**先校验后跳转**——点击就地展开内联口令区（密码框 + 「解锁」按钮），输入 `<管理员口令>` 并通过后才进入 `admin.html`；口令错误显示「口令错误，请重试」并清空输入，每次打开反馈箱自动收起复位。② `core.js` 新增唯一口令常量 `NB.adminPass = '<管理员口令>'`，`page-admin.js`（页面门）与 `feedback.js`（入口门）共用，避免两处硬编码漂移。③ 新增 `.fb-admin-gate*` 样式（`--line / --soft / --ink-soft / --danger` 主题变量），明暗主题与字号缩放自适应；`admin.html` 原口令门保留为第二道防线。④ 口令仍为**纯前端软限制**（源码可见，仅防误入，不做真正鉴权）；云端模式已登录时页面门不弹，但入口层校验始终生效。页面数、导航、核心功能与验收标准均无变化；`verify-native` 新增 10 项，**887 项全绿**，24 个 HTML 指纹 `?v=1145` → `?v=1146`。依据见 `docs/PLAN.md` v93、`docs/DECISIONS.md` D-066 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.19）条目。
- **v6.47（2026-11-19）｜Phase 7 自动更新链路（交付物与页面不变）**：① GitHub Actions `source-sync` 由「只读巡检」升级为「自动发布」：`contents: write`，核对 Crossref 后跑 `scripts/build-site.mjs` 重建前端数据，自动 commit / push，Vercel 检测 push 自动重新部署，**不需要 Supabase 或 Cloudflare**；② 新增仓库内可移植构建脚本 `scripts/build-site.mjs`（仓库根由脚本位置推导，替换原硬编码盘符的 `build-data.mjs`），并内置「内容无变化不 bump 指纹、不产生提交」；③ 自动提交仅限记录型数据（来源表 / 更新日志 / 同步状态 / 前端数据 / 指纹），词条正文仍人工维护；④ `DEPLOY.md` §7 重写为路线 A（CI 回写，推荐）与路线 B（Worker，可选）。页面数、导航、核心功能均无变化；`verify-native` 876 → **879 项**，`check-sources` 137、`cloud-check` 59 全绿，指纹保持 `?v=1145`。依据见 `PLAN.md` v92、`DECISIONS.md` D-065 与 `DEV_LOG.md` 2026-11-19（v1.23.18）条目。
- **v6.46（2026-11-19）｜Phase 7 · 数据来源与实时更新（交付物 +1 页，范围不变）**：① **来源登记**：`data/sources.json` 将 110 词条 / 111 条 references 按标题归并为 41 个唯一来源（教材 19 / 论文 12 / 综述 9 / 百科 1），每条含 `id / type / title / url / via / verified_at / terms[]`；`url` 为 Crossref / WorldCat 可核验检索入口，不伪造原文链接；无来源词条 0。② **定时同步**：`scripts/sync-sources.mjs` 支持离线 / `--online`（Crossref，8s 超时降级）/ `--check-links` / `--simulate`，产出 `data/sync-state.json` 与 `data/update-log.json`；`workers/source-sync` Cron 每周一 03:17 UTC 巡检链接与 180 天复核时效，失败项写入 `update_queue` 并记录 `sync_runs`；GitHub Actions 同频执行。③ **质量门**：`scripts/check-sources.mjs` 137 项（来源可溯 / 术语唯一 / URL 格式 / 365 天新鲜度 / 队列完整性）；`verify-native` 新增 23 项断言，853 → **876 项**、`cloud-check` 59 项全绿。④ **前端**：新增 `updates.html`（概览 / 最近更新 12 条 / 41 行来源表 / 同步记录 / 待审队列），首页增加最近更新条，内容生态增加第 4 张入口卡，词条页每条来源带「打开核验入口」；交付物由 7 栏目 23 页变为 **7 栏目 24 页**（updates 页不占顶级导航，导航仍 7 项）。⑤ **数据库**：新增 `terms / sources / term_references / update_queue / sync_runs` 5 表（共 13 表全 RLS，公开只读、写仅 service_role）与 `review_update()` RPC。24 个 HTML 指纹 `?v=1143` → `?v=1145`（298 处）。依据见 `docs/PLAN.md` v91、`docs/DECISIONS.md` D-064、`docs/ERROR_LOG.md` E-040 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.17）条目。
- **v6.45（2026-11-19）｜液面波动幅度加大（范围与交付物不变，交互质感调整）**：① 驱动增益整体抬高：`tiltTo` 从 `axS*9.6+vx*5.2` 提到 `axS*12.0+vx*6.2`（夹取 ±42°），`levelTo` 从 `-ayS*26-vy*0.8` 提到 `-ayS*31-vy*1.0`（夹取 ±13px），`waveTo` 三项增益 `0.075/0.014/0.34 → 0.115/0.020/0.46`（上限 ±5.6），`bulgeTo` 增益 `2.2 → 2.9`，`ripple` 幅值 `1.5 → 2.4px`；② 阻尼反向回补 `Z_T 0.115 → 0.140`、`Z_L 0.30 → 0.36`，保证波幅变大的同时松手后 2~3 次回摆即收住；③ CSS 同步放大曲率表现（液面线位移 `-3.4px`、`scaleY 0.62`、线高 `2.6px`），`--liquid-wave-r` 系数 `1.4 → 1.9`；④ 验收行为：快速甩动液面倾角 ≥12°、上下往复液面位移 ≈7px、松手后 2.2s 内收敛到 0.6° 以内且仍保留 2~3 次可见回摆。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 852 → **853 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1142` → `?v=1143`（281 处）。依据见 `docs/PLAN.md` v90、`docs/DECISIONS.md` D-063、`docs/ERROR_LOG.md` E-039 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.16）条目。
- **v6.44（2026-11-19）｜液体流动性增强（范围与交付物不变，交互质感调整）**：① 阻尼整体下调（`Z_T 0.13→0.115`、`Z_L 0.70→0.30`、`Z_W 0.07→0.055`、`Z_S 0.16→0.12`、`Z_B 0.50→0.32`），液面升降改为欠阻尼，松手后回弹 2~3 次；② 惯性幅度加大：`tiltTo` 增益 9.6、夹取 ±40°，`levelTo` 增益 26；③ 新增水体内部漂移 `--liquid-drift`、高频波纹 `--liquid-ripple`、3 个持续上浮气泡、液面两端弯月面；④ 水体更通透、内阴影收细，`conic-gradient` 硬边光纹改为两层柔和径向光；⑤ 水珠透明度改为 `burst²` 驱动，小抖动时不显形；⑥ 验收行为：拖动时液面明显倾斜（快甩 ≥11°）并随水花回摆 2~3 次，水体内部比外壳慢半拍，静止时仍可见气泡缓慢上浮，约 1.5s 内完全静止。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 850 → **852 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1141` → `?v=1142`（281 处）。依据见 `docs/PLAN.md` v89、`docs/DECISIONS.md` D-062、`docs/ERROR_LOG.md` E-038 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.15）条目。
- **v6.43（2026-11-19）｜按真实物理重做上下晃动（范围与交付物不变，交互行为修正）**：① 液面位移改由竖直加速度驱动（`levelTo = -ayS*24 - vy*0.8`，clamp ±12），匀速拖动水面不再持续偏移；② 新增轴对称曲率通道 `--liquid-bulge`（`bulgeTo = ayS*2.2`）与挂壁水膜 `.nb-ai-fab-film`；③ 水花改为掉头脉冲 `burst`（`|dvY| > 0.45` 注入，约 0.3s 落回），不再常驻液面；④ 删除竖直方向对整体旋转的输入，松手需 `|lastVx| > 0.2` 才翻滚；⑤ 手指停住超过 90ms 视为容器静止；⑥ 验收行为：匀速上下拖动液面基本水平、快速往复时液面升降 3~4px 且中心鼓起/下凹交替、每次掉头溅起水柱与水珠并在 0.3s 内落回、两侧球壁出现水膜、球内水体不整体旋转、停止后 2s 内完全静止；水平快甩、慢拖、点击开合面板行为不变。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 848 → **850 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1140` → `?v=1141`（281 处）。依据见 `docs/PLAN.md` v88、`docs/DECISIONS.md` D-061、`docs/ERROR_LOG.md` E-037 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.14）条目。
- **v6.42（2026-11-19）｜垂直甩动水花（范围与交付物不变，交互行为补充）**：① 新增垂直惯性通道 `dvY / ayS`：`levelTo = -vy*3.6 - ayS*1.6`、`spinV` 追加 `ayS*260*sec`，快速上下拖动时液面明显升降且水体内部翻卷；② `sloshTo` 改为取水平与垂直两组强度的较大值，上下快速拖动同样能拉满水花；③ 水花视觉扩为「溅射环 + 2 根水柱 + 4 粒错落水珠」，全部随 `--liquid-level` 升降，`--splash-y` 上跳幅度 2.4 → 6.2px；④ 验收行为：上下快速甩动可见水柱冲起与水珠飞溅、松手后水花跟随液面上涌并在约 1s 内消失；水平快甩、慢拖、点击开合面板行为不变。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 846 → **848 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1139` → `?v=1140`（281 处）。依据见 `docs/PLAN.md` v87、`docs/DECISIONS.md` D-060、`docs/ERROR_LOG.md` E-036 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.13）条目。
- **v6.41（2026-11-19）｜浮球液体物理升级（范围与交付物不变，交互行为细化）**：① 液面倾角由「指针速度直接映射」改为惯性力驱动——速度差分归一化到 16ms 增量后低通，再合成惯性项与粘滞拖曳项；慢拖约 1.3°、快甩 8.7°，梯度明显。② 新增二阶驻波 `wave`（液面亮线起伏 / 微倾 / 拉伸）与角动量翻滚 `spin`（驱动水体内部层旋转，快甩峰值约 38°）。③ 水花由「最后一次速度骤停」换算的冲量导出，两粒拉长水珠沿甩动方向从液面溅起；`slosh` 随速度提升。④ 松手出现反向过冲（实测 8.7°）与 2~3 次可见回摆，约 1s 收敛后各通道归零并停止 rAF；`prefers-reduced-motion` 变更时立即清零。⑤ 验收行为：慢拖只轻微晃动、快甩大幅倾斜并翻滚、极快甩动水花明显、松手有回摆但最终完全静止；点击开合面板与浮球落点行为不变。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 841 → **846 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1138` → `?v=1139`（281 处）。依据见 `docs/PLAN.md` v86、`docs/DECISIONS.md` D-059、`docs/ERROR_LOG.md` E-035 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.12）条目。
- **v6.40（2026-11-19）｜AI 助教浮球改为玻璃球 + 半瓶蓝色液体（范围与交付物不变，视觉与交互行为变更）**：① 浮球外观改为透明玻璃球内盛半瓶与站点同色调的蓝色液体，玻璃层用 `backdrop-filter: blur(.45px) saturate(1.6) brightness(1.04) contrast(1.08)` 对下方文字做折射，叠加主光斑、右下反光、边缘色散环与内缘暗环；液体液面固定在 49.5%，水体半透明、文字可辨；移除球内 ✦ 图标。② 新增 `createLiquid()` 弹簧-阻尼物理（`--liquid-tilt / --liquid-level / --liquid-sway`）：按下液面受压上浮（约 -2.2px）、拖动按指针速度惯性倾斜（向右拖最高约 16°）、松手带阻尼回弹（约 1s 归零），rAF 静止即停。③ 验收行为：点击 / 拖动 / 释放均有液体反馈且不影响浮球落点与面板开合；`prefers-reduced-motion` 下液体完全静止；触摸与鼠标行为一致；球压在文字上时可看到玻璃折射与水下文字。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 837 → **841 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1137` → `?v=1138`（281 处）。依据见 `docs/PLAN.md` v85、`docs/DECISIONS.md` D-058、`docs/ERROR_LOG.md` E-034 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.11）条目。
- **v6.39（2026-11-19）｜删除存量明文 API 记录（功能零影响，范围与交付物不变）**：① 删除 `.deepworks/tmp/` 下 6 个含明文凭证的过程文件——`cf-token.txt`（Cloudflare API Token）、`sb-probe.py` / `sb-probe2.py` / `make-fb-probe.py`（内联 Supabase anon JWT）、`badcfg.html` / `badcfg.txt`（含 anon key 的浏览器探测快照），删除前已确认 `checks/`、构建脚本与站点代码均无引用；② `uploads/ses_efac5f5e9ffeRWbSrH5O3JFhTQ/index.html` 中 1 处 publishable key 脱敏为 `sb_publishable_REDACTED`（历史快照，不参与构建）；③ 保留 `outputs/neurobase/assets/js/cloud-config.js` 的 publishable key——它是 23 个页面共用的运行必需凭据（受 RLS 约束），删除将导致登录 / AI 助教 / 在线反馈全部失效；④ 全站明文凭证扫描（`sk-` / `AIza` / `ghp_` / `sb_secret_` / `cfut_` / `eyJhbGciOiJ` / `AKIA`）**0 命中**。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，无 HTML / JS / CSS 改动，指纹保持 `?v=1137`；`verify-native` 837 / `cloud-check` 59 全绿。延续 `D-055` 的凭据分级，复用 `E-031`，本轮无新增决策与教训。依据见 `docs/PLAN.md` v84 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.10）条目。
- **v6.38（2026-11-19）｜AI 助教浮球松手落点修复（范围与交付物不变，验收行为细化）**：① 复现用户反馈的「松手向边缘吸附」——实际是拖动位移被叠加：`left` 增加 `dx` 的同帧里残留 `transform` 仍带一份 `dx`，浏览器仍按 `transition: transform 0.22s` 过渡，视觉位置变成 `2dx`，大位移时被视口裁在边缘；② 修复为「拖动期全程内联锁过渡 + 强制重排」，落点按「清 `transform` → 写 `left/top` → 强制重排 → 摘 `.is-dragging` → 双 `requestAnimationFrame` 交还 CSS 过渡」提交，并改用 `pointerup` 坐标结算；③ 验收行为明确为「松手后球停在当前视觉位置，不再出现任何滑动 / 吸附；仅在超出视口时按 8px 边距夹紧」。核心功能、交付物（7 栏目 23 页）与非目标均无变化；`verify-native` 835 → **837 项**、`cloud-check` 59 项全绿；23 个 HTML 指纹 `?v=1136` → `?v=1137`（281 处）。依据见 `docs/PLAN.md` v83、`docs/DECISIONS.md` D-057、`docs/ERROR_LOG.md` E-033 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.9）条目。
- **v6.37（2026-11-19）｜凭证与密钥不落盘（安全约定加固，范围与交付物不变）**：① 根 `AGENTS.md` 新增**第二硬性约定 · 凭证与密钥**——API Key / Token / Secret / 服务端口令只允许存在于运行环境变量与平台 Secrets（Supabase Edge Function Secrets / Cloudflare `wrangler secret` / Vercel Environment Variables），禁止写入 `outputs/**`、`docs/**`、`data/**` 及任何会被提交或发布的源码与配置；② `.gitignore` 由「若干子目录白名单式忽略」改为整体忽略 `.deepworks/tmp/` 与 `supabase/.temp/`，并拦截 `.env`、`.env.*`、`.dev.vars`、`*.pem`、`*.key`、`*.p12`、`*.pfx`、`*secret*.txt`、`*token*.txt`、`*credential*`；③ 凭据分级：Supabase `anon` / `publishable` key 是设计允许公开的前端凭据（数据边界由 RLS 与 `SECURITY DEFINER` RPC 守住），`service_role`、AI Provider key、Cloudflare API Token 属机密、绝不进前端；④ 核查出 `.deepworks/tmp/cf-token.txt` 明文 Cloudflare Token 与 `sb-probe*.py` / `make-fb-probe.py` 内联 anon JWT，用户选择暂不删除、保留 `.gitignore` 整体忽略阻断，并建议轮换已暴露 Token。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，无 HTML / JS / CSS 改动，缓存指纹保持 `?v=1135`；`verify-native.mjs` 835 项全绿。依据见 `docs/PLAN.md` v81、`docs/DECISIONS.md` D-055、`docs/ERROR_LOG.md` E-031 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.7）条目。
- **v6.36（2026-11-19）｜AI 助教浮球：位置跟账号 + 跟手拖动（数据模型新增一列偏好，交付物数量不变）**：① `profiles` 增加 `prefs jsonb not null default '{}'`（`add column if not exists`，幂等；老库需在 SQL Editor 跑一次，未跑时自动退回本浏览器记忆）；② 新增零依赖偏好通道 `NB.cloud.prefs`（本地 `nb-cloud-prefs` 缓存 + 登录态 `PATCH /rest/v1/profiles` + `pull()` 合并）；③ 浮球位置改存视口比例 `{rx, ry}`，跨浏览器 / 跨设备跟随账号；④ 拖动改为合成层位移（`translate3d` + `will-change`），起拖阈值 3px / 触屏 8px，松手自由落点（不再吸附边缘），面板跟随球定位不变。交付物仍为 7 栏目 23 页；未登录 / 离线 / 未迁移时行为与 v6.35 一致。自测 `verify-native` 832 → **835 项**、`cloud-check` 50 → **59 项**全绿；23 个 HTML 指纹 `?v=1135` → `?v=1136`。注：上一轮 CHANGELOG 曾预告「v6.36 + §11」，实际未落盘，本轮补上此号。依据见 `docs/PLAN.md` v82、`docs/DECISIONS.md` D-056、`docs/ERROR_LOG.md` E-032 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.8）条目。
- **v6.35（2026-11-18）｜Phase 6 代码与部署材料就绪（范围不变，新增可选云端接入）**：在保持「双击 `file://` 纯离线可用」的前提下交付全栈接入代码——① `docs/supabase/schema.sql` 重写为 8 表 + 全表 RLS + 6 RPC + Realtime（幂等）；② 零依赖云端层 `assets/js/cloud.js`（Auth / PostgREST / 首次 merge · 改动 mirror · Realtime pull-merge / 未配置与断网三级降级）；③ 账号面板 `auth-ui.js` 与默认留空的 `cloud-config.js`；④ AI 助教 `ai-tutor.js` + `workers/ai-tutor`（CORS / KV 限流 / 8 错误码 / 免责）；⑤ 反馈箱在线化（6 位查询码 + 凭码查回复）与 `admin.html` 云端管理员模式；⑥ `vercel.json` + `.gitignore` + `docs/DEPLOY.md`。交付物数量仍为 7 栏目 23 页；**未配置云端时行为与 v6.34 完全一致**。真实建库 / 部署尚未执行，等待用户完成 Supabase / Cloudflare / GitHub / Vercel 4 项开通后走 Human Gate（§八「全栈联通」暂不勾选）。自测 `verify-native` 794 → **817 项**、`cloud-check` **43 项**全绿；23 个 HTML 指纹 `?v=1128` → `?v=1129`。依据见 `docs/PLAN.md` v74、`docs/DECISIONS.md` D-053、`docs/ERROR_LOG.md` E-026 与 `docs/DEV_LOG.md` 2026-11-18（v1.23.0）条目。
- **v6.34（2026-11-18）｜Phase 0–5 全部通过人工验收（范围不变，属验收状态确认）**：用户确认 Phase 0–5 验收通过。§八 成功标准勾选已由验收覆盖的 4 项——手机与电脑均可用、检索准确、学习闭环、互动可视化；**300+ 术语**（当前 110 条）、**全栈联通**、**社区与个性化 / 无障碍**、**课程 5% 评分**仍保持未勾选，避免把阶段验收误读为全部成功标准达成。PLAN §4 / §5 / §6 与 DEV_LOG 阶段映射表同步标记 Status；DEV_LOG 映射表由旧 6 阶段口径重写为 PLAN 十阶段派生视图。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，无产品代码改动（仅重建 `assets/js/data/docs-content.js` 并 bump 指纹 `?v=1128`），`verify-native.mjs` 794 项全绿。依据见 `docs/PLAN.md` v73、`docs/DECISIONS.md` D-052、`docs/ERROR_LOG.md` E-025 与 `docs/DEV_LOG.md` 2026-11-18（v1.22.0）条目。
- **v6.33（2026-11-18）｜全站「返回 XXX」按钮视觉统一（范围不变，属验收交互细化）**：新增公共返回样式 `.nb-back`（实心主色底、白字、`←` 伪元素箭头、字重 600、胶囊圆角、投影；悬停加深并左移 2px，`:focus-visible` 2px 焦点环），文档详情页与 4 个互动实验页（`docs.html` / `lab-anatomy.html` / `lab-cogsim.html` / `lab-signals.html` / `lab-bci.html`）的返回入口由 `btn btn-ghost`（该类在样式表中从未定义）改为 `btn nb-back`；`quiz-run.html` / `spelling-run.html` 异常态的「返回学习工具」同步改类；词条页顶部 `.btn-back` 并入同一套规则，词条不存在页补 `nb-back`；选题页 `.qz-back-btn--outline` 由 1px 加粗到 2px 并补 `--soft-blue` 浅底与投影，仍让位于「开始」按钮；答题过程页仍不显示返回键。`verify-native.mjs` 新增 13 项返回键统一断言，**781 → 794 项全绿**；全部 23 个 HTML 缓存指纹 `?v=1127`。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，验收标准补充「任一页面的返回出口必须为高对比主色胶囊且带左箭头」。另修正 `supersedes` 链中上一轮漏写的 `v6.32` 编号。依据见 `docs/PLAN.md` v72、`docs/DECISIONS.md` D-051、`docs/ERROR_LOG.md` E-024 与 `docs/DEV_LOG.md` 2026-11-18（v1.21.7）条目。
- **v6.32（2026-11-18）｜交互式脑解剖：词条跳转返回后原样恢复（范围不变，属验收交互细化）**：`page-lab-anatomy.js` 新增会话级视图快照 `nb-anatomy-view`，覆盖 3D 相机位置与观察目标、真实解剖 / 分区部件模式、选中脑区与「近似归属」、每个部件的位置与四元数、全部拆分、自动旋转、单部位旋转模式、部位操作菜单及坐标、2D 皮层表面 / 皮层下分层、标注开关、滚动位置；新增 `nb-anatomy-return` 返回标记，仅从本页点 `term.html`（信息面板「相关词条」）时写入，30 分钟有效，从导航栏 / 「返回课程实验区」等非词条页面离开时立即清档。`NB3D.focus` 保存应用侧观察目标；`NB.labAnatomy` 导出 `state()` / `saveState()` / `clearState()`。`verify-native.mjs` 新增 32 项返回恢复断言，**749 → 781 项全绿**；全部 23 个 HTML 缓存指纹 `?v=1126`。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，验收标准细化为「词条返回 = 离开瞬间画面；其他入口 = 默认画面」。依据见 `docs/PLAN.md` v71、`docs/DECISIONS.md` D-050、`docs/ERROR_LOG.md` E-023 与 `docs/DEV_LOG.md` 2026-11-18（v1.21.6）条目。
- **v6.31（2026-11-16）｜学习工具返回键视觉强化（范围不变，属验收交互细化）**：答题结束页 `quiz-result.html` / `spelling-result.html` 的「返回学习工具」由幽灵按钮改为实心主色胶囊 `qz-back-btn--solid`（`--t-base` 字号、字重 600、`--shadow-lg` 投影、左侧 `←` 箭头），成为结果页最显眼的出口；选题页 `quiz.html` / `spelling.html` 改为主色描边 `qz-back-btn--outline`，明显但让位于表单「开始」按钮，深色主题用 `--link`；箭头由 `.qz-back-btn::before` 伪元素绘制，避免被 i18n 的 `textContent` 覆盖；`.qz-footer` 补 `gap: 0.75rem` 与 `flex-wrap`，双按钮不再紧贴。答题过程中仍不显示任何返回键。`learning-flow-check.mjs` **48 项全绿**，`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 缓存指纹 `?v=1125`。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化。依据见 `docs/PLAN.md` v70、`docs/DECISIONS.md` D-049、`docs/DEV_LOG.md` 2026-11-16（v1.21.5）条目。
- **v6.30（2026-11-16）｜学习工具答题返回键收敛（范围不变，属验收交互细化）**：答题过程页 `quiz-run.html` / `spelling-run.html` 在正常答题状态下不显示底部返回键——`#qz-footer` / `#sp-footer` 默认 `hidden`，仅「没有进行中的测验 / 训练」异常态由 `page-quiz-run.js` / `page-spelling-run.js` 取消隐藏，保留返回出口；答题结束页 `quiz-result.html` / `spelling-result.html` 与选题页 `quiz.html` / `spelling.html` 的返回按钮去掉 `data-back`，固定 `href="learn.html"`，文案统一「返回学习工具」；`style.css` 补 `.qz-footer[hidden] { display: none }`，避免 `.qz-footer` 的 `display: flex` 覆盖全局 `[hidden]`。`verify-native.mjs` **749 项全绿**；全部 23 个 HTML 缓存指纹 `?v=1124`。核心功能、交付物数量（7 栏目 23 页）与非目标均无变化，验收标准仅调整为「答题中不可从页面底部离开、结束页返回固定回到学习工具」。依据见 `docs/PLAN.md` v69、`docs/DECISIONS.md` D-048、`docs/ERROR_LOG.md` E-022 与 `docs/DEV_LOG.md` 2026-11-16（v1.21.4）条目。
- **v6.29（2026-11-11）｜Phase 5 内容生态全部上线（范围不变）**：新增「内容生态」栏目（主导航 6 → 7）与 hub `explore.html`；BCI 专区 `bci.html`、神经科学↔工程对照 `bridge.html`、科研前沿速览 `frontier.html` 三页上线，数据源为 `data/bci_zone.json` / `engineering_map.json` / `frontier.json`，构建期断言词条引用与 DOI 非空；§4.5 / §4.6 交付状态与 §9 交付物（7 栏目 23 页）同步。自测 744 项全绿，指纹 `?v=1117`。核心功能、非目标与验收标准不变。依据见 `docs/PLAN.md` v65、`docs/DECISIONS.md` D-045 与 `docs/DEV_LOG.md` 2026-11-11（v1.21.0）条目。
- **v6.28（2026-11-11）｜迭代记录约定常驻化（范围不变）**：`version-changelog` skill 的 description 与触发条件新增「后续迭代，同步更新相关 md 文件，并记入版本迭代日志」等触发词，并声明该约定对后续所有迭代默认常驻生效、补「常驻性说明」；触发条件新增「用户在迭代前定下常驻规矩」一条。本轮无产品代码、数据或页面改动，核心功能、非目标与验收标准均无变化（仅记录流程加固）。自测 712 项全绿，缓存指纹保持 `?v=1116`。依据见 `docs/PLAN.md` v62 与 `docs/DEV_LOG.md` 2026-11-11（v1.20.1）条目。
- **v6.25（2026-11-10）｜脑解剖单部位旋转 / 复位 + 全局按钮更名 + 移除加载提示（范围不变）**：3D 分区部件模式点选部位后弹出「旋转 / 复位」菜单；「旋转」进入单部位旋转模式，拖拽绕部件自身中心旋转；「复位」只还原该部件位置与角度。底部按钮更名「全部拆分 / 全部合并 / 全部复位」（i18n 中英），「全部复位」不再写回相机与 `controls.target`，保留观察视角。删除「3D 场景加载中…」提示文字（空节点仅在 WebGL 不可用时显示降级说明）。自测 677 → 689 项全绿，全部 19 个 HTML 缓存指纹 `?v=1114`。核心功能、非目标与验收标准均无变化（属互动实验室交互细化）。依据见 `docs/PLAN.md` v59、`docs/DECISIONS.md` D-041 与 `docs/DEV_LOG.md` 2026-11-10 条目。
- **v6.27（2026-11-10）｜左上角「返回」按来源页面命名并可回到上一页（范围不变）**：新增统一智能返回，按上一页标题显示「返回术语检索」「返回互动实验室」等文案，点击回到上一页；无来源时保留各页原链接。涉及 core 与 11 个页面的返回按钮，属导航体验细化，核心功能与验收标准不变。自测 694 项全绿，指纹 ?v=1116。依据见 docs/PLAN.md v61、docs/DECISIONS.md D-043 与 docs/DEV_LOG.md 2026-11-10（v1.20.0）条目。
- **v6.26（2026-11-10）｜单部位旋转锁定其他部位与相机（范围不变）**：单部位旋转改为独占交互，只有选中部位参与变换；点击其他部位或空白即退出旋转，且不会在同一手势里选中 / 拖动其他部位；旋转期间暂停 OrbitControls 自动旋转与阻尼惯性，退出恢复。属交互细化，核心功能、非目标与验收标准均无变化。自测 691 项全绿，指纹 `?v=1115`。依据见 `docs/PLAN.md` v60、`docs/DECISIONS.md` D-042 与 `docs/DEV_LOG.md` 2026-11-10（v1.19.1）条目。
- **v6.24（2026-11-10）｜搜索回归修复 + 迭代记录规则常驻化（范围不变）**：`page-terms.js` 的 `pageshow` 监听器改为仅在 `e.persisted`（bfcache 恢复）时刷新，修复首次加载把用户已输入的搜索词重置为空、检索结果恒为全部 110 条的问题（`E-013`）；项目根新增 `AGENTS.md` 常驻规则，把「每次版本迭代与错误修正都必须同步更新相关 md」从 skill 提升为每轮自动生效（`D-040`），交付物清单的「记录文件」同步登记该规则文件；自测 677 项全绿，全部 19 个 HTML 缓存指纹 `?v=1113`。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v58 与 `docs/DEV_LOG.md` 2026-11-10 条目。
- **v6.23（2026-11-09）｜「学习工具」更名 + 首页精简（范围不变）**：「学习中心」→「学习工具」、顶部导航「学习」→「学习工具」（中英 i18n 同步），learn.html 标题与 meta、返回链接、帮助导览文案一并更新，页内二级标题改「选择工具」；首页删除原先的「学习工具」「互动实验室」两个模块（含 6 张工具卡与「进入」按钮），同步移除 `page-home.js` 的入口统计逻辑，首页保留 Hero 检索 / 每日一词 / 学习进度。verify 断言更新，自测 674 → 677 项全绿；全部 19 个 HTML 缓存指纹 ?v=1112。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v57 与 `docs/DEV_LOG.md` 2026-11-09 追加条目。
- **v6.22（2026-11-09）｜胼胝体 / 丘脑真实分割模型（范围不变）**：从 TemplateFlow 的 MNI152 aseg 分割（`tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz`，CC BY 4.0）提取胼胝体（标签 251–255，982 顶点 / 1960 面）与双侧丘脑（10 / 49，各 1090 顶点 / 2176 面）三维网格：NIfTI 解析 → 2× 降采样 → Surface Nets → Laplacian 平滑 → 与 pial 皮层逐轴仿射对齐；3D 部件模式改用真实网格（新增 mesh 类型，DoubleSide、不乘 BASE_SCALE），2D 侧视与矢状剖面的胼胝体 / 丘脑轮廓改为真实投影；i18n 新增 `deepSource` 如实标注数据来源。海马 / 侧脑室 / 小脑 / 脑干仍为按解剖形态建模。verify 新增 6 项断言，自测 667 → 674 项全绿；指纹 ?v=1112。核心功能、非目标与验收标准均无变化。
- **v6.21（2026-11-09）｜2D 解剖图 / 矢状剖面真实投影 + 深层结构解剖化（范围不变）**：「2D 示意图」「剖面示意」改为真实数据驱动——侧视轮廓（123 点）与 4 个脑区轮廓（额 114 / 顶 93 / 颞 184 / 枕 109 点）、矢状内侧面轮廓（283 点）均由 fsaverage5 pial 三角面栅格化投影生成，新增 `assets/data/brain-2d.js` 与 `gen-2d-anatomy.mjs`；3D 胼胝体改扁平弓形带、侧脑室改 C 形半透明弯管、小脑加叶片正弦位移、脑干加桥脑膨大；按钮文案改为「2D 解剖图 / 矢状剖面」，中英 i18n 同步；verify 新增 11 项 2D/剖面断言，自测 656 → 667 项全绿；全部 19 个 HTML 缓存指纹 ?v=1110。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v55 与 `docs/DEV_LOG.md` 2026-11-09 追加条目。
- **v6.20（2026-11-09）｜表面分区全部真实网格 + 拖动根因修复（范围不变）**：皮层表面数据转轴为 three.js y-up 并统一直径 1.25（修复模型躺倒与尺寸不匹配）；「分区部件」模式中额叶（11686 面）/ 顶叶（9306）/ 颞叶（12554）/ 枕叶（7414）由 fsaverage5 pial 真实网格分区切割（含沟回，DoubleSide），小脑 / 脑干 / 深部结构保留示意几何并对齐尺寸；修复拖动异常缩放真正根因（原以 group.position（恒为 0）建平面与偏移，首帧甩飞并呈透视缩放；现以部件世界包围盒中心建固定视平面、按交点差值相对平移，深度大小不变）；i18n engineNote 更新；verify 13.7 扩展（区域归属新坐标 / 4 叶真实面数 / 合计 40960 / 小脑脑干回退 0），自测 650 → 656 项全绿；全部 19 个 HTML 缓存指纹 ?v=1109。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v54 与 `docs/DEV_LOG.md` 2026-11-09 追加条目。
- **v6.19（2026-11-09）｜交互式脑解剖真实皮层表面 + 拖动修复（范围不变）**：脑解剖模块新增**真实皮层表面模式（默认）**——FreeSurfer fsaverage5 pial（20484 顶点 / 40960 三角面，含真实脑沟脑回；来源 PennLINC/fsaverage5-Schaefer2018，t4 二进制解析 + 归一化后内嵌 `assets/vendor/three/brain-surface.js`，离线可用）；点击表面按 Talairach 坐标启发式近似归属 6 大表面脑区（额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干），信息面板标注「（近似归属）」；「真实解剖 / 分区部件」双模式切换（分区部件保留拆分 / 挪动 / 复位）；修复拖动解剖块异常缩放（拖动期间暂停 OrbitControls.update，深度不变）；i18n 新增 5 键；style.css 新增模式样式；verify 13.7 扩展（表面数据 / 顶点面数 / 默认模式 / 区域归属 / 模式切换与禁用态），自测 637 → 650 项全绿；全部 19 个 HTML 缓存指纹 ?v=1108。核心功能、非目标与验收标准均无变化。说明：fsaverage5 为 40 名被试平均的标准皮层模板（非个体扫描），沟回细节受网格分辨率限制，后续可换更高分辨率网格原位替换。依据见 `docs/PLAN.md` v53 与 `docs/DEV_LOG.md` 2026-11-09 追加条目。
- **v6.18（2026-11-09）｜三份迭代档案按课程规范重建（范围不变）**：按课程 Part 8「RECORD & ITERATE」规范整理 `docs/DEV_LOG.md`（52 条按日期倒序重排 + 阶段总览索引 + Phase 0–6 映射）、`docs/DECISIONS.md`（补 D-032–D-039 + 决策索引）、`docs/ERROR_LOG.md`（补 E-010–E-012 + 五问模板 + 错误索引，并修正错位锚点）；`version-changelog` skill 增加「三档案同步判定」，后续每轮迭代必须判定并同步。核心功能、非目标与验收标准均无变化（仅记录体系与流程约定）。依据见 `docs/PLAN.md` v52 与 `docs/DEV_LOG.md` 2026-11-09 三档案条目。
- **v6.17（2026-11-09）｜交互式脑解剖 3D 全景升级（范围不变）**：脑解剖模块增加 3D 全景视图——three.js（r128，MIT）本地化于 `assets/vendor/three/`，程序化建模 10 部件 15 mesh 解剖分区 3D 大脑（额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干 / 胼胝体 / 丘脑 / 海马 / 侧脑室，与 2D 脑区一一对应），支持拖拽旋转 / 自动旋转 / 拆分合并 / 点选挪动 / 一键复位 / 点选说明；页面提供 3D 全景 / 2D 示意图 / 剖面示意三视图切换；i18n 新增 labAnatomy3d.* 键（zh/en）；style.css 新增 3D 样式；verify-native.mjs 13.2 重构 + 新增 13.7 块（624 → 637 项全绿）；全部 19 个 HTML 缓存指纹 ?v=1107。核心功能、非目标与验收标准均无变化（3D 全景属既有范围内「§4.4 互动与可视化」）。注意：网络探测（NIH 3D Print Exchange / Wikimedia / BodyParts3D / GitHub / npm）获取真实扫描模型受阻，当前为程序化解剖分区示意（用户已确认）。依据见 `docs/PLAN.md` v51 与 `docs/DEV_LOG.md` 2026-11-09 追加条目。
- **v6.16（2026-11-09）｜Phase 4 互动实验室上线（范围不变）**：新增「互动实验室」栏目（主导航 5 → 6 栏目）与四类互动模块——交互式脑解剖（lab-anatomy.html：SVG 点选 / 分层 / 标注 / 剖面）、认知实验模拟（lab-cogsim.html：Stroop / 反应时 / 记忆广度）、神经信号与范式演示（lab-signals.html：EEG / ERP-P300 / SSVEP / 运动想象 Canvas 动画）、BCI 案例拆解（lab-bci.html：四案例六环节），入口页 lab.html + 首页入口区，产物 14 → 19 页、脚本 17 → 22；i18n 新增 lab.* 键（zh/en）；style.css 新增 Phase 4 样式；verify-native.mjs 新增第 13 块断言（570 → 624 项全绿）；全部 19 个 HTML 缓存指纹 ?v=1106。核心功能、非目标与验收标准均无变化（互动可视化属既有范围内「§4.4」）。依据见 `docs/PLAN.md` v50 与 `docs/DEV_LOG.md` 2026-11-09 条目。
- **v6.15（2026-11-02）｜删除闪卡模块（范围收窄）**：用户确认不再需要闪卡，删除 `flashcards.html` / `flashcards-result.html` 与 `page-flashcards.js` / `page-flashcards-result.js`（16 → 14 页、19 → 17 脚本）及 SM-2 间隔重复（SRS）引擎（learn.js 删 `sm2Rate` / `srs` 全块）；首页 / 学习中心工具卡 3 → 2（拼写与缩写训练 + 测验）；学习中心进度删「到期卡」项（保留浏览 / 测验 / 错题 / 收藏）；i18n（zh/en）删 `flashcards.*` 整块与 `learn.flashcards*` / `learn.progressSrs`；core.js 帮助导览 step1Desc 去闪卡；style.css 删 `/* 闪卡 */` 块；verify-native.mjs PAGES/SCRIPTS 减至 14/17 并删除闪卡断言块；全部 14 个 HTML 缓存指纹 `?v=1104`；重跑 build-docs.mjs。核心功能相应收窄（学习工具 = 拼写与缩写训练 + 测验 + 错题本 + 收藏 + 进度），非目标与验收标准同步更新（验收清单去闪卡）。依据见 `docs/PLAN.md` v48 与 `docs/DEV_LOG.md` 2026-11-02 条目。
- **v6.14（2026-11-01）｜学习工具分页流程（范围不变）**：闪卡 / 拼写 / 测验由单页多界面改为「选题 → 答题 → 结果」多页跳转，新增 flashcards-result / spelling-run / spelling-result / quiz-run / quiz-result 五页，spelling.html / quiz.html 改为选题设置页；修复闪卡评分后跳转死循环（移除当前卡后 pos 不再自增，「忘记」的卡插回队列稍后重现）与拼写 zh2en 释义显示拼音简写（释义只显示词条含义）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v47 与 `docs/DEV_LOG.md` 2026-11-01 学习工具分页流程条目。
- **v6.13（2026-10-26）｜再次删除顶栏左上角品牌图标（范围不变）**：顶部栏 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑线稿）整体移除，品牌区仅保留 NeuroBase 文字与副标题；首页 hero 横幅保持无图标。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v46 与 `docs/DEV_LOG.md` 2026-10-26 再次删除顶栏图标条目。
- **v6.12（2026-10-26）｜恢复顶栏左上角品牌大脑图标（范围不变）**：顶部栏 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑线稿，与参考图一致）恢复并置于 NeuroBase 标题左侧；首页 hero 横幅保持无图标。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v45 与 `docs/DEV_LOG.md` 2026-10-26 恢复顶栏图标条目。
- **v6.11（2026-10-26）｜删除深蓝色 hero 横幅左上角图标（范围不变）**：首页 hero 横幅 `.hero-mark`（蓝色圆角方块 + 白色侧视大脑线稿）整体移除，横幅仅保留主标题 / 副标题 / 检索表单。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v44 与 `docs/DEV_LOG.md` 2026-10-26 删除 hero 图标条目。
- **v6.10（2026-10-26）｜删除顶栏左上角品牌图标（范围不变）**：顶部栏 `.brand-mark`（蓝色圆角方块 + 白色侧视大脑线稿）整体移除，品牌区仅保留 NeuroBase 文字与副标题；首页 hero 横幅图标保留。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v43 与 `docs/DEV_LOG.md` 2026-10-26 删除顶栏图标条目。
- **v6.9（2026-10-26）｜品牌图标按参考图重绘（范围不变）**：顶部栏 `.brand-mark` 与首页 hero `.hero-mark` 删除原 11-path 侧视大脑线稿，替换为**蓝色圆角方块 + 白色侧视大脑线稿**（6 条 path：肾形大脑轮廓 / 两条脑干下垂线 / 三条沟回弧；容器背景改图片同款纯蓝 `#2e6be6`，hero 由透明背景改为蓝色圆角方块）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v42 与 `docs/DEV_LOG.md` 2026-10-26 品牌图标重绘条目。
- **v6.8（2026-10-26）｜学习工具交互改造（范围不变）**：拼写 / 测验两页新增**返回学习中心**按键（.qz-footer + .btn.btn-ghost 链接，href="learn.html"）；测验改为「选题 → 答题 → 提交答案」**三独立界面依次跳转**（提交后表单移入结果区 #qz-review 显示解析，再测移回答题界面重建题目）；拼写「选题 / 答题」两界面分离，新增**看中文写英文（zh2name）/ 看英文写中文（en2zh）**两种模式（模式 3 → 5），learn.js 新增中文名判分 zhOK，答错反馈正确答案按模式显示中 / 英文；修复拼写页「本轮题数」字面 {n}。核心功能、非目标与验收标准均无变化（均属既有范围内「学习闭环」交互优化）。依据见 docs/PLAN.md v41 与 docs/DEV_LOG.md 2026-10-26 条目。
- **v6.7（2026-10-16）｜品牌徽标与首页横幅侧视大脑线稿（范围不变）**：顶部栏品牌徽标（`.brand-mark`，`core.js` 注入全站 11 页）由「NB 文本 + Lucide 正面大脑图标」替换为 **11-path 侧视大脑线稿 SVG**（横扁拱形皮质轮廓 / 括号形额叶与枕叶沟回 / 中央沟 / 外侧裂 / 底部两条脑干平行线 / 右下独立小脑圆凸与纹理，与已交付 Logo 形态一致），不再显示 NB 文本；首页 hero 横幅新增同款 `.hero-mark`（viewBox 与 path 数量与品牌徽标一致）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v40 与 `docs/DEV_LOG.md` 2026-10-16 品牌图标条目。
- **v6.6（2026-10-15）｜学习工具上线（范围不变）**：新增**学习中心**（`learn.html`，工具入口 / 错题本 / 收藏 / 进度统计）与**闪卡**（`flashcards.html`，SM-2 间隔重复、到期优先队列、四档评分，存储 `nb-srs`）、**拼写与缩写训练**（`spelling.html`，中→英 / 缩写 / 听写三模式，大小写不敏感判分）、**测验**（`quiz.html`，单选 / 多选 / 填空 / 混合，seeded 出题可复现，提交判分 + 逐题解析）四页；主导航 4 → **5 栏目**（新增「学习」）；词条页新增收藏按钮（`#nb-fav`）、首页新增学习入口区；全局脚本 `learn.js` + i18n `learn.*`/`flashcards.*`/`spelling.*`/`quiz.*` 键（zh/en）；存储键 `nb-srs` / `nb-mistakes`（上限 200）/ `nb-favorites`（上限 100）/ `nb-quiz-stats`；修复 `page-flashcards.js` 新卡补位恒等缺陷。核心功能、非目标与验收标准均无变化（学习工具属既有范围内「学习闭环」）。依据见 `docs/PLAN.md` v39 与 `docs/DEV_LOG.md` 2026-10-15 学习工具条目。
- **v6.5（2026-10-15）｜帮助导览「上一步」按钮修复（范围不变）**：帮助功能导览底部按钮组左侧按钮此前文案未填充（空白色框），现补「上一步」文案（i18n `help.prev`，zh「上一步」/ en「Back」）并新增向左箭头图标（`.tour-prev-ico`，`accent` 青绿主题色，与「下一步」按钮主题色一致；第一步骤禁用时图标与文字淡化为 `muted`）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v38 与 `docs/DEV_LOG.md` 2026-10-15 上一步按钮修复条目。
- **v6.4（2026-10-15）｜顶部栏第二行右缩进（范围不变）**：非全屏（视口 ≤767px）时栏目导航第二行由「左侧顶格 + 横向滚动」改为 **整行右对齐**（`flex-wrap: wrap` + `justify-content: flex-end`，导航项固定 6rem 跨语言不跳动，分割线贯通整行）；全屏时栏目仍与品牌 / 工具栏同一行，行为不变。用户确认缩进方式为「整行右对齐」。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v37 与 `docs/DEV_LOG.md` 2026-10-15 顶部栏第二行右缩进条目。
- **v6.3（2026-10-15）｜教材导读书目新增官方网页外链（范围不变）**：「教材导读」（`reading.html`）55 本书目全部新增 `url` 字段（数据源 `data/reading_list.json`），书名渲染为 `.book-link` 外链（`target="_blank"` + `rel="noopener"` + `↗` 图标，`title` 提示 `reading.link` zh/en 各一份）。链接策略：出版社官方详情页优先（McGraw Hill / Elsevier Shop / Routledge / Oxford UP / MIT Press / Guilford / Norton / Cengage / Macmillan / Wiley / Springer 等），次选 Wikipedia 与 Google Books ISBN 直达，中文书用百度百科或 Google Books 图书搜索兜底。构建脚本 `build-data.mjs` 新增 url 字段自检（缺失或非 http(s) 即报错）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v36 与 `docs/DEV_LOG.md` 2026-10-15 教材导读外链条目。
- **v6.2（2026-10-15）｜帮助导览新增「字号调节」步骤（范围不变）**：帮助功能导览（`help.js` STEPS）在「栏目导航」后新增第 2 步「字号调节」，介绍工具栏右侧「A 字号」控件（拖动滑块 25%–300% 连续缩放、点「− / +」每次微调 5%、越界保持、本机保存刷新仍生效），zh/en 文案（`help.step8Title` / `help.step8Desc`）加入 `core.js` EXTRA i18n。首页完整导览 7 → **8 步**；其他栏目页因字号控件为全局工具栏（各页均有），步骤过滤后 3 → **4 步**（导航 / 字号 / 反馈箱 / 帮助）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v35 与 `docs/DEV_LOG.md` 2026-10-15 字号步骤条目。
- **v6.1（2026-10-15）｜帮助导览文案更详细（范围不变）**：帮助功能导览（`help.*`，zh/en 各一份）7 个步骤的描述全部重写为详细版，每步补充操作方法（检索框可输入中文 / 英文 / 缩写、每日一词可点「换一个」、学习进度可「清除进度」、反馈箱需选择类别后提交、导览可「跳过 / 上一步 / 下一步 / 完成」等）；第 1 步「栏目导航」的栏目名称改为**与网页导航一致**（首页 / 术语检索 / 教材导读 / 关于，旧文案的「章节 / 术语 / 项目文件」与实际不符；「项目文件」总览实际收录在「关于」栏目内，已如实说明），英文同步改为 Home / Glossary / Reading List / About。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v34 与 `docs/DEV_LOG.md` 2026-10-15 帮助文案条目。
- **v6.0（2026-10-15）｜顶部栏响应式换行（范围不变）**：明确顶部栏换行策略——全屏时品牌区 + 主导航 + 工具栏排列成一行；窗口压缩时靠页面右侧的工具栏（字号控件 + 主题按钮）整体向下新开一行并**右对齐**（`margin-left: auto`），其余模块位置不变；`.main-nav-mobile` 在窄屏下改为**独立整行**（`width: 100%`，横向滚动），不再与右侧工具栏争抢空间。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v33 与 `docs/DEV_LOG.md` 2026-10-15 顶部栏换行条目。
- **v5.9（2026-10-15）｜字号调节双方式（范围不变）**：在 v5.8 字号调节基础上新增**加减号**方式——拖动条两侧各加一个圆形小按钮（`#nb-font-minus`「−」在左、`#nb-font-plus`「+」在右，桌面 + 移动端），点击一次 **±5%**（与滑块步长一致），与拖动条两种方式并存；越界（25%/300%）点击忽略并保持当前值；按钮样式与左侧主导航项一致（无边框无底色，默认 `--ink-soft`，hover `--soft` 底 + 主色文字，`:active` 缩放反馈）；`aria-label`/`title` 复用 i18n `toolbar.fontSmaller`/`fontLarger`（zh/en 各一份）；自测 409 → **425 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v32 与 `docs/DEV_LOG.md` 2026-10-15 加减号条目。
- **v5.8（2026-10-15）｜字号调节（范围不变）**：工具栏「跟随系统 / 白天 / 黑夜」主题切换按钮左侧新增**字号调节**控件（`.nav-font`，`A` 字标 + 连续滑块 25%–300% + 实时百分比显示，桌面 + 移动端，样式与左侧主导航项一致：无边框无底色，默认 `--ink-soft`，hover 显 `--soft` 底色 + 主色文字）；拖动滑块即时生效并持久化（沿用 `nb-font` 键存整数百分比），通过 `document.documentElement.style` 写入 CSS 变量 `--nb-font-scale`（`(百分比/100).toFixed(2)`，沿用 D-027/D-029 约定）**只缩放正文字号** —— `.nb-content` 正文层与 `--t-*` 字号系列相乘缩放，容器宽度 / 间距 / 圆角 / 顶部栏 / 页脚 / 按钮等框架层固定不变；越界 / 非法值忽略不写自定义变量、UI 回退 100%；`window.NB` 新增 `fontPct / applyFontScale / setFontScale` 可测接口；滑块 `accent-color` 走主题变量 `--accent`，`aria-label` 引用 i18n `toolbar.fontSize`（zh/en 各一份）；自测 376 → **409 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v31 与 `docs/DEV_LOG.md` 2026-10-15 字号调节条目。
- **v5.7（2026-10-13）｜帮助功能导览（范围不变）**：导航栏「反馈箱」右侧新增「帮助」按钮（`.nav-help`，样式与左侧主导航项一致）；点击启动 `.tour-layer` 引导层，**依次介绍页面各部分**（首页 7 步：栏目导航 → 检索区 → 每日一词 → 学习进度 → 知识模块 → 反馈箱 → 帮助），被介绍元素由 `.tour-spot` 高亮框圈出保持可见、其余背景变暗，气泡显示标题 / 描述 / 步骤进度与「跳过 / 上一步 / 下一步（末步『完成』）」；新脚本 `help.js`（全部页面引入）+ i18n `help.*` 22 键（zh/en）+ CSS `.tour-layer` 系列（走变量）；`window.NB.help` 导出 open / close / current / count / next / prev / goto；栏目页按元素过滤步骤；自测 332 → **376 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v30 与 `docs/DEV_LOG.md` 2026-10-13 帮助功能导览条目。
- **v5.6（2026-10-13）｜反馈箱导航按钮样式统一（范围不变）**：导航栏「反馈箱」入口按钮（`.nav-fb`，桌面 + 移动端）样式与左侧主导航项统一 —— 去掉浅蓝底/边框，默认 `--ink-soft` 文字色、无背景，hover 显 `--soft` 底色 + 主色文字；字号改 `inherit` 跟随缩放；自测 329 → **332 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v29 与 `docs/DEV_LOG.md` 2026-10-13 导航按钮样式统一条目。
- **v5.5（2026-10-13）｜反馈提交成功提示（范围不变）**：反馈提交成功后对话框状态行显示成功提示条「已收到你的反馈，感谢！」（`.fb-status-ok` 升级为提示条样式：`--soft-blue` 背景 / 边框 / 圆角 / 内边距，跟随主题）；**修复时序缺陷** —— `resetForm()` 内的 `setStatus('')` 会把 `submitFeedback()` 刚显示的成功提示立即清空（此前提交成功从未可见，见 E-009），状态清空职责移至 `openBox()`；导出 `submitFeedback` 可测接口；自测 321 → **329 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v28 与 `docs/DEV_LOG.md` 2026-10-13 提交成功提示条目。
- **v5.4（2026-10-13）｜管理员口令门（范围不变）**：反馈管理页 `admin.html` 默认锁定，新增口令门（输入口令 `<管理员口令>` 解锁，`sessionStorage` 记住会话；i18n `admin.gate*` 6 键 zh/en；CSS `.admin-gate` 走主题变量）；口令为**软限制**（纯离线源码可见，仅防误入，不做真正鉴权，页面文案已如实标注）；`window.NB.admin` 导出 `checkPass / unlock` 供自测；自测 307 → **321 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v27 与 `docs/DEV_LOG.md` 2026-10-13 口令门条目。
- **v5.3（2026-10-13）｜反馈箱 + 反馈管理页（范围不变）**：新增**反馈箱**（导航「关于」右侧入口 `assets/js/feedback.js` + 全局对话框，提交写入 localStorage `nb-feedback`，上限 100 条）与**反馈管理页**（`admin.html` + `assets/js/page-admin.js`：统计 / 列表 / 回复写回 `replies[]` / 已读管理）；i18n 新增 `fb.*` / `admin.*`，CSS 全套样式走主题变量；**修复 dialog 嵌套致弹窗不显示**（E-008）；**「关于」页副本 `neurobase.html` 经用户确认删除**（交付保持 4 栏目 7 页）；自测 267 → **307 项全绿**。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v26 与 `docs/DEV_LOG.md` 2026-10-13 条目。
- **v5.2（2026-10-13）｜版本迭代日志机制 + 恢复 term.html（范围不变）**：新增 `docs/CHANGELOG.md`（版本迭代日志，Keep a Changelog 风格；顶部写明维护约定：每次迭代必须新增版本记录并同步 `PLAN.md` / `PROJECT_SCOPE.md` / `DEV_LOG.md` 后重跑 `verify-native.mjs`）与项目 skill `.opencode/skills/version-changelog/SKILL.md`，固化「以后每次更新迭代时同步更新日志」流程；此前删除多余 html 的操作已取消，被误删的词条详情页 `term.html` 已按 `terms.html` 壳模板重建恢复。自测脚本把写死的「文档数 13」改为动态读取 `docs/` 磁盘文件数（现 14 个：新增 `CHANGELOG.md`），267 项全绿。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v25 与 `docs/DEV_LOG.md` 2026-10-13 条目。
- **v5.1（2026-10-13）｜第 1 批交付扩为 4 栏目 6 页（范围不变）**：在原生离线版第 1 批基础上新增 **教材导读**（`reading.html`，55 本教材/文献、9 分类、5 条学习路径，支持 `?cat=` 筛选与 `?book=` 定位）、**项目文件**（`docs.html`，`docs/` 下 13 个 md/json/sql 自动收录并可渲染阅读，`?doc=<slug>`）、**关于**（`about.html`，项目定位 / 负责人 / 模块数与词条目标 / 内容准确性声明 / 项目文件入口）三页；顶部导航 `reading` / `about` 两项**解除置灰**（现 4 项全部可点，不再有「功能开发中」状态）；新增文档构建脚本 `build-docs.mjs` 与页面数据文件 `data/reading.js` / `data/docs-content.js` / `data/docs-meta.js`。另按用户指定把「关于」页副本落盘为 `neurobase.html`（内容与 `about.html` 逐字节一致）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v24 与 `docs/DEV_LOG.md` 2026-10-13 条目。
- **v5.0（2026-10-11）｜前端技术栈改为原生离线版（范围不变）**：前端由 Vue 3 + Vite 全栈版改为**原生 HTML + CSS + JavaScript**（无框架、无构建、无 CDN），交付物为单目录 `outputs/neurobase/`，**双击 `index.html` 即可离线使用**；词条与文案的唯一数据源迁至 `data/`；检索由 Fuse.js 改为自写打分脚本；D-023 / D-027~D-030 的交互与视觉契约全部沿用。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v23 与 `docs/DECISIONS.md` D-031。
- **v4.0（2026-10-10）｜词条页新增「最近浏览」折叠栏（范围不变）**：词条详情页操作区新增**「最近浏览 (n)」按钮 + 折叠栏**，按最近顺序列出刚才看过的术语（排除当前词条，最多 8 条），点按即跳转并收起；浏览历史改为按**最近浏览倒序**维护（重访置顶），上限 12 条，仍只存本机。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v22 与 `docs/DECISIONS.md` D-030。
- **v3.9（2026-10-10）｜字号只缩放正文文本（范围不变）**：字号由「只缩放内容区」进一步收紧为**只缩放正文文本** —— 正文层只重写 `--text-*` 与继承字号，容器宽度 / 间距 / 圆角 / 控件尺寸**完全不变**，`html` 基准字号固定 100%。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v21 与 `docs/DECISIONS.md` D-029。

- **v3.8（2026-10-10）｜字号只缩放内容区（范围不变）**：新增**固定框架层** —— 顶部栏、页脚、悬浮进度键、使用指南浮层与字号调节面板固定为 px，仅内容区随字号缩放；修复拖动时的页面抽动与「调节框内字体跟随字号变化」问题（并顺带消除 300% 极值下的顶栏换行/横向滚动）。核心功能、非目标与验收标准均无变化。依据见 `docs/PLAN.md` v20 与 `docs/DECISIONS.md` D-028。
- **v3.7（2026-10-10）｜字号改为连续滑块（范围不变）**：字号由三档百分比（90/100/115）改为 **25% ~ 300% 连续滑块自由拖动**，附 − / + 微调与快捷预设，旧偏好值自动迁移。核心功能、非目标与验收标准均无变化，仅同步 `aligned_with` 与可访问性交互细节。依据见 `docs/PLAN.md` v19 与 `docs/DECISIONS.md` D-027。
- **v3.6（2026-10-10）｜Phase 1 UI 打磨（范围不变）**：字号档位改用百分比；新增本地学习进度与「继续学习」入口；「项目文件」入口并入「关于」栏目（`/docs` 路由保留）；使用指南图标改电灯；顶部工具栏改为**固定宽度**以消除中/英切换的排布跳动；词条来源新增「在教材导读中查看」跳转。核心功能、非目标与验收标准均无变化，仅同步 `aligned_with` 与交互细节。依据见 `docs/PLAN.md` v18 与 `docs/DEV_LOG.md`。
- **v3.5（2026-10-10）｜内容进度对齐（范围不变）**：Phase 1 打样内容达标——11 模块各 10 条、共 **110 条**词条（全字段、来源可溯、`related` 无断链）。范围、非目标与验收标准均无变化，仅同步 `aligned_with` 与进度状态。依据见 `docs/PLAN.md` v17 与 `docs/DEV_LOG.md`。
- **v3.4（2026-10-10）｜实施顺序调整（范围不变）**：Phase 0 改为**本地优先收口**（脚手架 + schema 冻结 + 自检全绿）；Supabase 建库 / 仓库连接 / Vercel 部署**后置到 Phase 6** 一次性完成。依据见 `docs/DECISIONS.md` D-020。
- 本文件以 `PLAN.md` 为准；冲突时以 `PLAN.md` 为权威。

---

> 本文件为项目范围基线（v7.0，原生离线版 + GitHub Pages · Phase 0–9 全部通过验收 / 已发布 · 当前版本 V5.0.0；负责人：王童）。历史版本见 `docs/archive/`。
