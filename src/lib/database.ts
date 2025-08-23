/**
 * 数据库配置和连接管理
 * 使用原生PostgreSQL客户端替代Prisma
 */

import { getPool, testConnection, getHealthStatus } from './db';
import { getDatabaseEnv, getEnvironmentContext } from './env';

/**
 * 数据库配置接口
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
}

/**
 * 获取数据库配置
 * @returns 数据库配置对象
 */
function getDatabaseConfig(): DatabaseConfig {
  // 从 DATABASE_URL 解析配置
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const url = new URL(databaseUrl);
  
  return {
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    database: url.pathname.slice(1),
    username: url.username,
    password: decodeURIComponent(url.password),
    ssl: url.searchParams.get('sslmode') === 'require'
  };
}

/**
 * 构建数据库连接URL
 * @returns 数据库连接URL字符串
 */
function buildDatabaseUrl(): string {
  const { isBuildTime } = getEnvironmentContext();
  
  // 构建时直接返回环境变量中的URL
  if (isBuildTime) {
    return process.env.DATABASE_URL || '';
  }
  
  // 优先使用环境变量中的完整URL
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // 如果没有完整URL，则从各个组件构建
  const config = getDatabaseConfig();
  const sslParam = config.ssl ? '?sslmode=require' : '';
  
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${sslParam}`;
}

/**
 * 测试数据库连接
 * @returns Promise<boolean> 连接是否成功
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const result = await testConnection();
    if (result) {
      console.log('✅ 数据库连接成功');
    } else {
      console.log('❌ 数据库连接失败');
    }
    return result;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

/**
 * 获取数据库健康状态
 * @returns Promise<object> 数据库健康状态信息
 */
export async function getDatabaseHealthStatus(): Promise<{
  connected: boolean;
  version?: string;
  ssl?: boolean;
  error?: string;
}> {
  return await getHealthStatus();
}

/**
 * 关闭数据库连接
 * @returns Promise<void>
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    const pool = getPool();
    await pool.end();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接失败:', error);
  }
}

// 导出配置函数供其他模块使用
export { getDatabaseConfig, buildDatabaseUrl };