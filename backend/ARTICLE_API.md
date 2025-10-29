# Article CRUD API Documentation

## Article Model Schema

Each article has the following fields:

```javascript
{
  title: String (required, trimmed),
  content: String (required),
  tags: Array of Strings (default: []),
  summary: String (required, max 500 characters),
  createdBy: ObjectId (ref: User, required),
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## API Endpoints

### 1. Create Article (Protected)

**Endpoint:** `POST /api/articles`

**Authentication:** Required (Bearer token)

**Authorization:** Any authenticated user

**Request Body:**
```json
{
  "title": "Introduction to Node.js",
  "content": "Node.js is a powerful JavaScript runtime built on Chrome's V8 engine. It allows developers to build scalable network applications...",
  "summary": "A comprehensive guide to getting started with Node.js development.",
  "tags": ["nodejs", "javascript", "backend", "tutorial"]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Article created successfully.",
  "data": {
    "article": {
      "_id": "6543210abcdef...",
      "title": "Introduction to Node.js",
      "content": "Node.js is a powerful JavaScript runtime...",
      "summary": "A comprehensive guide to getting started with Node.js development.",
      "tags": ["nodejs", "javascript", "backend", "tutorial"],
      "createdBy": {
        "_id": "user123...",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user"
      },
      "createdAt": "2025-10-29T12:00:00.000Z",
      "updatedAt": "2025-10-29T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request:** Missing required fields
```json
{
  "success": false,
  "message": "Please provide title, content, and summary."
}
```

- **401 Unauthorized:** No token provided
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

---

### 2. Get All Articles (Public)

**Endpoint:** `GET /api/articles`

**Authentication:** Not required

**Query Parameters:**
- `tags` (optional) - Comma-separated list of tags to filter by
- `search` (optional) - Search term for title, content, or summary
- `limit` (optional) - Number of articles per page (default: 50)
- `page` (optional) - Page number (default: 1)

**Examples:**
```
GET /api/articles
GET /api/articles?tags=nodejs,javascript
GET /api/articles?search=tutorial
GET /api/articles?limit=10&page=2
GET /api/articles?tags=nodejs&search=beginner&limit=20
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 3,
  "data": {
    "articles": [
      {
        "_id": "article1...",
        "title": "Introduction to Node.js",
        "content": "Node.js is a powerful...",
        "summary": "A comprehensive guide...",
        "tags": ["nodejs", "javascript"],
        "createdBy": {
          "_id": "user1...",
          "username": "john_doe",
          "email": "john@example.com",
          "role": "user"
        },
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
      },
      // ... more articles
    ]
  }
}
```

---

### 3. Get Single Article (Public)

**Endpoint:** `GET /api/articles/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` - Article ID (MongoDB ObjectId)

**Example:**
```
GET /api/articles/6543210abcdef123456789ab
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "article": {
      "_id": "6543210abcdef...",
      "title": "Introduction to Node.js",
      "content": "Node.js is a powerful JavaScript runtime...",
      "summary": "A comprehensive guide to getting started with Node.js development.",
      "tags": ["nodejs", "javascript", "backend"],
      "createdBy": {
        "_id": "user123...",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user"
      },
      "createdAt": "2025-10-29T12:00:00.000Z",
      "updatedAt": "2025-10-29T12:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- **400 Bad Request:** Invalid article ID
```json
{
  "success": false,
  "message": "Invalid article ID."
}
```

- **404 Not Found:** Article not found
```json
{
  "success": false,
  "message": "Article not found."
}
```

---

### 4. Update Article (Protected - Owner or Admin)

**Endpoint:** `PUT /api/articles/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Article owner OR admin

**URL Parameters:**
- `id` - Article ID

**Request Body:** (All fields optional - only send what you want to update)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "summary": "Updated summary...",
  "tags": ["nodejs", "javascript", "updated"]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Article updated successfully.",
  "data": {
    "article": {
      "_id": "6543210abcdef...",
      "title": "Updated Title",
      "content": "Updated content...",
      "summary": "Updated summary...",
      "tags": ["nodejs", "javascript", "updated"],
      "createdBy": {
        "_id": "user123...",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user"
      },
      "createdAt": "2025-10-29T12:00:00.000Z",
      "updatedAt": "2025-10-29T12:30:00.000Z"
    }
  }
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

- **403 Forbidden:** Not the owner and not admin
```json
{
  "success": false,
  "message": "Not authorized to update this article. Only the owner or admin can update."
}
```

- **404 Not Found:** Article not found
```json
{
  "success": false,
  "message": "Article not found."
}
```

---

### 5. Delete Article (Admin Only)

**Endpoint:** `DELETE /api/articles/:id`

**Authentication:** Required (Bearer token)

**Authorization:** Admin only

**URL Parameters:**
- `id` - Article ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Article deleted successfully.",
  "data": {
    "deletedArticle": {
      "id": "6543210abcdef...",
      "title": "Introduction to Node.js"
    }
  }
}
```

**Error Responses:**

- **401 Unauthorized:** No token provided
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

- **403 Forbidden:** Not an admin
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

- **404 Not Found:** Article not found
```json
{
  "success": false,
  "message": "Article not found."
}
```

---

### 6. Get My Articles (Protected)

**Endpoint:** `GET /api/articles/my/articles`

**Authentication:** Required (Bearer token)

**Authorization:** Any authenticated user

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 3,
  "data": {
    "articles": [
      {
        "_id": "article1...",
        "title": "My First Article",
        "content": "Content here...",
        "summary": "Summary here...",
        "tags": ["personal", "blog"],
        "createdBy": {
          "_id": "user123...",
          "username": "john_doe",
          "email": "john@example.com",
          "role": "user"
        },
        "createdAt": "2025-10-29T12:00:00.000Z",
        "updatedAt": "2025-10-29T12:00:00.000Z"
      },
      // ... more articles by this user
    ]
  }
}
```

---

## cURL Examples

### Create Article
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Article",
    "content": "Article content here...",
    "summary": "This is a summary of my article.",
    "tags": ["nodejs", "tutorial"]
  }'
```

### Get All Articles
```bash
# Get all articles
curl http://localhost:5000/api/articles

# Filter by tags
curl "http://localhost:5000/api/articles?tags=nodejs,javascript"

# Search articles
curl "http://localhost:5000/api/articles?search=tutorial"

# Pagination
curl "http://localhost:5000/api/articles?limit=10&page=2"
```

### Get Single Article
```bash
curl http://localhost:5000/api/articles/ARTICLE_ID
```

### Update Article
```bash
curl -X PUT http://localhost:5000/api/articles/ARTICLE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "tags": ["updated", "nodejs"]
  }'
```

### Delete Article (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/articles/ARTICLE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Get My Articles
```bash
curl http://localhost:5000/api/articles/my/articles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## PowerShell Examples

### Create Article
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    title = "My Article"
    content = "Article content here..."
    summary = "This is a summary of my article."
    tags = @("nodejs", "tutorial")
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/articles" -Method Post -Headers $headers -Body $body
```

### Get All Articles
```powershell
# Get all articles
Invoke-RestMethod -Uri "http://localhost:5000/api/articles"

# With filters
Invoke-RestMethod -Uri "http://localhost:5000/api/articles?tags=nodejs&search=tutorial"
```

### Update Article
```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_TOKEN"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Updated Title"
    summary = "Updated summary"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/articles/ARTICLE_ID" -Method Put -Headers $headers -Body $body
```

---

## Authorization Matrix

| Endpoint | Method | Public | User | Admin |
|----------|--------|--------|------|-------|
| `/api/articles` | GET | ✅ | ✅ | ✅ |
| `/api/articles/:id` | GET | ✅ | ✅ | ✅ |
| `/api/articles` | POST | ❌ | ✅ | ✅ |
| `/api/articles/:id` | PUT | ❌ | ✅* | ✅ |
| `/api/articles/:id` | DELETE | ❌ | ❌ | ✅ |
| `/api/articles/my/articles` | GET | ❌ | ✅ | ✅ |

*User can only update their own articles. Admin can update any article.

---

## Field Validations

| Field | Required | Type | Validation |
|-------|----------|------|------------|
| `title` | Yes | String | Trimmed |
| `content` | Yes | String | - |
| `summary` | Yes | String | Max 500 characters, trimmed |
| `tags` | No | Array[String] | Default: [] |
| `createdBy` | Yes* | ObjectId | Auto-set from authenticated user |

*Automatically set from the authenticated user's ID

---

## Features

✅ **Pagination** - Control number of results and page  
✅ **Tag Filtering** - Filter articles by multiple tags  
✅ **Search** - Full-text search in title, content, and summary  
✅ **Authorization** - Owner or admin can edit, only admin can delete  
✅ **Population** - Author details automatically included  
✅ **Validation** - Field validation with descriptive error messages  
✅ **Error Handling** - Comprehensive error responses  
✅ **Timestamps** - Auto-generated createdAt and updatedAt  

---

## Testing Workflow

1. **Register/Login** to get authentication token
2. **Create an article** with POST request
3. **View all articles** (public access)
4. **Update your article** as the owner
5. **Try to update another user's article** (should fail)
6. **Login as admin** to delete any article
7. **Get your articles** using /my/articles endpoint

---

## Common Errors

### 400 Bad Request
- Missing required fields (title, content, summary)
- Invalid article ID format
- Summary exceeds 500 characters

### 401 Unauthorized
- No token provided
- Invalid token
- Expired token

### 403 Forbidden
- User trying to update another user's article
- User trying to delete an article (admin only)

### 404 Not Found
- Article ID doesn't exist in database

### 500 Internal Server Error
- Database connection issues
- Unexpected server errors
