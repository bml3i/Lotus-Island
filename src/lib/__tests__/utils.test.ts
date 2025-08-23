// 简单的测试文件来验证工具函数的基本功能
import { PasswordUtils, TokenUtils, ValidationUtils, ApiResponseFormatter, ErrorHandler } from '../utils';

// 测试密码工具函数
async function testPasswordUtils() {
  console.log('Testing PasswordUtils...');
  
  const password = 'testPassword123';
  const storedPassword = await PasswordUtils.hashPassword(password);
  console.log('✓ Password stored successfully (plaintext)');
  
  const isValid = await PasswordUtils.verifyPassword(password, storedPassword);
  console.log('✓ Password verification:', isValid ? 'PASS' : 'FAIL');
  
  const isInvalid = await PasswordUtils.verifyPassword('wrongPassword', storedPassword);
  console.log('✓ Wrong password verification:', !isInvalid ? 'PASS' : 'FAIL');
}

// 测试JWT工具函数
function testTokenUtils() {
  console.log('\nTesting TokenUtils...');
  
  const payload = { userId: '123', username: 'testuser', role: 'user' };
  const token = TokenUtils.generateToken(payload);
  console.log('✓ Token generated successfully');
  
  const decoded = TokenUtils.verifyToken(token);
  console.log('✓ Token verification:', decoded ? 'PASS' : 'FAIL');
  
  const invalidToken = TokenUtils.verifyToken('invalid.token.here');
  console.log('✓ Invalid token verification:', !invalidToken ? 'PASS' : 'FAIL');
  
  const extractedToken = TokenUtils.extractTokenFromHeader(`Bearer ${token}`);
  console.log('✓ Token extraction:', extractedToken === token ? 'PASS' : 'FAIL');
}

// 测试验证工具函数
function testValidationUtils() {
  console.log('\nTesting ValidationUtils...');
  
  const validUsername = ValidationUtils.validateUsername('testuser');
  console.log('✓ Valid username:', validUsername.isValid ? 'PASS' : 'FAIL');
  
  const invalidUsername = ValidationUtils.validateUsername('ab');
  console.log('✓ Invalid username:', !invalidUsername.isValid ? 'PASS' : 'FAIL');
  
  const validPassword = ValidationUtils.validatePassword('password123');
  console.log('✓ Valid password:', validPassword.isValid ? 'PASS' : 'FAIL');
  
  const invalidPassword = ValidationUtils.validatePassword('123');
  console.log('✓ Invalid password:', !invalidPassword.isValid ? 'PASS' : 'FAIL');
  
  const validQuantity = ValidationUtils.validateQuantity(10);
  console.log('✓ Valid quantity:', validQuantity.isValid ? 'PASS' : 'FAIL');
  
  const invalidQuantity = ValidationUtils.validateQuantity(-5);
  console.log('✓ Invalid quantity:', !invalidQuantity.isValid ? 'PASS' : 'FAIL');
}

// 测试API响应格式化
function testApiResponseFormatter() {
  console.log('\nTesting ApiResponseFormatter...');
  
  const successResponse = ApiResponseFormatter.success({ message: 'test' }, 'Success');
  console.log('✓ Success response created');
  
  const errorResponse = ApiResponseFormatter.error('Test error', 400);
  console.log('✓ Error response created');
  
  const notFoundResponse = ApiResponseFormatter.notFound('Resource not found');
  console.log('✓ Not found response created');
}

// 运行所有测试
async function runTests() {
  try {
    await testPasswordUtils();
    testTokenUtils();
    testValidationUtils();
    testApiResponseFormatter();
    console.log('\n✅ All utility function tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runTests();
}

export { runTests };