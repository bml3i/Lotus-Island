/**
 * 数据库初始化脚本
 * 替代Prisma的种子脚本
 */

import { UserModel } from './models/user';
import { ItemModel } from './models/item';
import { ActivityModel } from './models/activity';
import { ExchangeRuleModel } from './models/exchange';
import { testConnection } from './db';

export async function initializeDatabase(): Promise<void> {
  console.log('开始数据库初始化...');

  // 测试数据库连接
  const isConnected = await testConnection();
  if (!isConnected) {
    throw new Error('数据库连接失败');
  }

  try {
    // 创建默认物品
    await createDefaultItems();
    
    // 创建默认用户
    await createDefaultUsers();
    
    // 创建默认活动
    await createDefaultActivities();
    
    // 创建默认兑换规则
    await createDefaultExchangeRules();
    
    console.log('✅ 数据库初始化完成');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  }
}

async function createDefaultItems(): Promise<void> {
  console.log('创建默认物品...');
  
  // 创建莲子物品
  const lotusItem = await ItemModel.findOrCreate({
    name: '莲子',
    description: '系统基础货币，可用于兑换其他物品',
    isUsable: false
  });
  
  // 创建电视券物品
  const tvTicketItem = await ItemModel.findOrCreate({
    name: '20分钟电视券',
    description: '可以观看20分钟电视的券',
    isUsable: true
  });
  
  console.log(`✅ 创建物品: ${lotusItem.name}, ${tvTicketItem.name}`);
}

async function createDefaultUsers(): Promise<void> {
  console.log('创建默认用户...');
  
  // 检查admin用户是否存在
  const existingAdmin = await UserModel.findByUsername('admin');
  if (!existingAdmin) {
    const adminUser = await UserModel.create({
      username: 'admin',
      passwordHash: 'Password@123', // 明文密码，实际项目中应该使用哈希
      role: 'admin'
    });
    console.log(`✅ 创建管理员用户: ${adminUser.username}`);
  } else {
    console.log('✅ 管理员用户已存在');
  }
  
  // 检查测试用户是否存在
  const existingTestUser = await UserModel.findByUsername('testuser');
  if (!existingTestUser) {
    const testUser = await UserModel.create({
      username: 'testuser',
      passwordHash: 'testpass123',
      role: 'user'
    });
    
    // 为测试用户分配初始莲子
    const lotusItem = await ItemModel.findByName('莲子');
    if (lotusItem) {
      await UserModel.assignInitialItems(testUser.id, lotusItem.id, 50);
    }
    
    console.log(`✅ 创建测试用户: ${testUser.username}`);
  } else {
    console.log('✅ 测试用户已存在');
  }
}

async function createDefaultActivities(): Promise<void> {
  console.log('创建默认活动...');
  
  // 创建签到活动
  const existingCheckIn = await ActivityModel.findFirstByType('checkin');
  if (!existingCheckIn) {
    const checkInActivity = await ActivityModel.create({
      name: '每日签到',
      type: 'checkin',
      config: {
        reward: {
          itemName: '莲子',
          quantity: 5
        }
      },
      isActive: true
    });
    console.log(`✅ 创建活动: ${checkInActivity.name}`);
  } else {
    console.log('✅ 签到活动已存在');
  }
}

async function createDefaultExchangeRules(): Promise<void> {
  console.log('创建默认兑换规则...');
  
  const lotusItem = await ItemModel.findByName('莲子');
  const tvTicketItem = await ItemModel.findByName('20分钟电视券');
  
  if (lotusItem && tvTicketItem) {
    const existingRule = await ExchangeRuleModel.findByItems(lotusItem.id, tvTicketItem.id);
    if (!existingRule) {
      const exchangeRule = await ExchangeRuleModel.create({
        fromItemId: lotusItem.id,
        toItemId: tvTicketItem.id,
        fromQuantity: 10,
        toQuantity: 1,
        isActive: true
      });
      console.log(`✅ 创建兑换规则: ${lotusItem.name} -> ${tvTicketItem.name}`);
    } else {
      console.log('✅ 兑换规则已存在');
    }
  }
}

// 检查数据库状态
export async function checkDatabaseStatus(): Promise<{
  connected: boolean;
  userCount: number;
  itemCount: number;
  activityCount: number;
  exchangeRuleCount: number;
}> {
  const connected = await testConnection();
  
  if (!connected) {
    return {
      connected: false,
      userCount: 0,
      itemCount: 0,
      activityCount: 0,
      exchangeRuleCount: 0
    };
  }
  
  const [users, items, activities, exchangeRules] = await Promise.all([
    UserModel.findAll(),
    ItemModel.findAll(),
    ActivityModel.findAll(),
    ExchangeRuleModel.findAll()
  ]);
  
  return {
    connected: true,
    userCount: users.length,
    itemCount: items.length,
    activityCount: activities.length,
    exchangeRuleCount: exchangeRules.length
  };
}