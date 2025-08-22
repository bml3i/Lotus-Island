# 莲花岛积分系统数据库初始化

本目录包含了莲花岛积分系统的数据库初始化脚本。

## 文件说明

- `init.sql` - 完整的数据库初始化脚本，包含删除表格、创建表格、索引和初始数据
- `reset.sql` - 数据库重置脚本，仅删除所有表格
- `README.md` - 本说明文件

## 使用方法

### 1. 完整初始化数据库

```bash
# 使用psql命令行工具
psql -h localhost -p 5432 -U pgadmin -d mydb -f database/init.sql

# 或者使用环境变量
PGPASSWORD=Postgres@123 psql -h localhost -p 5432 -U pgadmin -d mydb -f database/init.sql
```

### 2. 重置数据库（仅删除表格）

```bash
# 使用psql命令行工具
psql -h localhost -p 5432 -U pgadmin -d mydb -f database/reset.sql

# 或者使用环境变量
PGPASSWORD=Postgres@123 psql -h localhost -p 5432 -U pgadmin -d mydb -f database/reset.sql
```

### 3. 使用npm脚本（推荐）

```bash
# 完整初始化数据库
npm run db:init

# 重置数据库（删除所有表格）
npm run db:reset

# 验证数据库数据
npm run db:check
```

### 4. 使用Prisma工具

如果你更喜欢使用Prisma工具：

```bash
# 推送schema到数据库
npm run db:push

# 运行种子数据
npm run db:seed

# 重置数据库
npx prisma migrate reset
```

## 初始数据

初始化脚本会创建以下默认数据：

### 物品 (Items)
- **莲子**: 系统基础货币，不可使用
- **20分钟电视券**: 可使用物品，用于观看电视

### 用户 (Users)
- **管理员账户**: 
  - 用户名: `admin`
  - 密码: `Password@123`
  - 角色: `admin`

### 兑换规则 (Exchange Rules)
- **莲子 → 电视券**: 10个莲子兑换1个20分钟电视券

### 活动 (Activities)
- **每日签到**: 每日签到可获得5个莲子奖励

## 数据库表结构

1. **users** - 用户表
2. **items** - 物品表
3. **user_items** - 用户物品表（背包）
4. **usage_history** - 使用历史表
5. **activities** - 活动表
6. **user_activity_records** - 用户活动记录表
7. **exchange_rules** - 兑换规则表

## 注意事项

- 执行初始化脚本前，请确保数据库连接信息正确
- 初始化脚本会删除所有现有表格，请谨慎使用
- 管理员密码已经过bcrypt加密处理
- 所有表格都使用UUID作为主键
- 包含了适当的外键约束和索引优化