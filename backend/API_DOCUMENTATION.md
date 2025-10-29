# Authentication & Authorization API

This backend implements a complete authentication and authorization system with JWT tokens and role-based access control.

## Features

- ✅ User Registration & Login
- ✅ JWT Token Authentication
- ✅ Role-Based Authorization (Admin/User)
- ✅ Password Hashing with bcrypt
- ✅ Protected Routes
- ✅ Article Management System

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

## Running the Server

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication Routes

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### User Management Routes (Admin Only)

#### 1. Get All Users
```http
GET /api/users
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "users": [...]
  }
}
```

#### 2. Get User by ID
```http
GET /api/users/:id
Authorization: Bearer <admin_token>
```

#### 3. Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin_token>
```

### Article Routes

#### 1. Get All Articles (Public)
```http
GET /api/articles
```

#### 2. Get Article by ID (Public)
```http
GET /api/articles/:id
```

#### 3. Create Article (Protected)
```http
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Article",
  "content": "Article content here...",
  "status": "published"
}
```

#### 4. Update Article (Author or Admin)
```http
PUT /api/articles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### 5. Delete Article (Admin Only)
```http
DELETE /api/articles/:id
Authorization: Bearer <admin_token>
```

#### 6. Get My Articles (Protected)
```http
GET /api/articles/my/articles
Authorization: Bearer <token>
```

## Authorization Rules

### Admin Privileges
- ✅ Delete articles
- ✅ View all users
- ✅ Delete users
- ✅ Update any article

### User Privileges
- ✅ Create articles
- ✅ Update own articles
- ✅ View all articles
- ✅ View own profile

## Middleware

### `authenticate`
Verifies JWT token and attaches user object to request.

```javascript
const { authenticate } = require('./middleware/auth');
router.get('/protected', authenticate, controller);
```

### `isAdmin`
Checks if authenticated user has admin role.

```javascript
const { authenticate, isAdmin } = require('./middleware/auth');
router.delete('/resource/:id', authenticate, isAdmin, controller);
```

## Models

### User Model
```javascript
{
  username: String (required, unique, min: 3)
  email: String (required, unique, validated)
  password: String (required, hashed, min: 6)
  role: String (enum: ['user', 'admin'], default: 'user')
  timestamps: true
}
```

### Article Model
```javascript
{
  title: String (required)
  content: String (required)
  author: ObjectId (ref: User, required)
  status: String (enum: ['draft', 'published'], default: 'draft')
  timestamps: true
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Testing with cURL

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Access Protected Route
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Creating an Admin User

You'll need to manually update a user's role in the database to make them an admin:

1. Register a user normally
2. Connect to MongoDB and update the user:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Or you can register with role specified (in development):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"admin"}'
```

## Security Features

- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT token with 7-day expiration
- ✅ Password validation (minimum 6 characters)
- ✅ Email validation with regex
- ✅ Token verification on protected routes
- ✅ Role-based access control
- ✅ Password excluded from JSON responses

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Token authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variables
- **cors** - Cross-origin resource sharing
