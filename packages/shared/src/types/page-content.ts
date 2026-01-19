/**
 * PageContent Schema - 低代码平台对接格式
 * 定义 AI 分析后输出的结构化页面内容
 */

// ============ 页面级定义 ============

export interface PageContent {
  page: PageMeta;
  search?: SearchSection;
  table?: TableSection;
  toolbar?: ToolbarSection;
  pagination?: PaginationSection;
}

export interface PageMeta {
  title: string;
  type: 'table' | 'form' | 'detail';
}

// ============ 搜索区定义 ============

export interface SearchSection {
  fields: SearchField[];
}

export interface SearchField {
  label: string;
  name: string;           // 低代码平台字段名
  type: 'input' | 'select' | 'date' | 'dateRange';
  placeholder?: string;
}

// ============ 表格区定义 ============

export interface TableSection {
  columns: TableColumn[];
  rowActions?: ActionButton[];
}

export interface TableColumn {
  title: string;
  dataIndex: string;      // 低代码平台字段名
  width?: number;
  align?: 'left' | 'center' | 'right';
}

// ============ 工具栏定义 ============

export interface ToolbarSection {
  actions: ActionButton[];
}

export interface ActionButton {
  label: string;
  type: 'primary' | 'default' | 'danger';
  icon?: string;
}

// ============ 分页定义 ============

export interface PaginationSection {
  enabled: boolean;
}

// ============ 类型守卫 ============

export function isTablePage(content: PageContent): boolean {
  return content.page.type === 'table' && !!content.table;
}

export function isFormPage(content: PageContent): boolean {
  return content.page.type === 'form';
}
