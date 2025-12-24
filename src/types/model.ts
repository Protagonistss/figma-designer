import { TableRole } from '../protocol/config';

export interface SearchField {
  label: string;
  key?: string;
  type: 'input' | 'select' | 'date' | 'unknown';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: string[]; // 用于 select 类型
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface TableColumn {
  title: string;
  dataIndex?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right';
  ellipsis?: boolean;
  type?: 'text' | 'number' | 'date' | 'action';
}

// 操作列按钮
export interface ActionButton {
  type: 'edit' | 'delete' | 'view' | 'custom';
  label: string;
  key?: string;
  icon?: string;
  danger?: boolean; // 用于删除等危险操作
  confirm?: {
    title: string;
    content?: string;
  };
}

// 工具栏按钮
export interface ToolbarButton {
  type: 'add' | 'export' | 'import' | 'refresh' | 'custom';
  label: string;
  key?: string;
  icon?: string;
  position?: 'left' | 'right';
}

// 按钮组
export interface ButtonGroup {
  type: 'search' | 'toolbar' | 'action';
  buttons: (ToolbarButton | ActionButton)[];
  layout?: 'horizontal' | 'vertical';
  align?: 'left' | 'center' | 'right';
}

// 表格标题 (HeaderArea)
export interface HeaderAreaModel {
  role: 'HeaderArea';
  title: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  subtitle?: string;
  extra?: string; // 额外信息，如统计数量
}

// 搜索区域 (SearchArea)
export interface SearchAreaModel {
  role: 'SearchArea';
  fields: SearchField[];
  buttons?: ButtonGroup; // 搜索按钮组（查询、重置等）
}

// 工具栏/操作组 (ActionGroup)
export interface ActionGroupModel {
  role: 'ActionGroup';
  left?: ButtonGroup;
  right?: ButtonGroup;
}

// 数据表格 (DataGrid)
export interface DataGridModel {
  role: 'DataGrid';
  columns: TableColumn[];
  rowSelection?: {
    type: 'checkbox' | 'radio';
    showSelectAll?: boolean;
  };
  // 操作列配置 (可选，如果不作为独立列处理)
  actionColumn?: {
    column: TableColumn;
    buttons: ActionButton[];
  };
}

// 分页栏 (PaginationBar)
export interface PaginationBarModel {
  role: 'PaginationBar';
  enabled: boolean;
  pageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

// 主体区域 (BodyArea)
export interface BodyAreaModel {
  role: 'BodyArea';
  search?: SearchAreaModel;
  toolbar?: ActionGroupModel; // 对应 ActionGroup
  table: DataGridModel;       // 对应 DataGrid
  pagination?: PaginationBarModel;
}

// 完整的表格页面模型 (TableContainer)
export interface TablePageModel {
  role: 'TableContainer';
  type: 'table-page'; // 保留用于兼容性或明确页面类型
  header?: HeaderAreaModel;
  body: BodyAreaModel;
}

// 兼容旧代码的类型别名 (避免大量重构报错，逐步迁移)
export type TableTitle = Omit<HeaderAreaModel, 'role'>;
export type TableArea = Omit<BodyAreaModel, 'role' | 'search' | 'header'>; 
