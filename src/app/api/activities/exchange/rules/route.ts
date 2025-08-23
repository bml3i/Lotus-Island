import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

// GET /api/activities/exchange/rules - 获取所有兑换规则（包括禁用的）
export const GET = AuthMiddleware.withAuth(
  async () => {
    try {
      const exchangeRules = await prisma.exchangeRule.findMany({
        include: {
          fromItem: true,
          toItem: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const formattedRules: ExchangeRule[] = exchangeRules.map(rule => ({
        id: rule.id,
        fromItem: {
          id: rule.fromItem.id,
          name: rule.fromItem.name,
          description: rule.fromItem.description || undefined,
          iconUrl: rule.fromItem.iconUrl || undefined,
          isUsable: rule.fromItem.isUsable,
          createdAt: rule.fromItem.createdAt,
        },
        toItem: {
          id: rule.toItem.id,
          name: rule.toItem.name,
          description: rule.toItem.description || undefined,
          iconUrl: rule.toItem.iconUrl || undefined,
          isUsable: rule.toItem.isUsable,
          createdAt: rule.toItem.createdAt,
        },
        fromQuantity: rule.fromQuantity,
        toQuantity: rule.toQuantity,
        isActive: rule.isActive,
      }));

      return ApiResponseFormatter.success(formattedRules, '兑换规则获取成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/activities/exchange/rules');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);

// POST /api/activities/exchange/rules - 创建新的兑换规则
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { fromItemId, toItemId, fromQuantity, toQuantity } = body;

      if (!fromItemId || !toItemId || !fromQuantity || !toQuantity) {
        return ApiResponseFormatter.badRequest('缺少必要参数');
      }

      if (fromQuantity <= 0 || toQuantity <= 0) {
        return ApiResponseFormatter.badRequest('数量必须大于0');
      }

      // 检查物品是否存在
      const [fromItem, toItem] = await Promise.all([
        prisma.item.findUnique({ where: { id: fromItemId } }),
        prisma.item.findUnique({ where: { id: toItemId } }),
      ]);

      if (!fromItem || !toItem) {
        return ApiResponseFormatter.notFound('指定的物品不存在');
      }

      // 检查是否已存在相同的兑换规则
      const existingRule = await prisma.exchangeRule.findFirst({
        where: {
          fromItemId,
          toItemId,
        },
      });

      if (existingRule) {
        return ApiResponseFormatter.conflict('该兑换规则已存在');
      }

      // 创建兑换规则
      const newRule = await prisma.exchangeRule.create({
        data: {
          fromItemId,
          toItemId,
          fromQuantity,
          toQuantity,
          isActive: true,
        },
        include: {
          fromItem: true,
          toItem: true,
        },
      });

      const formattedRule: ExchangeRule = {
        id: newRule.id,
        fromItem: {
          id: newRule.fromItem.id,
          name: newRule.fromItem.name,
          description: newRule.fromItem.description || undefined,
          iconUrl: newRule.fromItem.iconUrl || undefined,
          isUsable: newRule.fromItem.isUsable,
          createdAt: newRule.fromItem.createdAt,
        },
        toItem: {
          id: newRule.toItem.id,
          name: newRule.toItem.name,
          description: newRule.toItem.description || undefined,
          iconUrl: newRule.toItem.iconUrl || undefined,
          isUsable: newRule.toItem.isUsable,
          createdAt: newRule.toItem.createdAt,
        },
        fromQuantity: newRule.fromQuantity,
        toQuantity: newRule.toQuantity,
        isActive: newRule.isActive,
      };

      return ApiResponseFormatter.created(formattedRule, '兑换规则创建成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/exchange/rules');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);