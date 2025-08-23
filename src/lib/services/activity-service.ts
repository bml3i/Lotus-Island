import { prisma } from '@/lib/prisma';
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
    const activities = await prisma.activity.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return activities.map(activity => ({
      ...activity,
      config: activity.config as Record<string, unknown> | null
    }));
  }

  // 获取所有活动（包括非活跃的）
  static async getAllActivities(): Promise<Activity[]> {
    const activities = await prisma.activity.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return activities.map(activity => ({
      ...activity,
      config: activity.config as Record<string, unknown> | null
    }));
  }

  // 根据ID获取活动
  static async getActivityById(id: string): Promise<Activity | null> {
    const activity = await prisma.activity.findUnique({
      where: { id }
    });
    
    if (!activity) return null;
    
    return {
      ...activity,
      config: activity.config as Record<string, unknown> | null
    };
  }

  // 根据类型获取活动
  static async getActivitiesByType(type: string): Promise<Activity[]> {
    const activities = await prisma.activity.findMany({
      where: {
        type,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return activities.map(activity => ({
      ...activity,
      config: activity.config as Record<string, unknown> | null
    }));
  }  
// 创建新活动
  static async createActivity(data: CreateActivityData): Promise<Activity> {
    const activity = await prisma.activity.create({
      data: {
        name: data.name,
        type: data.type,
        config: JSON.parse(JSON.stringify(data.config)),
        isActive: true
      }
    });
    
    return {
      ...activity,
      config: activity.config as Record<string, unknown> | null
    };
  }

  // 更新活动
  static async updateActivity(id: string, data: UpdateActivityData): Promise<Activity> {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.config !== undefined) updateData.config = data.config;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    const activity = await prisma.activity.update({
      where: { id },
      data: updateData
    });
    
    return {
      ...activity,
      config: activity.config as Record<string, unknown> | null
    };
  }

  // 删除活动
  static async deleteActivity(id: string): Promise<void> {
    await prisma.activity.delete({
      where: { id }
    });
  }

  // 启用/禁用活动
  static async toggleActivityStatus(id: string, isActive: boolean): Promise<Activity> {
    const activity = await prisma.activity.update({
      where: { id },
      data: { isActive }
    });
    
    return {
      ...activity,
      config: activity.config as Record<string, unknown> | null
    };
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
}