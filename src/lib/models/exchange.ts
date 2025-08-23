/**
 * 兑换规则模型和数据库操作
 */

import { query, queryOne, transaction } from '../db';
import { PoolClient } from 'pg';

export interface ExchangeRule {
  id: string;
  fromItemId: string;
  toItemId: string;
  fromQuantity: number;
  toQuantity: number;
  isActive: boolean;
  createdAt: Date;
  // 关联数据
  fromItem?: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
  };
  toItem?: {
    id: string;
    name: string;
    description?: string;
    iconUrl?: string;
  };
}

export interface CreateExchangeRuleData {
  fromItemId: string;
  toItemId: string;
  fromQuantity: number;
  toQuantity: number;
  isActive?: boolean;
}

export interface UpdateExchangeRuleData {
  fromQuantity?: number;
  toQuantity?: number;
  isActive?: boolean;
}

export class ExchangeRuleModel {
  // 获取所有活跃的兑换规则
  static async findActive(): Promise<ExchangeRule[]> {
    return await query<ExchangeRule>(
      `SELECT 
        er.id,
        er.from_item_id as "fromItemId",
        er.to_item_id as "toItemId",
        er.from_quantity as "fromQuantity",
        er.to_quantity as "toQuantity",
        er.is_active as "isActive",
        er.created_at as "createdAt",
        json_build_object(
          'id', fi.id,
          'name', fi.name,
          'description', fi.description,
          'iconUrl', fi.icon_url
        ) as "fromItem",
        json_build_object(
          'id', ti.id,
          'name', ti.name,
          'description', ti.description,
          'iconUrl', ti.icon_url
        ) as "toItem"
       FROM exchange_rules er
       JOIN items fi ON er.from_item_id = fi.id
       JOIN items ti ON er.to_item_id = ti.id
       WHERE er.is_active = true
       ORDER BY er.created_at DESC`
    );
  }

  // 获取所有兑换规则
  static async findAll(): Promise<ExchangeRule[]> {
    return await query<ExchangeRule>(
      `SELECT 
        er.id,
        er.from_item_id as "fromItemId",
        er.to_item_id as "toItemId",
        er.from_quantity as "fromQuantity",
        er.to_quantity as "toQuantity",
        er.is_active as "isActive",
        er.created_at as "createdAt",
        json_build_object(
          'id', fi.id,
          'name', fi.name,
          'description', fi.description,
          'iconUrl', fi.icon_url
        ) as "fromItem",
        json_build_object(
          'id', ti.id,
          'name', ti.name,
          'description', ti.description,
          'iconUrl', ti.icon_url
        ) as "toItem"
       FROM exchange_rules er
       JOIN items fi ON er.from_item_id = fi.id
       JOIN items ti ON er.to_item_id = ti.id
       ORDER BY er.created_at DESC`
    );
  }

  // 根据ID查找兑换规则
  static async findById(id: string): Promise<ExchangeRule | null> {
    return await queryOne<ExchangeRule>(
      `SELECT 
        er.id,
        er.from_item_id as "fromItemId",
        er.to_item_id as "toItemId",
        er.from_quantity as "fromQuantity",
        er.to_quantity as "toQuantity",
        er.is_active as "isActive",
        er.created_at as "createdAt",
        json_build_object(
          'id', fi.id,
          'name', fi.name,
          'description', fi.description,
          'iconUrl', fi.icon_url
        ) as "fromItem",
        json_build_object(
          'id', ti.id,
          'name', ti.name,
          'description', ti.description,
          'iconUrl', ti.icon_url
        ) as "toItem"
       FROM exchange_rules er
       JOIN items fi ON er.from_item_id = fi.id
       JOIN items ti ON er.to_item_id = ti.id
       WHERE er.id = $1`,
      [id]
    );
  }

  // 查找特定物品间的兑换规则
  static async findByItems(fromItemId: string, toItemId: string): Promise<ExchangeRule | null> {
    return await queryOne<ExchangeRule>(
      `SELECT 
        er.id,
        er.from_item_id as "fromItemId",
        er.to_item_id as "toItemId",
        er.from_quantity as "fromQuantity",
        er.to_quantity as "toQuantity",
        er.is_active as "isActive",
        er.created_at as "createdAt"
       FROM exchange_rules er
       WHERE er.from_item_id = $1 AND er.to_item_id = $2`,
      [fromItemId, toItemId]
    );
  }

  // 创建兑换规则
  static async create(data: CreateExchangeRuleData): Promise<ExchangeRule> {
    const result = await queryOne<ExchangeRule>(
      `INSERT INTO exchange_rules (from_item_id, to_item_id, from_quantity, to_quantity, is_active) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, from_item_id as "fromItemId", to_item_id as "toItemId", from_quantity as "fromQuantity", to_quantity as "toQuantity", is_active as "isActive", created_at as "createdAt"`,
      [data.fromItemId, data.toItemId, data.fromQuantity, data.toQuantity, data.isActive !== false]
    );

    if (!result) {
      throw new Error('Failed to create exchange rule');
    }

    return result;
  }

  // 更新兑换规则
  static async update(id: string, data: UpdateExchangeRuleData): Promise<ExchangeRule> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.fromQuantity !== undefined) {
      updates.push(`from_quantity = $${paramIndex++}`);
      params.push(data.fromQuantity);
    }

    if (data.toQuantity !== undefined) {
      updates.push(`to_quantity = $${paramIndex++}`);
      params.push(data.toQuantity);
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
      UPDATE exchange_rules 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, from_item_id as "fromItemId", to_item_id as "toItemId", from_quantity as "fromQuantity", to_quantity as "toQuantity", is_active as "isActive", created_at as "createdAt"
    `;

    const result = await queryOne<ExchangeRule>(sql, params);
    if (!result) {
      throw new Error('Exchange rule not found or update failed');
    }

    return result;
  }

  // 删除兑换规则
  static async delete(id: string): Promise<void> {
    const result = await query('DELETE FROM exchange_rules WHERE id = $1', [id]);
    if (result.length === 0) {
      throw new Error('Exchange rule not found');
    }
  }

  // 执行兑换操作（事务）
  static async performExchange(
    userId: string,
    ruleId: string,
    quantity: number = 1
  ): Promise<{ success: boolean; message: string; newQuantities?: { fromItem: number; toItem: number } }> {
    return await transaction(async (client: PoolClient) => {
      // 获取兑换规则
      const ruleResult = await client.query(
        'SELECT from_item_id, to_item_id, from_quantity, to_quantity, is_active FROM exchange_rules WHERE id = $1',
        [ruleId]
      );

      if (ruleResult.rows.length === 0) {
        throw new Error('Exchange rule not found');
      }

      const rule = ruleResult.rows[0];
      if (!rule.is_active) {
        throw new Error('Exchange rule is not active');
      }

      const requiredFromQuantity = rule.from_quantity * quantity;
      const rewardToQuantity = rule.to_quantity * quantity;

      // 检查用户是否有足够的源物品
      const userFromItemResult = await client.query(
        'SELECT quantity FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, rule.from_item_id]
      );

      if (userFromItemResult.rows.length === 0 || userFromItemResult.rows[0].quantity < requiredFromQuantity) {
        return {
          success: false,
          message: 'Insufficient items for exchange'
        };
      }

      // 减少源物品数量
      await client.query(
        'UPDATE user_items SET quantity = quantity - $1, updated_at = NOW() WHERE user_id = $2 AND item_id = $3',
        [requiredFromQuantity, userId, rule.from_item_id]
      );

      // 增加目标物品数量
      await client.query(
        `INSERT INTO user_items (user_id, item_id, quantity) 
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, item_id) 
         DO UPDATE SET quantity = user_items.quantity + $3, updated_at = NOW()`,
        [userId, rule.to_item_id, rewardToQuantity]
      );

      // 获取更新后的数量
      const [fromItemResult, toItemResult] = await Promise.all([
        client.query('SELECT quantity FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, rule.from_item_id]),
        client.query('SELECT quantity FROM user_items WHERE user_id = $1 AND item_id = $2', [userId, rule.to_item_id])
      ]);

      return {
        success: true,
        message: 'Exchange completed successfully',
        newQuantities: {
          fromItem: fromItemResult.rows[0]?.quantity || 0,
          toItem: toItemResult.rows[0]?.quantity || 0
        }
      };
    });
  }
}