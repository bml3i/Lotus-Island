import { NextRequest } from 'next/server';
import { ActivityModel } from '@/lib/models/activity';
import { AuthMiddleware, ApiResponseFormatter } from '@/lib/utils';

// GET /api/activities/[id] - 获取特定活动配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await ActivityModel.findById(id);

    if (!activity) {
      return ApiResponseFormatter.notFound('活动不存在');
    }

    return ApiResponseFormatter.success(activity);
  } catch (error) {
    console.error('获取活动配置失败:', error);
    return ApiResponseFormatter.internalServerError('获取活动配置失败');
  }
}

// PUT /api/activities/[id] - 更新活动配置 (仅管理员)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;
        const body = await req.json();
        const { name, type, config, isActive } = body;

        const updateData: Record<string, unknown> = {};
        if (name) updateData.name = name;
        if (type) updateData.type = type;
        if (config) updateData.config = config;
        if (typeof isActive === 'boolean') updateData.is_active = isActive;

        const activity = await ActivityModel.update(id, updateData);

        if (!activity) {
          return ApiResponseFormatter.notFound('活动不存在');
        }

        return ApiResponseFormatter.success(activity);
      } catch (error) {
        console.error('更新活动配置失败:', error);
        return ApiResponseFormatter.internalServerError('更新活动配置失败');
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}

// DELETE /api/activities/[id] - 删除活动配置 (仅管理员)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return AuthMiddleware.withAuth(
    async (req: NextRequest, user) => {
      try {
        const { id } = await params;

        // 先检查活动是否存在
        const activity = await ActivityModel.findById(id);
        if (!activity) {
          return ApiResponseFormatter.notFound('活动不存在');
        }

        await ActivityModel.delete(id);
        return ApiResponseFormatter.success({ message: '活动配置已删除' });
      } catch (error) {
        console.error('删除活动配置失败:', error);
        return ApiResponseFormatter.internalServerError('删除活动配置失败');
      }
    },
    { requireAuth: true, requireAdmin: true }
  )(request);
}