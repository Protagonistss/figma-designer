// 节点元数据（精简版，适合发送给 AI）
export interface NodeMetadata {
  id: string;
  // 原始节点名（仅用于追踪，不作为语义依据）
  name: string;
  type: string;  // FRAME, TEXT, INSTANCE, etc.
  visible: boolean;
  
  // 几何信息（用于布局/相对位置推断）
  x: number;
  y: number;
  w: number;  // width
  h: number;  // height
  abs?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  
  // 文本内容（仅文本节点）
  text?: string;
  
  // 子节点（递归，限制深度避免 Token 过多）
  children?: NodeMetadata[];
}

// 完整元数据（用于内部处理和调试）
export interface FullNodeMetadata extends NodeMetadata {
  depth: number;
}

// 推理结果
export interface InferenceResult {
  role: string | null;
  confidence: number;
  reasoning: string;
  suggestion?: string; // 优化建议
}
