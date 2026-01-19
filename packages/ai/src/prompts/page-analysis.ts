/**
 * 页面结构分析 Prompt（从 .md 文件导入）
 */
import pageAnalysisPromptMd from './page-analysis.md';

/**
 * 页面分析 Prompt 内容
 */
export const PAGE_ANALYSIS_PROMPT = pageAnalysisPromptMd;

/**
 * 构建页面分析的完整 Prompt
 */
export function buildPageAnalysisPrompt(metadataJson: string): string {
  return `${PAGE_ANALYSIS_PROMPT}

## 待分析的页面元数据

\`\`\`json
${metadataJson}
\`\`\``;
}
