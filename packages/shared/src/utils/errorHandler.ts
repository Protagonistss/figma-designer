import { AppError, ErrorType, createAPIError, createConfigError, createFigmaError, createNetworkError } from '../types/errors';

/**
 * 错误处理工具函数
 */

export interface ErrorResult {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    code?: string;
  };
}

export type Result<T> = { success: true; data: T } | ErrorResult;

/**
 * 将错误转换为统一格式的错误结果
 */
export function toErrorResult(error: unknown, defaultType: ErrorType = ErrorType.UNKNOWN_ERROR): ErrorResult {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        type: error.type,
        message: error.message,
        code: error.code
      }
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        type: defaultType,
        message: error.message
      }
    };
  }

  return {
    success: false,
    error: {
      type: defaultType,
      message: String(error)
    }
  };
}

/**
 * 包装异步函数，返回 Result 类型
 */
export async function tryAsync<T>(
  fn: () => Promise<T>,
  errorType: ErrorType = ErrorType.UNKNOWN_ERROR
): Promise<Result<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    return toErrorResult(error, errorType);
  }
}

/**
 * 包装同步函数，返回 Result 类型
 */
export function trySync<T>(
  fn: () => T,
  errorType: ErrorType = ErrorType.UNKNOWN_ERROR
): Result<T> {
  try {
    const data = fn();
    return { success: true, data };
  } catch (error) {
    return toErrorResult(error, errorType);
  }
}

/**
 * 获取用户友好的错误消息
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.API_KEY_MISSING:
      return '请先配置 API Key';
    case ErrorType.API_URL_MISSING:
      return 'API 地址未配置';
    case ErrorType.API_TIMEOUT:
      return '请求超时，请检查网络连接';
    case ErrorType.API_RESPONSE_EMPTY:
      return 'AI 返回空内容，请重试';
    case ErrorType.API_PARSE_ERROR:
      return '无法解析 AI 响应，请重试';
    case ErrorType.FIGMA_NO_SELECTION:
      return '请先选择一个节点';
    case ErrorType.NETWORK_ERROR:
      return '网络连接失败，请检查网络';
    default:
      return error.message || '发生未知错误';
  }
}

/**
 * 格式化错误日志
 */
export function formatErrorLog(error: AppError, context?: string): string {
  const contextStr = context ? `[${context}] ` : '';
  return `${contextStr}${error.type}: ${error.message}`;
}

/**
 * 处理 API 错误响应
 */
export function handleAPIError(response: Response, errorText?: string): AppError {
  if (response.status === 401) {
    return createAPIError('API Key 无效或已过期', '401');
  }
  if (response.status === 429) {
    return createAPIError('API 调用次数超限，请稍后重试', '429');
  }
  if (response.status >= 500) {
    return createAPIError('服务器错误，请稍后重试', String(response.status));
  }
  return createAPIError(
    `API 调用失败: ${response.status}`,
    String(response.status)
  );
}

/**
 * 解析 JSON 响应的错误处理
 */
export function parseJSONResponse(content: string): Result<any> {
  // Try direct parse first
  try {
    return { success: true, data: JSON.parse(content) };
  } catch (e) {
    // Try to extract JSON from content
    const startIdx = content.indexOf('{');
    const endIdx = content.lastIndexOf('}');

    if (startIdx !== -1 && endIdx > startIdx) {
      const jsonStr = content.substring(startIdx, endIdx + 1);
      try {
        return { success: true, data: JSON.parse(jsonStr) };
      } catch (e2) {
        // ignore
      }
    }
    return toErrorResult(new Error('无法解析 AI 响应为 JSON'), ErrorType.API_PARSE_ERROR);
  }
}
