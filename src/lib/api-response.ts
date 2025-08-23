import { NextResponse } from 'next/server';
import { AppError } from './errors';

/**
 * API响应接口定义
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: string;
}

/**
 * 分页响应接口
 */
export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API响应格式化工具函数
 */
export class ApiResponseFormatter {
  /**
   * 创建成功响应
   * @param data 响应数据
   * @param message 成功消息
   * @param statusCode HTTP状态码
   * @returns NextResponse对象
   */
  static success<T>(
    data?: T,
    message?: string,
    statusCode: number = 200
  ): NextResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: statusCode });
  }

  /**
   * 创建错误响应
   * @param error 错误信息或错误对象
   * @param statusCode HTTP状态码
   * @returns NextResponse对象
   */
  static error(
    error: string | AppError,
    statusCode?: number
  ): NextResponse<ApiResponse> {
    let errorMessage: string;
    let finalStatusCode: number;

    if (error instanceof AppError) {
      errorMessage = error.message;
      finalStatusCode = error.statusCode;
    } else {
      errorMessage = error;
      finalStatusCode = statusCode || 500;
    }

    const response: ApiResponse = {
      success: false,
      error: errorMessage,
      statusCode: finalStatusCode,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: finalStatusCode });
  }

  /**
   * 创建分页响应
   * @param data 响应数据数组
   * @param pagination 分页信息
   * @param message 成功消息
   * @returns NextResponse对象
   */
  static paginated<T>(
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message?: string
  ): NextResponse<PaginatedResponse<T>> {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: PaginatedResponse<T> = {
      success: true,
      data,
      message,
      statusCode: 200,
      timestamp: new Date().toISOString(),
      pagination: {
        ...pagination,
        totalPages
      }
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * 创建无内容响应
   * @param message 消息
   * @returns NextResponse对象
   */
  static noContent(message?: string): NextResponse<ApiResponse> {
    const response: ApiResponse = {
      success: true,
      message: message || '操作成功',
      statusCode: 204,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response, { status: 204 });
  }

  /**
   * 创建创建成功响应
   * @param data 创建的资源数据
   * @param message 成功消息
   * @returns NextResponse对象
   */
  static created<T>(
    data: T,
    message?: string
  ): NextResponse<ApiResponse<T>> {
    return this.success(data, message || '创建成功', 201);
  }

  /**
   * 创建未认证响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static unauthorized(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '未认证', 401);
  }

  /**
   * 创建权限不足响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static forbidden(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '权限不足', 403);
  }

  /**
   * 创建资源未找到响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static notFound(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '资源未找到', 404);
  }

  /**
   * 创建验证失败响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static badRequest(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '请求参数错误', 400);
  }

  /**
   * 创建冲突响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static conflict(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '资源冲突', 409);
  }

  /**
   * 创建服务器错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static internalServerError(message?: string): NextResponse<ApiResponse> {
    return this.error(message || '服务器内部错误', 500);
  }
}

/**
 * API响应处理中间件辅助函数
 */
export class ApiMiddleware {
  /**
   * 包装API处理函数，统一错误处理
   * @param handler API处理函数
   * @returns 包装后的处理函数
   */
  static withErrorHandling(
    handler: (request: Request, context?: unknown) => Promise<NextResponse>
  ) {
    return async (request: Request, context?: unknown): Promise<NextResponse> => {
      try {
        return await handler(request, context);
      } catch (error: unknown) {
        console.error('API Error:', error);
        
        if (error instanceof AppError) {
          return ApiResponseFormatter.error(error);
        }

        return ApiResponseFormatter.internalServerError('服务器内部错误');
      }
    };
  }

  /**
   * 验证请求方法
   * @param request 请求对象
   * @param allowedMethods 允许的HTTP方法
   * @returns 验证结果
   */
  static validateMethod(
    request: Request,
    allowedMethods: string[]
  ): NextResponse | null {
    if (!allowedMethods.includes(request.method)) {
      return ApiResponseFormatter.error(
        `方法 ${request.method} 不被允许`,
        405
      );
    }
    return null;
  }

  /**
   * 解析请求体JSON
   * @param request 请求对象
   * @returns 解析后的JSON数据
   */
  static async parseRequestBody(request: Request): Promise<unknown> {
    try {
      const body = await request.json();
      return body;
    } catch {
      throw new AppError('无效的JSON格式', 400);
    }
  }
}