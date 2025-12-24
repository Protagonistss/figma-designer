import { 
  TablePageModel, 
  SearchField, 
  TableColumn, 
  ButtonGroup, 
  ActionButton, 
  ToolbarButton, 
  TableArea,
  HeaderAreaModel,
  SearchAreaModel,
  DataGridModel,
  PaginationBarModel,
  BodyAreaModel
} from '../../types/model';
import { isContainer, findChildren, sortNodesByPosition, findOneChild } from '../parser';
import { ProtocolManager } from '../../protocol/index';
import { TableRole, SemanticDictionary, ExclusionPatterns } from '../../protocol/config';
import { IntelligenceEngine, TableIntelligenceEngine } from '../../protocol/intelligence';

// Debug helper
function logNodeStructure(node: SceneNode, depth: number = 0): void {
  const indent = '  '.repeat(depth);
  const info = `(x:${Math.round(node.x)}, y:${Math.round(node.y)}, w:${Math.round(node.width)}, h:${Math.round(node.height)})`;
  const extra = node.type === 'TEXT' ? ` text:"${(node as TextNode).characters}"` : '';
  console.log(`${indent}▶ ${node.name} [${node.type}] ${info}${extra}`);
  
  if (depth > 10) return; // Limit depth
  if (isContainer(node)) {
    for (const child of node.children) {
      logNodeStructure(child, depth + 1);
    }
  }
}

/**
 * 增强的表格页面处理器
 * 使用协议层进行智能解析
 */
export class EnhancedTableProcessor {
  private protocolManager: ProtocolManager;
  private intelligenceEngine: IntelligenceEngine;

  constructor() {
    this.protocolManager = new ProtocolManager();
    this.intelligenceEngine = new IntelligenceEngine();
  }

  /**
   * 检查是否是明确的操作列（基于名称或角色）
   */
  private isExplicitActionColumn(nodeNameOrNode: string | SceneNode): boolean {
    if (typeof nodeNameOrNode === 'string') {
        // 如果只提供了名称，尝试基于名称的快速匹配
        const name = nodeNameOrNode;
        // 使用 SemanticDictionary.operations 的 matchers
        return SemanticDictionary.operations.matchers.some(matcher => name.toLowerCase().includes(matcher.toLowerCase()));
    } else {
        // 如果提供了节点，使用完整的角色识别
        const node = nodeNameOrNode;
        const analysis = this.intelligenceEngine.resolveNodeRole(node);
        if (analysis.role === 'OperationGroup' && analysis.confidence > 0.6) {
            return true;
        }
        // 回退到名称匹配
        return this.isExplicitActionColumn(node.name);
    }
  }

  /**
   * 检查节点是否包含真正的操作按钮
   */
  private hasRealActionButtons(node: SceneNode): boolean {
    const allTextNodes: TextNode[] = [];
    this.collectTextNodes(node, allTextNodes);
    
    // 检查是否有文本包含操作关键词
    return allTextNodes.some(textNode => {
      const content = textNode.characters.trim();
      return this.intelligenceEngine.hasActionKeyword(content);
    });
  }

  /**
   * 判断节点是否为输入组件
   */
  private isInputComponent(node: SceneNode): boolean {
    const namingProtocol = this.protocolManager.getNamingProtocol();

    if (namingProtocol.isInputComponent(node.name) || 
        namingProtocol.isSelectComponent(node.name) ||
        namingProtocol.isDateComponent(node.name)) {
      return true;
    }

    if (node.type === 'RECTANGLE' || node.type === 'FRAME' || node.type === 'INSTANCE') {
      const hasVisibleFill = 'fills' in node && Array.isArray(node.fills) && node.fills.length > 0;
      const hasVisibleStroke = 'strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0;
      
      if (hasVisibleFill || hasVisibleStroke) {
        const isReasonableSize = node.width > 60 && node.height > 20 && node.height < 60;
        if (isReasonableSize) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 递归提取搜索字段
   */
  private extractSearchFieldsRecursive(node: SceneNode, depth: number = 0): SearchField[] {
    const fields: SearchField[] = [];
    const layoutProtocol = this.protocolManager.getLayoutProtocol();

    if (depth > 3) return fields; 
    if (!isContainer(node)) return fields;

    const children = sortNodesByPosition(findChildren(node, n => n.visible));

    for (let i = 0; i < children.length - 1; i++) {
      const current = children[i];
      const next = children[i + 1];

      if (layoutProtocol.isLabelInputPair(current, next)) {
        const labelText = (current as TextNode).characters;
        
        if (['收起', '展开', '高级搜索', '更多', 'Expand', 'Collapse'].some(k => labelText.includes(k))) {
          i++; 
          continue;
        }

        const fieldType = this.determineFieldType(next, labelText);
        
        fields.push({
          label: labelText,
          type: fieldType,
          key: this.generateFieldKey(labelText),
          placeholder: this.extractPlaceholder(next)
        });
        
        i++;
        continue;
      }
    }

    for (const child of children) {
      if (isContainer(child) && !this.isInputComponent(child)) {
        fields.push(...this.extractSearchFieldsRecursive(child, depth + 1));
      }
    }

    return fields;
  }

  /**
   * 确定字段类型
   */
  private determineFieldType(node: SceneNode, label?: string): 'input' | 'select' | 'date' | 'unknown' {
    if (label) {
      if (['日期', '时间', 'Date', 'Time', '年份', '月份'].some(k => label.includes(k))) return 'date';
      if (['下拉', '选择', 'Select', 'Choose', '类型', '状态'].some(k => label.includes(k))) return 'select';
    }

    const namingProtocol = this.protocolManager.getNamingProtocol();
    if (namingProtocol.isSelectComponent(node.name)) return 'select';
    if (namingProtocol.isDateComponent(node.name)) return 'date';
    if (namingProtocol.isInputComponent(node.name)) return 'input';

    if (node.type === 'INSTANCE') {
      return 'input';
    }

    return 'input';
  }

  /**
   * 生成字段键名
   */
  private generateFieldKey(label: string): string {
    return label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * 提取占位符文本
   */
  private extractPlaceholder(node: SceneNode): string | undefined {
    if (isContainer(node)) {
      const textChild = findOneChild(node, n => n.type === 'TEXT' && n.visible) as TextNode;
      if (textChild && textChild.characters) {
        const text = textChild.characters.trim();
        if (this.isPlaceholderLike(text)) {
          return text;
        }
      }
    }
    return undefined;
  }

  /**
   * 判断文本是否像占位符
   */
  private isPlaceholderLike(text: string): boolean {
    const placeholderPatterns = [
      /^请输入/,
      /^请选择/,
      /^输入/,
      /^选择/,
      /placeholder/i,
      /hint/i
    ];
    
    return placeholderPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 提取表格标题
   */
  private extractTableTitle(rootNode: SceneNode): HeaderAreaModel | undefined {
    // 使用新协议识别 HeaderArea
    const headerNode = this.findComponentByRole(rootNode, 'HeaderArea');
    
    if (headerNode) {
        // 在 HeaderArea 中找标题文本
        const titleText = findOneChild(headerNode, n => n.type === 'TEXT' && Number((n as TextNode).fontSize) > 14);
        if (titleText) {
             return {
                role: 'HeaderArea',
                title: (titleText as TextNode).characters,
                level: this.inferTitleLevel(titleText as TextNode),
                extra: this.extractExtraInfo([headerNode])
            };
        }
    }

    return undefined;
  }

  /**
   * 推断标题级别
   */
  private inferTitleLevel(textNode: TextNode): 1 | 2 | 3 | 4 | 5 | 6 {
    const fontSize = Number(textNode.fontSize) || 16;
    if (fontSize >= 24) return 1;
    if (fontSize >= 20) return 2;
    if (fontSize >= 18) return 3;
    if (fontSize >= 16) return 4;
    if (fontSize >= 14) return 5;
    return 6;
  }

  /**
   * 提取额外信息
   */
  private extractExtraInfo(nodes: SceneNode[]): string | undefined {
    // 简单实现，后续可增强
    return undefined;
  }

  /**
   * 提取按钮组
   */
  private extractButtonGroup(nodes: SceneNode[], type: 'search' | 'toolbar'): ButtonGroup | undefined {
    if (nodes.length === 0) return undefined;

    const namingProtocol = this.protocolManager.getNamingProtocol();
    
    // 递归展开容器，寻找真正的按钮节点
    // 支持 buttonGroup -> 按钮组 -> [按钮, 图标] 这种深层结构
    let candidates: SceneNode[] = [];
    const queue = [...nodes];
    let depth = 0;
    
    // 广度优先搜索，寻找按钮或文本
    while (queue.length > 0 && depth < 5) {
        const currentLevelNodes = [...queue];
        queue.length = 0; // 清空队列，准备下一层
        
        let hasButtons = false;

        for (const node of currentLevelNodes) {
            // 检查是否是按钮（只基于名称，不调用 extractButton 避免容器被误判）
            // 排除明显的容器关键词
            const isContainerName = /组|group|container|wrapper|容器/i.test(node.name);
            const isButton = !isContainerName && namingProtocol.isButtonComponent(node.name);
            
            if (isButton) {
                candidates.push(node);
                hasButtons = true;
            } else if (isContainer(node)) {
                // 如果不是按钮，继续深入
                queue.push(...findChildren(node, n => n.visible));
            } else if (node.type === 'TEXT') {
                // 如果是文本节点，检查其父节点是否可能是按钮
                // 这种情况通常发生在按钮结构是：Button -> Text 的情况
                const parent = (node as any).parent;
                if (parent && !candidates.includes(parent)) {
                    // 检查父节点是否包含按钮特征（有文本且有合理的尺寸）
                    const hasReasonableSize = parent.width > 40 && parent.height > 20 && parent.height < 100;
                    if (hasReasonableSize) {
                        candidates.push(parent);
                        hasButtons = true;
                    }
                }
            }
        }
        
        // 如果找到了按钮，继续查找同级按钮（不立即停止）
        depth++;
    }
    
    // 如果通过名称匹配没找到按钮，尝试查找所有包含文本的叶子节点作为候选
    if (candidates.length === 0) {
        // 重新搜索，这次查找所有包含文本的容器节点
        const textBasedQueue = [...nodes];
        const textBasedDepth = 0;
        const maxDepth = 5;
        
        const findTextBasedButtons = (nodeList: SceneNode[], currentDepth: number): void => {
            if (currentDepth > maxDepth) return;
            
            for (const node of nodeList) {
                const isContainerName = /组|group|container|wrapper|容器/i.test(node.name);
                if (isContainerName) {
                    // 跳过容器，继续深入
                    if (isContainer(node)) {
                        findTextBasedButtons(findChildren(node, n => n.visible), currentDepth + 1);
                    }
                } else {
                    // 检查节点是否包含文本且尺寸合理（可能是按钮）
                    const hasText = this.hasTextContent(node);
                    const hasReasonableSize = node.width > 40 && node.height > 20 && node.height < 100;
                    if (hasText && hasReasonableSize && !candidates.includes(node)) {
                        candidates.push(node);
                    }
                    // 继续深入查找
                    if (isContainer(node)) {
                        findTextBasedButtons(findChildren(node, n => n.visible), currentDepth + 1);
                    }
                }
            }
        };
        
        findTextBasedButtons(textBasedQueue, textBasedDepth);
    }
    
    if (candidates.length === 0) return undefined;

    const layoutProtocol = this.protocolManager.getLayoutProtocol();
    // 尝试识别按钮组布局
    const buttonGroups = layoutProtocol.identifyButtonGroups(candidates);
    
    // 如果布局识别失败，但我们确实找到了按钮候选者，就直接使用这些候选者
    let targetButtons = candidates;
    if (buttonGroups.length > 0) {
        targetButtons = buttonGroups[0]; // 取第一组
    }

    const allButtons: (ToolbarButton | ActionButton)[] = [];
    targetButtons.forEach(node => {
        const button = this.extractButton(node, type);
        if (button) {
            allButtons.push(button);
        }
    });

    if (allButtons.length === 0) {
        // 如果所有按钮文本提取都失败，但确实找到了按钮节点，尝试使用节点名称作为回退
        if (targetButtons.length > 0 && type === 'toolbar') {
            // 为每个按钮节点创建一个按钮
            // 即使节点名称是 "按钮"，也创建按钮，使用索引或位置作为标签
            const fallbackButtons: ToolbarButton[] = [];
            for (let i = 0; i < targetButtons.length; i++) {
                const btnNode = targetButtons[i];
                const nodeName = btnNode.name.trim();
                let buttonLabel = '';
                
                // 尝试从节点名称获取标签
                if (nodeName && nodeName !== '按钮' && nodeName !== 'button' && nodeName.length > 1) {
                    buttonLabel = nodeName;
                } else {
                    // 如果节点名称是通用名称，尝试从实例覆盖或其他方式获取
                    // 或者使用默认标签
                    if (btnNode.type === 'INSTANCE') {
                        const instance = btnNode as InstanceNode;
                        // 检查实例覆盖
                        const overrides = (instance as any).overrides || {};
                        for (const [overrideId, override] of Object.entries(overrides)) {
                            if (typeof override === 'string' && (override as string).trim()) {
                                const trimmed = (override as string).trim();
                                // 即使覆盖值是 "文字"，也使用它（至少比没有好）
                                if (trimmed.length > 0) {
                                    buttonLabel = trimmed;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // 如果仍然没有标签，使用默认标签
                    if (!buttonLabel) {
                        buttonLabel = `按钮${i + 1}`;
                    }
                }
                
                const actionType = this.inferActionType(buttonLabel, nodeName, 'toolbar');
                fallbackButtons.push({
                    type: actionType as any,
                    label: buttonLabel,
                    key: this.generateFieldKey(buttonLabel)
                });
            }
            
            if (fallbackButtons.length > 0) {
                return {
                    type,
                    buttons: fallbackButtons,
                    layout: this.inferButtonLayout(targetButtons),
                    align: this.inferButtonAlign(targetButtons)
                };
            }
        }
        return undefined;
    }

    return {
      type,
      buttons: allButtons,
      layout: this.inferButtonLayout(targetButtons),
      align: this.inferButtonAlign(targetButtons)
    };
  }

  /**
   * 提取单个按钮
   */
  private extractButton(node: SceneNode, context: 'search' | 'toolbar'): ToolbarButton | ActionButton | undefined {
    const namingProtocol = this.protocolManager.getNamingProtocol();
    
    // 排除明显的容器节点（不应该作为按钮处理）
    const isContainerName = /组|group|container|wrapper|容器|按钮组|buttonGroup/i.test(node.name);
    if (isContainerName && isContainer(node)) {
      return undefined;
    }
    
    // 增强文本提取逻辑：收集所有文本节点，然后选择最合适的
    const allTextNodes: Array<{text: string, depth: number, nodeName: string}> = [];
    
    const collectTextRecursive = (n: SceneNode, depth: number): void => {
        if (depth > 20) return; // 进一步增加深度限制以支持非常深的嵌套
        if (n.type === 'TEXT') {
            const text = (n as TextNode).characters.trim();
            if (text) {
                allTextNodes.push({text, depth, nodeName: n.name});
            }
        }
        if (isContainer(n)) {
            // 确保能访问所有子节点（包括实例的子节点）
            const children = 'children' in n ? n.children : [];
            for (const child of children) {
                // 对于 toolbar 上下文，遍历所有子节点（包括不可见的），因为实际文本可能在隐藏的节点中
                if (context === 'toolbar') {
                    // 对于 toolbar，遍历所有子节点，不管是否可见
                    collectTextRecursive(child, depth + 1);
                } else if (child.visible) {
                    collectTextRecursive(child, depth + 1);
                } else if (child.type === 'TEXT' && depth <= 3) {
                    // 对于其他上下文，也检查不可见的文本节点（可能是被隐藏的实际文本）
                    const text = (child as TextNode).characters.trim();
                    if (text && !/^文字$|^text$/i.test(text)) {
                        allTextNodes.push({text, depth: depth + 1, nodeName: child.name});
                    }
                }
            }
        }
    };

    collectTextRecursive(node, 0);

    // 对于 INSTANCE 节点，尝试访问主组件获取文本
    if (node.type === 'INSTANCE') {
        const instance = node as InstanceNode;
        
        // 首先检查组件属性（component properties）- Figma 的新功能
        if (instance.componentProperties) {
            // 遍历组件属性，查找文本属性
            for (const [propKey, propValue] of Object.entries(instance.componentProperties)) {
                // 只处理文本相关属性
                if (!/文字|内容|text|content|label|标签/i.test(propKey)) {
                    continue;
                }
                
                let textValue: string | null = null;
                
                // 组件属性可能是字符串，也可能是对象（包含 value 字段）
                if (typeof propValue === 'string') {
                    textValue = propValue;
                } else if (propValue && typeof propValue === 'object') {
                    // 递归函数：深度提取文本值
                    const extractTextFromValue = (obj: any, maxDepth: number = 5): string | null => {
                        if (maxDepth <= 0) return null;
                        
                        // 如果是字符串，直接返回
                        if (typeof obj === 'string') {
                            return obj;
                        }
                        
                        // 如果是对象，尝试多种字段
                        if (obj && typeof obj === 'object') {
                            // 优先检查 characters（TextNode）
                            if ('characters' in obj && typeof obj.characters === 'string') {
                                return obj.characters;
                            }
                            
                            // 检查 value 字段
                            if ('value' in obj) {
                                const val = obj.value;
                                if (typeof val === 'string') {
                                    return val;
                                } else if (val && typeof val === 'object') {
                                    // 递归提取
                                    const nested = extractTextFromValue(val, maxDepth - 1);
                                    if (nested) return nested;
                                }
                            }
                            
                            // 检查其他可能的字段
                            for (const key of ['text', 'content', 'label', '文字', '内容']) {
                                if (key in obj) {
                                    const nested = extractTextFromValue(obj[key], maxDepth - 1);
                                    if (nested) return nested;
                                }
                            }
                        }
                        
                        return null;
                    };
                    
                    textValue = extractTextFromValue(propValue) || String(propValue);
                }
                
                if (textValue && textValue.trim()) {
                    const trimmed = textValue.trim();
                    
                    // 排除占位符、布尔值、图标ID、样式值
                    const isNotPlaceholder = !/^文字$|^text$|^label$/i.test(trimmed);
                    const isNotBoolean = trimmed !== 'true' && trimmed !== 'false';
                    const isNotIconId = !/^\d+:\d+$/.test(trimmed); // 排除图标ID如 "1:314"
                    const isNotStyleValue = !/^大$|^小$|^主要$|^次要$|^默认$|^hover$|^disabled$/i.test(trimmed);
                    
                    if (isNotPlaceholder && isNotBoolean && isNotIconId && isNotStyleValue) {
                        allTextNodes.push({text: trimmed, depth: 0, nodeName: `property:${propKey}`});
                    }
                }
            }
        }
        
        // 检查是否有实例覆盖（instance overrides）
        // 注意：实例覆盖可能覆盖了组件属性的值，需要检查覆盖中是否有文本节点的覆盖
        if (instance.overrides && Object.keys(instance.overrides).length > 0) {
            // 遍历覆盖，查找文本覆盖
            for (const [overrideId, override] of Object.entries(instance.overrides as any)) {
                let textValue: string | null = null;
                
                // 覆盖可能是字符串，也可能是对象
                if (typeof override === 'string') {
                    textValue = override;
                } else if (override && typeof override === 'object') {
                    // 使用递归函数提取文本值
                    const extractTextFromOverride = (obj: any, maxDepth: number = 5): string | null => {
                        if (maxDepth <= 0) return null;
                        
                        if (typeof obj === 'string') {
                            return obj;
                        }
                        
                        if (obj && typeof obj === 'object') {
                            // 优先检查 characters（TextNode）
                            if ('characters' in obj && typeof obj.characters === 'string') {
                                return obj.characters;
                            }
                            
                            // 检查 value 字段
                            if ('value' in obj) {
                                const val = obj.value;
                                if (typeof val === 'string') {
                                    return val;
                                } else if (val && typeof val === 'object') {
                                    const nested = extractTextFromOverride(val, maxDepth - 1);
                                    if (nested) return nested;
                                }
                            }
                            
                            // 检查其他可能的字段
                            for (const key of ['text', 'content', 'label', '文字', '内容']) {
                                if (key in obj) {
                                    const nested = extractTextFromOverride(obj[key], maxDepth - 1);
                                    if (nested) return nested;
                                }
                            }
                        }
                        
                        return null;
                    };
                    
                    textValue = extractTextFromOverride(override);
                }
                
                if (textValue && (textValue as string).trim()) {
                    const trimmed = (textValue as string).trim();
                    if (trimmed !== '文字' && trimmed !== 'text') {
                        allTextNodes.push({text: trimmed, depth: 0, nodeName: `override:${overrideId}`});
                    }
                }
            }
        }
        
        // 注意：在 dynamic-page 权限下，不能直接访问 mainComponent
        // 如果需要访问主组件，需要使用 getMainComponentAsync()，但这里我们跳过主组件访问
        // 因为我们已经有了实例覆盖的回退策略
    }

    // 选择最合适的文本节点
    // 优先级：1. 排除占位符文本（如 "文字"） 2. 较长的文本（通常是按钮标签） 3. 不是单个字符或图标符号
    let buttonText = '';
    if (allTextNodes.length > 0) {
        // 过滤掉明显的占位符和图标文本
        const filtered = allTextNodes.filter(t => {
            const text = t.text;
            const isPlaceholder = /^文字$|^text$|^label$|^placeholder$/i.test(text) || // 占位符
                                 text.length <= 1 || 
                                 /^[\u{1F300}-\u{1F9FF}]$/u.test(text) || // emoji
                                 /icon|图标/i.test(t.nodeName);
            return !isPlaceholder;
        });

        if (filtered.length > 0) {
            // 选择最长的文本（通常是按钮标签）
            buttonText = filtered.reduce((best, current) => 
                current.text.length > best.text.length ? current : best
            ).text;
        } else {
            // 如果所有文本都被过滤掉了（都是占位符），尝试从实例覆盖获取
            
            // 对于 INSTANCE 节点，尝试从实例覆盖获取文本
            if (node.type === 'INSTANCE') {
                const instance = node as InstanceNode;
                // 检查实例覆盖中的文本节点
                const overrideTexts: string[] = [];
                const overrides = (instance as any).overrides || {};
                for (const [overrideId, override] of Object.entries(overrides)) {
                    if (typeof override === 'string' && (override as string).trim()) {
                        const trimmed = (override as string).trim();
                        // 对于 toolbar 上下文，即使覆盖值是占位符也使用（至少比没有好）
                        if (context === 'toolbar') {
                            overrideTexts.push(trimmed);
                        } else if (!/^文字$|^text$|^label$|^placeholder$/i.test(trimmed)) {
                            // 对于其他上下文，排除占位符
                            overrideTexts.push(trimmed);
                        }
                    }
                }
                if (overrideTexts.length > 0) {
                    buttonText = overrideTexts[0]; // 使用第一个覆盖文本
                } else {
                    // 如果实例覆盖也没有文本，对于 toolbar 上下文，使用原始文本（即使是占位符）
                    // 注意：在 dynamic-page 权限下，不能直接访问 mainComponent
                    if (context === 'toolbar' && allTextNodes.length > 0) {
                        buttonText = allTextNodes[0].text;
                    } else {
                        return undefined;
                    }
                }
            } else {
                // 对于 non-INSTANCE 节点，对于 toolbar context，使用 raw text
                if (context === 'toolbar' && allTextNodes.length > 0) {
                    buttonText = allTextNodes[0].text;
                } else {
                    return undefined;
                }
            }
        }
    }

    if (!buttonText) {
        return undefined;
    }

    if (context === 'search') {
      return {
        type: 'custom',
        label: buttonText,
        key: this.generateFieldKey(buttonText)
      } as ToolbarButton;
    } else {
      // toolbar context uses action type inference
      const actionType = this.inferActionType(buttonText, node.name, 'toolbar');
      const validActionTypes = ['add', 'export', 'import', 'refresh', 'custom'];
      if (validActionTypes.indexOf(actionType) !== -1) {
        return {
          type: actionType as any,
          label: buttonText,
          key: this.generateFieldKey(buttonText)
        } as ToolbarButton;
      }
    }

    return undefined;
  }

  /**
   * 推断动作类型
   * 根据上下文（toolbar 或 operations）使用不同的推断逻辑
   */
  private inferActionType(text: string, name: string, context: 'toolbar' | 'operations' = 'operations'): string {
    if (context === 'toolbar') {
      return this.intelligenceEngine.inferToolbarAction(text, name);
    } else {
      return this.intelligenceEngine.inferRowAction(text, name);
    }
  }

  /**
   * 推断按钮布局
   */
  private inferButtonLayout(nodes: SceneNode[]): 'horizontal' | 'vertical' {
    const layoutProtocol = this.protocolManager.getLayoutProtocol();
    const sameRow = nodes.every((node, index) => {
      if (index === 0) return true;
      return layoutProtocol.isSameRow(nodes[0], node);
    });

    return sameRow ? 'horizontal' : 'vertical';
  }

  /**
   * 推断按钮对齐方式
   */
  private inferButtonAlign(nodes: SceneNode[]): 'left' | 'center' | 'right' {
    if (nodes.length === 0) return 'left';

    const totalWidth = Math.max(...nodes.map(n => n.x + n.width)) - Math.min(...nodes.map(n => n.x));
    const containerWidth = totalWidth; 
    const leftOffset = Math.min(...nodes.map(n => n.x));
    const centerOffset = containerWidth / 2 - totalWidth / 2;

    if (Math.abs(leftOffset - centerOffset) < 20) return 'center';
    if (leftOffset > centerOffset) return 'right';
    return 'left';
  }

  /**
   * 提取操作组 (OperationGroup)
   * 专门用于识别和提取操作列及其按钮
   */
  private extractOperationGroup(nodes: SceneNode[]): {
    column?: TableColumn;
    buttons: ActionButton[];
  } | undefined {
    const namingProtocol = this.protocolManager.getNamingProtocol();

    // 递归查找所有符合条件的操作列节点
    const findOperationNodesRecursive = (roots: SceneNode[]): SceneNode[] => {
        const results: SceneNode[] = [];
        const queue = [...roots];
        let safetyCounter = 0;
        
        while (queue.length > 0 && safetyCounter < 1000) {
            safetyCounter++;
            const node = queue.shift()!;
            
            if (!node.visible) continue;

            const isMatch = this.isExplicitActionColumn(node);
            let isWrapper = false;

            if (isMatch) {
                // 关键防御：检查是否误判了整个列容器（Columns Wrapper）
                // 1. 宽度检查：操作列通常不会特别宽（除非只有一列且撑满）
                // 如果宽度超过 400px 且包含多个子节点，很可能是容器
                const isTooWide = node.width > 400;
                
                // 2. 结构检查：如果包含明确的“非操作列”子节点
                // 比如包含 "Status", "Date" 等其他列
                let hasOtherColumns = false;
                if (isContainer(node)) {
                    // @ts-ignore
                    const children = node.children || [];
                    // 简单的启发式检查：如果子节点数量 > 3 且宽度之和接近父容器宽度
                    if (children.length > 3 && isTooWide) {
                        hasOtherColumns = true;
                    }
                }

                if (isTooWide || hasOtherColumns) {
                    console.log(`[EnhancedTableProcessor] Node '${node.name}' matched OperationGroup but seems to be a wrapper (width: ${node.width}). Continuing recursion.`);
                    isWrapper = true;
                } else {
                    results.push(node);
                    // 找到真正的操作列后，不再深入
                    continue;
                }
            }
            
            // 如果不是匹配项，或者是误判的容器，继续递归
            if (!isMatch || isWrapper) {
                if (isContainer(node)) {
                    // @ts-ignore
                    if (node.children) {
                        // @ts-ignore
                        queue.push(...node.children);
                    }
                }
            }
        }
        return results;
    };

    // 使用递归查找操作列节点
    const actionNodes = findOperationNodesRecursive(nodes);
    
    console.log(`[EnhancedTableProcessor] Found ${actionNodes.length} potential OperationGroup nodes: [${actionNodes.map(n => n.name).join(', ')}]`);

    if (actionNodes.length === 0) return undefined;

    const buttons: ActionButton[] = [];
    
    actionNodes.forEach(node => {
      // console.log(`[EnhancedTableProcessor] Processing action node '${node.name}' (type: ${node.type})`);
      if (isContainer(node)) {
        const children = findChildren(node, n => n.visible);
        // console.log(`[EnhancedTableProcessor] Node has ${children.length} visible children`);
        children.forEach(child => {
          const button = this.extractActionButton(child);
          if (button) {
             // console.log(`[EnhancedTableProcessor] Extracted button: ${button.label} (${button.type}) from '${child.name}'`);
             buttons.push(button);
          }
        });
      } else {
        const button = this.extractActionButton(node);
        if (button) {
            // console.log(`[EnhancedTableProcessor] Extracted button: ${button.label} (${button.type}) from '${node.name}'`);
            buttons.push(button);
        }
      }
    });

    console.log(`[EnhancedTableProcessor] Total extracted buttons before deduplication: ${buttons.length}. Labels: [${buttons.map(b => b.label).join(', ')}]`);

    if (buttons.length === 0) return undefined;

    // 去重操作按钮（基于key）
    const uniqueButtons = buttons.filter((button, index, self) => 
      index === self.findIndex(b => b.key === button.key)
    );

    const actionColumn: TableColumn = {
      title: '操作',
      dataIndex: 'actions',
      type: 'action',
      width: 150,
      align: 'center',
      fixed: 'right'
    };

    return {
      column: actionColumn,
      buttons: uniqueButtons
    };
  }

  /**
   * 提取操作按钮
   */
  private extractActionButton(node: SceneNode): ActionButton | undefined {
    const namingProtocol = this.protocolManager.getNamingProtocol();
    
    // 使用递归查找文本（与 extractButton 方法保持一致）
    let buttonText = '';
    
    const findTextRecursive = (n: SceneNode, depth: number): string => {
        if (depth > 5) return ''; // 增加深度限制以支持更深层的嵌套
        if (n.type === 'TEXT') {
            const text = (n as TextNode).characters.trim();
            if (text) return text;
        }
        if (isContainer(n)) {
            // 优先找直接子节点中的文本
            for (const child of n.children) {
                if (child.visible) {
                    const text = findTextRecursive(child, depth + 1);
                    if (text) return text;
                }
            }
        }
        return '';
    };

    buttonText = findTextRecursive(node, 0);

    if (!buttonText) return undefined;

    // 过滤掉明显不是操作按钮的内容
    const content = buttonText.trim().toLowerCase();
    
    // 1. 检查是否应该被排除
    if (this.intelligenceEngine.shouldExclude(buttonText)) {
      return undefined;
    }
    
    // 2. 检查是否包含操作相关的关键词
    if (!this.intelligenceEngine.hasActionKeyword(buttonText)) {
      return undefined;
    }

    // 3. 推断动作类型（使用 operations 上下文）
    const actionType = this.inferActionType(buttonText, node.name, 'operations');
    // 有效的操作列动作类型
    const validActionTypes = ['edit', 'delete', 'view', 'custom'];
    
    if (validActionTypes.indexOf(actionType) === -1) return undefined;
    
    return {
      type: actionType as any,
      label: buttonText,
      key: this.generateFieldKey(buttonText),
      danger: actionType === 'delete',
      confirm: actionType === 'delete' ? {
        title: '确认删除',
        content: '确定要删除这条记录吗？'
      } : undefined
    };
  }

  /**
   * 从表头提取表格列
   */
  private extractTableColumnsFromHeader(headerNode: SceneNode): TableColumn[] {
    const columns: TableColumn[] = [];
    if (!isContainer(headerNode)) return columns;

    const children = sortNodesByPosition(findChildren(headerNode, n => n.visible));

    children.forEach(child => {
      let title = '';
      const width = child.width;
      let align: 'left' | 'center' | 'right' = 'left';

      if (child.type === 'TEXT') {
        title = child.characters;
        align = this.determineTextAlignment(child, headerNode);
      } else if (isContainer(child)) {
        const textChild = findOneChild(child, n => n.type === 'TEXT') as TextNode;
        if (textChild) {
          title = textChild.characters;
          align = this.determineTextAlignment(textChild, child as SceneNode);
        }
      }

      if (title) {
        columns.push({
          title,
          dataIndex: this.generateFieldKey(title),
          width,
          align
        });
      }
    });

    return columns;
  }

  /**
   * 判断文本对齐方式
   */
  private determineTextAlignment(textNode: TextNode, container: SceneNode): 'left' | 'center' | 'right' {
    const textCenterX = textNode.x + textNode.width / 2;
    const containerCenterX = container.x + container.width / 2;
    const diff = Math.abs(textCenterX - containerCenterX);

    // 使用硬编码的阈值（5px / 2 = 2.5px）
    if (diff < 2.5) return 'center';
    if (textCenterX < containerCenterX) return 'left';
    return 'right';
  }

  /**
   * 递归提取表格列
   */
  private extractTableColumnsRecursive(node: SceneNode, depth: number = 0): TableColumn[] {
    // console.log(`[EnhancedTableProcessor] extractTableColumnsRecursive: checking node '${node.name}' (${node.type}) at depth ${depth}`);
    if (depth > 4) {
      // console.log(`[EnhancedTableProcessor] Max depth (${depth}) reached for node '${node.name}'`);
      return [];
    }
    if (!isContainer(node)) {
      // console.log(`[EnhancedTableProcessor] Node '${node.name}' is not a container`);
      return [];
    }

    const children = sortNodesByPosition(findChildren(node, n => n.visible));
    // console.log(`[EnhancedTableProcessor] Node '${node.name}' has ${children.length} visible children: [${children.map(c => c.name).join(', ')}]`);
    
    // 优先检查是否存在明确的 'columns' 子容器
    // 如果存在，直接进入该容器处理，跳过当前节点的 Header 判断
    const explicitColumnsChild = children.find(c => /columns|表头|列定义/i.test(c.name));
    // console.log(`[EnhancedTableProcessor] Looking for explicit columns child among: [${children.map(c => c.name).join(', ')}]`);
    if (explicitColumnsChild) {
        console.log(`[EnhancedTableProcessor] Found explicit columns container '${explicitColumnsChild.name}' inside '${node.name}', prioritizing recursion.`);
        const cols = this.extractTableColumnsRecursive(explicitColumnsChild);
        if (cols.length > 0) {
            return cols;
        }
        console.log(`[EnhancedTableProcessor] Explicit columns container yielded no columns. Continuing search...`);
    } else {
        // console.log(`[EnhancedTableProcessor] No explicit columns child found in '${node.name}'`);
    }

    const namingProtocol = this.protocolManager.getNamingProtocol();

    if (namingProtocol.isHeaderComponent(node.name)) {
      const headerColumns = this.extractTableColumnsFromHeader(node);
      // 如果标准表头提取找到了列，直接返回
      // 增加阈值检查：如果只找到1列，且该列宽度接近容器宽度，可能是误判（把整个容器当成了一列），此时继续深层搜索
      const firstCol = headerColumns[0];
      const colWidth = (firstCol && firstCol.width) || 0;
      if (headerColumns.length > 1 || (headerColumns.length === 1 && firstCol && colWidth < node.width * 0.8)) {
          return headerColumns;
      }
      // console.log(`[EnhancedTableProcessor] Node '${node.name}' matched header naming but yielded insufficient columns (${headerColumns.length}). Continuing deep search.`);
    }
    
    // 新增：支持基于列组件的结构 (Column-based Structure)
    // 检查是否是 'columns' 容器
    const isExplicitColumnsContainer = /columns|表头|列定义/i.test(node.name);
    
    // 如果是明确的 columns 容器，或者是包含列组件的容器
    if (isExplicitColumnsContainer || children.some(c => /列|column/i.test(c.name))) {
        // console.log(`[EnhancedTableProcessor] Checking node '${node.name}' for columns. isExplicit=${isExplicitColumnsContainer}`);
        let potentialColumns: SceneNode[] = [];
        
        if (isExplicitColumnsContainer) {
            // 如果容器名明确是 Columns，处理可能的嵌套结构
            let candidates = [...children];
            // console.log(`[EnhancedTableProcessor] Explicit columns container has ${candidates.length} children`);
            
            // 1. 尝试解包单层包裹 (e.g. Columns -> Group -> [Col1, Col2])
            if (candidates.length === 1 && isContainer(candidates[0])) {
                // console.log(`[EnhancedTableProcessor] Unwrapping single child '${candidates[0].name}' inside Columns container`);
                candidates = findChildren(candidates[0], n => n.visible);
            }

            // 2. 尝试扁平化布局组 (e.g. Columns -> Left[Col1] + Right[Col2])
            const flattenedCandidates: SceneNode[] = [];
            for (const candidate of candidates) {
                // 如果是布局容器 (Left, Right, Group, Layout)，则提取其子节点
                if (isContainer(candidate) && /group|left|right|center|middle|layout|auto/i.test(candidate.name)) {
                     // console.log(`[EnhancedTableProcessor] Flattening layout group '${candidate.name}' inside Columns container`);
                     flattenedCandidates.push(...findChildren(candidate, n => n.visible));
                } else {
                     flattenedCandidates.push(candidate);
                }
            }
            
            // 过滤出有效的容器或文本作为列
            potentialColumns = flattenedCandidates.filter(c => isContainer(c) || c.type === 'TEXT');
            // console.log(`[EnhancedTableProcessor] Potential columns after filtering: ${potentialColumns.length}`);
        } else {
            // 否则，只提取名称包含 '列' 或 'column' 的子节点
            potentialColumns = children.filter(c => /列|column/i.test(c.name));
        }

        if (potentialColumns.length > 0) {
            console.log(`[EnhancedTableProcessor] Found column-based structure in '${node.name}' with ${potentialColumns.length} columns`);
            const columns: TableColumn[] = [];
            const seenTitles = new Set<string>(); // 用于去重
            
            potentialColumns.forEach(colNode => {
                // 递归查找列组件内的标题文本
                const findTitleText = (n: SceneNode, d: number): { text: string, score: number } => {
                    if (d > 10) return { text: '', score: 0 };
                    
                    if (n.type === 'TEXT') {
                        const name = n.name.toLowerCase();
                        const content = (n as TextNode).characters.trim();
                        if (!content) return { text: '', score: 0 };

                        let score = 1; // 基础分
                        
                        // 1. 节点名匹配
                        if (/title|header|name|label|caption|text|标题|名称|文字/.test(name)) {
                            score += 10;
                            // 如果是极其明确的命名
                            if (name === 'title' || name === '标题') score += 5;
                        }
                        
                        // 2. 内容特征 (排除显然不是标题的内容)
                        if (content.length > 20) score -= 5;
                        if (/^\d+$/.test(content)) score -= 2; // 纯数字不太像列标题
                        
                        return { text: content, score };
                    }
                    
                    if (isContainer(n)) {
                        let bestResult = { text: '', score: 0 };
                        
                        // 遍历子节点寻找最佳匹配
                        for (const child of n.children) {
                            const res = findTitleText(child, d + 1);
                            if (res.score > bestResult.score) {
                                bestResult = res;
                            }
                        }
                        return bestResult;
                    }
                    
                    return { text: '', score: 0 };
                };

                const result = findTitleText(colNode, 0);
                if (result.score > 0) {
                    const title = result.text;
                    
                    // 去重检查
                    if (seenTitles.has(title)) {
                        console.log(`[EnhancedTableProcessor] Skipping duplicate column title: '${title}'`);
                        return;
                    }
                    seenTitles.add(title);
                    
                    // 过滤掉过于宽泛的标题（可能是整个容器）
                    const colWidth = (colNode as any).width || 0;
                    const parentWidth = (colNode.parent && 'width' in colNode.parent) ? (colNode.parent as any).width : 0;
                    if (colWidth > parentWidth * 0.8) {
                        console.log(`[EnhancedTableProcessor] Skipping overly wide column: '${title}' (width: ${colWidth}, parent: ${parentWidth})`);
                        return;
                    }
                    
                    // 检查标题是否为操作列（但只在确实有操作按钮时才过滤）
                    // 使用协议配置进行匹配（优先检查节点本身的角色）
                    if (this.isExplicitActionColumn(colNode) || this.isExplicitActionColumn(title)) {
                        console.log(`[EnhancedTableProcessor] Found potential action column: '${title}' from node '${colNode.name}'`);
                        // 先不添加到普通列中，稍后会统一处理操作列
                        return;
                    }
                    
                    console.log(`[EnhancedTableProcessor] Extracted column title: '${title}' (score: ${result.score}) from node '${colNode.name}'`);
                    columns.push({
                        title,
                        dataIndex: this.generateFieldKey(title),
                        width: colWidth,
                        align: 'left'
                    });
                } else {
                    // console.log(`[EnhancedTableProcessor] Failed to extract title from column node '${colNode.name}'`);
                }
            });
            
            if (columns.length > 0) return columns;
        }
    }

    const layoutProtocol = this.protocolManager.getLayoutProtocol();

    if (layoutProtocol.isTableStructure(children)) {
      const rows = layoutProtocol.groupByRows(children);
      const firstRow = rows[0];
      
      if (firstRow && firstRow.length > 0) {
        const isHeaderLike = firstRow.every(n => {
            if (n.type === 'TEXT') return true;
            if (isContainer(n)) return findOneChild(n, c => c.type === 'TEXT') !== null;
            return false;
        });

        if (isHeaderLike) {
            return this.extractTableColumnsFromHeader({
            name: 'inferred-header',
            type: 'FRAME',
            children: firstRow,
            x: 0, y: 0, width: 0, height: 0,
            visible: true,
            locked: false
            } as unknown as SceneNode);
        }
      }
    } else if (children.length > 0) {
        const firstChild = children[0];
        if (isContainer(firstChild) && (firstChild.type === 'FRAME' || firstChild.type === 'INSTANCE' || firstChild.type === 'GROUP')) {
            const headerChildren = findChildren(firstChild, n => n.visible);
            if (headerChildren.length > 1) {
                const textCount = headerChildren.filter(n => n.type === 'TEXT' || (isContainer(n) && findOneChild(n, c => c.type === 'TEXT'))).length;
                if (textCount / headerChildren.length > 0.5) {
                     return this.extractTableColumnsFromHeader(firstChild);
                }
            }
        }
    }

    // 新增：基于布局的智能列识别回退策略
    if (depth === 0) {
      // console.log(`[EnhancedTableProcessor] At root level, trying layout-based column recognition for node '${node.name}'`);
      const layoutColumns = this.extractColumnsFromLayout(node);
      if (layoutColumns.length > 0) {
        console.log(`[EnhancedTableProcessor] Layout-based recognition found ${layoutColumns.length} columns`);
        return layoutColumns;
      }
    }

    for (const child of children) {
      const cols = this.extractTableColumnsRecursive(child, depth + 1);
      if (cols.length > 0) return cols;
    }

    // console.log(`[EnhancedTableProcessor] No columns found in node '${node.name}' or its children`);
    return [];
  }

  /**
   * 基于布局的列识别 - 回退策略
   * 通过查找水平排列的文本节点来识别表格列
   */
  private extractColumnsFromLayout(node: SceneNode): TableColumn[] {
    // console.log(`[EnhancedTableProcessor] extractColumnsFromLayout: analyzing node '${node.name}'`);
    
    const allTextNodes: TextNode[] = [];
    this.collectTextNodes(node, allTextNodes);
    
    // console.log(`[EnhancedTableProcessor] Found ${allTextNodes.length} text nodes:`);
    // allTextNodes.forEach(t => console.log(`  - "${t.characters}" (x:${Math.round(t.x)}, y:${Math.round(t.y)})`));
    
    // 筛选出可能是列标题的文本节点
    const potentialHeaders = allTextNodes.filter(text => {
      const content = text.characters.trim();
      const isSearch = this.isSearchRelatedText(content);
      const isTitle = this.isTitleText(content);
      const isValid = content.length > 0 && content.length < 50 && !isSearch && !isTitle;
      
      // if (!isValid) {
      //     console.log(`  [Filter] Excluding "${content}": length=${content.length}, isSearch=${isSearch}, isTitle=${isTitle}`);
      // }
      return isValid;
    });
    
    // console.log(`[EnhancedTableProcessor] Potential headers (${potentialHeaders.length}): [${potentialHeaders.map(t => `'${t.characters}'`).join(', ')}]`);
    
    // 按Y坐标分组，找出可能的表格行
    const rows = this.groupTextsByRow(potentialHeaders);
    // console.log(`[EnhancedTableProcessor] Grouped into ${rows.length} rows`);
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const y = row.length > 0 ? Math.round(row[0].y) : '?';
      // console.log(`[EnhancedTableProcessor] Row ${i + 1} (y~${y}): ${row.length} items [${row.map(t => `'${t.characters}'`).join(', ')}]`);
    }
    
    // 寻找最可能的表格列（通常是水平排列最多文本节点的行）
    let bestRow: TextNode[] = [];
    let maxColumns = 0;
    
    for (const row of rows) {
      if (row.length >= 2 && row.length > maxColumns) {
        maxColumns = row.length;
        bestRow = row;
      }
    }
    
    // console.log(`[EnhancedTableProcessor] Best row for columns: [${bestRow.map(t => `'${t.characters}'`).join(', ')}]`);
    
    // 如果找到了合适的行，转换为表格列
    if (bestRow.length >= 2) {
      console.log(`[EnhancedTableProcessor] Layout-based recognition found ${bestRow.length} columns: [${bestRow.map(t => t.characters).join(', ')}]`);
      const columns: TableColumn[] = bestRow.map(textNode => ({
        title: textNode.characters.trim(),
        dataIndex: this.generateFieldKey(textNode.characters.trim()),
        width: textNode.width || 100,
        align: 'left'
      }));
      
      return columns;
    }
    
    return [];
  }

  /**
   * 判断是否为搜索相关文本
   */
  private isSearchRelatedText(content: string): boolean {
    const searchKeywords = ['搜索', '查询', '筛选', '关键字', 'keyword', 'search', 'filter', 'query'];
    return searchKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
  }

  /**
   * 判断是否为页面标题文本
   */
  private isTitleText(content: string): boolean {
    // 通常标题比较简短且具有概括性
    const titlePatterns = [
      /^.*列表$/, // XX列表
      /^.*管理$/, // XX管理  
      /^.*信息$/, // XX信息
      /^用户.*$/,
      /^.*页面$/
    ];
    
    return titlePatterns.some(pattern => pattern.test(content));
  }

  /**
   * 递归收集所有文本节点
   */
  private collectTextNodes(node: SceneNode, collection: TextNode[]): void {
    if (node.type === 'TEXT') {
      collection.push(node as TextNode);
    } else if (isContainer(node)) {
      for (const child of node.children) {
        this.collectTextNodes(child, collection);
      }
    }
  }

  /**
   * 检查节点是否包含文本内容
   */
  private hasTextContent(node: SceneNode): boolean {
    if (node.type === 'TEXT') {
      return (node as TextNode).characters.trim().length > 0;
    }
    if (isContainer(node)) {
      for (const child of node.children) {
        if (this.hasTextContent(child)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 按Y坐标将文本节点分组为行
   */
  private groupTextsByRow(textNodes: TextNode[]): TextNode[][] {
    if (textNodes.length === 0) return [];
    
    // 按Y坐标排序
    const sorted = textNodes.sort((a, b) => a.y - b.y);
    
    const rows: TextNode[][] = [];
    let currentRow: TextNode[] = [sorted[0]];
    let currentY = sorted[0].y;
    const rowThreshold = 10; // Y坐标差异小于10像素认为是同一行
    
    for (let i = 1; i < sorted.length; i++) {
      const node = sorted[i];
      if (Math.abs(node.y - currentY) <= rowThreshold) {
        currentRow.push(node);
      } else {
        // 按X坐标排序当前行
        currentRow.sort((a, b) => a.x - b.x);
        rows.push(currentRow);
        currentRow = [node];
        currentY = node.y;
      }
    }
    
    // 添加最后一行
    if (currentRow.length > 0) {
      currentRow.sort((a, b) => a.x - b.x);
      rows.push(currentRow);
    }
    
    return rows;
  }

  /**
   * 辅助方法：基于角色查找组件
   */
  private findComponentByRole(root: SceneNode, role: TableRole): SceneNode | null {
    if (!isContainer(root)) return null;
    
    // 广度优先搜索，优先找浅层的
    const queue = [root];
    const visited = new Set<string>(); // 防止循环引用
    const candidates: SceneNode[] = [];
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        if (visited.has(node.id)) continue;
        visited.add(node.id);

        const analysis = this.intelligenceEngine.resolveNodeRole(node);
        
        // 发现匹配角色
        if (analysis.role === role && analysis.confidence > 0.6) {
            // 优先返回可见节点
            if (node.visible) {
                return node;
            } else {
                candidates.push(node);
            }
        }

        if (isContainer(node)) {
            // 对于搜索组件，如果节点不可见，其子节点通常也不应该被搜索（除非是 root）
            // 但为了安全，我们仍然搜索子节点，只是增加记录
            // @ts-ignore - TS issue with children types
            queue.push(...node.children);
        }
    }
    
    // 如果没有可见的匹配项，返回第一个找到的（即使不可见）作为最后手段
    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * 处理表格页面
   */
  processTablePage(node: SceneNode): TablePageModel {
      console.log("[EnhancedTableProcessor] processTablePage started");
      // logNodeStructure(node); // 暂时屏蔽详细结构日志，响应"只看列"

      let searchFields: SearchField[] = [];
    let searchButtons: ButtonGroup | undefined;
    let tableTitle: HeaderAreaModel | undefined;
    let toolbarLeft: ButtonGroup | undefined;
    let toolbarRight: ButtonGroup | undefined;
    let columns: TableColumn[] = [];
    let actionButtons: ActionButton[] | undefined;

    // 1. 提取表格标题 (HeaderArea)
    tableTitle = this.extractTableTitle(node);
    if (tableTitle) {
      console.log(`[EnhancedTableProcessor] Found Table Title: ${tableTitle.title}`);
    }

    // 2. 查找并处理搜索区域 (SearchArea)
    // 优先使用新协议
    const searchAreaNode = this.findComponentByRole(node, 'SearchArea');
    if (searchAreaNode) {
      console.log(`[EnhancedTableProcessor] Found Search Area (Role): ${searchAreaNode.name}`);
      searchFields = this.extractSearchFieldsRecursive(searchAreaNode);
      
      const searchButtonNodes = findChildren(searchAreaNode, n => 
        this.protocolManager.getNamingProtocol().isButtonComponent(n.name)
      );
      searchButtons = this.extractButtonGroup(searchButtonNodes, 'search');
    } else {
      // 回退：扫描整个节点
      console.log("[EnhancedTableProcessor] No explicit search area found, scanning entire node");
      searchFields = this.extractSearchFieldsRecursive(node);
    }

    // 3. 查找并处理表格区域 (DataGrid)
    // 优先使用新协议
    const tableAreaNode = this.findComponentByRole(node, 'DataGrid');
    
    if (tableAreaNode) {
      console.log(`[EnhancedTableProcessor] Found Table Area (Role): ${tableAreaNode.name}`);
      
      // 检查找到的表格区域是否看起来像标题节点，如果是，则搜索兄弟节点
      let actualTableNode = tableAreaNode;
      if (/title|header|caption|标题|表头/i.test(tableAreaNode.name.toLowerCase())) {
        console.log(`[EnhancedTableProcessor] Table area '${tableAreaNode.name}' looks like a title, searching siblings for actual table`);
        // 搜索兄弟节点
        const parent = tableAreaNode.parent;
        if (parent && 'children' in parent) {
          const siblings = parent.children.filter(child => child.visible && child !== tableAreaNode);
          // 在兄弟节点中寻找可能的真实表格
          for (const sibling of siblings) {
            const siblingRole = TableIntelligenceEngine.resolveNodeRole(sibling);
            if (siblingRole.role === 'DataGrid' && siblingRole.confidence > 0.6) {
              console.log(`[EnhancedTableProcessor] Found actual table in sibling: ${sibling.name}`);
              actualTableNode = sibling;
              break;
            }
          }
        }
      }
      
      columns = this.extractTableColumnsRecursive(actualTableNode);

      // 提取工具栏按钮组 (ActionGroup)
      // 1. 优先查找独立的 ActionGroup 节点 (全局查找)
      // 增加逻辑：如果 node 是 DataGrid 的父级或更上层，ActionGroup 可能在 DataGrid 之外
      // 但 findComponentByRole(node, 'ActionGroup') 会遍历整个 node 树，所以没问题
      const actionGroupNode = this.findComponentByRole(node, 'ActionGroup');
      if (actionGroupNode) {
          console.log(`[EnhancedTableProcessor] Found Action Group: ${actionGroupNode.name} (visible: ${actionGroupNode.visible})`);
          
          toolbarRight = this.extractButtonGroup([actionGroupNode], 'toolbar');
      }

      const tableChildren = sortNodesByPosition(findChildren(tableAreaNode, n => n.visible));
      
      // 提取操作列 (OperationGroup) - 确保只生成一个操作列
      const actionResult = this.extractOperationGroup(tableChildren);
      
      // 移除所有已存在的操作列（避免重复，操作列只保留在 actionColumn 中）
      columns = columns.filter(col => col.dataIndex !== 'actions');
      
      // 如果找到了操作列，只保存按钮信息，不添加到 columns 中
      if (actionResult && actionResult.buttons.length > 0) {
        actionButtons = actionResult.buttons;
      }
    } else {
      // 回退：扫描整个节点
      console.log("[EnhancedTableProcessor] No explicit table area found, scanning entire node");
      columns = this.extractTableColumnsRecursive(node);
    }

    // 构建新结构 (BodyArea)
    const bodyArea: BodyAreaModel = {
      role: 'BodyArea',
      search: {
        role: 'SearchArea',
        fields: searchFields,
        buttons: searchButtons
      },
      table: {
        role: 'DataGrid',
        columns: columns,
        rowSelection: {
          type: 'checkbox',
          showSelectAll: true
        },
        actionColumn: actionButtons ? {
           column: {
             title: '操作',
             dataIndex: 'actions',
             type: 'action',
             width: 150,
             align: 'center',
             fixed: 'right'
           },
           buttons: actionButtons
        } : undefined
      },
      pagination: {
        role: 'PaginationBar',
        enabled: true,
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true
      }
    };

    // 添加工具栏 (ActionGroup)
    if (toolbarLeft || toolbarRight) {
      bodyArea.toolbar = {
        role: 'ActionGroup',
        left: toolbarLeft,
        right: toolbarRight
      };
    }

    // 构建最终模型 (TableContainer)
    const result: TablePageModel = {
      role: 'TableContainer',
      type: 'table-page',
      header: tableTitle,
      body: bodyArea
    };

    return result;
  }
}

/**
 * 兼容原有接口的函数
 */
export function processTablePage(node: SceneNode): TablePageModel {
  const processor = new EnhancedTableProcessor();
  return processor.processTablePage(node);
}
