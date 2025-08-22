import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRES_IN = '7d';

/**
 * 密码哈希工具函数
 */
export class PasswordUtils {
  /**
   * 对密码进行哈希处理
   * @param password 原始密码
   * @returns 哈希后的密码
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * 验证密码
   * @param password 原始密码
   * @param hashedPassword 哈希后的密码
   * @returns 验证结果
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}

/**
 * JWT令牌工具函数
 */
export class TokenUtils {
  /**
   * 生成JWT令牌
   * @param payload 令牌载荷
   * @returns JWT令牌
   */
  static generateToken(payload: { userId: string; username: string; role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * 验证JWT令牌
   * @param token JWT令牌
   * @returns 解码后的载荷或null
   */
  static verifyToken(token: string): { userId: string; username: string; role: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { userId: string; username: string; role: string };
      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role
      };
    } catch {
      return null;
    }
  }

  /**
   * 从Authorization头部提取令牌
   * @param authHeader Authorization头部值
   * @returns 提取的令牌或null
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}