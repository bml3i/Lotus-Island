import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordUtils, TokenUtils } from '@/lib/auth';

// Import the API handlers
import { GET as getBackpack } from '@/app/api/backpack/route';
import { POST as useItem } from '@/app/api/backpack/use/route';
import { GET as getHistory } from '@/app/api/backpack/history/route';

describe('Backpack API Tests', () => {
  let testUser: { id: string; token: string };
  let testItem: { id: string };

  beforeAll(async () => {
    // Create test user (plaintext password)
    const passwordHash = await PasswordUtils.hashPassword('testpass123');
    const user = await prisma.user.create({
      data: {
        username: 'testuser_backpack',
        passwordHash,
        role: 'user'
      }
    });

    // Generate token
    const token = TokenUtils.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    testUser = { id: user.id, token };

    // Create test item
    const item = await prisma.item.create({
      data: {
        name: '测试物品',
        description: '用于测试的物品',
        isUsable: true
      }
    });

    testItem = { id: item.id };

    // Add item to user's backpack
    await prisma.userItem.create({
      data: {
        userId: testUser.id,
        itemId: testItem.id,
        quantity: 10
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.usageHistory.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.userItem.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    await prisma.item.delete({
      where: { id: testItem.id }
    });
  });

  describe('GET /api/backpack', () => {
    it('should return user backpack items', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack', {
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        }
      });

      const response = await getBackpack(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
      
      const backpackItem = data.data.find((item: { item: { id: string } }) => item.item.id === testItem.id);
      expect(backpackItem).toBeDefined();
      expect(backpackItem.quantity).toBe(10);
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack');

      const response = await getBackpack(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/backpack/use', () => {
    it('should use item successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack/use', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: testItem.id,
          quantity: 2
        })
      });

      const response = await useItem(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.remainingQuantity).toBe(8);
      expect(data.data.usedQuantity).toBe(2);
    });

    it('should validate item quantity', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack/use', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: testItem.id,
          quantity: 100 // More than available
        })
      });

      const response = await useItem(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('数量不足');
    });

    it('should require valid item ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack/use', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: '',
          quantity: 1
        })
      });

      const response = await useItem(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('GET /api/backpack/history', () => {
    it('should return usage history', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack/history', {
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        }
      });

      const response = await getHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
    });

    it('should support pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/backpack/history?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        }
      });

      const response = await getHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(5);
    });

    it('should filter by item ID', async () => {
      const request = new NextRequest(`http://localhost:3000/api/backpack/history?itemId=${testItem.id}`, {
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        }
      });

      const response = await getHistory(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});