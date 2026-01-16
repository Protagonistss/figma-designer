export interface AppConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = {
      // @ts-ignore
      apiKey: process.env.API_KEY || '', // 从构建时的环境变量注入
      // @ts-ignore
      apiBaseUrl: process.env.API_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      // @ts-ignore
      model: process.env.MODEL || 'glm-4'
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
