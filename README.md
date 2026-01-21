# Figma Designer (AI)

Figma Designer 是一款 AI 驱动的 Figma 插件，能将您的设计稿智能解析为结构化的 JSON 数据，赋能 Design-to-Code 流程。

## ✨ 核心功能

- **🧠 智能页面分析**：自动识别页面类型（如列表页、表单页）和核心功能区（如搜索区、表格、分页器）。
- **🤖 灵活的图层识别**：无需严格的图层命名规范，AI 可通过结构和属性推断其业务含义。
- **📄 标准化 JSON 输出**：生成逻辑清晰、结构化的数据，可直接对接低代码平台或用于前端代码生成。

## 🚀 快速开始

### 1. 环境准备

- 克隆本仓库到本地。
- 基于 `.env.example` 创建 `.env` 文件，并填入你的 AI API Key。
- 安装依赖：
  ```bash
  pnpm install
  ```

### 2. 开发模式

- 运行开发服务器，该命令会监听文件变化并自动构建：
  ```bash
  pnpm dev
  ```

### 3. 在 Figma 中安装插件

- 在 Figma 桌面应用中，打开一个设计文件。
- 通过菜单 `Plugins` > `Development` > `Import plugin from manifest...`。
- 选择 `packages/plugin/manifest.json` 文件导入插件。

## 🛠️ 如何使用

1.  在 Figma 中，选中一个顶层 **Frame**。
2.  运行 `Figma Designer` 插件。
3.  插件将自动分析图层，调用 AI 解析，并在界面中展示结构化的 JSON 结果。

## 🏛️ 项目结构

本项目是一个 monorepo，包含以下几个主要部分：

- `packages/plugin`: Figma 插件的核心逻辑。
- `packages/ui`: 插件的用户界面，使用 React 和 Vite 构建。
- `packages/ai`: 管理 AI 提示词（Prompts）和 API 调用。
- `packages/shared`: 各个包之间共享的类型、常量和工具函数。

## 📜 主要开发命令

```bash
# 安装所有依赖
pnpm install

# 启动开发模式
pnpm dev

# 构建生产版本
pnpm build

# 格式化与代码检查
pnpm lint
```
