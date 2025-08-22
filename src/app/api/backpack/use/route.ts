import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ValidationError,
  ErrorHandler 
} from '@/lib/utils';

/**
 * POST /api/backpack/use - 使用背包中的物品
 */
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { itemId, quantity = 1 } = body;

      // 验证必填字段
      if (!itemId) {
        throw new ValidationError('物品ID不能为空');
      }

      // 验证数量
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ValidationError('使用数量必须是正整数');
      }

      // 使用事务确保数据一致性
      const result = await prisma.$transaction(async (tx) => {
        // 查找用户的物品
        const userItem = await tx.userItem.findUnique({
          where: {
            userId_itemId: {
              userId: user!.userId,
              itemId: itemId
            }
          },
          include: {
            item: true
          }
        });

        if (!userItem) {
          throw new ValidationError('物品不存在或不属于当前用户');
        }

        // 检查物品是否可使用
        if (!userItem.item.isUsable) {
          throw new ValidationError('该物品不可使用');
        }

        // 检查数量是否足够
        if (userItem.quantity < quantity) {
          throw new ValidationError(`物品数量不足，当前拥有 ${userItem.quantity} 个`);
        }

        // 减少物品数量
        const updatedUserItem = await tx.userItem.update({
          where: {
            id: userItem.id
          },
          data: {
            quantity: {
              decrement: quantity
            }
          }
        });

        // 记录使用历史
        await tx.usageHistory.create({
          data: {
            userId: user!.userId,
            itemId: itemId,
            quantityUsed: quantity
          }
        });

        return {
          success: true,
          remainingQuantity: updatedUserItem.quantity,
          itemName: userItem.item.name,
          usedQuantity: quantity
        };
      });

      return ApiResponseFormatter.success(result, `成功使用 ${result.usedQuantity} 个 ${result.itemName}`);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/backpack/use');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);