import { TableRole } from './config';

/**
 * 基础能力接口：命名协议
 */
export interface INamingProtocol {
  isSearchArea(name: string): boolean;
  isTableSearchArea(name: string): boolean;
  isTableArea(name: string): boolean;
  isTableRow(name: string): boolean;
  isTableColumn(name: string): boolean;
  isInputComponent(name: string): boolean;
  isSelectComponent(name: string): boolean;
  isDateComponent(name: string): boolean;
  isButtonComponent(name: string): boolean;
  isContainerComponent(name: string): boolean;
  isHeaderComponent(name: string): boolean;
  isContentArea(name: string): boolean;
  isTitleComponent(name: string): boolean;
  isActionComponent(name: string): boolean;
  isToolbarComponent(name: string): boolean;
  isPaginationComponent(name: string): boolean;
  isOperationButton(name: string): boolean;
  checkPattern(name: string, patterns: string[]): boolean;
  getBusinessType(name: string): string;
  parseCompoundName(name: string): {
    prefix: string;
    type: string;
    suffix: string;
    parts: string[];
  };
  validateName(name: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  };
}

/**
 * 基础能力接口：布局协议
 */
export interface ILayoutProtocol {
  isHorizontallyAligned(node1: SceneNode, node2: SceneNode): boolean;
  isVerticallyAligned(node1: SceneNode, node2: SceneNode): boolean;
  isSameRow(node1: SceneNode, node2: SceneNode): boolean;
  isSameColumn(node1: SceneNode, node2: SceneNode): boolean;
  getHorizontalDistance(node1: SceneNode, node2: SceneNode): number;
  getVerticalDistance(node1: SceneNode, node2: SceneNode): number;
  isLabelInputPair(label: SceneNode, input: SceneNode): boolean;
  isButtonGroup(nodes: SceneNode[]): boolean;
  isToolbarArea(nodes: SceneNode[]): boolean;
  identifyButtonGroups(nodes: SceneNode[]): SceneNode[][];
  isTableTitleArea(nodes: SceneNode[]): boolean;
  isActionColumn(nodes: SceneNode[]): boolean;
  isPaginationArea(nodes: SceneNode[]): boolean;
  identifyTableAreaStructure(nodes: SceneNode[]): {
    title?: SceneNode[];
    toolbar?: {
      left?: SceneNode[];
      right?: SceneNode[];
    };
    table: SceneNode[];
    pagination?: SceneNode[];
  };
  isTableStructure(nodes: SceneNode[]): boolean;
  groupByRows(nodes: SceneNode[]): SceneNode[][];
  getBoundingBox(nodes: SceneNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isInsideArea(node: SceneNode, area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean;
  isVisuallyLikeInput(node: SceneNode): boolean;
}

/**
 * 基础能力接口：智能引擎
 */
export interface IIntelligenceEngine {
  resolveNodeRole(node: any): { role: TableRole | null; confidence: number };
  inferToolbarAction(text: string, nodeName?: string): 'add' | 'export' | 'import' | 'refresh' | 'custom';
  inferRowAction(text: string, nodeName?: string): 'edit' | 'delete' | 'view' | 'custom';
  shouldExclude(text: string): boolean;
  hasActionKeyword(text: string): boolean;
  validateStructure(identifiedNodes: Record<string, any>): { valid: boolean; missing: string[] };
  getExpectedParent(role: TableRole): TableRole | null;
}

/**
 * 业务协议接口 (Business Protocol)
 * 用于定义特定场景（如表格、表单、看板）的识别逻辑
 */
export interface IBusinessProtocol {
  /**
   * 协议的唯一标识符
   */
  id: string;
  
  /**
   * 协议的优先级 (数字越大优先级越高)
   */
  priority: number;

  /**
   * 判断此协议是否能处理该节点
   */
  canHandle(node: SceneNode): boolean;

  /**
   * 解析节点，返回对应的业务模型
   */
  parse(node: SceneNode): any;
}
