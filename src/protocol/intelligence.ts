// 智能识别引擎 - 基于语义词典的角色解析与动作推断
import { TableRole, SemanticDictionary, ExclusionPatterns, RecognitionConfig, TableHierarchy, RequiredRoles } from './config';

/**
 * 智能识别引擎
 * 负责基于语义词典进行节点角色识别和动作类型推断
 */
export class IntelligenceEngine {
  /**
   * 解析节点角色
   * 基于 SemanticDictionary 进行语义匹配，返回最佳匹配的角色和置信度
   */
  resolveNodeRole(node: any): { role: TableRole | null; confidence: number } {
    const name = (node.name && node.name.toLowerCase()) || '';
    let bestMatch = { role: null as TableRole | null, confidence: 0 };

    // 遍历语义词典进行匹配
    (Object.entries(SemanticDictionary) as [string, any][]).forEach(([semanticKey, semantic]) => {
      const matchers = semantic.matchers || [];
      const excludes = semantic.excludes || [];
      
      // 1. 检查排除规则
      if (excludes.some((ex: string) => name.includes(ex.toLowerCase()))) {
        return; // 跳过匹配
      }

      // 2. 关键词匹配
      const hasMatch = matchers.some((matcher: string) => 
        name.includes(matcher.toLowerCase())
      );

      if (hasMatch && semantic.role) {
        // 计算置信度：关键词匹配基础分 0.8，可根据需要调整
        const confidence = 0.8;
        
        if (confidence > bestMatch.confidence) {
          bestMatch = { 
            role: semantic.role, 
            confidence 
          };
        }
      }
    });

    // 如果置信度低于阈值，返回 null
    if (bestMatch.confidence < RecognitionConfig.minConfidence) {
      return { role: null, confidence: 0 };
    }

    return bestMatch;
  }

  /**
   * 推断工具栏按钮动作类型
   * 基于 toolbar.intent 进行匹配
   */
  inferToolbarAction(text: string, nodeName?: string): 'add' | 'export' | 'import' | 'refresh' | 'custom' {
    const content = (text || nodeName || '').toLowerCase();
    const toolbar = SemanticDictionary.toolbar;

    // 检查 primary 意图
    if (toolbar.intent.primary.some(keyword => content.includes(keyword))) {
      return 'add';
    }

    // 检查 batch 意图
    if (toolbar.intent.batch.some(keyword => content.includes(keyword))) {
      if (toolbar.intent.batch.some(k => k === 'import' && content.includes('import'))) {
        return 'import';
      }
      return 'export';
    }

    // 检查 system 意图
    if (toolbar.intent.system.some(keyword => content.includes(keyword))) {
      return 'refresh';
    }

    return 'custom';
  }

  /**
   * 推断行内操作按钮动作类型
   * 基于 operations.intent 进行匹配
   */
  inferRowAction(text: string, nodeName?: string): 'edit' | 'delete' | 'view' | 'custom' {
    const content = (text || nodeName || '').toLowerCase();
    const operations = SemanticDictionary.operations;

    // 检查 danger 意图（优先级最高，因为删除操作需要特殊处理）
    if (operations.intent.danger.some(keyword => content.includes(keyword))) {
      return 'delete';
    }

    // 检查 edit 意图
    if (operations.intent.edit.some(keyword => content.includes(keyword))) {
      return 'edit';
    }

    // 检查 view 意图
    if (operations.intent.view.some(keyword => content.includes(keyword))) {
      return 'view';
    }

    return 'custom';
  }

  /**
   * 检查文本是否应该被排除（不是操作按钮）
   */
  shouldExclude(text: string): boolean {
    const content = text.trim().toLowerCase();
    
    // 检查是否为纯列名关键词（如 "操作", "Action"）
    if (SemanticDictionary.operations.matchers.some(m => m.toLowerCase() === content)) {
      return true;
    }

    // 检查排除模式
    return ExclusionPatterns.some(pattern => pattern.test(content));
  }

  /**
   * 检查文本是否包含操作相关的关键词
   */
  hasActionKeyword(text: string): boolean {
    const content = text.trim().toLowerCase();
    
    // 收集所有操作相关的关键词
    const allKeywords: string[] = [];
    
    // 从 toolbar 和 operations 收集关键词
    allKeywords.push(...SemanticDictionary.toolbar.matchers);
    allKeywords.push(...SemanticDictionary.operations.matchers);
    
    // 收集所有意图关键词
    Object.values(SemanticDictionary.toolbar.intent).forEach(intentKeywords => {
      allKeywords.push(...intentKeywords);
    });
    Object.values(SemanticDictionary.operations.intent).forEach(intentKeywords => {
      allKeywords.push(...intentKeywords);
    });

    return allKeywords.some(keyword => content.includes(keyword));
  }

  /**
   * 验证结构完整性
   */
  validateStructure(identifiedNodes: Record<string, any>): { valid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    // 检查必须组件
    RequiredRoles.forEach(role => {
      if (!identifiedNodes[role]) {
        missing.push(role);
      }
    });

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * 获取节点期望的父级角色
   */
  getExpectedParent(role: TableRole): TableRole | null {
    for (const [parent, children] of Object.entries(TableHierarchy) as [string, string[]][]) {
      if (children.includes(role)) {
        return parent as TableRole;
      }
    }
    return null;
  }
}

// 导出单例实例（向后兼容）
export const TableIntelligenceEngine = new IntelligenceEngine();

