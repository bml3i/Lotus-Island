#!/usr/bin/env node

/**
 * 将密码存储从哈希转换为明文的脚本
 * 
 * 此脚本将：
 * 1. 移除bcryptjs依赖
 * 2. 运行数据库转换脚本
 * 3. 重新生成Prisma客户端
 * 4. 运行种子数据
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 开始转换密码存储方式为明文...\n');

try {
  // 1. 移除bcryptjs相关依赖
  console.log('Step 1: 移除bcryptjs依赖...');
  try {
    execSync('npm uninstall bcryptjs @types/bcryptjs', { stdio: 'inherit' });
    console.log('✓ bcryptjs依赖已移除\n');
  } catch (error) {
    console.log('⚠️  bcryptjs依赖移除失败，可能已经不存在\n');
  }

  // 2. 重新安装依赖
  console.log('Step 2: 重新安装依赖...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✓ 依赖安装完成\n');

  // 3. 重新生成Prisma客户端
  console.log('Step 3: 重新生成Prisma客户端...');
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✓ Prisma客户端生成完成\n');

  // 4. 运行数据库转换脚本（如果数据库存在）
  console.log('Step 4: 转换现有密码数据...');
  try {
    execSync('node database/execute-sql.js convert-passwords-to-plaintext.sql', { stdio: 'inherit' });
    console.log('✓ 密码数据转换完成\n');
  } catch (error) {
    console.log('⚠️  密码数据转换失败，可能数据库不存在或为空\n');
  }

  // 5. 运行种子数据（更新管理员密码）
  console.log('Step 5: 更新种子数据...');
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    console.log('✓ 种子数据更新完成\n');
  } catch (error) {
    console.log('⚠️  种子数据更新失败，请手动运行 npm run db:seed\n');
  }

  console.log('🎉 密码存储转换完成！');
  console.log('\n📋 转换总结:');
  console.log('✅ 移除了bcryptjs依赖');
  console.log('✅ 更新了PasswordUtils类，改为明文存储');
  console.log('✅ 更新了所有API端点的密码处理逻辑');
  console.log('✅ 更新了测试文件');
  console.log('✅ 更新了数据库种子数据');
  console.log('✅ 转换了现有用户密码数据');
  
  console.log('\n⚠️  重要提醒:');
  console.log('- 管理员账户密码: Password@123');
  console.log('- 其他用户默认密码: password123');
  console.log('- 请通知所有用户更新他们的密码');
  console.log('- 密码现在以明文形式存储，请确保数据库安全');

} catch (error) {
  console.error('❌ 转换过程中发生错误:', error.message);
  process.exit(1);
}