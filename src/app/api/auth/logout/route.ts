import { ApiResponseFormatter, AuthMiddleware } from '@/lib/utils';

export const POST = AuthMiddleware.withAuth(
  async () => {
    try {
      // 由于JWT是无状态的，我们只需要返回成功响应
      // 客户端需要删除本地存储的令牌
      return ApiResponseFormatter.success({
        message: '登出成功'
      });
    } catch (error) {
      console.error('Logout error:', error);
      return ApiResponseFormatter.internalServerError('登出过程中发生错误');
    }
  },
  { requireAuth: true }
);