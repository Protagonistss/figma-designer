import { NodeMetadata } from '../types/metadata';

export class MetadataExtractor {
  private maxDepth: number;
  private filterMockData: boolean;
  
  constructor(maxDepth: number = 4, filterMockData: boolean = false) {
    this.maxDepth = maxDepth;
    this.filterMockData = filterMockData;
  }
  
  // 提取节点树的元数据
  extractTree(node: SceneNode): NodeMetadata {
    return this.extractNode(node, 0);
  }
  
  private extractNode(node: SceneNode, depth: number): NodeMetadata {
    const metadata: NodeMetadata = {
      name: node.name,
      type: node.type,
      w: Math.round(node.width),
      h: Math.round(node.height)
    };
    
    // 收集文本内容（合并为单个字符串）
    const texts = this.collectTexts(node);
    if (texts.length > 0) {
      const filteredText = this.filterMockData ? this.filterText(node, texts) : texts.join(' ');
      if (filteredText) {
        metadata.text = filteredText;
      }
    }
    
    // 递归提取子节点（限制深度）
    if ('children' in node && depth < this.maxDepth) {
      const visibleChildren = node.children.filter(c => c.visible);
      if (visibleChildren.length > 0) {
        metadata.children = visibleChildren.map(c => this.extractNode(c, depth + 1));
      }
    }
    
    return metadata;
  }
  
  private collectTexts(node: SceneNode): string[] {
    const texts: string[] = [];
    
    if (node.type === 'TEXT') {
      texts.push((node as TextNode).characters);
    } else if ('children' in node) {
      for (const child of node.children) {
        texts.push(...this.collectTexts(child));
      }
    }
    
    return texts.filter(t => t.trim().length > 0);
  }
  
  /**
   * 智能过滤文本内容，移除 mock 数据
   * 策略：保守过滤，只移除明显的 mock 数据，保留所有可能有用的信息
   */
  private filterText(node: SceneNode, texts: string[]): string {
    const joinedText = texts.join(' ').trim();
    if (!joinedText) return '';
    
    const textLength = joinedText.length;
    
    // 只过滤明显的 mock 数据特征
    const hasEmail = /\S+@\S+\.\S+/.test(joinedText);
    const hasUrl = /https?:\/\//.test(joinedText);
    const hasDate = /\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(joinedText);
    const hasPhone = /\d{3,4}[-\s]?\d{3,4}[-\s]?\d{4}/.test(joinedText);
    const isLongNumber = /^\d{5,}$/.test(joinedText); // 5位以上的纯数字（可能是ID）
    const isPlaceholder = /^(请输入|请选择|输入|选择|搜索|search|placeholder)/i.test(joinedText);
    
    // 规则 1: 明确的 mock 数据 → 移除
    if (hasEmail || hasUrl || hasDate || hasPhone || isLongNumber || isPlaceholder) {
      return '';
    }
    
    // 规则 2: 超长文本（>100 字符）→ 可能是示例段落 → 移除
    if (textLength > 100) {
      return '';
    }
    
    // 其他所有文本都保留
    return joinedText;
  }
}
