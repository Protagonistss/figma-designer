import { useState, useCallback } from 'react';
import { AppConfig } from '@figma-designer/shared';

export function useConfig(initialConfig: AppConfig) {
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [models, setModels] = useState<Array<{ value: string; label: string }>>(initialConfig.availableModels || []);

  const updateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig(prev => {
      const newConfig = { ...prev, ...updates };
      // Update models if availableModels is provided
      if (updates.availableModels) {
        setModels(updates.availableModels);
      }
      return newConfig;
    });
  }, []);

  const setModel = useCallback((model: string) => {
    setConfig(prev => ({ ...prev, model }));
  }, []);

  const setApiKey = useCallback((apiKey: string) => {
    setConfig(prev => ({ ...prev, apiKey }));
  }, []);

  return {
    config,
    models,
    updateConfig,
    setModel,
    setApiKey
  };
}
