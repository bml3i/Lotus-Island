import { NextRequest, NextResponse } from 'next/server';

/**
 * 数据库连接调试API
 * 仅在开发环境或特定条件下可用
 */
export async function GET(request: NextRequest) {
  // 安全检查：只在开发环境或有特定查询参数时允许访问
  const { searchParams } = new URL(request.url);
  const debugKey = searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'lotus-debug-2025') {
    return NextResponse.json(
      { error: 'Debug endpoint not available' },
      { status: 403 }
    );
  }

  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  // 检查环境变量（不暴露敏感信息）
  debugInfo.envCheck = {
    DATABASE_URL_exists: !!process.env.DATABASE_URL,
    DATABASE_URL_length: process.env.DATABASE_URL?.length || 0,
    DATABASE_URL_prefix: process.env.DATABASE_URL?.substring(0, 15) || 'undefined',
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'undefined',
  };

  // 检查DATABASE_URL格式
  if (process.env.DATABASE_URL) {
    const dbUrl = process.env.DATABASE_URL;
    debugInfo.databaseUrlCheck = {
      startsWithPostgresql: dbUrl.startsWith('postgresql://'),
      startsWithPostgres: dbUrl.startsWith('postgres://'),
      isValidFormat: dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'),
    };
  }

  // 尝试连接数据库
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      log: ['error'],
    });

    debugInfo.databaseConnection = {
      prismaClientCreated: true,
    };

    try {
      await prisma.$connect();
      debugInfo.databaseConnection.connected = true;

      // 尝试简单查询
      const userCount = await prisma.user.count();
      debugInfo.databaseConnection.userCount = userCount;
      debugInfo.databaseConnection.querySuccess = true;

      await prisma.$disconnect();
    } catch (connectionError: any) {
      debugInfo.databaseConnection.connected = false;
      debugInfo.databaseConnection.error = connectionError.message;
      debugInfo.databaseConnection.errorCode = connectionError.code;
    }

  } catch (prismaError: any) {
    debugInfo.databaseConnection = {
      prismaClientCreated: false,
      error: prismaError.message,
    };
  }

  return NextResponse.json(debugInfo, { status: 200 });
}

/**
 * 测试登录功能
 */
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const debugKey = searchParams.get('key');
  
  if (process.env.NODE_ENV === 'production' && debugKey !== 'lotus-debug-2025') {
    return NextResponse.json(
      { error: 'Debug endpoint not available' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      );
    }

    // 尝试查找用户
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: { username, userExists: false }
      });
    }

    // 验证密码（明文比较）
    const isPasswordValid = password === user.passwordHash;

    await prisma.$disconnect();

    return NextResponse.json({
      success: isPasswordValid,
      debug: {
        username,
        userExists: true,
        passwordMatch: isPasswordValid,
        storedPassword: user.passwordHash, // 仅调试时显示
        providedPassword: password, // 仅调试时显示
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      debug: { errorType: error.constructor.name }
    }, { status: 500 });
  }
}