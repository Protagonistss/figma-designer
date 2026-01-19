/**
 * 原始节点树类型定义
 * 用于完整表示 Figma 节点的原始结构
 */

export type SceneNodeType =
  | 'DOCUMENT'
  | 'PAGE'
  | 'FRAME'
  | 'GROUP'
  | 'COMPONENT'
  | 'INSTANCE'
  | 'BOOLEAN_OPERATION'
  | 'VECTOR'
  | 'STAR'
  | 'LINE'
  | 'ELLIPSE'
  | 'REGULAR_POLYGON'
  | 'RECTANGLE'
  | 'TEXT'
  | 'SLICE'
  | 'HIGHLIGHT'
  | 'STICKY'
  | 'CONNECTOR'
  | 'SHAPE_WITH_TEXT'
  | 'VIDEO'
  | 'EMBED'
  | 'WASHI_TAPE'
  | 'SECTION'
  | 'CODE_BLOCK'
  | 'TABLE'
  | 'CARD'
  | 'NODE'
  | 'UNKNOWN';

export interface BaseRawNode {
  id: string;
  name: string;
  type: SceneNodeType;
  visible: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextRawNode extends BaseRawNode {
  type: 'TEXT';
  characters?: string;
}

export interface ContainerRawNode extends BaseRawNode {
  children?: RawNodeTree[];
}

export type RawNodeTree = TextRawNode | ContainerRawNode;

/**
 * 类型守卫：检查是否为文本节点
 */
export function isTextRawNode(node: RawNodeTree): node is TextRawNode {
  return node.type === 'TEXT';
}

/**
 * 类型守卫：检查是否为容器节点
 */
export function isContainerRawNode(node: RawNodeTree): node is ContainerRawNode {
  return 'children' in node;
}
