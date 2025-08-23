#!/usr/bin/env node

/**
 * 测试本地登录功能
 */

require('dotenv').config();

async function testLocalLogin() {
  console.log('🧪 测试本地登录功能...\n');
  
  try {
    // 模拟登录请求
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Password@123'
      })
    });
    
    const data = await response.json();
    
    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('\n✅ 本地登录测试成功！');
      console.log('令牌:', data.data.token.substring(0, 50) + '...');
      console.log('用户信息:', data.data.user);
    } else {
      console.log('\n❌ 本地登录测试失败');
      console.log('错误:', data.error || '未知错误');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n💡 请确保本地服务器正在运行: npm run dev');
  }
}

testLocalLogin();