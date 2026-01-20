import { NodeMetadata } from '@figma-designer/shared';

export class MetadataExtractor {
  private maxDepth: number;
  
  constructor(maxDepth: number = 10) {
    this.maxDepth = maxDepth;
  }
  
  // 提取节点树的元数据
  extractTree(node: SceneNode): NodeMetadata | null {
    return this.extractNode(node, 0);
  }
  
  private extractNode(node: SceneNode, depth: number): NodeMetadata | null {
    // 文本节点：必须有内容才保留
    if (node.type === 'TEXT') {
      const characters = (node as TextNode).characters;
      if (characters.trim().length > 0) {
        return {
          type: node.type,
          name: node.name,
          x: Math.round(node.x),
          y: Math.round(node.y),
          characters
        };
      }
      return null; // 空文本节点，过滤掉
    }
    
    // 容器节点：只有当子节点中存在有效内容时才保留
    if ('children' in node && depth < this.maxDepth) {
      const visibleChildren = node.children.filter(c => c.visible);
      const validChildren = visibleChildren
        .map(c => this.extractNode(c, depth + 1))
        .filter((c): c is NodeMetadata => c !== null);
      
      if (validChildren.length > 0) {
        return {
          type: node.type,
          name: node.name,
          x: Math.round(node.x),
          y: Math.round(node.y),
          children: validChildren
        };
      }
    }
    
    // 其他情况（叶子节点无文本、空容器）：过滤掉
    return null;
  }
}
