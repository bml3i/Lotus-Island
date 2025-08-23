/**
 * 物品模型和数据库操作
 */

import { query, queryOne } from '../db';

export interface Item {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  isUsable: boolean;
  createdAt: Date;
}

export interface CreateItemData {
  name: string;
  description?: string;
  iconUrl?: string;
  isUsable?: boolean;
}

export class ItemModel {
  // 根据ID查找物品
  static async findById(id: string): Promise<Item | null> {
    return await queryOne<Item>(
      'SELECT id, name, description, icon_url as "iconUrl", is_usable as "isUsable", created_at as "createdAt" FROM items WHERE id = $1',
      [id]
    );
  }

  // 根据名称查找物品
  static async findByName(name: string): Promise<Item | null> {
    return await queryOne<Item>(
      'SELECT id, name, description, icon_url as "iconUrl", is_usable as "isUsable", created_at as "createdAt" FROM items WHERE name = $1',
      [name]
    );
  }

  // 获取所有物品
  static async findAll(): Promise<Item[]> {
    return await query<Item>(
      'SELECT id, name, description, icon_url as "iconUrl", is_usable as "isUsable", created_at as "createdAt" FROM items ORDER BY created_at ASC'
    );
  }

  // 创建物品
  static async create(data: CreateItemData): Promise<Item> {
    const result = await queryOne<Item>(
      `INSERT INTO items (name, description, icon_url, is_usable) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, description, icon_url as "iconUrl", is_usable as "isUsable", created_at as "createdAt"`,
      [data.name, data.description, data.iconUrl, data.isUsable || false]
    );

    if (!result) {
      throw new Error('Failed to create item');
    }

    return result;
  }

  // 查找或创建物品
  static async findOrCreate(data: CreateItemData): Promise<Item> {
    let item = await this.findByName(data.name);
    if (!item) {
      item = await this.create(data);
    }
    return item;
  }
}