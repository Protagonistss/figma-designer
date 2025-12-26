// 命名约定协议处理器 - 基于统一语义词典
import { SemanticDictionary, ParserConfig } from './config';
import { INamingProtocol } from './interfaces';

/**
 * 命名约定协议处理器
 * 负责根据命名模式识别不同类型的组件和区域
 * 重构后：基于统一语义词典进行识别
 */
export class NamingProtocolHandler implements INamingProtocol {
  private debug = ParserConfig.debug;

  /**
   * 检查节点名称是否匹配给定的模式列表
   */
  private matchesPattern(name: string, patterns: string[]): boolean {
    if (!name) return false;
    const normalizedName = name.toLowerCase();
    return patterns.some(pattern => 
      normalizedName.includes(pattern.toLowerCase())
    );
  }

  /**
   * 检查是否为搜索区域
   */
  isSearchArea(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.search.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isSearchArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格专用搜索区域（向后兼容）
   */
  isTableSearchArea(name: string): boolean {
    return this.isSearchArea(name);
  }

  /**
   * 检查是否为表格区域
   */
  isTableArea(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.grid.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格行
   */
  isTableRow(name: string): boolean {
    // 保留原有逻辑，但简化关键词
    const rowKeywords = ['row', 'tr', 'record', '行', '记录'];
    const result = this.matchesPattern(name, rowKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableRow: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格列/单元格
   */
  isTableColumn(name: string): boolean {
    const cellKeywords = ['cell', 'td', 'col', 'column', '列', '单元格'];
    const result = this.matchesPattern(name, cellKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableColumn: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为输入组件
   */
  isInputComponent(name: string): boolean {
    const inputKeywords = ['input', 'text', 'field', '输入框'];
    const result = this.matchesPattern(name, inputKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isInputComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为选择组件
   */
  isSelectComponent(name: string): boolean {
    const selectKeywords = ['select', 'dropdown', 'picker', '选择器', '下拉'];
    const result = this.matchesPattern(name, selectKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isSelectComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为日期组件
   */
  isDateComponent(name: string): boolean {
    const dateKeywords = ['date', 'time', 'calendar', '日期', '时间'];
    const result = this.matchesPattern(name, dateKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isDateComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为按钮组件
   */
  isButtonComponent(name: string): boolean {
    const buttonKeywords = ['button', 'btn', '按钮', '页面切换'];
    const result = this.matchesPattern(name, buttonKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isButtonComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为容器组件
   */
  isContainerComponent(name: string): boolean {
    const containerKeywords = ['container', 'wrapper', 'box', 'area', '容器', '区域'];
    const result = this.matchesPattern(name, containerKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isContainerComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表头组件 (表格列头)
   */
  isHeaderComponent(name: string): boolean {
    const headerKeywords = ['header', 'th', '表头'];
    const result = this.matchesPattern(name, headerKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isHeaderComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为内容区域
   */
  isContentArea(name: string): boolean {
    const contentKeywords = ['content', 'body', 'main', '内容', '主体'];
    const result = this.matchesPattern(name, contentKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isContentArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为标题组件 (表格标题)
   */
  isTitleComponent(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.header.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTitleComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为操作列/操作区域
   */
  isActionComponent(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.operations.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isActionComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为工具栏组件
   */
  isToolbarComponent(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.toolbar.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isToolbarComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为分页组件
   */
  isPaginationComponent(name: string): boolean {
    const result = this.matchesPattern(name, SemanticDictionary.pagination.matchers);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isPaginationComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为操作按钮 (具体按钮)
   * 基于 operations.intent 中的所有关键词
   */
  isOperationButton(name: string): boolean {
    const allKeywords: string[] = [];
    Object.values(SemanticDictionary.operations.intent).forEach(intentKeywords => {
      allKeywords.push(...intentKeywords);
    });
    const result = this.matchesPattern(name, allKeywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isOperationButton: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否匹配给定的模式列表（公开方法）
   */
  checkPattern(name: string, patterns: string[]): boolean {
    const result = this.matchesPattern(name, patterns);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] checkPattern: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 获取组件的业务类型
   */
  getBusinessType(name: string): string {
    // 优先匹配具体的表格组件
    if (this.isTableSearchArea(name)) return 'table-search';
    if (this.isSearchArea(name)) return 'search';
    if (this.isTableArea(name)) return 'table';
    if (this.isTableRow(name)) return 'table-row';
    if (this.isTableColumn(name)) return 'table-column';
    
    if (this.isInputComponent(name)) return 'input';
    if (this.isSelectComponent(name)) return 'select';
    if (this.isDateComponent(name)) return 'date';
    if (this.isButtonComponent(name)) return 'button';
    
    if (this.isHeaderComponent(name)) return 'header';
    if (this.isTitleComponent(name)) return 'title';
    if (this.isActionComponent(name)) return 'action';
    if (this.isToolbarComponent(name)) return 'toolbar';
    if (this.isPaginationComponent(name)) return 'pagination';
    if (this.isOperationButton(name)) return 'operation';
    
    if (this.isContentArea(name)) return 'content';
    if (this.isContainerComponent(name)) return 'container';
    
    return 'unknown';
  }

  /**
   * 解析复合名称，提取各个部分
   * 例如："search-input-field" -> { prefix: 'search', type: 'input', suffix: 'field' }
   */
  parseCompoundName(name: string): {
    prefix: string;
    type: string;
    suffix: string;
    parts: string[];
  } {
    if (!name) {
      return { prefix: '', type: '', suffix: '', parts: [] };
    }

    // 使用分隔符进行分割
    const separators = ['-', '_', ' '];
    let parts = [name];
    
    separators.forEach(separator => {
      const newParts: string[] = [];
      parts.forEach(part => {
        newParts.push(...part.split(separator));
      });
      parts = newParts;
    });
    
    parts = parts.filter(part => part.trim().length > 0);

    if (parts.length === 0) {
      return { prefix: '', type: '', suffix: '', parts: [] };
    }

    // 识别类型部分
    let typeIndex = -1;
    let detectedType = '';
    
    for (let i = 0; i < parts.length; i++) {
      const businessType = this.getBusinessType(parts[i]);
      if (businessType !== 'unknown') {
        typeIndex = i;
        detectedType = businessType;
        break;
      }
    }

    const prefix = typeIndex > 0 ? parts.slice(0, typeIndex).join('-') : '';
    const suffix = typeIndex >= 0 && typeIndex < parts.length - 1 
      ? parts.slice(typeIndex + 1).join('-') 
      : '';

    return {
      prefix,
      type: detectedType,
      suffix,
      parts
    };
  }

  /**
   * 验证名称是否符合命名约定
   */
  validateName(name: string): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!name || name.trim().length === 0) {
      issues.push('名称为空');
      suggestions.push('使用描述性名称，如 "search-input"');
      return { isValid: false, issues, suggestions };
    }

    const parsed = this.parseCompoundName(name);
    
    if (parsed.type === 'unknown') {
      issues.push('未识别的组件类型');
      suggestions.push('在名称中包含组件类型，如 "input"、"button"、"table"');
    }

    if (parsed.parts.length === 1) {
      suggestions.push('考虑使用复合名称提高可读性，如 "user-search-input"');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}
