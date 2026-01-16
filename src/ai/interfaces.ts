import { NodeMetadata, InferenceResult } from '../types/metadata';
import { TableSection, SearchSection, ToolbarSection } from '../types/page-content';

/**
 * AI 引擎接口
 * 支持角色推理和内容提取
 */
export interface IAIEngine {
  /**
   * 推理节点角色
   */
  inferRole(metadata: NodeMetadata): Promise<InferenceResult>;
  
  /**
   * 提取表格内容
   */
  extractTable(metadata: NodeMetadata): Promise<TableSection>;
  
  /**
   * 提取搜索表单内容
   */
  extractSearch(metadata: NodeMetadata): Promise<SearchSection>;
  
  /**
   * 提取工具栏内容
   */
  extractToolbar(metadata: NodeMetadata): Promise<ToolbarSection>;
}

/**
 * 内容提取类型
 */
export type ContentType = 'table' | 'search' | 'toolbar';
