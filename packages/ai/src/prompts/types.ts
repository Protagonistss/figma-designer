/**
 * Prompt 模块类型定义
 */

/** 支持的页面类型 */
export type PageType = 'table' | 'form' | 'dashboard' | 'auto';

/** 区域角色类型 */
export type RegionRole = 
  | 'SearchArea' 
  | 'ActionGroup' 
  | 'DataGrid' 
  | 'PaginationBar'
  | 'FormSection'
  | 'FormActions'
  | 'ChartArea'
  | 'StatCard'
  | 'Header'
  | 'Sidebar';

/** 区域信息 */
export interface RegionInfo {
  nodeId?: string;
  role: RegionRole;
  confidence: number;
  visualEvidence?: string;
}

/** 搜索字段类型 */
export type SearchFieldType = 'input' | 'select' | 'date' | 'dateRange' | 'number';

/** 搜索字段 */
export interface SearchField {
  label: string;
  name: string;
  type: SearchFieldType;
}

/** 表格列对齐方式 */
export type ColumnAlign = 'left' | 'center' | 'right';

/** 表格列定义 */
export interface TableColumn {
  title: string;
  dataIndex: string;
  width?: number;
  align?: ColumnAlign;
}

/** 按钮类型 */
export type ButtonType = 'primary' | 'default' | 'danger';

/** 行操作 */
export interface RowAction {
  label: string;
  type: ButtonType;
}

/** 工具栏操作 */
export interface ToolbarAction {
  label: string;
  type: ButtonType;
  icon?: string;
}

/** 表单字段类型 */
export type FormFieldType = 'input' | 'select' | 'textarea' | 'date' | 'number' | 'switch' | 'radio' | 'checkbox';

/** 表单字段 */
export interface FormField {
  label: string;
  name: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
}

/** 表单区块 */
export interface FormSection {
  title?: string;
  fields: FormField[];
}

/** 图表类型 */
export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'gauge';

/** 图表区域 */
export interface ChartArea {
  title: string;
  chartType: ChartType;
  dataKeys?: string[];
}

/** 统计卡片 */
export interface StatCard {
  title: string;
  valueType?: 'number' | 'currency' | 'percent';
}

/** 分析结果基础结构 */
export interface BaseAnalysisResult {
  pageType: PageType;
  pageTitle: string;
  regions: RegionInfo[];
}

/** 列表页分析结果 */
export interface TablePageResult extends BaseAnalysisResult {
  pageType: 'table';
  search?: {
    fields: SearchField[];
  };
  table?: {
    columns: TableColumn[];
    rowActions?: RowAction[];
  };
  toolbar?: {
    actions: ToolbarAction[];
  };
  pagination?: {
    enabled: boolean;
  };
}

/** 表单页分析结果 */
export interface FormPageResult extends BaseAnalysisResult {
  pageType: 'form';
  sections: FormSection[];
  actions?: ToolbarAction[];
}

/** 仪表盘分析结果 */
export interface DashboardPageResult extends BaseAnalysisResult {
  pageType: 'dashboard';
  stats?: StatCard[];
  charts?: ChartArea[];
}

/** 通用分析结果 */
export type AnalysisResult = TablePageResult | FormPageResult | DashboardPageResult;

/** 构建 Prompt 的选项 */
export interface BuildPromptOptions {
  pageType: PageType;
  hasScreenshot: boolean;
  metadataJson: string;
}
