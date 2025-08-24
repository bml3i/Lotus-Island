import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  PasswordUtils, 
  ValidationError,
  NotFoundError,
  ErrorHandler 
} from '@/lib/utils';
import { User } from '@/types';

/**
 * GET /api/users/[id] - 获取单个用户信息 (管理员或用户本人)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;
        const targetUser = await UserModel.findById(id);
        
        if (!targetUser) {
          throw new NotFoundError('用户不存在');
        }

        // 只有管理员或用户本人可以查看详细信息
        if (user!.role !== 'admin' && user!.userId !== id) {
          return ApiResponseFormatter.forbidden('无权限访问此用户信息');
        }

        // 移除敏感信息
        const { passwordHash, ...safeUser } = targetUser;
        
        return ApiResponseFormatter.success(safeUser);
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'GET /api/users/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true }
  )(request);
}

/**
 * PUT /api/users/[id] - 更新用户信息 (管理员或用户本人)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;
        const body = await req.json();
        
        // 只有管理员或用户本人可以更新信息
        if (user!.role !== 'admin' && user!.userId !== id) {
          return ApiResponseFormatter.forbidden('无权限修改此用户信息');
        }
        
        // 验证输入
        if (body.username && typeof body.username !== 'string') {
          throw new ValidationError('用户名必须是字符串');
        }
        
        if (body.role && !['admin', 'user'].includes(body.role)) {
          throw new ValidationError('角色必须是 admin 或 user');
        }

        // 非管理员不能修改角色
        if (user!.role !== 'admin' && body.role) {
          throw new ValidationError('只有管理员可以修改用户角色');
        }

        // 如果更新密码，需要处理
        const updateData: any = {};
        if (body.username) updateData.username = body.username;
        if (body.role && user!.role === 'admin') updateData.role = body.role;
        if (body.password) updateData.passwordHash = body.password; // 明文存储

        const updatedUser = await UserModel.update(id, updateData);
        
        // 移除敏感信息
        const { passwordHash, ...safeUser } = updatedUser;
        
        return ApiResponseFormatter.success(safeUser);
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'PUT /api/users/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true }
  )(request);
}

/**
 * DELETE /api/users/[id] - 删除用户 (仅管理员)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;
        
        // 不能删除自己
        if (user!.userId === id) {
          throw new ValidationError('不能删除自己的账户');
        }

        await UserModel.delete(id);
        
        return ApiResponseFormatter.success({ message: '用户删除成功' });
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'DELETE /api/users/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}