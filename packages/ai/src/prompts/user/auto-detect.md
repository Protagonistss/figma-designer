## 任务

分析提供的页面设计，**自动识别页面类型**，然后提取结构化内容。

## 页面类型识别

首先判断页面属于以下哪种类型：

| 类型 | 典型特征 |
|------|----------|
| table | 包含数据表格、搜索区、分页器 |
| form | 包含表单字段、提交按钮 |
| dashboard | 包含统计卡片、图表 |

## 输出结构

根据识别出的页面类型，返回对应的 JSON 结构：

### table 类型
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

### form 类型
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

### dashboard 类型
```json
{
  "pageType": "dashboard",
  "pageTitle": "页面标题",
  "regions": [
    {
      "nodeId": "节点ID（可选）",
      "role": "Header|StatCard|ChartArea|DataGrid",
      "confidence": 0.0-1.0,
      "visualEvidence": "简述识别依据（仅视觉模式）"
    }
  ],
  "stats": [
    {
      "title": "指标名称",
      "valueType": "number|currency|percent"
    }
  ],
  "charts": [
    {
      "title": "图表标题",
      "chartType": "line|bar|pie|area|gauge",
      "dataKeys": ["key1", "key2"]
    }
  ]
}
```
