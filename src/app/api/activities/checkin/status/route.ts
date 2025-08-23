import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { ActivityModel } from '@/lib/models/activity';
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
      
      // 查找签到活动
      const checkInActivity = await ActivityModel.findFirstByType('checkin');
      
      let todayCheckIn = null;
      if (checkInActivity) {
        // 查找今日签到记录
        const { UserActivityRecordModel } = await import('@/lib/models/activity');
        todayCheckIn = await UserActivityRecordModel.findTodayRecord(user!.userId, checkInActivity.id);
      }

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