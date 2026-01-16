# Figma Designer Plugin (AI Driven)

**Figma Designer** 是一款基于 **AI 智能分析** 的 Figma 插件。它利用大语言模型（LLM）深度理解 Figma 设计稿，自动识别组件语义、页面结构及其业务逻辑，并将其转化为标准化的结构化数据（JSON），极大提升了从设计到代码（Design-to-Code）的转化效率。

## ✨ 核心特性

*   **🧠 AI 语义识别 (AI-Powered Analysis)**
    *   **深度理解**：利用 AI 识别页面类型（如列表页、表单页、详情页）。
    *   **智能提取**：自动识别并提取搜索区（Search）、表格（Table）、工具栏（Toolbar）和分页器（Pagination）的结构化信息。
    *   **模糊适配**：无需严格遵循特定命名规范，AI 能通过图层结构和属性推断业务含义。

*   **🛡️ 结构化元数据提取**
    *   高效提取 Figma 节点的样式、属性及层级关系。
    *   智能剪枝与深度限制，确保发送至 AI 的数据精简且高效。

*   **📤 标准化输出**
    *   生成符合业务逻辑的 `page-content` 数据结构。
    *   可直接对接低代码平台或用于生成前端代码（React/Vue）。

## 🚀 使用指南

### 1. 准备工作
*   Clone 本仓库。
*   安装依赖：`pnpm install`。
*   **配置环境变量**：
    *   复制 `.env.example` 为 `.env`。
    *   填写你的 AI API Key（目前默认支持智谱 AI `https://open.bigmodel.cn`）。

### 2. 插件安装
*   运行 `pnpm run build` 构建插件。
*   在 Figma 桌面端中，选择 `Plugins` -> `Development` -> `Import plugin from manifest...`。
*   选择项目根目录下的 `manifest.json`。

### 3. 运行解析
*   在 Figma 中选中一个 **Frame**（例如一个管理后台的列表页）。
*   运行插件 **Figma Designer**。
*   插件会自动分析选中节点，并调用 AI 进行深度语义解析。

## 🏗️ 架构说明

*   `src/extractor`: 负责从 Figma 节点中提取原始元数据。
*   `src/ai`: 包含 AI 提示词（Prompts）管理及 API 调用逻辑。
*   `src/processor`: 核心调度层，整合元数据提取与 AI 分析结果。
*   `src/ui`: 插件的前端交互界面。

## 🗺️ 演进路线 (Roadmap)

*   **Phase 1**: 增强 AI 对复杂表单和详情页的解析能力。
*   **Phase 2**: 支持导出更多样化的代码片段（如 Ant Design / Element Plus 模板）。
*   **Phase 3**: 引入多模态视觉模型，辅助图层识别。

---

### 开发命令

```bash
# 安装依赖
pnpm install

# 开启开发模式 (自动监听变化并重新构建)
pnpm run dev

# 执行构建
pnpm run build

# 代码检查
pnpm run lint
```