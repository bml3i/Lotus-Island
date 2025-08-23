import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordUtils, TokenUtils } from '@/lib/auth';

// Import the API handlers
import { GET as getExchangeRules, POST as performExchange } from '@/app/api/activities/exchange/route';
import { GET as getAllRules, POST as createRule } from '@/app/api/activities/exchange/rules/route';
import { PUT as updateRule, DELETE as deleteRule } from '@/app/api/activities/exchange/rules/[id]/route';

describe('Exchange API Tests', () => {
  let testUser: { id: string; token: string };
  let testAdmin: { id: string; token: string };
  let lotusItem: { id: string };
  let tvTicketItem: { id: string };
  let exchangeRule: { id: string };

  beforeAll(async () => {
    // Create test user (plaintext password)
    const userPasswordHash = await PasswordUtils.hashPassword('testpass123');
    const user = await prisma.user.create({
      data: {
        username: 'testuser_exchange',
        passwordHash: userPasswordHash,
        role: 'user'
      }
    });

    const userToken = TokenUtils.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role
    });

    testUser = { id: user.id, token: userToken };

    // Create test admin (plaintext password)
    const adminPasswordHash = await PasswordUtils.hashPassword('adminpass123');
    const admin = await prisma.user.create({
      data: {
        username: 'testadmin_exchange',
        passwordHash: adminPasswordHash,
        role: 'admin'
      }
    });

    const adminToken = TokenUtils.generateToken({
      userId: admin.id,
      username: admin.username,
      role: admin.role
    });

    testAdmin = { id: admin.id, token: adminToken };

    // Create test items
    const lotus = await prisma.item.create({
      data: {
        name: '测试莲子',
        description: '用于测试的莲子',
        isUsable: false
      }
    });

    const tvTicket = await prisma.item.create({
      data: {
        name: '测试电视券',
        description: '用于测试的电视券',
        isUsable: true
      }
    });

    lotusItem = { id: lotus.id };
    tvTicketItem = { id: tvTicket.id };

    // Create exchange rule
    const rule = await prisma.exchangeRule.create({
      data: {
        fromItemId: lotusItem.id,
        toItemId: tvTicketItem.id,
        fromQuantity: 10,
        toQuantity: 1,
        isActive: true
      }
    });

    exchangeRule = { id: rule.id };

    // Add lotus items to user's backpack
    await prisma.userItem.create({
      data: {
        userId: testUser.id,
        itemId: lotusItem.id,
        quantity: 50
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.userItem.deleteMany({
      where: { userId: { in: [testUser.id, testAdmin.id] } }
    });
    await prisma.exchangeRule.deleteMany({
      where: { id: exchangeRule.id }
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUser.id, testAdmin.id] } }
    });
    await prisma.item.deleteMany({
      where: { id: { in: [lotusItem.id, tvTicketItem.id] } }
    });
  });

  describe('GET /api/activities/exchange', () => {
    it('should return active exchange rules', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange');

      const response = await getExchangeRules();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      const rule = data.data.find((r: { id: string }) => r.id === exchangeRule.id);
      expect(rule).toBeDefined();
      expect(rule.fromQuantity).toBe(10);
      expect(rule.toQuantity).toBe(1);
    });
  });

  describe('POST /api/activities/exchange', () => {
    it('should perform exchange successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exchangeRuleId: exchangeRule.id,
          quantity: 1
        })
      });

      const response = await performExchange(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.fromQuantity).toBe(10);
      expect(data.data.toQuantity).toBe(1);
    });

    it('should validate insufficient items', async () => {
      // First, reduce user's lotus items to less than required
      await prisma.userItem.update({
        where: {
          userId_itemId: {
            userId: testUser.id,
            itemId: lotusItem.id
          }
        },
        data: { quantity: 5 }
      });

      const request = new NextRequest('http://localhost:3000/api/activities/exchange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exchangeRuleId: exchangeRule.id,
          quantity: 1
        })
      });

      const response = await performExchange(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('INSUFFICIENT_ITEMS');

      // Restore user's lotus items for other tests
      await prisma.userItem.update({
        where: {
          userId_itemId: {
            userId: testUser.id,
            itemId: lotusItem.id
          }
        },
        data: { quantity: 50 }
      });
    });

    it('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exchangeRuleId: exchangeRule.id,
          quantity: 1
        })
      });

      const response = await performExchange(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should validate exchange rule exists', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          exchangeRuleId: 'non-existent-id',
          quantity: 1
        })
      });

      const response = await performExchange(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('EXCHANGE_RULE_NOT_FOUND');
    });
  });

  describe('GET /api/activities/exchange/rules', () => {
    it('should return all rules for admin', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange/rules', {
        headers: {
          'Authorization': `Bearer ${testAdmin.token}`
        }
      });

      const response = await getAllRules(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should require admin role', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange/rules', {
        headers: {
          'Authorization': `Bearer ${testUser.token}`
        }
      });

      const response = await getAllRules(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe('POST /api/activities/exchange/rules', () => {
    it('should create new exchange rule for admin', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange/rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testAdmin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromItemId: tvTicketItem.id,
          toItemId: lotusItem.id,
          fromQuantity: 1,
          toQuantity: 5
        })
      });

      const response = await createRule(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.fromQuantity).toBe(1);
      expect(data.data.toQuantity).toBe(5);

      // Clean up the created rule
      await prisma.exchangeRule.delete({
        where: { id: data.data.id }
      });
    });

    it('should validate required parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange/rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testAdmin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromItemId: lotusItem.id,
          // Missing required fields
        })
      });

      const response = await createRule(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should require admin role', async () => {
      const request = new NextRequest('http://localhost:3000/api/activities/exchange/rules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromItemId: lotusItem.id,
          toItemId: tvTicketItem.id,
          fromQuantity: 5,
          toQuantity: 1
        })
      });

      const response = await createRule(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/activities/exchange/rules/[id]', () => {
    it('should update exchange rule for admin', async () => {
      const request = new NextRequest(`http://localhost:3000/api/activities/exchange/rules/${exchangeRule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testAdmin.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromQuantity: 15,
          toQuantity: 2
        })
      });

      const response = await updateRule(request, { params: { id: exchangeRule.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.fromQuantity).toBe(15);
      expect(data.data.toQuantity).toBe(2);

      // Restore original values
      await prisma.exchangeRule.update({
        where: { id: exchangeRule.id },
        data: { fromQuantity: 10, toQuantity: 1 }
      });
    });

    it('should require admin role', async () => {
      const request = new NextRequest(`http://localhost:3000/api/activities/exchange/rules/${exchangeRule.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testUser.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromQuantity: 20
        })
      });

      const response = await updateRule(request, { params: { id: exchangeRule.id } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
    });
  });
});