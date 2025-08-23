import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

// PUT /api/activities/exchange/rules/[id] - 更新兑换规则
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest) => {
      try {
        const { id } = await params;
        const body = await req.json();
        const { fromQuantity, toQuantity, isActive } = body;

        // 检查兑换规则是否存在
        const existingRule = await prisma.exchangeRule.findUnique({
          where: { id },
          include: {
            fromItem: true,
            toItem: true,
          },
        });

        if (!existingRule) {
          return ApiResponseFormatter.notFound('兑换规则不存在');
        }

        // 构建更新数据
        const updateData: {
          fromQuantity?: number;
          toQuantity?: number;
          isActive?: boolean;
        } = {};
        
        if (typeof fromQuantity === 'number' && fromQuantity > 0) {
          updateData.fromQuantity = fromQuantity;
        }
        
        if (typeof toQuantity === 'number' && toQuantity > 0) {
          updateData.toQuantity = toQuantity;
        }
        
        if (typeof isActive === 'boolean') {
          updateData.isActive = isActive;
        }

        // 如果没有有效的更新数据
        if (Object.keys(updateData).length === 0) {
          return ApiResponseFormatter.badRequest('没有有效的更新数据');
        }

        // 更新兑换规则
        const updatedRule = await prisma.exchangeRule.update({
          where: { id },
          data: updateData,
          include: {
            fromItem: true,
            toItem: true,
          },
        });

        const formattedRule: ExchangeRule = {
          id: updatedRule.id,
          fromItem: {
            id: updatedRule.fromItem.id,
            name: updatedRule.fromItem.name,
            description: updatedRule.fromItem.description || undefined,
            iconUrl: updatedRule.fromItem.iconUrl || undefined,
            isUsable: updatedRule.fromItem.isUsable,
            createdAt: updatedRule.fromItem.createdAt,
          },
          toItem: {
            id: updatedRule.toItem.id,
            name: updatedRule.toItem.name,
            description: updatedRule.toItem.description || undefined,
            iconUrl: updatedRule.toItem.iconUrl || undefined,
            isUsable: updatedRule.toItem.isUsable,
            createdAt: updatedRule.toItem.createdAt,
          },
          fromQuantity: updatedRule.fromQuantity,
          toQuantity: updatedRule.toQuantity,
          isActive: updatedRule.isActive,
        };

        return ApiResponseFormatter.success(formattedRule, '兑换规则更新成功');
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'PUT /api/activities/exchange/rules/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}

// DELETE /api/activities/exchange/rules/[id] - 删除兑换规则
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest) => {
      try {
        const { id } = await params;

        // 检查兑换规则是否存在
        const existingRule = await prisma.exchangeRule.findUnique({
          where: { id },
        });

        if (!existingRule) {
          return ApiResponseFormatter.notFound('兑换规则不存在');
        }

        // 删除兑换规则
        await prisma.exchangeRule.delete({
          where: { id },
        });

        return ApiResponseFormatter.success(null, '兑换规则删除成功');
      } catch (error) {
        const appError = ErrorHandler.handleError(error);
        ErrorHandler.logError(appError, 'DELETE /api/activities/exchange/rules/[id]');
        return ApiResponseFormatter.error(appError);
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}