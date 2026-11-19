---
title: "RESEARCH · 参考调研报告"
project: "NeuroBase 神经与认知科学基础知识库"
version: "1.0"
author: "WT"
status: "Active"
last_updated: "2026-10-10"
language: "zh-CN"
---

# RESEARCH · 参考调研报告

> 对应课程八阶段中的 **03 RESEARCH**。
> 原则：*Software development is often composition, not invention from zero.*
> 复用原则：**Borrow the simplest useful part, not the whole complexity.**
> 本文回答：别人做过什么、我们复用什么、复用时必查的五项（License / 维护状态 / 适配度 / 复杂度 / 是否理解）。

---

## 一、同类产品调研（做参考，不照搬）

| 产品 / 站点 | 定位 | 可借鉴之处 | 局限 / 注意 |
| --- | --- | --- | --- |
| BrainFacts.org（美国神经科学学会 SfN） | 面向大众的神经科学科普 | 术语科普写法、图文配合、分级阅读 | 英文、无中文术语、无检索式词库 |
| Wikipedia 神经科学 / 认知科学条目 | 百科式定义 | 定义结构与英文术语对照 | 内容质量参差、许可为 CC BY-SA，**不可整段复制** |
| Khan Academy（Biology / Neural systems） | 教学视频+练习 | 测验与知识点的组织方式 | 英文、无 BCI 专项 |
| 3D Brain（DNA Learning Center） | 交互式脑解剖 | 脑区点选与标注的交互范式 | 无术语检索与自测 |
| Neuroscience Online（UTHealth） | 系统神经科学教材 | 章节结构、通路讲解 | 英文、深度偏研究生 |
| Anki 神经解剖/神经科学牌组 | 记忆卡片 | 闪卡字段设计、间隔重复思路 | 无中文术语库、无检索 |
| 《神经科学原理》（Kandel）《认知神经科学》等教材 | 权威内容来源 | 术语定义与机制的权威依据 | **受版权保护，禁止复制原文**，仅作事实核对基准 |
| 开源 BCI 资料（OpenBCI、P300/SSVEP 范式讲解） | BCI 方向入门 | BCI 术语与范式条目的内容框架 | 需按本科入门深度裁剪 |

**结论**：市场上"权威内容"与"好用检索 + 中文术语 + 自测"往往分离。NeuroBase 的差异化定位 = **中英双语术语检索 + 模块化科普卡片 + 自测工具**三合一，面向脑机接口方向本科生。

---

## 二、可复用的开源组件（候选，均需过"五项检查"）

### 2.1 前端

| 组件 | 用途 | License | 维护状态 | 适配度 | 复杂度 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| React + Vite | 前端框架 + 构建 | MIT | 活跃 | 高 | 中 | 主流、生态成熟 |
| Vue 3 + Vite | 备选前端框架 | MIT | 活跃 | 高 | 中 | 与 React 二选一 |
| Tailwind CSS | 原子化样式 | MIT | 活跃 | 高 | 低 | 快速实现"蓝白学术风" |
| shadcn/ui | 无样式组件 | MIT | 活跃 | 中 | 中 | 按需复制，不带运行时依赖 |
| **Fuse.js** | 前端模糊检索 | Apache-2.0 | 活跃 | **高** | 低 | 支持拼音/模糊/权重，本地零后端 |
| Lucide Icons | 图标 | ISC | 活跃 | 高 | 低 | 轻量、风格统一 |
| react-markdown | 渲染词条富文本 | MIT | 活跃 | 中 | 低 | 若词条含 Markdown |

### 2.2 后端 / 服务

| 组件 | 用途 | License | 维护状态 | 适配度 | 复杂度 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| **Supabase (BaaS)** | 数据库 / Auth / RLS / RPC / Realtime | Apache-2.0（客户端） | 活跃 | **高** | 中 | 免自建后端；免费额度够用 |
| supabase-js | 前端 SDK | MIT | 活跃 | 高 | 低 | anon key 可公开，靠 RLS 保护 |
| **Cloudflare Workers (AI)** | AI 助教推理网关 | 平台服务 | 活跃 | **高** | 中 | 密钥留在服务端，前端不暴露 |
| Vercel / Netlify | 前端托管 | 平台服务 | 活跃 | 高 | 低 | 与 GitHub 集成，自动部署 |

### 2.3 复用前的五项检查（PDF 要求，逐项说明）

| 检查项 | 我们的结论 |
| --- | --- |
| **License 授权** | 只选 MIT / Apache-2.0 / ISC 等宽松许可；**禁止复制受版权教材原文**；CC BY-SA 类内容仅作事实核对、不整段搬运。 |
| **维护状态** | 只选近 12 个月有更新的活跃项目（如 Fuse.js、Tailwind、supabase-js）。 |
| **是否适合当前需求** | 检索用 Fuse.js 即可满足关键词/模糊/英文缩写；**不引入**重量级全文搜索引擎。 |
| **复杂度** | 不为"看起来专业"引入超出需求的技术；AI 助教走 Cloudflare Workers 网关，避免把密钥放前端。 |
| **是否理解它** | 每引入一个组件，需能用一句话解释它做什么（记录进 `DECISIONS.md`）。 |

---

## 三、内容来源与合规边界

- **事实核对基准**：主流教材与权威站点（Kandel、Bear、SfN、Wikipedia 等），仅用于核对事实与英文术语。
- **禁止**：直接复制受版权保护的教材原文、图表；引用需注明来源。
- **版权规避**：所有图采用自绘 SVG/示意图；词条说明用自撰表述。
- **AI 生成内容**：由 AI 起草 + 人工逐条审核（对应 Q6 的选择），不得编造作者/书名/年份/DOI。

---

## 四、调研结论（进入 DEFINE）

1. 项目**值得做**：中文 + 双语术语 + 检索 + 自测的整合型工具存在空白。
2. **复用什么**：Supabase（后端）、Cloudflare Workers（AI 网关）。前端最终**未采用** React/Vue + Vite + Tailwind 与 Fuse.js —— 用户要求「双击 `index.html` 即可离线使用」，故改为**原生 HTML/CSS/JS + 自写打分检索**（见 `docs/DECISIONS.md` D-031）。
3. **不做什么**：不复制版权原文、不自建后端、不引入重量级搜索引擎、不做科研级精度。
4. 下一步：写入 `PROJECT_SCOPE.md`（做什么）与 `PLAN.md`（怎么做、分几阶段）。
