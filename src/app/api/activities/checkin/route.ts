import { NextRequest } from 'next/server';
import { ActivityModel, UserActivityRecordModel } from '@/lib/models/activity';
import { ItemModel } from '@/lib/models/item';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  ErrorHandler,
  CommonUtils
} from '@/lib/utils';

/**
 * POST /api/activities/checkin - 执行每日签到
 */
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const today = CommonUtils.formatDate(new Date());
      
      // 查找或创建签到活动配置
      let checkInActivity = await ActivityModel.findFirstByType('checkin');

      if (!checkInActivity) {
        // 创建默认签到活动配置
        checkInActivity = await ActivityModel.create({
          name: '每日签到',
          type: 'checkin',
          config: {
            reward: {
              itemName: '莲子',
              quantity: 5
            }
          },
          isActive: true
        });
      }

      // 检查今日是否已签到
      const existingCheckIn = await UserActivityRecordModel.findTodayRecord(user!.userId, checkInActivity.id);

      if (existingCheckIn) {
        return ApiResponseFormatter.badRequest('今日已签到，请明天再来');
      }

      // 获取奖励配置
      const config = checkInActivity.config as { reward?: { itemName: string; quantity: number } };
      const rewardConfig = {
        reward: config.reward || {
          itemName: '莲子',
          quantity: 5
        }
      };

      // 查找或创建莲子物品
      const lotusItem = await ItemModel.findOrCreate({
        name: rewardConfig.reward.itemName,
        description: '通过签到获得的奖励物品',
        isUsable: false
      });

      // 使用事务执行签到操作
      const result = await UserActivityRecordModel.performCheckIn(
        user!.userId,
        checkInActivity.id,
        lotusItem.id,
        rewardConfig.reward.quantity
      );

      return ApiResponseFormatter.success({
        success: true,
        reward: {
          itemName: rewardConfig.reward.itemName,
          quantity: rewardConfig.reward.quantity
        },
        totalReward: result.totalReward,
        checkInTime: result.record.createdAt
      }, `签到成功！获得 ${rewardConfig.reward.quantity} 个${rewardConfig.reward.itemName}`);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/checkin');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);