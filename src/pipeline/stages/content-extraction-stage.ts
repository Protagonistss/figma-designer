/**
 * 内容提取阶段
 * 根据角色从对应区域提取结构化内容
 */

import { AnalysisStage, AnalysisContext } from '../index';
import { TableSection, SearchSection, ToolbarSection } from '../../types/page-content';

export class ContentExtractionStage implements AnalysisStage {
  name = 'ContentExtraction';

  async execute(context: AnalysisContext): Promise<void> {
    console.log('[ContentExtraction] Starting content extraction...');
    
    // 提取表格内容
    const dataGridNodes = context.nodesByRole.get('DataGrid');
    if (dataGridNodes && dataGridNodes.length > 0) {
      console.log('[ContentExtraction] Extracting table structure...');
      try {
        const tableSection = await context.aiEngine.extractTable(dataGridNodes[0]);
        context.content.table = tableSection;
        console.log('[ContentExtraction] Table columns extracted:', 
          tableSection.columns?.length || 0);
      } catch (error) {
        console.error('[ContentExtraction] Failed to extract table:', error);
      }
    }
    
    // 提取搜索区内容
    const searchNodes = context.nodesByRole.get('SearchArea');
    if (searchNodes && searchNodes.length > 0) {
      console.log('[ContentExtraction] Extracting search form...');
      try {
        const searchSection = await context.aiEngine.extractSearch(searchNodes[0]);
        context.content.search = searchSection;
        console.log('[ContentExtraction] Search fields extracted:', 
          searchSection.fields?.length || 0);
      } catch (error) {
        console.error('[ContentExtraction] Failed to extract search:', error);
      }
    }
    
    // 提取工具栏内容
    const actionNodes = context.nodesByRole.get('ActionGroup');
    if (actionNodes && actionNodes.length > 0) {
      console.log('[ContentExtraction] Extracting toolbar actions...');
      try {
        const toolbarSection = await context.aiEngine.extractToolbar(actionNodes[0]);
        context.content.toolbar = toolbarSection;
        console.log('[ContentExtraction] Toolbar actions extracted:', 
          toolbarSection.actions?.length || 0);
      } catch (error) {
        console.error('[ContentExtraction] Failed to extract toolbar:', error);
      }
    }
    
    // 检测分页器
    const paginationNodes = context.nodesByRole.get('PaginationBar');
    if (paginationNodes && paginationNodes.length > 0) {
      context.content.pagination = { enabled: true };
      console.log('[ContentExtraction] Pagination detected');
    }
    
    console.log('[ContentExtraction] Completed');
  }
}
