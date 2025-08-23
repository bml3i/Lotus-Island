/**
 * 系统健康检查 API
 * 用于监控数据库连接状态和系统健康
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseHealth, getMigrationStatus } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // 获取数据库健康状态
    const dbHealth = await getDatabaseHealth();
    
    // 获取迁移状态
    const migrationStatus = await getMigrationStatus();
    
    // 系统信息
    const systemInfo = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    };
    
    // 整体健康状态
    const isHealthy = dbHealth.connected && migrationStatus.applied > 0;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: dbHealth,
      migrations: migrationStatus,
      system: systemInfo
    };
    
    return NextResponse.json(healthData, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('健康检查失败:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}