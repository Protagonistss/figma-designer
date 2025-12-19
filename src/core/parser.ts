export function getTextContent(node: SceneNode): string {
  if (node.type === 'TEXT') {
    return node.characters;
  }
  return '';
}

export function isContainer(node: SceneNode): node is FrameNode | GroupNode | ComponentNode | InstanceNode {
  return ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE'].indexOf(node.type) !== -1;
}

export function findChildren(node: SceneNode, predicate: (n: SceneNode) => boolean): SceneNode[] {
  if ('children' in node) {
    return node.children.filter(predicate);
  }
  return [];
}

export function findOneChild(node: SceneNode, predicate: (n: SceneNode) => boolean): SceneNode | null {
  if ('children' in node) {
    return node.children.find(predicate) || null;
  }
  return null;
}

// Sort nodes by Y then X to determine visual order
export function sortNodesByPosition(nodes: SceneNode[]): SceneNode[] {
  return [...nodes].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 10) { // Tolerance for rows
      return a.y - b.y;
    }
    return a.x - b.x;
  });
}
