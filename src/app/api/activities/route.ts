import { NextRequest } from 'next/server';
import { ActivityModel } from '@/lib/models/activity';
import { AuthMiddleware, ApiResponseFormatter } from '@/lib/utils';

// GET /api/activities - 获取所有活动配置
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let activities;
    if (type) {
      activities = await ActivityModel.findByType(type);
    } else if (includeInactive) {
      activities = await ActivityModel.findAll();
    } else {
      activities = await ActivityModel.findActive();
    }

    return ApiResponseFormatter.success(activities);
  } catch (error) {
    console.error('获取活动列表失败:', error);
    return ApiResponseFormatter.error('获取活动列表失败', 500);
  }
}

// POST /api/activities - 创建新活动配置 (仅管理员)
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user?: { userId: string; username: string; role: string }) => {
    try {
      const body = await request.json();
      const { name, type, config } = body;

      if (!name || !type || !config) {
        return ApiResponseFormatter.badRequest('缺少必要参数');
      }

      const activity = await ActivityModel.create({
        name,
        type,
        config,
        isActive: true
      });

      return ApiResponseFormatter.created(activity);
    } catch (error) {
      console.error('创建活动配置失败:', error);
      return ApiResponseFormatter.error('创建活动配置失败', 500);
    }
  },
  { requireAuth: true, requireAdmin: true }
);