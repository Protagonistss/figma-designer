// 节点元数据（精简版，适合发送给 AI）
export interface NodeMetadata {
  id: string;
  name: string;
  type: string;  // FRAME, TEXT, INSTANCE, etc.
  
  // 几何信息
  x: number;
  y: number;
  width: number;
  height: number;
  
  // 文本内容（收集所有文本）
  texts?: string[];
  
  // 结构信息
  depth: number;
  childCount: number;
  
  // 子节点（递归，限制深度避免 Token 过多）
  children?: NodeMetadata[];
}

// 推理结果
export interface InferenceResult {
  role: string | null;
  confidence: number;
  reasoning: string;
  suggestion?: string; // 优化建议
}
