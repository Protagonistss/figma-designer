// 表格识别协议配置 - 语义驱动架构
// 核心原则：单一事实来源，语义 -> 角色 -> 动作

// 1. 逻辑角色定义 (Logical Roles)
export type TableRole = 
  | 'TableContainer' 
  | 'HeaderArea' 
  | 'BodyArea' 
  | 'SearchArea' 
  | 'ActionGroup' 
  | 'DataGrid' 
  | 'PaginationBar'
  | 'OperationGroup';

// 2. 结构层级定义 (Structural Hierarchy)
export const TableHierarchy = {
  'TableContainer': ['HeaderArea', 'BodyArea'],
  'BodyArea': ['SearchArea', 'ActionGroup', 'DataGrid', 'PaginationBar'],
  'DataGrid': ['OperationGroup']
} as Record<string, string[]>;

// 必须存在的组件 (用于完整性校验)
export const RequiredRoles: TableRole[] = ['DataGrid'];

// 3. 统一语义词典 (Unified Semantic Dictionary)
// 单一事实来源：所有识别规则都基于此词典
export const SemanticDictionary = {
  // 搜索区域语义
  search: {
    matchers: ['search', 'filter', 'query', 'find', '搜索', '查询', '筛选', '过滤'],
    role: 'SearchArea' as TableRole
  },

  // 表格数据区域语义
  grid: {
    matchers: ['table', 'grid', 'list', 'data', 'columns', 'rows', '数据表', '列表', '网格', '列'],
    role: 'DataGrid' as TableRole,
    excludes: ['container', 'wrapper'] // 避免匹配到外层容器
  },

  // 全局工具栏语义 (Toolbar/ActionGroup)
  toolbar: {
    matchers: ['toolbar', 'tools', 'buttonGroup', 'buttons', '工具栏', '按钮组', '操作栏'],
    role: 'ActionGroup' as TableRole,
    // 工具栏特有的动作意图
    intent: {
      primary: ['add', 'create', 'new', 'insert', '新增', '添加', '创建'],
      batch: ['export', 'import', 'download', '导出', '导入', '下载'],
      system: ['refresh', 'reload', 'reset', '刷新', '重置']
    }
  },

  // 行内操作列语义 (Row Operations/OperationGroup)
  operations: {
    matchers: ['操作', 'action', 'operation', 'opt', 'manage', '管理'],
    role: 'OperationGroup' as TableRole,
    // 行内操作特有的动作意图
    intent: {
      edit: ['edit', 'modify', 'update', '审核', '通过', '批准', 'approve', 'pass', '编辑', '修改', '更新'],
      danger: ['delete', 'remove', 'destroy', 'cancel', 'reject', 'void', '删除', '移除', '作废', '驳回', '拒绝', '禁用', 'disable'],
      view: ['view', 'detail', 'show', 'info', '查看', '详情', '显示']
    }
  },

  // 分页区域语义
  pagination: {
    matchers: ['pagination', 'pager', 'footer', 'page-control', '分页', '翻页', '页码'],
    role: 'PaginationBar' as TableRole
  },

  // 标题区域语义
  header: {
    matchers: ['header', 'title', 'caption', 'top-bar', 'heading', '标题栏', '标题'],
    role: 'HeaderArea' as TableRole
  },

  // 主体容器语义
  body: {
    matchers: ['body', 'content', 'main', 'wrapper', 'container', '主体', '内容区'],
    role: 'BodyArea' as TableRole
  }
};

// 4. 排除规则 (Exclusion Patterns)
// 用于过滤明显不是操作按钮的内容
export const ExclusionPatterns = [
  /^(状态|待审核|审核中|已审核|全部|共|第|page)/i, // 纯状态描述
  /^(共|Total).*(\d+|条|rows)/i, // 统计信息
  /^(第|Page).*(\d+|页)/i, // 分页信息
  /^\d+(\.\d+)?$/, // 纯数字
  /^.{25,}/ // 过长文本
];

// 5. 识别配置 (Recognition Config)
export const RecognitionConfig = {
  minConfidence: 0.6, // 最小置信度阈值
  strictMode: false // 是否严格模式（允许缺少部分非必须组件）
};

// 6. 调试配置 (Debug Config)
export const ParserConfig = {
  debug: {
    enableLogging: false,
    logLevel: 'info' as 'info' | 'debug' | 'warn' | 'error'
  }
};

// ==========================================
// 兼容性导出 (向后兼容)
// ==========================================

// 为了向后兼容，保留部分旧接口的导出
export const TableStructure = {
  root: 'TableContainer' as TableRole,
  hierarchy: TableHierarchy,
  required: RequiredRoles
};

// Figma 类型到角色的映射
export const TableComponentMapping = {
  figmaTypeToRole: {
    'FRAME': ['TableContainer', 'BodyArea', 'HeaderArea', 'SearchArea', 'DataGrid'],
    'INSTANCE': ['PaginationBar', 'ActionGroup'],
    'GROUP': ['ActionGroup']
  }
};
