-- =====================================================
-- 将密码从哈希存储转换为明文存储
-- =====================================================

-- 注意：这个脚本将现有的哈希密码重置为默认明文密码
-- 在生产环境中使用前请确保用户了解密码将被重置

-- 更新管理员账户密码为明文
UPDATE "users" 
SET "password_hash" = 'Password@123' 
WHERE "username" = 'admin';

-- 为其他用户设置默认密码（如果有的话）
-- 注意：这会将所有非管理员用户的密码重置为 'password123'
UPDATE "users" 
SET "password_hash" = 'password123' 
WHERE "username" != 'admin';

-- 显示更新结果
SELECT 
    "username", 
    "role",
    "password_hash",
    "updated_at"
FROM "users" 
ORDER BY "username";