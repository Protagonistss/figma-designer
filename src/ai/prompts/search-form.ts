/**
 * 搜索表单提取 Prompt
 * 用于分析 SearchArea 区域，提取表单字段定义
 */
export const SEARCH_FORM_PROMPT = `你是一个 Figma 表单设计分析专家。请从搜索区域的元数据中提取表单字段。

## 分析目标
识别搜索区域中的输入控件，提取字段标签、类型、占位符。

## 字段类型识别规则

1. **input（输入框）**：
   - 普通文本输入框
   - 包含"请输入"占位符

2. **select（下拉选择）**：
   - 通常有向下箭头图标
   - 包含"请选择"占位符
   - 节点名称中可能包含 dropdown/select

3. **date（日期选择）**：
   - 包含"日期"、"时间"等关键词
   - 可能有日历图标

4. **dateRange（日期范围）**：
   - 包含"开始"、"结束"或"~"符号
   - 有两个日期输入框

## 字段命名规则（name）
- 使用小驼峰命名法 (camelCase)
- 根据中文标签推荐英文名
- 示例："用户名" → "userName"，"创建时间" → "createTime"

## 输出格式（严格 JSON，不要添加任何其他内容）

{
  "fields": [
    {
      "label": "字段标签",
      "name": "推荐字段名",
      "type": "input",
      "placeholder": "占位符文本"
    }
  ]
}`;

/**
 * 构建搜索表单分析的完整 Prompt
 */
export function buildSearchPrompt(metadataJson: string): string {
  return `${SEARCH_FORM_PROMPT}

## 待分析的搜索区元数据

\`\`\`json
${metadataJson}
\`\`\``;
}
