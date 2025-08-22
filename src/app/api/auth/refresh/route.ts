import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenUtils, ApiResponseFormatter, AuthMiddleware } from '@/lib/utils';

export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      if (!user) {
        return ApiResponseFormatter.unauthorized('无效的认证令牌');
      }

      // 验证用户是否仍然存在且有效
      const currentUser = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!currentUser) {
        return ApiResponseFormatter.unauthorized('用户不存在');
      }

      // 生成新的JWT令牌
      const newToken = TokenUtils.generateToken({
        userId: currentUser.id,
        username: currentUser.username,
        role: currentUser.role
      });

      return ApiResponseFormatter.success({
        token: newToken,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          role: currentUser.role,
          createdAt: currentUser.createdAt,
          updatedAt: currentUser.updatedAt
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      return ApiResponseFormatter.internalServerError('令牌刷新过程中发生错误');
    }
  },
  { requireAuth: true }
);