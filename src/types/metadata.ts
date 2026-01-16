// 节点元数据（精简版，适合发送给 AI）
export interface NodeMetadata {
  name: string;
  type: string;  // FRAME, TEXT, INSTANCE, etc.
  
  // 几何信息（简化为尺寸，位置信息通常对 AI 推理价值不大）
  w: number;  // width
  h: number;  // height
  
  // 文本内容（合并为单个字符串）
  text?: string;
  
  // 子节点（递归，限制深度避免 Token 过多）
  children?: NodeMetadata[];
}

// 完整元数据（用于内部处理和调试）
export interface FullNodeMetadata extends NodeMetadata {
  id: string;
  x: number;
  y: number;
  depth: number;
}

// 推理结果
export interface InferenceResult {
  role: string | null;
  confidence: number;
  reasoning: string;
  suggestion?: string; // 优化建议
}
