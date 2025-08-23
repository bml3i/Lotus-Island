import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  ApiResponseFormatter, 
  AuthMiddleware, 
  PasswordUtils, 
  ValidationError,
  ErrorHandler 
} from '@/lib/utils';
import { User } from '@/types';

/**
 * GET /api/users - 获取用户列表 (仅管理员)
 */
export const GET = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const formattedUsers: User[] = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role as 'admin' | 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return ApiResponseFormatter.success(formattedUsers, '用户列表获取成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'GET /api/users');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);

/**
 * POST /api/users - 创建新用户 (仅管理员)
 */
export const POST = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { username, password, role = 'user' } = body;

      // 验证必填字段
      if (!username || !password) {
        throw new ValidationError('用户名和密码不能为空');
      }

      // 验证用户名长度
      if (username.length < 3 || username.length > 50) {
        throw new ValidationError('用户名长度必须在3-50个字符之间');
      }

      // 验证密码强度
      if (password.length < 6) {
        throw new ValidationError('密码长度不能少于6个字符');
      }

      // 验证角色
      if (!['admin', 'user'].includes(role)) {
        throw new ValidationError('角色必须是admin或user');
      }

      // 存储密码 (明文存储)
      const passwordHash = await PasswordUtils.hashPassword(password);

      // 创建用户
      const newUser = await prisma.user.create({
        data: {
          username,
          passwordHash,
          role,
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      // 为新用户自动分配10个莲子 (需求 2.1)
      await assignInitialLotusSeeds(newUser.id);

      const formattedUser: User = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role as 'admin' | 'user',
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      };

      return ApiResponseFormatter.created(formattedUser, '用户创建成功');
    } catch (error) {
      const appError = ErrorHandler.handleError(error);
      ErrorHandler.logError(appError, 'POST /api/users');
      return ApiResponseFormatter.error(appError);
    }
  },
  { requireAuth: true, requireAdmin: true }
);

/**
 * 为新用户分配初始莲子
 * @param userId 用户ID
 */
async function assignInitialLotusSeeds(userId: string): Promise<void> {
  try {
    // 查找莲子物品
    const lotusItem = await prisma.item.findFirst({
      where: {
        name: '莲子'
      }
    });

    if (!lotusItem) {
      console.warn('莲子物品不存在，跳过初始分配');
      return;
    }

    // 为用户分配10个莲子
    await prisma.userItem.upsert({
      where: {
        userId_itemId: {
          userId,
          itemId: lotusItem.id
        }
      },
      update: {
        quantity: {
          increment: 10
        }
      },
      create: {
        userId,
        itemId: lotusItem.id,
        quantity: 10
      }
    });
  } catch (error) {
    console.error('分配初始莲子失败:', error);
    // 不抛出错误，避免影响用户创建
  }
}