import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordUtils, TokenUtils, ApiResponseFormatter } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 验证输入参数
    if (!username || !password) {
      return ApiResponseFormatter.badRequest('用户名和密码不能为空');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return ApiResponseFormatter.badRequest('用户名和密码必须是字符串');
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return ApiResponseFormatter.unauthorized('用户名或密码错误');
    }

    // 验证密码 (明文比较)
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return ApiResponseFormatter.unauthorized('用户名或密码错误');
    }

    // 生成JWT令牌
    const token = TokenUtils.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    // 返回成功响应
    return ApiResponseFormatter.success({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return ApiResponseFormatter.internalServerError('登录过程中发生错误');
  }
}