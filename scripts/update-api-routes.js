#!/usr/bin/env node

/**
 * 批量更新API路由文件，移除Prisma引用
 */

const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
  'src/app/api/activities/[id]/route.ts',
  'src/app/api/activities/route.ts',
  'src/app/api/backpack/history/route.ts',
  'src/app/api/users/[id]/route.ts',
  'src/app/api/activities/exchange/route.ts',
  'src/app/api/activities/exchange/rules/route.ts',
  'src/app/api/activities/checkin/status/route.ts'
];

console.log('🔄 开始更新API路由文件...\n');

filesToUpdate.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`⚠️  文件存在但需要手动更新: ${filePath}`);
    console.log('   建议删除此文件并重新实现，或手动更新Prisma引用');
  } else {
    console.log(`✅ 文件不存在（可能已删除）: ${filePath}`);
  }
});

console.log('\n📝 建议操作:');
console.log('1. 删除所有使用Prisma的API路由文件');
console.log('2. 根据需要重新实现这些API，使用新的模型系统');
console.log('3. 或者手动更新每个文件中的Prisma引用');

console.log('\n✅ 检查完成！');