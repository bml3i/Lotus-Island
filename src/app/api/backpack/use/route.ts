import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { ItemModel } from '@/lib/models/item';
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
      
      // 验证必需字段
      if (!body.itemId) {
        throw new ValidationError('缺少物品ID');
      }

      const quantity = body.quantity || 1;
      if (quantity <= 0) {
        throw new ValidationError('使用数量必须大于0');
      }

      // 检查物品是否存在且可使用
      const item = await ItemModel.findById(body.itemId);
      if (!item) {
        throw new ValidationError('物品不存在');
      }

      if (!item.isUsable) {
        throw new ValidationError('该物品不可使用');
      }

      // 导入 UserItemModel
      const { UserItemModel } = await import('@/lib/models/user-item');
      
      // 使用物品
      await UserItemModel.useItem(user!.userId, body.itemId, quantity);
      
      return ApiResponseFormatter.success({
        message: `成功使用 ${quantity} 个 ${item.name}`,
        itemName: item.name,
        quantityUsed: quantity
      });
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/backpack/use');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);