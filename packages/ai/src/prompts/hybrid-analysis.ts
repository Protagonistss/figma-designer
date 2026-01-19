/**
 * 混合分析 Prompt（结合结构数据 + 截图）
 */
import hybridAnalysisPromptMd from './hybrid-analysis.md';

/**
 * 混合分析 Prompt 内容
 */
export const HYBRID_ANALYSIS_PROMPT = hybridAnalysisPromptMd;

/**
 * 构建混合分析的完整 Prompt
 * @param metadataJson 结构化元数据 JSON
 * @param hasScreenshot 是否包含截图
 */
export function buildHybridAnalysisPrompt(metadataJson: string, hasScreenshot: boolean): string {
  const modeNote = hasScreenshot 
    ? '（注意：本次分析同时提供了截图，请结合视觉信息进行分析）'
    : '（注意：本次仅提供结构数据，无截图辅助）';
  
  return `${HYBRID_ANALYSIS_PROMPT}

${modeNote}

## 待分析的页面元数据

\`\`\`json
${metadataJson}
\`\`\``;
}
