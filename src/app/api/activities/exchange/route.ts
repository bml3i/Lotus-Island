import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiResponseFormatter, AuthMiddleware, ErrorHandler } from '@/lib/utils';
import { ExchangeRule } from '@/types';

// GET /api/activities/exchange - 获取所有兑换规则
export const GET = AuthMiddleware.withAuth(
  async () => {
    try {
      const exchangeRules = await prisma.exchangeRule.findMany({
        where: {
          isActive: true,
        },
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
      ErrorHandler.logError(appError, 'GET /api/activities/exchange');
      return ApiResponseFormatter.error(appError);
    }
  }
);

// POST /api/activities/exchange - 执行兑换操作
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { exchangeRuleId, quantity = 1 } = body;

      if (!exchangeRuleId || typeof quantity !== 'number' || quantity <= 0) {
        return ApiResponseFormatter.badRequest('无效的兑换参数');
      }

      // 获取兑换规则
      const exchangeRule = await prisma.exchangeRule.findFirst({
        where: {
          id: exchangeRuleId,
          isActive: true,
        },
        include: {
          fromItem: true,
          toItem: true,
        },
      });

      if (!exchangeRule) {
        return ApiResponseFormatter.notFound('兑换规则不存在或已禁用');
      }

      // 计算需要的源物品数量
      const requiredFromQuantity = exchangeRule.fromQuantity * quantity;
      const rewardToQuantity = exchangeRule.toQuantity * quantity;

      // 检查用户是否有足够的源物品
      const userFromItem = await prisma.userItem.findFirst({
        where: {
          userId: user!.userId,
          itemId: exchangeRule.fromItemId,
        },
      });

      if (!userFromItem || userFromItem.quantity < requiredFromQuantity) {
        return ApiResponseFormatter.badRequest(
          `${exchangeRule.fromItem.name}数量不足，需要${requiredFromQuantity}个，当前只有${userFromItem?.quantity || 0}个`
        );
      }

      // 执行兑换操作（使用事务确保数据一致性）
      const result = await prisma.$transaction(async (tx) => {
        // 扣除源物品
        await tx.userItem.update({
          where: {
            id: userFromItem.id,
          },
          data: {
            quantity: userFromItem.quantity - requiredFromQuantity,
          },
        });

        // 增加目标物品
        const userToItem = await tx.userItem.findFirst({
          where: {
            userId: user!.userId,
            itemId: exchangeRule.toItemId,
          },
        });

        if (userToItem) {
          // 更新现有物品数量
          await tx.userItem.update({
            where: {
              id: userToItem.id,
            },
            data: {
              quantity: userToItem.quantity + rewardToQuantity,
            },
          });
        } else {
          // 创建新的用户物品记录
          await tx.userItem.create({
            data: {
              userId: user!.userId,
              itemId: exchangeRule.toItemId,
              quantity: rewardToQuantity,
            },
          });
        }

        return {
          fromItem: exchangeRule.fromItem.name,
          toItem: exchangeRule.toItem.name,
          fromQuantity: requiredFromQuantity,
          toQuantity: rewardToQuantity,
        };
      });

      return ApiResponseFormatter.success(
        result,
        `成功兑换！消耗${result.fromQuantity}个${result.fromItem}，获得${result.toQuantity}个${result.toItem}`
      );
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/exchange');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);