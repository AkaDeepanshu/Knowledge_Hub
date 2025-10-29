# Authentication & Authorization - Quick Reference

## 🚀 Setup Complete!

Your authentication system is now fully implemented with the following features:

### ✅ Implemented Features

1. **User Registration** (`POST /api/auth/register`)
   - Default role: `user`
   - Password hashing with bcrypt
   - JWT token generation

2. **User Login** (`POST /api/auth/login`)
   - Email/password authentication
   - Returns JWT token

3. **JWT Authentication Middleware**
   - Validates tokens on protected routes
   - Attaches user object to request

4. **Role-Based Authorization**
   - `authenticate` - Verifies JWT token
   - `isAdmin` - Checks for admin role

5. **Admin-Only Features**
   - ✅ Delete articles
   - ✅ View all users
   - ✅ Delete users
   - ✅ View user by ID

---

## 📁 Project Structure

```
backend/
├── index.js                          # Main server file
├── package.json                      # Dependencies
├── .env                              # Environment variables
├── API_DOCUMENTATION.md              # Full API documentation
├── postman_collection.json           # Postman collection
├── test-api.js                       # API test script
│
├── models/
│   ├── User.js                       # User model (username, email, password, role)
│   └── Article.js                    # Article model
│
├── controllers/
│   ├── authController.js             # register, login, getProfile
│   ├── userController.js             # getAllUsers, getUserById, deleteUser
│   └── articleController.js          # CRUD operations for articles
│
├── middleware/
│   └── auth.js                       # authenticate, isAdmin, isAdminOrOwner
│
└── routes/
    ├── authRoutes.js                 # /api/auth/*
    ├── userRoutes.js                 # /api/users/* (admin only)
    └── articleRoutes.js              # /api/articles/*
```

---

## 🔐 Authorization Matrix

| Endpoint | Method | Public | User | Admin |
|----------|--------|--------|------|-------|
| `/api/auth/register` | POST | ✅ | ✅ | ✅ |
| `/api/auth/login` | POST | ✅ | ✅ | ✅ |
| `/api/auth/profile` | GET | ❌ | ✅ | ✅ |
| `/api/users` | GET | ❌ | ❌ | ✅ |
| `/api/users/:id` | GET | ❌ | ❌ | ✅ |
| `/api/users/:id` | DELETE | ❌ | ❌ | ✅ |
| `/api/articles` | GET | ✅ | ✅ | ✅ |
| `/api/articles/:id` | GET | ✅ | ✅ | ✅ |
| `/api/articles` | POST | ❌ | ✅ | ✅ |
| `/api/articles/:id` | PUT | ❌ | ✅* | ✅ |
| `/api/articles/:id` | DELETE | ❌ | ❌ | ✅ |
| `/api/articles/my/articles` | GET | ❌ | ✅ | ✅ |

*User can only update their own articles

---

## 🧪 Quick Test Commands

### Using cURL (PowerShell)

```powershell
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}'

# 2. Login
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'

# 3. Get profile (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/auth/profile `
  -H "Authorization: Bearer TOKEN"

# 4. Create article (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/articles `
  -H "Authorization: Bearer TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"title\":\"My Article\",\"content\":\"Content here\",\"status\":\"published\"}'
```

---

## 🔑 Environment Variables

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a strong random string in production!

---

## 📝 Testing Guide

### Option 1: Use Postman
1. Import `postman_collection.json` into Postman
2. The collection automatically saves tokens
3. Test all endpoints with proper authentication

### Option 2: Use Node.js Test Script
```bash
node test-api.js
```

### Option 3: Use cURL commands
See the commands above or check `API_DOCUMENTATION.md`

---

## 🎯 Creating an Admin User

**Method 1: During Registration (Development Only)**
```json
POST /api/auth/register
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

**Method 2: Update in MongoDB**
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🛡️ Security Features Implemented

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ Password validation (min 6 characters)
- ✅ Email validation with regex
- ✅ Username validation (min 3 characters)
- ✅ Token verification on protected routes
- ✅ Role-based access control (RBAC)
- ✅ Password excluded from JSON responses
- ✅ CORS enabled
- ✅ Input validation on all endpoints

---

## 📊 Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 🔄 JWT Token Usage

1. **Register/Login** → Receive token in response
2. **Store token** → In frontend (localStorage, cookies, etc.)
3. **Send token** → In Authorization header:
   ```
   Authorization: Bearer <your_token_here>
   ```
4. **Token expires** → After 7 days, user must login again

---

## 🐛 Troubleshooting

### "Access denied. No token provided."
- Make sure you're sending the token in the Authorization header
- Format: `Authorization: Bearer <token>`

### "Access denied. Admin privileges required."
- Your user doesn't have admin role
- Check user role in database or create an admin user

### "Invalid token."
- Token might be expired or malformed
- Login again to get a new token

### "MongoDB connection error"
- Check your MONGODB_URI in .env file
- Make sure MongoDB is running and accessible

---

## 📚 Additional Resources

- Full API Documentation: `API_DOCUMENTATION.md`
- Postman Collection: `postman_collection.json`
- Test Script: `test-api.js`

---

## 🎉 Ready to Use!

Your authentication system is fully functional. Start testing with:

```bash
npm run dev
```

Server will run on: **http://localhost:5000**

Happy coding! 🚀
