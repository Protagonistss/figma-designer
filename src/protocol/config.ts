// 表格识别协议配置 - 灵活角色驱动架构
// 对应结构: Container -> (Header, Body -> (Search, Actions, Grid, Pagination))

// 1. 逻辑角色定义 (Logical Roles)
export type TableRole = 
  | 'TableContainer' 
  | 'HeaderArea' 
  | 'BodyArea' 
  | 'SearchArea' 
  | 'ActionGroup' 
  | 'DataGrid' 
  | 'PaginationBar';

// 2. 结构定义 (Structure Definition)
export const TableStructure = {
  root: 'TableContainer' as TableRole,
  // 层级关系定义
  hierarchy: {
    'TableContainer': ['HeaderArea', 'BodyArea'],
    'BodyArea': ['SearchArea', 'ActionGroup', 'DataGrid', 'PaginationBar']
  } as Record<string, string[]>,
  
  // 必须存在的组件 (用于完整性校验)
  required: ['DataGrid']
};

// 3. 节点名称匹配规则 (Node Name Matchers)
// 支持关键词、正则、模糊匹配
export const NodeNameMatchers: Record<TableRole, {
  keywords: string[];
  patterns: RegExp[];
  excludes?: string[];
  weight: number; // 匹配权重
}> = {
  'TableContainer': {
    keywords: ['table-container', 'table-wrapper', 'table-box', 'grid-container'],
    patterns: [/table.*container/i, /grid.*wrapper/i],
    weight: 1.0
  },
  'HeaderArea': {
    keywords: ['header', 'title', 'caption', 'top-bar', 'heading', '标题栏'],
    patterns: [/table.*header/i, /page.*title/i],
    weight: 0.8
  },
  'BodyArea': {
    keywords: ['body', 'content', 'main', 'wrapper', 'container', '主体', '内容区'],
    patterns: [/table.*body/i, /main.*content/i, /content.*area/i],
    weight: 1.0
  },
  'SearchArea': {
    keywords: ['search', 'filter', 'query', 'find', '搜索', '查询', '筛选', '过滤'],
    patterns: [/search.*/i, /filter.*/i, /query.*/i],
    weight: 0.9
  },
  'ActionGroup': {
    keywords: ['actions', 'buttonGroup', 'tools', 'toolbar', 'buttons', 'operations', '工具栏', '操作', '按钮组'],
    patterns: [/action.*/i, /tool.*bar/i, /button.*group/i],
    weight: 0.85
  },
  'DataGrid': {
    keywords: ['table', 'grid', 'list', 'data', 'columns', 'rows', '列', '数据表', '列表', '网格'],
    patterns: [/data.*grid/i, /table.*list/i],
    excludes: ['container', 'wrapper'], // 避免匹配到外层容器
    weight: 1.2 // 核心组件权重最高
  },
  'PaginationBar': {
    keywords: ['pagination', 'pager', 'footer', 'page-control', '分页', '翻页', '页码'],
    patterns: [/page.*/i, /pagination.*/i],
    weight: 0.9
  }
};

// 4. 表格识别配置 (Main Config)
export const TableRecognitionConfig = {
  // 识别策略
  strategies: {
    // 角色匹配优先
    roleMatching: {
      enable: true,
      minConfidence: 0.6
    },
    // 结构验证
    structureValidation: {
      enable: true,
      strictMode: false // 允许缺少部分非必须组件
    }
  },

  // 视觉特征配置 (辅助识别)
  visualFeatures: {
    'DataGrid': {
      hasGridLines: true,
      minChildren: 2, // 至少有表头和一行数据
      layout: 'vertical' // 通常是垂直布局
    },
    'SearchArea': {
      layout: 'horizontal', // 通常是水平排列的输入框
      containsInput: true
    },
    'PaginationBar': {
      position: 'bottom',
      layout: 'horizontal'
    }
  }
};

// 5. 智能识别引擎 (Engine)
export const TableIntelligenceEngine = {
  // 核心：解析节点角色
  resolveNodeRole(node: any): { role: TableRole | null; confidence: number } {
    const name = (node.name && node.name.toLowerCase()) || '';
    let bestMatch = { role: null as TableRole | null, confidence: 0 };

    // 遍历所有角色定义进行匹配
    (Object.entries(NodeNameMatchers) as [TableRole, typeof NodeNameMatchers[TableRole]][]).forEach(([role, matcher]) => {
      let score = 0;
      
      // 1. 关键词匹配
      if (matcher.keywords.some((kw: string) => name.includes(kw.toLowerCase()))) {
        score += 0.6;
      }
      
      // 2. 正则匹配
      if (matcher.patterns.some((p: RegExp) => p.test(name))) {
        score += 0.8;
      }
      
      // 3. 排除规则
      if (matcher.excludes?.some((ex: string) => name.includes(ex.toLowerCase()))) {
        score = 0;
      }

      // 4. 归一化得分 (最高 1.0)
      const finalScore = Math.min(score, 1.0) * matcher.weight;
      
      if (finalScore > bestMatch.confidence) {
        bestMatch = { role, confidence: finalScore };
      }
    });

    return bestMatch;
  },

  // 核心：验证结构完整性
  validateStructure(identifiedNodes: Record<string, any>): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    // 检查必须组件
    TableStructure.required.forEach(role => {
      if (!identifiedNodes[role]) {
        missing.push(role);
      }
    });

    // 检查层级关系 (如果父节点存在，检查子节点是否在父节点内)
    // 注意：这里只做简单的存在性检查，实际几何包含检查由更底层的布局引擎处理
    
    return {
      valid: missing.length === 0,
      missing
    };
  },

  // 辅助：获取节点期望的父级角色
  getExpectedParent(role: TableRole): TableRole | null {
    for (const [parent, children] of Object.entries(TableStructure.hierarchy) as [string, string[]][]) {
      if (children.includes(role)) {
        return parent as TableRole;
      }
    }
    return null;
  }
};

// 6. 兼容性导出 (保持部分原有接口以防其他引用报错)
export const TableComponentMapping = {
  mappings: {}, // Placeholder
  // 可以在这里添加 Figma 类型到 TableRole 的映射
  figmaTypeToRole: {
    'FRAME': ['TableContainer', 'BodyArea', 'HeaderArea', 'SearchArea', 'DataGrid'],
    'INSTANCE': ['PaginationBar', 'ActionGroup'],
    'GROUP': ['ActionGroup']
  }
};

// ==========================================
// 恢复丢失的配置 (Recovered Configurations)
// ==========================================

export const ParserConfig = {
  debug: {
    enableLogging: false,
    logLevel: 'info'
  }
};

export const NamingConventionConfig = {
  common: {
    caseSensitive: false,
    searchPatterns: ['search', 'filter', 'query', 'find', '搜索', '查询', '筛选'],
    separators: ['-', '_', ' ']
  },
  table: {
    keywords: ['table', 'grid', 'list', 'data', '数据表', '列表'],
    top: {
      search: ['search', 'filter', 'query', '搜索', '查询'],
      title: ['title', 'caption', 'header', '标题'],
      toolbar: ['toolbar', 'tools', 'actions', '工具栏', '操作栏']
    },
    tableContent: {
      row: ['row', 'tr', 'record', '行', '记录'],
      cell: ['cell', 'td', 'col', 'column', '列', '单元格'],
      header: ['header', 'th', '表头']
    },
    actions: {
      column: ['action', 'operation', '操作'],
      items: ['edit', 'delete', 'view', 'modify', '编辑', '删除', '查看']
    },
    bottom: {
      pagination: ['pagination', 'pager', 'footer', '分页', '页码']
    }
  },
  form: {
    input: ['input', 'text', 'field', '输入框'],
    select: ['select', 'dropdown', 'picker', '选择器', '下拉'],
    date: ['date', 'time', 'calendar', '日期', '时间'],
    button: ['button', 'btn', '按钮', '页面切换'] // 临时添加 '页面切换' 以支持特定场景
  },
  layout: {
    container: ['container', 'wrapper', 'box', 'area', '容器', '区域'],
    content: ['content', 'body', 'main', '内容', '主体']
  }
};

export const LayoutRecognitionConfig = {
  associationRules: {
    alignmentThreshold: 5,
    rowHeightThreshold: 10,
    labelInputDistance: 20,
    labelInputVerticalDistance: 10
  },
  hierarchyRules: {
    textNodeType: 'TEXT',
    maxDepth: 10
  },
  positionRules: {
    tolerance: 2
  },
  visualRules: {
    inputMinWidth: 60,
    inputMinHeight: 20,
    inputMaxHeight: 60
  }
};
