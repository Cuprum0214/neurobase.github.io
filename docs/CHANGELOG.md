# NeuroBase 版本迭代日志（CHANGELOG）

> 本文件记录 NeuroBase 每次产品迭代的版本变更。**维护约定（必须遵守）**：
> 1. **每一次更新**（新增功能 / 修复缺陷 / 数据或文档变更 / 自测扩充 / 流程约定，无论大小）完成后，**必须**在本文件顶部新增一条版本记录（放在当前最新版本之前），**以日期为单位**：每条记录标注本次更新发生的日期（YYYY-MM-DD）；不同日期的更新不得合并为一条版本记录；同一天的多项更新可各自成条，或合并为当日一条并逐条列出变更明细。
> 2. 记录格式见下方各版本条目：版本号 + 日期 + 变更分类（Added / Changed / Fixed / Docs）。
> 3. 同步动作：同一轮迭代还必须更新 `docs/PLAN.md` 变更记录、`docs/PROJECT_SCOPE.md` 变更管理（如涉及范围/交付物）、`docs/DEV_LOG.md`（以日期为单位在顶部追加条目），并重跑 `verify-native.mjs` 至全绿。
> 4. 相关自动化流程见 `.opencode/skills/version-changelog/SKILL.md`。
---

## [V5.0.5] - 2026-11-26 · 交互式脑解剖：修复左图右讲解布局 + 恢复点击部件联动

### Added
- **点击部件 → 右侧讲解**：分区部件被点击后，右侧信息面板显示该部件名称、说明、关键词与相关词条（`selectPart` 恢复调用 `selectRegion`）；2D / 矢状剖面与真实皮层表面的点选联动不变。

### Changed
- **布局修复（左图右讲解）**：删除 `#anatomy-3d-wrap` 之后多余的闭合 `</div>`，`.anatomy-stage` 重新包含 3D 全景 / 2D 解剖图 / 矢状剖面三个视图；`aside.anatomy-info` 回到 `.lab-anatomy` 两列网格的第二列，桌面呈现「左侧解剖图 + 右侧讲解」，≤860px 仍单列堆叠。
- **取消选中回到默认**：切换真实解剖模式或清空选择时，右侧仍回到「交互式脑解剖」默认说明。
- **默认说明文案**：labAnatomy3d.regionNone 中英改为「点击左侧解剖图中的脑区或部件查看说明」，与左图右讲解布局一致。

### Fixed
- 上一轮删除单部件弹窗时多留一个闭合标签，导致 2D / 矢状视图被挤出 `.anatomy-stage`、讲解卡片落到页面下方的 DOM 结构问题（E-066）。

### Docs
- 同步 `DEV_LOG`（当日条目 + 阶段总览行）/ `PLAN`（v129 + §10）/ `PROJECT_SCOPE`（v7.7 + §11）/ `DECISIONS`（D-102）/ `ERROR_LOG`（E-066）。
- 重建 `outputs/neurobase/assets/js/data/docs-content.js` / `docs-meta.js`；27 页缓存指纹 `?v=1203` → `?v=1204`（364 处）。

### 自测
- `verify-native` 全绿（1137 项，失败 0）：新增「点击部件后右侧显示对应名称（海马）」「关键词与相关词条可见」「信息面板与解剖舞台同处两列网格」3 项，删除 2 项旧「未联动」断言，净增 1。
- 改动的 `page-lab-anatomy.js`、`verify-native.mjs` 均通过 `node --check`。

## [V5.0.4] - 2026-11-26 · 交互式脑解剖：取消单部件弹窗，改鼠标手势 + 标题下提示

### Added
- **标题下方常驻操作提示**：`lab-anatomy.html` 在 `h1` 下新增 `#anat3d-tip`（`.anatomy-3d-tip`），写明「左键拖动部件移动 · 右键拖动旋转部件 · 左键双击复位部件 · 滚轮缩放」；新增 i18n `labAnatomy3d.dragTip`（中 / 英）。
- **双击复位反馈**：左键双击部件复位后，画布下方状态行显示「<部件名> 已复位到初始位置与角度」（i18n `labAnatomy3d.partResetDone`）。
- **兼容接口**：`NB.labAnatomy3d.resetSelectedPart()` 复位当前选中部件；`rotateMode()` / `setRotateMode()` / `partMenuVisible()` / `partMenuRegion()` 保留为恒 `false` / `null` 的兼容桩。

### Changed
- **取消单部件「旋转 / 复位」弹窗**：删除 `#anat3d-part-menu` 节点、`.anatomy-3d-part-menu*` / `.anatomy-3d-part-btn` 样式与 `setRotateMode` / `showPartMenu` / `placePartMenu` / `hidePartMenu` 状态机；`i18n` 移除 `partMenuLabel` / `partRotate` / `partRotateActive` / `partReset` / `partMenuTip` / `partRotateDragHint` 6 键。
- **分区部件模式改为鼠标手势**：左键拖动平移部件（沿用原拖动平面算法）、右键拖动绕部件自身中心旋转、左键双击复位；右键不再触发 OrbitControls 平移（`mouseButtons.RIGHT = null`），避免与旋转部件抢事件；左键拖动期间仍暂停相机控制，松手恢复。
- **点击部件不联动右侧面板（本轮先不做）**：分区部件被点击后只做高亮与手势目标切换，`selectPart` 不再调用 `selectRegion`，右侧信息面板保持当前/默认说明；真实皮层表面的「脑区近似归属」提示与 2D 点选行为不变；会话存档只保留部件姿态，不再写 `rotate` / `menu` 字段，读取旧存档时忽略这两个字段。
- **文案与元信息**：更新 `labAnatomy3d.rotateHint` / `moveHint` / `engineNote` / `partInfo` 与页面 meta description，去掉「弹窗点选旋转复位」的旧描述。

### Fixed
- **校验 / 构建脚本路径不再硬编码**：`verify-native.mjs` 的 `OUT` / `DOCS` / `PROJECT` / `schema.sql` 与 `build-docs.mjs` 的 `WS` 改为按脚本位置（`.deepworks/tmp/checks/`、`.deepworks/tmp/build-native/`）解析工作区根，修复工作区从 `C:\Users\WT\Desktop\...` 迁移到 D 盘后脚本报「路径不存在」的问题。

### Docs
- 同步 `DEV_LOG`（当日条目 + 阶段总览行）/ `PLAN`（v128 + §10）/ `PROJECT_SCOPE`（v7.6 + §11）/ `DECISIONS`（D-101）/ `ERROR_LOG`（E-065）。
- 重建 `outputs/neurobase/assets/js/data/docs-content.js`；27 页缓存指纹 `?v=1202` → `?v=1203`（364 处）。

### 自测
- `verify-native` 全绿（1136 项，失败 0）：新增「弹窗已移除」「标题提示含左键 / 右键 / 双击」「点击部件后右侧仍为默认说明（未联动）」「旧存档 rotate / menu 字段被忽略」等断言，删除弹窗与旋转模式旧断言，净减 2。
- 改动的 `page-lab-anatomy.js`、`verify-native.mjs`、`build-docs.mjs` 均通过 `node --check`。

## [V5.0.3] - 2026-11-21 · 交付物：课程报告删除三处未闭环表述

### Changed
- **摘要结论段删去「短板」句**：删除「项目当前的短板同样明确——333 条词条虽已达成 300+ 的规模目标，但逐条复核与新词维护是长期工作；云端多人场景也尚未在真实设备上复验。」，结论只保留「判断密度 + 可复现验收标准」。
- **5.5「仍未闭环的问题」删除两行**：移除「云端多人场景复验 / 待复验」（论坛 6 表 + RLS + Realtime 已建，但「换设备登录同步」「多人同时发帖」尚缺真实设备与并发验证）与「课程评分反馈 / 待提交」（报告与访问方式按课程要求提交后回收意见再迭代）；表格由 5 行收为 3 行（词条规模 333 / 300+、内容准确性、无障碍持续复核）。
- **重新导出 PDF**：由更新后的 `report.html` 重出 `outputs/Tong Wang_NeuroBase.pdf`（A4 / 19 页 / 2.81 MB），回写 ASCII 元数据（title `NeuroBase - Project Report (V5.0.1)`、author `Tong Wang`）；页脚页码与其后章节顺延不变。

### Docs
- 同步 `DEV_LOG`（当日条目 + 阶段总览行）/ `PLAN`（v127 + §10）/ `PROJECT_SCOPE`（v7.5 + §11）/ `ERROR_LOG`（E-064）；本轮无新增决策——删减报告表述属交付内容调整，未改变技术选型。
- 重建 `outputs/neurobase/assets/js/data/docs-content.js`；27 页缓存指纹 `?v=1201` → `?v=1202`。

### 自测
- `verify-native` 全绿（1138 项，失败 0）；PDF 文本回读三处字符串命中 0；页数 19、元数据回读正常；第 2 页（摘要 / 目录）与第 17 页（5.5 表）渲染复查无截断、无错位。

## [V5.0.2] - 2026-11-20 · 交付物：课程报告同步 333 条词库并更名为 Tong Wang_NeuroBase.pdf

### Changed
- **报告规模数字与当前词库对齐**：110 → 333 条、303 → 755 条别名（平均 2.27）、来源引用 111 → 334（41 个来源不变）；难度分布 52 / 44 / 14 → 122 / 153 / 58；报告引用的文档计数按 V5.0.1 时点为 CHANGELOG 105 / DECISIONS 99 / ERROR_LOG 61（产品 59 + 报告与文档维护 2）/ DEV_LOG 需求 110 条（本轮新增条目后实际为 106 / 100 / 62 / 111）。
- **2.6 增补扩容过程**：新增「扩容怎么做的（2026-11-20）」段，记录 +223 条按模块补齐、`pypinyin` 逐条校验 333/333、`sources.json` 重建（333 词条 / 334 引用 / 41 来源、无来源词条 0）、别名下限 2 条；V0–V5 版本表与 11-20 时间线补「词库 110 → 333」。
- **版本口径**：报告封面、页脚与「阅读提示」改为 V5.0.1，并注明站点页脚与 `VERSION` 文件仍为 V5.0.0——V5.0.1 是词库扩容后的文档与数据口径版本，页面结构未变。
- **截图复核**：首页（进度 `0/333`）、检索（「突触」44 条命中）与手机端重新抓取并裁切；3D 解剖与论坛界面不受词库影响，沿用同日截图。图注与截图清单同步。

### Fixed
- **交付文件名顺序**：按课程 `Firstname Lastname_project name.pdf` 更正为 `outputs/Tong Wang_NeuroBase.pdf`（原 `Wang Tong_NeuroBase.pdf` 已移除）；PDF 元数据 title / author 同步为 `NeuroBase - Project Report (V5.0.1)` / `Tong Wang`。
- **报告内过期口径**：5.5 词条规模由「110 / 300+ 进行中」改为「333 / 300+ 已达成」；6.3「如果重做一次」与 5.4 成本判断改按「110 打样 + 223 集中补齐」的实际路径表述；4.1 错误分布补注 E-061 / E-062 / E-063 不属于产品错误。

### Docs
- 同步 `DEV_LOG`（当日条目 + 阶段总览行）/ `DECISIONS`（D-100）/ `ERROR_LOG`（E-063）/ `PLAN`（v126 + §10）/ `PROJECT_SCOPE`（v7.4 + §九 + §11）/ `README`（333 词条 / 755 别名 / 334 引用、报告新文件名与路线图勾选）。
- 重建 `outputs/neurobase/assets/js/data/docs-content.js`；27 页缓存指纹 `?v=1200` → `?v=1201`（364 处）。

### 自测
- `verify-native` 全绿（1138 项，失败 0）；PDF 19 页 / A4 / 2.81 MB，ASCII 元数据回读正常；报告 6 图无截断。

## [V5.0.1] - 2026-11-20 · 迭代文档按课程四张规范对齐（五问 / 三档案分工 / 六要素 / 八项）

### Changed
- **`ERROR_LOG.md` 五问表格化**：把「What happened? / What did we first think was wrong? / What was the real cause? / How was it fixed? / What did I learn?」写成「要写的问题 / 含义」对照表，保留落盘模板，并补一条结构自检（61 条正文五问各 61 次命中、索引 61 行）。
- **`PLAN.md` §5 六要素显式化**：Goal / Tasks / Acceptance Criteria / How AI will test it / How the student will check it / Exit condition 以定义表写出，并注明 Phase 0–9 逐项齐全；Phase 1 标题与进度补「现行 333 条」，2026-11-18 的 110 条验收结论保留为历史口径。
- **`PROJECT_SCOPE.md` 八项显式化**：文首新增 Project purpose / Target users / Core problem / Core features / Non-goals / Constraints / Technical choices / Success criteria 定义表；§4.11 由「300+ 目标」改为「333 条现行 + 规模演进」；§八 首个成功标准改为已达成。

### Fixed
- **索引编号错位**：`ERROR_LOG.md` 索引表 E-034–E-041 原追加在 E-055 之后、E-025 排在 E-024 之前，正文 E-057 排在 E-055 之前；现全部按编号升序重排，正文与索引仍为 61 条一一对应。
- **同类问题回归**：`DECISIONS.md` 索引 99 行按编号重排、正文 D-094 / D-097 归位；D-098 索引行由 6 列改为 4 列，修复整表错位。
- **过期口径**：`PLAN.md` Phase 1、`PROJECT_SCOPE.md` §八 仍写「110 条打样内容 / 扩容属后续工作」，与当前 333 条不一致；现统一为「现状 333 条 + 历史 110 条验收」双写。

### Docs
- 同步 `CHANGELOG`（V5.0.1）/ `DEV_LOG`（当日条目 + 阶段总览行）/ `DECISIONS`（D-099）/ `ERROR_LOG`（E-062）/ `PLAN`（v125 + §5 + §10）/ `PROJECT_SCOPE`（v7.3 + 八项表 + §4.11 + §八 + §11）。
- 重建 `outputs/neurobase/assets/js/data/docs-content.js`；27 页缓存指纹 `?v=1196` → `?v=1200`（364 处）。

### 自测
- `verify-native` 全绿（失败 0）；文档结构脚本核对：ERROR_LOG 正文/索引 61 = 61、DECISIONS 99 = 99，索引与正文编号均升序。

## [V5.0.0] - 2026-11-20 · V5 发布：版本体系切换 V0–V5 + README + GitHub Pages

> 版本号体系自本轮起由旧的线性 `v1.x` 切换为**阶段版本 `V0–V5`**：V0 = Phase 0，V1 = Phase 1–2，V2 = Phase 3，V3 = Phase 4–5，V4 = Phase 6–8，V5 = Phase 9。旧条目与旧号保持原样，不重写历史；上一版 `v1.25.4` 即 V4 收尾、V5 发布前基线。

### Added
- **根 `README.md`**：项目定位、在线 / 离线两种打开方式、功能地图（27 页）、内容规模（110 词条 / 11 模块 / 55 本教材 / 41 个来源）、V0–V5 路线表、技术架构、目录结构、开发与自测、GitHub Pages 部署、安全与隐私、文档索引、来源与免责声明、路线图。
- **`VERSION` 文件**与页面页脚版本标识：`core.js` 的页脚署名行追加 `V5.0.0`（`.site-ver`），全站 27 页统一显示当前发布版本。
- **`.github/workflows/pages.yml`**：推送到 `main` 后自动构建数据、上传 `outputs/neurobase` 为 Pages 产物并发布（`actions/configure-pages` + `upload-pages-artifact` + `deploy-pages`）。
- `DECISIONS.md` 新增 **D-096**（V0–V5 版本体系与 GitHub Pages 发布通道）；`ERROR_LOG.md` 新增 **E-060**（版本号与阶段状态多文档漂移）。

### Changed
- **交付形态**：在 D-095「仅本地离线、不部署 Vercel」基础上补充**唯一定向发布通道 = GitHub Pages**（项目站点 `https://cuprum0214.github.io/neurobase.github.io/`）；本地 `file://` 仍是完整可用形态，Vercel 继续不作为交付前提。
- **阶段状态收口**：`PLAN.md` Phase 6 / Phase 8 由「🟡 待验收」改为「✅ 已通过（依据见 DEV_LOG 2026-11-19 / 2026-11-20 条目）」；Phase 9 改为「✅ 已发布（GitHub Pages）」。`DEV_LOG.md` 的「附 · Phase 映射」表补全 Phase 6–9 的覆盖版本与状态，消除与 PLAN / PROJECT_SCOPE 的两套说法。
- **PROJECT_SCOPE §八 成功标准**：勾选「线上发布且手机 / 电脑体验达标」（GitHub Pages 可公开访问）；`300+ 词条` 仍保持未勾选，作为 V5.x 内容扩容目标。
- `docs/DEPLOY.md` §10 增加 **GitHub Pages（首选）** 路径与验收命令，保留 Vercel / Netlify 作为历史备选。

### Fixed
- **版本号与阶段状态漂移**：CHANGELOG 已到 `v1.25.4`，`PLAN.md` §6 的 Phase 6 / 8 仍写「待验收」，`DEV_LOG.md` 的 Phase 映射表仍写 Phase 6–9「未开始」，`PROJECT_SCOPE.md` 文末又写「Phase 8 待人工验收」——同一事实存在四套口径。本轮以 DEV_LOG 的实际验收记录为准统一，并在 E-060 记录成因与防复发做法。
- **页脚没有版本信息**：全站页脚此前只显示「NeuroBase · 王童」，无法从界面判断当前发布版本；现追加 `V5.0.0`。

### Docs
- 同步 `CHANGELOG`（V5.0.0）/ `DEV_LOG`（当日条目 + 阶段总览行 + Phase 映射修正）/ `DECISIONS`（D-096）/ `ERROR_LOG`（E-060）/ `PLAN`（v122 + §4 / §5 / §6 / §10）/ `PROJECT_SCOPE`（v7.0 + §八 + §11）/ `DEPLOY`（§10）。
- 重建 `assets/js/data/docs-content.js`（16 个文档 / 约 1466 KB；文档多轮修订后共重建 4 次），27 页缓存指纹 `?v=1191` → `?v=1195`（364 处；收口值以全站 HTML 为准）。

### 自测
- `verify-native` **1138 项全绿**，失败 0；`node --check core.js` 通过。
- **GitHub Pages 线上验收**：`pages.yml` 两次运行均 `success`；27 个页面全部 200、23 个抽样资源 0 失败；`phase9-live-check` 仅报「CSS 缓存头非长缓存」——GitHub Pages 固定 `max-age=600`，资源失效依赖 `?v=` 指纹，属平台限制而非缺陷。
- 机密扫描：`sk-` / `service_role` 真实值 / `cfut_` / `sb_secret_` / `ghp_` / `AKIA` / 明文 JWT 均为 0 命中；仓库只保留 Supabase publishable（公开）key。

### 交付物补充（2026-11-20 补记）· 课程项目报告（PDF）

> 站点构建未变（页脚仍为 V5.0.0、27 页指纹仍为 `?v=1184`），本段只补交付物与记录，不新增版本号。

- **新增报告** `outputs/Wang Tong_NeuroBase.pdf`：A4 / 19 页 / 约 2.9 MB，按课程命名规则 `Firstname Lastname_project name.pdf`。
- **章节**：封面 → 摘要与目录 → ① 项目背景与动机 → ② 开发历程（V0–V5、时间线、6 张截图、交付规模）→ ③ 主要功能与想法来源（功能矩阵 + 5 个深入案例）→ ④ 问题与解决（分布表 + 6 个五问案例 + 四道防线）→ ⑤ 反馈与决策（108 条需求分类、9 条代表性决策、接受 / 收敛 / 拒绝的判断标准）→ ⑥ 反思与结论 → 附录（文档索引 / 截图清单 / 复现方式）。
- **数据口径**：27 页、110 词条、303 别名、41 来源、111 引用、968 个 i18n 键、103 条版本记录、96 条决策、59 条产品错误档案（报告统计口径；E-061 为补记的报告工具链错误，不计入）、1138 项断言；均为仓库实际值，未估算。
- **截图**：1 张本人留存的历史截图（2026-10-26 早期横幅）+ 5 张在 V5.0.0 实机重新抓取的界面（首页 / 检索 / 3D 解剖 / 论坛 / 手机端）；论坛截图为本地演示数据，报告内已注明。
- **过程文件**：报告源 `.deepworks/tmp/report-work/report.html`、截图 `shots/`、构建脚本 `make-pdf.mjs` 只留在过程目录，不进入站点产物、不作为交付物。
- **记录**：D-097（报告形态与命名）、E-061（PDF 元数据中文乱码）、DEV_LOG 2026-11-20 补充条目、PLAN v123、PROJECT_SCOPE v7.1、README 目录说明。

### 自测（报告）

- `verify-native` **1138 项全绿**（失败 0）；前端资源未改，页面数、指纹、i18n 均不变。
- 报告复核：19 页 / A4（595×842 pt）；6 张截图与全部表格无截断；PDF 元数据经 PyMuPDF 回读确认（标题 / 作者使用 ASCII，规避编码问题）。

## [v1.25.5] - 2026-11-20 · 词库扩容至 333 条（11 模块全覆盖）

### Added
- 正式词库由 110 条扩充到 **333 条**，11 个知识模块全部达到 29–32 条：anatomy 30、attention 30、bci 32、emotion 31、language 31、memory 31、methods 29、motor 31、neuron 30、sensory 29、synapse 30，合计新增 223 条。
- 新覆盖的结构与机制：胞体、轴突丘、轴突运输、郎飞结、少突胶质细胞、施万细胞、星形胶质细胞、小胶质细胞、钠钾泵、阈电位、去/超极化、时间/空间总和、电缆理论、血脑屏障；GABA、谷氨酸、乙酰胆碱、5-羟色胺、去甲肾上腺素、SNARE、活性区、量子释放、电突触、递质转运体。
- 新覆盖的感觉与运动：视杆/视锥、双极细胞、视网膜神经节细胞、外侧膝状体、耳蜗、毛细胞、听觉通路、频率拓扑、嗅觉、味觉、痛觉、本体感觉、前庭；神经肌肉接头、运动单位募集、力—速度关系、镜像神经元、姿势与步态控制、痉挛、共济失调、运动康复。
- 新覆盖的认知与情绪：视觉搜索、特征整合、返回抑制、注意网络、偏向竞争、非注意盲视、任务切换、冲突监测、注意振荡；情景/语义/程序性记忆、组块、间隔效应、编码特异性、错误记忆、海马重放、记忆痕迹；言语知觉、音系、句法/语义加工、阅读障碍、P600、失配负波、手语、二语习得；HPA 轴、皮质醇、奖赏回路、伏隔核、vmPFC、眶额皮层、共情、内感受、情感预测。
- 新覆盖的方法与 BCI：EEG、ERP、TMS、tDCS、PET、DTI、钙成像、光遗传学、化学遗传学、RSA、格兰杰因果、连接组学；运动想象接口、言语解码、皮层脑电接口、皮层内接口、深部脑刺激、神经假体、迷走/脊髓刺激、长期稳定性、临床转化。
- 每条新增词条均含 id、中英文名、别名、全拼、拼音首字母、定义、通俗解释、难度、标签、关联词条与可追溯来源。

### Changed
- 拼音与首字母统一由 `pypinyin` 生成后再校验：`pinyin_initials` 长度与中文名汉字数逐条一致（333/333），无需手写拼音。
- `verify-native` 原有「110 条 / 每模块 10 条 / 4% 进度 / M7 记忆（10）」等硬编码断言改为按真实数据动态计算（`TOTAL`、`MOD_N(module)`），后续扩容无需再改自测。
- `data/sources.json` 重建：333 词条 / 334 引用 / 41 个唯一来源，来源自检 360 项全通过。

### Fixed
- `terms.sample.json` 中与正式库重复的 `methods-eeg` / `methods-erp` 已移除；`terms.phase1.json` 中与正式库重名的 `motor-motor-cortex` 已移除。
- 该 id 的引用统一改为 `motor-primary-motor-cortex`（frontier / bci_zone / engineering_map / sync-state 共 4 处），并修正 10 处 `related` 指向已删除 id 的问题。

### Docs
- `DECISIONS.md` 新增 D-098（词库规模与来源策略）；`PLAN` v124；`PROJECT_SCOPE` v7.2；27 页指纹 `?v=1195` → `?v=1196`（364 处）。

## [v1.25.4] - 2026-11-20 · 交付形态确定：仅本地离线，不部署 Vercel

### Changed
- 交付形态明确为**本地离线静态站**：直接双击 `outputs/neurobase/index.html` / `terms.html` 使用，不依赖服务器或域名。
- 取消 Vercel / 线上发布计划：`vercel.json` 仅作为历史配置保留，不再作为交付前提，后续迭代不再追问部署方式。
- 清理 2026-11-19 遗留的整套旧站副本 `.deepworks/tmp/citest`（62 个文件）。该副本同样显示「找到 110 条」，曾导致「打开旧副本 → 误判更新未生效」。

### Docs
- `DECISIONS.md` 新增 D-095（交付形态选型）；`PLAN` v121；`PROJECT_SCOPE` v6.70。

## [v1.25.3] - 2026-11-20 · 帮助导览高亮校准 + 「讲解」区块 + 全站字号 / 按键基线放大

### Added
- **导览「讲解」区块**：气泡新增独立的浅底讲解卡（`#nb-tour-why` + `#nb-tour-points`），每步 2–3 条要点，与上方「概述」形成两级信息；文案走 i18n 新增 `help.explainTitle` 与 `help.stepNPointN`（中英各 20 键，写在 `core.js` 的 `EXTRA` 字典）。步骤 1 三条（首页 / 实验室 / 内容生态各自放什么），其余每步两条（怎么用 + 一个注意点）。
- **步骤进度条**：气泡顶部新增 `#nb-tour-bar`，宽度按「当前步 / 总步数」推进，配合「第 X / Y 步」文字。

### Changed
- **阅读基线放大（D-093）**：新增 `--nb-read-boost: 1.1` 与派生变量 `--nb-read-scale: calc(--nb-font-scale × --nb-read-boost)`；`.nb-content` 的 `--t-*`、`.fb-dialog`、`.tour-layer`、认知实验页的 `font-size` 全部改乘 `--nb-read-scale`。正文 16 → **17.6px**、`--t-sm` 14 → **15.4px**、`--t-xs` 12 → **13.2px**、`--t-2xl` 24 → **26.4px**；布局尺寸（容器宽、间距、圆角）仍只认 rem，字体放大不挪版。
- **按键尺寸统一（对齐「认知实验模拟」页）**：`.btn` 字号 `--t-sm` → `--t-base`，内边距 `0.375rem 0.75rem` → `0.55rem 1rem`（约 42px 高）；`.btn-primary` / `.btn-accent` / `.nb-back` / `.btn-back` 同步放大；`.chip` 字号 `--t-xs` → `--t-sm`、内边距 `.38rem .9rem`；输入框内边距 `.7rem 1rem`；`.btn-xs` 保留紧凑档。27 页同用一套尺寸。
- **导览气泡放大**：宽度 26 → 34rem，标题 `--t-md` → `--t-lg`，按钮 `.5rem 1rem` + 600 字重；上限 `min(60vh, 100vh-2.5rem)`，超高时内部滚动，操作按钮 `sticky` 固定在底部。

### Fixed
- **高亮位置不准（E-058）**：全站 `scroll-behavior: smooth` 下，`scrollIntoView` 后立刻读 `getBoundingClientRect` 读到的是动画中间帧，高亮框落在旧位置。改为「程序滚动期间临时 `scroll-behavior: auto` → 同步滚动 → 再测量」，并用双帧 rAF + 700ms settle 循环兜住字体 / 图片引起的后续重排；Edge headless 实测 8 个步骤高亮 `delta` 全为 0。
- **滚动目标改为「可视带」**：上边界避开 sticky 顶栏、下边界避开气泡，把被介绍区块居中在两者之间；顶栏内的元素（导航 / 字号 / 反馈箱 / 帮助）常驻可见，不触发滚动。比「滚到视口正中」更贴合实际可视区域。
- **窄屏高亮错位**：桌面导航与窄屏导航各渲染一份 `#nb-fb-open` / `#nb-help-open`，`querySelector` 命中被 `display:none` 的桌面副本 → 高亮框 0 尺寸。改为遍历同名节点取第一个有尺寸的，主导航步骤同时支持 `#nb-header .main-nav` 与 `.main-nav-mobile`。
- **高亮框贴边溢出**：目标贴视口边缘时，外扩 10px 会跑出屏幕；改为按可用空间收缩外扩量（框线仍与元素边缘重合）。
- **答题 / 训练设置控件是原生小控件**：`quiz.html` / `spelling.html` 的下拉框用了从未定义过的 `.sp-select`、标签用了 `.sp-label`，渲染成浏览器原生小号控件，与放大的正文和按键完全不搭。补 `.sp-select`（17.6px、`.7rem 1rem` 内边距、圆角边框、主色聚焦）与 `.sp-label` 样式，两个「开始」按钮升级为 `.btn-primary`。
- **测验选项渲染成裸单选框**：`page-quiz-run.js` 输出的是 `.qz-option` / `.qz-letter`，样式表里只有 `.qz-opt` / `.qz-opts`，选项于是退回「浏览器默认 radio + 纯文本」。改回输出 `.qz-opts` 容器 + `.qz-opt` 卡片，补 `.qz-letter` 字母徽章、选中态（`:has(input:checked)` 主色描边 + 浅蓝底）与 `.qz-def` 题干说明样式。
- **导览「跳过」按钮空白**：`#nb-tour-skip` 从未写入文案，一直渲染成空白方框；补 `t('help.skip')`。
- **高亮元素被二次压暗**：`.tour-mask` 原来整屏铺 `rgba(10,14,26,.55)`，被高亮元素落在挖洞区内仍被这层压暗，看起来像灰色禁用按钮。遮罩改为透明（只负责拦截点击），变暗完全交给 `.tour-spot` 的 99999px 挖洞阴影；无可高亮目标时才用 `.no-target` 兜底整屏变暗。

### Docs
- 新增 D-093（阅读基线变量 + 按键统一）、D-094（导览定位与讲解分层）、E-059（平滑滚动下的测量时机）。
- `verify-native` 净增 27 条断言（讲解区块 / 三条要点 / 进度条 / 即时滚动 / 逐帧校准 / resize 与 scroll 重对齐 / 遮罩透明与兜底 / 阅读基线变量 / 布局高度仍只乘用户倍数 / 按键尺寸），并把 5 条旧 CSS 断言从 `--nb-font-scale` 改为 `--nb-read-scale` 口径；同步 `PLAN` 与 `PROJECT_SCOPE` 变更记录。

### 自测
- `verify-native` **1138 项全绿**，失败 0；`node --check help.js` / `node --check core.js` / `node --check page-quiz-run.js` 通过。
- Edge headless（CDP）实测：1440×900 下 8 步高亮 `delta = 0`；390×844 下 7 步 `delta = 0`（第 1 步目标为窄屏导航，探针取的是桌面隐藏节点，故显示 0 尺寸；实际高亮框贴合 `.main-nav-mobile`）；150% 字号 + 英文下气泡不溢出、按钮始终可点。
- 横向溢出复核：320 / 390 / 1024 / 1440 四档 × 23 页，除 `updates.html`（来源表 46rem 最小宽的既有问题）外 0 页面级横向滚动。
- 27 页缓存指纹已 bump：本轮 `?v=1183` → `?v=1184`（364 处）；并行轮次随后继续推进全站指纹，交付时全站统一（27 页 364 处取值一致，`file://` 下页面与脚本同批加载）。

## [v1.25.2] - 2026-11-20 · Phase 9 · 适配与发布（响应式收口 / 性能 / 使用指南）

### Added
- **使用指南页 `guide.html`（第 27 页）**：七个区块——一分钟上手、各功能区做什么、个性化与无障碍、数据与隐私、免责声明、来源与引用、反馈与纠错；新增 45 个 `manual.*` 中英键（`data/i18n/zh.json` / `en.json`），`build-data.mjs` 重建 `assets/js/data/i18n.js`；新增 `assets/js/page-guide.js` 只挂载顶栏 / 页脚（归属「关于」栏目高亮）；`about.html` 新增「使用指南」入口卡（复用 `.about-docs` 版式）。
- **Phase 9 自测工具链**（`.deepworks/tmp/checks/`）：`phase9-responsive.mjs`（7 档视口 × 全站页面，以「页面是否真的能横向滚动」为判据，同时收集控制台错误与页面异常）、`phase9-perf.mjs`（首屏体积 / FCP / 长任务 / 帧间隔）、`phase9-links.mjs`（站内引用与锚点死链巡检）、`phase9-live-check.mjs`（线上页面 / 资源 / 缓存头验收）、`phase9-shots.mjs`（多档截图）。

### Changed
- **导航断点 767px → 1199px**：单行桌面导航实测需约 1104px（9 栏目 + 反馈 + 帮助），768–1199px 改走换行导航，消除平板区间的横向溢出。
- **窄屏工具栏**：≤767px 允许换行、`.tb-btn` 最小宽由 6rem 改为 auto；≤420px 语言 / 主题按钮只留图标、字号百分比收起、滑块保留可拖，320px 下工具栏不再撑破视口。
- **极窄屏首页搜索框**：≤420px 改为上下堆叠，输入框与「检索」按钮各占整行。
- **下拉框与社区筛选**：`.select` 增加 `max-width: 100%`；≤640px `.fm-tools` 换行，论坛搜索框与板块下拉各占整行。
- **大脚本 `defer`**：`docs.html` 的 `docs-content.js`（1.37MB）与 `page-docs.js`、`lab-anatomy.html` 的 `three.min.js` / `OrbitControls` / `brain-surface.js` / `brain-deep.js` / `page-lab-anatomy.js` 改为 `defer`，按文档顺序执行，HTML 解析不再被 1.6–3MB 脚本阻塞。
- **缓存策略（`vercel.json`）**：`/assets/*` 由 7 天改为 `max-age=31536000, immutable`（资源 URL 带 `?v=` 指纹）；`*.html` 明确 `max-age=0, must-revalidate`。
- **新增 `.vercelignore`**：部署时排除 `.deepworks/`（约 681MB）、旧 Vue 工程、`uploads/`、`docs/`、`data/`、`scripts/`、`outputs/imagegen/`。

### Fixed
- **页面级横向溢出清零**：修复前 26 页在 320 / 375 / 414 / 768 / 1024 五档共 130 个溢出单元；修复后 27 页 × 7 档（320–1920）**0 溢出、0 控制台错误、0 页面异常**。
- **320px 搜索框被压缩**（输入框只剩窄条）、**术语页下拉框顶出容器**、**社区筛选栏搜索框被挤成图标**三处窄屏遮挡。

### Docs
- 同步 `CHANGELOG`（v1.25.2）/ `DEV_LOG` / `DECISIONS`（D-090–D-092）/ `ERROR_LOG`（E-058）/ `PLAN`（v119）/ `PROJECT_SCOPE`（v6.68）。
- 记录部署阻塞：本机网络无法访问 `vercel.com` / `api.vercel.com`，Vercel CLI 临时部署与会话登录均失败；已交付 `outputs/neurobase-site.zip`（1.68MB）与上线清单，线上发布待具备可达网络或已在 Vercel 连仓库的环境执行。

### 自测
- `verify-native` **1132 项全绿**，失败 0；`a11y-check` **27 页**通过；`i18n-audit` 通过（中英键集合一致）。
- 响应式审计：27 页 × 7 档，横向滚动 0；性能：首屏 591KB（CSS 134KB + JS 457KB）、FCP 272–320ms、无长任务、稳定 60fps。
- 死链巡检：站内引用 74 个，0 死链。
- 27 页缓存指纹 `?v=1181` → `?v=1182`（363 处）；此后术语页文案轮次推进到 `?v=1183` / `?v=1184`；本轮文档同步期间两次重建 `docs-content.js`（1.41MB），每次重建后都 bump 全站指纹，收口值以各 HTML 的 `?v=` 为准（全站一致）。

## [v1.25.1] - 2026-11-20 · 术语检索页说明文案与状态对齐

### Changed
- `terms.html` 说明条从「当前为 Phase 1 试运行词条（每模块至少 1 条），完整词库分模块持续补充中。」改为「已收录神经与认知科学核心术语，覆盖全部学习模块；支持中文、英文、缩写、全拼与拼音首字母检索。」
- `terms.desc` 补充「中文全拼 / 拼音首字母」；`terms.empty` 从「词库正在建设中（Phase 1–2 上线）」改为操作指引「换个关键词，或把模块筛选改回「全部模块」」。
- 说明条启用 `.notice--info` 中性信息样式（浅蓝底 + 蓝边框），不再沿用琥珀警示色；新增 `html.dark .notice--info` 暗色适配。
- 同步 `data/i18n/zh.json` / `data/i18n/en.json` 的 `desc` / `empty` / `sampleNotice` 并重建 `i18n.js`（114.1 KB）。

### Fixed
- 词库已达 110 条 / 11 模块，检索页仍显示「Phase 1 试运行 / 持续补充中」，与实际状态不符，容易被误判为数据更新未生效。

### Docs
- `verify-native` 原断言「试运行说明存在」改为「检索说明文案为当前口径（含拼音首字母、无 Phase 1 字样）」；27 页指纹 `?v=1182` → `?v=1183`（364 处）。

## [v1.24.11] - 2026-11-20 · 术语检索词库补全（拼音修正 / 首字母 / 别名）

### Added
- **拼音首字母检索**：110 条词条全部新增 `pinyin_initials`（中文名逐字声母、小写连写），检索层 `core.js` 的 `fields()` 与 Vue 版 `TermsView.vue` 的 Fuse 配置同步接入。现在输入 `st` 可直达「树突」、`xzxzy` 命中「选择性注意」、`csczq` 命中「长时程增强」；大小写不敏感。
- **检索别名补全**：`aliases` 从 170 条扩充到 **303 条**，平均每词条 1.55 → **2.75**，110 条全部 ≥1（此前 9 条为空、45 条只有 1 条）。新增均为真实同义 / 旧称 / 常用简称，例如：动作电位 → 神经冲动 / 锋电位 / spike；杏仁核 → 杏仁体 / 杏仁复合体；音素 → 音位；注意瞬脱 → 注意眨眼；伪迹去除词条 → 独立成分分析 / ICA。
- **数据模型与校验**：`docs/schema/term.schema.json` 新增 `pinyin_initials`（`^[a-z]+$`）并把 `pinyin` 描述收敛为「小写连写全拼」；`neurobase/scripts/validate-terms.mjs` 新增 5 类检索字段校验（拼音格式、首字母格式、首字母长度与汉字数一致、别名非空、别名无重复且不等于中文名）。

### Fixed
- **9 处拼音拼写错误**（与中文名不符，会直接导致拼音检索失准）：
  - 基底神经节 `jidishanjingjie` → `jidishenjingjie`（shān → shēn）
  - 胼胝体 `pianditi` → `pianzhiti`
  - 大脑皮层 `danaopoceng` → `danaopiceng`
  - 注意瞬脱 `zhuyishuntu` → `zhuyishuntuo`
  - 布罗卡失语症 `bunuokashiyuzheng` → `buluokashiyuzheng`
  - 事件相关电位 `shijianxiangguan` → `shijianxiangguandianwei`
  - 初级运动皮层 `yundongpi` → `chujiyundongpiceng`
  - 突触可塑性 `tuchukexinsuxing` → `tuchukesuxing`
  - 突触传递 `tuchuandichuan` → `tuchuchuandi`

### Docs
- 同步 `DEV_LOG`（本轮条目 + 阶段总览行）、`DECISIONS`（D-089）、`ERROR_LOG`（E-055）、`PLAN`（v117）、`PROJECT_SCOPE`（v6.66）；`docs/schema/term.schema.json` 已通过 `sync-docs` 镜像到 `neurobase/public/docs/`。

### 自测
- `verify-native` **1132 项全绿**（本轮 +7 条：2 条首字母检索、5 条检索词库完整性；1132 为与并行轮次合并后的当前基线）。
- `validate-terms` 全部通过（110 条结构 / 关联 / 教材 / 模块 / 文档同步）；`node --check core.js`、`node --check terms.js` 通过。
- 26 页缓存指纹 `?v=1180` → `?v=1181`（352 处）。

## [v1.24.10] - 2026-11-20 · 「学习中心」删除两段说明文字

### Changed
- **移除说明段落**：`learn.html` 删除标题下方的 `page-desc` 段落（「闪卡（间隔重复）· 拼写与缩写训练 · 测验；错题本 / 收藏 / 进度全部保存在本机浏览器。」）与「选择工具」小节下的 `sec-desc` 段落（「三种工具配合使用，按间隔重复把术语真正记住；学习数据只存本机。」）；页面现在由「学习中心」标题直接进入工具卡片。
- **i18n 数据源同步**：`data/i18n/zh.json` / `en.json` 删除已无引用的 `learn.desc` 与 `learn.toolDesc` 两个键，重跑 `build-data.mjs` 重建 `assets/js/data/i18n.js`；中英键集合一致性自检通过。

### 自测
- `verify-native` **1104 项全绿**，失败 0。
- 26 页缓存指纹 `?v=1178` → `?v=1180`（352 处）。

## [v1.24.9] - 2026-11-20 · 「我的学习」删除偏好设置卡片

### Changed
- **移除偏好设置卡片**：`dashboard.html` 删除「偏好设置」标题以及主题 / 动画效果 / 界面语言 / 正文字号四行控件和字号说明；主题、界面语言、字号统一由顶部工具栏操作（此前两处入口重复）。
- **本机数据独立成卡**：原卡片底部的「清除本机学习数据」保留为独立卡片，标题改为「本机数据」；二次确认、状态提示与屏幕阅读器播报逻辑不变。
- **页面文案同步**：`dashboard.desc` 改为「目标、进度看板、薄弱项推荐与本机数据管理集中在这里。」（中英双语），`<meta name="description">` 同步调整；i18n 新增 `dashboard.prefDataTitle`（本机数据 / Local data）。
- **脚本精简**：`page-dashboard.js` 删除 `renderPrefs()` 与 `#ds-theme` / `#ds-motion` / `#ds-lang` / `#ds-font-*` 的事件绑定，`renderAll()` 不再调用偏好渲染；顶部工具栏的 `NB.mountFontInput` 与字号逻辑不受影响。

### Fixed
- **i18n 缺失键写回数据源**：`toolbar.fontCustom`、`toolbar.fontInvalid`、`labCogsim.digitAnswerReveal` 补进 `data/i18n/zh.json` / `en.json`。此前只写在 `assets/js/data/i18n.js` 产物里，重跑 `build-site.mjs` 会被覆盖，`t()` 回退键名（见 E-054）。

### Docs
- `outputs/acceptance-checklist-phase8.md` 同步：我的学习六块改为「本机数据」；键盘流程、英文切换与个性化验收项去掉偏好设置入口，改为顶栏操作。

### 自测
- `verify-native` 最终 **1104 项全绿**（删除「我的学习」偏好设置的旧断言，新增「四项控件已移除 / 本机数据卡标题 / 清除入口仍在 / 动画开关随之移除」断言），失败 0；`node --check page-dashboard.js` 通过。
- 26 页缓存指纹 `?v=1176` → `?v=1178`（352 处）。


## [v1.24.8] - 2026-11-20 · 顶部导航当前栏目蓝色色块标注

### Changed
- **当前栏目蓝色色块**：顶部主导航的当前页由「仅文字变蓝」改为实心主色色块（`background: var(--primary)` + `#fff` 白字 + `font-weight: 600`），hover 加深为 `var(--primary-dark)`；适配深色主题（沿用同一主色）。
- **窄屏同步**：`.main-nav-mobile` 的当前项从灰色块（`var(--soft)`）改为同样的实心蓝色块，桌面与窄屏表现一致；`aria-current="page"` 标记逻辑不变，各子页（`lab-*` / `quiz-*` / `term.html` / `docs.html` 等）继续高亮所属栏目。

### Fixed
- **补齐 i18n 缺失键**：`assets/js/data/i18n.js` 中英各补 `toolbar.fontCustom`、`toolbar.fontInvalid` 与 `labCogsim.digitAnswerReveal`。这些键由 v1.24.4 / v1.24.5 引入但当时只写了 `t()` 调用，数据字典缺键，`t()` 直接回退键名，导致基线校验中「百分比提示可输入」「toolbar 键齐全」「数字广度答错显示正确答案」3 项长期失败。唯一文案源 `data/i18n/zh.json` / `en.json` 已同步写入，`build-site.mjs` 重建后与生成物一致。

### 自测
- `verify-native` 1102 → **1104**（新增「桌面导航当前项实心主色 + 白字」「窄屏同样色块 + 白字」两条 CSS 断言），失败 0。
- 26 页缓存指纹 `?v=1175` → `?v=1176`（352 处）。


## [v1.24.7] - 2026-11-20 · 打卡本纸面去掉横线

### Changed
- 打卡本纸面删除横向纹理（`repeating-linear-gradient`），只保留 `#fffdf4` 纯色；圆角、投影、线圈、今天描边、已签到色块以及统计 / 弹窗均不变。

### 自测
- `verify-native` 1108 → **1109**（新增「纸面不画横线纹理」）；`probe-checkin` 42 → **43**（`backgroundImage === 'none'`）。
- `a11y-check` 26 页、`i18n-audit` 774 键通过；26 页指纹 `?v=1173` → `?v=1174`（352 处）。


## [v1.24.6] - 2026-11-20 · 论坛云端正式建立（Supabase 6 表 + RLS + Realtime）

### Added
- **论坛云端上线**：在 Supabase 项目 `neurobase`（ref `flayytlvrbhuainebzjd`）执行 `docs/supabase/community-v2.sql`，建立 `community_posts` / `community_replies` / `community_reports` / `community_checkins` / `community_reactions` / `community_bans` 共 6 张社区表，含 RLS 策略、索引、`updated_at` 触发器与 `community_admin` / `community_admin_ok` 管理 RPC。
- **实时频道**：`community_posts` / `community_replies` / `community_reactions` / `community_bans` 加入 `supabase_realtime` publication，社区页可从本机回退模式切换到云端多人共享。

### Fixed
- **pgcrypto 解析失败**：脚本顶部新增 `set search_path = public, extensions;`，并把 `community_touch_updated_at` / `community_admin_ok` / `community_admin` 三处函数内的 `set search_path` 改为 `public, extensions`，解决首次执行报 `ERROR 42883: function digest(text, unknown) does not exist`。

### Docs
- 云端复验：6 张表均返回 200，`community_admin_ok('invalid-probe')` 返回 `false`；匿名向 posts / replies / reactions 写入均被 RLS 拒绝（`401 / 42501`）；`pg_publication_tables` 确认 4 张实时表已挂载。
- `docs/supabase/README.md` 同步为 19 张表（17 + 2）、社区安全模型、管理 RPC 与论坛建表运维步骤；`docs/DEPLOY.md` 标注「已执行」状态，并补 `42883 digest` 与「社区页仍显示本机模式」两条排障。
- `verify-native` 复跑 **1108 项全绿**；本轮未改 `outputs/neurobase` 下 JS / CSS / HTML，缓存指纹保持 `?v=1173`。
- 同步 `DEV_LOG`、`DECISIONS`（D-085）、`ERROR_LOG`（E-053）、`PLAN`（v112）、`PROJECT_SCOPE`（v6.64）。

---

## [v1.24.5] - 2026-11-20 · 字号百分比支持键盘输入自定义

### Added
- **点击百分比输入字号**：顶部工具栏的 `100%` 与「我的学习 → 偏好设置」的百分比胶囊都可点击，就地变成输入框；键盘输入 25–300 的整数，`Enter` 或失焦提交，`Esc` 取消，提交后滑块、显示值、`nb-font` 存储与 `--nb-font-scale` 全部同步。
- **非法输入保护**：空值、非数字与越界（<25 / >300）不写入存储，回退当前值并播报 `toolbar.fontInvalid` 提示；输入框最多接受 3 位数字，只保留数字字符。
- **键盘与读屏可达**：百分比显示元素补 `role="button"` / `tabindex="0"`，`Enter` / 空格进入编辑；`aria-label` 与 `title` 提示「点击数字输入自定义字号（25–300%）」。

### Changed
- 公共层新增 `NB.mountFontInput(display, onChange)`，工具栏与「我的学习」共用同一套就地编辑逻辑，避免两处实现漂移。
- 修正字号相关文案与实际控件不符的问题：`toolbar.fontHint`、`guide.steps.font.desc`、`dashboard.prefFontHint` 此前写「点 A 100% 打开面板 / 点快捷百分比」，现统一为「拖动滑块 / ±5% 微调 / 点击百分比输入」。

### Docs
- `verify-native` 新增 21 条断言（点击出现输入框、Enter / 失焦 / Esc / 越界回退、工具栏与「我的学习」双入口、i18n 新键），套件 **1087 → 1108 项全绿**。
- 26 个 HTML 缓存指纹 `?v=1172` → `?v=1173`。
- 同步 `DEV_LOG`、`DECISIONS`（D-084）、`PLAN`（v111）、`PROJECT_SCOPE`（v6.63）；本轮无高价值错误。

---

## [v1.24.4] - 2026-11-20 · 记忆广度答错显示正确答案

### Changed
- **答错即公布答案**：记忆广度实验提交后判定为错误时，结果区显示「错 · 正确答案：<数字序列>」，停留 1.6 s 再进入下一轮（同长度重试）或结束；此前只显示一个「错」徽标，600 ms 后直接换题，用户无从对照。
- **结算保留最后一题答案**：第二次机会也答错时，最终文案追加「· 正确答案：<数字序列>」，避免正确答案一闪而过。

### Added
- **重复提交保护**：反馈展示期间新增 `digit.locked`，连点「确认」或重复回车不会把同一题判两次；`digitShow()` 与「开始」按钮会重置该标志。
- 中英文案 `labCogsim.digitAnswerReveal`（正确答案：{seq} / Correct answer: {seq}）；`NB.labCogsim.state().digit` 增加 `attempt` / `seq` / `locked`，便于自测断言。

### Docs
- `verify-native` 新增 1 条断言（答错后结果区必须包含本题正确答案），套件 **1087 项全绿**。
- 26 个 HTML 缓存指纹 `?v=1171` → `?v=1172`（352 处）。
- 同步 `DEV_LOG`、`PLAN`（v110）、`PROJECT_SCOPE`（v6.62）；本轮无新增决策、无高价值错误。

---

## [v1.24.3] - 2026-11-20 · 账号名唯一性 + 论坛历史署名同步

### Added
- **账号名全站唯一**：`profiles.display_name` 增加大小写 / 空白不敏感的唯一索引；新增 `account_set_name(text)` SECURITY DEFINER RPC——登录校验、1–24 字、同名并发 advisory lock 串行化、唯一索引兜底，设置 / 清空只能改自己。
- **旧数据迁移**：`schema.sql` §19 先规范化 `display_name`、清理重名、把旧版 `profiles.prefs.displayName` 迁到 `display_name`，再建唯一索引；空名仍回退邮箱前缀。
- **论坛历史署名同步**：改名成功后 `account_set_name()` 在同一事务内按 `user_id` 回填 `community_posts` / `community_replies` 的 `author`；同时写 `nb-forum-rename` 标记并派发 `nb:account-name` 事件，社区页在线或下次加载时回填本机历史帖子、回复与禁言名单的旧署名。

### Changed
- 账号名保存从「本地先写、best-effort 同步」改为「必须联网 + 服务端唯一性校验」：重名、断网、服务端未升级、登录过期分别给出明确提示，失败不本地生效。
- 社区页「修改昵称」在登录态等待账号名 RPC 结果：成功才关闭表单；重名 / 断网保留表单并提示。
- 打开账号面板与登录初始化时向服务端刷新权威账号名；跨设备缓存旧名会自动纠正。

### Fixed
- 改名后论坛历史帖 / 回复仍显示旧署名的问题（云端行 + 本机快照双层回填）。
- 社区改名在登录态误报「昵称已更新」的问题。

### Docs
- `schema.sql` 新增 §19；`DEPLOY.md` 增加增量执行说明。
- 同步 CHANGELOG / DEV_LOG / DECISIONS（D-083）/ ERROR_LOG（E-052）/ PLAN（v109）/ PROJECT_SCOPE（v6.61）。
- 自测：`verify-native` 套件全绿（本轮新增论坛改名 / 标记回填 / SQL 相关断言）、`cloud-check` 59 → **89 项**；`a11y-check` 26 页、`i18n-audit` 921 键通过。
- 全站 HTML 指纹已随并行轮次推进（352 处统一），本轮改动包含在当前 `?v=` 中。

---

## [v1.24.2] - 2026-11-20 · 首页版式重排：搜索左上 / 每日一词公告牌 / 面板高度锁定

### Changed
- **蓝色面板重排**：面板内左上角改为搜索框，搜索框正下方紧接「每日一词」公告牌（蓝色外框 + 浅蓝纸面 + 图钉，正文 3 行截断），右端仍是打卡本；原大标题与描述移到面板上方，成为紧凑页头（`h1` 语义保留，页面仍只有一个 h1）。
- **面板高度锁定**：打卡本高度为 `calc(28rem × 字号比例)`（同一字号下恒定，字号放大时随文字一起长高），页脚与提示行改为固定占位；日历恒为 6 行（42 格，不足补空行），任意月份高度一致。切换月份或点「换一个」都不会再让蓝色面板伸缩。
- **公告牌固定高度**：桌面填满左栏、窄屏为 `calc(17.5rem × 字号比例)`；标题单行省略、定义 3 行截断、`title` 保留完整释义，长词条不会撑开外框。

### Fixed
- 搜索按钮在宽屏被输入框挤成「检 / 索」两行：按钮加 `flex: none` + `white-space: nowrap`。
- 窄屏公告牌内标题被压扁裁切：`#daily-body` 的直接子项在固定高度下默认可收缩，改为 `flex: none`，并按内容把窄屏公告牌加高到 `17.5rem`。

### 自测
- `verify-native` 新增 10 条版式 / 固定 6 行断言，套件 **1085 项全绿**。
- `probe-checkin` 28 → **42 项**：搜索框位于面板左上（dx 40 / dy 32）、公告牌紧接搜索框、翻月后 hero 508 → 508、打卡本 448 → 448、公告牌 390 → 390，换词后 hero 与公告牌高度同样不变；截图 5 → 6 张。
- 字号 100% / 130% / 200% 复测：打卡本 `scrollHeight` 与 `clientHeight` 一致（448 / 582 / 896），不因固定高度裁切。
- `a11y-check` 26 页、`i18n-audit` 774 键通过；26 页指纹 `?v=1169` → `?v=1171`（352 处）。


## [v1.24.1] - 2026-11-20 · 账号设置：可更改账号名

### Added
- **账号设置区**：已登录的账号面板新增「账号设置」区块——账号名输入框（1–24 字，留空使用邮箱前缀）+「保存账号名」按钮；面板标题下直接显示当前账号名，邮箱仍作为账号标识展示。
- **云层账号名接口**：`cloud.js` 新增 `NB.cloud.account`（`name()` / `stored()` / `setName()`），账号名写入 `profiles.prefs.displayName`，沿用既有偏好通道：本地 `nb-cloud-prefs` 立即生效，登录态 best-effort `PATCH /rest/v1/profiles`，跨设备合并；空值表示清除自定义名、回退邮箱前缀。
- **社区署名跟随账号名**：登录后 `forum.authorName()` 以账号名（默认邮箱前缀）为准，社区「修改昵称」同时写回账号设置；`identity` / `session` 事件会立即刷新社区页「当前身份」行。

### Changed
- 账号名与社区昵称合并为同一来源，避免「账号设置改了名字、社区仍显示旧昵称」的双轨状态。

### Fixed
- `cloud.js` 的 `http()` 在缺少 `fetch` 的环境（极旧内核 / 测试沙箱）不再同步抛异常，改为按网络失败降级，避免可选云能力中断主流程；账号名保存即便云同步失败也保留本机值。

### Docs
- 同步 `CHANGELOG` / `DEV_LOG` / `DECISIONS`（D-081）/ `ERROR_LOG`（E-050）/ `PLAN`（v107）/ `PROJECT_SCOPE`（v6.59）；26 页指纹统一 `?v=1169`（实测上个迭代落盘为 1168，本轮与 v1.24.0 记录对齐）。
- 自测：`verify-native` 1057 → **1064 项**、`cloud-check` 59 → **71 项**，全部通过。

---

## [v1.24.0] - 2026-11-19 · 学习社区重做为论坛贴吧（发帖 / 楼层 / 点赞 / 收藏 / 举报 / 实时 / 管理）

### Added
- **论坛贴吧布局**：`community.html` 改为「社区头部（主题 / 回复 / 参与者） + 左侧帖子流 + 右侧侧栏」，帖子行显示头像色块、标题、摘要、板块、作者、相对时间与回复 / 点赞 / 收藏计数；置顶行高亮，隐藏行虚线弱化。
- **帖子详情与楼层**：同页 hash 路由（`#p=<id>`）打开详情，主楼显示完整正文与操作区，回复按楼层编号展示，支持「回复某层」引用；返回列表不丢筛选。
- **互动能力**：帖子与楼层点赞、帖子收藏（均可取消）、举报（帖子 / 楼层，原因 + 补充说明）、复制链接；登录且云层可用时写入云端，否则只在本机生效。
- **排序与筛选**：最新 / 最热 / 回复最多；全部 / 我的帖子 / 我的收藏 / 精华 / 待审举报；板块下拉与标题 / 正文 / 作者搜索；「加载更多」分页。
- **管理员入口**：侧栏口令门解锁后，列表与详情出现置顶 / 精华 / 锁定 / 隐藏 / 禁言 / 删除，并可查看与解除禁言名单；删除需二次点击确认。
- **数据层 `assets/js/forum.js`**：localStorage 为权威（`nb-community-posts` / `nb-community-reports` / `nb-forum-bans`），兼容旧版内嵌 replies 结构；跨标签用 `storage` + `BroadcastChannel` 即时刷新；云端可用时探测 `community_posts`、拉取帖子 / 回复 / 点赞 / 禁言并订阅 Realtime，失败静默回退本机模式。
- **云端升级脚本 `docs/supabase/community-v2.sql`**：幂等建表 / 补列（`pinned / featured / locked / updated_at`）、`community_replies`、`community_reports`、`community_checkins`、`community_reactions`、`community_bans`；RLS、`updated_at` 触发器、Realtime publication 与 `community_admin()` 管理 RPC。

### Changed
- **管理口令改为摘要校验**：`core.js` 不再保存口令明文，只保留加盐 SHA-256 摘要，新增内置 `sha256()` 与 `NB.adminCheck()`；`feedback.js`、`page-admin.js` 与社区管理入口统一调用同一校验，公开源码与文档均不含明文。
- 云端管理动作优先走 `community_admin` RPC（函数内校验同一摘要，`SECURITY DEFINER`），本机模式直接写 localStorage；管理员口令仅存内存，刷新后需重新输入。
- **移除社区页打卡签到**：删除 `community.html` 侧栏的打卡卡片（今日打卡按钮、连续 / 本月 / 累计统计、最近 7 天格）与 `page-community.js` 的全部打卡逻辑、`.cm-stats / .cm-week / .fm-ckrow` 样式、12 个无引用 i18n 键（中英各 12）。打卡唯一入口收敛到首页便签本（`checkin-widget.js` + `#nb-checkin`），`nb-checkin` 数据与云端 `community_checkins` 同步保持不变。
- 旧版社区「打卡 / 问答」标签页结构不再使用；`community.js` 的打卡、身份与云工具接口保持兼容。
- **无障碍与文案**：帖子详情区原先引用静态 HTML 中不存在的 `fm-thread-title`，改为 `aria-label` + `data-i18n-aria="forum.threadLabel"`（中英各新增 1 键）；`i18n-audit` 的 option 检查改为分别校验「举报原因」「禁言时长」两个下拉（各 4 项），`a11y-check` 26 页、`i18n-audit` zh / en 各 **918 键**全部通过。

### Docs
- 新增 `docs/supabase/community-v2.sql`；`docs/DEPLOY.md` §8 安全边界改写为「摘要而非明文 + 社区 v2 脚本 + 未执行时本机模式」。
- `docs/` 文件 15 → 16，重建 `docs-content.js` 与文档页清单；26 个 HTML 指纹统一为 `?v=1169`（352 处）。

---

## [v1.23.31] - 2026-11-19 · 首页蓝色横幅右端新增便签本打卡签到

### Added
- **首页打卡本**：`index.html` 的蓝色横幅在 ≥900px 时改为「左文案 + 右打卡本」两栏，新增 `assets/js/checkin-widget.js` 与 `.ck-*` 样式；便签纸配色 + 顶部线圈装订，含月份标题、7 列日历、统计行与「签到」按钮。
- **上下翻页日历**：`▲` 上一月 / `▼` 下一月，切换时整页按方向做 `rotateX` 翻动（150ms 出 + 240ms 入；`html.motion-off` 下直接切换）；浏览其它月份时出现「回到今天」。
- **打卡记录可查**：已签到日期显示青色底 + 右上角圆点，今天有主色描边；点任意日期在下方回显「已签到 / 没有签到记录 / 还没到」；统计行显示「连续 N 天 · 本月 N 天 · 累计 N 天」。
- **签到成功弹窗**：点「签到」写入当天记录后弹出便签纸风格对话框，标题「签到成功」，副标题显示日期与连续天数，正文随机取 18 句鼓励语之一（中 / EN 各 18 句），按钮「继续学习」；`role="dialog"` + `aria-modal`，Esc / 点遮罩关闭，焦点落在按钮并在关闭后还原。
- **数据同源**：与「学习社区」共用 `localStorage` 键 `nb-checkin`（`days: ['YYYY-MM-DD']`）；社区页加载 `community.js` 时优先复用 `NB.community.checkin`，登录且云层可用时 best-effort 同步 `community_checkins`。

### Changed
- hero 内容包进 `.hero-main`，搜索表单结构不变；`.hero p` 收窄为 `.hero-main p`，避免影响打卡本与弹窗。
- 窄屏（<900px）打卡本整块移到搜索框下方并居中（最大宽 26rem）；箭头 32×24px、签到按钮高约 38px，390px 下日期格 35×31px。
- 文案走 `data-i18n` + `NB.t()`：新增 `checkin.*` 40 键（含 `enc1`–`enc18`），重跑 `build-data.mjs` 重建 `assets/js/data/i18n.js`（zh / EN 各 774 键）。

### 自测
- `verify-native` 新增 32 条打卡断言并全绿（本特性落地时 1008 → 1040；并入当日论坛改动后套件共 1057 项）。
- 新增 `probe-checkin.mjs` **28 项**：Edge headless 1200 / 390 两档 + 亮色主题，核对右端两栏、卡片不溢出 hero、日期格 ≥24px、弹窗居中与焦点、翻页动画 `ck-out-down`、签到写入；输出 5 张截图。
- `a11y-check` 26 页通过、`i18n-audit` 774 键通过、`checkin-widget.js` `node --check` 通过。
- 26 个 HTML 指纹 `?v=1164` → `?v=1166`（351 处）。

## [v1.23.30] - 2026-11-19 · 删除顶栏「动画开 / 关」按钮

### Changed
- **顶栏精简**：移除全站头部工具栏的「🌀 动画开」按钮（`#nb-motion-btn`）及其绘制 / 点击逻辑；顶栏只保留字号滑块、EN / 中切换与主题按钮。
- **动画偏好入口收敛**：动画开关改由「我的学习 → 偏好设置 → 动画效果」（`#ds-motion`）唯一提供，仍写 `nb-motion` 并同步 `aria-pressed`；`NB.setMotion` / `NB.applyMotion` 接口与 `html.motion-off` 全局规则保持不变，AI 悬浮球照旧停帧。
- `core.js` 删除 `motionLabel()` 与顶栏按钮的模板 / 绑定（净减约 16 行）；`i18n` 删除失效的 `toolbar.motion` / `motionOn` / `motionOff` / `motionHint`（中 / EN 各 4 键），`dashboard` 新增 `motionAnnounceOn` / `motionAnnounceOff`（中 / EN 各 2 键），设置页播报改为「动画效果已开启 / 已关闭」。
- 源文件 `data/i18n/zh.json` / `en.json` 同步删改后重跑 `build-data.mjs` 重建 `assets/js/data/i18n.js`，不再手改产物。

### 自测
- `verify-native` 1007 → **1008 项全绿**：原「动画按钮有可访问名称」断言改为「顶栏不再有动画开关按钮」（反向断言）+「动画开关仍在设置页且有可访问状态」。
- `i18n-audit` 通过（zh / en 各 734 键、键集合一致、36 个脚本 `t('...')` 键全部可解析）；`a11y-check` 26 页通过（`prefers-reduced-motion` 与 `html.motion-off` 规则仍在）。
- 26 个 HTML 指纹 `?v=1162` → `?v=1164`（350 处）；改动 JS 全部 `node --check` 通过。

## [v1.23.29] - 2026-11-19 · 登录 / 注册密码框加「小眼睛」显隐

### Added
- **密码可见性按钮**：登录与注册弹窗的密码输入框右端新增小眼睛按钮。点一下切为明文、再点回到掩码；掩码态显示睁眼图标（提示「显示密码」），明文态显示斜线眼图标（提示「隐藏密码」），`aria-pressed` 与 `aria-label` 同步更新，文案随界面语言（中 / EN）切换。
- 按钮为原生 `<button type="button">`，键盘可 Tab 到、`:focus-visible` 有 2px 主色焦点环；点击不会提交表单。

### Changed
- 密码字段结构改为 `label > span.nb-auth-pwd > (input + button)`，输入框用 `padding-right: 2.5rem` 为按钮留位，按钮绝对定位在框内右端（右距 4.8px、垂直居中）。
- 切换 type 时保留输入内容与光标位置，不会清空已输入的密码。

### 自测
- `verify-native` 996 → **1007 项全绿**（新增 11 条：密码框存在、按钮在框内、初始掩码、初始 aria 状态、双图标、切明文、显示态 aria、值保留、切回掩码）。
- 新增 `eye-check.mjs` **23 项**（含注册态与英文标签）；`probe-eye.mjs` **15 项**（Edge headless 1200 / 390 两档几何核对 + 3 张截图）。
- `a11y-check` 26 页通过、`i18n-audit` 729 键通过、本地 JS 全部 `node --check` 通过。
- 26 个 HTML 指纹 `?v=1161` → `?v=1162`（350 处）。

## [v1.23.28] - 2026-11-19 · 认知实验模拟：先选模块，再进实验

### Added
- **三个实验模块入口**：`lab-cogsim.html` 首屏改为三张模块卡（Stroop 效应 / 反应时 / 记忆广度），每张含图标、标题、一句话说明、预计时长与「开始实验 →」。点击后才显示该实验的完整内容，顶部「返回实验列表」可随时回到列表重选。
- **地址栏路由**：进入实验写入 hash（`#stroop` / `#rt` / `#digit`），支持直链打开单个实验，浏览器前进 / 后退可还原；导出接口 `NB.labCogsim.stroopStart` / `rtStart` / `digitStart` 启动前会自动切到对应模块，自测脚本与旧调用方式不受影响。
- 中英文案新增 `labCogsim.menuTitle` / `menuHint` / `enterExp` / `backToMenu` / `stroopMeta` / `rtMeta` / `digitMeta`（`data/i18n/zh.json`、`en.json` 同源更新后重建）。

### Changed
- **认知实验页字号与按键整体放大**（全部随全局字号滑块缩放）：实验标题 1.3rem、说明 0.98rem、结果 1.05rem；实验内按钮 1.02rem / 2.9rem 高；Stroop 四色块居中排列、间距 1.15rem，尺寸 5.6×3.8rem、字号 1.3rem（RT 红蓝按钮维持 4.5×3.1rem）；反应方块 8.5rem、反应按钮最小 6rem；数字序列 2.5rem、回忆输入框 1.1rem / 3rem 高。窄屏（≤560px）色块间距 0.6rem、尺寸 4×3.4rem，仍保持四个一行。
- 模块卡使用独立 `button` + `.cogsim-card` 样式（与站点 `tool-card` 同风格、更大点击区），未引入新依赖。

### 自测
- `verify-native` 984 → **996 项全绿**（新增 12 条：默认三卡、面板互斥、点卡片进入、hash 记录、返回列表、hash 直链）；`cogsim-check` **81 项全过**；`i18n-audit` 中英 729 键一致；`a11y-check` 26 页通过。
- 26 个 HTML 指纹 `?v=1159` → `?v=1161`（350 处）；Edge headless 1280 / 390 两档核对：三卡等宽、进入后仅一个实验、Stroop 色块居中、390px 下四色块同一行（各 64px）。

## [v1.23.27] - 2026-11-19 · Phase 8：学习社区 · 个性化 · 无障碍 · 中英双语

### Added
- **学习社区**（`community.html` + `assets/js/community.js` + `page-community.js`）：学习打卡（连续天数 / 累计天数 / 最近 7 天热力格 / 今日新词）、问答（发布 / 回答 / 展开收起 / 举报 / 删除）、管理员口令审核（隐藏 / 恢复 / 删除任意内容）。内容以本机 localStorage 为权威，云端已配置且登录时 best-effort 同步；普通用户只能删除自己发布的帖子，他人帖子不渲染删除按钮。
- **我的学习**（`dashboard.html` + `page-dashboard.js`）：学习目标（每日新词 4 档 / 每周测验 4 档）、今日进度（新词 / 测验 / 打卡）、进度看板（已读 / 收藏 / 错题 / 正确率 / 连续打卡）、11 模块进度条、薄弱项推荐（错题优先 → 模块进度落后，最多 3 条）、偏好设置（主题 / 动画 / 语言 / 字号 / 清除本机学习数据）。
- **导航与公共接口**：主导航 7 → **9 栏目**（新增「社区」「我的学习」）；顶栏新增「动画开关」与「EN / 中」语言切换按钮；`NB.setLocale` / `NB.setMotion` / `NB.announce` 三个公共接口；每页自动创建 `#nb-live` 播报区（`role="status"` + `aria-live="polite"`）。
- **数据库**：`docs/supabase/schema.sql` 13 → **17 表**，新增 `community_posts` / `community_replies` / `community_reports` / `community_checkins`，全部启用 RLS（帖子未隐藏公开读、写删限本人、管理员可读全部并管理；举报仅本人与管理员可读；打卡一人一天一行）。`cloud.js` 导出 `upsert` / `del` 供社区写入。
- **自测**：新增 `i18n-audit.mjs`（中英键集合 + HTML/JS 文案键，729 键全通过）与 `a11y-check.mjs`（26 页结构项：lang / 跳过导航 / 唯一 h1 / 控件标签 / 按钮名称 / 重复 id / aria 引用 / 焦点与动效规则）。

### Changed
- **动画可关**：`html.motion-off` 统一把 CSS 过渡与动画压到 0.001 ms；AI 悬浮球液体 rAF 检测该 class 后停帧（按压 / 拖动可重新 kick）；顶栏按钮同步 `aria-pressed`，设置存 `nb-motion`。
- **历史无障碍缺口补齐**：`docs.html` 详情标题 `h1` → `h2`（避免双 h1）；`spelling-run.html` 输入框补 `label`；`lab-cogsim.html` 数字输入补 `aria-label`（中英）；深色主题 `.pill-primary` 改用亮链接色，修正胶囊对比度。
- **缓存指纹**：24 个既有 HTML `?v=1158` → `?v=1159`（322 处），两个新页直接以 `?v=1159` 落盘；26 页指纹一致。

### 自测
- `verify-native` **996 项全绿**（Phase 8 新增 95 项：导航 / 社区打卡 / 问答 / 举报 / 权限 / 管理员 / 推荐 / 偏好 / 播报区 / 双语 / schema）；`cloud-check` **59/59**；`i18n-audit` 729 键通过；`a11y-check` 26 页通过；全部 38 个本地脚本 `node --check` 通过。
- jsdom 冒烟：打卡（含重复打卡不重复计）、发帖 / 回答 / 举报、他人内容不可删、错误口令拒绝、正确口令开启管理员、隐藏 / 恢复、二次确认删除、目标保存、主题 / 动画 / 字号 / 语言写入、二次确认清除数据。

## [v1.23.26] - 2026-11-19 · 液面恢复水平：修掉「斜着卡一下」

### Fixed
- **回平中被冻住**：`isCalm()` 原先只看速度和能量，水波过零点时 `maxSpeed` 会短暂低于阈值，连续 0.35 s 后 rAF 直接停帧，液面就斜着停在半路。现在 `isCalm()` 增加 `tilt()`（扣掉整体水位后的液面最大偏离），倾斜时绝不判静；渲染端对 `|lift| < 0.02` 的振子尾巴直接归零，避免残余抬升让液面一直「微微鼓着」。
- **贴壁的垂直缝**：液面端点原先沿球壁弧上溯到球极点，网格最外列（x=±0.99）与球壁之间会留一条垂直的缝，高倍下像液面在壁上「掉下去」。
- **贴壁陡降的 V 形凹槽**：最外几列水深容量趋零，水在壁前急退，形成凹槽。

### Changed
- 液面路径改为**保持末列水位直接延伸到球外，由球内圆形裁剪收口**；平滑之后再对最外 8 列按内部值拉平，消除贴壁退落。
- 阻尼：新增二次阻尼 `DRAG_QUAD = 1.1`（大振幅晃荡衰减明显更快，甩一下约 1.9 s 回平，此前 3.8 s）；小振幅额外阻尼改为阈值 0.5 / 系数 2.6（不在液面仍倾斜时把它「粘住」）；`alphaV` 0.006 → 0.02（短波更快抹平，体积仍达标）。

### 自测
- `fluid-check` **20/20**（体积：静止 / 松手 / 6 s 往复全部通过）；`verify-native` **901 项全绿**。
- Edge headless 时间轴（每 0.12 s 一帧，0–1.44 s）+ 420px 高倍单帧核对：回平连续、两端贴壁无缝隙、无 V 形凹槽。
- 24 个 HTML 指纹 `?v=1157` → `?v=1158`（322 处）。

## [v1.23.25] - 2026-11-19 · 球内液体：消除液面锯齿，补上「上下甩到球顶再翻落」

### Fixed
- **液面锯齿**：液面由 97 个离散点直接 `lineTo` 连折线，66px 球上每列约 1 个折角；更深层的原因是一阶迎风浅水在强加速度下会沿贴壁段长出逐格尖刺。现在渲染层为 264px 画布（4× 超采样）+ Catmull-Rom 转三次贝塞尔 + 绘制副本 8 遍 1-2-1 平滑；物理层新增每步一次的**守恒人工粘性**（扩散自由表面 `s`、补回均值差），压掉 2~4 格短波而保留主波，体积漂移 < 0.3%。
- **左壁缺口**：液面高于球心时，液体路径原先从球的左右端点直接拉直线，左上 / 右上角会缺一块三角形；改为沿球壁 `arc` 上溯到液面端点。
- **贴顶画出球外**：整个渲染加球内圆形裁剪，被甩到球顶以上的水由球壁收住，不再在球外留下直线。

### Added
- **液池垂直振子**（`lift` / `liftV`）：容器垂直加速度直接驱动液面整体升降，`ay=560` 时 **0.14 s 冲到球顶**（`lift=1.06R`），加速度一撤由重力拉回，形成「冲到顶 → 沿壁翻落」的循环。此前垂直加速度只进 `clamp(g-ay, 55, 600)` 的等效重力，水面永远不会离开球底。
- 回落阶段的三种可见证据：液面中心先塌陷（`dip`）、球顶贴壁水带（月牙形填充）、沿壁落下的水滴（`updateCling`）。
- 按压浮球的冲量由 `(0, 110, 0.05)` 提高到 `(0, 260, 0.06)`，按下时液面有可见上抬。
- `stats()` 增加 `lift` / `liftV`；`isCalm()` 纳入液池振子，回落未停时继续跑 rAF。

### Changed
- `ai-fluid.js` 画布内部 132 → **264**（CSS 仍显示 66px）；`ai-tutor.js` 里 canvas 的 `width` / `height` 属性同步为 264。

### 自测
- `verify-native` **901 项全绿**；`fluid-check` **20/20**（体积漂移：静止 0.000%、松手 0.153%、6 s 往复 -0.262%）；`node --check` 通过 `ai-fluid.js` / `ai-tutor.js`。
- Edge headless 离屏渲染核对 6 态：静止 / 横向甩 0.45 s / 下拖 `ay=200` / 下拖 `ay=560` 冲顶 / 冲顶后回落 / 落定。
- 24 个 HTML 指纹 `?v=1156` → `?v=1157`（322 处）。

## [v1.23.24] - 2026-11-19 · 删除旧 CSS 液体模型，canvas 成为唯一液体实现

### Changed
- 彻底移除 AI 悬浮球的历史 CSS 弹簧液体模型：DOM 里的 `.nb-ai-fab-liquid`（水体层 + 3 个气泡）、`.nb-ai-fab-water`、4 粒 `.nb-ai-fab-drop`、2 根 `.nb-ai-fab-spout`、2 片 `.nb-ai-fab-film`、`.nb-ai-fab-splash` 全部删除，`build()` 只保留 `<canvas class="nb-ai-fab-fluid">`。
- 删除 `ai-tutor.js` 里约 250 行弹簧物理（倾角 / 升降 / 横移 / 驻波 / 翻滚 / 曲率 / 漂移 / 波纹 / 水花 / 水膜等通道与 `--liquid-*` 写入），`createLiquid()` 收敛为 9 行的 `createFluid()`：只创建 canvas 引擎，失败返回空实现。
- 删除 `style.css` 里对应的液体规则、`--liquid-*` / `--splash-*` 变量、`nb-ai-rise` / `nb-ai-bubble` / `nb-ai-surface` 三个关键帧、reduced-motion 里的液体声明，以及 `.nb-ai-fab.is-fluid` 显隐开关。
- 液体不再经过 CSS 自定义属性：所有状态只存在于浅水求解器里，渲染直接写 canvas。

### 保持不变
- 液体表现与上一版完全一致：浅水引擎、参数、渲染层一行未改，视觉与手感无差异。
- 无 canvas 时返回空实现，浮球拖动 / 面板打开等其余交互不受影响；`prefers-reduced-motion` 由引擎渲染一帧静态液面。

### Docs
- `verify-native` 断言同步：旧的 16 条 CSS 弹簧模型断言改为「玻璃球 + canvas」与反向断言（旧 DOM / 样式 / 变量必须不存在），并新增 reduced-motion 静态帧断言。

### 自测
- `verify-native` **901 项全绿**（910 → 901：移除 16 条旧模型断言，新增 6 条新模型断言 + 1 条 reduced-motion 断言）；`node --check` 通过 `ai-tutor.js`；`fluid-check` 20/20 通过；24 个 HTML 指纹 `?v=1155` → `?v=1156`。

## [v1.23.23] - 2026-11-19 · AI 球内液体改为守恒型浅水模型（参考 WaterBall）

### Added
- 新增 `assets/js/ai-fluid.js`：球内一维变底床浅水方程（Saint-Venant），以「质量守恒 + 动量守恒」驱动自由表面，底床取 `b(x)=√(1-x²)`。
  - 动量方程直接吃容器加速度 `a_x`，所以**向右甩水往左堆、向左甩水往右堆**，甩得越快波峰越高、改向立刻反向；
  - 面通量「先算全部、再统一更新」，并有「目标列容量 ≤ 2b」「源列不可抽干」两条限制，体积漂移为 0；
  - 固定步长 1/2400（满足 CFL），每帧 40 子步；Node 实测 **0.20 ms/帧**。
- 球内液体渲染层：`<canvas class="nb-ai-fab-fluid">`，绘制液面曲线、竖向蓝渐变、液面亮线、内部示踪流线、飞溅水珠、上浮气泡。
- 浅水物理回归脚本（`fluid-check`）20 项：半瓶初始体积、体积守恒、左右方向响应与反对称、速度快慢的倾角差、换向反转、松手余波与 4s 平复、长时间往复拖动无发散。

### Changed
- AI 悬浮球的液体由「CSS 弹簧模型 + 倾斜平面」升级为浅水自由表面：液面不再是刚性平板，急加速时会出现真实波形、贴壁爬升与余波。
- 原 CSS 液体层保留在 DOM 中，作为 **无 canvas 环境的降级路径与 reduced-motion 静帧**；可用时由 `.nb-ai-fab.is-fluid` 隐藏。
- 24 个页面新增 `assets/js/ai-fluid.js` 引用，缓存指纹统一升到 `?v=1155`。

### 自测
- `verify-native` **910 项全绿**（新增 12 项：脚本存在、双守恒方程、面通量先算后更新、加速度进动量方程、变底床、CFL 步长、示踪与飞溅、静止停 rAF、降级链路、px/ms→世界单位换算、`is-fluid` 可见性、24 页接入）。
- `fluid-check` 20/20 通过；`node --check` 通过 `ai-fluid.js` / `ai-tutor.js`；离屏渲染核对「静止半瓶 / 右拖左高 / 左拖右高 / 松手余波」四态。

## [v1.23.22] - 2026-11-19 · 反馈箱：本机凭据导出 / 恢复（匿名记录可跨设备）

### Added
- 「我的提问记录」底部新增「导出凭据」「恢复凭据」两个入口。
- **导出凭据**：生成 JSON（`app: "neurobase-feedback"`、`v: 1`、`exported_at`、`items[]`，含 `code` / 时间 / 类型 / 正文 / 状态 / 本地回复），尝试写入剪贴板并下载 `neurobase-feedback-YYYY-MM-DD.json`；`file://` 下剪贴板不可用时，文本自动填入恢复框供手动全选复制。
- **恢复凭据**：粘贴 JSON → 校验 → 按 `code` 去重合并（已有记录只补状态与回复，不覆盖正文），单次最多 500 条、正文截断 4000 字、每条回复最多 20 条；恢复后自动调用 `syncMine()` 拉取云端回复。
- 导出 / 恢复文案中英双语；导出提示明确「凭据含提问内容，请妥善保管」。

### Changed
- 匿名提问的跨设备边界由「无法找回」改为「凭据导出 / 恢复可找回」；登录用户仍按账号自动同步，无需导出。

### 自测
- `verify-native` **898 项全绿**（新增 6 项：导出 JSON 结构、`items`/`body` 字段、导出后恢复框展开、恢复回填条数、非法文本返回 0、恢复后列表重渲染）；`node --check` 通过；24 个 HTML 指纹 `?v=1151`。

## [v1.23.21] - 2026-11-19 · 反馈箱取消查询码，回复直接进「我的提问记录」

### Changed
- 移除 6 位查询码机制：删除提交后的查询码展示条、「查询回复」输入区、查询按钮与 `queryByCode`。`code` 仅作为云端记录的内部凭据保存在本地记录中，不再展示给提问者。
- 提交成功提示改为「提交成功！回复会显示在下方『我的提问记录』里。」（离线提示不变）。

### Added
- **打开即同步回复**：打开反馈箱时自动拉取云端状态与回复并合并到本地记录——已登录用户按账号读取自己的反馈列表（复用 RLS `fb_self_select`）；未登录用户用本地记录中的 `code` 逐条调用 `get_feedback_by_code`。
- 「我的提问记录」渲染每条提问的**全部**管理员回复（此前只显示最新一条），带「已回复 / 待回复」徽标。
- 云层新增只读 `NB.cloud.select(table, query)` 封装（带会话 token，受 RLS 约束），仅登录态可用。

### Docs
- 文案随语义调整：`fb.mineTitle` →「我的提问记录」，`fb.mineHint` / `fb.emptyMine` 同步改写；中英双语。

### 自测
- `verify-native` **892 项全绿**（新增 4 项：无查询码输入区 / 无查询码容器 / 「我的提问记录」区 / `syncMine` 与 `select` 接口）；`node --check` 通过；24 个 HTML 指纹 `?v=1150`。

## [v1.23.20] - 2026-11-19 · 公开文档口令脱敏（真实值不落 md）

### Fixed
- **公开文档口令脱敏**：`docs/` 下 5 个公开 md（`CHANGELOG` / `DEV_LOG` / `DECISIONS` / `PLAN` / `PROJECT_SCOPE`）中的 20 处真实口令全部替换为 `<管理员口令>` 占位符；这些 md 会被 `build-docs.mjs` 打包进站内「文档」页，等同公开站点。
- **缓存刷新**：重建 `docs-content.js`，24 个 HTML 缓存指纹 `?v=1146` → `?v=1147`，避免浏览器继续命中含口令的旧文档缓存。

### Added
- 新增 `D-067`：口令 / 密钥类敏感值只写占位符，公开文档与 `docs-content.js` 不含真实值。
- 新增 `E-041`：记录「把真实口令写进公开迭代文档」的教训与修复。
- `verify-native.mjs` 新增防回归断言：从 `core.js` 解析口令常量，扫描 `docs/**/*.md` 与 `docs-content.js`，命中即失败（脚本本身不保存明文）。

### Changed
- 文档记录口径：只写「机制 + 占位符 + 私有存放位置」，不写具体口令值；前端软限制口令仍保留在运行时 JS 中，文档中注明其公开可见性。

### Docs
- `PLAN.md` v94、`PROJECT_SCOPE.md` v6.49、`DEV_LOG.md` 当日条目同步；`DECISIONS.md` / `ERROR_LOG.md` 索引与条目各 +1。

### 自测
- `verify-native.mjs` **888 项全绿**（本轮新增 1 项口令泄露扫描）；`node --check` 通过；文档数 15；全部 24 个 HTML 指纹 `?v=1147`。

## [v1.23.19] - 2026-11-19 · 反馈箱「管理员入口」前置口令门（口令不公开）

### Added
- **反馈箱管理员入口口令校验**：反馈箱对话框底部的「管理员入口」不再直接跳转 `admin.html`，点击后先就地展开「管理员口令」输入区；输入 `<管理员口令>` 并提交通过后才进入管理页，口令错误显示提示并清空输入，每次打开反馈箱自动收起复位。
- **口令唯一来源**：`core.js` 新增 `NB.adminPass = '<管理员口令>'`，`page-admin.js` 与 `feedback.js` 统一从该常量读取，避免两处口令各自维护而漂移。
- **自测扩充**：`verify-native.mjs` 新增 10 项断言（口令唯一来源、正确 / 错误口令校验、点击入口只展开不跳转、错误提示与输入清空、口令区可复位收起）。

### Changed
- **入口层样式**：新增 `.fb-admin-gate / .fb-admin-gate-label / .fb-admin-gate-row / .fb-admin-gate-input / .fb-admin-gate-btn / .fb-admin-gate-err`，全部走主题变量，自动适配明暗主题与字号缩放；`admin.html` 原有口令门继续保留为第二道防线。
- 口令仍为纯前端「软限制」（源码可见，仅防误入，不构成真正鉴权）；云端模式下 `admin.html` 已登录时不再弹本页口令，但入口层校验始终生效。

### Docs
- 新增决策 `D-066`；`PLAN.md` v93、`PROJECT_SCOPE.md` v6.48、`DEV_LOG.md` 当日条目同步；本轮无新增高价值错误。

### 自测
- `verify-native.mjs` **887 项全绿**（本轮新增 10 项）；`node --check` 通过 `core.js` / `feedback.js` / `page-admin.js`；全部 24 个 HTML 缓存指纹 `?v=1145` → `?v=1146`。

## [v1.23.18] - 2026-11-19 · 数据来源自动更新：GitHub Actions 回写 + Vercel 自动部署（无需云端开通）

### Added
- **`scripts/build-site.mjs`**：`build-data.mjs` 的可移植版本——仓库根由脚本位置推导（不再硬编码盘符），本地与 CI 共用；生成后比较内容，**只有真实变化才 bump** 全部 HTML 的 `?v=`（当前最大值 +1），无变化时不产生 diff。

### Changed
- **`.github/workflows/source-sync.yml`** 从「只读巡检」升级为「自动发布」：`permissions: contents: write`，新增「重建前端数据」与「提交记录型数据」两步；每周一核对 Crossref 后自动 commit 并 `git push`，Vercel 检测到 push 自动重新部署。无变化时跳过提交；push 前 `git pull --rebase --autostash` 降低并发冲突。
- 自动提交范围限定为记录型数据（`data/sources.json` / `update-log.json` / `sync-state.json`、前端数据文件、指纹），词条正文仍由人工修改，保持「自动差异先入待审队列」原则。
- `docs/DEPLOY.md` §7 重写为两条路线：A 路线（CI 回写 + Vercel，无需云端开通）为默认推荐，B 路线（Worker + Supabase）保留为可选。

### Docs
- 新增决策 `D-065`；`PLAN.md` v92、`PROJECT_SCOPE.md` v6.47、`DEV_LOG.md` 当日条目同步。

### 自测
- `verify-native.mjs` 876 → **879 项**（新增：构建脚本可移植、CI 具备写权限并重建数据、CI 会提交并 push）；`check-sources.mjs` 137 项、`cloud-check.mjs` 59 项全绿；本轮数据无变化，指纹保持 `?v=1145`。

## [v1.23.17] - 2026-11-19 · Phase 7 · 数据来源与实时更新：来源登记 + 定时同步 + 自检 + 最近更新页

### Added
- **来源登记表 `data/sources.json`**：把 110 条词条的 **111 条 references** 按标题归并为 **41 个唯一来源**（教材 19 / 论文 12 / 综述 9 / 百科 1），每个来源带 `id / type / title / url / via / verified_at / terms[]`；`url` 为可核验检索入口（论文/综述→Crossref，教材/百科→WorldCat），不伪造原文链接。无来源词条 **0**。
- **三个可复跑脚本**：
  - `scripts/build-sources.mjs`：从词条聚合登记表，保留人工补充的 `url / note`；缺来源、缺类型、日期非法直接失败。
  - `scripts/sync-sources.mjs`：离线比对快照；`--online` 逐条请求 Crossref（8s 超时，失败降级并标记 `degraded`）；`--check-links` 巡检来源链接；`--simulate` 演示异常入队。产出 `data/sync-state.json` 与 `data/update-log.json`（保留最近 50 次运行 / 200 条队列）。
  - `scripts/check-sources.mjs`：来源可溯、术语唯一、链接格式、时间戳新鲜度、同步记录完整性，共 **137 项**断言。
- **云端 5 张表 + 1 个 RPC**（`docs/supabase/schema.sql` §12）：`terms` / `sources` / `term_references` / `update_queue` / `sync_runs`，全部启用 RLS；anon / authenticated 只读，写权限仅 `service_role`；新增 `review_update(p_id, p_status)` 供管理员把待审项标记为 approved / rejected。
- **定时巡检 Worker `workers/source-sync/`**：Cron 每周一 03:17 UTC；HEAD 校验来源链接、标记超过 180 天未复核的来源，失败项写入 `update_queue` 并记录 `sync_runs`；手动触发需 `x-sync-token`。密钥只走 `wrangler secret`。
- **GitHub Actions `.github/workflows/source-sync.yml`**：每周一 03:17 UTC 或手动触发，依次重建登记表、在线同步、跑 137 项质量门，并上传同步产物 artifact。
- **前端「数据来源与最近更新」页 `updates.html`**（第 24 页）：概览 4 卡（词条 / 来源 / 近 30 天更新 / 待审变更）、最近更新 12 条、41 行来源登记表（类型 / 关联词条 / 核验时间 / 外链）、同步记录与待审队列。
- **首页最近更新条**：3 条最新词条 + 最近一次同步状态，入口指向 `updates.html`。
- **内容生态第 4 张入口卡**「来源与更新」，4 列布局（窄屏 2 列 / 手机 1 列）。
- **词条页来源核验外链**：每条来源旁新增「打开核验入口」，按标题映射到 `sources.json`。
- 构建产物 `assets/js/data/sources.js` / `updates.js`；`build-data.mjs` 增加来源覆盖与队列字段自检。

### Changed
- `verify-native` PAGES 由 23 → **24 页**；新增 Phase7 断言 23 项（登记表、覆盖、URL、同步记录、页面渲染、首页入口、生态卡、词条外链），并同步把「hub 三张入口卡」→ 四张、「8 张表 RLS」→ 13 张。总数 **853 → 876 项全绿**；`cloud-check` 保持 **59 项全绿**。
- 24 个 HTML 缓存指纹 `?v=1143` → `?v=1145`（596 处，本轮两次 bump：1143→1144→1145）。

### Fixed
- **Crossref 日期精度误报**：Crossref 常只返回 `YYYY-MM`，补成 `YYYY-MM-01` 后与本地完整日期比较，会把 `2023-05-01` vs `2023-05-16` 误判为变更。改为按响应精度比较（精度 2 时只比年月），13 条 DOI 在线核对从 3 条假变更收敛为 **1 条真实标题补全**（见 E-040）。

### Docs
- `docs/DEV_LOG.md` 当日条目 + 阶段总览行；`docs/DECISIONS.md` D-064；`docs/ERROR_LOG.md` E-040；`docs/PLAN.md` v91（Phase7 状态与交付说明）；`docs/PROJECT_SCOPE.md` v6.46；`docs/DEPLOY.md` 新增 §7 来源巡检部署；重建站内文档数据。

---

## [v1.23.16] - 2026-11-19 · 液面波动加大：抬高驱动增益，同时收住余振

### Changed
- **倾斜幅度 +25%**：`tiltTo` 从 `axS*9.6 + vx*5.2` 提到 `axS*12.0 + vx*6.2`，夹取 `±40° → ±42°`；快速甩动峰值从 **11.9° → 13.2°**。
- **液面升降 +19%**：`levelTo` 从 `-ayS*26 - vy*0.8` 提到 `-ayS*31 - vy*1.0`，夹取 `±12 → ±13px`；上下往复实测 **5.17px → 7.36px**。
- **驻波更碎更明显**：`waveTo` 三项增益 `0.075/0.014/0.34 → 0.115/0.020/0.46`，上限 `±4.4 → ±5.6`；`--liquid-wave-r` 放大系数 `1.4 → 1.9`。
- **曲率更鼓**：`bulgeTo` 增益 `2.2 → 2.9`；液面线随曲率位移 `2.6px → 3.4px`、拉伸 `0.45 → 0.62`、线高 `1.8px → 2.6px`。
- **高频细波翻倍**：`ripple` 幅值 `1.5px → 2.4px`；内部漂移跟随量 `0.85 → 0.95`。
- **同时提高阻尼收住余振**：`Z_T 0.115 → 0.140`、`Z_L 0.30 → 0.36`。波幅靠增益给，收敛靠阻尼压 —— 松手后仍有 2~3 次回摆，但不会拖尾。

### Added
- 新增回归断言「液面波动幅度够大（驻波 / 曲率 / 细波）」。

### Docs
- `verify-native` 852 → **853 项**；23 个 HTML 指纹 `?v=1142` → `?v=1143`（281 处）。
- 同步 `docs/DEV_LOG.md`、`docs/DECISIONS.md` D-063、`docs/ERROR_LOG.md` E-039、`docs/PLAN.md` v90、`docs/PROJECT_SCOPE.md` v6.45；重建站内文档数据。

---

## [v1.23.15] - 2026-11-19 · 让水真正「流」起来：降阻尼、加漂移与气泡

### Changed
- **阻尼整体下调，水不再「一步到位」**：`Z_T 0.13 → 0.115`、`Z_L 0.70 → 0.30`、`Z_W 0.07 → 0.055`、`Z_S 0.16 → 0.12`、`Z_B 0.50 → 0.32`。液面升降从重阻尼改为欠阻尼，松手后会自己弹一两下再停。
- **惯性幅度加大**：`tiltTo` 增益 `6.5 → 9.6`、夹取 `±30° → ±40°`；`levelTo` 增益 `24 → 26`。快甩时液面倾角从 8.6° 提到 11.9°。
- **液体更通透**：水体背景顶部 `0.36 → 0.24` 透明度、`backdrop-filter` 从 `blur(0.8) saturate(1.45)` 降到 `blur(0.6) saturate(1.3)`；顶部内阴影从 4px 厚白带收成 1px 亮边，液面亮线从 4.4px 椭圆改成 3px 细线。
- **去掉「胶体裂纹」**：水体内部原用 `conic-gradient` 造翻卷亮纹，在小球上会切出三角硬边；改为两层柔和径向光，透明度 `0.22 → 0.11`。
- **水珠只在真正溅起时出现**：opacity 改为 `burst²` 驱动，小抖动时完全不可见。

### Added
- **上浮气泡 `.nb-ai-fab-bubble`**：3 个（3 / 2.2 / 1.8px），周期 7.2 / 9.4 / 11s，从球底升到液面后消失，被液体层裁在液面以下 —— 静止时也能看到水在「活着」。
- **内部漂移 `--liquid-drift`**：水体层以 3.4/s 追赶 `sway * 0.85`，始终慢外壳半拍，产生「容器先动、水后到」的视差。
- **高频波纹 `--liquid-ripple`**：`sin(t × 0.042) × slosh × 1.5px`，叠加在液面线上，晃动时水面会抖。
- **弯月面**：液面线两端各加一枚 7%×46% 的白色椭圆高光，水贴住球壁时上翘反光。

### Docs
- `verify-native` 850 → **852 项**（低阻尼/漂移/波纹、气泡两组断言）；23 个 HTML 指纹 `?v=1141` → `?v=1142`（281 处）。
- 同步 `docs/DEV_LOG.md`、`docs/DECISIONS.md` D-062、`docs/ERROR_LOG.md` E-038、`docs/PLAN.md` v89、`docs/PROJECT_SCOPE.md` v6.44；重建站内文档数据。

---

## [v1.23.14] - 2026-11-19 · 按真实物理重做上下晃动：加速度驱动、液面鼓动、水花脉冲

### Changed
- **液面位移改由加速度决定，不再由速度决定**：`levelTo = -ayS * 24 - vy * 0.8`（clamp ±12），升降通道 `W_L` 12.5 → 30、`Z_L` 0.17 → 0.70。匀速拖动时水面几乎不动，只有掉头、急停的加速度才把水甩起来 —— 与真实容器一致。
- **垂直晃动不再产生整体旋转**：`spinV` 只接受水平 `axS`，去掉 `ayS * 260 * sec`；松手时只有 `|lastVx| > 0.2` 才给角动量与驻波。真实液体在竖直方向只做轴对称起伏，不会整体打转。
- **水花改为掉头脉冲**：新增 `burst` 通道，`|dvY| > 0.45` 时注入、按 9.5/s 衰减，约 0.3s 落回液面；液面不再长期挂着水珠。
- **水花形态按真实尺寸重做**：水柱从 2→15px 收成 1.2→5.2px 并贴住液面；四粒水珠由竖长条改成正圆（2.8 / 2.4 / 2.0 / 1.7px）、下移到液面处（top 51.2%~51.8%）、上跳倍数收到 0.30~0.62；溅射环压扁到 62%×11%、模糊 1.2 → 0.7px。

### Added
- **液面曲率通道 `--liquid-bulge`**：`bulgeTo = ayS * 2.2`，二阶振子 `W_B 26 / Z_B 0.5`，让水面中心随加速度上鼓或下凹；液面亮线同步位移 ±2.6px、厚度与 `scaleY` 变化，水体内部气泡层随曲率压缩 2.6px。
- **挂壁水膜 `.nb-ai-fab-film`**：左右两条 2.4×16% 的薄水痕，`|dvY| > 0.3` 时生成、按 2.6/s 消退，随液面高度上下移动 —— 晃动把水甩上球壁后慢慢流回。
- **手指停住的静止判定**：`lastMoveAt` 超过 90ms 未更新时，`axS/ayS` 与 `tiltTo/swayTo/levelTo` 一起归零，避免按住不动时液面永久歪着。

### Docs
- 新增垂直真实性回归 `probe-fab-real-vertical.mjs`（14 项：匀速不偏移、凸凹双向、脉冲衰减、不旋转、最终静止）；`verify-native` 848 → **850 项**；23 个 HTML 指纹 `?v=1140` → `?v=1141`（281 处）。
- 同步 `docs/DEV_LOG.md`、`docs/DECISIONS.md` D-061、`docs/ERROR_LOG.md` E-037、`docs/PLAN.md` v88、`docs/PROJECT_SCOPE.md` v6.43；重建站内文档数据。

---

## [v1.23.13] - 2026-11-19 · 垂直甩动也有水花：上下拖动溅起水柱与错落水珠

### Added
- **垂直惯性通道**：新增 `dvY / ayS`，与水平通道同构。`levelTo = -vy*3.6 - ayS*1.6`，向下加速时液面相对上涌、向上加速时液面下沉；`spinV` 追加 `ayS*260*sec`，让快速上下甩动时水域内部也跟着翻卷。
- **溅射环** `.nb-ai-fab-splash`：液面处一圈受 `--liquid-slosh` 驱动的水光，随强度放大并淡入淡出，跟随 `--liquid-level` 升降。
- **两根水柱** `.nb-ai-fab-spout`：从液面向上冲起的细长水线（2 → 15px，随 `slosh` 拉长），左右各一根、角度相反，底部锚定在液面。
- **水珠扩到四粒**：新增 `.nb-ai-fab-drop--c / --d`，四粒水珠用不同的位移倍数（0.56 / 0.7 / 0.92 / 1.0）与静态高度错落，不再排成一条直线。

### Changed
- `sloshTo` 改为取「水平」与「垂直」两组强度的较大值：`max(|axS|/1.8 + |vx|/1.9, |ayS|/1.6 + |vy|/1.7)`，上下快速拖动同样能拉满水花。
- `--splash-y` 上跳幅度从 2.4px 提到 6.2px，水珠随液面升降（`--liquid-level`）一起移动，不会在液面抬升时悬在空中。

### Docs
- `verify-native` 846 → **848 项**（新增垂直惯性通道、水花结构两组断言）；23 个 HTML 指纹 `?v=1139` → `?v=1140`（281 处）。
- 同步 `docs/DEV_LOG.md`、`docs/DECISIONS.md` D-060、`docs/ERROR_LOG.md` E-036、`docs/PLAN.md` v87、`docs/PROJECT_SCOPE.md` v6.42；重建站内文档数据。

---

## [v1.23.12] - 2026-11-19 · 浮球液体物理升级：速度不同晃动不同，快甩可翻滚

### Changed
- **惯性力驱动**：液面倾角不再直接按指针速度映射，改为「速度差分 → 归一化到 16ms 的速度增量 → 低通」得到惯性力 `dv / axS`，再合成「惯性项 + 粘滞拖曳项」的目标角。慢拖只有约 1.3° 的轻微晃动，快甩可达 8.7° 以上（实测差 6.5 倍）。
- **二阶驻波**：新增 `wave` 通道（ω=17.5 rad/s、ζ=0.07），由倾角角速度驱动，频率更高、衰减更慢，形成松手后来回拍打的水面余波；液面亮线随 `--liquid-wave-y / -r / -s` 起伏、微倾与拉伸。
- **翻滚角动量**：新增 `spin` 通道。连续急加速把角动量喂进 `spinV`，急停再叠加一次冲量；`--liquid-spin` 驱动水体内部层（气泡 + 卷纹）整体旋转，实测快甩后 `spin` 峰值约 38°。
- **水花**：由「最后一次速度骤停」换算成惯性冲量，甩得越快冲量越大；`--liquid-slosh` 控制水花强度与透明度，两粒拉长的水珠沿甩动方向（`--splash-x`）从液面溅起。
- **欠阻尼回摆**：倾角阻尼比 0.13、固有频率 8.6 rad/s，松手后出现反向过冲（实测 8.7°）与 2~3 次可见回摆，约 1s 收敛。
- **静止归零**：倾角 / 升降 / 横移 / 驻波 / 翻滚 / 水花全部收敛后统一归零并停止 rAF。
- **reduced-motion**：新增媒体查询变更监听，系统开启后立即清零内联变量并取消 rAF。

### Added
- DOM 新增 `.nb-ai-fab-water`（可旋转的水体内部层）与两粒 `.nb-ai-fab-drop`（水花）；`.nb-ai-fab-liquid` 增加 `overflow: hidden`，把旋转中的气泡裁在液面以下。

### Fixed
- 加速度量纲错误：初版把速度差分再除以 1000，惯性项实际恒接近 0，导致快甩只倾斜、不翻滚，`--liquid-spin` 始终为 0。改为按 16ms 归一的速度增量后惯性项恢复正确量级（见 E-035）。

### Docs
- `verify-native` 841 → **846 项**：新增三层结构、加速度驱动、驻波 / 翻滚通道、急停冲量、静止归零五组断言。
- 23 个 HTML 缓存指纹 `?v=1138` → `?v=1139`（281 处）。
- 同步 `docs/DEV_LOG.md`（当日条目 + 阶段总览行）、`docs/DECISIONS.md` D-059、`docs/ERROR_LOG.md` E-035、`docs/PLAN.md` v86、`docs/PROJECT_SCOPE.md` v6.41；站内文档数据已重建。

---

## [v1.23.11] - 2026-11-19 · AI 助教浮球改为玻璃球 + 半瓶蓝色液体

### Added
- **外观重做**：浮球从实心渐变球改为透明玻璃球，内部盛半瓶与站点同色调的蓝色液体。玻璃层用 `backdrop-filter`（`blur(.45px) saturate(1.6) brightness(1.04) contrast(1.08)`）对下方文字做轻微折射，配合内嵌高光、边缘色散环、内缘暗环与投影；液面固定在 49.5%，水体从 `rgb(126 199 255 / .36)` 过渡到 `rgb(18 78 145 / .8)`，文字可透过水体辨认；移除球内 ✦ 图标。
- **液体物理**：新增 `createLiquid()`，用弹簧-阻尼同时驱动液面倾角 `tilt`、升降 `level`、横移 `sway`。按下时液面受压上浮（`level ≈ -2.2px`）、拖动按指针速度产生惯性倾斜（向右拖最高约 16°，实测 13.8°）、松手带阻尼回弹（约 1s 归零）；rAF 只在按下 / 拖动 / 未收敛时运行，静止即停。
- **可访问性**：`prefers-reduced-motion: reduce` 下不启动液体动画、变量保持 0；触摸拖动（Pointer Events 映射）与鼠标行为一致。

### Changed
- `verify-native` 837 → **841 项**：新增玻璃球结构、backdrop 折射、弹簧物理、reduced-motion 四组断言。
- 23 个 HTML 缓存指纹 `?v=1137` → `?v=1138`（281 处）。

### Docs
- 同步 `docs/DEV_LOG.md`（当日条目 + 阶段总览行）、`docs/DECISIONS.md` D-058、`docs/ERROR_LOG.md` E-034、`docs/PLAN.md` v85、`docs/PROJECT_SCOPE.md` v6.40；站内文档数据已重建。

---

## [v1.23.10] - 2026-11-19 · 删除存量明文 API 记录（功能零影响）

### Changed
- 按用户要求删除 `.deepworks/tmp/` 下 6 个含明文凭证的过程文件：`cf-token.txt`（Cloudflare API Token）、`sb-probe.py`、`sb-probe2.py`、`make-fb-probe.py`（内联 Supabase anon JWT）、`badcfg.html`、`badcfg.txt`（浏览器探测快照，含 anon key）。删除前已确认无任何运行脚本、构建流程或 verifier 引用它们。
- `uploads/ses_efac5f5e9ffeRWbSrH5O3JFhTQ/index.html` 中的 1 处 Supabase publishable key 就地脱敏为 `sb_publishable_REDACTED`；该文件是历史会话快照，不参与任何构建或运行。
- 保留 `outputs/neurobase/assets/js/cloud-config.js` 中的 Supabase publishable key：它是 23 个页面共同引用的**运行必需**公开凭据（受 RLS 约束），删除会导致登录、AI 助教与在线反馈箱全部失效，与「不影响正常运行」冲突。

### Fixed
- 全工作区明文凭证扫描（`sk-` / `AIza` / `ghp_` / `sb_secret_` / `cfut_` / `eyJhbGciOiJ` / `AKIA`）已 **0 命中**；真实 publishable key 仅剩 `cloud-config.js` 一处（设计允许公开）。

### Docs
- 同步 `DEV_LOG.md`（当日条目 + 阶段总览行）、`PLAN.md`（版本行 + §10）、`PROJECT_SCOPE.md`（v6.38 + §11）。无新增决策与教训，延续 `D-055`、复用 `E-031`。本轮未改动站点 JS / CSS / HTML，缓存指纹保持 `?v=1137`。

---
## [v1.23.9] - 2026-11-19 · 浮球松手不再被甩向边缘（位移叠加修复）

### Fixed
- **现象复现**：1200×800 视口下把球从 `(398, 452)` 拖动 `(380, -260)`，松手瞬间 `left` 由 `398` 突跳到 `778`（= 落点 `400` + 拖动位移 `380`），随后 0.22s 滑回落点。用户看到的就是「松手后被甩到边缘再吸回来」。
- **根因**：拖动期间位移由内联 `transform: translate3d(dx,dy)` 承载；落点时 `pinFab` 又把同一份 `dx` 加进 `left/top`，但「清空 `transform`」与「摘掉 `.is-dragging`」在同一帧提交，浏览器按变更前的 `transition: transform 0.22s` 仍做过渡，视觉上位移被叠加两次。
- **修复**：`pointerdown` 即内联 `transition: none` 并 `void fab.offsetWidth` 强制样式落地；落点严格按「清空 `transform` → 写 `left/top` → 强制重排 → 摘 `.is-dragging` → 双 `requestAnimationFrame` 交还 CSS 过渡」顺序提交；落点改用 `pointerup` 坐标，快速甩动时不再落后最后一次 `pointermove`。
- **实测**（Edge headless + CDP，同一拖动场景）：松手即 `398/449`，60ms 与 460ms 完全不变；甩出视口夹在 8px 边距；刷新后按比例还原；轻点只开面板、不移动球。

### Docs
- `verify-native` 835 → **837 项**：新增「松手锁死过渡 + 强制重排」「落点以 pointerup 为准」两组断言，并把自由落点断言改为匹配新实现。
- 23 个 HTML 缓存指纹 `?v=1136` → `?v=1137`（281 处）。依据见 `docs/PLAN.md` v83、`docs/DECISIONS.md` D-057、`docs/ERROR_LOG.md` E-033 与 `docs/DEV_LOG.md` 2026-11-19（v1.23.9）条目。

---

## [v1.23.8] - 2026-11-19 · 浮球跟手拖动、自由落点、位置跟账号走

### Added
- `cloud.js` 新增用户偏好通道 `NB.cloud.prefs`（`get` / `set` / `pull`）：本地 `localStorage['nb-cloud-prefs']` 立即生效，登录态下再 `PATCH /rest/v1/profiles?id=eq.<uid>` 写入 `prefs`（jsonb），失败只记 `lastError`，不阻断界面。
- `docs/supabase/schema.sql`：`profiles` 增加 `prefs jsonb not null default '{}'`（`add column if not exists`，幂等）。

### Changed
- **拖动更跟手**：拖动期间只写 `transform: translate3d(...) scale(1.06)` 并挂 `will-change: transform`，不再每次 `pointermove` 改 `left/top`（避免每帧强制布局），手指/鼠标与球之间没有延迟感。
- **松手不再吸附边缘**：改成**自由落点**——拖到哪就停在哪，只把球夹在视口内（`MIN_GAP = 8`）。
- 起拖阈值 5px → 3px（触屏 8px），轻点仍算点击，不会把点击误判成拖动。
- **位置改为跟随账号**：以「视口比例」记录（`rx` / `ry`），登录后写入 `profiles.prefs.ai_fab`；下次打开先用本地缓存秒还原，云端偏好到达后再校正（本次已手动拖过则不覆盖）。未登录、离线、尚未跑增量 SQL 时自动退回「本浏览器记忆」，功能不残缺。
- 移除上一版的边缘吸附与「继续学习」胶囊避让逻辑（自由落点后由用户决定位置），球被拖到右半屏时提示气泡仍翻到左侧。

### Docs
- `verify-native` 832 → 835 项（拖动断言改为 transform 跟手 / 自由落点 / 比例记忆 / 云端拉取校正），`cloud-check` 50 → 59 项（新增偏好读写与 PATCH 契约）；指纹 `?v=1135` → `?v=1136`。
- `DEPLOY.md` §1 增加「已有库的增量补丁」：`alter table public.profiles add column if not exists prefs jsonb not null default '{}'::jsonb;`。

---
## [v1.23.7] - 2026-11-19 · 凭证与密钥不落盘（安全约定加固）

### Changed
- 新增**第二硬性约定 · 凭证与密钥**并写入根 `AGENTS.md`：API Key / Token / Secret / 服务端口令只允许存在于运行环境变量与平台 Secrets（Supabase Edge Function Secrets、Cloudflare `wrangler secret`、Vercel Environment Variables），禁止写入 `outputs/**`、`docs/**`、`data/**` 及任何会被提交或发布的源码、配置与文档。
- `.gitignore` 由「只忽略部分过程目录」升级为覆盖全部凭证面：整体忽略 `.deepworks/tmp/`、`supabase/.temp/`，并拦截 `.env`、`.env.*`、`.dev.vars`、`*.pem`、`*.key`、`*.p12`、`*.pfx`、`*secret*.txt`、`*token*.txt`、`*credential*`。
- 明确区分两类凭据：Supabase `anon` / `publishable` key 属设计允许的公开凭据（仅受 RLS 约束、仅用于前端），`service_role` 与 AI Provider key 一律视为机密、绝不进前端。

### Fixed
- 清理核查发现 `.deepworks/tmp/cf-token.txt` 存有**明文 Cloudflare API Token**（此前探测部署遗留），以及 `sb-probe.py` / `sb-probe2.py` / `make-fb-probe.py` 内联的 Supabase `anon` JWT 明文。已在 `.gitignore` 层面阻断（`.deepworks/tmp/` 整体忽略），并列入清理清单；用户在同日选择「暂不删除，保留阻断」——文件继续留在 `.deepworks/tmp/`，依靠整体忽略规则防止入库（见 DEV_LOG / E-031）。

### Docs
- 同步 `DEV_LOG.md`（当日条目 + 阶段总览行）、`DECISIONS.md`（D-055）、`ERROR_LOG.md`（E-031）、`PLAN.md`（版本行 + §10）、`PROJECT_SCOPE.md`（v6.37 + §11）。`.opencode/skills/version-changelog/SKILL.md` 的交付前校验清单新增「凭证扫描」项（`rg` 搜 `sk-` / `AIza` / `ghp_` / `sb_secret_` / `cfut_` / `eyJhbGciOiJ` / `AKIA`）；本轮无站点代码与页面改动，缓存指纹保持 `?v=1135`。

---

## [v1.23.6] - 2026-11-19 · AI 助教浮球可拖动

### Added
- 左下角 AI 助教浮球支持**鼠标 / 触屏拖动**（Pointer Events + `setPointerCapture`），拖动时放大并暂停呼吸光环；5px 抖动阈值区分「点击」与「拖动」，拖动结束的那一次 `click` 被吞掉，不会误开面板。
- 松手**自动吸附到最近的左侧或右侧边缘**，纵向位置保留；位置写入 `localStorage`（`nb.ai.fab.pos`），刷新、跳页后原位恢复，换窗口尺寸时自动夹回视口内。
- 球被拖到右半屏时，「AI 助教」提示气泡自动翻转到球的左侧弹出，不会溢出视口。
- 拖到右下角时自动**避开右下角「继续学习」胶囊**：若吸附位置与胶囊矩形重叠，球会被顶到胶囊上方，两者互不遮挡。

### Changed
- 对话面板改为**跟随浮球定位**（`placePanel`）：优先在球上方展开，上方空间不足（< 220px 且比下方小）时改在下方展开；桌面端与球同侧对齐并限宽 368px，窄屏（≤520px）恢复左右留白；面板最大高度按可用空间动态计算。

### Docs
- `verify-native` 826 → 832 项（新增拖动 / 吸附记忆 / 误触抑制 / 面板跟随 / 拖动样式 / `touch-action` 共 6 条断言），`cloud-check` 50 项全绿；指纹 `?v=1134` → `?v=1135`。

---

## [v1.23.5] - 2026-11-19 · AI 助教浮标改成圆形漂浮球

### Changed
- 左下角 AI 助教入口由「胶囊按钮」改为**圆形漂浮球**：直径 `4.15rem`（约 66px，移动端 `3.5rem`）、蓝色渐变球体 + 内外两层阴影 + 图标轻微浮动；hover / 键盘聚焦时上浮放大并显示右侧文案气泡，`✦` 图标随球呼吸摆动。
- 新增呼吸光环（`::before` 扩散动画）与 `:focus-visible` 焦点环；`prefers-reduced-motion` 下关闭全部动画。
- 对话面板与浮球的间距同步上移（桌面 `bottom: 5.9rem`、移动端 `4.9rem`），避免被更大的球体压住。
- 浮球文案视觉上收起为 hover 气泡后，补 `aria-label`（`T('fab')`）保证读屏与键盘用户仍能听到「AI 助教」。

### Docs
- `verify-native` 824 → 826 项（新增「浮标为圆形且宽度 4.15rem」「保留 aria-label」断言），`cloud-check` 50 项全绿；指纹 `?v=1133` → `?v=1134`。

---

## [v1.23.4] - 2026-11-19 · AI 助教接上 Supabase Edge Function（DeepSeek）

### Changed
- AI 助教后端由 Cloudflare Worker 切换为 **Supabase Edge Function**（slug `hyper-worker`，显示名 `ai-tutor`）：`cloud-config.js` 的 `workerUrl` 写入 `https://flayytlvrbhuainebzjd.supabase.co/functions/v1/hyper-worker`；Cloudflare Worker 保留为备用实现。
- `askTutor()` 自动识别后端形态：`workerUrl` 含 `/functions/v1/` 时原样调用，否则按 Worker 老约定拼 `/api/tutor`。

### Fixed
- `cloud.js` 的 `askTutor()` 把 `/api/tutor` **拼了两次**（`url` 变量里已经包含路径，`fetch(url + '/api/tutor')` 又拼一次），迁到 Edge Function 后必然请求到 `.../hyper-worker/api/tutor` → 404。改为按形态分支、只拼一次，并对 Supabase Functions 网关补 `apikey` 请求头。

### Docs
- 通过 Supabase CLI 写入 3 条 Secrets（`AI_API_KEY` / `AI_BASE_URL=https://api.deepseek.com/v1` / `AI_MODEL=deepseek-chat`），实测 `hyper-worker` 返回 `200`、`charset=utf-8`、中文答案 + `disclaimer`。
- `docs/DEPLOY.md` 第 3 节重写：Edge Function 为首选（CLI 部署 / Secrets / 验收三步命令），Cloudflare Worker 降为「需自定义域名」的备用方案；凭据清单改为 Supabase Access Token。
- `verify-native` 821 → 824 项（新增「生成 URL 只拼一次」「Edge Function 端点」「apikey 头」断言），`cloud-check` 50 项全绿；指纹 `?v=1132` → `?v=1133`；新增 `D-054`、`E-030`。

---

## [v1.23.3] - 2026-11-18 · 注册后「验证邮箱」指引卡 + 重发确认邮件

### Added
- 注册成功（或邮箱未验证时登录）后，弹窗切换到「还差一步：验证邮箱」指引卡：显示收件邮箱、三步操作（打开邮箱 → 点确认链接 → 回来登录）、超时提示。
- 「重新发送确认邮件」按钮：走 Supabase `POST /auth/v1/resend`，60 秒冷却，失败原样显示服务端消息；「返回登录」按钮回填邮箱。
- `cloud.resendConfirm(email)` 新接口（非法邮箱本地拦截，不发请求）。

### Fixed
- 未验证邮箱时登录只显示 `http_400`：`signIn` 现在识别 `Email not confirmed` 并返回 `code: 'confirm_needed'`，界面直接给出确认指引，不再暴露裸状态码。
- 提示卡曾被 `shellHtml()` 的「云端未配置」分支抢先命中；视图分支顺序改为「确认卡优先」。

### Docs
- `verify-native` 817 → 821 项（新增提示卡渲染 / 重发 / 返回按钮断言），`cloud-check` 44 → 50 项（新增 confirm_needed 识别、resend 请求体、普通登录失败不误判）；新增 `E-029`；指纹 `?v=1132`。

---

## [v1.23.2] - 2026-11-18 · 兼容 Supabase publishable key；管理端保留本地模式

### Changed
- `cloud.js` 兼容 Supabase 2025 新密钥体系：`sb_publishable_...` 只放 `apikey` 头，未登录请求不再发送 `Authorization: Bearer <key>`；旧版 `eyJ...` anon key 行为不变（仍带 Bearer）。
- `cloud-config.js` 写入真实项目配置（`https://flayytlvrbhuainebzjd.supabase.co` + publishable key），站点进入在线模式。

### Fixed
- `admin.html` 在「已配置云端但未登录」时直接进入云端登录态，本地口令模式不可用；改为仅「已配置 + 已登录」走云端管理，未登录仍保留本地模式并在顶部提供管理员登录入口。

### Docs
- `verify-native.mjs` 的页面加载器在 eval 后强制把 `NB_CLOUD` 降级为空，保证离线回归路径可测（在线逻辑由 `cloud-check.mjs` 覆盖）；新增 `E-028`。
- 自测：`verify-native` 817 项、`cloud-check` 44 项全绿；指纹 `?v=1130` → `?v=1131`。

---

## [v1.23.1] - 2026-11-18 · 修复 schema.sql 首次执行报 42883（函数定义顺序）

### Fixed
- `docs/supabase/schema.sql`：`feedback.code` 的默认值引用 `public.gen_feedback_code()`，但该函数定义在文件后半部分（第 11 节），导致首次整段执行报 `ERROR: 42883: function public.gen_feedback_code() does not exist`。已将函数前移到第 6.1 节（`feedback` 建表之前），第 11 节保留注释占位；脚本仍幂等，已部分建表的项目可直接重跑。
- `admins` 表的默认管理员邮箱改为注释模板，避免把无关邮箱写成管理员。

### Docs
- CHANGELOG（本记录）、DEV_LOG（2026-11-18 第二条）、ERROR_LOG（E-027）、PLAN（v75 + §10）同步；`build-docs.mjs` 重建 `docs-content.js`。
- 自测：`verify-native` 817 项全绿，`cloud-check` 43 项全绿。

---

## [v1.23.0] - 2026-11-18 · Phase 6 全栈接入：云端层、AI 助教、反馈箱在线化与部署脚手架

### Added
- 云端接入层 `assets/js/cloud.js`（零依赖、`file://` 可用）：Supabase Auth（注册 / 登录 / 登出 / access_token 自动续期）、PostgREST 最小封装、四类学习数据双向同步、Realtime 订阅（失败自动回退 3 分钟轮询）、未配置 / 未登录 / 断网三级静默降级。
- 账号入口 `assets/js/auth-ui.js`：工具栏状态点（离线 / 未登录 / 已同步 / 待同步）、登录注册弹窗、立即同步、从云端恢复、清空本机数据、退出登录；中英双语，窄屏只留状态点。
- 配置模板 `assets/js/cloud-config.js`：留空即纯离线，填入 URL + anon key 自动升级在线模式；默认不含任何密钥。
- AI 助教：`assets/js/ai-tutor.js` 左下角浮标 + 对话面板（自动附带当前词条上下文、4 个建议问法、限流 / 断网 / 未配置分别提示、每条回答带免责声明）；`workers/ai-tutor/` Cloudflare Worker（Workers AI、CORS 白名单、KV 限流 10 次/分、8 个错误码、不记录问题全文）。
- 数据库 `docs/supabase/schema.sql` 全量重写：8 张表（`profiles` / `user_progress` / `user_favorites` / `user_mistakes` / `user_quiz_stats` / `sr_cards` / `feedback` / `admins`）、全表 RLS、6 个 RPC、`updated_at` 触发器、Realtime publication；幂等可重复执行。
- 反馈箱在线模式：提交走 `submit_feedback` RPC 并返回 6 位查询码，凭码查询状态与回复；离线仍落本机，云端失败自动回退并提示。
- 管理端云端模式：Supabase Auth 管理员登录 + `public.admins` 白名单，经 `admin_list_feedback` / `admin_reply_feedback` 读写；本地口令门保留为纯离线回退。
- 部署脚手架：`vercel.json`（静态站点映射 + 安全响应头）、`.gitignore`、`docs/DEPLOY.md`（Supabase / Worker / GitHub / Vercel 五步上线 + 验收清单 + 排障）。
- 自测：新增 `cloud-check.mjs` **43 项**（未配置降级、会话状态、字段映射、merge / replace、RPC 参数、断网不推送、密钥扫描）；`verify-native.mjs` 新增 **23 项** Phase 6 断言（脚本注入顺序、8 表 / RLS / 6 RPC、Worker 错误码、DOM 浮层、反馈箱模式徽标）。

### Changed
- 反馈类型提交值由翻译文案改为稳定 id（`err` / `use` / `idea` / `other`），避免中英切换后管理端映射错位；管理端兼容旧中文标签。
- `admin_reply_feedback` 的 `p_reply = null` 表示「只改状态、保留原回复」，供标记已读 / 未读复用。
- 23 个 HTML 统一注入 4 个新脚本；缓存指纹 `?v=1128` → `?v=1129`（189 处）。

### Docs
- 新增 `docs/DEPLOY.md`；重写 `docs/supabase/README.md`（8 表 / 安全模型 / RPC / Realtime / 同步策略 / 运维）。
- 同步 CHANGELOG（本记录）、DEV_LOG（2026-11-18 第一条 + 阶段总览行）、DECISIONS（D-053）、ERROR_LOG（E-026）、PLAN（v74 + §4 / §5 / §6 + §10）、PROJECT_SCOPE（v6.35 + §11）。
- `build-docs.mjs` 重建 `docs-content.js`（15 个文档：md 12 / json 2 / sql 1，渲染自检通过）。
- 自测结果：`verify-native` **817 项全绿**，`cloud-check` **43 项全绿**。

---

## [v1.22.0] - 2026-11-18 · Phase 0–5 全部通过人工验收，阶段状态正式收口

### Changed
- 项目阶段状态收口：`PLAN.md` §4 阶段总览、§5 各 Phase 标题、§6 Human Gate 一览统一标记 **Phase 0–5 全部「✅ 已通过」**；§6 表新增「状态（2026-11-18）」列，Phase 6–9 明确为「⬜ 未开始」。
- `DEV_LOG.md`「附 · Phase 映射」由早期 6 阶段口径（Phase 5 = 打磨、Phase 6 = 后端）重写为与 PLAN 一致的 **10 阶段派生视图**，并新增验收状态列；阶段总览补 v1.22.0 行。
- `PROJECT_SCOPE.md` §八 成功标准勾选已由验收覆盖的 4 项（手机与电脑可用 / 检索准确 / 学习闭环 / 互动可视化）；300+ 术语、全栈联通、社区与个性化、课程评分仍保持未勾选。

### Docs
- `docs/PLAN.md` → v73：文首版本行、§4 / §5 / §6、§10 变更记录与末尾基线版本同步。
- `docs/PROJECT_SCOPE.md` → v6.34：`aligned_with` / `supersedes`、§八 成功标准、§11 变更管理、末尾基线版本同步。
- `docs/DECISIONS.md` → 新增 `D-052`：验收结果以用户明确声明为记录依据，PLAN / DEV_LOG / CHANGELOG 三处留痕；DEV_LOG 阶段映射表降级为 PLAN 的派生视图。
- `docs/ERROR_LOG.md` → 新增 `E-025`：阶段映射表与主计划版本漂移，导致进度出现两套口径。
- 本轮**无产品代码改动**，仅重建站内文档数据 `assets/js/data/docs-content.js`（随六份 md 更新）；23 个 HTML 缓存指纹 `?v=1127` → `?v=1128`（189 处）；`verify-native.mjs` **794 项全绿**。

---
## [v1.21.7] - 2026-11-18 · 全站「返回 XXX」按钮统一为醒目主色胶囊

### Changed
- 新增统一返回样式 `.nb-back`：实心主色底 + 白字 + `←` 箭头（伪元素）+ 字重 600 + 投影；悬停加深并向左微移 2px，键盘焦点带 2px 焦点环。
- 交互式脑解剖 / 认知仿真 / 脑电信号 / BCI 专区 4 个实验页与文档详情页的「返回互动实验室 / 返回文档列表」由 `btn btn-ghost` 改为 `btn nb-back`（`btn-ghost` 此前在样式表中并无定义，这些按钮一直是透明的普通按钮）。
- 学习工具异常态（`quiz-run.html` / `spelling-run.html` 无进行中会话时）的「返回学习工具」同步改为 `btn nb-back`。
- 词条页顶部动态返回键 `.btn-back` 由淡色小胶囊改为同一套实心主色胶囊（箭头仍用伪元素，切换语言不丢失）；词条不存在页的「返回术语检索」补 `nb-back`。
- 选题页（`quiz.html` / `spelling.html`）的描边返回键由 1px 加粗到 2px，补浅主色底与投影，仍让位于表单里的「开始」按钮。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-18 第二条 + 阶段总览行）、`docs/DECISIONS.md`（`D-051`）、`docs/ERROR_LOG.md`（`E-024`）、`docs/PLAN.md`（v72 + §10）、`docs/PROJECT_SCOPE.md`（v6.33 + §11）。
- 全部 23 个 HTML 缓存指纹 `?v=1126` → `?v=1127`（189 处引用）；`node --check` 通过；`verify-native.mjs` 新增 13 项「返回键统一」断言，**781 → 794 项全绿**。

---

## [v1.21.6] - 2026-11-18 · 交互式脑解剖：从词条页返回时原样恢复离开时的画面

### Added
- `page-lab-anatomy.js` 新增**视图状态记忆**：把 3D 相机位置与观察目标、真实解剖 / 分区部件模式、选中脑区（含真实皮层表面点选的「近似归属」提示）、每个部件的位置与旋转、全部拆分状态、自动旋转、单部位旋转模式、部位操作菜单（含菜单坐标）、2D 皮层表面 / 皮层下分层、标注开关、页面滚动位置统一快照为一份会话级存档。
- 新增**返回标记**机制：只有从本页点「相关词条」跳到 `term.html` 时才写标记；带着标记回到本页即恢复存档。存档写入 `sessionStorage`（不可用时回退 `localStorage`），返回标记 30 分钟内有效。
- `NB.labAnatomy` 导出 `state()` / `saveState()` / `clearState()`，供自测与调试读取当前画面快照。

### Changed
- 从词条页返回交互式脑解剖（浏览器返回或词条页「返回 交互式脑解剖」）时不再回到默认视角：旋转 / 缩放后的 3D 视角、拆分后挪动过的部件、选中的脑区与右侧说明、2D 分层与标注、页面滚动位置全部保持离开瞬间的状态。
- 从导航栏、「返回课程实验区」等其他入口进入，或超过 30 分钟的陈旧存档，仍显示默认画面；去往非词条页面时立即清空存档，避免旧视角污染下一次进入。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-18 条目 + 阶段总览行）、`docs/DECISIONS.md`（`D-050`）、`docs/ERROR_LOG.md`（`E-023`）、`docs/PLAN.md`（v71 + §10）、`docs/PROJECT_SCOPE.md`（v6.32 + §11）。
- 全部 23 个 HTML 缓存指纹 `?v=1125` → `?v=1126`（189 处引用）；`node --check` 通过；`verify-native.mjs` 新增 32 项「返回恢复 / 默认进入 / 清档」断言，**749 → 781 项全绿**。

---

## [v1.21.5] - 2026-11-16 · 学习工具：答题结束后的返回键改为醒目主按钮

### Changed
- 答题结束页（`quiz-result.html` / `spelling-result.html`）的「返回学习工具」由幽灵按钮（`btn-ghost`）改为**实心主色胶囊按钮**：`qz-back-btn--solid`，字号升到 `--t-base`、字重 600、内边距 `0.55rem 1.2rem`、加 `--shadow-lg` 投影，左侧带 `←` 箭头，成为结果页最显眼的出口。
- 选题页（`quiz.html` / `spelling.html`）的同类返回键改为**主色描边胶囊**：`qz-back-btn--outline`，明显但让位于表单里的「开始」按钮；深色主题下描边与文字改用 `--link` 亮蓝，悬停填充反色。
- `.qz-footer` 增加 `gap: 0.75rem` 与 `flex-wrap: wrap`，修复「再测一次 / 返回学习工具」两个按钮此前紧贴的问题，窄屏可换行。
- 箭头用 `.qz-back-btn::before` 伪元素绘制（`content: "\2190"`），避免被 `applyI18n` 的 `textContent` 覆盖而在切语言后消失。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-16 第二条 + 阶段总览行）、`docs/DECISIONS.md`（`D-049`）、`docs/PLAN.md`（v70 + §10）、`docs/PROJECT_SCOPE.md`（v6.31 + §11）；本轮无新增可复用错误（`ERROR_LOG.md` 不新增）。
- 全部 23 个 HTML 缓存指纹 `?v=1124` → `?v=1125`（189 处引用）；`learning-flow-check.mjs` 扩充到 **48 项全绿**（新增实心背景、白字、字号、胶囊圆角、层级与伪元素箭头断言）；`verify-native.mjs` **749 项全绿**。

---

## [v1.21.4] - 2026-11-16 · 学习工具：答题过程中不显示返回键，答题结束才返回学习工具

### Changed
- 答题过程页 `quiz-run.html` / `spelling-run.html` 不再显示底部返回入口：`#qz-footer` / `#sp-footer` 默认带 `hidden`，正常答题时完全隐藏「去选题」「返回学习工具」两个按键，避免作答中途误点退出导致答案丢失。
- 只有在「没有进行中的测验 / 训练」这一异常态下，`page-quiz-run.js` / `page-spelling-run.js` 才取消 footer 的 `hidden` 并显示返回入口，保证异常页面仍有出口。
- 答题结束页 `quiz-result.html` / `spelling-result.html` 的返回按钮去掉 `data-back` 智能返回，固定链接到 `learn.html`（学习工具界面）；此前 `data-back` 会按浏览历史回退，提交后点击有可能退回答题页（会话已清空，只显示「没有进行中的测验」）。
- 选题页 `quiz.html` / `spelling.html` 的返回入口同样去 `data-back`，静态文案由「返回学习中心」统一为「返回学习工具」（与 i18n 键 `learn.backToLearn` 一致）。

### Fixed
- `style.css` 新增 `.qz-footer[hidden] { display: none; }`：`.qz-footer { display: flex }` 会覆盖全局 `[hidden]`，不显式声明则答题页的隐藏无效（同类隐患见 `E-021`，本轮见 `E-022`）。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-16 条目 + 阶段总览行）、`docs/DECISIONS.md`（`D-048`）、`docs/ERROR_LOG.md`（`E-022`）、`docs/PLAN.md`（v69 + §10 变更记录）、`docs/PROJECT_SCOPE.md`（v6.30 + §11 变更管理）。
- 全部 23 个 HTML 缓存指纹 `?v=1122` → `?v=1124`（189 处引用）；`node --check` 通过；新增 `learning-flow-check.mjs` 行为自测 **32 项全绿**（答题页返回栏 computed `display: none`、无会话时恢复显示、结果页/选题页固定 `learn.html` 且无 `data-back`）；`verify-native.mjs` **749 项全绿**。

---

## [v1.21.3] - 2026-11-12 · 记忆广度实验：新数字串出现前清空填写框

### Fixed
- `page-lab-cogsim.js` 的 `digitShow()` 在生成并显示新数字串之前清空 `#digit-input`；`digitAnswer()` 读取答案后立即清空，提交瞬间起填写框就不再保留上一轮内容。
- `style.css` 新增 `.lab-digit-input-row[hidden] { display: none; }`：此前 `.lab-digit-input-row { display: flex }` 与全局 `[hidden] { display: none }` 特异性相同且位于其后，`hidden` 属性被覆盖，回忆填写行在数字显示阶段仍然可见、旧答案会残留到下一串。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-12 条目 + 阶段总览）、`docs/ERROR_LOG.md`（`E-021` + 索引）、`docs/PLAN.md`（v68 + §10）；本轮无新增决策。
- 不涉及范围与交付物变化，`docs/PROJECT_SCOPE.md` 不升版。
- 全部 23 个 HTML 缓存指纹 `?v=1121` → `?v=1122`（189 处引用）。自测：`cogsim-check.mjs` 新增 12 项记忆广度断言、**81 项全绿**，`verify-native.mjs` **749 项全绿**。

---

## [v1.21.2] - 2026-11-12 · 反应时实验支持空格键作答

### Added
- 简单反应时支持空格键：方块出现后按空格等同于点击「反应」；提前按仍提示「太早了」并重排本轮，不计入成绩。
- 「反应」按钮右下角新增 `Space` 键帽角标，题面下方新增提示行「键盘作答：方块出现后按空格键（也可点「反应」）」（`labCogsim.rtKeys`，中英同步）；选择模式自动隐藏该提示。
- `rtAnswer` 增加 60ms 去抖：吸收空格 `keydown` 与「反应」按钮聚焦时浏览器合成的默认 `click`，保证一次物理按键只计一次。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-12 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-047` + 索引）、`docs/ERROR_LOG.md`（`E-020` + 索引）、`docs/PLAN.md`（v67 + §10）。
- 不涉及范围与交付物变化，`docs/PROJECT_SCOPE.md` 不升版。
- 全部 23 个 HTML 缓存指纹 `?v=1120` → `?v=1121`（189 处引用）。自测：`cogsim-check.mjs` **69 项全绿**，`verify-native.mjs` **749 项全绿**。

---

## [v1.21.1] - 2026-11-12 · Stroop 色块支持键盘 Q/W/E/R 作答

### Added
- Stroop 任务新增键盘作答：Q=红、W=蓝、E=绿、R=黄，与色块上的键帽角标一致；实验进行中按下对应键等同于点击色块，同样有对/错描边反馈。
- 四个色块右下角新增键帽角标（Q/W/E/R），题面下方新增提示行「键盘作答：Q 红 · W 蓝 · E 绿 · R 黄（也可直接点色块）」；中英文案同步（`labCogsim.stroopKeys`）。
- 键帽用 `.lab-color-btn[data-key]::after { content: attr(data-key) }` 渲染，避免 `data-i18n` 的 `textContent` 覆盖清空子元素；键盘按下时对应色块有短暂 `key-down` 下压反馈。
- `NB.labCogsim.state().stroop` 增加 `locked` 字段，便于自测判断作答是否被接受。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-12 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-046` + 索引）、`docs/ERROR_LOG.md`（`E-019` + 索引）、`docs/PLAN.md`（v66 + §10）。
- 修复 `docs/DECISIONS.md` 的历史结构问题：`D-045` 曾被插进「维护约定」第 2 条中间，`D-040` / `D-043` / `D-044` 错位在决策索引之前；本轮恢复约定原文并按编号归位（条目内容未改）。
- 不涉及范围与交付物变化，`docs/PROJECT_SCOPE.md` 不升版。
- 全部 23 个 HTML 缓存指纹 `?v=1119` → `?v=1120`（189 处引用）。自测：`cogsim-check.mjs` **63 项全绿**，`verify-native.mjs` **747 项全绿**。
- 版本序列说明：`v1.21.0`（Phase 5 内容生态）与 `v1.20.3`（反应时修正）由并行会话产出，编号与实际先后不一致；按「旧条目不改写」保留原样，自本轮起接续 `v1.21.1`。

---

## [v1.21.0] - 2026-11-11 · Phase 5 内容生态全部上线（BCI 专区 / 工程对照 / 前沿速览）

### Added
- 新增第 7 个主导航栏目「内容生态」（`explore.html`）：三板块入口卡、数据概览（5 主题 / 24 术语 / 20 行对照 / 13 条前沿）与三步使用顺序；三个子页统一高亮该栏目。
- `bci.html` BCI 专区：5 个主题卡聚合 24 条站内术语、六环节链路（采集 → 预处理 → 特征 → 解码 → 输出 → 反馈）、4 个案例入口跳转 `lab-bci.html?case=1..4`。
- `bridge.html` 神经科学↔工程对照：5 组 20 行双列对照（神经机制 / 工程实现 / 为什么这么对应），支持分组筛选，左列全部跳转词条详情页。
- `frontier.html` 科研前沿速览：13 条研究按日期倒序，含原题、项目自撰摘要、期刊 / 作者 / DOI 链接与关联词条，支持 5 类研究类型筛选。
- 新增页面脚本 `page-explore.js` / `page-bci-zone.js` / `page-eng-map.js` / `page-frontier.js` 与对应样式（`style.css` 内容生态段，含 760px 断点与 reduced-motion）。

### Changed
- 主导航由 6 项增至 7 项（「内容生态」位于「教材导读」与「关于」之间）；三个子页通过 `mountShell('explore')` 保持栏目高亮。
- 帮助导览「栏目导航」中英文案同步改为 7 栏目，并补充「内容生态」及其三个子页说明。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-11 v1.21.0 条目 + 阶段总览）、`docs/DECISIONS.md`（D-045 + 索引）、`docs/ERROR_LOG.md`（E-018 + 索引）、`docs/PLAN.md`（v65 + §1.2 + §2.3 + §4 + §10）、`docs/PROJECT_SCOPE.md`（v6.29 + §4.5 / §4.6 / §8 / §9 / §11）。
- 自测 712 → **744 项全绿**；全部 23 个 HTML 缓存指纹 `?v=1116` → `?v=1117`。

---
## [v1.20.3] - 2026-11-11 · 反应时实验：按键更名「反应」+ 位置固定

### Changed
- 反应时实验的反应按键文案改为「反应」：原 `#rt-react` 的 `data-i18n` 误指向 `labCogsim.rtModeSimple`（「简单反应时」），页面加载后文本被覆盖。新增独立键 `labCogsim.rtReact`（zh「反应」/ en「React」），先回写 `data/i18n/zh.json`、`en.json`，再重跑 `build-data.mjs` 生成 `i18n.js`（键集合一致）。
- 一并修复选择模式的红/蓝按键：`#rt-red`、`#rt-blue` 同样误用 `labCogsim.rtModeSimple`，选择模式下会显示成两个「简单反应时」。新增 `labCogsim.rtRed`（红 / Red）、`labCogsim.rtBlue`（蓝 / Blue）并回写数据源。
- 反应按钮位置固定，不随方块出现而位移：`.lab-rt-stim[hidden]` 与 `.lab-rt-ready[hidden]` 改为 `display: block; visibility: hidden`，隐藏时仍保留 7rem 刺激位与一行提示的高度；`.lab-rt-actions` 预留 `min-height: 2.6rem`。方块出现/消失时整行按钮不再上下跳动，选择模式的红/蓝按钮同样稳定。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-11 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-044`）、`docs/ERROR_LOG.md`（`E-017`）、`docs/PLAN.md`（v64 + §10）。
- 修正 `docs/DECISIONS.md` 维护约定段落被历史条目插入打断的结构问题（仅移动 D-040 / D-043 的位置，条目内容未改）。
- 不涉及范围与交付物变化，`docs/PROJECT_SCOPE.md` 不升版。
- 全部 23 个 HTML 缓存指纹 `?v=1118` → `?v=1119`（189 处引用）。自测：`cogsim-check.mjs` **59 项全绿**，`verify-native.mjs` **745 项全绿**。

---
## [v1.20.2] - 2026-11-11 · 修复 Stroop 第 2 题起无法作答

### Fixed
- 修复认知实验 `lab-cogsim.html` 的 Stroop 任务从第 2 题起无法作答：`stroopAnswer()` 在每次作答后调用 `stroopSetButtons(false)` 禁用四色按钮，而 `stroopTrial()` 出下一题时没有重新启用，导致第 1 题答完后按钮一直处于 `disabled` 状态，点击无任何响应。现在每道新题渲染后统一调用 `stroopSetButtons(true)`，20 题可连续作答；作答瞬间仍会立即禁用以防连点，结束后按钮保持禁用并正确恢复「再来一轮」。
- 修复简单 / 选择反应时实验的「提前点击」提示从未显示：`rtAnswer()` 先写入 `rtTooSoon` 文案再调用 `rtTrial()`，而 `rtTrial()` 会把结果行重写为试次计数，提示被立即覆盖。改为先重排本轮，再把「太早了」与试次计数合并显示，提前点击仍不计入成绩。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-11 条目 + 阶段总览）、`docs/ERROR_LOG.md`（`E-016`）、`docs/PLAN.md`（v63 + §10）。
- 本轮为纯缺陷修复，无方案取舍：`docs/DECISIONS.md` 无新增；不涉及范围与交付物变化，`docs/PROJECT_SCOPE.md` 不升版。
- 全部 23 个 HTML 缓存指纹 `?v=1116` → `?v=1117`（共 189 处引用）。自测：`cogsim-check.mjs` **54 项全绿**，`verify-native.mjs` **712 项全绿**。

---
## [v1.20.1] - 2026-11-11 · 迭代记录约定常驻化（后续每轮自动同步 md 并记账）

### Changed
- `version-changelog` skill 的 description 与触发条件新增「后续迭代，同步更新相关 md 文件，并记入版本迭代日志」这类说法，并明确该约定对**后续所有迭代默认常驻生效**：用户只需在开头声明一次，之后每轮无需重复提醒。
- 触发条件新增「用户在迭代前定下常驻规矩」一条，并补充「常驻性说明」，避免因当轮用户未提而跳过记录（小修小改、纯文档变更、仅改 skill 或约定同样必须记录）。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-11 条目 + 阶段总览）、`docs/PLAN.md`（v62 + §10）、`docs/PROJECT_SCOPE.md`（v6.28 + §11）。
- 本轮无产品代码改动，全部 19 个 HTML 缓存指纹保持 `?v=1116`；自测 **712 项全绿**。

---
## [v1.20.0] - 2026-11-10 · 左上角「返回」按来源页面命名并可回到上一页

### Added
- `core.js` 新增智能返回：读取上一页记录（`sessionStorage['nb.prevPage']`，含页面地址与 H1 标题）与同站 `document.referrer`，把按钮文案改为「返回 + 来源页面名」，如「返回术语检索」「返回交互式脑解剖」；点击时若有来源则 `history.back()` 回到上一页，无来源时回落到按钮原有链接。
- 词条详情页 `page-term.js` 的左上角返回按钮接入 `NB.initBack`，无来源时回落到 `terms.html`。
- 11 个页面（4 个互动实验室、3 个测验页、3 个拼写页、`docs.html`）的返回链接补充 `data-back` 标记，统一由 core 初始化。
- `data/i18n/*.json` 新增 `action.backTo`（中「返回{name}」/ 英「Back to {name}」）。

### Changed
- `data/i18n/zh.json` / `en.json` 与生成物 `assets/js/data/i18n.js` 重新对齐（此前手工改生成物导致 `explode` 等键在数据源中仍是旧文案），并重跑 `build-data.mjs`。

### Fixed
- 生成物与数据源文案漂移：`explode` / `merge` / `reset` / `part*` 等键以当前页面实际文案回写 JSON，避免下次构建回退。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-10 v1.20.0 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-043` + 索引）、`docs/ERROR_LOG.md`（`E-015` + 索引）、`docs/PLAN.md`（v61 + §10）、`docs/PROJECT_SCOPE.md`（v6.27 + §11）。
- 自测新增 3 项断言（来源命名 / 来源地址 / 无来源保留默认），**691 → 694 项全绿**；全部 19 个 HTML 缓存指纹 `?v=1115` → `?v=1116`；重跑 `build-docs.mjs`。

---
## [v1.19.1] - 2026-11-10 · 单部位旋转锁定其他部位与相机

### Fixed
- 旋转单个解剖部位时其他部位会跟着动：`on3dDown` 增加旋转模式前置分支，只有**当前选中部位**可进入旋转；命中其他部位或空白处时退出旋转模式并清空选中，且不在同一手势里选中或拖动其他部位（其他部位保持锁定）。
- 旋转期间整颗脑仍可能在转：`setRotateMode(true)` 暂存并关闭 `OrbitControls.autoRotate` 与 `enableDamping`，退出时恢复，自动旋转按钮同步为未按下；`toggleAutoRotate` 在旋转模式下先退出单部位模式，避免按钮与控制器状态不一致。

### Changed
- 拖拽指针使用画布 `setPointerCapture` / `releasePointerCapture`，拖拽经过部位菜单浮层时不再丢失指针。
- 旋转模式提示文案更新为「点该部位以外的地方或再次点『旋转中』退出」（中英同步）。

### Docs
- 同步 `docs/DEV_LOG.md`（2026-11-10 v1.19.1 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-042` + 索引）、`docs/PLAN.md`（v60 + §10）、`docs/PROJECT_SCOPE.md`（v6.26 + §11）。
- 自测新增 2 项断言（旋转中切换部位即退出、锁定期间其他部位姿态不变），**689 → 691 项全绿**；全部 19 个 HTML 缓存指纹 `?v=1114` → `?v=1115`。

---
## [v1.19.0] - 2026-11-10 · 脑解剖单部位旋转 / 复位 + 全局按钮更名 + 移除加载提示

### Added
- 3D「分区部件」模式新增**单部位操作菜单**：点选某一部位后，在画布内该位置弹出「旋转 / 复位」小面板（含部位名与操作提示，自动避开画布边缘）。点「旋转」进入该部位的旋转模式（按钮文案变「旋转中」、`aria-pressed="true"`），拖拽时按相机左右轴 / 上下轴合成四元数，绕该部件自身包围盒中心旋转；点「复位」只恢复该部件的位置与角度并退出旋转模式。实现见 `D-041`。
- `page-lab-anatomy.js` 新增可测接口：`resetPart` / `rotateMode` / `setRotateMode` / `partMenuVisible` / `partMenuRegion` / `partState` / `partObject` / `cameraObject` / `cameraState`。

### Changed
- 3D 底部控制按钮更名：「拆分」→「全部拆分」、「复位」→「全部复位」，展开态「合并」→「全部合并」（i18n 中英同步：Explode all / Merge all / Reset all）。
- 「全部复位」**不再改变观察视角**：移除相机位置与 `controls.target` 回写，仅恢复部件位置 / 角度与拆分状态。
- 脑解剖页 meta 描述、3D 画布 `aria-label`、引擎说明、拖拽提示与 `labAnatomy.desc` 同步为新交互（中英）。

### Removed
- 移除 3D 画布上的「3D 场景加载中…」提示文字：`#anat3d-loading` 改为空的隐藏节点，仅在 WebGL 不可用时显示降级说明。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-10 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-041` + 索引）、`docs/ERROR_LOG.md`（`E-014` + 索引）、`docs/PLAN.md`（v59 + §10）、`docs/PROJECT_SCOPE.md`（v6.25 + §11）。
- 自测新增 12 项断言（菜单结构 / 按钮文案 / 旋转模式 / 单部位复位 / 视角保持 / 加载文字移除），**677 → 689 项全绿**；全部 19 个 HTML 缓存指纹 `?v=1113` → `?v=1114`；重跑 `build-docs.mjs`。

---
## [v1.18.1] - 2026-11-10 · 搜索输入被清空修复 + 迭代记录规则常驻化

### Fixed
- 术语检索页 `page-terms.js` 的 `pageshow` 监听器无条件执行 `renderFav() / render()`：首次加载的 `pageshow` 在用户开始输入后才触发，`render()` 中的 `input.value = state.q` 把刚输入的搜索词重置为空，导致检索结果恒为全部 110 条。改为仅在 `e.persisted`（bfcache 恢复）时刷新，见 `E-013`。

### Added
- 项目根新增 `AGENTS.md` 常驻规则：把「每次版本迭代与错误修正都必须同步更新相关 md」从 skill 提升为每轮自动生效的约定，明确 CHANGELOG / DEV_LOG / DECISIONS / ERROR_LOG / PLAN / PROJECT_SCOPE 的同步义务与交付前校验清单，见 `D-040`。

### Docs
- 同步 `docs/CHANGELOG.md`（本记录）、`docs/DEV_LOG.md`（2026-11-10 条目 + 阶段总览）、`docs/DECISIONS.md`（`D-040` + 索引）、`docs/ERROR_LOG.md`（`E-013` + 索引）、`docs/PLAN.md`（v58 + §10）、`docs/PROJECT_SCOPE.md`（v6.24 + §11）。
- 自测 673 通过 / 4 失败 → **677 项全绿**（`✗ 搜索 P300 有结果` 等 4 项恢复）；全部 19 个 HTML 缓存指纹 `?v=1112` → `?v=1113`。

---
## [v1.18.0] - 2026-11-09 · 「学习中心」更名「学习工具」+ 首页模块精简

### Changed
- 栏目更名：「学习中心」→「学习工具」；顶部主导航「学习」→「学习工具」（中英同步，`nav.learn` / `learn.title` / `learn.backToLearn`）。
- `learn.html`：页面标题、`<title>`、meta 描述同步更名；页内二级标题「学习工具」改为「选择工具」，避免与一级标题重复。
- `core.js` 帮助导览文案（中英）同步改为「学习工具 / Learning tools」。

### Removed
- 首页移除「学习工具」模块（2 张工具卡 + 「进入」按钮）与「互动实验室」模块（4 张工具卡 + 「进入」按钮），首页保留 Hero 检索、每日一词、学习进度三块；入口统一走顶部导航。
- `page-home.js` 移除对应的入口统计渲染逻辑（`renderLearnEntry`）。

### Docs
- verify-native.mjs：主导航文案、学习页高亮断言更新；首页断言改为「两模块已移除 + 核心模块保留 + 无脚本错误」，自测 674 → 677 项全绿；全部 19 个 HTML 缓存指纹 ?v=1112。

---
## [v1.17.0] - 2026-11-09 · 胼胝体 / 丘脑改为真实分割模型

### Added
- `assets/vendor/three/brain-deep.js`：由 **MNI152 aseg 真实分割**（TemplateFlow `tpl-MNI152NLin2009cAsym_res-01_seg-aseg_dseg.nii.gz`，CC BY 4.0）提取的三维网格——胼胝体（FreeSurfer 标签 251–255 五段合并，982 顶点 / 1960 三角面）、左丘脑（标签 10，1090 顶点 / 2176 面）、右丘脑（标签 49）。
- 生成流程：NIfTI-1 解析（int16、srow 体素→RAS）→ 2× 降采样二值化 → **Surface Nets** 等值面提取 → Laplacian 平滑 3 次 → 与皮层做**逐轴仿射对齐**（MNI152 皮层 bbox → pial 皮层 bbox）→ 转轴 y-up → 导出 JS。

### Changed
- 3D 部件模式与真实模式中的胼胝体、丘脑改用上述真实网格（`buildPart` 新增 `mesh` 类型，坐标已与 pial 同空间故不乘 BASE_SCALE，`DoubleSide` 渲染）；数据缺失时回退原程序化形态。
- 2D 侧视与矢状剖面的胼胝体 / 丘脑轮廓改为真实网格投影（`brain-2d.js` 新增 `deep` 字段，733 / 409 字符路径）。
- i18n `engineNote` 与新增 `deepSource` 键如实标注：胼胝体 / 丘脑为真实分割，海马 / 侧脑室 / 小脑 / 脑干仍为按解剖形态建模。

### Docs
- verify-native.mjs 新增 6 项深部结构断言（数据本地化 / 真实来源 / 面数 / 场景顶点数 / 2D 与剖面投影注入）；自测 667 → 674 项全绿；指纹 ?v=1112。

---
## [v1.16.0] - 2026-11-09 · 2D 解剖图 / 矢状剖面改用真实网格投影 + 深层结构解剖化

### Changed
- **「2D 示意图」→「2D 解剖图」**：皮层外形与额叶 / 顶叶 / 颞叶 / 枕叶 4 个分区轮廓改由 fsaverage5 pial 真实网格**侧视投影**生成（三角形栅格化 → 形态学闭运算 → marching squares 边界追踪 → 道格拉斯-普克简化；侧视轮廓 123 点、额叶 114 / 顶叶 93 / 颞叶 184 / 枕叶 109 点），新增 `assets/data/brain-2d.js` 与生成脚本 `gen-2d-anatomy.mjs`；数据缺失时保留内置回退路径。
- **「剖面示意」→「矢状剖面」**：内侧面轮廓改由真实网格**近中线三角面投影**生成（4781 个三角面，283 点闭合轮廓），深层结构叠加其上。
- **3D 深层结构解剖化**：胼胝体由圆环改为沿 CatmullRom 弓形曲线的扁平带（ribbon，截面压扁 0.42）；侧脑室由两个球改为双侧 C 形弯管（半透明）；小脑改为球面顶点按前后向正弦位移的**叶片形态**（72×48 细分）；脑干锥台增加桥脑膨大。
- 小脑 / 脑干 / 深部结构仍为按解剖形态建模（pial 皮层数据本身不含这些结构），页面说明与文档均如实标注。
- i18n：`labAnatomy3d.view2d`「2D 示意图」→「2D 解剖图」、`viewSection`「剖面示意」→「矢状剖面」、`desc` / `sectionDesc` / `engineNote` 同步更新（中英）。

### Docs
- verify-native.mjs 13.7 新增 11 项 2D/剖面断言（数据本地化 / 路径注入 / 轮廓点数 / 分区路径 / 小脑脑干形态轮廓 / 按钮文案），自测 656 → 667 项全绿；全部 19 个 HTML 缓存指纹 ?v=1110；PLAN v54 → v55；PROJECT_SCOPE v6.20 → v6.21；验收清单条目更新。

---
## [v1.15.0] - 2026-11-09 · 交互式脑解剖：表面分区全部改用真实网格 + 拖动异常缩放真正修复

### Changed
- **皮层表面数据修正**：转轴为 three.js y-up（x 左右 / y 上下 / z 前后，+z 为前），修复此前模型「躺倒」的轴向错误；归一化直径由 1.9 调整为 1.25，与程序化内部结构（BASE_SCALE）尺寸统一。
- **分区部件模式全部改用真实解剖网格**：额叶（11686 面）/ 顶叶（9306）/ 颞叶（12554）/ 枕叶（7414）由 fsaverage5 pial 表面按 Talairach 启发式分区切割为 4 个独立真实网格部件（含沟回，DoubleSide 渲染）；小脑 / 脑干（pial 皮层表面不含）与胼胝体 / 丘脑 / 海马 / 侧脑室（深部结构）回退程序化几何，位置尺寸与真实脑对齐。
- i18n `labAnatomy3d.engineNote` 更新：明确真实网格分区范围与示意几何范围。

### Fixed
- **拖动解剖块异常缩放的真正根因修复**：部件几何位于子 mesh（`mesh.position`），group `position` 恒为 (0,0,0)；原拖动逻辑以 group.position 为参考点——拖动平面错误地过场景原点、`dragOffset` 取「命中点 − 原点」，第一次移动即把部件甩飞（透视下呈异常缩放）。现改为：按下时以**部件世界包围盒中心**建立垂直于视线的固定平面，记录起点交点与 group 位置快照；移动时按**同平面交点差值**平移 group（相对位移），部件深度、大小不变，无跳变。

### Docs
- verify-native.mjs 13.7 扩展（区域归属新坐标 / 4 个皮层叶真实面数 / 真实网格面数合计 40960 / 小脑脑干回退 0），自测 650 → 656 项全绿；全部 19 个 HTML 缓存指纹 ?v=1109；docs/PLAN.md v53 → v54；PROJECT_SCOPE.md v6.19 → v6.20；DEV_LOG 追加条目。

---
## [v1.14.0] - 2026-11-09 · 交互式脑解剖升级：真实皮层表面（fsaverage5 pial）+ 拖动修复

### Added
- **真实皮层表面模式（默认）**：three.js 渲染 FreeSurfer **fsaverage5 pial** 皮层表面（20484 顶点 / 40960 三角面，含真实脑沟脑回），数据离线内嵌 `assets/vendor/three/brain-surface.js`（来源：PennLINC/fsaverage5-Schaefer2018 的 lh.pial / rh.pial，FreeSurfer t4 二进制 → 归一化转换脚本 `.deepworks/tmp/patch-v50/pial2obj.mjs`）。
- **表面点选说明**：点击皮层表面 → 命中三角面中心按 Talairach 坐标启发式近似归属 6 大表面脑区（额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干），右侧信息面板显示名称 / 说明 / 关键词 / 相关词条，并标注「（近似归属）」。
- **双模式切换**：「真实解剖 / 分区部件」——真实解剖模式默认展示含沟回的皮层表面（旋转 / 缩放 / 复位 / 自动旋转 / 点选说明）；分区部件模式保留程序化 10 部件（拆分 / 挪动 / 复位 / 点选说明），两模式切换按钮实时生效。
- i18n 新增 `labAnatomy3d.modeReal / modeParts / surfaceHint / regionApprox / surfaceSource` 键（zh/en）；引擎说明更新为皮层表面来源说明。

### Fixed
- **拖动解剖块异常缩放**：根因是拖动部件期间渲染循环仍每帧调用 `OrbitControls.update()`，自动旋转 / 惯性阻尼继续转动相机，导致部件相对指针漂移、透视下出现缩放感；现拖动时暂停相机控制（`controls.update()` 仅在非拖动时调用），部件沿视平面拖动、深度不变，无缩放感。

### Changed
- style.css 新增 3D 模式切换按钮组 / 选中标签 / 禁用按钮样式。
- verify-native.mjs 13.7 块扩展：皮层表面数据本地化与页面引用 / 顶点 20484 / 三角面 40960 / 默认模式 real / 区域归属（额叶 / 枕叶 / 脑干）/ 模式切换与拆分按钮禁用态；13.6 CSS 断言新增 3D 模式类；自测 **637 → 650 项全绿**。
- 全部 19 个 HTML 缓存指纹 `?v=1107` → `?v=1108`。

### Docs
- docs/PLAN.md v52 → v53；docs/PROJECT_SCOPE.md v6.18 → v6.19；docs/DEV_LOG.md 追加 2026-11-09 真实皮层表面条目；重跑 build-docs.mjs。

---
## [v1.13.1] - 2026-11-09 · 三份迭代档案按课程规范重建（DEV_LOG / DECISIONS / ERROR_LOG）

### Added
- `docs/DEV_LOG.md`：新增「三份迭代档案的分工」说明、**阶段总览索引表**（v0.1.0 → v1.13.0，含版本 / 日期 / 主题 / 产出 / 决策 / 错误互链）与 **Phase 映射表**（Phase 0–6 的 Goal / 覆盖版本 / 验收标准 / AI 怎么测 / 人怎么验 / 退出条件，对应课程 PLAN 六要素）。
- `docs/DECISIONS.md`：新增**决策索引表**（D-001 → D-039，含状态列）与三档案分工说明；补齐 2026-10-13 之后缺失的 8 条关键决策 **D-032 – D-039**（反馈箱本地存储 + 口令门、日志以日期为单位、SM-2 + 三页流程、删除闪卡、Phase 4 原生 SVG / Canvas、three.js 本地化 3D、`?v=` 缓存指纹、三档案职责分离）。
- `docs/ERROR_LOG.md`：新增**错误索引表**（E-001 → E-012，每条附一句话教训）与三档案分工说明；补齐 3 条高价值错误 **E-010 – E-012**（file:// 缓存导致「页面新、逻辑旧」；UTF-8 BOM 与 PowerShell 引号致中文静默损坏；jsdom 全绿 ≠ 浏览器可用）。

### Changed
- `docs/DEV_LOG.md`：52 条日志按**日期倒序**重排（同日按版本号倒序），统一标题为 `YYYY-MM-DD · 阶段 · 小步名称`；记录格式明确「需求 / 完成 / 遇到问题 / 解决方式 / 下一步 / 相关文件」。
- `.opencode/skills/version-changelog/SKILL.md`：新增「三档案同步判定」表与索引一致性校验；description、执行步骤、硬性规则、交付清单同步扩展为四文件（CHANGELOG + 三档案）。

### Fixed
- `docs/ERROR_LOG.md` 的追加锚点原先错位在 E-005 与 E-006 之间（导致 E-006–E-009 被追加到锚点之后），现已移到文件末尾，并保留全部历史条目。

### Docs
- docs/PLAN.md v51 → v52；docs/PROJECT_SCOPE.md v6.17 → v6.18；docs/DEV_LOG.md 追加 2026-11-09 三档案条目；重跑 build-docs.mjs。

---

## [v1.13.0] - 2026-11-09 · 交互式脑解剖 3D 全景升级（three.js 本地化）

### Added
- **3D 全景视图**（`lab-anatomy.html` + `page-lab-anatomy.js`）：three.js（r128，MIT 许可，本地化于 `assets/vendor/three/`）构建的程序化解剖分区 3D 大脑——10 个部件（额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干 / 胼胝体 / 丘脑 / 海马 / 侧脑室，含左右对称单元共 15 个 mesh）与 2D 脑区一一对应，颜色分区一致。
- **全景互动**：拖拽旋转（OrbitControls，滚轮缩放）+ 自动旋转开关；一键**拆分 / 合并**（各部件沿自身方向平滑分离，ease-in-out 动画）；**点击选中部件后拖拽挪动**（沿视平面移动）；**复位按钮**一键归位全部部件并重置相机视角。
- **点选说明**：点击 3D 部件显示名称 / 功能说明 / 关键词 / 相关词条链接（与 2D 共用信息面板与 i18n 文案）。
- **三视图模式切换**：3D 全景 / 2D 示意图 / 剖面示意（2D 点选 / 分层 / 标注、剖面功能完整保留）。
- i18n 新增 `labAnatomy3d.*` 键（zh/en）；互动实验室入口卡片描述加入「3D 全景」。

### Changed
- style.css 新增 3D 视图样式（视图切换条 / 全景画布容器 / 3D 控制条）。
- verify-native.mjs：13.2 块重构为三视图断言（默认 3D、2D 交互、剖面切换）；新增 13.7 块（three.js 本地化与页面引用 / 部件数 10 / 接口 / 视图切换）；自测 **624 → 637 项全绿**。
- 全部 19 个 HTML 缓存指纹 `?v=1106` → `?v=1107`。

### Docs
- docs/PLAN.md v50 → v51；docs/PROJECT_SCOPE.md v6.16 → v6.17；docs/DEV_LOG.md 追加 2026-11-09 3D 全景条目；重跑 build-docs.mjs。

---
## [v1.12.0] - 2026-11-09 · Phase 4 互动实验室上线（脑解剖 / 认知模拟 / 信号范式 / BCI 案例）

### Added
- **新增「互动实验室」栏目**（主导航 5 → 6 栏目）：入口页 `lab.html` + `page-lab.js`（四类互动模块工具卡）+ 首页新增「互动实验室」入口区（4 张工具卡 + 进入按钮）。
- **交互式脑解剖**（`lab-anatomy.html` + `page-lab-anatomy.js`）：内联 SVG 侧视大脑示意图，10 个可点选结构（表面层 6 脑区：额叶 / 顶叶 / 颞叶 / 枕叶 / 小脑 / 脑干；皮下层 4 结构：胼胝体 / 丘脑 / 海马 / 侧脑室），点选显示名称 / 说明 / 关键词 / 相关词条链接；支持分层切换（皮层表面 ↔ 皮层下结构）、标注开关、矢状剖面示意（正中切面 5 结构可点选）。
- **认知实验模拟**（`lab-cogsim.html` + `page-lab-cogsim.js`）：Stroop 效应（20 题、一半一致题可比、正确率 + 平均反应时）、简单 / 选择反应时（10 次、随机延迟、提前点击提示）、数字记忆广度（3 位起步、每级两串、逐级递增至 12 位封顶）。
- **神经信号与范式演示**（`lab-signals.html` + `page-lab-signals.js`）：Canvas 2D 动画四组演示——EEG α 节律（≈10 Hz 正弦 + 噪声）、ERP / P300（oddball 刺激序列、偏差刺激约 300 ms 正峰）、SSVEP（8 Hz / 12 Hz 双频闪烁方块 + 频谱峰值随注视目标切换）、运动想象 μ-ERD（静息高幅 vs 想象去同步对比）；每组可播放 / 暂停（无 canvas 上下文的环境自动降级为仅接口可用）。
- **BCI 案例拆解**（`lab-bci.html` + `page-lab-bci.js`）：4 个案例（P300 拼写器 / SSVEP 拨号与控制 / 运动想象假肢控制 / 侵入式神经光标与语音）按「问题 → 范式 → 信号 → 解码 → 性能 → 局限」六环节拆解，切换即渲染。
- i18n 新增 `nav.lab`（zh「互动实验室」/ en「Lab」）与 `lab.*` / `labAnatomy.*` / `labCogsim.*` / `labSignals.*` / `labBci.*` 键（zh/en 全量）；core.js 帮助导览 step1Desc 栏目列表更新为 6 栏目。

### Changed
- style.css 新增 Phase 4 样式（`.lab-*` 系列：脑解剖 / 认知实验 / 信号演示 / BCI 案例）+ 全局 `[hidden]{display:none}` 兜底（SVG 元素隐藏）。
- verify-native.mjs：PAGES 14 → 19、SCRIPTS 17 → 22；主导航断言 5 → 6 栏目（首页 / 反馈箱 / 帮助块同步）；新增第 13 块「互动实验室」断言（入口页 / 脑解剖交互 / 认知实验流程 / 信号演示降级 / BCI 案例切换 / CSS 与 i18n 键）；首页新增互动实验室入口断言；自测 **570 → 624 项全绿**。
- 全部 19 个 HTML 缓存指纹 `?v=1105` → `?v=1106`。

### Docs
- docs/PLAN.md v49 → v50（文首版本行 / §2.3 信息架构表 / §4 阶段总览 / §5 Phase 4 说明 / §10 变更记录）；docs/PROJECT_SCOPE.md v6.15 → v6.16（aligned_with / §4.4 互动与可视化 / §九 交付物 / §十一 变更管理 / 页尾）；docs/DEV_LOG.md 顶部新增 2026-11-09 条目；重跑 build-docs.mjs 重新生成 docs-content.js / docs-meta.js。

---
## [v1.11.1] - 2026-11-08 · 修复自测基线依赖（jsdom 重装恢复）并同步版本记录

### Fixed
- **verify-native.mjs 自测基线依赖修复**：jsdom 包再次损坏（`C:\Users\WT\AppData\Local\Temp\opencode\domcheck\node_modules\jsdom` 仅剩 `lib`、无 `package.json`，node 加载报 `Cannot find module 'jsdom'`，与 2026-11-01 v47 同因复发），在 domcheck 目录执行 `npm install jsdom` 重装恢复（12 个依赖补齐）→ 基线从「无法运行」恢复到 **通过 570 项，失败 0 项**。

### Docs
- **版本迭代记录同步**：按 version-changelog 流程新增本条目；`docs/DEV_LOG.md` 顶部追加 2026-11-08 条目；`docs/PLAN.md` 版本行 v48 → v49、§10 变更记录新增 v49 行；`docs/PROJECT_SCOPE.md` 不升版（本轮不涉及范围与交付物，仅自测依赖修复与文档记录）。
- **站内项目文件页数据重建**：重跑 `build-docs.mjs` 重新生成 `docs-content.js` / `docs-meta.js`；全部 14 个 HTML 缓存指纹 `?v=1104` → `?v=1105`；自测回归至全绿。

## [v1.11.0] - 2026-11-02 · 删除闪卡模块（页面 / SRS 引擎 / 入口 / 文案 / i18n / 样式 / verify 断言 / docs 全部移除）

### Removed
- **删除闪卡整套模块**（用户确认不再需要闪卡）：页面 `flashcards.html`、`flashcards-result.html` 与其脚本 `page-flashcards.js`、`page-flashcards-result.js` 删除，产物 16 → 14 页、脚本 19 → 17 个；**SM-2 间隔重复（SRS）引擎整体移除**（learn.js 删除 `SRS_KEY` / `EASE_MIN` / `round2` / `sm2Rate` / `srs` 全部块与导出，保留 `stampCmp` 等公共工具）。
- **入口与文案清理**：首页与学习中心删除闪卡工具卡片（工具卡 3 → 2，容器 `grid-3` → `grid-2`）；学习中心 / 首页 / 帮助导览（core.js step1Desc）/ 页面描述 / i18n（zh/en）全部去闪卡文案（`learn.desc` / `learn.toolDesc` / `learn.progressDesc` / `learn.progressSrs` / `flashcards.*` 整块）；学习中心进度统计删除「到期卡」项（保留浏览 / 测验 / 错题 / 收藏 4 项）。
- **样式清理**：style.css 删除 `/* 闪卡 */` 块（`.fc-stats` / `.fc-card` / `.fc-meta` / `.fc-face` / `.fc-hint` / `.fc-rate` / `.fc-rate .btn` / `.fc-rate-hint`）；通用 `.chip` / `.chip b` 组件保留（教材导读分类 / 词条标签 / 测验统计在用）。

### Changed
- verify-native.mjs：PAGES 16 → 14、SCRIPTS 19 → 17；12.1 块改由 spelling.html 挂载 learn.js 并删除 SM-2 调度断言（标题更新为「判分 / CRUD / seeded RNG」）；删除 12.2 / 12.2b 闪卡答题页与结果页整块断言（含存储警告 / 空态 / 页脚链接 / 重置按钮）；学习中心与首页断言去 `nb-srs` 注入、工具卡 3 → 2、删除闪卡统计与 `learn-stat-flash` 徽章断言；needCss 去掉 `.fc-card` / `.fc-rate`。
- 全部 14 个 HTML 缓存指纹 `?v=1103` → `?v=1104`（file:// 缓存约定，每次更新必须 bump）。

### Docs
- docs/CHANGELOG.md 顶部新增 v1.11.0（本条）；docs/DEV_LOG.md 顶部新增 2026-11-02 条目；docs/PLAN.md v47 → v48（信息架构 / 页面清单 16 → 14 / Phase 3 描述去闪卡）；docs/PROJECT_SCOPE.md v6.14 → v6.15（功能清单 / 交付物去闪卡）；重跑 build-docs.mjs 重新生成 docs-content.js（同步去闪卡）。

---

## [v1.10.3] - 2026-11-01 · 缓存指纹强制刷新（file:// 下旧脚本缓存导致闪卡无法跳转）

### Fixed
- **根治「闪卡无法切换下一题」（用户连续三轮反馈）**：根因确认为 **file:// 直接打开时浏览器对本地 JS 的启发式缓存**——用户刷新拿到新 HTML，但 `page-flashcards.js` 等脚本命中旧缓存（旧 `pos += 1` 死循环逻辑），表现为「页面是新的、跳转逻辑是旧的」。修复方式：**全部 16 个 HTML 的脚本与样式引用统一追加缓存指纹 `?v=1103`**（`script src` / `link href`），指纹变化即强制浏览器按完整 URL 重新加载资源，彻底绕开 file:// 缓存。
- verify-native.mjs 脚本读取逻辑同步适配：`src` 剥离 `?` 后的指纹再拼路径（否则报「缺少脚本文件」）。

### Changed
- **`version-changelog` skill 新增产物缓存指纹约定**：修改 outputs/neurobase 下任何 JS / CSS / HTML 后，必须同步 bump 全部 HTML 中的 `?v=<指纹>`，否则 file:// 环境用户会加载旧脚本；bump 后重跑 verify-native.mjs。

### Docs
- docs/DEV_LOG.md 顶部新增 2026-11-01 缓存指纹条目；自测 **622 项保持全绿、0 失败**。

---

## [v1.10.2] - 2026-11-01 · 闪卡存储可用性诊断（无痕 / 受限环境直接可见警告）

### Changed
- **core.js 新增 `NB.storageOK()`**：探测 localStorage 可写性（`file://` 直接打开或无痕模式下浏览器可能禁用本地存储）。
- **flashcards.html 新增存储警告区 `#fc-store-warn`**（默认隐藏，文案 i18n 键 `flashcards.storeWarn` zh/en）。
- **page-flashcards.js 启动时检测**：存储不可用则显示警告「答完卡片后无法保存进度并跳转到下一张」，让根因在页面上直接可见，不再静默失败。

### Fixed
- **排查「闪卡答完无法切换下一题」用户反馈**：真实点击流模拟（10 张新卡全部答完、无跳卡、终态进入结果页）与 622 项回归证明跳转逻辑正常；根因收敛为两个用户侧可能——① 浏览器仍加载修复前的旧缓存 JS（强制刷新 Ctrl+F5 / 关闭标签重开即可）；② `file://` 打开 + 无痕 / 受限环境导致 localStorage 不可用 → 跳转后新页读不到会话、重建队列回到第一张（本轮新增页面警告直接可见）。拼写 / 测验分页流程同理依赖 localStorage，后续如遇同类问题可复用 `NB.storageOK()`。

### Docs
- docs/DEV_LOG.md 顶部新增 2026-11-01 闪卡存储诊断条目；verify-native.mjs 12.2 新增 2 项断言（storageOK 可用 + 警告区默认隐藏），自测 **620 → 622 项全绿**。

---

## [v1.10.1] - 2026-11-01 · 固化迭代日志规则（每一次更新都计入，以日期为单位）

### Changed
- **迭代日志记录规则固化**（用户要求「从现在起，每一次更新都要计入版本迭代日志，以日期为单位记录」）：`docs/CHANGELOG.md` 顶部维护约定第 1 条改写——**每一次更新**（新增功能 / 修复缺陷 / 数据或文档变更 / 自测扩充 / 流程约定，无论大小）完成后必须新增一条版本记录，**以日期为单位**（每条记录标注更新日期；不同日期的更新不得合并；同一天多次更新可各自成条或合并为当日一条并逐条列出明细）。
- **`version-changelog` skill 同步更新**：触发条件补充「修改了本项目的 skill / 流程 / 维护约定」与用户持续约定类请求；执行步骤 3 明确版本记录以日期为单位、禁止跨日期合并；DEV_LOG 步骤明确条目以日期为单位（条目日期 = 更新当日日期）；硬性规则新增「每一次更新都必须记录，不允许小改动不记 / 跨日期合并 / 攒批补记」。

### Docs
- docs/CHANGELOG.md 维护约定第 1~3 条重排（以日期为单位的记录与同步约定）；docs/DEV_LOG.md 顶部新增 2026-11-01 固化迭代日志规则条目；docs/PLAN.md 与 docs/PROJECT_SCOPE.md 本轮**不升版**（纯流程约定变更，不涉及计划基线 / 范围 / 交付物），仅随后的 DEV_LOG 条目引用。自测 620 项保持全绿。

---

## [v1.10.0] - 2026-11-01 · 学习工具分页流程（闪卡 / 拼写 / 测验改为「选题 → 答题 → 结果」多页跳转）

### Added
- **闪卡学习结果页** `flashcards-result.html`（`page-flashcards-result.js`）：读取本轮会话（nb-fc-session）展示本轮答卡统计（sessionLine / sessionBreak）与全局 SRS 进度（到期 / 学习中 / 已掌握 / 总数），无记录时显示空态；「继续复习」清会话跳回 flashcards.html。
- **拼写分页**：`spelling.html` 改为选题设置页（5 模式 + 数量 → 提交进入答题页）；新增 `spelling-run.html`（逐题作答、判分反馈、错题进错题本、下一题/查看结果按钮、回车续题）与 `spelling-result.html`（得分行 + `learn.rate` 正确率 + 错题回顾「本轮错题」+「再练一轮」清会话回选题）。
- **测验分页**：`quiz.html` 改为选题设置页（模块 + 数量 + 题型 → 提交进入答题页）；新增 `quiz-run.html`（渲染单选/多选/填空题、提交判分、错题进错题本、写 nb-qz-result 后跳结果页）与 `quiz-result.html`（得分 + 正确率 + 逐题「正确答案 / 你的答案 / 解析」+「再测一次」清结果回选题）。
- 会话与结果存 localStorage（nb-fc-session / nb-sp-session / nb-qz-session / nb-qz-result），跨页继承；i18n 新键 `learn.rate`（正确率）与 `spelling.mistakesTitle`（本轮错题），`flashcards.desc` 补充「答完一张自动跳到下一张，全部答完进入学习结果总结」。

### Changed
- **闪卡队列语义修正**：答完一张卡后 pos 保持指向「下一张」（不移位），答「忘记」的卡插回队列稍后重现（直到答对才放行），**全部答完才进入结果页**；跳转 URL 统一携带 `msg`（againResult / hard / good / easy），新页据此显示上轮评分反馈。
- **拼写「看释义写英文」（zh2en）**：题目区释义只显示词条含义（定义或通俗解释），**不再显示拼音行**（避免把拼音简写当作释义）。
- **测验选项字母**：选项序号用 A/B/C/D 硬编码（i18n 无 `quiz.option` 键）。
- `verify-native.mjs` 的 `load()` 注入 `window.__navStub` 并收集 `navTo`，支持多页跳转断言；PAGES 扩至 16 页、SCRIPTS 扩至 19 个。

### Fixed
- **闪卡评分后无法前进/死循环**（用户实测反馈）：`rate()` 在移除当前卡后 `pos += 1`，配合「忘记」插回队尾，会跳过队列中间卡、小队列时跳回同一张卡导致永远无法跳到下一张，且未答完全部卡就提前进入结果页。现改为移除后 pos 保持指向下一张；「忘记」卡插回位置在 pos 之后，稍后自然重现，不再跳卡/漏卡/循环。
- **闪卡跳转 msg 键**：跳转 URL 曾携带 `easyHint/hardHint/goodHint`，新页按 `msg === 'easy'` 等条件映射文案导致反馈不显示；现统一携带 `easy/hard/good` 与新页匹配。
- **jsdom 依赖损坏**：`domcheck` 目录 jsdom 包缺失 package.json，重新 `npm install jsdom` 恢复自测环境。

### Docs
- 同步：docs/PLAN.md → **v47**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.14**（frontmatter aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-11-01 学习工具分页流程条目。自测 **615 → 620 项全绿**。

---

## [v1.9.5] - 2026-10-26 · 再次删除顶栏左上角品牌图标（仅保留 NeuroBase 文字与副标题）

### Changed
- **再次删除顶栏左上角品牌图标**（`core.js` 注入全站页面的 `.brand-mark` 蓝色圆角方块 + 白色大脑 SVG 整体移除），品牌区仅保留 `NeuroBase` 标题与中文副标题文字（`.brand` 同步移除图标间隙与 `.brand-mark` 样式，布局不变）。
- **首页 hero 横幅保持无图标**（v44 删除结果不变）。
- 自测脚本 `verify-native.mjs` 品牌块断言同步更新：顶栏品牌区**无 brand-mark 图标**（仅文字）；hero 横幅无 hero-mark。
### Docs
- 同步：docs/PLAN.md → **v46**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.13**（frontmatter / aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-10-26 再次删除顶栏图标条目。补丁脚本 .deepworks/tmp/patch-v47/patch-docs-v47.mjs。

---

## [v1.9.4] - 2026-10-26 · 恢复顶栏左上角品牌大脑图标（蓝底圆角方块 + 白色侧视大脑线稿）

### Changed
- **恢复顶栏左上角品牌图标**（`core.js` 品牌区 `.brand-mark`）：蓝色圆角方块 + 白色侧视大脑 6 条 path SVG（肾形大脑轮廓 + 两条脑干下垂线 + 三条沟回弧，viewBox="0 0 24 24"、stroke="currentColor"、stroke-width="1.5"），容器背景 `#2e6be6`；图标位于 NeuroBase 标题左侧，与参考图品牌横幅一致。全站 11 页顶栏同步生效。
- `style.css` 恢复 `.brand-mark` 样式（2.25rem 蓝底圆角方块 / grid 居中 / 白线），`.brand` 恢复 `gap: 0.5rem`。
- 首页 hero 横幅保持无图标（上轮删除结果不变）。
- 自测脚本 `verify-native.mjs` 品牌块断言同步更新：brand-mark 恢复为 6 条 path 大脑 SVG；hero-mark 仍无。
### Docs
- 同步：docs/PLAN.md → **v45**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.12**（frontmatter / aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-10-26 恢复顶栏图标条目。补丁脚本 .deepworks/tmp/patch-v46/patch-docs-v46.mjs。

---

## [v1.9.3] - 2026-10-26 · 删除深蓝色 hero 横幅左上角图标（仅保留标题 / 副标题 / 搜索框）

### Changed
- **删除首页 hero 横幅左上角图标**（`index.html` 中 `.hero-mark` 蓝色圆角方块 + 白色大脑 6 条 path SVG 整体移除），横幅仅保留主标题、副标题与检索表单（`.hero` 起始元素由图标改为 h1，布局不变）。
- `style.css` 同步删除 `.hero-mark` 及其媒体查询样式块（grid 居中 / 尺寸 / 蓝底圆角 / 内部 SVG 尺寸）。
- 自测脚本 `verify-native.mjs` 品牌块断言同步更新：hero 横幅**无 hero-mark 图标**。
### Docs
- 同步：docs/PLAN.md → **v44**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.11**（frontmatter / aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-10-26 删除 hero 图标条目。补丁脚本 .deepworks/tmp/patch-v45/patch-docs-v45.mjs。

---

## [v1.9.2] - 2026-10-26 · 删除顶栏左上角品牌图标（仅保留 NeuroBase 文字与副标题）

### Changed
- **删除顶栏左上角品牌图标**（`core.js` 注入全站页面的 `.brand-mark` 蓝色圆角方块 + 白色大脑 SVG 整体移除），品牌区仅保留 `NeuroBase` 标题与中文副标题文字（`.brand` 同步移除图标间隙与 `.brand-mark` 样式，布局不变）。
- **首页 hero 横幅图标保留**：`.hero-mark`（蓝色圆角方块 + 白色侧视大脑线稿，6 条 path）不受影响。
- 自测脚本 `verify-native.mjs` 品牌块断言同步更新：顶栏品牌区**无 brand-mark 图标**（仅文字）；hero-mark 保留为 6 条 path 大脑 SVG（viewBox="0 0 24 24"）。
### Docs
- 同步：docs/PLAN.md → **v43**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.10**（frontmatter / aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-10-26 删除顶栏图标条目。补丁脚本 .deepworks/tmp/patch-v44/patch-docs-v44.mjs。

---

## [v1.9.1] - 2026-10-26 · 品牌图标按参考图重绘：蓝色圆角方块 + 白色侧视大脑线稿（删除原 11-path 线稿）

### Changed
- **品牌徽标**（`core.js` 注入全站 11 页的 `.brand-mark`）与**首页 hero 横幅**（`index.html` `.hero-mark`）的图标整体重绘：删除原 **11-path 侧视大脑线稿**（`stroke="currentColor"`、`stroke-width="1.6"`），替换为**蓝色圆角方块 + 白色侧视大脑线稿** —— 图标容器背景由主色改为图片同款中等饱和纯蓝 `#2e6be6`（`.brand-mark` / `.hero-mark` 均改为蓝底白线），SVG 重绘为 **6 条 path**（`viewBox="0 0 24 24"`、`stroke-width="1.5"`）：肾形大脑轮廓（额叶左前圆突 / 枕叶右后圆隆）+ 两条脑干下垂线（末端外张）+ 三条流畅沟回弧（中央沟 + 额叶/枕叶脑回 + 底部沟回），形态与用户所给参考图一致。
- `.hero-mark` 由透明背景改为**蓝色圆角方块**（`display:grid` 居中、`border-radius:0.9rem`、`background:#2e6be6`，内部 SVG 缩小为 2.5rem / 2.8rem），与品牌徽标同款同色，不再浮空显示。
- 自测脚本 `verify-native.mjs` 断言保持通过（品牌徽标为 SVG 无文本残留；hero-mark 与 brand-mark 的 viewBox 及 path 数量一致 —— 两处同为 6 条 path）。
### Docs
- 同步：docs/PLAN.md → **v42**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.9**（frontmatter / aligned_with / §11 变更管理 / 文末版本行）；docs/DEV_LOG.md 2026-10-26 品牌图标重绘条目。补丁脚本 .deepworks/tmp/patch-v43/patch-docs-v43.mjs。

---

## [v1.9.0] - 2026-10-26 · 学习工具交互改造：返回学习中心 · 测验三界面流程 · 拼写新增「看中文写英文 / 看英文写中文」

### Added
- **拼写与缩写训练**（spelling.html + page-spelling.js）新增两种模式：**看中文写英文**（zh2name，出题显示中文名，答英文名 / 缩写）与**看英文写中文**（en2zh，出题显示英文名，答中文名）；原「看释义写英文 / 缩写 / 听写」保留，模式下拉 3 → **5 项**。
- **拼写 / 测验页新增「返回学习中心」按键**：两页 wrap 底部新增 .qz-footer 容器 + .btn.btn-ghost 链接（#sp-to-learn / #qz-to-learn，href="learn.html"，复用 i18n learn.backToLearn），一键回到学习中心。
- **判分扩展**（learn.js）：新增 zhOK(term, input) 中文名判分（候选 = name_zh + 别名，归一化比较），并暴露 NB.learn.zhOK 供「看英文写中文」模式使用。
- i18n（zh / en）：spelling.* 新增 modeZhToName / modeEnToZh / zhTarget / enTarget / placeholderZh / countLabel 键；quiz.* / spelling.* 的 desc 更新（测验三步流程、拼写五模式）。
### Changed
- **测验改为「选题 → 答题 → 提交答案」三独立界面依次跳转**（quiz.html + page-quiz.js）：原 #qz-run 拆分 —— 答题界面只保留进度 + 表单 + 提交按钮；新增独立结果界面 #qz-result（评分 #qz-score + 解析区 #qz-review + 再测一次 #qz-again + 换题 #qz-change）。提交时表单整体移入 #qz-review 显示解析、「再测一次」将表单移回答题界面并重建题目，不再在同一界面混排。
- **拼写训练「选题 / 答题」两界面流程**：选题界面（模式 / 范围 / 题数 + 检查）与答题界面明确分离，答完一批出结果统计，退出回选题界面。
- **拼写反馈按模式显示正确答案**：en2zh 模式答错时正确答案显示中文名；输入框占位符按模式切换（英文题「输入中文名…」）。
- style.css 新增 .qz-footer（返回键居中容器）与 .qz-review（解析区，≥640px 可滚动）。
- 自测脚本 verify-native.mjs 由 **559 项扩充至 575 项**并全绿：新增返回键断言、拼写模式 5 项断言、「看英文写中文 / 看中文写英文」出题与判分流程断言、测验三界面时序断言（提交前 qz-run 可见 / 提交后 qz-run 隐藏 qz-result 可见 / 再测后回答题界面）。
### Fixed
- 拼写页「本轮题数」标签此前误用带占位符的 spelling.count 键（data-i18n 直接赋值不插值），渲染出字面 {n} —— 新增无占位符键 spelling.countLabel（zh「本轮题数」/ en「Questions this round」）并改由 label 引用。
- spelling.desc 文案此前仍为四模式旧描述（未含新增两种模式），已更新为五模式完整描述（zh / en）。
### Docs
- 同步：docs/PLAN.md → **v41**（文首版本行 / 上一版本行 / §10 变更记录 / 文末版本行）；docs/PROJECT_SCOPE.md → **v6.8**（frontmatter / §11 变更管理）；docs/DEV_LOG.md 2026-10-26 条目；build-docs.mjs 重跑（站内文档页同步新版内容）。补丁脚本 .deepworks/tmp/patch-v42/patch-docs-v42.mjs。

---

## [v1.8.1] - 2026-10-16 · 品牌徽标与首页横幅改为侧视大脑线稿（与 Logo 同款）

### Changed
- **品牌徽标**（`core.js` 注入全站 11 页的 `.brand-mark`）由「NB 文本 + Lucide 正面大脑图标」替换为**侧视大脑线稿 SVG**：横扁拱形皮质轮廓 + 括号形额叶 / 枕叶沟回 + 中央沟 + 外侧裂 + 底部两条脑干平行线 + 右下独立小脑圆凸与纹理，共 **11 条 path**（`viewBox="0 0 24 24"`、`fill="none"`、`stroke="currentColor"`、`stroke-width="1.6"`、圆角线帽线接），形态与已交付 Logo（`outputs/imagegen/neurobase-logo-brain.png`，深蓝底白色侧视大脑）一致，**不再显示 NB 文本**。
- 首页（`index.html`）hero 横幅新增**同款大脑线稿**（`.hero-mark`）：复用品牌徽标同款 SVG，viewBox 与 path 数量与 `.brand-mark` 完全一致（断言强制一致性）。
- 自测脚本 `verify-native.mjs` 由 **557 项扩充至 559 项**并全绿：品牌块新增 2 项断言（品牌徽标为大脑线条 SVG 且无文本残留；首页横幅含同款大脑线稿 —— hero-mark 与 brand-mark 的 viewBox 及 path 数量一致）。
### Docs
- 同步：`docs/PLAN.md` → **v40**（文首版本行 / §10 变更记录 / 文末版本）；`docs/PROJECT_SCOPE.md` → **v6.7**（frontmatter / aligned_with / §11 变更管理 / 文末版本）；本文件（`CHANGELOG.md` v1.8.1）；`docs/DEV_LOG.md` 2026-10-16 品牌图标条目。补丁脚本 `.deepworks/tmp/patch-v41/patch-docs-v41.mjs`，备份 `.deepworks/tmp/backup-docs-v41/`。

---

## [v1.8.0] - 2026-10-15 · 学习工具上线（Phase 3 本地版：学习中心 · 闪卡 · 拼写 · 测验 · 错题本 · 收藏 · 进度）

### Added
- 新增**学习中心**（`learn.html` + `page-learn.js`）：学习工具三入口卡片（闪卡 / 拼写与缩写 / 测验）、**错题本**（按词条 + 来源去重、上限 200 条，可逐条移除 / 一键清空 / 点词条跳详情）、**收藏**（上限 100 条，可取消收藏 / 跳词条）、**进度统计**（浏览 n/110 复用 `nb-progress`、闪卡 srs 到期 / 学习中、测验 taken/correct/wrong、错题与收藏计数）。
- 新增**闪卡**（`flashcards.html` + `page-flashcards.js`）：**SM-2 间隔重复**（`learn.js` 实现 `sm2Rate`：q<3 重学 / q≥3 按 1→6→interval×ease 调度、ease 下限 1.3、难度系数修正），每日**到期卡优先队列** + 新卡补位，翻面看释义、四档评分（忘记 / 困难 / 良好 / 简单）、统计 chip（到期 / 学习中 / 完成 / 总数）、空态提示与重置进度；存储 `nb-srs`。
- 新增**拼写与缩写训练**（`spelling.html` + `page-spelling.js`）：**中→英 / 英文缩写 / 听写**三模式（听写走 Web Speech），大小写不敏感判分（`normAns` / `answerOK` / `abbrOK`），答错显示正确答案并写入错题本（source=`spelling`）。
- 新增**测验**（`quiz.html` + `page-quiz.js`）：**单选 / 多选 / 填空 / 混合**四题型，**seeded RNG 出题**（同日期同范围同题型可复现，便于自测），提交即判分（单选唯一匹配 / 多选全对 / 填空归一化判分）并展开逐题解析，答错进错题本（source=`quiz`），统计 `nb-quiz-stats`（taken/correct/wrong）。
- 词条详情页（`term.html`）新增**收藏按钮**（`#nb-fav`，★/☆ 切换，`aria-pressed`，写 `nb-favorites`）；首页（`index.html`）新增**学习工具入口区**（三卡片 + 统计徽章 `learn-stat-flash/spell/quiz`）。
### Changed
- 主导航由 4 栏目扩为 **5 栏目**：首页 / 术语检索 / **学习**（`learn.html`）/ 教材导读 / 关于（`core.js` navItems + 三处 nav 断言同步；移动端导航同步 5 项）。
- 新增全局脚本 `learn.js`（11 页全部引入）：SM-2 调度、答案归一化判分、错题 / 收藏 / 测验 CRUD、seeded RNG（`mulberry32`）；i18n 新增 `learn.*` / `flashcards.*` / `spelling.*` / `quiz.*` 键（zh/en 各一份，`data/i18n/zh.json` / `en.json`，构建自检键集合一致）。
- 自测脚本 `verify-native.mjs`：PAGES/SCRIPTS 常量扩至 **11 页 / 15 脚本**，新增第 12 块「学习工具」断言，由 **453 项扩充至 557 项**并全绿。
### Fixed
- 修复 `page-flashcards.js` 新卡补位缺陷：`freshLimit` 原表达式 `Math.max(0, NEW_LIMIT - (due.length > NEW_LIMIT ? 0 : 0))` **恒等于 NEW_LIMIT**，到期卡 ≥10 张时仍额外补入 10 张新卡、队列无限膨胀；改为 `Math.max(0, NEW_LIMIT - due.length)`，到期卡充足时不再补新卡（新增断言覆盖：12 张到期卡 → 队列恰 12）。
### Docs
- 同步：`docs/PLAN.md` → **v39**（文首版本行 / §2.3 信息架构 / §4 阶段总览 / Phase 3 说明 / §10 变更记录 / 文末版本）；`docs/PROJECT_SCOPE.md` → **v6.6**（frontmatter / §9 交付物 / §11 变更管理 / 文末版本）；本文件（`CHANGELOG.md` v1.8.0）；`docs/DEV_LOG.md` 2026-10-15 学习工具条目。补丁脚本 `.deepworks/tmp/patch-v40/patch-docs-v40.mjs`，备份 `.deepworks/tmp/backup-docs-v40/`。

---
## [v1.7.7] - 2026-10-15 · 帮助导览「上一步」按钮补文案与箭头

### Fixed
- 帮助导览（`help.js`）底部按钮组：左侧「上一步」按钮此前**文案从未填充**（`showStep()` 只设置 `disabled`，未设置 `textContent`），显示为空白色框。现已修复：按钮显示「上一步」文案（i18n `help.prev`，zh「上一步」/ en「Back」），并新增向左箭头图标（`.tour-prev-ico`，`accent` 青绿主题色，与「下一步」按钮主题色一致；第一步骤禁用时图标与文字淡化为 `muted`）。
- 自测脚本 `verify-native.mjs` 由 **450 项扩充至 453 项**并全绿：帮助块新增 3 项断言（prev 按钮文案「上一步」、向左箭头图标存在、箭头为主题色 `--accent`）。

## [v1.7.6] - 2026-10-15 · 顶部栏第二行右缩进（整行右对齐）

### Changed
- 顶部栏响应式布局微调（`style.css` `.main-nav-mobile`）：非全屏（视口 ≤767px）时栏目导航所在的第二行由「左侧顶格、横向滚动」改为 **整行右缩进（右对齐）**——导航项仍固定 `6rem` 宽（跨语言不跳动），允许 `flex-wrap` 换行使内容自适应宽度、不再横向溢出丢项，整行 `justify-content: flex-end` 右对齐，左侧留白随窗口变化；分割线（`border-top`）仍贯通整行。全屏时栏目仍在同一行（品牌 / 栏目 / 工具栏），行为不变。
- 实现细节：用户确认缩进方式为「整行右对齐」（而非固定缩进）；采用 `flex-wrap: wrap` 而非纯 `overflow-x: auto`，避免内容超宽时 `justify-content: flex-end` 导致左侧栏目溢出不可见。
- 自测脚本 `verify-native.mjs` 由 **447 项扩充至 450 项**并全绿：顶部栏响应式块新增 3 项断言（第二行整行右对齐、可换行不丢项、导航项宽固定跨语言不跳动）。

## [v1.7.5] - 2026-10-15 · 教材导读书目新增官方/权威网页链接

### Added
- 「教材导读」（`reading.html`）55 本书目全部新增 **url 字段**：书名渲染为外链（`.book-link`，`target="_blank"` + `rel="noopener"`，右侧 `↗` 小图标，`title` 提示「在新标签打开书目官方/权威网页」，i18n `reading.link` zh/en 各一份）。数据来源 `data/reading_list.json` 为唯一事实源，构建脚本 `build-data.mjs` 新增 url 字段自检（缺失或非 http(s) 即报错）。
- 链接策略：出版社官方详情页优先（McGraw Hill / Elsevier Shop / Routledge / Oxford UP / MIT Press / Guilford / Norton / Cengage / Macmillan / Wiley / Springer 等），次选 Wikipedia、Google Books ISBN 直达（`books.google.com/books?vid=ISBN…`）；中文书用百度百科词条或 Google Books 图书搜索兜底。
- 自测脚本 `verify-native.mjs` 由 **438 项扩充至 447 项**并全绿：新增第 11 块「教材导读外链」9 项断言（书目数据完整加载、55 本全有 http(s) 链接、渲染出 55 个 `.book-link`、均 `target=_blank`、均 `rel=noopener`、href 均为 http(s)、外链图标存在、`.book-link` 样式存在、i18n `reading.link` zh/en 文案齐全）。

## [v1.7.4] - 2026-10-15 · 帮助导览新增「字号调节」步骤

### Added
- 帮助功能导览（`help.js` STEPS）新增第 2 步「字号调节」：紧随「栏目导航」之后介绍工具栏右侧「A 字号」控件（拖动滑块 25%–300% 连续缩放、点「− / +」每次微调 5%、越界保持、本机保存刷新仍生效）。zh/en 文案见 `core.js` EXTRA i18n（`help.step8Title` / `help.step8Desc`，键号沿用旧末位）。
- 导览总步骤数由 7 步变为 8 步（首页完整导览）；其他栏目页因字号控件为全局工具栏、各页均有，自动过滤后由 3 步变为 4 步（导航 / 字号 / 反馈箱 / 帮助）。
- 自测脚本 `verify-native.mjs` 由 **435 项扩充至 438 项**并全绿：第 9 块同步第 2 步断言（标题「字号调节」、data-target 为 `.toolbar .nav-font`、计数 `第 2 / 8 步`、`第 8 / 8 步`），新增「字号步骤紧随栏目导航（STEPS[1]）」「zh 文案含 拖动滑块/− /+」「en 文案含 slider/buttons」3 项断言。

## [v1.7.3] - 2026-10-15 · 帮助导览文案更详细、栏目名与网页一致

### Changed
- 帮助功能导览（`help.*` i18n，zh/en 各一份）7 个步骤的描述全部**重写为详细版**：每步除说明该区域是什么外，还补充操作方法（如检索框可输入中文 / 英文 / 缩写、每日一词可点「换一个」、学习进度可「清除进度」、反馈箱需选择类别后提交等）。
- 第 1 步「栏目导航」的栏目名称改为**与网页导航一致**：「首页 / 术语检索 / 教材导读 / 关于」（旧文案的「章节 / 术语 / 项目文件」与实际导航不符；「项目文件」总览实际收录在「关于」栏目内，已如实说明）。英文同步改为 Home / Glossary / Reading List / About。
- 自测脚本 `verify-native.mjs` 由 **429 项扩充至 435 项**并全绿：第 9 块新增 6 项断言（zh/en 第 1 步栏目名与网页一致、不再出现旧栏目名、zh 各步描述 ≥30 字、en 各步描述 ≥80 字符）。

## [v1.7.2] - 2026-10-15 · 顶部栏响应式换行

### Added
- 顶部栏（`.header-inner`）明确响应式换行策略：**全屏时品牌区 + 主导航 + 工具栏排列成一行**；窗口压缩时靠页面右侧的工具栏（字号控件 + 主题按钮）整体向下新开一行并**右对齐**（`margin-left: auto`），其余模块位置不变。

### Changed
- `.main-nav-mobile`（窄屏导航）改为**独立整行**（`width: 100%`，横向滚动），不再作为弹性子项与右侧工具栏争抢空间——工具栏因此能在压缩时干净地换行并右对齐。
- 自测脚本 `verify-native.mjs` 由 **425 项扩充至 429 项**并全绿：第 4 块新增 4 项顶部栏布局断言（`header-inner` 允许 `flex-wrap` 换行、工具栏 `margin-left:auto` 右对齐、工具栏宽度固定不挤压、窄屏导航独立成行）。

## [v1.7.1] - 2026-10-15 · 字号调节支持加减号

### Added
- 字号调节新增**加减号**方式：拖动条两侧各加一个圆形小按钮（`#nb-font-minus`「−」在左、`#nb-font-plus`「+」在右，桌面 + 移动端），点击一次 **±5%**（与滑块步长一致），越界（25%/300%）点击忽略并保持当前值；按钮样式与左侧主导航项一致（无边框无底色，默认 `--ink-soft`，hover `--soft` 底 + 主色文字，`:active` 轻微缩放反馈），`aria-label`/`title` 复用 i18n `toolbar.fontSmaller` / `toolbar.fontLarger`（zh/en 各一份）。

### Changed
- 自测脚本 `verify-native.mjs` 由 **409 项扩充至 425 项**并全绿：第 10 块新增 16 项断言（减/加按钮存在、减号位于拖动条左侧与加号位于右侧（`compareDocumentPosition`）、aria 文案、点加号 100→105 且持久化 `nb-font=105`、连续点减号回 95、25% 再减保持 / 300% 再加保持、CSS 加减按钮无边框且走变量与 hover 同左侧）。

## [v1.7.0] - 2026-10-15 · 字号调节（只缩放正文）

### Added
- 工具栏「跟随系统 / 白天 / 黑夜」主题切换按钮**左侧**新增**字号调节**控件（`.nav-font`，桌面 + 移动端），按键样式与左侧主导航项一致（无边框无底色，默认 `--ink-soft`，hover 显 `--soft` 底色 + 主色文字）。
- 控件含 `A` 字标 + 连续滑块（`<input type="range">`，范围 **25%–300%**、步长 5）+ 实时百分比显示；拖动滑块即时生效并持久化，**只缩放正文字号** —— 通过 `document.documentElement.style` 写入 CSS 变量 `--nb-font-scale`（`(百分比 / 100).toFixed(2)`，沿用 D-027/D-029 约定），`.nb-content` 正文层与 `--t-*` 字号系列相乘缩放，容器宽度 / 间距 / 圆角 / 顶部栏 / 页脚 / 按钮等框架层固定不变。
- 持久化沿用既有键 `nb-font`（localStorage 存整数百分比 25–300），越界 / 非法值忽略不写自定义变量、UI 回退 100%；`window.NB` 新增 `fontPct / applyFontScale / setFontScale` 可测接口；滑块 `accent-color` 走主题变量 `--accent`，`aria-label` 引用 i18n `toolbar.fontSize`。

### Changed
- 自测脚本 `verify-native.mjs` 由 **376 项扩充至 409 项**并全绿：新增第 10 块「字号调节（v1.7.0）」33 项断言（控件存在 / 位于主题按钮左侧 / 滑块初始 100 与显示 100% / 拖动 150 生效并持久化 `nb-font=150` / 越界忽略不写 / 预置存储恢复 175 / `NB` 接口行为 / CSS 正文层乘变量而框架层固定 / 胶囊样式与移动端适配 / i18n 键齐全）；既有第 4 块字号回归断言（键 `nb-font`、`toFixed(2)` 格式、越界忽略）继续通过。

## [v1.6.0] - 2026-10-13 · 帮助功能导览（Help Tour）

### Added
- 导航栏「反馈箱」右侧新增**「帮助」**入口按钮（`.nav-help`，桌面 + 移动端），样式与左侧主导航项一致（无边框无底色，默认 `--ink-soft`，hover 显 `--soft` 底色 + 主色文字）。
- 点击帮助按钮启动**页面功能导览**：依次介绍页面各部分（首页：栏目导航 → 检索区 → 每日一词 → 学习进度 → 知识模块 → 反馈箱 → 帮助；其他栏目页自动只保留通用步骤）。被介绍元素由 `.tour-spot` 高亮框（`--accent` 描边 + 挖洞 `box-shadow`）圈出并保持可见，其余背景被变暗遮罩盖住；气泡 `.tour-pop` 显示标题 / 描述 / 步骤计数（第 x / n 步）与「跳过 / 上一步 / 下一步（末步为『完成』）」操作。
- 新脚本 `assets/js/help.js`（全部页面引入），导出 `window.NB.help` 可测接口（open / close / isOpen / current / count / next / prev / goto）；i18n 新增 `help.*` 22 键（zh/en）；CSS 新增 `.tour-layer` 系列与 `.nav-help`（走主题变量，跟随明暗主题与字号缩放）。

### Changed
- 自测脚本 `verify-native.mjs` 由 **332 项扩充至 376 项**并全绿：新增 44 项断言（帮助按钮存在 / 位于反馈箱右侧 / 移动端按钮 / 点击打开引导层 / spot 高亮与挖洞阴影 / 遮罩变暗 / 步骤切换 / 上一步 / 完成关闭 / 跳过 / 栏目页步骤过滤 / i18n 键齐全 / CSS 走变量）。

## [v1.5.0] - 2026-10-13 · 反馈箱导航按钮样式统一

### Changed
- 导航栏「反馈箱」入口按钮（`.nav-fb`，桌面 + 移动端）样式统一为与左侧主导航项一致：去掉浅蓝底（`--soft-blue`）与边框（`--soft-blue-line`），默认文字色 `var(--ink-soft)`、无背景，hover 才显示 `var(--soft)` 底色 + 主色文字；字号由硬编码 `14px` 改为 `inherit` 跟随正文字号缩放。
- 自测脚本 `verify-native.mjs` 断言同步：由「导航按钮用主色变量」改为 4 项新断言（无边框 / 默认 `--ink-soft` / hover 用 `--soft` / 移动端同左侧），总数 329 → **332 项**并全绿。

## [v1.4.0] - 2026-10-13 · 反馈提交成功提示

### Added
- 反馈提交成功后，对话框状态行显示**成功提示条**「已收到你的反馈，感谢！」：`.fb-status-ok` 由纯颜色升级为提示条样式（背景 `--soft-blue` / 边框 `--soft-blue-line` / 圆角 / 内边距，跟随明暗主题），视觉醒目。
- `feedback.js` 导出可测接口 `window.NB.feedback.submitFeedback`（走完整表单提交路径，供自测与复用）。

### Fixed
- 修复**提交成功提示从未显示**的时序缺陷（见 E-009）：`submitFeedback()` 先 `setStatus(fb.ok)` 再调 `resetForm()`，而 `resetForm()` 内的 `setStatus('')` 会把刚显示的成功提示**立即清空**。状态清空职责移至 `openBox()`（每次打开对话框时清空，成功/失败提示均不残留到下一次打开）。

### Changed
- 自测脚本 `verify-native.mjs` 由 **321 项扩充至 329 项**并全绿：新增 8 项断言（表单路径提交后状态行显示成功提示 / 带 `fb-status-ok` 类 / 内容区清空 / 记录数 +1 / 关闭重开后状态清空；CSS 断言：成功提示条走 `--soft-blue` 背景、有圆角、错误提示加粗）。

## [v1.3.0] - 2026-10-13 · 管理员口令门（admin.html）

### Added
- 反馈管理页新增**口令门**：访问 `admin.html` 默认锁定，仅显示验证区块（标题 / 说明 / 口令输入框 / 解锁按钮 / 错误提示），输入正确口令（`ADMIN_PASS`，源码常量，用户指定 `<管理员口令>`）后解锁显示统计与列表；解锁状态记入 `sessionStorage`（关闭标签页后需重新输入）。
- 口令为**软限制**：纯离线版源码可见，仅用于避免普通访客误入，不做真正的安全鉴权（已在页面说明文案中如实标注）。
- i18n 新增 `admin.gateTitle / gateDesc / gatePh / gateUnlock / gateErr / gateLockedHint`（zh/en 各 6 键）；CSS 新增 `.admin-gate` 系列样式（走主题变量）；`page-admin.js` 导出可测接口 `window.NB.admin.checkPass / unlock`。

### Changed
- 自测脚本 `verify-native.mjs` 由 **307 项扩充至 321 项** 并全绿：新增口令门断言 10+ 项（默认锁定 / 管理区隐藏 / 错误口令拒绝 + 提示 / 正确口令解锁 / 解锁后渲染与回复流程不受影响 / 口令门样式走变量）。反馈箱对话框内「反馈管理」入口保留（点击后由口令门拦截）。

### Docs
- `PROJECT_SCOPE.md` → v5.4；`PLAN.md` → v27；`DEV_LOG.md` 新增 2026-10-13 口令门条目；`build-docs.mjs` 已重跑（站内「项目文件」页同步，14 个文件不变）。

---

## [v1.2.0] - 2026-10-13 · 反馈箱 + 反馈管理页（4 栏目 7 页）

### Added
- 新增**反馈箱**：顶部导航「关于」右侧新增「反馈箱」按钮（`<button>`，不算栏目位，主导航 `<a>` 仍为 4 项），点击打开全局对话框（`<dialog>` + `showModal` 回退）：反馈类型选择（问题 / 使用建议 / 功能想法 / 其他，选「其他」时展开补充输入框）、**设备自动识别**为只读（电脑 / 平板 / 手机）、内容限 1000 字（带字数统计）、提交后写入 localStorage（键 `nb-feedback`，上限 100 条）；对话框内含「我的留言」折叠区（待回复 / 已回复徽标）与反馈管理入口。
- 新增**反馈管理页**（`admin.html` + `assets/js/page-admin.js`）：统计胶囊（共 N 条 / 未读 N 条）、反馈列表（类型 / 设备 / 来源页 / 待回复·已回复·未读徽标）、**回复写回 `replies[]` 并自动标已读**、单条已读 / 未读切换、**全部标为已读**。
- 新增全局脚本 `assets/js/feedback.js`（7 个页面均加载，经 `window.NB.feedback` 导出 load / save / detectDevice / createRecord / saveRecord / submit / openBox / closeBox）；i18n 新增 `fb.*`（36 键）与 `admin.*`（17 键）中英文案；CSS 新增反馈箱 + 管理页全套样式（全部走主题变量，明 / 暗主题与字号缩放均跟随）。
- 存储模型：记录 `{ id, at, type, other, device, page, body, replies[] }`；`read` 由管理端切换（缺省为未读）。

### Changed
- 自测脚本 `verify-native.mjs` 由 **267 项扩充至 307 项** 并全绿：PAGES / SCRIPTS 常量新增 `admin.html` / `feedback.js` / `page-admin.js`，新增「八、反馈箱 + 反馈管理」断言区块 40+ 项（导航按钮位置 / dialog 打开 / **dialog 内不嵌套 dialog** / 提交写入 / 记录字段 / 空内容拒绝 / admin 渲染 / 回复写回 / 全部已读 / CSS 变量约定）。交付由 4 栏目 6 页变为 **4 栏目 7 页**（新增反馈管理页）。

### Fixed
- 反馈箱校验逻辑缺陷：类型校验 `!TYPE_IDS.indexOf(tVal) >= 0` 恒为真（`indexOf` 返回 -1 时 `!-1` 为 false），改为 `TYPE_IDS.indexOf(tVal) < 0`；`createRecord` 内部统一 `trim`，空内容 / 超 1000 字一律拒绝，见 `ERROR_LOG.md` E-007。
- **反馈箱弹窗不显示缺陷**：`ensureDlg()` 用 `createElement("dialog")` 建外层 dialog 后塞入 `dialogHtml()` 字符串，而该字符串又自带 `<dialog>` 包裹 → 实际 DOM 为 dialog 套 dialog（重复 id），外层 `showModal()` 只渲染遮罩，内层 dialog 因未 open（`display:none`）把 `.fb-card` 全部内容藏住，点击后只见遮罩不见弹窗。修复：`dialogHtml()` 只返回 `.fb-card` 内部结构，外层 dialog 补 `aria-labelledby`；新增回归断言「dialog 内不嵌套 dialog」，见 `ERROR_LOG.md` E-008。

### Docs
- `PROJECT_SCOPE.md` → v5.3；`PLAN.md` → v26；`DEV_LOG.md` 新增 2026-10-13 条目；`ERROR_LOG.md` 新增 E-007 与 E-008；`build-docs.mjs` 已重跑（站内「项目文件」页同步新版文档，14 个文件不变）。
- **「关于」页副本 `neurobase.html` 经用户确认删除**（2026-10-13，人工验收期间用户删除）：交付保持 4 栏目 7 页（`index` / `terms` / `term` / `reading` / `docs` / `about` / `admin`），自测清单 PAGES 同步移除对应 6 项断言（311 → 307 全绿）；历史版本 v1.1.0 / v24 中的落盘记录保留不改写。

---

## [v1.1.0] - 2026-10-13 · 第 1 批扩容（4 栏目 6 页）

### Added
- 新增**教材导读**页（`reading.html` + `assets/js/page-reading.js`）：55 本教材/文献（中文标题优先 + 英文副标题）、难度徽章、作者 / 版次·年份·出版社·语言 / 分类名、自撰导读引用块、模块徽章；9 个分类 chip（`aria-pressed` + 条数）、5 条学习路径；支持 `?cat=` 分类筛选与 `?book=<id>` 定位高亮（配提示条 + `scrollIntoView`）。
- 新增**项目文件**页（`docs.html` + `assets/js/page-docs.js`）：`docs/` 下 md/json/sql 按目录分组列出（扩展名徽章 + 标题 + 体积），`?doc=<slug>` 渲染阅读（Markdown → 内联 HTML；json/sql → `<pre>` 原样转义）；未收录文档显示「未找到该文档」。
- 新增**关于**页（`about.html` + `assets/js/page-about.js`）：项目定位、负责人、知识模块数（11）与词条目标（各模块 target 合计 300 → 显示 `300+`）实时算出、内容准确性声明、可折叠「项目信息与数据来源」、项目文件入口（按钮文案填入真实文件数）。
- 按用户指定把「关于」页副本落盘为 **`neurobase.html`**（SHA256 与 `about.html` 逐字节一致）。
- 新增文档构建脚本 `build-docs.mjs`（Markdown 子集渲染器 + `docs/` 扫描清单 + 自检），页面数据 `data/reading.js` / `data/docs-content.js` / `data/docs-meta.js`。

### Changed
- 顶部导航 `reading` / `about` 两项**解除置灰**，4 个栏目全部可点（移除「功能开发中」置灰渲染分支）；`docs.html` 归属「关于」栏目。
- 自测脚本 `verify-native.mjs` 由 183 项扩充至 **267 项**并全绿（PAGES / SCRIPTS 抽为常量，新增三页 60+ 项断言）。

### Fixed
- 项目文件详情页路径栏漏 `docs/` 前缀（`PLAN.md` → `docs/PLAN.md`），见 `ERROR_LOG.md` E-006。

### Docs
- `PROJECT_SCOPE.md` → v5.1；`PLAN.md` → v24；`DEV_LOG.md` 新增 2026-10-13 条目。

---

## [v1.0.0] - 2026-10-11 · 原生离线版第 1 批（核心三页）

### Changed
- 前端由 Vue 3 + Vite 全栈版**重写为原生 HTML / CSS / JavaScript**（无框架、无构建、无 CDN）：交付为单目录 `outputs/neurobase/`，**双击 `index.html` 离线可用**；词条与文案唯一数据源迁至 `data/`；检索由 Fuse.js 改为自写打分脚本（含 `<mark>` 高亮）。
- 第 1 批交付首页 / 术语检索 / 词条详情三页（D-023 / D-027~D-030 交互与视觉契约沿用）。

### Fixed
- 缺少 `matchMedia` 的环境下整页脚本中断（首页白屏），见 `ERROR_LOG.md` E-005。

### Docs
- `PROJECT_SCOPE.md` → v5.0；`PLAN.md` → v23；`DECISIONS.md` 新增 D-031。

---

## [v0.1.0] - 2026-10-10 · Vue 全栈原型（已归档）

### Added
- Phase 0 脚手架与词条 schema 冻结（`docs/schema/term.schema.json` v1.0）；Phase 1 内容扩建 4 批次：11 模块 × 各 10 条 = **110 条**词条（来源可溯、`related` 无断链）。
- 使用指南「聚光灯就近引导」；顶端工具栏（主题 / 字号 / 中英切换）；学习进度与「继续学习」悬浮键；词条页「最近浏览」折叠栏；项目文档页（`docs/` 自动收录）。

### Changed
- 字号调节：三档百分比 → 25%–300% 连续滑块 → 只缩放正文文本（D-027 ~ D-029）。

### Docs
- 阶段文档体系（PLAN / PROJECT_SCOPE / DECISIONS / ERROR_LOG / RESEARCH / READING_LIST）建立；原型备份见 `.deepworks/archive/vue-app-v1/` 与 `.deepworks/archive/vue-dist-v1/`。

---

> 历史里程碑明细（每日小步）见 `docs/DEV_LOG.md`；错误与教训见 `docs/ERROR_LOG.md`。

