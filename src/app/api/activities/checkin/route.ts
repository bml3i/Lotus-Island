import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      
      // 检查今日是否已签到
      const existingCheckIn = await prisma.userActivityRecord.findFirst({
        where: {
          userId: user!.userId,
          activity: {
            type: 'checkin'
          },
          recordDate: new Date(today)
        }
      });

      if (existingCheckIn) {
        return ApiResponseFormatter.badRequest('今日已签到，请明天再来');
      }

      // 查找或创建签到活动配置
      let checkInActivity = await prisma.activity.findFirst({
        where: {
          type: 'checkin',
          isActive: true
        }
      });

      if (!checkInActivity) {
        // 创建默认签到活动配置
        checkInActivity = await prisma.activity.create({
          data: {
            name: '每日签到',
            type: 'checkin',
            config: {
              reward: {
                itemName: '莲子',
                quantity: 5
              }
            },
            isActive: true
          }
        });
      }

      // 获取奖励配置
      const config = checkInActivity.config as { reward?: { itemName: string; quantity: number } };
      const rewardConfig = {
        reward: config.reward || {
          itemName: '莲子',
          quantity: 5
        }
      };

      // 查找莲子物品
      let lotusItem = await prisma.item.findFirst({
        where: {
          name: rewardConfig.reward.itemName
        }
      });

      if (!lotusItem) {
        // 创建莲子物品
        lotusItem = await prisma.item.create({
          data: {
            name: rewardConfig.reward.itemName,
            description: '通过签到获得的奖励物品',
            isUsable: false
          }
        });
      }

      // 使用事务执行签到操作
      const result = await prisma.$transaction(async (tx) => {
        // 记录签到
        const checkInRecord = await tx.userActivityRecord.create({
          data: {
            userId: user!.userId,
            activityId: checkInActivity!.id,
            recordDate: new Date(today),
            data: {
              reward: rewardConfig.reward
            }
          }
        });

        // 查找用户的莲子物品记录
        const userLotusItem = await tx.userItem.findUnique({
          where: {
            userId_itemId: {
              userId: user!.userId,
              itemId: lotusItem!.id
            }
          }
        });

        if (userLotusItem) {
          // 更新现有记录
          await tx.userItem.update({
            where: {
              id: userLotusItem.id
            },
            data: {
              quantity: {
                increment: rewardConfig.reward.quantity
              }
            }
          });
        } else {
          // 创建新记录
          await tx.userItem.create({
            data: {
              userId: user!.userId,
              itemId: lotusItem!.id,
              quantity: rewardConfig.reward.quantity
            }
          });
        }

        return {
          checkInRecord,
          reward: rewardConfig.reward
        };
      });

      return ApiResponseFormatter.success({
        success: true,
        reward: result.reward,
        checkInTime: result.checkInRecord.createdAt
      }, `签到成功！获得 ${result.reward.quantity} 个${result.reward.itemName}`);
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/activities/checkin');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true }
);