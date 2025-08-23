-- =====================================================
-- 莲花岛积分系统数据库初始化脚本
-- =====================================================

-- 删除所有表格（按照外键依赖关系的正确顺序）
DROP TABLE IF EXISTS "user_activity_records" CASCADE;
DROP TABLE IF EXISTS "usage_history" CASCADE;
DROP TABLE IF EXISTS "user_items" CASCADE;
DROP TABLE IF EXISTS "exchange_rules" CASCADE;
DROP TABLE IF EXISTS "activities" CASCADE;
DROP TABLE IF EXISTS "items" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 创建表格
-- =====================================================

-- 用户表
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) DEFAULT 'user' NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 物品表
CREATE TABLE "items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "icon_url" VARCHAR(255),
    "is_usable" BOOLEAN DEFAULT FALSE NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 用户物品表（背包）
CREATE TABLE "user_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER DEFAULT 0 NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE,
    UNIQUE("user_id", "item_id")
);

-- 使用历史表
CREATE TABLE "usage_history" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity_used" INTEGER NOT NULL,
    "used_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE
);

-- 活动表
CREATE TABLE "activities" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 用户活动记录表
CREATE TABLE "user_activity_records" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "activity_id" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE,
    UNIQUE("user_id", "activity_id", "record_date")
);

-- 兑换规则表
CREATE TABLE "exchange_rules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "from_item_id" UUID NOT NULL,
    "to_item_id" UUID NOT NULL,
    "from_quantity" INTEGER NOT NULL,
    "to_quantity" INTEGER NOT NULL,
    "is_active" BOOLEAN DEFAULT TRUE NOT NULL,
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    FOREIGN KEY ("from_item_id") REFERENCES "items"("id") ON DELETE CASCADE,
    FOREIGN KEY ("to_item_id") REFERENCES "items"("id") ON DELETE CASCADE,
    UNIQUE("from_item_id", "to_item_id")
);

-- =====================================================
-- 创建索引
-- =====================================================

-- 用户表索引
CREATE INDEX "idx_users_username" ON "users"("username");
CREATE INDEX "idx_users_role" ON "users"("role");

-- 物品表索引
CREATE INDEX "idx_items_name" ON "items"("name");
CREATE INDEX "idx_items_is_usable" ON "items"("is_usable");

-- 用户物品表索引
CREATE INDEX "idx_user_items_user_id" ON "user_items"("user_id");
CREATE INDEX "idx_user_items_item_id" ON "user_items"("item_id");

-- 使用历史表索引
CREATE INDEX "idx_usage_history_user_id" ON "usage_history"("user_id");
CREATE INDEX "idx_usage_history_item_id" ON "usage_history"("item_id");
CREATE INDEX "idx_usage_history_used_at" ON "usage_history"("used_at");

-- 活动表索引
CREATE INDEX "idx_activities_type" ON "activities"("type");
CREATE INDEX "idx_activities_is_active" ON "activities"("is_active");

-- 用户活动记录表索引
CREATE INDEX "idx_user_activity_records_user_id" ON "user_activity_records"("user_id");
CREATE INDEX "idx_user_activity_records_activity_id" ON "user_activity_records"("activity_id");
CREATE INDEX "idx_user_activity_records_record_date" ON "user_activity_records"("record_date");

-- 兑换规则表索引
CREATE INDEX "idx_exchange_rules_from_item_id" ON "exchange_rules"("from_item_id");
CREATE INDEX "idx_exchange_rules_to_item_id" ON "exchange_rules"("to_item_id");
CREATE INDEX "idx_exchange_rules_is_active" ON "exchange_rules"("is_active");

-- =====================================================
-- 插入初始数据
-- =====================================================

-- 插入默认物品
INSERT INTO "items" ("name", "description", "icon_url", "is_usable") VALUES
('莲子', '系统基础货币，可用于兑换其他物品', '/icons/lotus.svg', FALSE),
('20分钟电视券', '可以观看20分钟电视的券', '/icons/tv-ticket.svg', TRUE);

-- 获取物品ID（用于后续插入）
DO $$
DECLARE
    lotus_item_id UUID;
    tv_ticket_item_id UUID;
    admin_user_id UUID;
    checkin_activity_id UUID;
BEGIN
    -- 获取莲子物品ID
    SELECT "id" INTO lotus_item_id FROM "items" WHERE "name" = '莲子';
    
    -- 获取电视券物品ID
    SELECT "id" INTO tv_ticket_item_id FROM "items" WHERE "name" = '20分钟电视券';
    
    -- 插入默认管理员账户（密码：Password@123，明文存储）
    INSERT INTO "users" ("username", "password_hash", "role") VALUES
    ('admin', 'Password@123', 'admin')
    RETURNING "id" INTO admin_user_id;
    
    -- 插入兑换规则：10个莲子兑换1个20分钟电视券
    INSERT INTO "exchange_rules" ("from_item_id", "to_item_id", "from_quantity", "to_quantity", "is_active") VALUES
    (lotus_item_id, tv_ticket_item_id, 10, 1, TRUE);
    
    -- 插入每日签到活动配置
    INSERT INTO "activities" ("name", "type", "config", "is_active") VALUES
    ('每日签到', 'checkin', jsonb_build_object(
        'rewardItemId', lotus_item_id,
        'rewardQuantity', 5,
        'description', '每日签到可获得5个莲子奖励'
    ), TRUE)
    RETURNING "id" INTO checkin_activity_id;
    
    -- 输出创建的记录信息
    RAISE NOTICE '数据库初始化完成！';
    RAISE NOTICE '创建的物品: 莲子 (ID: %), 20分钟电视券 (ID: %)', lotus_item_id, tv_ticket_item_id;
    RAISE NOTICE '创建的管理员用户: admin (ID: %)', admin_user_id;
    RAISE NOTICE '创建的活动: 每日签到 (ID: %)', checkin_activity_id;
END $$;

-- =====================================================
-- 创建更新时间触发器
-- =====================================================

-- 创建更新时间函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为用户表创建更新时间触发器
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON "users" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 为用户物品表创建更新时间触发器
CREATE TRIGGER update_user_items_updated_at 
    BEFORE UPDATE ON "user_items" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 完成初始化
-- =====================================================

-- 显示表格创建结果
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 显示初始数据统计
SELECT 
    'users' as table_name, COUNT(*) as record_count FROM "users"
UNION ALL
SELECT 
    'items' as table_name, COUNT(*) as record_count FROM "items"
UNION ALL
SELECT 
    'activities' as table_name, COUNT(*) as record_count FROM "activities"
UNION ALL
SELECT 
    'exchange_rules' as table_name, COUNT(*) as record_count FROM "exchange_rules";