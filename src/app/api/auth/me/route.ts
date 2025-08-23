import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { ApiResponseFormatter, AuthMiddleware } from '@/lib/utils';

export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      if (!user) {
        return ApiResponseFormatter.unauthorized('无效的认证令牌');
      }

      // 获取用户完整信息
      const currentUser = await UserModel.findById(user.userId);

      if (!currentUser) {
        return ApiResponseFormatter.unauthorized('用户不存在');
      }

      return ApiResponseFormatter.success({
        user: currentUser
      });

    } catch (error) {
      console.error('Get current user error:', error);
      return ApiResponseFormatter.internalServerError('获取用户信息时发生错误');
    }
  },
  { requireAuth: true }
);