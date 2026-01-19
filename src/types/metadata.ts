// 节点元数据（精简版，保留推断必要字段）
export interface NodeMetadata {
  type: string;  // FRAME, TEXT, INSTANCE, etc.
  text?: string; // 文本内容（仅文本节点）
  name?: string; // 节点名（兜底标签）
  x: number;     // X 坐标（布局推断）
  y: number;     // Y 坐标（布局推断）
  children?: NodeMetadata[];
}

// 推理结果
export interface InferenceResult {
  role: string | null;
  confidence: number;
  reasoning: string;
  suggestion?: string; // 优化建议
}

// 截图配置
export interface ScreenshotConfig {
  enabled: boolean;
  format: 'PNG' | 'JPG';
  scale: 0.5 | 1 | 2;       // 导出倍率
  maxWidth: number;         // 最大宽度（自动缩放）
  quality: number;          // JPG 质量 (0-100)
}

// 分析模式配置
export type AnalysisMode = 'structure-only' | 'visual-only' | 'hybrid';

export interface AnalysisConfig {
  mode: AnalysisMode;
  screenshot: ScreenshotConfig;
}

// 默认配置（优化后的压缩设置）
export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  mode: 'structure-only',
  screenshot: {
    enabled: false,
    format: 'JPG',
    scale: 0.5,         // 降低倍率，显著减小尺寸
    maxWidth: 800,      // 限制最大宽度
    quality: 60         // 降低质量，目标 < 100KB
  }
};

// 带截图的分析请求
export interface AnalysisRequest {
  metadata: NodeMetadata;
  screenshot?: string;        // Base64 encoded image
  config: AnalysisConfig;
}
