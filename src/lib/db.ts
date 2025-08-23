/**
 * 原生PostgreSQL数据库客户端
 * 替代Prisma，避免开发环境中的热重载问题
 */

import { Client, Pool, PoolClient } from 'pg';

// 数据库连接配置
interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  ssl: boolean | { rejectUnauthorized: boolean };
}

// 从环境变量解析数据库连接信息
function parseDatabaseUrl(url: string): DatabaseConfig {
  const urlObj = new URL(url);
  return {
    host: urlObj.hostname,
    port: parseInt(urlObj.port) || 5432,
    user: urlObj.username,
    password: decodeURIComponent(urlObj.password), // 解码URL编码的密码
    database: urlObj.pathname.slice(1), // 移除开头的 '/'
    ssl: urlObj.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false
  };
}

// 数据库连接池
let pool: Pool | null = null;

// 获取数据库连接池
export function getPool(): Pool {
  if (!pool) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const config = parseDatabaseUrl(databaseUrl);
    pool = new Pool({
      ...config,
      max: 10, // 减少最大连接数，适合Supabase
      idleTimeoutMillis: 30000, // 空闲连接超时
      connectionTimeoutMillis: 10000, // 连接超时
      statement_timeout: 30000, // SQL语句超时
      query_timeout: 30000, // 查询超时
    });

    // 处理连接池错误
    pool.on('error', (err) => {
      console.error('Database pool error:', err);
    });
  }

  return pool;
}

// 获取单个数据库连接（带重试机制）
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  let retries = 3;
  
  while (retries > 0) {
    try {
      return await pool.connect();
    } catch (error) {
      retries--;
      console.warn(`Database connection attempt failed, retries left: ${retries}`, error);
      
      if (retries === 0) {
        throw error;
      }
      
      // 等待1秒后重试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('Failed to connect after all retries');
}

// 执行查询
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  let client: PoolClient | null = null;
  try {
    client = await getClient();
    const result = await client.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
}

// 执行单个查询并返回第一行
export async function queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] || null;
}

// 执行事务
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// 关闭连接池
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    // 使用更简单的连接测试
    const pool = getPool();
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1 as test');
      return result.rows[0]?.test === 1;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// 数据库健康检查
export async function getHealthStatus(): Promise<{
  connected: boolean;
  version?: string;
  ssl?: boolean;
  error?: string;
}> {
  try {
    // 获取数据库版本
    const versionResult = await queryOne<{ version: string }>('SELECT version()');
    const version = versionResult?.version;
    
    // 检查SSL连接状态
    const sslResult = await queryOne<{ ssl: boolean }>(`
      SELECT CASE WHEN ssl THEN true ELSE false END as ssl 
      FROM pg_stat_ssl 
      WHERE pid = pg_backend_pid()
    `);
    const ssl = sslResult?.ssl || false;
    
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