#!/usr/bin/env node

/**
 * Vercel环境变量修复脚本
 * 用于确保Vercel部署时的环境变量格式正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Vercel环境变量修复脚本\n');

// 1. 检查并创建 .env.local 文件（Vercel会优先使用）
const envLocalPath = path.join(process.cwd(), '.env.local');
const envProductionPath = path.join(process.cwd(), '.env.production');

console.log('Step 1: 检查环境变量文件');

if (fs.existsSync(envProductionPath)) {
  console.log('✅ 找到 .env.production 文件');
  
  // 读取生产环境配置
  const productionEnv = fs.readFileSync(envProductionPath, 'utf8');
  console.log('✅ 读取生产环境配置成功');
  
  // 创建或更新 .env.local
  fs.writeFileSync(envLocalPath, productionEnv);
  console.log('✅ 创建/更新 .env.local 文件');
  
} else {
  console.log('❌ 未找到 .env.production 文件');
}

// 2. 验证DATABASE_URL格式
console.log('\nStep 2: 验证DATABASE_URL格式');

require('dotenv').config({ path: envLocalPath });

const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
  console.log('✅ DATABASE_URL已设置');
  
  if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    console.log('✅ DATABASE_URL格式正确');
  } else {
    console.log('❌ DATABASE_URL格式错误');
    
    // 尝试修复格式
    let fixedUrl = databaseUrl;
    if (databaseUrl.startsWith('postgres:')) {
      fixedUrl = databaseUrl.replace('postgres:', 'postgresql:');
      console.log('🔧 尝试修复: postgres: -> postgresql:');
    }
    
    console.log('修复后的URL:', fixedUrl.substring(0, 30) + '...');
  }
} else {
  console.log('❌ DATABASE_URL未设置');
}

// 3. 创建Vercel环境变量配置指南
const vercelEnvGuide = `
# Vercel环境变量配置指南

## 在Vercel Dashboard中设置以下环境变量：

### 1. DATABASE_URL
值: postgresql://postgres.djhizndqdpxedwfasypi:Lotus@123@aws-1-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
环境: Production, Preview, Development

### 2. JWT_SECRET  
值: lotus-island-production-jwt-secret-02
环境: Production, Preview, Development

### 3. NEXTAUTH_URL
值: https://your-app-name.vercel.app
环境: Production, Preview
值: http://localhost:3000
环境: Development

## 设置步骤：
1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings -> Environment Variables
4. 添加上述环境变量
5. 重新部署项目

## 注意事项：
- DATABASE_URL必须以 postgresql:// 开头
- 确保所有特殊字符都正确编码
- JWT_SECRET在生产环境中应该使用强密钥
- NEXTAUTH_URL应该匹配你的实际域名
`;

fs.writeFileSync(path.join(process.cwd(), 'VERCEL_ENV_GUIDE.md'), vercelEnvGuide);
console.log('\n✅ 创建Vercel环境变量配置指南: VERCEL_ENV_GUIDE.md');

console.log('\n🔧 修复脚本完成');
console.log('\n📋 下一步操作：');
console.log('1. 检查 VERCEL_ENV_GUIDE.md 文件');
console.log('2. 在Vercel Dashboard中设置环境变量');
console.log('3. 重新部署项目');
console.log('4. 运行诊断脚本验证: node scripts/diagnose-database.js');