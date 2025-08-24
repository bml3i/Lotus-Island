import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { TokenUtils, ApiResponseFormatter, AuthMiddleware } from '@/lib/utils';

export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      // 获取最新的用户信息
      const currentUser = await UserModel.findById(user!.userId);
      
      if (!currentUser) {
        return ApiResponseFormatter.unauthorized('用户不存在');
      }

      // 生成新的访问令牌
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
          role: currentUser.role
        }
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return ApiResponseFormatter.internalServerError('刷新令牌时发生错误');
    }
  },
  { requireAuth: true }
);