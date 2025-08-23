# 莲花岛积分系统 (Lotus Island)

一个基于 Next.js 的儿童好习惯培养积分系统，通过游戏化的方式激励儿童养成良好习惯。

## 功能特性

- 🔐 用户认证与管理
- 🎒 背包系统（物品管理）
- ✅ 每日签到功能
- 🔄 物品兑换系统
- 🏛️ 活动广场（扩展性设计）
- 📱 移动端适配
- 🚀 Vercel 部署支持

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Next.js 14 API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: JWT
- **部署**: Vercel

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制环境变量文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置数据库连接：

```bash
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret-key"
```

### 3. 数据库初始化

```bash
# 生成 Prisma 客户端
npm run db:generate

# 运行数据库迁移
npm run db:migrate

# 初始化种子数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 部署

### 快速部署

使用自动化部署脚本：

```bash
npm run deploy
```

### 手动部署

详细部署说明请参考 [DEPLOYMENT.md](./DEPLOYMENT.md)。

### Vercel 部署

1. 在 Vercel 中导入项目
2. 配置环境变量（参考 `.env.example`）
3. 部署完成后运行验证：

```bash
npm run verify
```

## 数据库管理

```bash
# 查看数据库内容
npm run db:studio

# 检查数据完整性
npm run db:check

# 重置数据库
npm run db:reset
```

## 默认账户

系统初始化后会创建默认管理员账户：

- 用户名: `admin`
- 密码: `Password@123`

## API 文档

### 健康检查

```
GET /api/health
```

### 认证

```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### 用户管理

```
GET /api/users
POST /api/users
PUT /api/users/:id
DELETE /api/users/:id
```

### 背包系统

```
GET /api/backpack
POST /api/backpack/use
GET /api/backpack/history
```

### 活动系统

```
POST /api/activities/checkin
GET /api/activities/checkin/status
POST /api/activities/exchange
GET /api/activities/exchange/rules
```

## 项目结构

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API 路由
│   │   └── (pages)/        # 页面组件
│   ├── components/         # React 组件
│   ├── lib/               # 工具函数和配置
│   └── types/             # TypeScript 类型定义
├── prisma/                # 数据库配置
│   ├── schema.prisma      # 数据库模式
│   ├── migrations/        # 数据库迁移
│   └── seed.ts           # 种子数据
├── scripts/              # 部署和维护脚本
└── database/            # 数据库工具脚本
```

## 开发指南

### 添加新功能

1. 更新数据库模式（如需要）
2. 创建 API 路由
3. 实现前端组件
4. 添加测试
5. 更新文档

### 数据库变更

```bash
# 创建新迁移
npx prisma migrate dev --name migration_name

# 应用迁移
npx prisma migrate deploy
```

## 故障排除

常见问题和解决方案请参考 [DEPLOYMENT.md](./DEPLOYMENT.md#故障排除)。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
