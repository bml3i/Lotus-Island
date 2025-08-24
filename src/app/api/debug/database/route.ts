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

  const debugInfo: Record<string, unknown> = {
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
    const { testConnection, getHealthStatus } = await import('@/lib/db');

    const databaseConnection: Record<string, unknown> = {
      nativeClientCreated: true,
    };

    try {
      const connected = await testConnection();
      databaseConnection.connected = connected;

      if (connected) {
        // 获取健康状态
        const health = await getHealthStatus();
        databaseConnection.health = health;

        // 尝试简单查询
        const { UserModel } = await import('@/lib/models/user');
        const users = await UserModel.findAll();
        const userCount = users.length;
        databaseConnection.userCount = userCount;
        databaseConnection.querySuccess = true;

        // 连接会自动释放
      }
    } catch (connectionError: unknown) {
      databaseConnection.connected = false;
      databaseConnection.error = connectionError instanceof Error ? connectionError.message : 'Unknown error';
      databaseConnection.errorCode = (connectionError as { code?: string }).code;
    }

    debugInfo.databaseConnection = databaseConnection;

  } catch (prismaError: unknown) {
    debugInfo.databaseConnection = {
      prismaClientCreated: false,
      error: prismaError instanceof Error ? prismaError.message : 'Unknown error',
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
    const { UserModel } = await import('@/lib/models/user');
    
    const user = await UserModel.findByUsername(username);

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        debug: { username, userExists: false }
      });
    }

    // 验证密码（明文比较）
    const isPasswordValid = password === user.passwordHash;

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

  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: { errorType: error instanceof Error ? error.constructor.name : 'Unknown' }
    }, { status: 500 });
  }
}