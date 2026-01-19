import { ScreenshotConfig } from '../types/metadata';

/**
 * 截图捕获与优化模块
 * 使用 Figma exportAsync API 导出节点截图
 */
export class ScreenshotCapture {
  
  /**
   * 捕获节点截图
   * @param node 要截图的节点
   * @param config 截图配置
   * @returns Base64 Data URL
   */
  async capture(node: SceneNode, config: ScreenshotConfig): Promise<string> {
    if (!config.enabled) {
      throw new Error('Screenshot is disabled');
    }
    
    // 计算实际导出尺寸
    const nodeWidth = node.width;
    const effectiveScale = this.calculateScale(nodeWidth, config);
    
    console.log(`[Screenshot] Capturing node: ${node.name}, scale: ${effectiveScale}`);
    
    // 使用 Figma API 导出
    const exportSettings: ExportSettings = {
      format: config.format,
      constraint: {
        type: 'SCALE',
        value: effectiveScale
      }
    };
    
    const imageData = await node.exportAsync(exportSettings);
    
    // 转换为 Base64 Data URL
    const base64 = this.arrayBufferToBase64(imageData);
    const mimeType = config.format === 'PNG' ? 'image/png' : 'image/jpeg';
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    console.log(`[Screenshot] Captured, size: ${Math.round(imageData.length / 1024)}KB`);
    
    return dataUrl;
  }
  
  /**
   * 计算实际导出倍率
   * 目标：确保最终图片宽度不超过 maxWidth
   */
  private calculateScale(nodeWidth: number, config: ScreenshotConfig): number {
    // 计算达到 maxWidth 所需的倍率
    const maxScale = config.maxWidth / nodeWidth;
    
    // 取配置倍率和最大倍率中的较小值
    const effectiveScale = Math.min(config.scale, maxScale);
    
    // 确保至少 0.25 倍率以保持可读性
    return Math.max(0.25, effectiveScale);
  }
  
  /**
   * ArrayBuffer 转 Base64
   */
  private arrayBufferToBase64(buffer: Uint8Array): string {
    // Figma 插件环境中使用 figma.base64Encode
    return figma.base64Encode(buffer);
  }
  
  /**
   * 获取图片大小信息（用于 UI 显示）
   */
  getImageSizeInfo(dataUrl: string): { sizeKB: number; dimensions?: string } {
    // 计算 Base64 大小（约为实际大小的 4/3）
    const base64Length = dataUrl.split(',')[1]?.length || 0;
    const sizeBytes = (base64Length * 3) / 4;
    const sizeKB = Math.round(sizeBytes / 1024);
    
    return { sizeKB };
  }
}

// 导出单例
export const screenshotCapture = new ScreenshotCapture();
