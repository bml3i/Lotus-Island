-- 检查用户密码
SELECT 
    username,
    role,
    password_hash,
    CASE 
        WHEN password_hash LIKE '$%' THEN '哈希密码'
        ELSE '明文密码'
    END as password_type
FROM users 
ORDER BY username;