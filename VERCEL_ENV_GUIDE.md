
# Vercel环境变量配置指南

## 在Vercel Dashboard中设置以下环境变量：

### 1. DATABASE_URL
值: postgresql://postgres.djhizndqdpxedwfasypi:Lotus@123@aws-1-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require
环境: Production, Preview, Development

### 2. JWT_SECRET  
值: lotus-island-production-jwt-secret-02
环境: Production, Preview, Development

### 3. NEXTAUTH_URL
值: https://your-app-name.vercel.app
环境: Production, Preview
值: http://localhost:3000
环境: Development

## 设置步骤：
1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 进入 Settings -> Environment Variables
4. 添加上述环境变量
5. 重新部署项目

## 注意事项：
- DATABASE_URL必须以 postgresql:// 开头
- 确保所有特殊字符都正确编码
- JWT_SECRET在生产环境中应该使用强密钥
- NEXTAUTH_URL应该匹配你的实际域名
