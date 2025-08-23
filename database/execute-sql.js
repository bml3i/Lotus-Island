const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// 数据库连接配置
require('dotenv').config();
const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function executeSqlFile(filename) {
  try {
    console.log(`正在执行 ${filename}...`);
    
    // 连接数据库
    await client.connect();
    console.log('数据库连接成功');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, filename);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // 分割SQL语句并逐个执行
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          const result = await client.query(statement);
          
          // 如果是SELECT语句，显示结果
          if (statement.toUpperCase().startsWith('SELECT')) {
            console.log(`\n查询结果 ${i + 1}:`);
            if (result.rows && result.rows.length > 0) {
              console.table(result.rows);
            } else {
              console.log('没有找到数据');
            }
          }
        } catch (error) {
          // 忽略一些预期的错误（如DROP TABLE IF EXISTS）
          if (!error.message.includes('does not exist')) {
            console.error(`语句 ${i + 1} 执行失败:`, error.message);
          }
        }
      }
    }
    
    console.log('SQL执行完成');
    
  } catch (error) {
    console.error('执行失败:', error.message);
  } finally {
    // 关闭连接
    await client.end();
    console.log('数据库连接已关闭');
  }
}

// 获取命令行参数
const filename = process.argv[2] || 'init.sql';

// 执行SQL文件
executeSqlFile(filename);