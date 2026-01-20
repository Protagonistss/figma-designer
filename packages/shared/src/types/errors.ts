/**
 * 错误类型定义
 */

export enum ErrorType {
  // API 错误
  API_ERROR = 'API_ERROR',
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_URL_MISSING = 'API_URL_MISSING',
  API_TIMEOUT = 'API_TIMEOUT',
  API_RESPONSE_EMPTY = 'API_RESPONSE_EMPTY',
  API_PARSE_ERROR = 'API_PARSE_ERROR',

  // Figma 插件错误
  FIGMA_NO_SELECTION = 'FIGMA_NO_SELECTION',
  FIGMA_EXTRACT_ERROR = 'FIGMA_EXTRACT_ERROR',
  FIGMA_SCREENSHOT_ERROR = 'FIGMA_SCREENSHOT_ERROR',
  FIGMA_INFERENCE_ERROR = 'FIGMA_INFERENCE_ERROR',

  // 配置错误
  CONFIG_ERROR = 'CONFIG_ERROR',

  // 网络错误
  NETWORK_ERROR = 'NETWORK_ERROR',

  // 未知错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly originalError?: Error;

  constructor(
    type: ErrorType,
    message: string,
    code?: string,
    originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      stack: this.stack
    };
  }
}

/**
 * 创建 API 错误
 */
export function createAPIError(message: string, code?: string, originalError?: Error): AppError {
  return new AppError(ErrorType.API_ERROR, message, code, originalError);
}

/**
 * 创建配置错误
 */
export function createConfigError(message: string): AppError {
  return new AppError(ErrorType.CONFIG_ERROR, message);
}

/**
 * 创建 Figma 插件错误
 */
export function createFigmaError(type: ErrorType, message: string): AppError {
  return new AppError(type, message);
}

/**
 * 创建网络错误
 */
export function createNetworkError(message: string, originalError?: Error): AppError {
  return new AppError(ErrorType.NETWORK_ERROR, message, undefined, originalError);
}
