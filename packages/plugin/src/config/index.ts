export interface AppConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  availableModels: { value: string; label: string }[];
}

/**
 * 获取环境变量（Figma 插件环境）
 * 注意：Figma 插件运行在沙箱环境中，process.env 需要在构建时注入
 */
function getEnv(key: string, defaultValue: string = ''): string {
  // 在 Figma 插件环境中，process.env 可能不存在或为 undefined
  // 这里使用类型断言来处理这种情况
  const env = (globalThis as any).process?.env;
  return env?.[key] || defaultValue;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = {
      apiKey: getEnv('API_KEY'),
      apiBaseUrl: getEnv('API_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4/chat/completions'),
      model: getEnv('MODEL', 'glm-4-flash'),
      availableModels: [
        { value: 'glm-4.7', label: 'GLM-4.7 (文本)' },
        { value: 'GLM-4.6V', label: 'GLM-4.6V (视觉)' },
        { value: 'glm-4.5-flash', label: 'GLM-4.5-Flash (文本free)' },
        { value: 'GLM-4.6V-Flash', label: 'GLM-4.6V-Flash (视觉free)' }
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
