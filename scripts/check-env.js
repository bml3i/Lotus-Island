#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 验证部署所需的环境变量是否正确设置
 */

const requiredEnvVars = {
  DATABASE_URL: {
    required: true,
    description: 'PostgreSQL 数据库连接字符串',
    validate: (value) => {
      if (!value.includes('postgresql://') && !value.includes('postgres://')) {
        return '必须是有效的 PostgreSQL 连接字符串';
      }
      if (!value.includes('sslmode=')) {
        return '建议添加 ?sslmode=require 参数';
      }
      return null;
    }
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT 签名密钥',
    validate: (value) => {
      if (value.length < 32) {
        return '建议使用至少 32 个字符的强密钥';
      }
      return null;
    }
  },
  NEXTAUTH_URL: {
    required: true,
    description: 'NextAuth.js 回调 URL',
    validate: (value) => {
      if (!value.startsWith('https://')) {
        return '生产环境应使用 HTTPS';
      }
      return null;
    }
  },
  DATABASE_POOL_SIZE: {
    required: false,
    description: '数据库连接池大小',
    default: '10'
  },
  DATABASE_TIMEOUT: {
    required: false,
    description: '数据库连接超时时间（毫秒）',
    default: '30000'
  },
  DATABASE_SSL_MODE: {
    required: false,
    description: 'SSL 连接模式',
    default: 'require'
  }
};

function checkEnvironment() {
  console.log('🔍 检查环境变量配置...\n');

  let hasErrors = false;
  let hasWarnings = false;

  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[varName];
    
    console.log(`📋 ${varName}:`);
    console.log(`   描述: ${config.description}`);
    
    if (!value) {
      if (config.required) {
        console.log(`   ❌ 状态: 缺失（必需）`);
        hasErrors = true;
      } else {
        console.log(`   ⚠️  状态: 未设置，将使用默认值: ${config.default}`);
        hasWarnings = true;
      }
    } else {
      console.log(`   ✅ 状态: 已设置`);
      console.log(`   📝 值: ${varName === 'DATABASE_URL' ? value.replace(/:[^:@]+@/, ':***@') : value.substring(0, 20) + '...'}`);
      
      if (config.validate) {
        const validationError = config.validate(value);
        if (validationError) {
          if (validationError.includes('建议')) {
            console.log(`   ⚠️  建议: ${validationError}`);
            hasWarnings = true;
          } else {
            console.log(`   ❌ 错误: ${validationError}`);
            hasErrors = true;
          }
        }
      }
    }
    console.log('');
  }

  // 总结
  console.log('📊 检查结果:');
  if (hasErrors) {
    console.log('❌ 发现错误，需要修复后才能正常部署');
    return false;
  } else if (hasWarnings) {
    console.log('⚠️  发现警告，建议优化配置');
    return true;
  } else {
    console.log('✅ 所有环境变量配置正确');
    return true;
  }
}

function printVercelCommands() {
  console.log('\n🚀 Vercel CLI 设置命令:');
  console.log('');
  
  for (const [varName, config] of Object.entries(requiredEnvVars)) {
    if (config.required) {
      console.log(`vercel env add ${varName} production`);
    }
  }
  
  console.log('\n💡 提示:');
  console.log('1. 先运行 "vercel login" 登录');
  console.log('2. 在项目目录中运行上述命令');
  console.log('3. 按提示输入每个环境变量的值');
  console.log('4. 设置完成后运行 "vercel --prod" 重新部署');
}

if (require.main === module) {
  const isValid = checkEnvironment();
  
  if (!isValid) {
    printVercelCommands();
    process.exit(1);
  }
}

module.exports = { checkEnvironment };