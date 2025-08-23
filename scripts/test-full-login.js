#!/usr/bin/env node

/**
 * 完整登录流程测试
 */

require('dotenv').config();
const { Client } = require('pg');
const jwt = require('jsonwebtoken');

// 忽略SSL证书验证
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 模拟PasswordUtils和TokenUtils
const PasswordUtils = {
  async hashPassword(password) {
    return password; // 明文存储
  },
  
  async verifyPassword(password, storedPassword) {
    return password === storedPassword; // 明文比较
  }
};

const TokenUtils = {
  generateToken(payload) {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  },
  
  verifyToken(token) {
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
};

async function testFullLogin() {
  console.log('🧪 完整登录流程测试...\n');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    // 1. 连接数据库
    console.log('Step 1: 连接数据库');
    await client.connect();
    console.log('✅ 数据库连接成功\n');
    
    // 2. 模拟登录请求
    console.log('Step 2: 模拟登录请求');
    const username = 'admin';
    const password = 'Password@123';
    
    console.log(`用户名: ${username}`);
    console.log(`密码: ${password}\n`);
    
    // 3. 查找用户
    console.log('Step 3: 查找用户');
    const userQuery = `
      SELECT id, username, password_hash, role, created_at, updated_at
      FROM users 
      WHERE username = $1
    `;
    
    const userResult = await client.query(userQuery, [username]);
    
    if (userResult.rows.length === 0) {
      console.log('❌ 用户不存在');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('✅ 用户找到');
    console.log(`用户ID: ${user.id}`);
    console.log(`存储密码: ${user.password_hash}\n`);
    
    // 4. 验证密码
    console.log('Step 4: 验证密码');
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password_hash);
    console.log(`密码验证结果: ${isPasswordValid ? '✅ 成功' : '❌ 失败'}\n`);
    
    if (!isPasswordValid) {
      console.log('❌ 登录失败：密码错误');
      return;
    }
    
    // 5. 生成JWT令牌
    console.log('Step 5: 生成JWT令牌');
    const token = TokenUtils.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });
    
    console.log('✅ JWT令牌生成成功');
    console.log(`令牌: ${token.substring(0, 50)}...\n`);
    
    // 6. 验证JWT令牌
    console.log('Step 6: 验证JWT令牌');
    const decoded = TokenUtils.verifyToken(token);
    
    if (decoded) {
      console.log('✅ JWT令牌验证成功');
      console.log(`解码用户ID: ${decoded.userId}`);
      console.log(`解码用户名: ${decoded.username}`);
      console.log(`解码角色: ${decoded.role}\n`);
    } else {
      console.log('❌ JWT令牌验证失败\n');
      return;
    }
    
    // 7. 构建响应
    console.log('Step 7: 构建登录响应');
    const loginResponse = {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      }
    };
    
    console.log('✅ 登录响应构建成功');
    console.log('响应数据:', JSON.stringify(loginResponse, null, 2));
    
    console.log('\n🎉 完整登录流程测试成功！');
    console.log('\n📋 测试结果总结:');
    console.log('✅ 数据库连接正常');
    console.log('✅ 用户查找成功');
    console.log('✅ 密码验证成功');
    console.log('✅ JWT令牌生成成功');
    console.log('✅ JWT令牌验证成功');
    console.log('✅ 响应构建成功');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    await client.end();
    console.log('\n数据库连接已关闭');
  }
}

testFullLogin();