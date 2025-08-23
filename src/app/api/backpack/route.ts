import { NextRequest } from 'next/server';
import { UserItemModel } from '@/lib/models/user-item';
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
      const userItems = await UserItemModel.findByUserId(user!.userId);

      const formattedItems: BackpackItem[] = userItems.map(userItem => ({
        id: userItem.id,
        userId: userItem.userId,
        item: {
          id: userItem.item!.id,
          name: userItem.item!.name,
          description: userItem.item!.description || undefined,
          iconUrl: userItem.item!.iconUrl || undefined,
          isUsable: userItem.item!.isUsable,
          createdAt: new Date(), // 这里需要从item表获取，暂时使用当前时间
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