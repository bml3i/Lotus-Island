/**
 * Prisma 客户端配置
 * 为了向后兼容，重新导出数据库相关功能
 */

import { testDatabaseConnection, getDatabaseHealthStatus } from './database';

// 创建一个兼容的 prisma 对象，包含基本的方法存根
const prisma = {
  $disconnect: async () => {
    // 兼容性方法，实际上不需要做任何事情
    return Promise.resolve();
  },
  $transaction: async (callback: any) => {
    // 临时实现，实际应该使用我们的 transaction 函数
    throw new Error('请使用新的数据库模型替代 Prisma 事务');
  },
  user: {
    findUnique: async (...args: any[]) => { throw new Error('请使用 UserModel.findById'); },
    update: async (...args: any[]) => { throw new Error('请使用 UserModel.update'); },
    delete: async (...args: any[]) => { throw new Error('请使用 UserModel.delete'); },
  },
  exchangeRule: {
    findMany: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.findAll'); },
    findFirst: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.findFirst'); },
    findUnique: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.findById'); },
    create: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.create'); },
    update: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.update'); },
    delete: async (...args: any[]) => { throw new Error('请使用 ExchangeRuleModel.delete'); },
  },
  item: {
    findUnique: async (...args: any[]) => { throw new Error('请使用 ItemModel.findById'); },
  },
  userItem: {
    findUnique: async (...args: any[]) => { throw new Error('请使用 UserItemModel.findByUserAndItem'); },
    findFirst: async (...args: any[]) => { throw new Error('请使用 UserItemModel 相关方法'); },
    update: async (...args: any[]) => { throw new Error('请使用 UserItemModel.update'); },
  },
  usageHistory: {
    findMany: async (...args: any[]) => { throw new Error('请使用相应的历史记录模型'); },
    count: async (...args: any[]) => { throw new Error('请使用相应的历史记录模型'); },
  }
};

// 重新导出数据库相关功能
export { testDatabaseConnection, getDatabaseHealthStatus };
export { prisma };
export default prisma;