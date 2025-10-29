// Test script for Authentication & Authorization API
// Run this file with: node test-api.js

const BASE_URL = 'http://localhost:5000/api';

let userToken = '';
let adminToken = '';
let articleId = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('API Call Error:', error);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  // Test 1: Register a regular user
  console.log('1️⃣  Testing User Registration (Regular User)...');
  const registerUser = await apiCall('/auth/register', 'POST', {
    username: 'testuser',
    email: 'testuser@example.com',
    password: 'password123'
  });
  console.log('Response:', JSON.stringify(registerUser, null, 2));
  if (registerUser.data?.data?.token) {
    userToken = registerUser.data.data.token;
    console.log('✅ User registered successfully\n');
  } else {
    console.log('❌ User registration failed\n');
  }

  // Test 2: Register an admin user
  console.log('2️⃣  Testing Admin Registration...');
  const registerAdmin = await apiCall('/auth/register', 'POST', {
    username: 'adminuser',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Response:', JSON.stringify(registerAdmin, null, 2));
  if (registerAdmin.data?.data?.token) {
    adminToken = registerAdmin.data.data.token;
    console.log('✅ Admin registered successfully\n');
  } else {
    console.log('❌ Admin registration failed\n');
  }

  // Test 3: Login
  console.log('3️⃣  Testing Login...');
  const login = await apiCall('/auth/login', 'POST', {
    email: 'testuser@example.com',
    password: 'password123'
  });
  console.log('Response:', JSON.stringify(login, null, 2));
  console.log(login.status === 200 ? '✅ Login successful\n' : '❌ Login failed\n');

  // Test 4: Get Profile (Protected Route)
  console.log('4️⃣  Testing Get Profile (Protected)...');
  const profile = await apiCall('/auth/profile', 'GET', null, userToken);
  console.log('Response:', JSON.stringify(profile, null, 2));
  console.log(profile.status === 200 ? '✅ Profile fetched successfully\n' : '❌ Profile fetch failed\n');

  // Test 5: Create Article (User)
  console.log('5️⃣  Testing Create Article (User)...');
  const createArticle = await apiCall('/articles', 'POST', {
    title: 'My First Article',
    content: 'This is the content of my first article.',
    status: 'published'
  }, userToken);
  console.log('Response:', JSON.stringify(createArticle, null, 2));
  if (createArticle.data?.data?.article?._id) {
    articleId = createArticle.data.data.article._id;
    console.log('✅ Article created successfully\n');
  } else {
    console.log('❌ Article creation failed\n');
  }

  // Test 6: Get All Articles (Public)
  console.log('6️⃣  Testing Get All Articles (Public)...');
  const allArticles = await apiCall('/articles', 'GET');
  console.log('Response:', JSON.stringify(allArticles, null, 2));
  console.log(allArticles.status === 200 ? '✅ Articles fetched successfully\n' : '❌ Articles fetch failed\n');

  // Test 7: Get All Users (Admin Only)
  console.log('7️⃣  Testing Get All Users (Admin Only)...');
  
  // Try with user token (should fail)
  console.log('   Trying with user token (should fail)...');
  const usersWithUserToken = await apiCall('/users', 'GET', null, userToken);
  console.log('Response:', JSON.stringify(usersWithUserToken, null, 2));
  console.log(usersWithUserToken.status === 403 ? '✅ Correctly denied access\n' : '❌ Should have denied access\n');
  
  // Try with admin token (should succeed)
  console.log('   Trying with admin token (should succeed)...');
  const usersWithAdminToken = await apiCall('/users', 'GET', null, adminToken);
  console.log('Response:', JSON.stringify(usersWithAdminToken, null, 2));
  console.log(usersWithAdminToken.status === 200 ? '✅ Admin access granted\n' : '❌ Admin access failed\n');

  // Test 8: Delete Article (Admin Only)
  console.log('8️⃣  Testing Delete Article (Admin Only)...');
  
  // Try with user token (should fail)
  console.log('   Trying with user token (should fail)...');
  const deleteWithUserToken = await apiCall(`/articles/${articleId}`, 'DELETE', null, userToken);
  console.log('Response:', JSON.stringify(deleteWithUserToken, null, 2));
  console.log(deleteWithUserToken.status === 403 ? '✅ Correctly denied access\n' : '❌ Should have denied access\n');
  
  // Try with admin token (should succeed)
  console.log('   Trying with admin token (should succeed)...');
  const deleteWithAdminToken = await apiCall(`/articles/${articleId}`, 'DELETE', null, adminToken);
  console.log('Response:', JSON.stringify(deleteWithAdminToken, null, 2));
  console.log(deleteWithAdminToken.status === 200 ? '✅ Admin deleted article successfully\n' : '❌ Admin delete failed\n');

  // Test 9: Access Protected Route Without Token
  console.log('9️⃣  Testing Access Protected Route Without Token...');
  const noToken = await apiCall('/auth/profile', 'GET');
  console.log('Response:', JSON.stringify(noToken, null, 2));
  console.log(noToken.status === 401 ? '✅ Correctly denied access\n' : '❌ Should have denied access\n');

  console.log('✨ All tests completed!');
}

// Run the tests
runTests().catch(console.error);
