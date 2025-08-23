import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
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

        // 验证权限：管理员可以查看所有用户，普通用户只能查看自己
        AuthMiddleware.requireOwnershipOrAdmin(user!, id);

        const targetUser = await prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        if (!targetUser) {
          throw new NotFoundError('用户不存在');
        }

        const formattedUser: User = {
          id: targetUser.id,
          username: targetUser.username,
          role: targetUser.role as 'admin' | 'user',
          createdAt: targetUser.createdAt,
          updatedAt: targetUser.updatedAt,
        };

        return ApiResponseFormatter.success(formattedUser, '用户信息获取成功');
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
 * PUT /api/users/[id] - 更新用户信息 (仅管理员)
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
        const { username, password, role } = body;

        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({
          where: { id }
        });

        if (!existingUser) {
          throw new NotFoundError('用户不存在');
        }

        // 构建更新数据
        const updateData: {
          username?: string;
          passwordHash?: string;
          role?: string;
        } = {};

        // 验证并更新用户名
        if (username !== undefined) {
          if (username.length < 3 || username.length > 50) {
            throw new ValidationError('用户名长度必须在3-50个字符之间');
          }
          updateData.username = username;
        }

        // 验证并更新密码 (明文存储)
        if (password !== undefined) {
          if (password.length < 6) {
            throw new ValidationError('密码长度不能少于6个字符');
          }
          updateData.passwordHash = await PasswordUtils.hashPassword(password);
        }

        // 验证并更新角色
        if (role !== undefined) {
          if (!['admin', 'user'].includes(role)) {
            throw new ValidationError('角色必须是admin或user');
          }
          updateData.role = role;
        }

        // 如果没有任何更新数据
        if (Object.keys(updateData).length === 0) {
          throw new ValidationError('至少需要提供一个要更新的字段');
        }

        // 更新用户
        const updatedUser = await prisma.user.update({
          where: { id },
          data: updateData,
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          }
        });

        const formattedUser: User = {
          id: updatedUser.id,
          username: updatedUser.username,
          role: updatedUser.role as 'admin' | 'user',
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
        };

        return ApiResponseFormatter.success(formattedUser, '用户信息更新成功');
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'PUT /api/users/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
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

        // 检查用户是否存在
        const existingUser = await prisma.user.findUnique({
          where: { id }
        });

        if (!existingUser) {
          throw new NotFoundError('用户不存在');
        }

        // 防止删除自己
        if (user!.userId === id) {
          throw new ValidationError('不能删除自己的账户');
        }

        // 删除用户 (级联删除相关数据)
        await prisma.user.delete({
          where: { id }
        });

        return ApiResponseFormatter.success(null, '用户删除成功');
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'DELETE /api/users/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}