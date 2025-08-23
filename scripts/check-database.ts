#!/usr/bin/env tsx
/**
 * 数据库状态检查脚本
 * 替代原来的 database/check-data.js
 */

import { checkDatabaseStatus } from '../src/lib/db-init';
import { getHealthStatus } from '../src/lib/db';

async function main() {
  console.log('🔍 检查数据库状态...');
  
  try {
    // 检查数据库连接健康状态
    const health = await getHealthStatus();
    console.log('\n📊 数据库连接状态:');
    console.log(`  连接状态: ${health.connected ? '✅ 已连接' : '❌ 未连接'}`);
    if (health.version) {
      console.log(`  数据库版本: ${health.version.split(' ')[0]}`);
    }
    if (health.ssl !== undefined) {
      console.log(`  SSL连接: ${health.ssl ? '✅ 启用' : '❌ 未启用'}`);
    }
    if (health.error) {
      console.log(`  错误信息: ${health.error}`);
    }
    
    if (!health.connected) {
      console.log('\n❌ 数据库连接失败，无法继续检查');
      process.exit(1);
    }
    
    // 检查数据库内容
    const status = await checkDatabaseStatus();
    
    console.log('\n📋 数据库内容统计:');
    console.log(`  用户数量: ${status.userCount}`);
    console.log(`  物品数量: ${status.itemCount}`);
    console.log(`  活动数量: ${status.activityCount}`);
    console.log(`  兑换规则数量: ${status.exchangeRuleCount}`);
    
    if (status.userCount === 0) {
      console.log('\n⚠️  数据库为空，建议运行 npm run db:init 初始化数据');
    } else {
      console.log('\n✅ 数据库状态正常');
    }
    
  } catch (error) {
    console.error('\n❌ 检查失败:', error);
    process.exit(1);
  }
}

main();