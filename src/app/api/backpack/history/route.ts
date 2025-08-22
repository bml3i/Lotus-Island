import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const itemId = searchParams.get('itemId');

      // 验证分页参数
      if (page < 1 || limit < 1 || limit > 100) {
        return ApiResponseFormatter.badRequest('分页参数无效');
      }

      const skip = (page - 1) * limit;

      // 构建查询条件
      const whereCondition: {
        userId: string;
        itemId?: string;
      } = {
        userId: user!.userId
      };

      if (itemId) {
        whereCondition.itemId = itemId;
      }

      // 获取使用历史记录
      const [usageHistories, total] = await Promise.all([
        prisma.usageHistory.findMany({
          where: whereCondition,
          include: {
            item: true
          },
          orderBy: {
            usedAt: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.usageHistory.count({
          where: whereCondition
        })
      ]);

      const formattedHistories: UsageHistory[] = usageHistories.map(history => ({
        id: history.id,
        userId: history.userId,
        item: {
          id: history.item.id,
          name: history.item.name,
          description: history.item.description || undefined,
          iconUrl: history.item.iconUrl || undefined,
          isUsable: history.item.isUsable,
          createdAt: history.item.createdAt,
        },
        quantityUsed: history.quantityUsed,
        usedAt: history.usedAt,
      }));

      return ApiResponseFormatter.paginated(
        formattedHistories,
        {
          page,
          limit,
          total
        },
        '使用历史获取成功'
      );
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/backpack/history');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);