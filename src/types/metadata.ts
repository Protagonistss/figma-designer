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
