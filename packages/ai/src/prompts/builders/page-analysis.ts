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
  const { pageType, hasScreenshot, metadataJson } = options;

  // 渲染 System Prompt
  const systemPrompt = render(SYSTEM_BASE, { hasScreenshot });

  // 获取对应页面类型的 User Prompt
  const userPrompt = getUserPrompt(pageType);

  // 组合最终 Prompt
  return concat(
    systemPrompt,
    ROLES_SEGMENT,
    userPrompt,
    OUTPUT_FORMAT_SEGMENT,
    `## 待分析的页面元数据\n\n\`\`\`json\n${metadataJson}\n\`\`\``
  );
}

/**
 * 向后兼容：混合分析 Prompt（有截图）
 * @deprecated 使用 buildPageAnalysisPrompt 替代
 */
export function buildHybridAnalysisPrompt(metadataJson: string, hasScreenshot: boolean): string {
  return buildPageAnalysisPrompt({
    pageType: 'auto',
    hasScreenshot,
    metadataJson
  });
}

/**
 * 向后兼容：纯结构分析 Prompt（无截图）
 * @deprecated 使用 buildPageAnalysisPrompt 替代
 */
export function buildStructureAnalysisPrompt(metadataJson: string): string {
  return buildPageAnalysisPrompt({
    pageType: 'table',
    hasScreenshot: false,
    metadataJson
  });
}
