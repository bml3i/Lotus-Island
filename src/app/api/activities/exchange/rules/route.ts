import { NextRequest } from 'next/server';
import { ExchangeRuleModel } from '@/lib/models/exchange';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

/**
 * GET /api/activities/exchange/rules - 获取所有兑换规则 (管理员)
 */
export const GET = AuthMiddleware.withAuth(
  async () => {
    try {
      // TODO: 使用 ExchangeRuleModel 替代 Prisma
      return ApiResponseFormatter.error('此 API 正在迁移中，请稍后再试', 503);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/activities/exchange/rules');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);

/**
 * POST /api/activities/exchange/rules - 创建新的兑换规则 (管理员)
 */
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      // TODO: 使用新的数据库模型替代 Prisma
      return ApiResponseFormatter.error('此 API 正在迁移中，请稍后再试', 503);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/exchange/rules');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);