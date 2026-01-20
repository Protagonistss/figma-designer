import { NodeMetadata } from '@figma-designer/shared';

export class MetadataExtractor {
  constructor(private readonly maxDepth: number = 10) {}

  /** 提取节点树的元数据 */
  extractTree(node: SceneNode): NodeMetadata | null {
    return this.extractNode(node, 0);
  }

  private extractNode(node: SceneNode, depth: number): NodeMetadata | null {
    if (this.isTextNode(node)) {
      return this.extractTextNode(node);
    }
    
    if (this.isContainerNode(node) && depth < this.maxDepth) {
      return this.extractContainerNode(node, depth);
    }
    
    return null;
  }

  private extractTextNode(node: TextNode): NodeMetadata | null {
    const text = node.characters.trim();
    if (!text) return null;

    return {
      ...this.baseMetadata(node),
      characters: node.characters,
    };
  }

  private extractContainerNode(node: SceneNode & ChildrenMixin, depth: number): NodeMetadata | null {
    const children = node.children
      .filter(child => child.visible)
      .map(child => this.extractNode(child, depth + 1))
      .filter((child): child is NodeMetadata => child !== null);

    if (!children.length) return null;

    return {
      ...this.baseMetadata(node),
      children,
    };
  }

  private baseMetadata(node: SceneNode): Pick<NodeMetadata, 'type' | 'name' | 'x' | 'y'> {
    return {
      type: node.type,
      name: node.name,
      x: Math.round(node.x),
      y: Math.round(node.y),
    };
  }

  // Type guards
  private isTextNode(node: SceneNode): node is TextNode {
    return node.type === 'TEXT';
  }

  private isContainerNode(node: SceneNode): node is SceneNode & ChildrenMixin {
    return 'children' in node;
  }
}
