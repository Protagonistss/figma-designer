import { useState, useCallback, useRef } from 'react';
import { AppConfig } from '@figma-designer/shared';
import * as SharedUtils from '@figma-designer/shared';

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
    const apiKey = config.apiKey;
    if (!apiKey) throw new Error('请配置 API Key');
    if (!config.apiBaseUrl) throw new Error('API 地址未配置');

    let messages: any[] = [];
    if (screenshotStr) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: screenshotStr } },
          { type: 'text', text: systemPrompt }
        ]
      });
    } else {
      messages.push({ role: 'user', content: systemPrompt });
    }

    let modelToUse = config.model;
    if (screenshotStr) {
      modelToUse = SharedUtils.resolveModelForScreenshot(modelToUse);
    }

    const response = await fetch(config.apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('API 调用失败: ' + response.status + ' ' + errorText);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content || message?.reasoning_content;

    if (!content) throw new Error('AI 返回空内容');

    try {
      return JSON.parse(content);
    } catch (e) {
      // Try to extract JSON from response
      const startIdx = content.indexOf('{');
      let endIdx = content.lastIndexOf('}');
      if (startIdx !== -1 && endIdx > startIdx) {
        const jsonStr = content.substring(startIdx, endIdx + 1);
        return JSON.parse(jsonStr);
      }
      throw new Error('无法解析 AI 响应为 JSON');
    }
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
