const axios = require('axios');

async function testAuth() {
  const apiUrl = 'http://localhost:3069';
  const timestamp = Date.now();
  const testEmail = `user_${timestamp}@test.com`;

  console.log('Testing Authentication APIs...\n');
  console.log(`Test email: ${testEmail}\n`);

  // Test Registration
  console.log('1. Testing Registration...');
  try {
    const regResponse = await axios.post(`${apiUrl}/api/auth/register`, {
      email: testEmail,
      password: 'password123',
      name: 'New Test User'
    });
    console.log('✓ Registration successful');
    console.log('  Token:', regResponse.data.data.token.substring(0, 30) + '...');
    console.log('  User:', JSON.stringify(regResponse.data.data.user, null, 2));
  } catch (error) {
    console.log('✗ Registration failed:', error.response?.data?.message || error.message);
    console.log('  Status:', error.response?.status);
    console.log('  Data:', JSON.stringify(error.response?.data, null, 2));
  }

  console.log('\n2. Testing Login with new account...');
  try {
    const loginResponse = await axios.post(`${apiUrl}/api/auth/login`, {
      email: testEmail,
      password: 'password123'
    });
    console.log('✓ Login successful');
    console.log('  Token:', loginResponse.data.data.token.substring(0, 30) + '...');
  } catch (error) {
    console.log('✗ Login failed:', error.response?.data?.message || error.message);
  }

  console.log('\n========================================');
  console.log('Auth API Tests Complete');
  console.log('========================================');
}

testAuth();
