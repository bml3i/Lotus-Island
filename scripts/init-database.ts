#!/usr/bin/env tsx
/**
 * 数据库初始化脚本
 * 替代 prisma db seed
 */

import { initializeDatabase } from '../src/lib/db-init';

async function main() {
  try {
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

main();