import { NextRequest } from 'next/server';
import { ExchangeRuleModel } from '@/lib/models/exchange';
import { ActivityModel } from '@/lib/models/activity';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

/**
 * GET /api/activities/exchange - 获取所有可用的兑换规则
 */
export const GET = AuthMiddleware.withAuth(
  async () => {
    try {
      const rules = await ExchangeRuleModel.findActive();
      return ApiResponseFormatter.success(rules);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/activities/exchange');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);

/**
 * POST /api/activities/exchange - 执行物品兑换
 */
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      
      // 验证必需字段
      if (!body.ruleId) {
        return ApiResponseFormatter.badRequest('缺少兑换规则ID');
      }

      const quantity = body.quantity || 1;
      if (quantity <= 0) {
        return ApiResponseFormatter.badRequest('兑换数量必须大于0');
      }

      const result = await ExchangeRuleModel.performExchange(user!.userId, body.ruleId, quantity);
      
      if (!result.success) {
        return ApiResponseFormatter.badRequest(result.message);
      }

      return ApiResponseFormatter.success({
        message: result.message,
        newQuantities: result.newQuantities
      });
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/exchange');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);