import { NextRequest } from 'next/server';
import { TokenUtils, ApiResponseFormatter, AuthenticationError, AuthorizationError } from '../utils';

/**
 * 认证中间件接口
 */
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    username: string;
    role: string;
  };
}

/**
 * 认证中间件
 */
export class AuthMiddleware {
  /**
   * 验证JWT令牌
   * @param request 请求对象
   * @returns 用户信息或抛出错误
   */
  static authenticateToken(request: NextRequest): { userId: string; username: string; role: string } {
    const authHeader = request.headers.get('authorization');
    const token = TokenUtils.extractTokenFromHeader(authHeader || '');
    
    if (!token) {
      throw new AuthenticationError('缺少认证令牌');
    }

    const decoded = TokenUtils.verifyToken(token);
    if (!decoded) {
      throw new AuthenticationError('无效的认证令牌');
    }

    return decoded;
  }

  /**
   * 验证管理员权限
   * @param user 用户信息
   * @returns 验证结果或抛出错误
   */
  static requireAdmin(user: { role: string }): void {
    if (user.role !== 'admin') {
      throw new AuthorizationError('需要管理员权限');
    }
  }

  /**
   * 验证用户权限（用户只能访问自己的资源）
   * @param user 当前用户信息
   * @param resourceUserId 资源所属用户ID
   * @returns 验证结果或抛出错误
   */
  static requireOwnershipOrAdmin(user: { userId: string; role: string }, resourceUserId: string): void {
    if (user.role !== 'admin' && user.userId !== resourceUserId) {
      throw new AuthorizationError('只能访问自己的资源');
    }
  }

  /**
   * 包装API处理函数，自动进行认证
   * @param handler API处理函数
   * @param requireAuth 是否需要认证
   * @param requireAdmin 是否需要管理员权限
   * @returns 包装后的处理函数
   */
  static withAuth(
    handler: (request: NextRequest, user?: { userId: string; username: string; role: string }) => Promise<Response>,
    options: { requireAuth?: boolean; requireAdmin?: boolean } = {}
  ) {
    return async (request: NextRequest): Promise<Response> => {
      try {
        let user: { userId: string; username: string; role: string } | undefined;

        // 如果需要认证，验证令牌
        if (options.requireAuth) {
          user = this.authenticateToken(request);
          
          // 如果需要管理员权限，验证角色
          if (options.requireAdmin) {
            this.requireAdmin(user);
          }
        }

        return await handler(request, user);
      } catch (error) {
        if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
          return ApiResponseFormatter.error(error);
        }
        
        console.error('Auth middleware error:', error);
        return ApiResponseFormatter.internalServerError('认证过程中发生错误');
      }
    };
  }
}