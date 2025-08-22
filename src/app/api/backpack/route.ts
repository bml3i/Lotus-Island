import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ErrorHandler 
} from '@/lib/utils';
import { BackpackItem } from '@/types';

/**
 * GET /api/backpack - 获取用户背包物品列表
 */
export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const userItems = await prisma.userItem.findMany({
        where: {
          userId: user!.userId,
          quantity: {
            gt: 0 // 只返回数量大于0的物品
          }
        },
        include: {
          item: true
        },
        orderBy: [
          {
            item: {
              name: 'asc'
            }
          }
        ]
      });

      const formattedItems: BackpackItem[] = userItems.map(userItem => ({
        id: userItem.id,
        userId: userItem.userId,
        item: {
          id: userItem.item.id,
          name: userItem.item.name,
          description: userItem.item.description || undefined,
          iconUrl: userItem.item.iconUrl || undefined,
          isUsable: userItem.item.isUsable,
          createdAt: userItem.item.createdAt,
        },
        quantity: userItem.quantity,
        updatedAt: userItem.updatedAt,
      }));

      return ApiResponseFormatter.success(formattedItems, '背包物品获取成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/backpack');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);