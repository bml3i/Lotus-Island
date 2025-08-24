import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { ItemModel } from '@/lib/models/item';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ErrorHandler 
} from '@/lib/utils';
import { UsageHistory } from '@/types';

/**
 * GET /api/backpack/history - 获取用户物品使用历史
 */
export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get('limit') || '20');
      const page = parseInt(searchParams.get('page') || '1');
      const offset = (page - 1) * limit;
      const itemId = searchParams.get('itemId') || undefined;

      // 导入 UserItemModel
      const { UserItemModel } = await import('@/lib/models/user-item');
      
      const result = await UserItemModel.getUsageHistory(user!.userId, limit, offset, itemId);
      
      // 计算分页信息
      const totalPages = Math.ceil(result.total / limit);
      
      // 构建响应
      const response = {
        success: true,
        data: result.histories,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages
        },
        statusCode: 200,
        timestamp: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/backpack/history');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);