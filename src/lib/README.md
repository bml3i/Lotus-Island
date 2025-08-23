# 核心工具函数库

本目录包含了莲花岛项目的核心工具函数，实现了认证、验证、错误处理和API响应格式化等功能。

## 文件结构

```
src/lib/
├── auth.ts              # 认证工具函数（密码哈希、JWT令牌）
├── validation.ts        # 数据验证工具函数
├── errors.ts           # 错误处理工具函数
├── api-response.ts     # API响应格式化工具函数
├── utils.ts            # 通用工具函数和统一导出
├── middleware/
│   └── auth.ts         # 认证中间件
├── examples/
│   └── api-example.ts  # API使用示例
├── __tests__/
│   └── utils.test.ts   # 工具函数测试
└── README.md           # 本文档
```

## 主要功能

### 1. 认证工具 (auth.ts)

#### PasswordUtils
- `hashPassword(password: string)`: 对密码进行哈希处理
- `verifyPassword(password: string, hashedPassword: string)`: 验证密码

#### TokenUtils
- `generateToken(payload)`: 生成JWT令牌
- `verifyToken(token: string)`: 验证JWT令牌
- `extractTokenFromHeader(authHeader: string)`: 从Authorization头部提取令牌

### 2. 数据验证 (validation.ts)

#### ValidationUtils
- `validateUsername(username: string)`: 验证用户名格式
- `validatePassword(password: string)`: 验证密码格式
- `validateUserRole(role: string)`: 验证用户角色
- `validateQuantity(quantity: number)`: 验证物品数量
- `validateUUID(id: string)`: 验证UUID格式
- `validateDate(date: string | Date)`: 验证日期格式
- `validateRequestBody(body: unknown)`: 验证请求体

### 3. 错误处理 (errors.ts)

#### 自定义错误类
- `AppError`: 基础应用错误类
- `AuthenticationError`: 认证错误 (401)
- `AuthorizationError`: 授权错误 (403)
- `NotFoundError`: 资源未找到错误 (404)
- `ValidationError`: 验证错误 (400)
- `DatabaseError`: 数据库错误 (500)

#### ErrorHandler
- `handlePrismaError(error)`: 处理Prisma数据库错误
- `handleJWTError(error)`: 处理JWT相关错误
- `handleError(error)`: 处理通用错误
- `logError(error, context)`: 记录错误日志

### 4. API响应格式化 (api-response.ts)

#### ApiResponseFormatter
- `success(data, message, statusCode)`: 创建成功响应
- `error(error, statusCode)`: 创建错误响应
- `created(data, message)`: 创建资源成功响应 (201)
- `noContent(message)`: 创建无内容响应 (204)
- `unauthorized(message)`: 创建未认证响应 (401)
- `forbidden(message)`: 创建权限不足响应 (403)
- `notFound(message)`: 创建资源未找到响应 (404)
- `badRequest(message)`: 创建请求错误响应 (400)
- `internalServerError(message)`: 创建服务器错误响应 (500)

#### ApiMiddleware
- `withErrorHandling(handler)`: 包装API处理函数，统一错误处理
- `validateMethod(request, allowedMethods)`: 验证HTTP方法
- `parseRequestBody(request)`: 解析请求体JSON

### 5. 认证中间件 (middleware/auth.ts)

#### AuthMiddleware
- `authenticateToken(request)`: 验证JWT令牌
- `requireAdmin(user)`: 验证管理员权限
- `requireOwnershipOrAdmin(user, resourceUserId)`: 验证资源所有权
- `withAuth(handler, options)`: 包装API处理函数，自动进行认证

### 6. 通用工具 (utils.ts)

#### CommonUtils
- `delay(ms)`: 延迟执行
- `generateRandomString(length)`: 生成随机字符串
- `formatDate(date)`: 格式化日期
- `isSameDay(date1, date2)`: 检查是否为同一天
- `getTodayStart()` / `getTodayEnd()`: 获取今天的开始/结束时间
- `safeJsonParse(jsonString, defaultValue)`: 安全解析JSON
- `deepClone(obj)`: 深度克隆对象
- `debounce(func, wait)`: 防抖函数
- `throttle(func, limit)`: 节流函数

## 使用示例

### 基本认证流程

```typescript
import { PasswordUtils, TokenUtils, ValidationUtils, ApiResponseFormatter } from '@/lib/utils';

// 用户登录
async function login(username: string, password: string) {
  // 验证输入
  const usernameValidation = ValidationUtils.validateUsername(username);
  if (!usernameValidation.isValid) {
    return ApiResponseFormatter.badRequest(usernameValidation.error);
  }

  // 验证密码
  const isValid = await PasswordUtils.verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return ApiResponseFormatter.unauthorized('用户名或密码错误');
  }

  // 生成令牌
  const token = TokenUtils.generateToken({
    userId: user.id,
    username: user.username,
    role: user.role
  });

  return ApiResponseFormatter.success({ token, user });
}
```

### 使用认证中间件

```typescript
import { AuthMiddleware } from '@/lib/utils';

// 需要认证的API
export const GET = AuthMiddleware.withAuth(
  async (request, user) => {
    // user 参数已经通过认证验证
    return ApiResponseFormatter.success({ userId: user.userId });
  },
  { requireAuth: true }
);

// 需要管理员权限的API
export const POST = AuthMiddleware.withAuth(
  async (request, user) => {
    // 用户已经通过管理员权限验证
    return ApiResponseFormatter.success({ message: '管理员操作成功' });
  },
  { requireAuth: true, requireAdmin: true }
);
```

### 错误处理

```typescript
import { ApiMiddleware, ErrorHandler } from '@/lib/utils';

export const POST = ApiMiddleware.withErrorHandling(
  async (request) => {
    try {
      // API逻辑
      return ApiResponseFormatter.success(data);
    } catch (error) {
      // 错误会被自动处理并返回适当的响应
      throw ErrorHandler.handleError(error);
    }
  }
);
```

## 测试

运行测试以验证工具函数正常工作：

```bash
npx tsx src/lib/__tests__/utils.test.ts
```

## 环境变量

确保设置以下环境变量：

```bash
JWT_SECRET=your-jwt-secret-key
```

## 注意事项

1. 所有密码都以明文形式存储（根据需求不进行加密）
2. JWT令牌默认有效期为7天
3. 所有API响应都包含统一的格式：success、data/error、statusCode、timestamp
4. 错误处理支持Prisma数据库错误的自动转换
5. 认证中间件支持Bearer Token格式的Authorization头部
6. 所有验证函数都返回 `{ isValid: boolean; error?: string }` 格式的结果

## 相关需求

本实现满足以下需求：
- 需求 1.2: 用户认证功能（密码哈希、JWT令牌）
- 需求 7.3: 数据验证和错误处理机制