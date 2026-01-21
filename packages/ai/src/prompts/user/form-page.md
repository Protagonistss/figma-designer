## 任务

分析提供的**表单页（Form Page）**设计，识别页面中的各个功能区域，并提取结构化内容。

## 页面特征

表单页通常包含以下区域：
- **Header**：页面头部，标题、面包屑
- **FormSection**：表单区块，包含标签和输入控件的组合
- **FormActions**：表单操作区，提交、取消、重置等按钮

## 输出结构

```json
{
  "pageType": "form",
  "pageTitle": "页面标题",
  "regions": [
    {
      "nodeId": "节点ID（可选）",
      "role": "Header|FormSection|FormActions",
      "confidence": 0.0-1.0,
      "visualEvidence": "简述识别依据（仅视觉模式）"
    }
  ],
  "sections": [
    {
      "title": "区块标题（可选）",
      "fields": [
        {
          "label": "字段标签",
          "name": "fieldName",
          "type": "input|select|textarea|date|number|switch|radio|checkbox",
          "required": true,
          "placeholder": "占位文本（可选）"
        }
      ]
    }
  ],
  "actions": [
    { "label": "按钮名", "type": "primary|default", "icon": "save|close" }
  ]
}
```
