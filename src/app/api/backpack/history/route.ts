import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { ItemModel } from '@/lib/models/item';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ErrorHandler 
} from '@/lib/utils';
import { UsageHistory } from '@/types';

/**
 * GET /api/backpack/history - 获取用户物品使用历史
 */
export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      // TODO: 使用新的数据库模型替代 Prisma
      return ApiResponseFormatter.error('此 API 正在迁移中，请稍后再试', 503);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/backpack/history');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);