const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'pgadmin',
  password: 'Postgres@123',
  database: 'mydb',
});

async function checkData() {
  try {
    await client.connect();
    console.log('数据库连接成功\n');
    
    // 检查表格
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);
    console.log('📋 数据库表格:');
    tables.rows.forEach(row => console.log(`  - ${row.tablename}`));
    
    // 检查物品
    const items = await client.query('SELECT name, description, is_usable FROM items ORDER BY name');
    console.log('\n🎁 物品列表:');
    items.rows.forEach(item => {
      console.log(`  - ${item.name}: ${item.description} ${item.is_usable ? '(可使用)' : '(不可使用)'}`);
    });
    
    // 检查用户
    const users = await client.query('SELECT username, role FROM users ORDER BY username');
    console.log('\n👤 用户列表:');
    users.rows.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });
    
    // 检查兑换规则
    const rules = await client.query(`
      SELECT 
        fi.name as from_item,
        ti.name as to_item,
        er.from_quantity,
        er.to_quantity,
        er.is_active
      FROM exchange_rules er
      JOIN items fi ON er.from_item_id = fi.id
      JOIN items ti ON er.to_item_id = ti.id
    `);
    console.log('\n🔄 兑换规则:');
    rules.rows.forEach(rule => {
      console.log(`  - ${rule.from_quantity}个${rule.from_item} → ${rule.to_quantity}个${rule.to_item} ${rule.is_active ? '(激活)' : '(禁用)'}`);
    });
    
    // 检查活动
    const activities = await client.query('SELECT name, type, is_active FROM activities ORDER BY name');
    console.log('\n🎯 活动列表:');
    activities.rows.forEach(activity => {
      console.log(`  - ${activity.name} (${activity.type}) ${activity.is_active ? '(激活)' : '(禁用)'}`);
    });
    
    console.log('\n✅ 数据库初始化验证完成！');
    
  } catch (error) {
    console.error('❌ 验证失败:', error.message);
  } finally {
    await client.end();
  }
}

checkData();