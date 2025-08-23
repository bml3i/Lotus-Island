-- 更新管理员密码为 Password@123
UPDATE users 
SET password_hash = 'Password@123' 
WHERE username = 'admin';

-- 显示更新结果
SELECT username, role, password_hash 
FROM users 
WHERE username = 'admin';