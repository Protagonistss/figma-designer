import { MetadataExtractor } from '../extractor';
import { NodeMetadata, AnalysisConfig, DEFAULT_ANALYSIS_CONFIG } from '@figma-designer/shared';
import { ScreenshotCapture } from '../screenshot';

export interface ExtractResult {
  metadata: NodeMetadata;
  screenshot?: string;  // Base64 Data URL
}

export class Processor {
  private extractor: MetadataExtractor;
  private screenshotCapture: ScreenshotCapture;
  
  constructor() {
    this.extractor = new MetadataExtractor(10); // 提高层级以覆盖更多标签文本
    this.screenshotCapture = new ScreenshotCapture();
  }
  
  async extract(rootNode: SceneNode, config: AnalysisConfig = DEFAULT_ANALYSIS_CONFIG): Promise<ExtractResult> {
    console.log('[Processor] Extracting metadata...');
    const metadata = this.extractor.extractTree(rootNode);
    
    if (metadata === null) {
      throw new Error('所选节点不包含任何有效内容（无文本或有效子节点）');
    }
    
    console.log('[Processor] Metadata extracted, nodes:', this.countNodes(metadata));
    
    let screenshot: string | undefined;
    
    // 根据模式决定是否捕获截图
    console.log('[Processor] Mode:', config.mode, 'Should capture?', config.mode === 'visual-only' || config.mode === 'hybrid');
    if (config.mode === 'visual-only' || config.mode === 'hybrid') {
      try {
        console.log('[Processor] Capturing screenshot...');
        screenshot = await this.screenshotCapture.capture(rootNode, {
          ...config.screenshot,
          enabled: true  // 强制启用
        });
        console.log('[Processor] Screenshot captured, length:', screenshot?.length || 0);
      } catch (err) {
        console.error('[Processor] Screenshot capture failed:', err);
        // 截图失败不影响主流程，但在控制台打印详细错误
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('[Processor] Screenshot error details:', errorMessage);
      }
    }
    
    console.log('[Processor] Returning result with screenshot:', !!screenshot);
    return { metadata, screenshot };
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
  
}
