#!/usr/bin/env node

/**
 * 部署验证脚本
 * 验证莲花岛系统部署是否成功
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// HTTP 请求函数
function makeRequest(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, { timeout }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    req.on('error', (error) => {
      reject(error);
    });
  });
}

// 验证数据库连接
async function verifyDatabase() {
  logInfo('验证数据库连接...');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // 测试连接
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    
    // 检查表是否存在
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    logSuccess(`数据库连接正常，共 ${tables.length} 个表`);
    
    // 检查基础数据
    const userCount = await prisma.user.count();
    const itemCount = await prisma.item.count();
    const activityCount = await prisma.activity.count();
    
    logInfo(`数据统计: ${userCount} 个用户, ${itemCount} 个物品, ${activityCount} 个活动`);
    
    await prisma.$disconnect();
    return true;
    
  } catch (error) {
    logError(`数据库验证失败: ${error.message}`);
    return false;
  }
}

// 验证 API 端点
async function verifyApiEndpoints() {
  logInfo('验证 API 端点...');
  
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const endpoints = [
    { path: '/api/health', name: '健康检查' },
    { path: '/api/auth/login', name: '登录接口', method: 'POST' }
  ];
  
  let successCount = 0;
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint.path}`;
      logInfo(`测试 ${endpoint.name}: ${url}`);
      
      const response = await makeRequest(url);
      
      if (response.status < 500) {
        logSuccess(`${endpoint.name} 响应正常 (${response.status})`);
        successCount++;
      } else {
        logError(`${endpoint.name} 服务器错误 (${response.status})`);
      }
      
    } catch (error) {
      logError(`${endpoint.name} 请求失败: ${error.message}`);
    }
  }
  
  return successCount === endpoints.length;
}

// 验证环境变量
function verifyEnvironment() {
  logInfo('验证环境变量...');
  
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const optionalVars = [
    'NEXTAUTH_URL',
    'DATABASE_POOL_SIZE',
    'DATABASE_TIMEOUT',
    'DATABASE_SSL_MODE'
  ];
  
  let allRequired = true;
  
  // 检查必需变量
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      logSuccess(`${varName}: 已设置`);
    } else {
      logError(`${varName}: 未设置`);
      allRequired = false;
    }
  }
  
  // 检查可选变量
  for (const varName of optionalVars) {
    if (process.env[varName]) {
      logInfo(`${varName}: ${process.env[varName]}`);
    } else {
      log(`${varName}: 使用默认值`, 'yellow');
    }
  }
  
  return allRequired;
}

// 验证构建产物
function verifyBuild() {
  logInfo('验证构建产物...');
  
  const fs = require('fs');
  const path = require('path');
  
  const buildPaths = [
    '.next',
    '.next/static',
    'node_modules/@prisma/client'
  ];
  
  let allExists = true;
  
  for (const buildPath of buildPaths) {
    if (fs.existsSync(buildPath)) {
      logSuccess(`${buildPath}: 存在`);
    } else {
      logError(`${buildPath}: 不存在`);
      allExists = false;
    }
  }
  
  return allExists;
}

// 主验证流程
async function verify() {
  log('🔍 开始部署验证', 'cyan');
  log('='.repeat(50), 'blue');
  
  const checks = [
    { name: '环境变量', fn: verifyEnvironment },
    { name: '构建产物', fn: verifyBuild },
    { name: '数据库连接', fn: verifyDatabase },
    { name: 'API 端点', fn: verifyApiEndpoints }
  ];
  
  let passedChecks = 0;
  
  for (const check of checks) {
    log(`\n📋 ${check.name}`, 'cyan');
    log('-'.repeat(30), 'blue');
    
    try {
      const result = await check.fn();
      if (result) {
        logSuccess(`${check.name} 验证通过`);
        passedChecks++;
      } else {
        logError(`${check.name} 验证失败`);
      }
    } catch (error) {
      logError(`${check.name} 验证出错: ${error.message}`);
    }
  }
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (passedChecks === checks.length) {
    logSuccess(`🎉 所有验证通过 (${passedChecks}/${checks.length})`);
    log('莲花岛系统部署成功！', 'green');
    return true;
  } else {
    logError(`❌ 验证失败 (${passedChecks}/${checks.length})`);
    log('请检查失败的项目并重新部署', 'red');
    return false;
  }
}

// 运行验证
if (require.main === module) {
  verify()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      logError(`验证过程出错: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { verify };