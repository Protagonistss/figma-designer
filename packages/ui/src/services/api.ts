import { AppConfig } from '@figma-designer/shared';
import * as SharedUtils from '@figma-designer/shared';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
}

export class AIService {
  private config: AppConfig;

  constructor(config: AppConfig) {
    this.config = config;
  }

  updateConfig(config: Partial<AppConfig>): void {
    this.config = { ...this.config, ...config };
  }

  async callAI(prompt: string, screenshot?: string): Promise<any> {
    const { apiKey, apiBaseUrl, model } = this.config;

    if (!apiKey) {
      throw new Error('请配置 API Key');
    }
    if (!apiBaseUrl) {
      throw new Error('API 地址未配置');
    }

    let messages: ChatMessage[] = [];

    if (screenshot) {
      messages.push({
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: screenshot } },
          { type: 'text', text: prompt }
        ]
      });
    } else {
      messages.push({ role: 'user', content: prompt });
    }

    let modelToUse = model;
    if (screenshot) {
      modelToUse = SharedUtils.resolveModelForScreenshot(model);
    }

    const requestBody: ChatCompletionRequest = {
      model: modelToUse,
      messages,
      temperature: 0.3,
      max_tokens: 4000
    };

    const response = await fetch(apiBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败: ${response.status} ${errorText}`);
    }

    const data: ChatCompletionResponse = await response.json();
    const message = data.choices?.[0]?.message;
    const content = message?.content || message?.reasoning_content;

    if (!content) {
      throw new Error('AI 返回空内容');
    }

    return this.parseJSONResponse(content);
  }

  private parseJSONResponse(content: string): any {
    // 移除 markdown 代码块标记
    let cleanedContent = content.trim();
    
    // 移除 ```json ... ``` 或 ``` ... ``` 包裹
    const codeBlockMatch = cleanedContent.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      cleanedContent = codeBlockMatch[1].trim();
    }
    
    // Try direct parse first
    try {
      return JSON.parse(cleanedContent);
    } catch (e) {
      // Try to extract JSON from content
      const startIdx = cleanedContent.indexOf('{');
      const endIdx = cleanedContent.lastIndexOf('}');

      if (startIdx !== -1 && endIdx > startIdx) {
        const jsonStr = cleanedContent.substring(startIdx, endIdx + 1);
        try {
          return JSON.parse(jsonStr);
        } catch (e2) {
          console.error('[AI] Failed to parse JSON:', cleanedContent);
          throw new Error('无法解析 AI 响应为 JSON');
        }
      }
      console.error('[AI] No JSON found in response:', cleanedContent);
      throw new Error('无法解析 AI 响应为 JSON');
    }
  }
}

export const createAIService = (config: AppConfig) => new AIService(config);
