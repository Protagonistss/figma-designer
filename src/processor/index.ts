import { MetadataExtractor } from '../extractor';
import { NodeMetadata, InferenceResult } from '../types/metadata';
import { PageContent } from '../types/page-content';
import { buildPageAnalysisPrompt } from '../ai/prompts/page-analysis';

export interface ProcessResult {
  metadata: NodeMetadata;
  inference: InferenceResult;
  pageContent: PageContent;
}

export class Processor {
  private extractor: MetadataExtractor;
  
  constructor() {
    this.extractor = new MetadataExtractor(4); // 限制深度为 4
  }
  
  async process(rootNode: SceneNode): Promise<ProcessResult> {
    // 1. 提取元数据
    console.log('[Processor] Extracting metadata...');
    const metadata = this.extractor.extractTree(rootNode);
    console.log('[Processor] Metadata extracted, nodes:', this.countNodes(metadata));
    
    // 2. 一次性调用 AI 分析整个页面
    console.log('[Processor] Calling AI for page analysis (single call)...');
    const prompt = buildPageAnalysisPrompt(JSON.stringify(metadata, null, 2));
    
    // 通过 UI 层发送请求
    const analysisResult = await this.callAI(prompt, metadata);
    console.log('[Processor] AI analysis result:', analysisResult);
    
    // 3. 构建 PageContent
    const pageContent: PageContent = {
      page: {
        title: analysisResult.pageTitle || metadata.name,
        type: analysisResult.pageType || 'table'
      }
    };
    
    if (analysisResult.search) {
      pageContent.search = analysisResult.search;
    }
    if (analysisResult.table) {
      pageContent.table = analysisResult.table;
    }
    if (analysisResult.toolbar) {
      pageContent.toolbar = analysisResult.toolbar;
    }
    if (analysisResult.pagination) {
      pageContent.pagination = analysisResult.pagination;
    }
    
    // 4. 构建兼容的 inference 结果
    const rootInference: InferenceResult = {
      role: 'TableContainer',
      confidence: 1.0,
      reasoning: 'Analyzed by single-call page analysis'
    };
    
    return {
      metadata,
      inference: rootInference,
      pageContent
    };
  }
  
  private countNodes(node: NodeMetadata): number {
    let count = 1;
    if (node.children) {
      for (const child of node.children) {
        count += this.countNodes(child);
      }
    }
    return count;
  }
  
  private callAI(prompt: string, metadata: NodeMetadata): Promise<any> {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('[Processor] Sending AI request:', requestId);
      
      // 设置一次性消息处理器
      const handler = (msg: any) => {
        console.log('[Processor] Received message:', msg.type, msg.requestId);
        
        if (msg.type === 'ai-response' && msg.requestId === requestId) {
          console.log('[Processor] AI response received:', msg);
          
          if (msg.error) {
            reject(new Error(msg.error));
          } else if (msg.result === undefined || msg.result === null) {
            reject(new Error('AI 响应内容为空'));
          } else {
            console.log('[Processor] AI result:', msg.result);
            resolve(msg.result);
          }
        }
      };
      
      // 保存原有处理器并设置新处理器
      const originalHandler = figma.ui.onmessage;
      figma.ui.onmessage = (msg: any, props?: any) => {
        handler(msg);
        if (originalHandler) {
          originalHandler(msg, props as any);
        }
      };
      
      // 发送请求到 UI 层
      figma.ui.postMessage({
        type: 'ai-request',
        requestId,
        requestType: 'page-analysis',
        prompt,
        metadata
      });
      
      // 超时处理（180秒）
      setTimeout(() => {
        reject(new Error('AI request timeout'));
      }, 180000);
    });
  }
}
