# Authentication & Authorization System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT REQUEST                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EXPRESS SERVER                           │
│                        (index.js - Port 5000)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   MIDDLEWARE    │
                    │  - CORS         │
                    │  - JSON Parser  │
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │     ROUTES      │
                    └─────────────────┘
                    │         │         │
        ┌───────────┘         │         └───────────┐
        ▼                     ▼                     ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│ Auth Routes │      │ User Routes │      │  Article    │
│ /api/auth/* │      │ /api/users/*│      │   Routes    │
└─────────────┘      └─────────────┘      │/api/articles│
                                           └─────────────┘
```

## Authentication Flow

```
1. REGISTRATION
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ POST /api/auth/register
          │ { username, email, password }
          ▼
   ┌─────────────────────┐
   │  authController     │
   │   - Validate input  │
   │   - Check existing  │
   │   - Hash password   │
   │   - Create user     │
   │   - Generate JWT    │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │    User Model       │
   │   - Save to DB      │
   │   - Role: 'user'    │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │   Response          │
   │ { success, user,    │
   │   token }           │
   └─────────────────────┘

2. LOGIN
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ POST /api/auth/login
          │ { email, password }
          ▼
   ┌─────────────────────┐
   │  authController     │
   │   - Find user       │
   │   - Compare password│
   │   - Generate JWT    │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │   Response          │
   │ { success, user,    │
   │   token }           │
   └─────────────────────┘

3. ACCESSING PROTECTED ROUTE
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ GET /api/auth/profile
          │ Header: Authorization: Bearer <token>
          ▼
   ┌─────────────────────┐
   │  authenticate       │
   │  middleware         │
   │   - Extract token   │
   │   - Verify JWT      │
   │   - Find user       │
   │   - Attach to req   │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │  Route Handler      │
   │  (req.user exists)  │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │   Response          │
   │ { success, user }   │
   └─────────────────────┘

4. ADMIN-ONLY ROUTE
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ GET /api/users
          │ Header: Authorization: Bearer <admin_token>
          ▼
   ┌─────────────────────┐
   │  authenticate       │
   │  middleware         │
   │   - Verify token    │
   │   - Attach user     │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │  isAdmin            │
   │  middleware         │
   │   - Check role      │
   │   - Allow/Deny      │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │  Route Handler      │
   │  (Admin action)     │
   └─────────┬───────────┘
             │
             ▼
   ┌─────────────────────┐
   │   Response          │
   │ { success, data }   │
   └─────────────────────┘
```

## Database Schema

```
┌─────────────────────────────────────┐
│          USERS COLLECTION           │
├─────────────────────────────────────┤
│ _id          : ObjectId             │
│ username     : String (unique)      │
│ email        : String (unique)      │
│ password     : String (hashed)      │
│ role         : String (user/admin)  │
│ createdAt    : Date                 │
│ updatedAt    : Date                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│        ARTICLES COLLECTION          │
├─────────────────────────────────────┤
│ _id          : ObjectId             │
│ title        : String               │
│ content      : String               │
│ author       : ObjectId (ref: User) │
│ status       : String (draft/pub)   │
│ createdAt    : Date                 │
│ updatedAt    : Date                 │
└─────────────────────────────────────┘
```

## Authorization Matrix

```
┌──────────────────────┬────────┬──────┬───────┐
│      ENDPOINT        │ PUBLIC │ USER │ ADMIN │
├──────────────────────┼────────┼──────┼───────┤
│ POST /auth/register  │   ✓    │  ✓   │   ✓   │
│ POST /auth/login     │   ✓    │  ✓   │   ✓   │
│ GET  /auth/profile   │   ✗    │  ✓   │   ✓   │
├──────────────────────┼────────┼──────┼───────┤
│ GET  /users          │   ✗    │  ✗   │   ✓   │
│ GET  /users/:id      │   ✗    │  ✗   │   ✓   │
│ DELETE /users/:id    │   ✗    │  ✗   │   ✓   │
├──────────────────────┼────────┼──────┼───────┤
│ GET  /articles       │   ✓    │  ✓   │   ✓   │
│ GET  /articles/:id   │   ✓    │  ✓   │   ✓   │
│ POST /articles       │   ✗    │  ✓   │   ✓   │
│ PUT  /articles/:id   │   ✗    │  ✓*  │   ✓   │
│ DELETE /articles/:id │   ✗    │  ✗   │   ✓   │
│ GET  /articles/my/*  │   ✗    │  ✓   │   ✓   │
└──────────────────────┴────────┴──────┴───────┘

* User can only update their own articles
```

## Middleware Chain

```
REQUEST → authenticate → isAdmin → Controller → RESPONSE
          │               │
          ▼               ▼
     Verify JWT      Check role
     Attach user     admin?
                         │
                         ├─ Yes → Continue
                         └─ No  → 403 Forbidden
```

## JWT Token Structure

```
┌─────────────────────────────────────┐
│            JWT TOKEN                │
├─────────────────────────────────────┤
│ HEADER                              │
│ {                                   │
│   "alg": "HS256",                   │
│   "typ": "JWT"                      │
│ }                                   │
├─────────────────────────────────────┤
│ PAYLOAD                             │
│ {                                   │
│   "userId": "507f1f77bcf86cd799439011"│
│   "iat": 1699999999,                │
│   "exp": 1700604799                 │
│ }                                   │
├─────────────────────────────────────┤
│ SIGNATURE                           │
│ HMACSHA256(                         │
│   base64UrlEncode(header) + "." +   │
│   base64UrlEncode(payload),         │
│   JWT_SECRET                        │
│ )                                   │
└─────────────────────────────────────┘
```

## Password Hashing Flow

```
Plain Password → bcrypt.genSalt(10) → Salt
                        │
                        ▼
              bcrypt.hash(password, salt) → Hashed Password
                                                    │
                                                    ▼
                                            Store in Database

Login:
Plain Password → bcrypt.compare(password, hashedPassword) → Boolean
                                                            │
                                                            ├─ true → Success
                                                            └─ false → Fail
```

## Error Handling Flow

```
Error Occurs
     │
     ▼
┌────────────────┐
│  Error Type?   │
└────────────────┘
     │
     ├─ ValidationError → 400 Bad Request
     ├─ CastError → 400 Bad Request
     ├─ JsonWebTokenError → 401 Unauthorized
     ├─ TokenExpiredError → 401 Unauthorized
     ├─ Duplicate Key → 400 Bad Request
     └─ Other → 500 Internal Server Error
```

## File Organization

```
backend/
├── index.js                 ← Server entry point
├── .env                     ← Environment config
├── package.json             ← Dependencies
│
├── models/                  ← Data models
│   ├── User.js             ← User schema + methods
│   └── Article.js          ← Article schema
│
├── controllers/            ← Business logic
│   ├── authController.js   ← Auth operations
│   ├── userController.js   ← User management
│   └── articleController.js← Article CRUD
│
├── middleware/             ← Request interceptors
│   └── auth.js            ← Authentication logic
│
└── routes/                 ← Route definitions
    ├── authRoutes.js       ← /api/auth/*
    ├── userRoutes.js       ← /api/users/*
    └── articleRoutes.js    ← /api/articles/*
```

## Security Features

```
┌─────────────────────────────────────┐
│        SECURITY LAYERS              │
├─────────────────────────────────────┤
│ 1. Password Hashing (bcrypt)        │
│    - 10 salt rounds                 │
│    - One-way encryption             │
├─────────────────────────────────────┤
│ 2. JWT Authentication               │
│    - Token-based auth               │
│    - 7-day expiration               │
│    - Secret key signing             │
├─────────────────────────────────────┤
│ 3. Input Validation                 │
│    - Email format                   │
│    - Password length                │
│    - Required fields                │
├─────────────────────────────────────┤
│ 4. Authorization Checks             │
│    - Role verification              │
│    - Ownership validation           │
│    - Route protection               │
├─────────────────────────────────────┤
│ 5. Data Sanitization                │
│    - Password removal from JSON     │
│    - Trim whitespace                │
│    - Lowercase email                │
└─────────────────────────────────────┘
```
