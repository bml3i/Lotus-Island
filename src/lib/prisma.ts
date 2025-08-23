import prisma from './database';

// 重新导出数据库连接，保持向后兼容
export { prisma, testDatabaseConnection, getDatabaseHealth } from './database';
export default prisma;