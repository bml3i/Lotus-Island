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
      const rules = await ExchangeRuleModel.findAll();
      return ApiResponseFormatter.success(rules);
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
      const body = await request.json();
      
      // 验证必需字段
      if (!body.fromItemId || !body.toItemId || !body.fromQuantity || !body.toQuantity) {
        return ApiResponseFormatter.badRequest('缺少必需字段：fromItemId, toItemId, fromQuantity, toQuantity');
      }

      // 验证数量为正数
      if (body.fromQuantity <= 0 || body.toQuantity <= 0) {
        return ApiResponseFormatter.badRequest('兑换数量必须大于0');
      }

      const rule = await ExchangeRuleModel.create({
        fromItemId: body.fromItemId,
        toItemId: body.toItemId,
        fromQuantity: body.fromQuantity,
        toQuantity: body.toQuantity,
        isActive: body.isActive !== false
      });

      return ApiResponseFormatter.success(rule);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/exchange/rules');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);