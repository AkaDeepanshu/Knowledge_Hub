# Example Usage Scenarios

## Scenario 1: New User Registration and Article Creation

### Step 1: Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_writer",
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "_id": "6543210abcdef...",
      "username": "alice_writer",
      "email": "alice@example.com",
      "role": "user",
      "createdAt": "2025-10-29T10:30:00.000Z",
      "updatedAt": "2025-10-29T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 2: Create an article
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with Node.js",
    "content": "Node.js is a powerful JavaScript runtime...",
    "status": "published"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Article created successfully.",
  "data": {
    "article": {
      "_id": "article123...",
      "title": "Getting Started with Node.js",
      "content": "Node.js is a powerful JavaScript runtime...",
      "status": "published",
      "author": {
        "_id": "6543210abcdef...",
        "username": "alice_writer",
        "email": "alice@example.com"
      },
      "createdAt": "2025-10-29T10:35:00.000Z",
      "updatedAt": "2025-10-29T10:35:00.000Z"
    }
  }
}
```

---

## Scenario 2: Admin User Management

### Step 1: Register an admin user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "adminpass123",
    "role": "admin"
  }'
```

**Save admin token:** `admin_token_here...`

### Step 2: View all users (admin only)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer admin_token_here..."
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "users": [
      {
        "_id": "6543210abcdef...",
        "username": "alice_writer",
        "email": "alice@example.com",
        "role": "user",
        "createdAt": "2025-10-29T10:30:00.000Z"
      },
      {
        "_id": "admin123...",
        "username": "admin",
        "email": "admin@company.com",
        "role": "admin",
        "createdAt": "2025-10-29T10:40:00.000Z"
      }
    ]
  }
}
```

### Step 3: Delete a user (admin only)
```bash
curl -X DELETE http://localhost:5000/api/users/6543210abcdef... \
  -H "Authorization: Bearer admin_token_here..."
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully."
}
```

---

## Scenario 3: Unauthorized Access Attempts

### Attempt 1: User tries to view all users (should fail)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer user_token_here..."
```

**Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```
**Status Code:** 403 Forbidden

### Attempt 2: User tries to delete an article (should fail)
```bash
curl -X DELETE http://localhost:5000/api/articles/article123... \
  -H "Authorization: Bearer user_token_here..."
```

**Response:**
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```
**Status Code:** 403 Forbidden

### Attempt 3: No token provided (should fail)
```bash
curl -X GET http://localhost:5000/api/auth/profile
```

**Response:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```
**Status Code:** 401 Unauthorized

---

## Scenario 4: Login and Profile Management

### Step 1: Login with existing credentials
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "securepass123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "6543210abcdef...",
      "username": "alice_writer",
      "email": "alice@example.com",
      "role": "user"
    },
    "token": "new_token_here..."
  }
}
```

### Step 2: Get current user profile
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer new_token_here..."
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "6543210abcdef...",
      "username": "alice_writer",
      "email": "alice@example.com",
      "role": "user",
      "createdAt": "2025-10-29T10:30:00.000Z",
      "updatedAt": "2025-10-29T10:30:00.000Z"
    }
  }
}
```

---

## Scenario 5: Article Management

### Step 1: View all articles (public access)
```bash
curl -X GET http://localhost:5000/api/articles
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "articles": [
      {
        "_id": "article1...",
        "title": "Getting Started with Node.js",
        "content": "Node.js is a powerful...",
        "status": "published",
        "author": {
          "_id": "user1...",
          "username": "alice_writer",
          "email": "alice@example.com"
        },
        "createdAt": "2025-10-29T10:35:00.000Z"
      },
      // ... more articles
    ]
  }
}
```

### Step 2: Get a specific article
```bash
curl -X GET http://localhost:5000/api/articles/article1...
```

### Step 3: Update own article (user must be author)
```bash
curl -X PUT http://localhost:5000/api/articles/article1... \
  -H "Authorization: Bearer user_token..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated: Getting Started with Node.js",
    "content": "Updated content here...",
    "status": "published"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Article updated successfully.",
  "data": {
    "article": {
      "_id": "article1...",
      "title": "Updated: Getting Started with Node.js",
      "content": "Updated content here...",
      "status": "published",
      "author": {...},
      "updatedAt": "2025-10-29T11:00:00.000Z"
    }
  }
}
```

### Step 4: User tries to update another user's article (should fail)
```bash
curl -X PUT http://localhost:5000/api/articles/article_by_another_user... \
  -H "Authorization: Bearer user_token..." \
  -H "Content-Type: application/json" \
  -d '{"title": "Hacked!"}'
```

**Response:**
```json
{
  "success": false,
  "message": "Not authorized to update this article."
}
```
**Status Code:** 403 Forbidden

### Step 5: Admin deletes an article (should succeed)
```bash
curl -X DELETE http://localhost:5000/api/articles/article1... \
  -H "Authorization: Bearer admin_token..."
```

**Response:**
```json
{
  "success": true,
  "message": "Article deleted successfully."
}
```

---

## Scenario 6: Invalid Requests

### Invalid email format
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalid-email",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Please enter a valid email"
}
```
**Status Code:** 400 Bad Request

### Password too short
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters long"
}
```
**Status Code:** 400 Bad Request

### Wrong password
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "wrongpassword"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```
**Status Code:** 401 Unauthorized

### Expired token
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer expired_token_here..."
```

**Response:**
```json
{
  "success": false,
  "message": "Token expired."
}
```
**Status Code:** 401 Unauthorized

---

## Scenario 7: Complete Workflow (Frontend Integration)

### JavaScript/React Example

```javascript
// 1. Register
const register = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'john_doe',
      email: 'john@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
};

// 2. Login
const login = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'john@example.com',
      password: 'password123'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
};

// 3. Make authenticated requests
const createArticle = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'My Article',
      content: 'Article content...',
      status: 'published'
    })
  });
  
  const data = await response.json();
  return data;
};

// 4. Check if user is admin
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};

// 5. Conditional rendering based on role
const renderAdminPanel = () => {
  if (isAdmin()) {
    return <AdminPanel />;
  }
  return null;
};

// 6. Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login page
};
```

---

## Scenario 8: Testing with Postman

### Setup Collection Variables
```
base_url: http://localhost:5000/api
jwt_token: (will be set automatically)
admin_token: (will be set automatically)
```

### Test Sequence
1. **Register User** → Save token automatically
2. **Register Admin** → Save admin token
3. **Login** → Update token
4. **Create Article** → Use jwt_token, save article_id
5. **Get All Users** → Use admin_token (success)
6. **Get All Users** → Use jwt_token (should fail)
7. **Delete Article** → Use admin_token (success)
8. **Delete Article** → Use jwt_token (should fail)

---

## Common Status Codes

| Code | Meaning | When It Happens |
|------|---------|----------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | No token, invalid token, expired token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Unexpected server error |

---

## Tips for Frontend Developers

1. **Always store the token securely** (localStorage or httpOnly cookies)
2. **Send token in Authorization header** as `Bearer <token>`
3. **Handle 401 errors** by redirecting to login
4. **Handle 403 errors** by showing "Access Denied" message
5. **Validate user role** before showing admin UI elements
6. **Set token expiration** reminder (tokens expire in 7 days)
7. **Implement auto-logout** on token expiration
8. **Show loading states** during API calls
9. **Display error messages** from API responses
10. **Refresh token** before expiration (or implement refresh token flow)
