## 任务

分析提供的**仪表盘页（Dashboard Page）**设计，识别页面中的各个功能区域，并提取结构化内容。

## 页面特征

仪表盘页通常包含以下区域：
- **Header**：页面头部，标题、时间筛选器
- **StatCard**：统计卡片，数值展示、趋势指标
- **ChartArea**：图表区域，折线图、柱状图、饼图等
- **DataGrid**：数据表格（可选），展示详细数据

## 输出结构

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
