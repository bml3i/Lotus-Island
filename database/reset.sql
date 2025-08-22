-- =====================================================
-- 莲花岛积分系统数据库重置脚本
-- 仅删除所有表格，不重新创建
-- =====================================================

-- 删除所有表格（按照外键依赖关系的正确顺序）
DROP TABLE IF EXISTS "user_activity_records" CASCADE;
DROP TABLE IF EXISTS "usage_history" CASCADE;
DROP TABLE IF EXISTS "user_items" CASCADE;
DROP TABLE IF EXISTS "exchange_rules" CASCADE;
DROP TABLE IF EXISTS "activities" CASCADE;
DROP TABLE IF EXISTS "items" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 显示剩余表格
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;