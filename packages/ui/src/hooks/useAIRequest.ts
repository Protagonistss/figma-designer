import { useState, useCallback, useRef } from 'react';
import { AppConfig } from '@figma-designer/shared';
import * as SharedUtils from '@figma-designer/shared';
import { createAIService } from '../services';

interface AIRequestState {
  isLoading: boolean;
  error: string | null;
  result: any | null;
}

interface PendingRequest {
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  timeoutId: number;
}

export function useAIRequest(config: AppConfig) {
  const [state, setState] = useState<AIRequestState>({
    isLoading: false,
    error: null,
    result: null
  });
  const pendingRequestsRef = useRef<Map<string, PendingRequest>>(new Map());

  const callOpenAI = useCallback(async (
    systemPrompt: string,
    screenshotStr?: string
  ): Promise<any> => {
    const aiService = createAIService(config);
    return aiService.callAI(systemPrompt, screenshotStr);
  }, [config]);

  const handleAIRequest = useCallback(async (msg: any) => {
    const { requestId, prompt, screenshot } = msg;
    console.log('[UI] Handling AI request:', requestId);

    try {
      const result = await callOpenAI(prompt, screenshot);
      parent.postMessage({
        pluginMessage: {
          type: 'ai-response',
          requestId,
          result
        }
      }, '*');
    } catch (error: any) {
      parent.postMessage({
        pluginMessage: {
          type: 'ai-response',
          requestId,
          error: error.message
        }
      }, '*');
    }
  }, [callOpenAI]);

  return {
    state,
    callOpenAI,
    handleAIRequest
  };
}
