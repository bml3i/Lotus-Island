/**
 * 环境变量配置
 * 处理构建时和运行时的环境变量差异
 */

// 检测当前环境
export function getEnvironmentContext() {
  const isBrowser = typeof window !== 'undefined';
  const isVercel = !!process.env.VERCEL;
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
  
  return {
    isBrowser,
    isVercel,
    isProduction,
    isBuildTime,
    isRuntime: !isBuildTime && !isBrowser
  };
}

// 安全获取环境变量
export function getEnvVar(name: string, defaultValue: string = ''): string {
  const { isBuildTime } = getEnvironmentContext();
  
  // 构建时返回默认值，避免验证错误
  if (isBuildTime && !process.env[name]) {
    return defaultValue;
  }
  
  return process.env[name] || defaultValue;
}

// 获取数据库配置
export function getDatabaseEnv() {
  const { isBuildTime, isRuntime } = getEnvironmentContext();
  
  const config = {
    url: getEnvVar('DATABASE_URL'),
    poolSize: parseInt(getEnvVar('DATABASE_POOL_SIZE', '10')),
    timeout: parseInt(getEnvVar('DATABASE_TIMEOUT', '30000')),
    sslMode: getEnvVar('DATABASE_SSL_MODE', 'require')
  };
  
  // 只在运行时验证
  if (isRuntime && config.url) {
    if (!config.url.includes('postgresql://') && !config.url.includes('postgres://')) {
      throw new Error('DATABASE_URL 必须是有效的 PostgreSQL 连接字符串');
    }
  }
  
  return config;
}

// 获取应用配置
export function getAppEnv() {
  return {
    jwtSecret: getEnvVar('JWT_SECRET'),
    nextAuthUrl: getEnvVar('NEXTAUTH_URL'),
    nodeEnv: getEnvVar('NODE_ENV', 'development')
  };
}