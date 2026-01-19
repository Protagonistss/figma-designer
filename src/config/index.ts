export interface AppConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  availableModels: { value: string; label: string }[];
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = {
      // @ts-ignore
      apiKey: process.env.API_KEY || '',
      // @ts-ignore
      apiBaseUrl: process.env.API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      // @ts-ignore
      model: process.env.MODEL || 'glm-4-flash',
      availableModels: [
        { value: 'glm-4.7', label: 'GLM-4.7 (文本)' },
        { value: 'GLM-4.6V', label: 'GLM-4.6V (视觉)' },
        { value: 'GLM-4.6V-Flash', label: 'GLM-4.6V-Flash (视觉free)' },
        { value: 'glm-4.5-flash', label: 'GLM-4.5-Flash (快速free)' },
      ]
    };
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
