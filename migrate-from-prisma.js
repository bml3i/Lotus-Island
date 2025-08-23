/**
 * 批量迁移脚本：从Prisma迁移到原生PostgreSQL客户端
 */

const fs = require('fs');
const path = require('path');

// 需要更新的文件列表
const filesToUpdate = [
  'src/app/api/users/[id]/route.ts',
  'src/app/api/backpack/route.ts',
  'src/app/api/backpack/history/route.ts',
  'src/app/api/backpack/use/route.ts',
  'src/app/api/activities/route.ts',
  'src/app/api/activities/checkin/route.ts',
  'src/app/api/activities/exchange/route.ts',
  'src/lib/services/activity-service.ts'
];

// 替换规则
const replacements = [
  // 导入替换
  {
    from: /import { prisma } from '@\/lib\/prisma';/g,
    to: ''
  },
  {
    from: /import { prisma } from '@\/lib\/simple-prisma';/g,
    to: ''
  },
  // 添加新的导入（需要手动处理每个文件的具体导入）
];

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`文件不存在: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;

  // 应用替换规则
  replacements.forEach(rule => {
    if (rule.from.test(content)) {
      content = content.replace(rule.from, rule.to);
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(filePath, content);
    console.log(`已更新: ${filePath}`);
  } else {
    console.log(`无需更新: ${filePath}`);
  }
}

// 执行更新
console.log('开始批量更新文件...');
filesToUpdate.forEach(updateFile);
console.log('批量更新完成！');

// 提示手动处理的文件
console.log('\n需要手动处理的文件:');
filesToUpdate.forEach(file => {
  console.log(`- ${file}`);
});

console.log('\n请手动更新这些文件中的:');
console.log('1. 导入语句 (添加相应的Model导入)');
console.log('2. Prisma查询替换为Model方法调用');
console.log('3. 事务操作替换为transaction()函数');