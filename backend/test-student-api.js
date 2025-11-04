const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/students';

async function testStudentAPI() {
  console.log('🧪 Testing Student API...\n');

  try {
    // Test 1: Store a record
    console.log('1️⃣ Testing POST /store...');
    const storeResponse = await axios.post(`${API_BASE}/store`, {
      roll: '101',
      name: 'John Doe',
      marks: '85',
      attendance: '92'
    });
    console.log('✅ Store Response:', JSON.stringify(storeResponse.data, null, 2));

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 2: Store another record
    console.log('\n2️⃣ Storing another record...');
    const store2Response = await axios.post(`${API_BASE}/store`, {
      roll: '102',
      name: 'Jane Smith',
      marks: '92',
      attendance: '88'
    });
    console.log('✅ Store Response:', JSON.stringify(store2Response.data, null, 2));

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test 3: List all records
    console.log('\n3️⃣ Testing GET /list...');
    const listResponse = await axios.get(`${API_BASE}/list`);
    console.log('✅ List Response:', JSON.stringify(listResponse.data, null, 2));

    // Test 4: Get status
    console.log('\n4️⃣ Testing GET /status...');
    const statusResponse = await axios.get(`${API_BASE}/status`);
    console.log('✅ Status Response:', JSON.stringify(statusResponse.data, null, 2));

    console.log('\n✨ All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testStudentAPI();
