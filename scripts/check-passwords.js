#!/usr/bin/env node

const { Client } = require('pg');
require('dotenv').config();

async function checkPasswords() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('数据库连接成功\n');
    
    const result = await client.query(`
      SELECT 
        username,
        role,
        password_hash,
        CASE 
          WHEN password_hash LIKE '$%' THEN '哈希密码'
          ELSE '明文密码'
        END as password_type
      FROM users 
      ORDER BY username
    `);
    
    console.log('用户密码检查:');
    console.log('================');
    
    if (result.rows.length === 0) {
      console.log('没有找到用户数据');
    } else {
      result.rows.forEach(user => {
        console.log(`用户名: ${user.username}`);
        console.log(`角色: ${user.role}`);
        console.log(`密码: ${user.password_hash}`);
        console.log(`类型: ${user.password_type}`);
        console.log('----------------');
      });
    }
    
  } catch (error) {
    console.error('检查失败:', error.message);
  } finally {
    await client.end();
    console.log('\n数据库连接已关闭');
  }
}

// 忽略SSL证书验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

checkPasswords();