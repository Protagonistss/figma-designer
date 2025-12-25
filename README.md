# Figma Designer Plugin (Protocol Driven)

**Figma Designer** 是一款基于「语义协议驱动」的智能 Figma 插件。它能自动解析 Figma 设计稿，识别组件语义（如搜索栏、表格、分页器等），并将其转化为标准化的结构化数据（Meta JSON）。

本项目的核心理念是将设计稿视为“代码的另一种表现形式”，通过统一的协议（Protocol）打通设计与开发之间的语义鸿沟。

## ✨ 核心特性

*   **🛡️ 协议驱动解析 (Protocol-Driven Parsing)**
    *   基于 `Semantic Dictionary`（语义词典）自动识别组件角色。
    *   **无需严格命名**：支持模糊匹配，例如 `Search`, `Query`, `查询`, `筛选` 均可被自动识别为 `SearchArea`。
    *   **层级感知**：自动理解 `TableContainer` -> `BodyArea` -> `DataGrid` 的包含关系。

*   **🧠 智能结构提取**
    *   **表格解析**：自动提取列名（Title）、列宽、对齐方式。
    *   **搜索区解析**：识别输入框、下拉选、日期选择器等表单项。
    *   **操作栏解析**：区分全局工具栏（Toolbar）和行内操作（Row Actions）。

*   **📤 标准化输出**
    *   一键导出 `meta.json`。
    *   数据结构清晰，包含 `header`, `body`, `search`, `table`, `pagination` 等标准字段。
    *   可直接对接低代码平台或用于生成前端代码（React/Vue）。

## 🚀 使用指南

1.  **安装插件**：
    *   Clone 本仓库。
    *   在项目根目录运行 `pnpm install` 安装依赖。
    *   运行 `pnpm run build` 构建插件。
    *   在 Figma 中选择 `Plugins` -> `Development` -> `Import plugin from manifest...`，选择 `manifest.json`。

2.  **运行解析**：
    *   在 Figma 中选中一个 **Frame**（通常是一个完整的页面设计，如“用户列表页”）。
    *   运行插件 **Figma Designer**。
    *   插件会自动分析选中节点及其子节点。

3.  **导出数据**：
    *   解析成功后，插件会弹出一个操作面板。
    *   点击 **"下载 meta.json"** 保存文件，或点击 **"复制 JSON"** 直接使用。

## 🏗️ 协议架构 (Protocol Architecture)

插件的核心逻辑位于 `src/protocol`，基于以下角色定义（Logical Roles）：

*   `TableContainer`: 页面容器
*   `HeaderArea`: 页面标题区
*   `BodyArea`: 内容主体
*   `SearchArea`: 搜索/筛选区
*   `ActionGroup`: 工具栏按钮组
*   `DataGrid`: 数据表格主体
*   `PaginationBar`: 分页器

## 🗺️ 未来计划 (Roadmap)

我们致力于打造最先进的设计-代码互通协议。以下是未来的演进路线：

### Phase 1: 协议增强 (Protocol Enhancement)
*   [ ] **多场景支持**：从目前的列表页（Table）扩展到：
    *   **表单页 (Form)**：支持复杂布局、校验规则解析。
    *   **详情页 (Detail)**：支持描述列表（Descriptions）、时间轴等。
    *   **仪表盘 (Dashboard)**：支持图表组件（Chart）的语义识别。
*   [ ] **复杂布局**：支持 Tabs 切换、Steps 步骤条、Modal 弹窗等嵌套结构的解析。

### Phase 2: 双向同步 (Bi-directional Sync)
*   [ ] **Code-to-Design (C2D)**：支持导入 JSON 数据，自动在 Figma 中生成或更新 UI 界面（反向工程）。
*   [ ] **Design-to-Code (D2C)**：内置代码生成器，直接将解析结果转换为可运行的 React/Vue/Angular 代码（对接 Ant Design, Element Plus 等组件库）。

### Phase 3: AI 智能赋能 (AI Intelligence)
*   [ ] **视觉识别**：引入多模态大模型（LLM/Vision），在图层命名不规范时，通过视觉特征自动推断组件角色。
*   [ ] **意图推导**：自动猜测业务含义（例如：识别出“金额”列并自动应用“右对齐”和“千分位”格式）。

### Phase 4: 设计系统深度集成
*   [ ] **Design Tokens**：自动提取并关联设计系统中的 Token（颜色、字体、间距），而非硬编码的像素值。
*   [ ] **组件库映射**：允许用户配置 Figma 组件与代码组件的映射关系表。

---

### 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式 (监听文件变化)
pnpm run dev

# 构建生产版本
pnpm run build
```
