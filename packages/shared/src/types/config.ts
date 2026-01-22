export interface AppConfig {
  apiKey: string;
  apiBaseUrl: string;
  model: string;
  backendUrl?: string;
  chatUrl?: string;
  availableModels?: Array<{ value: string; label: string }>;
}

export interface Status {
  type: 'loading' | 'success' | 'error' | 'idle';
  text: string;
}
