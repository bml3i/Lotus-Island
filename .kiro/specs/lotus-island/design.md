# 设计文档

## 概述

莲花岛是一个基于React的全栈Web应用，采用现代化的技术栈构建。前端使用React + TypeScript提供类型安全，后端使用Next.js API Routes处理业务逻辑，数据库使用PostgreSQL存储数据，整体部署在Vercel平台上。

## 架构

### 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React前端     │───▶│  Next.js API    │───▶│  PostgreSQL     │
│   (移动端适配)   │    │   Routes        │    │   数据库        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈选择
- **前端框架**: React 18 + TypeScript
- **全栈框架**: Next.js 14 (App Router)
- **样式方案**: Tailwind CSS (移动端优先设计)
- **状态管理**: React Context + useReducer
- **数据库**: PostgreSQL (Supabase托管)
- **ORM**: Prisma
- **认证**: 自定义JWT认证
- **部署平台**: Vercel
- **UI组件**: 自定义组件 + Headless UI

## 组件和接口

### 前端组件架构

#### 页面组件
```typescript
// 主要页面组件
- LoginPage: 登录页面
- DashboardPage: 用户仪表板
- BackpackPage: 背包页面
- ActivitySquarePage: 活动广场
- AdminPage: 管理员页面

// 活动子页面
- DailyCheckInPage: 每日签到
- ItemExchangePage: 物品兑换
```

#### 共享组件
```typescript
// UI组件
- Button: 通用按钮组件
- Modal: 模态框组件
- ItemCard: 物品卡片组件
- LoadingSpinner: 加载指示器

// 业务组件
- ItemSelector: 物品选择器
- UsageHistory: 使用历史记录
- UserManagement: 用户管理组件
```

### API接口设计

#### 认证相关
```typescript
POST /api/auth/login
Body: { username: string, password: string }
Response: { token: string, user: User }

POST /api/auth/logout
Headers: { Authorization: Bearer <token> }
Response: { success: boolean }
```

#### 用户管理
```typescript
GET /api/users
Headers: { Authorization: Bearer <token> }
Response: { users: User[] }

POST /api/users
Body: { username: string, password: string, role: 'admin' | 'user' }
Response: { user: User }

PUT /api/users/:id
Body: { username?: string, password?: string }
Response: { user: User }

DELETE /api/users/:id
Response: { success: boolean }
```

#### 背包系统
```typescript
GET /api/backpack
Headers: { Authorization: Bearer <token> }
Response: { items: BackpackItem[] }

POST /api/backpack/use
Body: { itemId: string, quantity: number }
Response: { success: boolean, remainingQuantity: number }

GET /api/backpack/history
Response: { history: UsageHistory[] }
```

#### 活动系统
```typescript
POST /api/activities/checkin
Headers: { Authorization: Bearer <token> }
Response: { success: boolean, reward: number }

GET /api/activities/checkin/status
Response: { canCheckIn: boolean, lastCheckIn: Date }

POST /api/activities/exchange
Body: { fromItemId: string, toItemId: string, quantity: number }
Response: { success: boolean }

GET /api/activities/exchange/rules
Response: { rules: ExchangeRule[] }
```

## 数据模型

### 数据库表结构

#### Users表
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Items表 (物品定义)
```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url VARCHAR(255),
  is_usable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User_Items表 (用户背包)
```sql
CREATE TABLE user_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_id)
);
```

#### Usage_History表 (使用历史)
```sql
CREATE TABLE usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Activities表 (活动配置)
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'checkin', 'exchange', etc.
  config JSONB NOT NULL, -- 灵活的配置存储
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User_Activity_Records表 (用户活动记录)
```sql
CREATE TABLE user_activity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  data JSONB, -- 存储活动相关数据
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, activity_id, record_date)
);
```

#### Exchange_Rules表 (兑换规则)
```sql
CREATE TABLE exchange_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  to_item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  from_quantity INTEGER NOT NULL,
  to_quantity INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### TypeScript类型定义

```typescript
interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isUsable: boolean;
  createdAt: Date;
}

interface BackpackItem {
  id: string;
  userId: string;
  item: Item;
  quantity: number;
  updatedAt: Date;
}

interface UsageHistory {
  id: string;
  userId: string;
  item: Item;
  quantityUsed: number;
  usedAt: Date;
}

interface Activity {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

interface ExchangeRule {
  id: string;
  fromItem: Item;
  toItem: Item;
  fromQuantity: number;
  toQuantity: number;
  isActive: boolean;
}
```

## 错误处理

### 前端错误处理
- 使用React Error Boundary捕获组件错误
- 网络请求错误统一处理和用户提示
- 表单验证错误实时显示
- 移动端网络不稳定情况的重试机制

### 后端错误处理
```typescript
// 统一错误响应格式
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// 常见错误类型
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 400: 请求参数错误
- 500: 服务器内部错误
```

### 数据库错误处理
- 连接超时重试机制
- 事务回滚处理
- 约束违反错误友好提示
- SSL连接配置错误处理

## 测试策略

### 单元测试
- React组件测试 (React Testing Library)
- API路由测试 (Jest)
- 数据库操作测试 (Prisma测试工具)
- 工具函数测试

### 集成测试
- 端到端用户流程测试 (Playwright)
- API集成测试
- 数据库集成测试

### 移动端测试
- 响应式设计测试
- 触摸交互测试
- 不同屏幕尺寸适配测试
- 网络状况测试

### 测试覆盖率目标
- 单元测试覆盖率: >80%
- 集成测试覆盖率: >70%
- 关键业务流程: 100%

## 部署和配置

### Vercel部署配置
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

### 环境变量配置
```bash
# .env.local
DATABASE_URL="postgresql://postgres.djhizndqdpxedwfasypi:BalabalaTest@12345678@aws-1-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require"
JWT_SECRET="your-jwt-secret-key"
NEXTAUTH_URL="https://your-domain.vercel.app"
```

### 数据库迁移策略
- 使用Prisma Migrate管理数据库版本
- 生产环境部署前的迁移验证
- 数据备份和恢复策略

## 性能优化

### 前端优化
- React组件懒加载
- 图片优化和懒加载
- 代码分割和Tree Shaking
- 移动端性能优化

### 后端优化
- 数据库查询优化
- API响应缓存
- 连接池配置
- 静态资源CDN

### 移动端优化
- 触摸响应优化
- 网络请求优化
- 离线功能支持
- PWA特性集成