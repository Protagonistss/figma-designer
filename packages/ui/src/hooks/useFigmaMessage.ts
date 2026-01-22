import { useEffect, useCallback, useRef } from 'react';

interface MessageHandlers {
  onConfig?: (payload: any) => void;
  onExtractResult?: (payload: any) => void;
  onExtractError?: (payload: any) => void;
  onInferenceResult?: (payload: any) => void;
  onInferenceError?: (payload: any) => void;
  onBackendPayloadResult?: (payload: any) => void;
  onBackendPayloadError?: (payload: any) => void;
}

export function useFigmaMessage(handlers: MessageHandlers) {
  // 使用 ref 保存 handlers，确保事件监听器中始终访问最新的 handlers
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const postMessage = useCallback((type: string, payload?: any) => {
    parent.postMessage({ pluginMessage: { type, payload } }, '*');
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      console.log('[UI] Received message:', msg.type, msg);

      const currentHandlers = handlersRef.current;
      switch (msg.type) {
        case 'config':
          currentHandlers.onConfig?.(msg.payload);
          break;
        case 'extract-result':
          currentHandlers.onExtractResult?.(msg.payload);
          break;
        case 'extract-error':
          currentHandlers.onExtractError?.(msg.payload);
          break;
        case 'inference-result':
          currentHandlers.onInferenceResult?.(msg.payload);
          break;
        case 'inference-error':
          currentHandlers.onInferenceError?.(msg.payload);
          break;
        case 'backend-payload-result':
          currentHandlers.onBackendPayloadResult?.(msg.payload);
          break;
        case 'backend-payload-error':
          currentHandlers.onBackendPayloadError?.(msg.payload);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []); // 空依赖数组，只在挂载时注册一次

  return { postMessage };
}
