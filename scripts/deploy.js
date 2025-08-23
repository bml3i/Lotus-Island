#!/usr/bin/env node

/**
 * 莲花岛部署脚本
 * 处理数据库迁移和初始数据部署
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 颜色输出函数
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
    log(`[${step}] ${message}`, 'cyan');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

// 执行命令函数
function runCommand(command, description) {
    try {
        logStep('EXEC', `${description}: ${command}`);
        const output = execSync(command, {
            stdio: 'pipe',
            encoding: 'utf8',
            cwd: process.cwd()
        });
        if (output.trim()) {
            console.log(output);
        }
        logSuccess(`${description} 完成`);
        return true;
    } catch (error) {
        logError(`${description} 失败: ${error.message}`);
        if (error.stdout) {
            console.log('STDOUT:', error.stdout);
        }
        if (error.stderr) {
            console.log('STDERR:', error.stderr);
        }
        return false;
    }
}

// 检查环境变量
function checkEnvironment() {
    logStep('ENV', '检查环境变量');

    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
        logError(`缺少必需的环境变量: ${missingVars.join(', ')}`);
        return false;
    }

    // 检查数据库URL格式
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl.includes('postgresql://') && !dbUrl.includes('postgres://')) {
        logError('DATABASE_URL 必须是有效的 PostgreSQL 连接字符串');
        return false;
    }

    // 检查SSL模式
    if (!dbUrl.includes('sslmode=')) {
        logWarning('DATABASE_URL 中未指定 SSL 模式，建议添加 ?sslmode=require');
    }

    logSuccess('环境变量检查通过');
    return true;
}

// 测试数据库连接
function testDatabaseConnection() {
    logStep('DB', '测试数据库连接');

    try {
        // 使用 Prisma 测试连接 - 执行一个简单的查询
        const testResult = runCommand(
            'npx prisma db execute --url "$DATABASE_URL" --stdin <<< "SELECT 1;"',
            '数据库连接测试'
        );

        if (testResult) {
            logSuccess('数据库连接正常');
            return true;
        }
    } catch (error) {
        logError(`数据库连接失败: ${error.message}`);
    }

    return false;
}

// 生成 Prisma 客户端
function generatePrismaClient() {
    logStep('PRISMA', '生成 Prisma 客户端');
    return runCommand('npx prisma generate', 'Prisma 客户端生成');
}

// 运行数据库迁移
function runMigrations() {
    logStep('MIGRATE', '运行数据库迁移');

    // 首先检查是否需要初始化迁移
    const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');

    if (!fs.existsSync(migrationsDir) || fs.readdirSync(migrationsDir).length === 0) {
        logStep('MIGRATE', '初始化数据库迁移');
        if (!runCommand('npx prisma migrate dev --name init', '初始化迁移')) {
            return false;
        }
    }

    // 尝试部署迁移，如果失败则尝试基线化
    logStep('MIGRATE', '尝试部署数据库迁移');
    const deployResult = runCommand('npx prisma migrate deploy', '部署数据库迁移');

    if (!deployResult) {
        logWarning('迁移部署失败，尝试基线化现有数据库');
        logStep('MIGRATE', '基线化数据库');

        // 基线化现有数据库
        const baselineResult = runCommand('npx prisma migrate resolve --applied "$(ls prisma/migrations | head -1)"', '基线化数据库');

        if (baselineResult) {
            // 基线化成功后再次尝试部署
            return runCommand('npx prisma migrate deploy', '重新部署数据库迁移');
        }

        return false;
    }

    return true;
}

// 运行种子数据
function runSeedData() {
    logStep('SEED', '运行种子数据');
    return runCommand('npm run db:seed', '种子数据初始化');
}

// 验证部署
function verifyDeployment() {
    logStep('VERIFY', '验证部署结果');

    // 检查数据库表是否存在
    const checkTablesResult = runCommand(
        'npm run db:check',
        '检查数据库表结构'
    );

    if (!checkTablesResult) {
        logError('数据库表结构验证失败');
        return false;
    }

    logSuccess('部署验证通过');
    return true;
}

// 主部署流程
async function deploy() {
    log('🚀 开始莲花岛系统部署', 'bright');
    log('='.repeat(50), 'blue');

    const steps = [
        { name: '环境检查', fn: checkEnvironment },
        { name: '数据库连接测试', fn: testDatabaseConnection },
        { name: 'Prisma 客户端生成', fn: generatePrismaClient },
        { name: '数据库迁移', fn: runMigrations },
        { name: '种子数据初始化', fn: runSeedData },
        { name: '部署验证', fn: verifyDeployment }
    ];

    let currentStep = 0;

    for (const step of steps) {
        currentStep++;
        log(`\n[${currentStep}/${steps.length}] ${step.name}`, 'magenta');
        log('-'.repeat(30), 'blue');

        const success = step.fn();

        if (!success) {
            logError(`部署在步骤 "${step.name}" 失败`);
            process.exit(1);
        }
    }

    log('\n' + '='.repeat(50), 'green');
    logSuccess('🎉 莲花岛系统部署完成！');
    log('='.repeat(50), 'green');

    // 输出部署信息
    log('\n📋 部署信息:', 'bright');
    log(`• 数据库: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || '未知'}`, 'cyan');
    log(`• 环境: ${process.env.NODE_ENV || 'development'}`, 'cyan');
    log(`• 时间: ${new Date().toISOString()}`, 'cyan');

    log('\n🔗 有用的命令:', 'bright');
    log('• 查看数据库: npm run db:studio', 'yellow');
    log('• 检查数据: npm run db:check', 'yellow');
    log('• 重置数据库: npm run db:reset', 'yellow');
}

// 错误处理
process.on('uncaughtException', (error) => {
    logError(`未捕获的异常: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(`未处理的 Promise 拒绝: ${reason}`);
    process.exit(1);
});

// 运行部署
if (require.main === module) {
    deploy().catch((error) => {
        logError(`部署失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { deploy };