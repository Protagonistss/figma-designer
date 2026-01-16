/**
 * 工具栏按钮提取 Prompt
 * 用于分析 ActionGroup 区域，提取全局操作按钮
 */
export const TOOLBAR_ACTIONS_PROMPT = `你是一个 Figma 界面设计分析专家。请从工具栏区域的元数据中提取操作按钮。

## 分析目标
识别工具栏中的操作按钮，提取按钮标签、类型、图标信息。

## 按钮类型识别规则

1. **primary（主要按钮）**：
   - "新增"、"创建"、"添加" 等核心操作
   - 通常背景色为主题色（蓝色、绿色等）

2. **default（默认按钮）**：
   - "导出"、"刷新"、"筛选" 等辅助操作
   - 通常是白底或灰底

3. **danger（危险按钮）**：
   - "批量删除"、"清空" 等危险操作
   - 通常是红色

## 图标推断规则
- "新增/添加" → "plus"
- "导出" → "export" 或 "download"
- "刷新" → "refresh" 或 "reload"
- "删除" → "delete" 或 "trash"
- "编辑" → "edit" 或 "pen"
- "搜索" → "search"

## 输出格式（严格 JSON，不要添加任何其他内容）

{
  "actions": [
    {
      "label": "按钮名称",
      "type": "primary",
      "icon": "plus"
    }
  ]
}`;

/**
 * 构建工具栏分析的完整 Prompt
 */
export function buildToolbarPrompt(metadataJson: string): string {
  return `${TOOLBAR_ACTIONS_PROMPT}

## 待分析的工具栏元数据

\`\`\`json
${metadataJson}
\`\`\``;
}
