import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ErrorHandler,
  CommonUtils
} from '@/lib/utils';

/**
 * GET /api/activities/checkin/status - 获取用户签到状态
 */
export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const today = CommonUtils.formatDate(new Date());
      
      // 查找今日签到记录
      const todayCheckIn = await prisma.userActivityRecord.findFirst({
        where: {
          userId: user!.userId,
          activity: {
            type: 'checkin'
          },
          recordDate: new Date(today)
        },
        include: {
          activity: true
        }
      });

      const canCheckIn = !todayCheckIn;
      const lastCheckIn = todayCheckIn?.createdAt || null;

      return ApiResponseFormatter.success({
        canCheckIn,
        lastCheckIn,
        hasCheckedInToday: !!todayCheckIn
      }, '签到状态获取成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/activities/checkin/status');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);