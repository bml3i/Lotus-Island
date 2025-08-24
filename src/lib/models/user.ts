/**
 * 用户模型和数据库操作
 */

import { query, queryOne, transaction } from '../db';
import { PoolClient } from 'pg';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  passwordHash: string;
  role?: string;
}

export interface UpdateUserData {
  username?: string;
  passwordHash?: string;
  role?: string;
}

export class UserModel {
  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    return await queryOne<User>(
      'SELECT id, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE username = $1',
      [username]
    );
  }

  // 根据ID查找用户
  static async findById(id: string): Promise<User | null> {
    return await queryOne<User>(
      'SELECT id, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );
  }

  // 获取所有用户
  static async findAll(limit?: number, offset?: number): Promise<User[]> {
    let sql = 'SELECT id, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt" FROM users ORDER BY created_at DESC';
    const params: any[] = [];

    if (limit) {
      sql += ' LIMIT $1';
      params.push(limit);

      if (offset) {
        sql += ' OFFSET $2';
        params.push(offset);
      }
    }

    return await query<User>(sql, params);
  }

  // 创建用户
  static async create(data: CreateUserData): Promise<User> {
    const result = await queryOne<User>(
      `INSERT INTO users (username, password_hash, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"`,
      [data.username, data.passwordHash, data.role || 'user']
    );

    if (!result) {
      throw new Error('Failed to create user');
    }

    return result;
  }

  // 更新用户
  static async update(id: string, data: UpdateUserData): Promise<User> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.username !== undefined) {
      updates.push(`username = $${paramIndex++}`);
      params.push(data.username);
    }

    if (data.passwordHash !== undefined) {
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(data.passwordHash);
    }

    if (data.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      params.push(data.role);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const sql = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, username, password_hash as "passwordHash", role, created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await queryOne<User>(sql, params);
    if (!result) {
      throw new Error('User not found or update failed');
    }

    return result;
  }

  // 删除用户
  static async delete(id: string): Promise<void> {
    const result = await query('DELETE FROM users WHERE id = $1', [id]);
    if (result.length === 0) {
      throw new Error('User not found');
    }
  }

  // 统计用户数量
  static async count(): Promise<number> {
    const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users');
    return parseInt(result?.count || '0');
  }

  // 检查用户名是否存在
  static async existsByUsername(username: string): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM users WHERE username = $1) as exists',
      [username]
    );
    return result?.exists || false;
  }

  // 为用户分配初始物品（事务操作）
  static async assignInitialItems(userId: string, itemId: string, quantity: number): Promise<void> {
    await transaction(async (client: PoolClient) => {
      // 检查用户是否已有该物品
      const existingItem = await client.query(
        'SELECT id FROM user_items WHERE user_id = $1 AND item_id = $2',
        [userId, itemId]
      );

      if (existingItem.rows.length > 0) {
        // 更新数量
        await client.query(
          'UPDATE user_items SET quantity = quantity + $1, updated_at = NOW() WHERE user_id = $2 AND item_id = $3',
          [quantity, userId, itemId]
        );
      } else {
        // 创建新记录
        await client.query(
          'INSERT INTO user_items (user_id, item_id, quantity) VALUES ($1, $2, $3)',
          [userId, itemId, quantity]
        );
      }
    });
  }
}