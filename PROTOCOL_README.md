# Figma设计图解析协议层

## 概述

协议层是Figma设计图解析的核心组件，提供了智能化的设计图识别能力。通过命名约定协议和布局识别协议，能够准确识别各种UI组件和它们的关联关系。

## 架构设计

```
┌─────────────────────────────────────┐
│           应用层 (Application)      │
├─────────────────────────────────────┤
│           协议层 (Protocol)         │
│  ┌─────────────────────────────────┐ │
│  │     命名约定协议处理器           │ │
│  │     布局识别协议处理器           │ │
│  │     组件映射协议处理器           │ │
│  └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│           核心层 (Core)           │
│  ┌─────────────────────────────────┐ │
│  │     Figma API 封装层           │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 核心功能

### 1. 命名约定协议 (Naming Convention Protocol)

#### 功能特点
- **智能模式匹配**：支持中英文混合识别
- **复合名称解析**：解析"search-input-field"等复合命名
- **业务类型推断**：自动识别组件的业务用途
- **命名验证**：提供命名规范检查和改进建议

#### 支持的模式
```typescript
// 搜索相关
searchPatterns: ['search', 'filter', '搜索', '筛选', '查询', 'find']

// 表格相关  
tablePatterns: ['table', 'grid', '表格', '列表', 'data', 'datalist']

// 输入组件
inputPatterns: ['input', 'field', '输入', '字段', 'textfield', 'text']
selectPatterns: ['select', 'dropdown', '选择', '下拉', 'picker']
datePatterns: ['date', 'time', '日期', '时间', 'calendar']

// 按钮组件
buttonPatterns: ['button', 'btn', '按钮', '提交', '确认', '操作']
```

#### 使用示例
```typescript
import { NamingProtocolHandler } from './protocol/namingProtocol';

const namingHandler = new NamingProtocolHandler();

// 判断组件类型
namingHandler.isSearchArea('search-container'); // true
namingHandler.isInputComponent('user-input-field'); // true

// 解析复合名称
const parsed = namingHandler.parseCompoundName('search-input-field');
// 返回: { prefix: 'search', type: 'input', suffix: 'field', parts: ['search', 'input', 'field'] }

// 验证命名规范
const validation = namingHandler.validateName('my-component');
// 返回: { isValid: boolean, issues: string[], suggestions: string[] }
```

### 2. 布局识别协议 (Layout Recognition Protocol)

#### 功能特点
- **精确位置计算**：支持水平/垂直距离和对齐判断
- **智能关联识别**：识别标签-输入框、按钮组等常见模式
- **表格结构检测**：自动识别表格的行列结构
- **布局容错处理**：提供位置容差和边界检测

#### 核心算法
```typescript
// 标签-输入框对识别
isLabelInputPair(labelNode, inputNode): boolean

// 表格结构识别
isTableStructure(nodes): boolean

// 按钮组识别
isButtonGroup(nodes): boolean

// 行列分组
groupByRows(nodes): SceneNode[][]
```

#### 使用示例
```typescript
import { LayoutProtocolHandler } from './protocol/layoutProtocol';

const layoutHandler = new LayoutProtocolHandler();

// 判断对齐关系
layoutHandler.isHorizontallyAligned(node1, node2); // true/false
layoutHandler.isSameRow(node1, node2); // true/false

// 识别标签-输入框对
if (layoutHandler.isLabelInputPair(textNode, rectangleNode)) {
  console.log('发现表单字段');
}

// 识别表格结构
const nodes = [...container.children];
if (layoutHandler.isTableStructure(nodes)) {
  const rows = layoutHandler.groupByRows(nodes);
  console.log(`发现表格：${rows.length}行，${rows[0].length}列`);
}
```

### 3. 综合协议分析

#### 功能特点
- **多维度分析**：结合命名、布局、类型等多维度信息
- **置信度评估**：为每个识别结果提供置信度分数
- **智能回退**：当主要识别失败时自动使用备选方案
- **可扩展性**：支持自定义识别规则和权重配置

#### 使用示例
```typescript
import { ProtocolManager } from './protocol';

const protocolManager = new ProtocolManager();

// 综合节点分析
const analysis = protocolManager.analyzeNode(node);
console.log(`
  业务类型: ${analysis.businessType}
  置信度: ${(analysis.confidence * 100).toFixed(1)}%
  分析依据: ${analysis.reasons.join(', ')}
`);
```

## 配置说明

### 命名约定配置
```typescript
// 可自定义的模式配置
const NamingConventionConfig = {
  searchPatterns: ['search', 'filter', '搜索', '筛选'],
  tablePatterns: ['table', 'grid', '表格', '列表'],
  inputPatterns: ['input', 'field', '输入', '字段'],
  caseSensitive: false,  // 大小写敏感
  separators: ['-', '_', '.', ' ', '·']  // 分隔符
};
```

### 布局识别配置
```typescript
// 可调节的识别参数
const LayoutRecognitionConfig = {
  associationRules: {
    labelInputDistance: 50,      // 标签输入框最大距离
    alignmentThreshold: 20,      // 对齐容差
    groupProximity: 100,         // 组间距阈值
    rowHeightThreshold: 15       // 同行判断阈值
  },
  hierarchyRules: {
    maxDepth: 4,                 // 最大遍历深度
    skipInvisible: true,         // 跳过隐藏节点
    containerTypes: ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE']
  }
};
```

### 解析器配置
```typescript
// 性能和调试配置
const ParserConfig = {
  debug: {
    enableLogging: true,
    logLevel: 'info',  // 'debug' | 'info' | 'warn' | 'error'
    logNodeStructure: true,
    logProcessingSteps: true
  },
  performance: {
    maxNodesPerIteration: 1000,
    useCaching: true,
    cacheTimeout: 300000  // 5分钟
  },
  errorHandling: {
    continueOnError: true,
    fallbackToHeuristics: true,
    maxRetries: 3
  }
};
```

## 集成使用

### 基础集成
```typescript
import { ProtocolManager } from './protocol';
import { processTablePage } from './core/processor/enhancedTableProcessor';

// 在Figma插件中使用
async function main() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify("请先选择一个节点");
    return;
  }

  const rootNode = selection[0];
  
  // 使用增强的处理器
  const model = processTablePage(rootNode);
  
  console.log("解析结果:", JSON.stringify(model, null, 2));
  const searchCount = model.body.search?.fields.length || 0;
  const columnCount = model.body.table.columns.length || 0;
  figma.notify(`解析成功! 搜索项: ${searchCount}, 表格列: ${columnCount}`);
}
```

### 高级用法
```typescript
// 自定义协议配置
const customProtocolManager = new ProtocolManager();
const namingProtocol = customProtocolManager.getNamingProtocol();

// 动态添加新的识别模式
namingProtocol.config.searchPatterns.push('query', '查找');

// 使用协议进行复杂分析
const complexAnalysis = (node: SceneNode) => {
  const naming = namingProtocol.getBusinessType(node.name);
  const layout = layoutProtocol.isTableStructure([...node.children]);
  
  return {
    componentType: naming,
    isStructured: layout,
    confidence: naming !== 'unknown' ? 0.8 : 0.3
  };
};
```

## 性能优化

### 缓存机制
- 节点分析结果缓存（5分钟超时）
- 协议配置缓存
- 模式匹配结果缓存

### 性能调优
- 可调节的最大遍历深度
- 可配置的处理节点数量限制
- 智能跳过不可见节点

### 错误处理
- 容错处理机制
- 自动回退到启发式算法
- 最大重试次数限制

## 扩展开发

### 添加新的协议处理器
```typescript
// 创建新的协议处理器
class CustomProtocolHandler {
  analyze(node: SceneNode): AnalysisResult {
    // 自定义分析逻辑
    return {
      type: 'custom',
      confidence: 0.9,
      metadata: {}
    };
  }
}

// 集成到协议管理器
protocolManager.registerProtocol('custom', new CustomProtocolHandler());
```

### 自定义识别规则
```typescript
// 扩展现有处理器
class ExtendedNamingProtocol extends NamingProtocolHandler {
  isCustomComponent(name: string): boolean {
    // 自定义识别逻辑
    return name.includes('custom') || name.includes('自定义');
  }
}
```

## 最佳实践

### 1. 命名规范建议
```
✅ 推荐命名：
- search-input-field（搜索输入框）
- user-table-header（用户表格表头）  
- date-picker-component（日期选择器）
- submit-button-primary（主要提交按钮）

❌ 避免命名：
- node1, rectangle2（无意义命名）
- mycomponent（缺少分隔符）
- SEARCH_INPUT（不符合约定）
```

### 2. 布局设计建议
```
✅ 推荐布局：
- 标签和输入框水平对齐，间距适中
- 表格行列整齐，表头清晰
- 按钮组保持相同高度和间距
- 使用容器合理分组相关组件

❌ 避免布局：
- 组件重叠或过于分散
- 文本和输入框垂直距离过大
- 表格行列不对齐
- 缺乏视觉层次结构
```

### 3. 配置优化建议
- 根据实际项目调整识别阈值
- 添加项目特定的命名模式
- 合理设置调试级别避免性能问题
- 定期清理缓存保证结果准确性

## 故障排除

### 常见问题

1. **识别准确率低**
   - 检查命名是否符合约定
   - 调整布局识别阈值
   - 启用调试模式查看详细日志

2. **性能问题**
   - 减少最大遍历深度
   - 关闭详细调试日志
   - 启用缓存机制

3. **协议冲突**
   - 检查模式匹配优先级
   - 调整置信度权重
   - 自定义冲突解决规则

### 调试技巧
```typescript
// 启用详细调试
ParserConfig.debug.enableLogging = true;
ParserConfig.debug.logLevel = 'debug';

// 查看协议分析过程
const analysis = protocolManager.analyzeNode(node);
console.log('分析详情:', analysis);
```

## 更新日志

### v1.0.0
- ✨ 初始版本发布
- ✨ 命名约定协议实现
- ✨ 布局识别协议实现  
- ✨ 综合协议分析功能
- ✨ 可配置化架构设计

---

通过协议层的强大功能，你可以构建更加智能和准确的Figma设计图解析应用。协议层提供了灵活的配置选项和扩展能力，能够适应各种不同的设计图解析需求。