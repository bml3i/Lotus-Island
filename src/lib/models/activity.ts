/**
 * 活动模型和数据库操作
 */

import { query, queryOne, transaction } from '../db';
import { PoolClient } from 'pg';

export interface Activity {
  id: string;
  name: string;
  type: string;
  config: any;
  isActive: boolean;
  createdAt: Date;
}

export interface UserActivityRecord {
  id: string;
  userId: string;
  activityId: string;
  recordDate: Date;
  data?: any;
  createdAt: Date;
}

export interface CreateActivityData {
  name: string;
  type: string;
  config: any;
  isActive?: boolean;
}

export interface UpdateActivityData {
  name?: string;
  type?: string;
  config?: any;
  isActive?: boolean;
}

export class ActivityModel {
  // 获取所有活跃的活动
  static async findActive(): Promise<Activity[]> {
    return await query<Activity>(
      'SELECT id, name, type, config, is_active as "isActive", created_at as "createdAt" FROM activities WHERE is_active = true ORDER BY created_at DESC'
    );
  }

  // 获取所有活动
  static async findAll(): Promise<Activity[]> {
    return await query<Activity>(
      'SELECT id, name, type, config, is_active as "isActive", created_at as "createdAt" FROM activities ORDER BY created_at DESC'
    );
  }

  // 根据ID查找活动
  static async findById(id: string): Promise<Activity | null> {
    return await queryOne<Activity>(
      'SELECT id, name, type, config, is_active as "isActive", created_at as "createdAt" FROM activities WHERE id = $1',
      [id]
    );
  }

  // 根据类型查找活动
  static async findByType(type: string): Promise<Activity[]> {
    return await query<Activity>(
      'SELECT id, name, type, config, is_active as "isActive", created_at as "createdAt" FROM activities WHERE type = $1 AND is_active = true ORDER BY created_at DESC',
      [type]
    );
  }

  // 查找第一个指定类型的活动
  static async findFirstByType(type: string): Promise<Activity | null> {
    return await queryOne<Activity>(
      'SELECT id, name, type, config, is_active as "isActive", created_at as "createdAt" FROM activities WHERE type = $1 ORDER BY created_at ASC LIMIT 1',
      [type]
    );
  }

  // 创建活动
  static async create(data: CreateActivityData): Promise<Activity> {
    const result = await queryOne<Activity>(
      `INSERT INTO activities (name, type, config, is_active) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, type, config, is_active as "isActive", created_at as "createdAt"`,
      [data.name, data.type, JSON.stringify(data.config), data.isActive !== false]
    );

    if (!result) {
      throw new Error('Failed to create activity');
    }

    return result;
  }

  // 更新活动
  static async update(id: string, data: UpdateActivityData): Promise<Activity> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      params.push(data.name);
    }

    if (data.type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      params.push(data.type);
    }

    if (data.config !== undefined) {
      updates.push(`config = $${paramIndex++}`);
      params.push(JSON.stringify(data.config));
    }

    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(data.isActive);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);

    const sql = `
      UPDATE activities 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, name, type, config, is_active as "isActive", created_at as "createdAt"
    `;

    const result = await queryOne<Activity>(sql, params);
    if (!result) {
      throw new Error('Activity not found or update failed');
    }

    return result;
  }

  // 删除活动
  static async delete(id: string): Promise<void> {
    const result = await query('DELETE FROM activities WHERE id = $1', [id]);
    if (result.length === 0) {
      throw new Error('Activity not found');
    }
  }

  // 切换活动状态
  static async toggleStatus(id: string, isActive: boolean): Promise<Activity> {
    return await this.update(id, { isActive });
  }
}

export class UserActivityRecordModel {
  // 检查用户今日是否已有记录
  static async findTodayRecord(userId: string, activityId: string): Promise<UserActivityRecord | null> {
    return await queryOne<UserActivityRecord>(
      `SELECT id, user_id as "userId", activity_id as "activityId", record_date as "recordDate", data, created_at as "createdAt"
       FROM user_activity_records 
       WHERE user_id = $1 AND activity_id = $2 AND record_date = CURRENT_DATE`,
      [userId, activityId]
    );
  }

  // 创建用户活动记录
  static async create(userId: string, activityId: string, data?: any): Promise<UserActivityRecord> {
    const result = await queryOne<UserActivityRecord>(
      `INSERT INTO user_activity_records (user_id, activity_id, record_date, data) 
       VALUES ($1, $2, CURRENT_DATE, $3) 
       RETURNING id, user_id as "userId", activity_id as "activityId", record_date as "recordDate", data, created_at as "createdAt"`,
      [userId, activityId, data ? JSON.stringify(data) : null]
    );

    if (!result) {
      throw new Error('Failed to create user activity record');
    }

    return result;
  }

  // 执行签到操作（事务）
  static async performCheckIn(
    userId: string, 
    activityId: string, 
    rewardItemId: string, 
    rewardQuantity: number
  ): Promise<{ record: UserActivityRecord; totalReward: number }> {
    return await transaction(async (client: PoolClient) => {
      // 创建签到记录
      const recordResult = await client.query(
        `INSERT INTO user_activity_records (user_id, activity_id, record_date, data) 
         VALUES ($1, $2, CURRENT_DATE, $3) 
         RETURNING id, user_id as "userId", activity_id as "activityId", record_date as "recordDate", data, created_at as "createdAt"`,
        [userId, activityId, JSON.stringify({ reward: { itemId: rewardItemId, quantity: rewardQuantity } })]
      );

      const record = recordResult.rows[0];

      // 更新用户物品数量
      await client.query(
        `INSERT INTO user_items (user_id, item_id, quantity) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id) 
         DO UPDATE SET quantity = user_items.quantity + $3, updated_at = NOW()`,
        [userId, rewardItemId, rewardQuantity]
      );

      // 获取用户当前总数量
      const totalResult = await client.query(
        'SELECT quantity FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, rewardItemId]
      );

      const totalReward = totalResult.rows[0]?.quantity || rewardQuantity;

      return { record, totalReward };
    });
  }
}