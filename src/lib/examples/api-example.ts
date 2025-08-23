/**
 * 示例：展示如何使用核心工具函数构建API
 * 这个文件展示了认证、验证、错误处理和响应格式化的完整流程
 */

import { NextRequest } from 'next/server';
import {
  PasswordUtils,
  TokenUtils,
  ValidationUtils,
  ApiResponseFormatter,
  ApiMiddleware,
  ErrorHandler,
  ValidationError,
  AuthenticationError,
  CommonUtils
} from '../utils';
import { AuthMiddleware } from '../middleware/auth';

/**
 * 示例：用户登录API处理函数
 */
export const loginHandler = ApiMiddleware.withErrorHandling(
  async (request: Request) => {
    // 验证请求方法
    const methodError = ApiMiddleware.validateMethod(request, ['POST']);
    if (methodError) return methodError;

    // 解析请求体
    const body = await ApiMiddleware.parseRequestBody(request);

    // 验证请求体结构
    const bodyValidation = ValidationUtils.validateRequestBody(body);
    if (!bodyValidation.isValid) {
      throw new ValidationError(bodyValidation.error);
    }

    // 验证用户名和密码
    const { username, password } = body as { username: string; password: string };

    const usernameValidation = ValidationUtils.validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new ValidationError(usernameValidation.error);
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.error);
    }

    // 模拟数据库查询用户
    // 在实际应用中，这里会查询数据库
    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'admin',
      passwordHash: await PasswordUtils.hashPassword('Password@123'), // 明文存储
      role: 'admin'
    };

    // 验证用户存在
    if (mockUser.username !== username) {
      throw new AuthenticationError('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await PasswordUtils.verifyPassword(password, mockUser.passwordHash);
    if (!isPasswordValid) {
      throw new AuthenticationError('用户名或密码错误');
    }

    // 生成JWT令牌
    const token = TokenUtils.generateToken({
      userId: mockUser.id,
      username: mockUser.username,
      role: mockUser.role
    });

    // 返回成功响应
    return ApiResponseFormatter.success(
      {
        token,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          role: mockUser.role
        }
      },
      '登录成功'
    );
  }
);

/**
 * 示例：需要认证的用户信息API
 */
export const getUserInfoHandler = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    // 用户信息已经通过中间件验证，可以直接使用
    return ApiResponseFormatter.success(
      {
        userId: user!.userId,
        username: user!.username,
        role: user!.role,
        loginTime: new Date().toISOString()
      },
      '获取用户信息成功'
    );
  },
  { requireAuth: true }
);

/**
 * 示例：需要管理员权限的用户管理API
 */
export const createUserHandler = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    // 验证请求方法
    const methodError = ApiMiddleware.validateMethod(request, ['POST']);
    if (methodError) return methodError;

    // 解析请求体
    const body = await ApiMiddleware.parseRequestBody(request);
    const { username, password, role } = body as { username: string; password: string; role: string };

    // 验证输入数据
    const usernameValidation = ValidationUtils.validateUsername(username);
    if (!usernameValidation.isValid) {
      throw new ValidationError(usernameValidation.error);
    }

    const passwordValidation = ValidationUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new ValidationError(passwordValidation.error);
    }

    const roleValidation = ValidationUtils.validateUserRole(role);
    if (!roleValidation.isValid) {
      throw new ValidationError(roleValidation.error);
    }

    // 创建新用户（模拟，明文密码存储）
    const storedPassword = await PasswordUtils.hashPassword(password);
    const newUser = {
      id: CommonUtils.generateRandomString(36),
      username,
      role,
      createdAt: new Date().toISOString()
    };

    // 返回创建成功响应
    return ApiResponseFormatter.created(
      newUser,
      '用户创建成功'
    );
  },
  { requireAuth: true, requireAdmin: true }
);

/**
 * 示例：物品使用API（带数量验证）
 */
export const useItemHandler = AuthMiddleware.withAuth(
  async (request: NextRequest, user) => {
    // 验证请求方法
    const methodError = ApiMiddleware.validateMethod(request, ['POST']);
    if (methodError) return methodError;

    // 解析请求体
    const body = await ApiMiddleware.parseRequestBody(request);
    const { itemId, quantity } = body as { itemId: string; quantity: number };

    // 验证输入数据
    const itemIdValidation = ValidationUtils.validateUUID(itemId);
    if (!itemIdValidation.isValid) {
      throw new ValidationError(itemIdValidation.error);
    }

    const quantityValidation = ValidationUtils.validateQuantity(quantity);
    if (!quantityValidation.isValid) {
      throw new ValidationError(quantityValidation.error);
    }

    if (quantity <= 0) {
      throw new ValidationError('使用数量必须大于0');
    }

    // 模拟检查用户背包中的物品数量
    const userItemQuantity = 10; // 假设用户有10个该物品
    
    if (quantity > userItemQuantity) {
      throw new ValidationError('物品数量不足');
    }

    // 模拟使用物品
    const remainingQuantity = userItemQuantity - quantity;
    
    // 记录使用历史（模拟）
    const usageRecord = {
      id: CommonUtils.generateRandomString(36),
      userId: user!.userId,
      itemId,
      quantityUsed: quantity,
      usedAt: new Date().toISOString()
    };

    return ApiResponseFormatter.success(
      {
        remainingQuantity,
        usageRecord
      },
      '物品使用成功'
    );
  },
  { requireAuth: true }
);

/**
 * 示例：错误处理演示
 */
export const errorDemoHandler = ApiMiddleware.withErrorHandling(
  async (request: Request) => {
    const url = new URL(request.url);
    const errorType = url.searchParams.get('type');

    switch (errorType) {
      case 'validation':
        throw new ValidationError('这是一个验证错误示例');
      
      case 'auth':
        throw new AuthenticationError('这是一个认证错误示例');
      
      case 'prisma':
        // 模拟Prisma错误
        const prismaError = { code: 'P2002', meta: { target: ['username'] } };
        throw ErrorHandler.handlePrismaError(prismaError);
      
      case 'generic':
        throw new Error('这是一个通用错误示例');
      
      default:
        return ApiResponseFormatter.success(
          { message: '错误演示API正常工作' },
          '请使用 ?type=validation|auth|prisma|generic 参数来测试不同类型的错误'
        );
    }
  }
);

/**
 * 导出所有示例处理函数
 */
export const apiExamples = {
  login: loginHandler,
  getUserInfo: getUserInfoHandler,
  createUser: createUserHandler,
  useItem: useItemHandler,
  errorDemo: errorDemoHandler
};