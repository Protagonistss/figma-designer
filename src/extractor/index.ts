import { NodeMetadata } from '../types/metadata';

export class MetadataExtractor {
  private maxDepth: number;
  
  constructor(maxDepth: number = 4) {
    this.maxDepth = maxDepth;
  }
  
  // 提取节点树的元数据
  extractTree(node: SceneNode): NodeMetadata {
    return this.extractNode(node, 0);
  }
  
  private extractNode(node: SceneNode, depth: number): NodeMetadata {
    const metadata: NodeMetadata = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: Math.round(node.x),
      y: Math.round(node.y),
      width: Math.round(node.width),
      height: Math.round(node.height),
      depth,
      childCount: 0
    };
    
    // 收集文本内容
    const texts = this.collectTexts(node);
    if (texts.length > 0) {
      metadata.texts = texts;
    }
    
    // 递归提取子节点（限制深度）
    if ('children' in node && depth < this.maxDepth) {
      const visibleChildren = node.children.filter(c => c.visible);
      metadata.childCount = visibleChildren.length;
      metadata.children = visibleChildren.map(c => this.extractNode(c, depth + 1));
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
}
