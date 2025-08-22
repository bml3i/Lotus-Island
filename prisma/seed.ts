import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('开始数据库种子数据初始化...');

  // 创建默认物品
  console.log('创建默认物品...');
  
  // 创建莲子物品
  let lotusItem = await prisma.item.findFirst({
    where: { name: '莲子' },
  });
  
  if (!lotusItem) {
    lotusItem = await prisma.item.create({
      data: {
        name: '莲子',
        description: '系统基础货币，可用于兑换其他物品',
        iconUrl: '/icons/lotus.svg',
        isUsable: false,
      },
    });
  }

  // 创建电视券物品
  let tvTicketItem = await prisma.item.findFirst({
    where: { name: '20分钟电视券' },
  });
  
  if (!tvTicketItem) {
    tvTicketItem = await prisma.item.create({
      data: {
        name: '20分钟电视券',
        description: '可以观看20分钟电视的券',
        iconUrl: '/icons/tv-ticket.svg',
        isUsable: true,
      },
    });
  }

  console.log('物品创建完成:', { lotusItem: lotusItem.name, tvTicketItem: tvTicketItem.name });

  // 创建默认管理员账户
  console.log('创建默认管理员账户...');
  
  const hashedPassword = await bcrypt.hash('Password@123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });

  console.log('管理员账户创建完成:', adminUser.username);

  // 创建默认兑换规则：10个莲子兑换1个20分钟电视券
  console.log('创建默认兑换规则...');
  
  let exchangeRule = await prisma.exchangeRule.findFirst({
    where: {
      fromItemId: lotusItem.id,
      toItemId: tvTicketItem.id,
    },
  });
  
  if (!exchangeRule) {
    exchangeRule = await prisma.exchangeRule.create({
      data: {
        fromItemId: lotusItem.id,
        toItemId: tvTicketItem.id,
        fromQuantity: 10,
        toQuantity: 1,
        isActive: true,
      },
    });
  }

  console.log('兑换规则创建完成:', `${exchangeRule.fromQuantity}个莲子 -> ${exchangeRule.toQuantity}个电视券`);

  // 创建每日签到活动配置
  console.log('创建每日签到活动配置...');
  
  let checkInActivity = await prisma.activity.findFirst({
    where: { name: '每日签到' },
  });
  
  if (!checkInActivity) {
    checkInActivity = await prisma.activity.create({
      data: {
        name: '每日签到',
        type: 'checkin',
        config: {
          rewardItemId: lotusItem.id,
          rewardQuantity: 5,
          description: '每日签到可获得5个莲子奖励',
        },
        isActive: true,
      },
    });
  }

  console.log('每日签到活动创建完成:', checkInActivity.name);

  console.log('数据库种子数据初始化完成！');
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });