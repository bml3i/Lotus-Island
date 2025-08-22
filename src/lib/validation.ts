/**
 * 数据验证工具函数
 */
export class ValidationUtils {
  /**
   * 验证用户名格式
   * @param username 用户名
   * @returns 验证结果和错误信息
   */
  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || typeof username !== 'string') {
      return { isValid: false, error: '用户名不能为空' };
    }

    if (username.length < 3 || username.length > 50) {
      return { isValid: false, error: '用户名长度必须在3-50个字符之间' };
    }

    // 只允许字母、数字、下划线和中文
    const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
    if (!usernameRegex.test(username)) {
      return { isValid: false, error: '用户名只能包含字母、数字、下划线和中文字符' };
    }

    return { isValid: true };
  }

  /**
   * 验证密码格式
   * @param password 密码
   * @returns 验证结果和错误信息
   */
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password || typeof password !== 'string') {
      return { isValid: false, error: '密码不能为空' };
    }

    if (password.length < 6 || password.length > 100) {
      return { isValid: false, error: '密码长度必须在6-100个字符之间' };
    }

    return { isValid: true };
  }

  /**
   * 验证用户角色
   * @param role 用户角色
   * @returns 验证结果和错误信息
   */
  static validateUserRole(role: string): { isValid: boolean; error?: string } {
    const validRoles = ['admin', 'user'];
    
    if (!role || typeof role !== 'string') {
      return { isValid: false, error: '用户角色不能为空' };
    }

    if (!validRoles.includes(role)) {
      return { isValid: false, error: '无效的用户角色' };
    }

    return { isValid: true };
  }

  /**
   * 验证物品数量
   * @param quantity 物品数量
   * @returns 验证结果和错误信息
   */
  static validateQuantity(quantity: number): { isValid: boolean; error?: string } {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      return { isValid: false, error: '数量必须是有效数字' };
    }

    if (quantity < 0) {
      return { isValid: false, error: '数量不能为负数' };
    }

    if (!Number.isInteger(quantity)) {
      return { isValid: false, error: '数量必须是整数' };
    }

    return { isValid: true };
  }

  /**
   * 验证UUID格式
   * @param id UUID字符串
   * @returns 验证结果和错误信息
   */
  static validateUUID(id: string): { isValid: boolean; error?: string } {
    if (!id || typeof id !== 'string') {
      return { isValid: false, error: 'ID不能为空' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { isValid: false, error: '无效的ID格式' };
    }

    return { isValid: true };
  }

  /**
   * 验证日期格式
   * @param date 日期字符串或Date对象
   * @returns 验证结果和错误信息
   */
  static validateDate(date: string | Date): { isValid: boolean; error?: string } {
    let dateObj: Date;

    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return { isValid: false, error: '无效的日期格式' };
    }

    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: '无效的日期' };
    }

    return { isValid: true };
  }

  /**
   * 验证请求体是否为有效JSON
   * @param body 请求体
   * @returns 验证结果和错误信息
   */
  static validateRequestBody(body: unknown): { isValid: boolean; error?: string } {
    if (!body || typeof body !== 'object') {
      return { isValid: false, error: '请求体必须是有效的JSON对象' };
    }

    return { isValid: true };
  }
}