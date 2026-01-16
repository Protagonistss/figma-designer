/**
 * 分析 Pipeline 核心模块
 * 实现多阶段分析流程
 */

import { NodeMetadata, InferenceResult } from '../types/metadata';
import { PageContent } from '../types/page-content';
import { IAIEngine } from '../ai/interfaces';

// ============ 接口定义 ============

/**
 * 分析上下文
 * 在各阶段之间传递数据
 */
export interface AnalysisContext {
  /** 原始元数据 */
  metadata: NodeMetadata;
  
  /** 各节点的角色推理结果 (nodeId -> result) */
  roles: Map<string, InferenceResult>;
  
  /** 按角色索引的节点 (role -> nodes[]) */
  nodesByRole: Map<string, NodeMetadata[]>;
  
  /** 累积的页面内容提取结果 */
  content: Partial<PageContent>;
  
  /** AI 引擎 */
  aiEngine: IAIEngine;
}

/**
 * 分析阶段接口
 */
export interface AnalysisStage {
  name: string;
  execute(context: AnalysisContext): Promise<void>;
}

// ============ Pipeline 实现 ============

/**
 * 分析 Pipeline
 * 按顺序执行多个分析阶段
 */
export class AnalysisPipeline {
  private stages: AnalysisStage[] = [];

  /**
   * 添加分析阶段
   */
  addStage(stage: AnalysisStage): this {
    this.stages.push(stage);
    return this;
  }

  /**
   * 运行 Pipeline
   */
  async run(metadata: NodeMetadata, aiEngine: IAIEngine): Promise<PageContent> {
    console.log('[Pipeline] Starting analysis...');
    
    const context: AnalysisContext = {
      metadata,
      roles: new Map(),
      nodesByRole: new Map(),
      content: {},
      aiEngine
    };

    for (const stage of this.stages) {
      console.log(`[Pipeline] Executing stage: ${stage.name}`);
      await stage.execute(context);
    }

    console.log('[Pipeline] Analysis complete');
    return context.content as PageContent;
  }
}

// ============ 工具函数 ============

/**
 * 在元数据树中查找指定 ID 的节点
 */
export function findNodeById(root: NodeMetadata, nodeId: string): NodeMetadata | null {
  if (root.id === nodeId) return root;
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, nodeId);
      if (found) return found;
    }
  }
  
  return null;
}

/**
 * 遍历元数据树
 */
export function traverseNodes(
  node: NodeMetadata, 
  callback: (node: NodeMetadata) => void
): void {
  callback(node);
  
  if (node.children) {
    for (const child of node.children) {
      traverseNodes(child, callback);
    }
  }
}
