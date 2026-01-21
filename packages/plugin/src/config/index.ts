import { AppConfig } from '@figma-designer/shared';

/**
 * 环境变量配置
 * 注意：process.env.XXX 会在构建时被 tsup 的 define 替换为实际值
 * 必须使用直接引用（如 process.env.API_KEY），不能使用动态访问
 */
declare const process: { env: Record<string, string | undefined> };

const ENV_CONFIG = {
  apiKey: process.env.API_KEY || '',
  apiBaseUrl: process.env.API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  model: process.env.MODEL || 'glm-4-flash'
};

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = {
      apiKey: ENV_CONFIG.apiKey,
      apiBaseUrl: ENV_CONFIG.apiBaseUrl,
      model: ENV_CONFIG.model,
      availableModels: [
        { value: 'glm-4.7', label: 'GLM-4.7 (文本)' },
        { value: 'GLM-4.6V', label: 'GLM-4.6V (视觉)' },
        { value: 'glm-4.5-flash', label: 'GLM-4.5-Flash (文本free)' },
        { value: 'GLM-4.6V-Flash', label: 'GLM-4.6V-Flash (视觉free)' }
      ]
    };
    console.log('[ConfigManager] Initialized with config:', {
      apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 10)}...` : '(empty)',
      apiBaseUrl: this.config.apiBaseUrl,
      model: this.config.model
    });
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public getConfig(): AppConfig {
    return this.config;
  }

  public updateConfig(newConfig: Partial<AppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
