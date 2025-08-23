import { Client } from 'pg';

// 从环境变量解析数据库连接信息
function parseDatabaseUrl(url: string) {
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

export async function createPgClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL not found');
  }

  const config = parseDatabaseUrl(databaseUrl);
  const client = new Client(config);
  
  await client.connect();
  return client;
}

export async function queryUser(username: string) {
  const client = await createPgClient();
  
  try {
    const result = await client.query(
      'SELECT id, username, password_hash, role, created_at, updated_at FROM users WHERE username = $1 LIMIT 1',
      [username]
    );
    
    return result.rows[0] || null;
  } finally {
    await client.end();
  }
}