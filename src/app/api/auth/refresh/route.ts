import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { TokenUtils, ApiResponseFormatter, AuthMiddleware } from '@/lib/utils';

export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      // TODO: 使用新的数据库模型替代 Prisma
      return ApiResponseFormatter.error('此 API 正在迁移中，请稍后再试', 503);
    } catch (error) {
      console.error('Token refresh error:', error);
      return ApiResponseFormatter.internalServerError('刷新令牌时发生错误');
    }
  },
  { requireAuth: true }
);