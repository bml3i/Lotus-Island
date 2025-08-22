// 导出所有工具函数，方便统一导入
export * from './auth';
export * from './validation';
export * from './errors';
export * from './api-response';
export * from './middleware/auth';

/**
 * 通用工具函数
 */
export class CommonUtils {
  /**
   * 延迟执行函数
   * @param ms 延迟毫秒数
   * @returns Promise
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 生成随机字符串
   * @param length 字符串长度
   * @returns 随机字符串
   */
  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 格式化日期为YYYY-MM-DD格式
   * @param date 日期对象
   * @returns 格式化后的日期字符串
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 检查是否为同一天
   * @param date1 日期1
   * @param date2 日期2
   * @returns 是否为同一天
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return this.formatDate(date1) === this.formatDate(date2);
  }

  /**
   * 获取今天的开始时间
   * @returns 今天的开始时间
   */
  static getTodayStart(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * 获取今天的结束时间
   * @returns 今天的结束时间
   */
  static getTodayEnd(): Date {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }

  /**
   * 安全地解析JSON
   * @param jsonString JSON字符串
   * @param defaultValue 默认值
   * @returns 解析结果或默认值
   */
  static safeJsonParse<T>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }

  /**
   * 防抖函数
   * @param func 要防抖的函数
   * @param wait 等待时间
   * @returns 防抖后的函数
   */
  static debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * 节流函数
   * @param func 要节流的函数
   * @param limit 限制时间
   * @returns 节流后的函数
   */
  static throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}