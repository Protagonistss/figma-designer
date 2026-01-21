## 任务

分析提供的**列表页（Table Page）**设计，识别页面中的各个功能区域，并提取结构化内容。

## 页面特征

列表页通常包含以下区域：
- **SearchArea**：搜索/筛选区，包含输入框、下拉框、搜索按钮
- **ActionGroup**：工具栏按钮组，新增、导出、刷新等操作按钮
- **DataGrid**：数据表格主体，包含表头行和数据行
- **PaginationBar**：分页器，页码、每页条数等

## 输出结构

```json
{
  "pageType": "table",
  "pageTitle": "页面标题",
  "regions": [
    {
      "nodeId": "节点ID（可选）",
      "role": "SearchArea|ActionGroup|DataGrid|PaginationBar",
      "confidence": 0.0-1.0,
      "visualEvidence": "简述识别依据（仅视觉模式）"
    }
  ],
  "search": {
    "fields": [
      { "label": "字段标签", "name": "fieldName", "type": "input|select|date|dateRange" }
    ]
  },
  "table": {
    "columns": [
      { "title": "列标题", "dataIndex": "fieldName", "width": 100, "align": "left|center|right" }
    ],
    "rowActions": [
      { "label": "操作名", "type": "primary|default|danger" }
    ]
  },
  "toolbar": {
    "actions": [
      { "label": "按钮名", "type": "primary|default", "icon": "plus|export|refresh" }
    ]
  },
  "pagination": {
    "enabled": true
  }
}
```
