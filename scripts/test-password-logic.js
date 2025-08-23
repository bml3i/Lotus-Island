#!/usr/bin/env node

/**
 * 测试密码验证逻辑
 */

// 模拟PasswordUtils
const PasswordUtils = {
  async hashPassword(password) {
    return password; // 明文存储
  },
  
  async verifyPassword(password, storedPassword) {
    return password === storedPassword; // 明文比较
  }
};

async function testPasswordLogic() {
  console.log('🔐 测试密码验证逻辑...\n');
  
  // 测试场景1：正确密码
  console.log('测试1: 正确密码');
  const correctPassword = 'Password@123';
  const storedPassword = 'Password@123';
  
  const result1 = await PasswordUtils.verifyPassword(correctPassword, storedPassword);
  console.log(`输入密码: "${correctPassword}"`);
  console.log(`存储密码: "${storedPassword}"`);
  console.log(`验证结果: ${result1 ? '✅ 成功' : '❌ 失败'}\n`);
  
  // 测试场景2：错误密码
  console.log('测试2: 错误密码');
  const wrongPassword = 'password';
  
  const result2 = await PasswordUtils.verifyPassword(wrongPassword, storedPassword);
  console.log(`输入密码: "${wrongPassword}"`);
  console.log(`存储密码: "${storedPassword}"`);
  console.log(`验证结果: ${result2 ? '❌ 不应该成功' : '✅ 正确拒绝'}\n`);
  
  // 测试场景3：空密码
  console.log('测试3: 空密码');
  const emptyPassword = '';
  
  const result3 = await PasswordUtils.verifyPassword(emptyPassword, storedPassword);
  console.log(`输入密码: "${emptyPassword}"`);
  console.log(`存储密码: "${storedPassword}"`);
  console.log(`验证结果: ${result3 ? '❌ 不应该成功' : '✅ 正确拒绝'}\n`);
  
  // 总结
  console.log('📋 测试总结:');
  console.log(`正确密码验证: ${result1 ? '✅' : '❌'}`);
  console.log(`错误密码拒绝: ${!result2 ? '✅' : '❌'}`);
  console.log(`空密码拒绝: ${!result3 ? '✅' : '❌'}`);
  
  if (result1 && !result2 && !result3) {
    console.log('\n🎉 所有密码验证逻辑测试通过！');
  } else {
    console.log('\n❌ 密码验证逻辑存在问题');
  }
}

testPasswordLogic();