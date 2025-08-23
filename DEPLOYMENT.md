# 莲花岛系统部署指南

## 概述

本文档描述了如何将莲花岛积分系统部署到 Vercel 平台，包括数据库配置、环境变量设置和部署验证。

## 前置要求

- Node.js 18+ 
- npm 或 yarn
- Vercel 账户
- PostgreSQL 数据库（推荐使用 Supabase）

## 部署步骤

### 1. 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

#### 必需变量

```bash
# 数据库连接字符串
DATABASE_URL="postgresql://postgres.djhizndqdpxedwfasypi:BalabalaTest@12345678@aws-1-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"

# JWT 密钥（请使用强密钥）
JWT_SECRET="your-strong-jwt-secret-key"

# 应用 URL
NEXTAUTH_URL="https://your-app.vercel.app"
```

#### 可选变量

```bash
# 数据库连接池大小
DATABASE_POOL_SIZE="20"

# 数据库连接超时（毫秒）
DATABASE_TIMEOUT="30000"

# SSL 模式
DATABASE_SSL_MODE="require"
```

### 2. Vercel 部署配置

项目已包含 `vercel.json` 配置文件，支持：

- 自动构建和部署
- API 路由配置
- 环境变量映射
- CORS 头设置

### 3. 数据库初始化

#### 方法一：使用部署脚本（推荐）

```bash
# 运行完整部署流程
npm run deploy
```

#### 方法二：手动步骤

```bash
# 1. 生成 Prisma 客户端
npm run db:generate

# 2. 运行数据库迁移
npm run db:migrate:deploy

# 3. 初始化种子数据
npm run db:seed

# 4. 验证部署
npm run verify
```

### 4. 部署验证

部署完成后，运行验证脚本：

```bash
npm run verify
```

或访问健康检查端点：

```
GET https://your-app.vercel.app/api/health
```

## 数据库配置

### SSL 连接

系统要求使用 SSL 连接到 PostgreSQL 数据库。确保数据库 URL 包含 `sslmode=require` 参数。

### 连接池

生产环境建议配置连接池：

- `DATABASE_POOL_SIZE`: 连接池大小（默认 20）
- `DATABASE_TIMEOUT`: 连接超时时间（默认 30000ms）

### 迁移管理

系统使用 Prisma Migrate 管理数据库版本：

```bash
# 创建新迁移
npx prisma migrate dev --name migration_name

# 部署迁移到生产环境
npx prisma migrate deploy

# 查看迁移状态
npx prisma migrate status
```

## 监控和维护

### 健康检查

系统提供健康检查 API：

```
GET /api/health
```

返回信息包括：
- 数据库连接状态
- SSL 连接状态
- 迁移状态
- 系统信息

### 日志监控

在 Vercel 控制台查看：
- 构建日志
- 函数日志
- 错误日志

### 数据库管理

```bash
# 查看数据库内容
npm run db:studio

# 检查数据完整性
npm run db:check

# 重置数据库（谨慎使用）
npm run db:reset
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败

**症状**: 500 错误，数据库连接超时

**解决方案**:
- 检查 `DATABASE_URL` 是否正确
- 确认数据库服务器可访问
- 验证 SSL 配置

#### 2. 迁移失败

**症状**: 部署时迁移错误

**解决方案**:
```bash
# 检查迁移状态
npx prisma migrate status

# 重置迁移（开发环境）
npx prisma migrate reset

# 手动应用迁移
npx prisma db push
```

#### 3. 环境变量未生效

**症状**: 配置相关错误

**解决方案**:
- 检查 Vercel 环境变量设置
- 确认变量名称正确
- 重新部署应用

#### 4. SSL 证书问题

**症状**: SSL 连接错误

**解决方案**:
- 使用 `sslmode=require`
- 检查数据库 SSL 配置
- 尝试 `sslmode=prefer` 作为备选

### 调试工具

```bash
# 测试数据库连接
node -e "
const { testDatabaseConnection } = require('./src/lib/database.ts');
testDatabaseConnection().then(console.log);
"

# 检查环境变量
node -e "
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '已设置' : '未设置');
"
```

## 安全注意事项

1. **JWT 密钥**: 使用强随机密钥，定期轮换
2. **数据库密码**: 使用强密码，避免在代码中硬编码
3. **SSL 连接**: 始终使用 SSL 连接数据库
4. **环境变量**: 不要在代码仓库中提交敏感信息

## 性能优化

1. **连接池**: 根据负载调整连接池大小
2. **查询优化**: 使用数据库索引，优化慢查询
3. **缓存**: 考虑添加 Redis 缓存层
4. **CDN**: 使用 Vercel CDN 加速静态资源

## 备份和恢复

### 数据备份

```bash
# 导出数据库
pg_dump $DATABASE_URL > backup.sql

# 导出特定表
pg_dump $DATABASE_URL -t users -t items > backup_partial.sql
```

### 数据恢复

```bash
# 恢复数据库
psql $DATABASE_URL < backup.sql

# 恢复特定表
psql $DATABASE_URL < backup_partial.sql
```

## 联系支持

如遇到部署问题，请检查：

1. [Vercel 文档](https://vercel.com/docs)
2. [Prisma 文档](https://www.prisma.io/docs)
3. [Next.js 文档](https://nextjs.org/docs)

---

**注意**: 本指南基于当前系统配置编写，如有更新请及时同步文档。