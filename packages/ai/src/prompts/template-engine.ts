/**
 * 模板引擎 - 支持变量替换和条件块
 */

export interface TemplateContext {
  pageType?: string;
  hasScreenshot?: boolean;
  metadataJson?: string;
  [key: string]: unknown;
}

/**
 * 渲染模板，替换变量和处理条件块
 * @param template 模板字符串
 * @param context 上下文变量
 */
export function render(template: string, context: TemplateContext): string {
  let result = template;

  // 处理条件块: {{#if condition}}...{{/if}}
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, key, content) => {
      const value = context[key];
      return value ? content : '';
    }
  );

  // 处理否定条件块: {{#unless condition}}...{{/unless}}
  result = result.replace(
    /\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g,
    (_, key, content) => {
      const value = context[key];
      return !value ? content : '';
    }
  );

  // 处理变量替换: {{variableName}}
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = context[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });

  return result;
}

/**
 * 条件渲染辅助函数
 */
export function renderIf(condition: boolean, content: string): string {
  return condition ? content : '';
}

/**
 * 合并多个模板片段
 */
export function concat(...parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join('\n\n');
}
