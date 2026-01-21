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
  "regions": [...],
  "search": { "fields": [...] },
  "table": { "columns": [...], "rowActions": [...] },
  "toolbar": { "actions": [...] },
  "pagination": { "enabled": true }
}
```

### form 类型
```json
{
  "pageType": "form",
  "pageTitle": "页面标题",
  "regions": [...],
  "sections": [{ "title": "...", "fields": [...] }],
  "actions": [...]
}
```

### dashboard 类型
```json
{
  "pageType": "dashboard",
  "pageTitle": "页面标题",
  "regions": [...],
  "stats": [...],
  "charts": [...]
}
```
