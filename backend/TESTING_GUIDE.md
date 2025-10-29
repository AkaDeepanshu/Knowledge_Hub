# Testing the Updated Article API

## Quick Test Guide

### Prerequisites
- Server running on `http://localhost:5000`
- User registered and logged in with token

---

## Step 1: Register and Login

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Save the token from response!**

---

## Step 2: Create an Article

### PowerShell
```powershell
$token = "YOUR_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Understanding Node.js Event Loop"
    content = "The Node.js event loop is a fundamental concept that every developer should understand. It's what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. In this article, we'll explore how the event loop works, its phases, and best practices for writing efficient asynchronous code."
    summary = "A deep dive into the Node.js event loop, its phases, and how it enables non-blocking I/O operations."
    tags = @("nodejs", "javascript", "event-loop", "asynchronous", "tutorial")
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/articles" -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

### cURL (bash)
```bash
curl -X POST http://localhost:5000/api/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Node.js Event Loop",
    "content": "The Node.js event loop is a fundamental concept...",
    "summary": "A deep dive into the Node.js event loop.",
    "tags": ["nodejs", "javascript", "event-loop", "tutorial"]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Article created successfully.",
  "data": {
    "article": {
      "_id": "...",
      "title": "Understanding Node.js Event Loop",
      "content": "The Node.js event loop is a fundamental concept...",
      "summary": "A deep dive into the Node.js event loop.",
      "tags": ["nodejs", "javascript", "event-loop", "tutorial"],
      "createdBy": {
        "_id": "...",
        "username": "testuser",
        "email": "test@example.com",
        "role": "user"
      },
      "createdAt": "2025-10-29T...",
      "updatedAt": "2025-10-29T..."
    }
  }
}
```

**Save the article ID!**

---

## Step 3: Get All Articles (Public)

### PowerShell
```powershell
# Get all articles
$articles = Invoke-RestMethod -Uri "http://localhost:5000/api/articles"
$articles | ConvertTo-Json -Depth 10

# Filter by tags
$filtered = Invoke-RestMethod -Uri "http://localhost:5000/api/articles?tags=nodejs,javascript"
$filtered | ConvertTo-Json -Depth 10

# Search articles
$searched = Invoke-RestMethod -Uri "http://localhost:5000/api/articles?search=event loop"
$searched | ConvertTo-Json -Depth 10

# Pagination
$page2 = Invoke-RestMethod -Uri "http://localhost:5000/api/articles?limit=5&page=2"
$page2 | ConvertTo-Json -Depth 10
```

### cURL (bash)
```bash
# Get all articles
curl http://localhost:5000/api/articles

# Filter by tags
curl "http://localhost:5000/api/articles?tags=nodejs,javascript"

# Search
curl "http://localhost:5000/api/articles?search=event%20loop"

# Pagination
curl "http://localhost:5000/api/articles?limit=5&page=1"
```

---

## Step 4: Get Single Article

### PowerShell
```powershell
$articleId = "ARTICLE_ID_HERE"
$article = Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$articleId"
$article | ConvertTo-Json -Depth 10
```

### cURL
```bash
curl http://localhost:5000/api/articles/ARTICLE_ID_HERE
```

---

## Step 5: Update Article (Owner or Admin)

### PowerShell
```powershell
$token = "YOUR_TOKEN_HERE"
$articleId = "ARTICLE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Understanding Node.js Event Loop - Updated"
    summary = "An updated deep dive into the Node.js event loop with new examples."
    tags = @("nodejs", "javascript", "event-loop", "tutorial", "updated")
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$articleId" -Method Put -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

### cURL
```bash
curl -X PUT http://localhost:5000/api/articles/ARTICLE_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding Node.js Event Loop - Updated",
    "summary": "An updated deep dive...",
    "tags": ["nodejs", "javascript", "updated"]
  }'
```

---

## Step 6: Get My Articles

### PowerShell
```powershell
$token = "YOUR_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
}

$myArticles = Invoke-RestMethod -Uri "http://localhost:5000/api/articles/my/articles" -Headers $headers
$myArticles | ConvertTo-Json -Depth 10
```

### cURL
```bash
curl http://localhost:5000/api/articles/my/articles \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Step 7: Delete Article (Admin Only)

First, register an admin:

### PowerShell
```powershell
$body = @{
    username = "admin"
    email = "admin@example.com"
    password = "admin123"
    role = "admin"
} | ConvertTo-Json

$adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
$adminToken = $adminResponse.data.token
Write-Host "Admin Token: $adminToken"

# Now delete an article
$articleId = "ARTICLE_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $adminToken"
}

$deleteResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$articleId" -Method Delete -Headers $headers
$deleteResponse | ConvertTo-Json -Depth 10
```

### cURL
```bash
# Delete article with admin token
curl -X DELETE http://localhost:5000/api/articles/ARTICLE_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## Testing Authorization

### Test 1: User tries to update another user's article (Should FAIL)
```powershell
# Login as user1
$user1Token = "USER1_TOKEN"

# Try to update user2's article
$user2ArticleId = "USER2_ARTICLE_ID"

$headers = @{
    "Authorization" = "Bearer $user1Token"
    "Content-Type" = "application/json"
}

$body = @{ title = "Hacked!" } | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$user2ArticleId" -Method Put -Headers $headers -Body $body
} catch {
    Write-Host "Expected error: $($_.Exception.Message)"
}
```

**Expected Response:** 403 Forbidden

---

### Test 2: User tries to delete article (Should FAIL)
```powershell
$userToken = "USER_TOKEN"
$articleId = "ARTICLE_ID"

$headers = @{
    "Authorization" = "Bearer $userToken"
}

try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$articleId" -Method Delete -Headers $headers
} catch {
    Write-Host "Expected error: $($_.Exception.Message)"
}
```

**Expected Response:** 403 Forbidden (Admin privileges required)

---

### Test 3: Admin updates any article (Should SUCCEED)
```powershell
$adminToken = "ADMIN_TOKEN"
$anyArticleId = "ANY_ARTICLE_ID"

$headers = @{
    "Authorization" = "Bearer $adminToken"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Admin Updated This"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/articles/$anyArticleId" -Method Put -Headers $headers -Body $body
$response | ConvertTo-Json -Depth 10
```

**Expected Response:** 200 OK

---

## Complete Testing Script (PowerShell)

```powershell
# Article API Test Script
$baseUrl = "http://localhost:5000/api"

Write-Host "`n=== Article API Testing ===`n" -ForegroundColor Cyan

# 1. Register user
Write-Host "1. Registering user..." -ForegroundColor Yellow
$registerBody = @{
    username = "articleauthor"
    email = "author@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Headers @{"Content-Type"="application/json"} -Body $registerBody
$userToken = $registerResponse.data.token
Write-Host "✓ User registered. Token: $($userToken.Substring(0,20))..." -ForegroundColor Green

# 2. Create article
Write-Host "`n2. Creating article..." -ForegroundColor Yellow
$articleBody = @{
    title = "Test Article"
    content = "This is test content for the article API."
    summary = "A test article to verify the API functionality."
    tags = @("test", "api", "nodejs")
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $userToken"
    "Content-Type" = "application/json"
}

$createResponse = Invoke-RestMethod -Uri "$baseUrl/articles" -Method Post -Headers $headers -Body $articleBody
$articleId = $createResponse.data.article._id
Write-Host "✓ Article created. ID: $articleId" -ForegroundColor Green

# 3. Get all articles
Write-Host "`n3. Getting all articles..." -ForegroundColor Yellow
$allArticles = Invoke-RestMethod -Uri "$baseUrl/articles"
Write-Host "✓ Found $($allArticles.count) articles" -ForegroundColor Green

# 4. Get single article
Write-Host "`n4. Getting single article..." -ForegroundColor Yellow
$singleArticle = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId"
Write-Host "✓ Retrieved article: $($singleArticle.data.article.title)" -ForegroundColor Green

# 5. Update article
Write-Host "`n5. Updating article..." -ForegroundColor Yellow
$updateBody = @{
    title = "Updated Test Article"
    tags = @("test", "api", "nodejs", "updated")
} | ConvertTo-Json

$updateResponse = Invoke-RestMethod -Uri "$baseUrl/articles/$articleId" -Method Put -Headers $headers -Body $updateBody
Write-Host "✓ Article updated: $($updateResponse.data.article.title)" -ForegroundColor Green

# 6. Get my articles
Write-Host "`n6. Getting my articles..." -ForegroundColor Yellow
$myArticles = Invoke-RestMethod -Uri "$baseUrl/articles/my/articles" -Headers @{"Authorization"="Bearer $userToken"}
Write-Host "✓ Found $($myArticles.count) articles by current user" -ForegroundColor Green

# 7. Search articles
Write-Host "`n7. Searching articles..." -ForegroundColor Yellow
$searchResults = Invoke-RestMethod -Uri "$baseUrl/articles?search=test"
Write-Host "✓ Search found $($searchResults.count) articles" -ForegroundColor Green

Write-Host "`n=== All tests completed successfully! ===`n" -ForegroundColor Green
```

Save this as `test-articles.ps1` and run:
```powershell
.\test-articles.ps1
```

---

## Validation Test Cases

### Invalid Summary (Too Long)
```powershell
$body = @{
    title = "Test"
    content = "Content"
    summary = "A" * 501  # More than 500 characters
    tags = @("test")
} | ConvertTo-Json

# Should return 400 Bad Request
```

### Missing Required Fields
```powershell
$body = @{
    title = "Test"
    # Missing content and summary
} | ConvertTo-Json

# Should return 400 Bad Request
```

---

## Expected Responses Summary

| Action | Auth | Role | Expected Result |
|--------|------|------|----------------|
| Create article | Yes | Any | 201 Created |
| Get all articles | No | - | 200 OK |
| Get single article | No | - | 200 OK |
| Update own article | Yes | Owner | 200 OK |
| Update other's article | Yes | User | 403 Forbidden |
| Update any article | Yes | Admin | 200 OK |
| Delete article | Yes | User | 403 Forbidden |
| Delete article | Yes | Admin | 200 OK |
| Get my articles | Yes | Any | 200 OK |

---

## Tips

1. **Save tokens** - Store user and admin tokens in variables
2. **Save article IDs** - Keep track of created article IDs for testing
3. **Use pagination** - Test with different page and limit values
4. **Test filters** - Try different tag combinations
5. **Test search** - Search for various terms
6. **Test validation** - Try invalid data to verify error handling
7. **Test authorization** - Verify role-based access works correctly
