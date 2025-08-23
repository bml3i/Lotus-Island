import { ActivityModel, Activity as ActivityData } from '@/lib/models/activity';
import { Activity } from '@/types';

export interface ActivityConfig {
  [key: string]: unknown;
}

export interface CreateActivityData {
  name: string;
  type: string;
  config: ActivityConfig;
}

export interface UpdateActivityData {
  name?: string;
  type?: string;
  config?: ActivityConfig;
  isActive?: boolean;
}

export class ActivityService {
  // 获取所有活跃的活动
  static async getActiveActivities(): Promise<Activity[]> {
    const activities = await ActivityModel.findActive();
    return activities.map(this.formatActivity);
  }

  // 获取所有活动（包括非活跃的）
  static async getAllActivities(): Promise<Activity[]> {
    const activities = await ActivityModel.findAll();
    return activities.map(this.formatActivity);
  }

  // 根据ID获取活动
  static async getActivityById(id: string): Promise<Activity | null> {
    const activity = await ActivityModel.findById(id);
    return activity ? this.formatActivity(activity) : null;
  }

  // 根据类型获取活动
  static async getActivitiesByType(type: string): Promise<Activity[]> {
    const activities = await ActivityModel.findByType(type);
    return activities.map(this.formatActivity);
  }  
  // 创建新活动
  static async createActivity(data: CreateActivityData): Promise<Activity> {
    const activity = await ActivityModel.create({
      name: data.name,
      type: data.type,
      config: data.config,
      isActive: true
    });
    
    return this.formatActivity(activity);
  }

  // 更新活动
  static async updateActivity(id: string, data: UpdateActivityData): Promise<Activity> {
    const activity = await ActivityModel.update(id, {
      name: data.name,
      type: data.type,
      config: data.config,
      isActive: data.isActive
    });
    
    return this.formatActivity(activity);
  }

  // 删除活动
  static async deleteActivity(id: string): Promise<void> {
    await ActivityModel.delete(id);
  }

  // 启用/禁用活动
  static async toggleActivityStatus(id: string, isActive: boolean): Promise<Activity> {
    const activity = await ActivityModel.toggleStatus(id, isActive);
    return this.formatActivity(activity);
  }

  // 验证活动配置
  static validateActivityConfig(type: string, config: ActivityConfig): boolean {
    switch (type) {
      case 'checkin':
        return typeof config.reward === 'number' && config.reward > 0;
      case 'exchange':
        return (
          typeof config.fromItemId === 'string' &&
          typeof config.toItemId === 'string' &&
          typeof config.fromQuantity === 'number' &&
          typeof config.toQuantity === 'number' &&
          config.fromQuantity > 0 &&
          config.toQuantity > 0
        );
      default:
        return true; // 对于未知类型，允许任意配置
    }
  }

  // 获取活动的默认配置
  static getDefaultConfig(type: string): ActivityConfig {
    switch (type) {
      case 'checkin':
        return {
          reward: 5,
          itemId: 'lotus-seed',
          description: '每日签到获得莲子奖励'
        };
      case 'exchange':
        return {
          fromItemId: 'lotus-seed',
          toItemId: 'tv-ticket',
          fromQuantity: 10,
          toQuantity: 1,
          description: '莲子兑换电视券'
        };
      default:
        return {};
    }
  }

  // 格式化活动数据
  private static formatActivity(activity: ActivityData): Activity {
    return {
      id: activity.id,
      name: activity.name,
      type: activity.type,
      config: activity.config,
      isActive: activity.isActive,
      createdAt: activity.createdAt,
    };
  }
}