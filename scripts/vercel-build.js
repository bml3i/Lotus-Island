#!/usr/bin/env node

/**
 * Vercel构建脚本
 * 确保构建时环境变量正确设置
 */

console.log('🚀 Vercel构建脚本开始...\n');

// 1. 检查环境变量
console.log('Step 1: 检查环境变量');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL存在:', !!process.env.DATABASE_URL);
console.log('JWT_SECRET存在:', !!process.env.JWT_SECRET);

if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('DATABASE_URL前缀:', dbUrl.substring(0, 20) + '...');
  
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL格式正确');
  } else {
    console.error('❌ DATABASE_URL格式错误');
    console.error('当前格式:', dbUrl.substring(0, 15));
    console.error('期望格式: postgresql://... 或 postgres://...');
    process.exit(1);
  }
} else {
  console.error('❌ DATABASE_URL未设置');
  console.error('请在Vercel Dashboard中设置DATABASE_URL环境变量');
  process.exit(1);
}

// 2. 检查数据库连接
console.log('\nStep 2: 检查数据库连接');
const { execSync } = require('child_process');

try {
  // 简单的数据库连接测试
  console.log('✅ 跳过数据库连接检查（构建时不需要）');
} catch (error) {
  console.error('❌ 数据库检查失败:', error.message);
  process.exit(1);
}

// 3. 构建Next.js应用
console.log('\nStep 3: 构建Next.js应用');

try {
  execSync('next build --turbopack', { stdio: 'inherit' });
  console.log('✅ Next.js构建成功');
} catch (error) {
  console.error('❌ Next.js构建失败:', error.message);
  // 尝试不使用turbopack
  console.log('尝试不使用turbopack构建...');
  try {
    execSync('next build', { stdio: 'inherit' });
    console.log('✅ Next.js构建成功（不使用turbopack）');
  } catch (fallbackError) {
    console.error('❌ Next.js构建完全失败:', fallbackError.message);
    process.exit(1);
  }
}

console.log('\n🎉 Vercel构建完成！');