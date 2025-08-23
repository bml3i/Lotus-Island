-- 修复admin用户密码
UPDATE users 
SET password_hash = 'Password@123' 
WHERE username = 'admin';

-- 显示更新结果
SELECT username, role, password_hash 
FROM users 
WHERE username = 'admin';