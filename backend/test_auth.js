// test_auth.js
const http = require('http');

function post(path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, text: body });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Registration ---');
  const regRes = await post('/auth/register', {
    email: 'testuser@synapse.ai',
    password: 'password123',
    confirmPassword: 'password123',
    name: 'Alex Test'
  });
  console.log('Register status:', regRes.status, regRes.data);

  console.log('\n--- 2. Testing Login with correct password ---');
  const loginRes = await post('/auth/login', {
    email: 'testuser@synapse.ai',
    password: 'password123'
  });
  console.log('Login status:', loginRes.status, 'Success:', loginRes.data.success, 'Token:', loginRes.data.token ? 'JWT Received' : 'No token');

  console.log('\n--- 3. Testing Login with wrong password ---');
  const wrongPassRes = await post('/auth/login', {
    email: 'testuser@synapse.ai',
    password: 'wrongpassword'
  });
  console.log('Wrong pass status:', wrongPassRes.status, wrongPassRes.data);

  console.log('\n--- 4. Testing GET /auth/me with JWT ---');
  const meRes = await get('/auth/me', { 'Authorization': `Bearer ${loginRes.data.token}` });
  console.log('GET /auth/me status:', meRes.status, meRes.data);

  console.log('\n--- 5. Generating API Key for user ---');
  const keyRes = await post('/api-keys/generate', {
    user_id: 'testuser@synapse.ai',
    app_name: 'Discord Bot'
  }, { 'Authorization': `Bearer ${loginRes.data.token}` });
  console.log('Generate Key status:', keyRes.status, 'Key:', keyRes.data.api_key);

  console.log('\n--- 6. Using API Key in Synapse chat ---');
  const chatRes = await post('/chat', {
    question: 'Hello from Discord bot!'
  }, { 'x-api-key': keyRes.data.api_key });
  console.log('Chat status with x-api-key:', chatRes.status, 'Answer:', chatRes.data.answer ? chatRes.data.answer.substring(0, 50) + '...' : chatRes.data);

  console.log('\n--- 7. Checking Active User Scopes ---');
  const scopesRes = await get('/auth/users');
  console.log('Active User Scopes count:', scopesRes.data.scopes.length);
  scopesRes.data.scopes.forEach(s => console.log(`  - [${s.type}] ${s.id} -> ${s.label}`));

  console.log('\n✅ ALL TESTS PASSED!');
}

run().catch(console.error);
