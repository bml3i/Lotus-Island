#!/usr/bin/env node

/**
 * 数据库连接诊断脚本
 * 用于调试Vercel部署中的数据库连接问题
 */

console.log('🔍 数据库连接诊断开始...\n');

// 1. 检查环境变量
console.log('Step 1: 检查环境变量');
console.log('NODE_ENV:', process.env.NODE_ENV || 'undefined');
console.log('DATABASE_URL存在:', !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL长度:', dbUrl.length);
  console.log('DATABASE_URL前缀:', dbUrl.substring(0, 20) + '...');
  
  // 检查URL格式
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL格式正确');
  } else {
    console.log('❌ DATABASE_URL格式错误 - 必须以 postgresql:// 或 postgres:// 开头');
    console.log('当前开头:', dbUrl.substring(0, 15));
  }
} else {
  console.log('❌ DATABASE_URL未设置');
}

console.log('\nStep 2: 测试数据库连接');

try {
  // 尝试使用Prisma连接
  const { PrismaClient } = require('@prisma/client');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  console.log('正在尝试连接数据库...');
  
  // 简单的连接测试
  prisma.$connect()
    .then(() => {
      console.log('✅ Prisma连接成功');
      return prisma.user.count();
    })
    .then((count) => {
      console.log(`✅ 用户数量查询成功: ${count} 个用户`);
      return prisma.$disconnect();
    })
    .then(() => {
      console.log('✅ 数据库连接测试完成');
    })
    .catch((error) => {
      console.error('❌ Prisma连接失败:', error.message);
      console.error('错误详情:', error);
    });
    
} catch (error) {
  console.error('❌ 无法加载Prisma客户端:', error.message);
}

// 3. 检查其他相关环境变量
console.log('\nStep 3: 检查其他环境变量');
console.log('JWT_SECRET存在:', !!process.env.JWT_SECRET);
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'undefined');

// 4. 输出系统信息
console.log('\nStep 4: 系统信息');
console.log('Node.js版本:', process.version);
console.log('平台:', process.platform);
console.log('架构:', process.arch);

console.log('\n🔍 诊断完成');