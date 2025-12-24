import { NamingConventionConfig, ParserConfig } from './config';

/**
 * 命名约定协议处理器
 * 负责根据命名模式识别不同类型的组件和区域
 */
export class NamingProtocolHandler {
  private config = NamingConventionConfig;
  private debug = ParserConfig.debug;

  /**
   * 检查节点名称是否匹配给定的模式列表
   */
  private matchesPattern(name: string, patterns: string[]): boolean {
    if (!name) return false;
    
    const normalizedName = this.config.common.caseSensitive ? name : name.toLowerCase();
    
    return patterns.some(pattern => {
      const normalizedPattern = this.config.common.caseSensitive ? pattern : pattern.toLowerCase();
      return normalizedName.includes(normalizedPattern);
    });
  }

  /**
   * 检查是否为通用搜索区域
   */
  isSearchArea(name: string): boolean {
    const result = this.matchesPattern(name, this.config.common.searchPatterns);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isSearchArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格专用搜索区域
   */
  isTableSearchArea(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.top.search);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableSearchArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格区域
   */
  isTableArea(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.keywords);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格行
   */
  isTableRow(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.tableContent.row);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableRow: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表格列/单元格
   */
  isTableColumn(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.tableContent.cell);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTableColumn: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为输入组件
   */
  isInputComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.form.input);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isInputComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为选择组件
   */
  isSelectComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.form.select);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isSelectComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为日期组件
   */
  isDateComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.form.date);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isDateComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为按钮组件
   */
  isButtonComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.form.button);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isButtonComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为容器组件
   */
  isContainerComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.layout.container);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isContainerComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为表头组件 (表格列头)
   */
  isHeaderComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.tableContent.header);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isHeaderComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为内容区域
   */
  isContentArea(name: string): boolean {
    const result = this.matchesPattern(name, this.config.layout.content);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isContentArea: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为标题组件 (表格标题)
   */
  isTitleComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.top.title);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isTitleComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为操作列/操作区域
   */
  isActionComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.actions.column);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isActionComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为工具栏组件
   */
  isToolbarComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.top.toolbar);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isToolbarComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为分页组件
   */
  isPaginationComponent(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.bottom.pagination);
    if (this.debug.enableLogging && this.debug.logLevel === 'debug') {
      console.log(`[NamingProtocol] isPaginationComponent: "${name}" -> ${result}`);
    }
    return result;
  }

  /**
   * 检查是否为操作按钮 (具体按钮)
   */
  isOperationButton(name: string): boolean {
    const result = this.matchesPattern(name, this.config.table.actions.items);
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

    // 使用配置的分隔符进行分割
    const separators = this.config.common.separators;
    let parts = [name];
    
    // 依次使用每个分隔符进行分割
    separators.forEach(separator => {
      const newParts: string[] = [];
      parts.forEach(part => {
        newParts.push(...part.split(separator));
      });
      parts = newParts;
    });
    
    // 过滤空字符串并去重
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
