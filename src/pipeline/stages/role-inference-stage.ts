/**
 * 角色识别阶段
 * 递归推理所有节点的角色
 */

import { AnalysisStage, AnalysisContext, traverseNodes } from '../index';
import { NodeMetadata, InferenceResult } from '../../types/metadata';

// 需要识别的关键角色
const KEY_ROLES = [
  'TableContainer',
  'HeaderArea',
  'SearchArea',
  'ActionGroup',
  'DataGrid',
  'PaginationBar',
  'OperationGroup'
] as const;

export class RoleInferenceStage implements AnalysisStage {
  name = 'RoleInference';

  async execute(context: AnalysisContext): Promise<void> {
    console.log('[RoleInference] Starting role inference...');
    
    // 收集所有需要推理的节点
    const nodesToInfer: NodeMetadata[] = [];
    traverseNodes(context.metadata, (node) => {
      nodesToInfer.push(node);
    });
    
    console.log(`[RoleInference] Found ${nodesToInfer.length} nodes to analyze`);
    
    // 推理根节点（必须）
    console.log('[RoleInference] Inferring root node...');
    const rootResult = await context.aiEngine.inferRole(context.metadata);
    context.roles.set(context.metadata.id, rootResult);
    this.indexByRole(context, context.metadata, rootResult);
    
    // 推理第一层子节点（关键组件通常在这里）
    if (context.metadata.children) {
      for (const child of context.metadata.children) {
        console.log(`[RoleInference] Inferring: ${child.name}`);
        const result = await context.aiEngine.inferRole(child);
        context.roles.set(child.id, result);
        this.indexByRole(context, child, result);
        
        // 如果识别出关键容器角色，继续推理其子节点
        if (this.isContainerRole(result.role) && child.children) {
          for (const grandChild of child.children) {
            console.log(`[RoleInference] Inferring nested: ${grandChild.name}`);
            const gcResult = await context.aiEngine.inferRole(grandChild);
            context.roles.set(grandChild.id, gcResult);
            this.indexByRole(context, grandChild, gcResult);
          }
        }
      }
    }
    
    // 设置页面基本信息
    context.content.page = {
      title: context.metadata.name,
      type: this.detectPageType(context)
    };
    
    console.log('[RoleInference] Completed. Roles found:', 
      Array.from(context.nodesByRole.keys()).join(', '));
  }

  /**
   * 按角色索引节点
   */
  private indexByRole(context: AnalysisContext, node: NodeMetadata, result: InferenceResult): void {
    if (result.role && result.confidence >= 0.6) {
      const nodes = context.nodesByRole.get(result.role) || [];
      nodes.push(node);
      context.nodesByRole.set(result.role, nodes);
    }
  }

  /**
   * 是否是容器类角色
   */
  private isContainerRole(role: string | null): boolean {
    return role === 'TableContainer' || role === 'BodyArea';
  }

  /**
   * 检测页面类型
   */
  private detectPageType(context: AnalysisContext): 'table' | 'form' | 'detail' {
    if (context.nodesByRole.has('DataGrid')) return 'table';
    if (context.nodesByRole.has('FormArea')) return 'form';
    
    // 根据根节点角色判断
    const rootRole = context.roles.get(context.metadata.id);
    if (rootRole?.role === 'TableContainer') return 'table';
    if (rootRole?.role === 'FormContainer') return 'form';
    
    return 'table'; // 默认
  }
}
