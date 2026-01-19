import { VISION_MODELS, DEFAULT_VISION_MODEL } from '../constants/models';

/**
 * 模型工具函数
 */

/**
 * 检查模型是否为视觉模型
 */
export function isVisionModel(model: string): boolean {
  const lowerModel = model.toLowerCase();
  return VISION_MODELS.some(v => lowerModel.includes(v.toLowerCase()));
}

/**
 * 为截图请求获取合适的模型
 * 如果当前模型不是视觉模型，则自动切换到默认视觉模型
 */
export function resolveModelForScreenshot(model: string): string {
  if (!isVisionModel(model)) {
    console.log('[ModelHelper] Auto-switching to Vision model for screenshot');
    return DEFAULT_VISION_MODEL;
  }
  return model;
}

/**
 * 获取模型类型标签
 */
export function getModelLabel(model: string): string {
  if (isVisionModel(model)) {
    return '视觉模型';
  }
  return '文本模型';
}

/**
 * 根据分析模式获取推荐模型
 */
export function getRecommendedModel(
  mode: 'structure-only' | 'hybrid' | 'visual-only',
  currentModel: string
): string {
  if (mode === 'structure-only') {
    // 仅结构模式，使用文本模型
    return isVisionModel(currentModel) ? 'glm-4-flash' : currentModel;
  } else {
    // 混合模式或纯视觉模式，使用视觉模型
    return resolveModelForScreenshot(currentModel);
  }
}
