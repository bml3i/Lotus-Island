import { NextRequest } from 'next/server';
import { UserModel } from '@/lib/models/user';
import { PasswordUtils, TokenUtils, ApiResponseFormatter } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    // 添加调试信息（仅在出错时显示）
    const debugInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 15) || 'undefined',
      timestamp: new Date().toISOString(),
    };

    const body = await request.json();
    const { username, password } = body;

    // 验证输入参数
    if (!username || !password) {
      return ApiResponseFormatter.badRequest('用户名和密码不能为空');
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      return ApiResponseFormatter.badRequest('用户名和密码必须是字符串');
    }

    // 检查数据库连接
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not set:', debugInfo);
      return ApiResponseFormatter.internalServerError('数据库配置错误');
    }

    if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
      console.error('Invalid DATABASE_URL format:', debugInfo);
      return ApiResponseFormatter.internalServerError('数据库连接格式错误');
    }

    // 查找用户
    const user = await UserModel.findByUsername(username);

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
    
    // 如果是Prisma初始化错误，提供更详细的错误信息
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return ApiResponseFormatter.internalServerError('数据库连接配置错误，请检查环境变量');
    }
    
    return ApiResponseFormatter.internalServerError('登录过程中发生错误');
  }
}