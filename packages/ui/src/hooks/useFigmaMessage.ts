import { useEffect, useCallback } from 'react';
import { Status } from '@figma-designer/shared';

interface MessageHandlers {
  onConfig?: (payload: any) => void;
  onExtractResult?: (payload: any) => void;
  onExtractError?: (payload: any) => void;
  onInferenceResult?: (payload: any) => void;
  onInferenceError?: (payload: any) => void;
}

export function useFigmaMessage(handlers: MessageHandlers) {
  const postMessage = useCallback((type: string, payload?: any) => {
    parent.postMessage({ pluginMessage: { type, payload } }, '*');
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data.pluginMessage;
      if (!msg) return;

      console.log('[UI] Received message:', msg.type, msg);

      switch (msg.type) {
        case 'config':
          handlers.onConfig?.(msg.payload);
          break;
        case 'extract-result':
          handlers.onExtractResult?.(msg.payload);
          break;
        case 'extract-error':
          handlers.onExtractError?.(msg.payload);
          break;
        case 'inference-result':
          handlers.onInferenceResult?.(msg.payload);
          break;
        case 'inference-error':
          handlers.onInferenceError?.(msg.payload);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handlers]);

  return { postMessage };
}
