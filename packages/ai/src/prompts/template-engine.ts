/**
 * 模板引擎 - 基于 Handlebars
 * 支持变量替换、条件块、迭代、自定义 helpers
 */
import Handlebars from 'handlebars';

export interface TemplateContext {
  pageType?: string;
  hasScreenshot?: boolean;
  metadataJson?: string;
  visualOnly?: boolean;
  [key: string]: unknown;
}

// 注册自定义 helpers

/**
 * JSON 格式化输出
 * 用法: {{json data}}
 */
Handlebars.registerHelper('json', (context: unknown) => {
  return JSON.stringify(context, null, 2);
});

/**
 * 相等比较
 * 用法: {{#eq pageType "table"}}...{{/eq}}
 */
Handlebars.registerHelper('eq', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
  return a === b ? options.fn(this) : options.inverse(this);
});

/**
 * 不相等比较
 * 用法: {{#neq status "done"}}...{{/neq}}
 */
Handlebars.registerHelper('neq', function(this: unknown, a: unknown, b: unknown, options: Handlebars.HelperOptions) {
  return a !== b ? options.fn(this) : options.inverse(this);
});

// 缓存编译后的模板
const templateCache = new Map<string, Handlebars.TemplateDelegate>();

/**
 * 渲染模板，替换变量和处理条件块
 * @param template 模板字符串
 * @param context 上下文变量
 */
export function render(template: string, context: TemplateContext): string {
  let compiledTemplate = templateCache.get(template);
  
  if (!compiledTemplate) {
    compiledTemplate = Handlebars.compile(template, { noEscape: true });
    templateCache.set(template, compiledTemplate);
  }
  
  return compiledTemplate(context);
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

/**
 * 注册自定义 partial (模板片段)
 * @param name partial 名称
 * @param template 模板字符串
 */
export function registerPartial(name: string, template: string): void {
  Handlebars.registerPartial(name, template);
}

/**
 * 注册自定义 helper
 * @param name helper 名称
 * @param fn helper 函数
 */
export function registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
  Handlebars.registerHelper(name, fn);
}

/**
 * 清除模板缓存
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}
