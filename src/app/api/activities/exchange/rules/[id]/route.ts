import { NextRequest } from 'next/server';
import { ExchangeRuleModel } from '@/lib/models/exchange';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

/**
 * PUT /api/activities/exchange/rules/[id] - 更新兑换规则 (管理员)
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
        
        // 验证输入
        const updateData: any = {};
        if (body.fromQuantity !== undefined) {
          if (body.fromQuantity <= 0) {
            return ApiResponseFormatter.badRequest('源物品数量必须大于0');
          }
          updateData.fromQuantity = body.fromQuantity;
        }
        
        if (body.toQuantity !== undefined) {
          if (body.toQuantity <= 0) {
            return ApiResponseFormatter.badRequest('目标物品数量必须大于0');
          }
          updateData.toQuantity = body.toQuantity;
        }
        
        if (body.isActive !== undefined) {
          updateData.isActive = body.isActive;
        }

        const updatedRule = await ExchangeRuleModel.update(id, updateData);
        
        return ApiResponseFormatter.success(updatedRule);
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'PUT /api/activities/exchange/rules/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}

/**
 * DELETE /api/activities/exchange/rules/[id] - 删除兑换规则 (管理员)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;
        
        await ExchangeRuleModel.delete(id);
        
        return ApiResponseFormatter.success({ message: '兑换规则删除成功' });
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'DELETE /api/activities/exchange/rules/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}