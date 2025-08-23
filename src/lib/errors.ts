/**
 * 自定义错误类
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 认证错误
 */
export class AuthenticationError extends AppError {
  constructor(message: string = '认证失败') {
    super(message, 401);
  }
}

/**
 * 授权错误
 */
export class AuthorizationError extends AppError {
  constructor(message: string = '权限不足') {
    super(message, 403);
  }
}

/**
 * 资源未找到错误
 */
export class NotFoundError extends AppError {
  constructor(message: string = '资源未找到') {
    super(message, 404);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends AppError {
  constructor(message: string = '数据验证失败') {
    super(message, 400);
  }
}

/**
 * 数据库错误
 */
export class DatabaseError extends AppError {
  constructor(message: string = '数据库操作失败') {
    super(message, 500);
  }
}

/**
 * 错误处理工具函数
 */
export class ErrorHandler {
  /**
   * 处理数据库错误
   * @param error 数据库错误对象
   * @returns 标准化的错误对象
   */
  static handleDatabaseError(error: { code?: string; constraint?: string; detail?: string }): AppError {
    // PostgreSQL 唯一约束违反
    if (error.code === '23505') {
      const constraint = error.constraint || '';
      if (constraint.includes('username')) {
        return new ValidationError('用户名已存在');
      }
      if (constraint.includes('email')) {
        return new ValidationError('邮箱已存在');
      }
      return new ValidationError('数据已存在');
    }

    // PostgreSQL 外键约束违反
    if (error.code === '23503') {
      return new ValidationError('引用的数据不存在');
    }

    // PostgreSQL 非空约束违反
    if (error.code === '23502') {
      return new ValidationError('必填字段不能为空');
    }

    // PostgreSQL 连接错误
    if (error.code === '08006' || error.code === '08001') {
      return new DatabaseError('数据库连接失败');
    }

    // 其他数据库错误
    return new DatabaseError('数据库操作失败');
  }

  /**
   * 处理JWT错误
   * @param error JWT错误对象
   * @returns 标准化的错误对象
   */
  static handleJWTError(error: { name?: string }): AppError {
    if (error.name === 'JsonWebTokenError') {
      return new AuthenticationError('无效的令牌');
    }

    if (error.name === 'TokenExpiredError') {
      return new AuthenticationError('令牌已过期');
    }

    if (error.name === 'NotBeforeError') {
      return new AuthenticationError('令牌尚未生效');
    }

    return new AuthenticationError('令牌验证失败');
  }

  /**
   * 处理通用错误
   * @param error 错误对象
   * @returns 标准化的错误对象
   */
  static handleError(error: unknown): AppError {
    // 如果已经是AppError，直接返回
    if (error instanceof AppError) {
      return error;
    }

    // 处理数据库错误
    if (typeof error === 'object' && error !== null && 'code' in error && typeof (error as { code: string }).code === 'string') {
      return this.handleDatabaseError(error as { code: string; constraint?: string; detail?: string });
    }

    // 处理JWT错误
    if (typeof error === 'object' && error !== null && 'name' in error && typeof (error as { name: string }).name === 'string' && (error as { name: string }).name.includes('Token')) {
      return this.handleJWTError(error as { name: string });
    }

    // 处理其他错误
    const errorMessage = (error instanceof Error) ? error.message : '服务器内部错误';
    return new AppError(errorMessage, 500);
  }

  /**
   * 记录错误日志
   * @param error 错误对象
   * @param context 错误上下文
   */
  static logError(error: AppError, context?: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context ? `[${context}] ` : ''}${error.message}`;
    
    if (error.statusCode >= 500) {
      console.error(logMessage, error.stack);
    } else {
      console.warn(logMessage);
    }
  }
}