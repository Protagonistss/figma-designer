import React, { useEffect, useCallback } from 'react';
import { AppConfig, Status, NodeMetadata, RawNodeTree } from '@figma-designer/shared';
import * as SharedUtils from '@figma-designer/shared';

// --- Hooks & Services ---
import { useConfig, useFigmaMessage, useAIRequest } from './hooks';
import { figmaService } from './services';

// --- Components ---
import { Header, StatusBar, ResultPanel } from './components';

const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  apiBaseUrl: '',
  model: '',
  availableModels: []
};

export default function App() {
  // --- State Management ---
  const { config, models, updateConfig, setModel } = useConfig(DEFAULT_CONFIG);
  const [status, setStatus] = React.useState<Status>({ type: 'idle', text: '准备就绪' });
  const [mode, setMode] = React.useState<'structure-only' | 'hybrid' | 'visual-only'>('structure-only');
  const [metadata, setMetadata] = React.useState<NodeMetadata | null>(null);
  const [nodeTree, setNodeTree] = React.useState<RawNodeTree | null>(null);
  const [inferenceResult, setInferenceResult] = React.useState<any | null>(null);
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [isInferring, setIsInferring] = React.useState(false);

  // --- AI Request Handler ---
  const { handleAIRequest } = useAIRequest(config);

  // --- 启动时请求配置 ---
  useEffect(() => {
    console.log('[UI] Requesting config from plugin...');
    parent.postMessage({ pluginMessage: { type: 'get-config' } }, '*');
  }, []);

  // --- Figma Message Handler ---
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      console.log('[UI] Received message:', msg.type, msg);

      if (msg.type === 'ai-request') {
        await handleAIRequest(msg);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleAIRequest]);

  useFigmaMessage({
    onConfig: (payload) => {
      console.log('[UI] onConfig called with payload:', payload);
      console.log('[UI] payload.apiKey:', payload?.apiKey ? '(exists)' : '(empty)');
      console.log('[UI] payload.availableModels:', payload?.availableModels);
      updateConfig(payload);
      if (payload.apiKey) {
        setStatus({ type: 'success', text: '已加载本地配置' });
      }
    },
    onExtractResult: (payload) => {
      setMetadata(payload.metadata);
      setNodeTree(payload.nodeTree);
      setScreenshot(payload.screenshot || null);
      setInferenceResult(null);
      setIsExtracting(false);
      updateStatus('success', '元数据提取完成');
    },
    onExtractError: (payload) => {
      setIsExtracting(false);
      updateStatus('error', '提取失败: ' + (payload?.message || '未知错误'));
    },
    onInferenceResult: (payload) => {
      setInferenceResult(payload.result);
      setIsInferring(false);
      updateStatus('success', '推断完成');
    },
    onInferenceError: (payload) => {
      setIsInferring(false);
      updateStatus('error', '推断失败: ' + (payload?.message || '未知错误'));
    }
  });

  // --- Actions ---

  const updateStatus = useCallback((type: Status['type'], text: string) => {
    setStatus({ type, text });
  }, []);

  const handleExtract = useCallback(() => {
    figmaService.postExtractMessage(mode);
    setIsExtracting(true);
    updateStatus('loading', '正在提取设计稿数据...');
    setInferenceResult(null);
  }, [mode, updateStatus]);

  const handleInference = useCallback(() => {
    figmaService.postInferenceMessage(mode, !!screenshot);
    setIsInferring(true);
    updateStatus('loading', '正在推断页面结构...');
  }, [mode, screenshot, updateStatus]);

  const handleModeChange = useCallback((newMode: typeof mode) => {
    setMode(newMode);
    const recommendedModel = SharedUtils.getRecommendedModel(newMode, config.model);
    if (recommendedModel !== config.model) {
      setModel(recommendedModel);
    }
  }, [setModel, config.model]);

  // --- Render ---

  return (
    <div className="app-container">
      <Header
        config={config}
        models={models}
        mode={mode}
        isExtracting={isExtracting}
        isInferring={isInferring}
        hasMetadata={!!metadata}
        onModelChange={setModel}
        onModeChange={handleModeChange}
        onExtract={handleExtract}
        onInference={handleInference}
      />

      <ResultPanel
        metadata={metadata}
        nodeTree={nodeTree}
        inferenceResult={inferenceResult}
        screenshot={screenshot}
        mode={mode}
      />

      <StatusBar status={status} model={config.model} />
    </div>
  );
}
