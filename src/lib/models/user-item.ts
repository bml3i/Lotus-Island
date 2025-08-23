/**
 * 用户物品模型和数据库操作
 */

import { query, queryOne, transaction } from '../db';
import { PoolClient } from 'pg';

export interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  updatedAt: Date;
  // 关联数据
  item?: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
    isUsable: boolean;
  };
}

export interface UsageHistory {
  id: string;
  userId: string;
  itemId: string;
  quantityUsed: number;
  usedAt: Date;
  // 关联数据
  item?: {
    name: string;
    description?: string;
  };
}

export class UserItemModel {
  // 获取用户的所有物品
  static async findByUserId(userId: string): Promise<UserItem[]> {
    return await query<UserItem>(
      `SELECT 
        ui.id, 
        ui.user_id as "userId", 
        ui.item_id as "itemId", 
        ui.quantity, 
        ui.updated_at as "updatedAt",
        json_build_object(
          'id', i.id,
          'name', i.name,
          'description', i.description,
          'iconUrl', i.icon_url,
          'isUsable', i.is_usable
        ) as item
       FROM user_items ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1 AND ui.quantity > 0
       ORDER BY i.name`,
      [userId]
    );
  }

  // 获取用户特定物品
  static async findByUserAndItem(userId: string, itemId: string): Promise<UserItem | null> {
    return await queryOne<UserItem>(
      `SELECT 
        ui.id, 
        ui.user_id as "userId", 
        ui.item_id as "itemId", 
        ui.quantity, 
        ui.updated_at as "updatedAt",
        json_build_object(
          'id', i.id,
          'name', i.name,
          'description', i.description,
          'iconUrl', i.icon_url,
          'isUsable', i.is_usable
        ) as item
       FROM user_items ui
       JOIN items i ON ui.item_id = i.id
       WHERE ui.user_id = $1 AND ui.item_id = $2`,
      [userId, itemId]
    );
  }

  // 更新或创建用户物品
  static async upsert(userId: string, itemId: string, quantity: number): Promise<UserItem> {
    const result = await queryOne<UserItem>(
      `INSERT INTO user_items (user_id, item_id, quantity) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, item_id) 
       DO UPDATE SET quantity = user_items.quantity + $3, updated_at = NOW()
       RETURNING id, user_id as "userId", item_id as "itemId", quantity, updated_at as "updatedAt"`,
      [userId, itemId, quantity]
    );

    if (!result) {
      throw new Error('Failed to upsert user item');
    }

    return result;
  }

  // 使用物品（减少数量并记录使用历史）
  static async useItem(userId: string, itemId: string, quantity: number): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // 检查用户是否有足够的物品
      const userItem = await client.query(
        'SELECT quantity FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, itemId]
      );

      if (userItem.rows.length === 0 || userItem.rows[0].quantity < quantity) {
        throw new Error('Insufficient items');
      }

      // 减少物品数量
      await client.query(
        'UPDATE user_items SET quantity = quantity - $1, updated_at = NOW() WHERE user_id = $2 AND item_id = $3',
        [quantity, userId, itemId]
      );

      // 记录使用历史
      await client.query(
        'INSERT INTO usage_history (user_id, item_id, quantity_used) VALUES ($1, $2, $3)',
        [userId, itemId, quantity]
      );
    });
  }

  // 获取使用历史
  static async getUsageHistory(
    userId: string, 
    limit: number = 20, 
    offset: number = 0,
    itemId?: string
  ): Promise<{ histories: UsageHistory[]; total: number }> {
    let whereClause = 'WHERE uh.user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (itemId) {
      whereClause += ` AND uh.item_id = $${paramIndex++}`;
      params.push(itemId);
    }

    // 获取历史记录
    const historiesQuery = `
      SELECT 
        uh.id,
        uh.user_id as "userId",
        uh.item_id as "itemId",
        uh.quantity_used as "quantityUsed",
        uh.used_at as "usedAt",
        json_build_object(
          'name', i.name,
          'description', i.description
        ) as item
      FROM usage_history uh
      JOIN items i ON uh.item_id = i.id
      ${whereClause}
      ORDER BY uh.used_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    params.push(limit, offset);

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as count
      FROM usage_history uh
      ${whereClause}
    `;
    const countParams = params.slice(0, paramIndex - 2); // 移除limit和offset参数

    const [histories, countResult] = await Promise.all([
      query<UsageHistory>(historiesQuery, params),
      queryOne<{ count: string }>(countQuery, countParams)
    ]);

    return {
      histories,
      total: parseInt(countResult?.count || '0')
    };
  }
}