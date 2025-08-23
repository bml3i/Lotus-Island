# 密码存储方式变更说明

## 概述

根据需求，系统已从加密密码存储改为明文密码存储。本文档说明了所做的更改和注意事项。

## 主要更改

### 1. 代码更改

#### PasswordUtils 类更新
- **文件**: `src/lib/auth.ts`
- **更改**: 
  - 移除了 bcrypt 依赖
  - `hashPassword()` 方法现在直接返回原始密码
  - `verifyPassword()` 方法现在进行简单的字符串比较

#### API 端点更新
- **登录 API**: `src/app/api/auth/login/route.ts`
- **用户创建 API**: `src/app/api/users/route.ts`
- **用户更新 API**: `src/app/api/users/[id]/route.ts`
- **更改**: 所有密码处理逻辑已更新为明文存储

#### 测试文件更新
- 更新了所有测试文件中的密码处理逻辑
- 移除了 bcrypt 相关的测试代码

### 2. 数据库更改

#### 数据库模式
- **文件**: `prisma/schema.prisma`
- **字段名**: `passwordHash` 字段名保持不变
- **存储内容**: 现在存储明文密码而不是哈希值

#### 初始化脚本
- **文件**: `database/init.sql`
- **更改**: 默认管理员密码改为明文存储

#### 种子数据
- **文件**: `prisma/seed.ts`
- **更改**: 移除 bcrypt 依赖，使用明文密码

### 3. 依赖更改

#### 移除的依赖
- `bcryptjs`
- `@types/bcryptjs`

## 默认密码

### 管理员账户
- **用户名**: `admin`
- **密码**: `Password@123`

### 其他用户
- **默认密码**: `password123`

## 迁移步骤

### 自动迁移
运行以下脚本进行自动迁移：

```bash
node scripts/convert-to-plaintext-passwords.js
```

### 手动迁移
如果需要手动迁移，请按以下步骤操作：

1. **移除依赖**:
   ```bash
   npm uninstall bcryptjs @types/bcryptjs
   ```

2. **重新安装依赖**:
   ```bash
   npm install
   ```

3. **重新生成 Prisma 客户端**:
   ```bash
   npm run db:generate
   ```

4. **转换现有密码数据**:
   ```bash
   node database/execute-sql.js convert-passwords-to-plaintext.sql
   ```

5. **更新种子数据**:
   ```bash
   npm run db:seed
   ```

## 安全注意事项

⚠️ **重要安全提醒**:

1. **数据库安全**: 密码现在以明文形式存储，请确保数据库访问受到严格控制
2. **网络安全**: 确保所有密码传输都通过 HTTPS 进行
3. **访问控制**: 限制对数据库的直接访问
4. **日志安全**: 确保密码不会出现在日志文件中
5. **备份安全**: 数据库备份文件包含明文密码，需要安全存储

## 用户通知

需要通知所有用户：

1. 密码存储方式已更改为明文
2. 建议用户更新密码
3. 提醒用户不要在多个系统中使用相同密码
4. 强调密码安全的重要性

## 回滚计划

如果需要回滚到加密密码存储：

1. 恢复 bcryptjs 依赖
2. 恢复原始的 PasswordUtils 实现
3. 重新哈希所有用户密码
4. 更新相关 API 和测试代码

## 测试验证

迁移完成后，请验证：

1. **登录功能**: 使用默认管理员账户登录
2. **用户创建**: 创建新用户并验证登录
3. **密码更新**: 更新用户密码并验证
4. **API 测试**: 运行所有相关的 API 测试

```bash
# 运行测试
npm test

# 验证登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Password@123"}'
```

## 支持

如果在迁移过程中遇到问题，请检查：

1. 数据库连接是否正常
2. 环境变量是否正确设置
3. 依赖是否正确安装
4. Prisma 客户端是否正确生成

---

**最后更新**: 2025年1月23日
**版本**: 1.0.0