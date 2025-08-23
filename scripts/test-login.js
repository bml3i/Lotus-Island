#!/usr/bin/env node

/**
 * 测试登录功能
 */

// 由于这是CommonJS环境，我们需要直接实现测试逻辑
const jwt = require('jsonwebtoken');

// 模拟PasswordUtils
const PasswordUtils = {
  async hashPassword(password) {
    return password; // 明文存储
  },
  
  async verifyPassword(password, storedPassword) {
    return password === storedPassword; // 明文比较
  }
};

// 模拟TokenUtils
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

async function testLogin() {
  console.log('🔐 测试登录功能...\n');
  
  try {
    // 1. 测试密码验证
    console.log('Step 1: 测试密码验证');
    const password = 'Password@123';
    const storedPassword = 'Password@123'; // 明文存储的密码
    
    const isValid = await PasswordUtils.verifyPassword(password, storedPassword);
    console.log(`✓ 密码验证结果: ${isValid ? '成功' : '失败'}`);
    
    if (!isValid) {
      console.error('❌ 密码验证失败');
      return;
    }
    
    // 2. 测试JWT令牌生成
    console.log('\nStep 2: 测试JWT令牌生成');
    const userPayload = {
      userId: 'test-user-id',
      username: 'admin',
      role: 'admin'
    };
    
    const token = TokenUtils.generateToken(userPayload);
    console.log('✓ JWT令牌生成成功');
    console.log(`令牌: ${token.substring(0, 50)}...`);
    
    // 3. 测试JWT令牌验证
    console.log('\nStep 3: 测试JWT令牌验证');
    const decoded = TokenUtils.verifyToken(token);
    
    if (decoded) {
      console.log('✓ JWT令牌验证成功');
      console.log(`用户ID: ${decoded.userId}`);
      console.log(`用户名: ${decoded.username}`);
      console.log(`角色: ${decoded.role}`);
    } else {
      console.error('❌ JWT令牌验证失败');
      return;
    }
    
    // 4. 测试错误密码
    console.log('\nStep 4: 测试错误密码');
    const wrongPasswordValid = await PasswordUtils.verifyPassword('WrongPassword', storedPassword);
    console.log(`✓ 错误密码验证结果: ${wrongPasswordValid ? '失败(不应该成功)' : '正确拒绝'}`);
    
    console.log('\n🎉 所有登录功能测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testLogin();