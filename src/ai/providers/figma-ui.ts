import { IAIEngine } from '../interfaces';
import { NodeMetadata, InferenceResult } from '../../types/metadata';
import { TableSection, SearchSection, ToolbarSection } from '../../types/page-content';
import { ROLE_INFERENCE_PROMPT } from '../prompts/role-inference';
import { buildTablePrompt } from '../prompts/table-structure';
import { buildSearchPrompt } from '../prompts/search-form';
import { buildToolbarPrompt } from '../prompts/toolbar-actions';

type PendingRequest<T> = {
  resolve: (result: T) => void;
  reject: (error: Error) => void;
};

/**
 * 基于 Figma UI 层消息传递的 AI 引擎
 * 通过 postMessage 与 UI 层通信，由 UI 层调用 OpenAI API
 */
export class FigmaUIMessagingEngine implements IAIEngine {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private messageHandlerInitialized = false;
  
  constructor() {
    this.initMessageHandler();
  }
  
  private initMessageHandler(): void {
    if (this.messageHandlerInitialized) return;
    
    // 保存原有的消息处理器
    const originalHandler = figma.ui.onmessage;
    
    figma.ui.onmessage = (msg: any) => {
      // 处理 AI 响应
      if (msg.type === 'ai-response') {
        const pending = this.pendingRequests.get(msg.requestId);
        if (pending) {
          this.pendingRequests.delete(msg.requestId);
          if (msg.error) {
            pending.reject(new Error(msg.error));
          } else {
            pending.resolve(msg.result);
          }
        }
        return;
      }
      
      // 调用原有处理器
      if (originalHandler) {
        originalHandler(msg, {} as any);
      }
    };
    
    this.messageHandlerInitialized = true;
  }
  
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private createRequest<T>(prompt: string, metadata: NodeMetadata, requestType: string): Promise<T> {
    const requestId = this.generateRequestId();
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, { resolve, reject });
      
      // 发送请求到 UI 层
      figma.ui.postMessage({
        type: 'ai-request',
        requestId,
        requestType,
        prompt,
        metadata
      });
      
      // 超时处理（120秒）
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error(`AI request timeout: ${requestType}`));
        }
      }, 120000);
    });
  }
  
  async inferRole(metadata: NodeMetadata): Promise<InferenceResult> {
    const prompt = `${ROLE_INFERENCE_PROMPT}\n\n## 待分析的节点元数据\n\n\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``;
    return this.createRequest<InferenceResult>(prompt, metadata, 'role-inference');
  }
  
  async extractTable(metadata: NodeMetadata): Promise<TableSection> {
    const prompt = buildTablePrompt(JSON.stringify(metadata, null, 2));
    return this.createRequest<TableSection>(prompt, metadata, 'table-extraction');
  }
  
  async extractSearch(metadata: NodeMetadata): Promise<SearchSection> {
    const prompt = buildSearchPrompt(JSON.stringify(metadata, null, 2));
    return this.createRequest<SearchSection>(prompt, metadata, 'search-extraction');
  }
  
  async extractToolbar(metadata: NodeMetadata): Promise<ToolbarSection> {
    const prompt = buildToolbarPrompt(JSON.stringify(metadata, null, 2));
    return this.createRequest<ToolbarSection>(prompt, metadata, 'toolbar-extraction');
  }
}
