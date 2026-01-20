/**
 * Prompt 构建器 - 组合 system + user + segments
 */
import { render, concat } from '../template-engine';
import { SYSTEM_BASE } from '../system';
import { getUserPrompt } from '../user';
import { OUTPUT_FORMAT_SEGMENT, ROLES_SEGMENT } from '../segments';
import type { BuildPromptOptions } from '../types';

/**
 * 构建完整的页面分析 Prompt
 */
export function buildPageAnalysisPrompt(options: BuildPromptOptions): string {
  const { pageType, hasScreenshot, metadataJson, visualOnly } = options;

  // 渲染 System Prompt
  const systemPrompt = render(SYSTEM_BASE, { hasScreenshot, visualOnly });

  // 获取对应页面类型的 User Prompt
  const userPrompt = getUserPrompt(pageType);

  // 组合最终 Prompt
  const parts = [
    systemPrompt,
    ROLES_SEGMENT,
    userPrompt,
    OUTPUT_FORMAT_SEGMENT
  ];

  // 仅在非 visualOnly 模式下添加元数据
  if (!visualOnly && metadataJson) {
    parts.push(`## 待分析的页面元数据\n\n\`\`\`json\n${metadataJson}\n\`\`\``);
  } else if (visualOnly) {
    parts.push('## 分析说明\n\n请仅根据提供的截图进行视觉分析，无需结构化元数据。');
  }

  return concat(...parts);
}

/**
 * 纯视觉分析 Prompt（仅截图，不含结构数据）
 */
export function buildVisualOnlyPrompt(): string {
  return buildPageAnalysisPrompt({
    pageType: 'auto',
    hasScreenshot: true,
    visualOnly: true
  });
}
