import React, { useEffect, useCallback } from 'react';
import { AppConfig, Status, NodeMetadata, RawNodeTree } from '@figma-designer/shared';
import * as SharedUtils from '@figma-designer/shared';
import styles from './App.module.css';

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
      console.log('[UI] payload.apiKey:', payload?.apiKey ? `${payload.apiKey.substring(0, 10)}...` : '(empty)');
      console.log('[UI] payload.apiBaseUrl:', payload?.apiBaseUrl);
      console.log('[UI] payload.model:', payload?.model);
      console.log('[UI] payload.availableModels:', payload?.availableModels);
      updateConfig(payload);
      if (payload?.apiKey && payload.apiKey.trim() !== '') {
        setStatus({ type: 'success', text: '已加载本地配置' });
      } else {
        setStatus({ type: 'error', text: 'API Key 未配置，请在 .env 文件中配置 API_KEY' });
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
    },
    onBackendPayloadResult: (payload) => {
      console.log('[App] Successfully sent inference data to backend:', payload);
      updateStatus('success', '推断数据已提交');
      
      // 获取 token 并跳转到 chatUrl
      const token = payload?.token;
      const chatUrl = payload?.chatUrl || config.chatUrl || 'http://localhost:5173';
      
      if (token) {
        const urlWithToken = `${chatUrl}?token=${encodeURIComponent(token)}`;
        console.log('[App] Opening chat URL with token:', urlWithToken);
        window.open(urlWithToken, '_blank');
      } else {
        console.warn('[App] No token received, opening chat URL without token');
        window.open(chatUrl, '_blank');
      }
    },
    onBackendPayloadError: (payload) => {
      console.error('[App] Failed to send inference data to backend:', payload);
      updateStatus('error', '提交失败: ' + (payload?.message || '未知错误'));
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

  const handleChat = useCallback(() => {
    if (!inferenceResult) {
      console.warn('[App] No inference result to send');
      updateStatus('error', '请先完成推断');
      return;
    }
    
    console.log('[App] Chat button clicked, sending data to backend via plugin');
    updateStatus('loading', '正在提交推断数据...');
    
    // 通过插件主线程发送请求（避免 CSP 限制）
    figmaService.postBackendPayload(inferenceResult);
  }, [inferenceResult, updateStatus]);

  // --- Render ---

  return (
    <div className={styles.container}>
      <Header
        config={config}
        models={models}
        mode={mode}
        isExtracting={isExtracting}
        isInferring={isInferring}
        hasMetadata={!!metadata}
        hasInferenceResult={!!inferenceResult}
        onModelChange={setModel}
        onModeChange={handleModeChange}
        onExtract={handleExtract}
        onInference={handleInference}
        onChat={handleChat}
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
