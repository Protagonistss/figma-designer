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
import { TableIntelligenceEngine, TableRecognitionConfig, TableRole } from '../../protocol/config';

import { LayoutRecognitionConfig } from '../../protocol/config';

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

  constructor() {
    this.protocolManager = new ProtocolManager();
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
    while (queue.length > 0 && depth < 4) {
        const currentLevelNodes = [...queue];
        queue.length = 0; // 清空队列，准备下一层
        
        let hasButtons = false;

        for (const node of currentLevelNodes) {
            // 检查是否是按钮
            const isButton = namingProtocol.isButtonComponent(node.name) || 
                             this.extractButton(node, type) !== undefined;
            
            if (isButton) {
                candidates.push(node);
                hasButtons = true;
            } else if (isContainer(node)) {
                // 如果不是按钮，继续深入
                queue.push(...findChildren(node, n => n.visible));
            }
        }
        
        // 改进逻辑：如果找到了按钮，我们仍然可以继续查找同级或更深层的按钮
        // 除非我们确定这些按钮构成了完整的组
        // 这里简化为：如果找到了多个按钮，就停止深入；否则继续尝试找更多
        if (hasButtons && candidates.length > 1) {
            // 如果已经找到多个按钮，可能就是这一层了
            // 但也有可能这层只有几个，还有更多在其他分支
            // 为了安全起见，这里不break，而是通过depth控制
        }
        
        depth++;
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

    if (allButtons.length === 0) return undefined;

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
    
    // 增强文本提取逻辑：递归查找文本
    let buttonText = '';
    
    const findTextRecursive = (n: SceneNode, depth: number): string => {
        if (depth > 3) return '';
        if (n.type === 'TEXT') return n.characters;
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

    if (context === 'search') {
      return {
        type: 'custom',
        label: buttonText,
        key: this.generateFieldKey(buttonText)
      } as ToolbarButton;
    } else {
      const actionType = this.inferActionType(buttonText, node.name);
      const validActionTypes = ['edit', 'delete', 'view', 'add', 'export', 'import', 'refresh', 'custom'];
      if (validActionTypes.indexOf(actionType) !== -1) {
        return {
          type: actionType as any,
          label: buttonText,
          key: this.generateFieldKey(buttonText),
          danger: actionType === 'delete'
        } as ToolbarButton;
      }
    }

    return undefined;
  }

  /**
   * 推断动作类型
   */
  private inferActionType(text: string, name: string): string {
    const lowerText = text.toLowerCase();
    const lowerName = name.toLowerCase();

    const actionMap: { [key: string]: string } = {
      '查询': 'search',
      '搜索': 'search',
      '重置': 'reset',
      '新增': 'add',
      '添加': 'add',
      '创建': 'add',
      '编辑': 'edit',
      '修改': 'edit',
      '删除': 'delete',
      '移除': 'delete',
      '查看': 'view',
      '显示': 'view',
      '导出': 'export',
      '导入': 'import',
      '刷新': 'refresh',
      '重新加载': 'refresh'
    };

    for (const key in actionMap) {
      if (actionMap.hasOwnProperty(key) && lowerName.includes(key)) {
        return actionMap[key];
      }
    }

    for (const key in actionMap) {
      if (actionMap.hasOwnProperty(key) && lowerText.includes(key)) {
        return actionMap[key];
      }
    }

    return 'custom';
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
   * 提取操作列
   */
  private extractActionColumns(tableColumns: TableColumn[], nodes: SceneNode[]): {
    column?: TableColumn;
    buttons: ActionButton[];
  } | undefined {
    const namingProtocol = this.protocolManager.getNamingProtocol();
    const layoutProtocol = this.protocolManager.getLayoutProtocol();

    const actionNodes = nodes.filter(node => 
      namingProtocol.isActionComponent(node.name) ||
      layoutProtocol.isActionColumn([node])
    );

    if (actionNodes.length === 0) return undefined;

    const buttons: ActionButton[] = [];
    
    actionNodes.forEach(node => {
      if (isContainer(node)) {
        const children = findChildren(node, n => n.visible);
        children.forEach(child => {
          const button = this.extractActionButton(child);
          if (button) buttons.push(button);
        });
      } else {
        const button = this.extractActionButton(node);
        if (button) buttons.push(button);
      }
    });

    if (buttons.length === 0) return undefined;

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
      buttons
    };
  }

  /**
   * 提取操作按钮
   */
  private extractActionButton(node: SceneNode): ActionButton | undefined {
    const namingProtocol = this.protocolManager.getNamingProtocol();
    
    let buttonText = '';
    if (node.type === 'TEXT') {
      buttonText = (node as TextNode).characters;
    } else if (isContainer(node)) {
      const textChild = findOneChild(node, n => n.type === 'TEXT') as TextNode;
      if (textChild) {
        buttonText = textChild.characters;
      }
    }

    if (!buttonText) return undefined;

    if (/(共|Total).*(\d+|条|rows)/i.test(buttonText) || 
        /(第|Page).*(\d+|页)/i.test(buttonText) ||
        /^\d+(\/\d+)?$/.test(buttonText)) {
      return undefined;
    }

    const actionType = this.inferActionType(buttonText, node.name);
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

    if (diff < LayoutRecognitionConfig.associationRules.alignmentThreshold / 2) return 'center';
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
                    const colWidth = colNode.width || 0;
                    const parentWidth = colNode.parent ? colNode.parent.width || 0 : 0;
                    if (colWidth > parentWidth * 0.8) {
                        console.log(`[EnhancedTableProcessor] Skipping overly wide column: '${title}' (width: ${colWidth}, parent: ${parentWidth})`);
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
    
    while (queue.length > 0) {
        const node = queue.shift()!;
        if (visited.has(node.id)) continue;
        visited.add(node.id);

        const analysis = TableIntelligenceEngine.resolveNodeRole(node);
        if (analysis.role === role && analysis.confidence > 0.6) {
            return node;
        }

        if (isContainer(node)) {
            // @ts-ignore - TS issue with children types
            queue.push(...node.children);
        }
    }
    
    return null;
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
          console.log(`[EnhancedTableProcessor] Found Action Group: ${actionGroupNode.name}`);
          toolbarRight = this.extractButtonGroup([actionGroupNode], 'toolbar');
      }

      const tableChildren = sortNodesByPosition(findChildren(tableAreaNode, n => n.visible));
      
      // 提取操作列
      const actionResult = this.extractActionColumns(columns, tableChildren);
      if (actionResult) {
        if (actionResult.column) {
          // 检查是否已经有操作列，避免重复
          const hasActionColumn = columns.some(col => col.dataIndex === 'actions');
          if (!hasActionColumn) {
            columns.push(actionResult.column);
          }
        }
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
