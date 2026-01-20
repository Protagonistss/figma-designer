## 输出格式要求

返回严格的 JSON 格式（不要添加任何其他内容）。

### 命名规范

1. `dataIndex` 和 `name` 使用小驼峰命名法（如 `userName`、`createTime`）
2. 禁止使用 `field1`、`column1`、`button1` 等占位符命名
3. 字段名必须基于 `label`/`title` 或 `node.name` 生成

### 内容规范

1. `label`/`title` 优先使用 TEXT 节点中的文字内容
2. 若没有文本内容，可使用 `node.name` 作为兜底
3. `label`/`title` 不能为空字符串；若无法确定名称，直接省略该字段

### 结构规范

1. 如果某个区域不存在，对应字段可以省略
2. `confidence` 取值范围 0.0-1.0，表示识别置信度
3. 只返回 JSON，不要添加任何解释文字
