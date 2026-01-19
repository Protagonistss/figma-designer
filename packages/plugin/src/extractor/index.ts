import { NodeMetadata } from '@figma-designer/shared';

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
      type: node.type,
      name: node.name,
      x: Math.round(node.x),
      y: Math.round(node.y)
    };
    
    // 仅在文本节点上保留原始文本
    if (node.type === 'TEXT') {
      const characters = (node as TextNode).characters;
      if (characters.trim().length > 0) {
        metadata.text = characters;
        metadata.characters = characters;
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
}
