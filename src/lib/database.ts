/**
 * 数据库连接配置和工具函数
 * 处理生产环境SSL连接和连接池配置
 */

import { PrismaClient } from '@prisma/client';

// 数据库连接配置
interface DatabaseConfig {
  url: string;
  poolSize: number;
  timeout: number;
  sslMode: string;
}

// 从环境变量获取数据库配置
function getDatabaseConfig(): DatabaseConfig {
  const config: DatabaseConfig = {
    url: process.env.DATABASE_URL || '',
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10'),
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '30000'),
    sslMode: process.env.DATABASE_SSL_MODE || 'require'
  };

  // 验证配置
  if (!config.url) {
    throw new Error('DATABASE_URL 环境变量未设置');
  }

  if (!config.url.includes('postgresql://') && !config.url.includes('postgres://')) {
    throw new Error('DATABASE_URL 必须是有效的 PostgreSQL 连接字符串');
  }

  return config;
}

// 构建带SSL配置的数据库URL
function buildDatabaseUrl(): string {
  const config = getDatabaseConfig();
  let url = config.url;

  // 确保URL包含SSL模式
  if (!url.includes('sslmode=')) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}sslmode=${config.sslMode}`;
  }

  // 添加连接池配置
  if (!url.includes('connection_limit=')) {
    const separator = url.includes('?') ? '&' : '?';
    url += `${separator}connection_limit=${config.poolSize}`;
  }

  // 添加连接超时配置
  if (!url.includes('connect_timeout=')) {
    const separator = url.includes('?') ? '&' : '?';
    const timeoutSeconds = Math.floor(config.timeout / 1000);
    url += `${separator}connect_timeout=${timeoutSeconds}`;
  }

  return url;
}

// 创建 Prisma 客户端实例
function createPrismaClient(): PrismaClient {
  const config = getDatabaseConfig();
  
  return new PrismaClient({
    datasources: {
      db: {
        url: buildDatabaseUrl()
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    errorFormat: 'pretty'
  });
}

// 全局 Prisma 客户端实例
declare global {
  var __prisma: PrismaClient | undefined;
}

// 单例模式的 Prisma 客户端
export const prisma = globalThis.__prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// 数据库连接测试函数
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ 数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    return false;
  }
}

// 数据库健康检查
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  ssl?: boolean;
  error?: string;
}> {
  try {
    await prisma.$connect();
    
    // 获取数据库版本
    const versionResult = await prisma.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const version = versionResult[0]?.version;
    
    // 检查SSL连接状态
    const sslResult = await prisma.$queryRaw<Array<{ ssl: boolean }>>`
      SELECT CASE WHEN ssl THEN true ELSE false END as ssl 
      FROM pg_stat_ssl 
      WHERE pid = pg_backend_pid()
    `;
    const ssl = sslResult[0]?.ssl || false;
    
    return {
      connected: true,
      version,
      ssl
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 优雅关闭数据库连接
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error);
  }
}

// 数据库迁移状态检查
export async function getMigrationStatus(): Promise<{
  applied: number;
  pending: number;
  error?: string;
}> {
  try {
    // 检查迁移表是否存在
    const migrationTable = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '_prisma_migrations'
      ) as exists
    `;
    
    if (!migrationTable[0]?.exists) {
      return { applied: 0, pending: 0, error: '迁移表不存在' };
    }
    
    // 获取已应用的迁移数量
    const appliedMigrations = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "_prisma_migrations" 
      WHERE finished_at IS NOT NULL
    `;
    
    const applied = Number(appliedMigrations[0]?.count || 0);
    
    return { applied, pending: 0 };
  } catch (error) {
    return {
      applied: 0,
      pending: 0,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 导出配置函数供其他模块使用
export { getDatabaseConfig, buildDatabaseUrl };

// 默认导出 Prisma 客户端
export default prisma;