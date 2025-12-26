// 布局识别协议处理器 - 基于位置关系的几何判断
import { ParserConfig } from './config';
import { ILayoutProtocol } from './interfaces';

/**
 * 布局识别协议处理器
 * 负责根据位置关系识别组件之间的关联
 * 重构后：移除外部阈值配置，使用硬编码的合理默认值
 */
export class LayoutProtocolHandler implements ILayoutProtocol {
  private debug = ParserConfig.debug;

  // 硬编码的阈值常量（不再依赖外部配置）
  private readonly ALIGNMENT_THRESHOLD = 5;
  private readonly ROW_HEIGHT_THRESHOLD = 10;
  private readonly LABEL_INPUT_DISTANCE = 20;
  private readonly LABEL_INPUT_VERTICAL_DISTANCE = 10;
  private readonly POSITION_TOLERANCE = 2;
  private readonly INPUT_MIN_WIDTH = 60;
  private readonly INPUT_MIN_HEIGHT = 20;
  private readonly INPUT_MAX_HEIGHT = 60;

  /**
   * 判断两个节点是否水平对齐
   */
  isHorizontallyAligned(node1: SceneNode, node2: SceneNode): boolean {
    const centerY1 = node1.y + node1.height / 2;
    const centerY2 = node2.y + node2.height / 2;
    const result = Math.abs(centerY1 - centerY2) < this.ALIGNMENT_THRESHOLD;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isHorizontallyAligned:`, {
        node1: node1.name,
        node2: node2.name,
        centerY1,
        centerY2,
        threshold: this.ALIGNMENT_THRESHOLD,
        result
      });
    }
    
    return result;
  }

  /**
   * 判断两个节点是否垂直对齐
   */
  isVerticallyAligned(node1: SceneNode, node2: SceneNode): boolean {
    const centerX1 = node1.x + node1.width / 2;
    const centerX2 = node2.x + node2.width / 2;
    const result = Math.abs(centerX1 - centerX2) < this.ALIGNMENT_THRESHOLD;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isVerticallyAligned:`, {
        node1: node1.name,
        node2: node2.name,
        centerX1,
        centerX2,
        threshold: this.ALIGNMENT_THRESHOLD,
        result
      });
    }
    
    return result;
  }

  /**
   * 判断两个节点是否在同行
   */
  isSameRow(node1: SceneNode, node2: SceneNode): boolean {
    const yDiff = Math.abs(node1.y - node2.y);
    const result = yDiff < this.ROW_HEIGHT_THRESHOLD;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isSameRow:`, {
        node1: node1.name,
        node2: node2.name,
        yDiff,
        threshold: this.ROW_HEIGHT_THRESHOLD,
        result
      });
    }
    
    return result;
  }

  /**
   * 判断两个节点是否在同列
   */
  isSameColumn(node1: SceneNode, node2: SceneNode): boolean {
    const xDiff = Math.abs(node1.x - node2.x);
    const result = xDiff < this.ALIGNMENT_THRESHOLD;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isSameColumn:`, {
        node1: node1.name,
        node2: node2.name,
        xDiff,
        threshold: this.ALIGNMENT_THRESHOLD,
        result
      });
    }
    
    return result;
  }

  /**
   * 计算两个节点的水平距离
   */
  getHorizontalDistance(node1: SceneNode, node2: SceneNode): number {
    const right1 = node1.x + node1.width;
    const left2 = node2.x;
    const left1 = node1.x;
    const right2 = node2.x + node2.width;
    
    if (right1 <= left2) {
      return left2 - right1; // node1在node2左边
    } else if (right2 <= left1) {
      return left1 - right2; // node1在node2右边
    } else {
      return 0; // 重叠
    }
  }

  /**
   * 计算两个节点的垂直距离
   */
  getVerticalDistance(node1: SceneNode, node2: SceneNode): number {
    const bottom1 = node1.y + node1.height;
    const top2 = node2.y;
    const top1 = node1.y;
    const bottom2 = node2.y + node2.height;
    
    if (bottom1 <= top2) {
      return top2 - bottom1; // node1在node2上方
    } else if (bottom2 <= top1) {
      return top1 - bottom2; // node1在node2下方
    } else {
      return 0; // 重叠
    }
  }

  /**
   * 判断是否为标签-输入框对
   */
  isLabelInputPair(label: SceneNode, input: SceneNode): boolean {
    // 首先检查label是否为文本节点
    if (label.type !== 'TEXT') {
      return false;
    }

    // 检查水平距离
    const horizontalDistance = this.getHorizontalDistance(label, input);
    const isHorizontalValid = horizontalDistance <= this.LABEL_INPUT_DISTANCE;

    // 检查垂直对齐
    const isAligned = this.isHorizontallyAligned(label, input);

    // 检查垂直距离（不能太分散）
    const verticalDistance = Math.abs(this.getVerticalDistance(label, input));
    const isVerticalValid = verticalDistance <= this.LABEL_INPUT_VERTICAL_DISTANCE;

    const result = isHorizontalValid && isAligned && isVerticalValid;
    
    if (this.debug.enableLogging && (this.debug.logLevel === 'debug' || result)) {
      console.log(`[LayoutProtocol] isLabelInputPair:`, {
        label: label.name,
        input: input.name,
        horizontalDistance,
        isHorizontalValid,
        isAligned,
        verticalDistance,
        isVerticalValid,
        result
      });
    }
    
    return result;
  }

  /**
   * 判断是否为按钮组
   */
  isButtonGroup(nodes: SceneNode[]): boolean {
    if (nodes.length < 2) return false;

    // 检查是否在同一行
    const sameRow = nodes.every((node, index) => {
      if (index === 0) return true;
      return this.isSameRow(nodes[0], node);
    });

    // 检查是否在同一列（垂直布局）
    const sameColumn = nodes.every((node, index) => {
      if (index === 0) return true;
      return this.isSameColumn(nodes[0], node);
    });

    if (!sameRow && !sameColumn) return false;

    // 检查间距是否均匀
    const isLayoutHorizontal = sameRow;
    const distances = nodes.slice(0, -1).map((node, index) => {
      const nextNode = nodes[index + 1];
      return isLayoutHorizontal 
        ? this.getHorizontalDistance(node, nextNode)
        : this.getVerticalDistance(node, nextNode);
    });

    const avgDistance = distances.reduce((sum, dist) => sum + dist, 0) / distances.length;
    const distanceVariance = distances.reduce((sum, dist) => {
      return sum + Math.pow(dist - avgDistance, 2);
    }, 0) / distances.length;

    // 方差不能太大，说明间距比较均匀
    const result = distanceVariance < 100;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isButtonGroup:`, {
        nodes: nodes.map(n => n.name),
        layout: isLayoutHorizontal ? 'horizontal' : 'vertical',
        sameRow,
        sameColumn,
        distances,
        avgDistance,
        distanceVariance,
        result
      });
    }
    
    return result;
  }

  /**
   * 判断是否为工具栏区域
   */
  isToolbarArea(nodes: SceneNode[]): boolean {
    if (nodes.length < 2) return false;

    // 检查是否有按钮组
    const buttonGroups = this.identifyButtonGroups(nodes);
    if (buttonGroups.length === 0) return false;

    // 检查按钮组是否分布在左右两侧
    const leftButtons = buttonGroups.filter(group => {
      const avgX = group.reduce((sum, node) => sum + node.x, 0) / group.length;
      const containerLeft = Math.min(...nodes.map(n => n.x));
      return avgX < containerLeft + 200; // 在左侧200px范围内
    });

    const rightButtons = buttonGroups.filter(group => {
      const avgX = group.reduce((sum, node) => sum + node.x + node.width, 0) / group.length;
      const containerRight = Math.max(...nodes.map(n => n.x + n.width));
      return avgX > containerRight - 200; // 在右侧200px范围内
    });

    return leftButtons.length > 0 || rightButtons.length > 0;
  }

  /**
   * 识别多个按钮组
   */
  identifyButtonGroups(nodes: SceneNode[]): SceneNode[][] {
    const groups: SceneNode[][] = [];
    const processed = new Set<SceneNode>();

    nodes.forEach(node => {
      if (processed.has(node)) return;

      // 找到与当前节点可以组成按钮组的其他节点
      const group = nodes.filter(n => {
        if (processed.has(n)) return false;
        return this.canFormButtonGroup(node, n);
      });

      if (group.length >= 2) {
        groups.push(group);
        group.forEach(n => processed.add(n));
      }
    });

    return groups;
  }

  /**
   * 判断两个节点是否可以组成按钮组
   */
  private canFormButtonGroup(node1: SceneNode, node2: SceneNode): boolean {
    // 检查尺寸相似性
    const sizeSimilarity = Math.abs(node1.width - node2.width) < 20 && 
                           Math.abs(node1.height - node2.height) < 10;
    
    // 检查是否在同一行或同一列
    const sameRow = this.isSameRow(node1, node2);
    const sameColumn = this.isSameColumn(node1, node2);

    return sizeSimilarity && (sameRow || sameColumn);
  }

  /**
   * 判断是否为表格标题区域
   */
  isTableTitleArea(nodes: SceneNode[]): boolean {
    if (nodes.length === 0) return false;

    // 查找文本节点
    const textNodes = nodes.filter(node => node.type === 'TEXT');
    if (textNodes.length === 0) return false;

    // 检查是否有较大的文本（标题特征）
    const hasLargeText = textNodes.some(node => {
      const textNode = node as TextNode;
      return textNode.fontSize && Number(textNode.fontSize) > 16;
    });

    // 检查是否在顶部位置
    const minY = Math.min(...nodes.map(n => n.y));
    const containerMinY = Math.min(...nodes.map(n => n.y));
    const isAtTop = Math.abs(minY - containerMinY) < 50;

    return hasLargeText && isAtTop;
  }

  /**
   * 判断是否为操作列
   */
  isActionColumn(nodes: SceneNode[]): boolean {
    if (nodes.length === 0) return false;

    // 检查是否包含常见的操作按钮关键词
    const actionKeywords = ['edit', 'delete', 'view', 'modify', '更新', '编辑', '删除', '查看'];
    const hasActionKeywords = nodes.some(node => 
      actionKeywords.some(keyword => 
        node.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // 检查是否在表格右侧
    const avgX = nodes.reduce((sum, node) => sum + node.x, 0) / nodes.length;
    const isOnRight = avgX > 500; // 假设表格宽度超过500px时，右侧是操作列

    return hasActionKeywords || isOnRight;
  }

  /**
   * 判断是否为分页区域
   */
  isPaginationArea(nodes: SceneNode[]): boolean {
    if (nodes.length < 2) return false;

    // 检查是否包含页码相关的文本
    const pageTexts = nodes.filter(node => 
      node.type === 'TEXT' && 
      /\d+/.test((node as TextNode).characters || '')
    );

    // 检查是否有导航按钮
    const navButtons = nodes.filter(node => 
      ['prev', 'next', '上一页', '下一页', '<', '>'].some(keyword =>
        node.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    return pageTexts.length > 0 || navButtons.length > 0;
  }

  /**
   * 层次化识别表格区域结构
   */
  identifyTableAreaStructure(nodes: SceneNode[]): {
    title?: SceneNode[];
    toolbar?: {
      left?: SceneNode[];
      right?: SceneNode[];
    };
    table: SceneNode[];
    pagination?: SceneNode[];
  } {
    const sortedNodes = [...nodes].sort((a, b) => a.y - b.y);
    const result: any = { table: [] };

    // 按Y坐标分组，识别不同区域
    const rowGroups = this.groupByRows(sortedNodes);
    
    rowGroups.forEach((row, index) => {
      // 第一行可能是标题
      if (index === 0 && this.isTableTitleArea(row)) {
        result.title = row;
        return;
      }

      // 检查是否为工具栏
      if (this.isToolbarArea(row)) {
        if (!result.toolbar) result.toolbar = {};
        const buttonGroups = this.identifyButtonGroups(row);
        
        // 判断左右分布
        buttonGroups.forEach(group => {
          const avgX = group.reduce((sum, node) => sum + node.x, 0) / group.length;
          const containerCenter = (Math.min(...row.map(n => n.x)) + Math.max(...row.map(n => n.x + n.width))) / 2;
          
          if (avgX < containerCenter) {
            result.toolbar.left = group;
          } else {
            result.toolbar.right = group;
          }
        });
        return;
      }

      // 检查是否为分页区域
      if (this.isPaginationArea(row)) {
        result.pagination = row;
        return;
      }

      // 默认为表格区域
      result.table.push(...row);
    });

    return result;
  }

  /**
   * 判断是否为表格结构
   */
  isTableStructure(nodes: SceneNode[]): boolean {
    if (nodes.length < 3) return false;

    // 分组同行节点
    const rows = this.groupByRows(nodes);
    
    if (rows.length < 2) return false;

    // 检查每行的节点数是否一致
    const firstRowCount = rows[0].length;
    const consistentColumns = rows.every(row => row.length === firstRowCount);

    if (!consistentColumns) return false;

    // 检查列对齐
    const columnsAligned = this.checkColumnAlignment(rows);

    const result = consistentColumns && columnsAligned;
    
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[LayoutProtocol] isTableStructure:`, {
        rows: rows.map(row => row.map(n => n.name)),
        rowCount: rows.length,
        columnCount: firstRowCount,
        consistentColumns,
        columnsAligned,
        result
      });
    }
    
    return result;
  }

  /**
   * 按行分组节点
   */
  groupByRows(nodes: SceneNode[]): SceneNode[][] {
    const rows: SceneNode[][] = [];
    const processed = new Set<SceneNode>();

    nodes.forEach(node => {
      if (processed.has(node)) return;

      // 找到与当前节点同行的所有节点
      const row = nodes.filter(n => {
        if (processed.has(n)) return false;
        return this.isSameRow(node, n);
      });

      // 按X坐标排序
      row.sort((a, b) => a.x - b.x);
      rows.push(row);
      row.forEach(n => processed.add(n));
    });

    // 按Y坐标排序行
    rows.sort((a, b) => a[0].y - b[0].y);

    return rows;
  }

  /**
   * 检查列对齐
   */
  private checkColumnAlignment(rows: SceneNode[][]): boolean {
    if (rows.length < 2) return true;

    const columnCount = rows[0].length;
    
    for (let col = 0; col < columnCount; col++) {
      const columnNodes = rows.map(row => row[col]).filter(Boolean);
      
      if (columnNodes.length < 2) continue;
      
      // 检查这一列的X坐标是否对齐
      const xCoords = columnNodes.map(node => node.x);
      const avgX = xCoords.reduce((sum, x) => sum + x, 0) / xCoords.length;
      
      const aligned = xCoords.every(x => 
        Math.abs(x - avgX) < this.ALIGNMENT_THRESHOLD
      );
      
      if (!aligned) return false;
    }

    return true;
  }

  /**
   * 获取节点的边界框
   */
  getBoundingBox(nodes: SceneNode[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    const minX = Math.min(...nodes.map(n => n.x));
    const minY = Math.min(...nodes.map(n => n.y));
    const maxX = Math.max(...nodes.map(n => n.x + n.width));
    const maxY = Math.max(...nodes.map(n => n.y + n.height));

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * 判断节点是否在指定区域内
   */
  isInsideArea(node: SceneNode, area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return (
      node.x >= area.x - this.POSITION_TOLERANCE &&
      node.y >= area.y - this.POSITION_TOLERANCE &&
      (node.x + node.width) <= (area.x + area.width) + this.POSITION_TOLERANCE &&
      (node.y + node.height) <= (area.y + area.height) + this.POSITION_TOLERANCE
    );
  }

  /**
   * 基于视觉特征判断是否像输入框
   */
  isVisuallyLikeInput(node: SceneNode): boolean {
    if (node.type !== 'RECTANGLE' && node.type !== 'FRAME' && node.type !== 'INSTANCE') {
      return false;
    }

    // 尺寸检查
    if (node.width < this.INPUT_MIN_WIDTH || 
        node.height < this.INPUT_MIN_HEIGHT || 
        node.height > this.INPUT_MAX_HEIGHT) {
      return false;
    }

    // 样式检查 (有填充或描边)
    const hasVisibleFill = 'fills' in node && Array.isArray(node.fills) && node.fills.length > 0;
    const hasVisibleStroke = 'strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0;

    return hasVisibleFill || hasVisibleStroke;
  }
}
