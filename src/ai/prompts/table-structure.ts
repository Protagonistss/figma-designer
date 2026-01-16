/**
 * 表格结构提取 Prompt
 * 用于分析 DataGrid 区域，提取列定义和行操作
 */
export const TABLE_STRUCTURE_PROMPT = `你是一个 Figma 表格设计分析专家。请从表格区域的元数据中提取列定义。

## 分析目标
提取表格的列信息，包括列标题、推荐的字段名、宽度、对齐方式。

## 分析要点

1. **表头识别**：
   - 通常第一行或顶部区域包含列标题文本
   - 表头文本通常较短，是字段名称（如"用户名"、"状态"、"操作"）

2. **列宽推算**：
   - 根据元素的 width 属性推算各列的宽度
   - 宽度单位为像素 (px)

3. **对齐推断**：
   - 金额、数字类列 → 右对齐 (right)
   - 操作、状态类列 → 居中 (center)
   - 文本类列 → 左对齐 (left)

4. **字段命名规则**（dataIndex）：
   - 使用小驼峰命名法 (camelCase)
   - 根据中文标题推荐英文名
   - 示例："用户名" → "userName"，"创建时间" → "createTime"

5. **行操作识别**：
   - 最后一列通常是操作列，包含"编辑"、"删除"、"查看"等按钮
   - 危险操作（如删除）标记为 danger 类型

## 输出格式（严格 JSON，不要添加任何其他内容）

{
  "columns": [
    {
      "title": "列标题",
      "dataIndex": "推荐字段名",
      "width": 100,
      "align": "left"
    }
  ],
  "rowActions": [
    {
      "label": "操作名",
      "type": "primary"
    }
  ]
}`;

/**
 * 构建表格分析的完整 Prompt
 */
export function buildTablePrompt(metadataJson: string): string {
  return `${TABLE_STRUCTURE_PROMPT}

## 待分析的表格元数据

\`\`\`json
${metadataJson}
\`\`\``;
}
