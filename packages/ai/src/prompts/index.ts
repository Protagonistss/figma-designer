/**
 * Prompt 模块统一导出
 */

// 类型导出
export * from './types';

// 模板引擎
export * from './template-engine';

// 构建器（主要 API）
export * from './builders';

// 子模块（高级用法）
export * from './system';
export * from './user';
export * from './segments';

// 向后兼容：保留旧的导出名称
export { buildStructureAnalysisPrompt as buildPageAnalysisPrompt } from './builders';
export { buildHybridAnalysisPrompt, buildVisualOnlyPrompt } from './builders';
