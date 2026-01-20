/**
 * 模型配置常量
 */

export const VISION_MODELS = [
  'GLM-4.6V-Flash',
  'GLM-4.6V',
  'gpt-4-vision',
  'gpt-4o',
  'claude-3-opus',
  'claude-3-sonnet'
] as const;

export const TEXT_MODELS = [
  'glm-4.7',
  'glm-4-flash',
  'glm-4.5-flash',
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3-haiku'
] as const;

export const DEFAULT_VISION_MODEL = 'GLM-4.6V-Flash';

export const DEFAULT_TEXT_MODEL = 'glm-4-flash';

export const AVAILABLE_MODELS: Array<{ value: string; label: string }> = [
  // 文本模型
  { value: 'glm-4.7', label: 'GLM-4.7 (文本)' },
  { value: 'glm-4-flash', label: 'GLM-4-Flash (文本)' },
  { value: 'glm-4.5-flash', label: 'GLM-4.5-Flash (文本free)' },
  // 视觉模型
  { value: 'GLM-4.6V', label: 'GLM-4.6V (视觉)' },
  { value: 'GLM-4.6V-Flash', label: 'GLM-4.6V-Flash (视觉free)' }
];
