// Types for Figma plugin messages
export interface PluginMessage {
  type: string;
  payload?: any;
  requestId?: string;
}

export interface ExtractMessage extends PluginMessage {
  type: 'start-extract';
  mode: 'structure-only' | 'hybrid' | 'visual-only';
}

export interface InferenceMessage extends PluginMessage {
  type: 'start-inference';
  mode: 'structure-only' | 'hybrid' | 'visual-only';
  hasScreenshot?: boolean;
}

export interface CloseMessage extends PluginMessage {
  type: 'close';
}

export class FigmaService {
  postMessage(type: string, payload?: any): void {
    parent.postMessage({ pluginMessage: { type, payload } }, '*');
  }

  postExtractMessage(mode: 'structure-only' | 'hybrid' | 'visual-only'): void {
    this.postMessage('start-extract', { mode });
  }

  postInferenceMessage(
    mode: 'structure-only' | 'hybrid' | 'visual-only',
    hasScreenshot: boolean
  ): void {
    this.postMessage('start-inference', { mode, hasScreenshot });
  }

  postCloseMessage(): void {
    this.postMessage('close');
  }

  postBackendPayload(payload: any): void {
    this.postMessage('send-backend-payload', { payload });
  }
}

export const figmaService = new FigmaService();
