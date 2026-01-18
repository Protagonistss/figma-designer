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
      visible: node.visible,
      x: Math.round(node.x),
      y: Math.round(node.y),
      w: Math.round(node.width),
      h: Math.round(node.height)
    };

    const abs = node.absoluteBoundingBox;
    if (abs) {
      metadata.abs = {
        x: Math.round(abs.x),
        y: Math.round(abs.y),
        w: Math.round(abs.width),
        h: Math.round(abs.height)
      };
    }
    
    // 仅在文本节点上保留原始文本
    if (node.type === 'TEXT') {
      const characters = (node as TextNode).characters;
      if (characters.trim().length > 0) {
        metadata.text = characters;
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
