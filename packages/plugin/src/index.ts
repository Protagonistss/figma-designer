import { Processor } from './processor';
import UI_HTML from '@figma-designer/ui/html';
import { ConfigManager } from './config';
import { buildPageAnalysisPrompt, buildHybridAnalysisPrompt } from '@figma-designer/ai';
import { NodeMetadata, AnalysisMode, AnalysisConfig, DEFAULT_ANALYSIS_CONFIG, RawNodeTree } from '@figma-designer/shared';

/**
 * 提取原始节点树（用于调试和对比）
 * 包含完整的节点信息：id、坐标、尺寸等
 */
function extractRawNodeTree(node: SceneNode): RawNodeTree {
  const rawNode: RawNodeTree = {
    id: node.id,
    name: node.name,
    type: node.type as any,
    visible: node.visible,
    x: Math.round(node.x),
    y: Math.round(node.y),
    width: Math.round(node.width),
    height: Math.round(node.height)
  };

  // 提取文本内容
  if (node.type === 'TEXT') {
    (rawNode as any).characters = (node as TextNode).characters;
  }

  // 递归提取子节点
  if ('children' in node) {
    (rawNode as any).children = node.children
      .filter(c => c.visible)
      .map(c => extractRawNodeTree(c));
  }

  return rawNode;
}


async function main() {
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    figma.notify("请先选择一个节点");
    figma.closePlugin();
    return;
  }

  // Only process the first selected node as the root of the page/module
  const rootNode = selection[0];
  console.log(`Processing root node: ${rootNode.name} (Type: ${rootNode.type})`);

  // Show UI for API Key input and analysis
  figma.showUI(UI_HTML, { width: 800, height: 600, title: "AI 设计稿解析" });

  // 发送配置信息给 UI
  const config = ConfigManager.getInstance().getConfig();
  figma.ui.postMessage({
    type: 'config',
    payload: config
  });

  const processor = new Processor();
  let lastMetadata: NodeMetadata | null = null;
  let lastScreenshot: string | null = null;
  const pendingAiRequests = new Map<string, { resolve: (result: any) => void; reject: (error: Error) => void; timeoutId: number }>();

  const requestAI = (prompt: string, metadata: NodeMetadata, screenshot?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      console.log('[AI] Sending request:', requestId);

      const timeoutId = setTimeout(() => {
        pendingAiRequests.delete(requestId);
        reject(new Error('AI request timeout'));
      }, 180000);

      pendingAiRequests.set(requestId, { resolve, reject, timeoutId });

      figma.ui.postMessage({
        type: 'ai-request',
        requestId,
        requestType: 'page-analysis',
        prompt,
        metadata,
        screenshot  // 传递截图给 UI 进行 API 调用
      });
    });
  };

  // Handle messages from UI
  figma.ui.onmessage = async (msg: any) => {
    if (msg.type === 'ai-response' && msg.requestId) {
      const pending = pendingAiRequests.get(msg.requestId);
      if (!pending) {
        return;
      }

      clearTimeout(pending.timeoutId);
      pendingAiRequests.delete(msg.requestId);

      if (msg.error) {
        pending.reject(new Error(msg.error));
      } else if (msg.result === undefined || msg.result === null) {
        pending.reject(new Error('AI 响应内容为空'));
      } else {
        pending.resolve(msg.result);
      }
      return;
    }

    if (msg.type === 'start-extract') {
      try {
        const mode: AnalysisMode = msg.mode || 'structure-only';
        console.log('[Main] Start extract with mode:', mode);
        figma.notify("开始提取元数据...");

        // 根据模式构建配置
        const analysisConfig: AnalysisConfig = {
          ...DEFAULT_ANALYSIS_CONFIG,
          mode,
          screenshot: {
            ...DEFAULT_ANALYSIS_CONFIG.screenshot,
            enabled: mode === 'hybrid' || mode === 'visual-only'
          }
        };

        const result = await processor.extract(rootNode, analysisConfig);
        lastMetadata = result.metadata;
        lastScreenshot = result.screenshot || null;

        figma.ui.postMessage({
          type: 'extract-result',
          payload: {
            metadata: result.metadata,
            nodeTree: extractRawNodeTree(rootNode),
            screenshot: result.screenshot
          }
        });

        figma.notify('元数据提取完成');
      } catch (err) {
        console.error("Processing error:", err);
        figma.notify("提取出错: " + (err as Error).message);
        figma.ui.postMessage({
          type: 'extract-error',
          payload: { message: (err as Error).message }
        });
      }
    } else if (msg.type === 'start-inference') {
      if (!lastMetadata) {
        const errorMessage = '请先提取元数据';
        figma.notify(errorMessage);
        figma.ui.postMessage({
          type: 'inference-error',
          payload: { message: errorMessage }
        });
        return;
      }

      try {
        const mode: AnalysisMode = msg.mode || 'structure-only';
        const hasScreenshot = msg.hasScreenshot && !!lastScreenshot;
        
        figma.notify('开始推断...');
        console.log('[Main] Start inference with mode:', mode, 'hasScreenshot:', hasScreenshot);
        
        // 根据模式选择 Prompt
        let prompt: string;
        if (mode === 'hybrid' || mode === 'visual-only') {
          prompt = buildHybridAnalysisPrompt(JSON.stringify(lastMetadata, null, 2), hasScreenshot);
        } else {
          prompt = buildPageAnalysisPrompt(JSON.stringify(lastMetadata, null, 2));
        }
        
        const inferenceResult = await requestAI(prompt, lastMetadata, hasScreenshot ? lastScreenshot! : undefined);

        figma.ui.postMessage({
          type: 'inference-result',
          payload: { result: inferenceResult }
        });

        figma.notify('推断完成');
      } catch (err) {
        console.error('Inference error:', err);
        figma.notify('推断出错: ' + (err as Error).message);
        figma.ui.postMessage({
          type: 'inference-error',
          payload: { message: (err as Error).message }
        });
      }
    } else if (msg.type === 'close') {
      figma.closePlugin();
    }
  };
}

main().catch((err) => {
  console.error(err);
  figma.notify("发生错误: " + err.message);
  figma.closePlugin();
});
