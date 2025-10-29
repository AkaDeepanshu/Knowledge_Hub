# Knowledge Hub - Article Management System with AI Summarization

A full-stack web application for managing articles with AI-powered summarization, user authentication, role-based access control, and version tracking.

## � Documentation

- **[Production Deployment Guide](./RENDER_DEPLOYMENT.md)** - Complete guide for deploying to Render with Docker
- **[Environment Variables Setup](./RENDER_ENV_SETUP.md)** - Quick reference for Render configuration
- **[Production Checklist](./PRODUCTION_CHECKLIST.md)** - Pre-deployment verification checklist
- **[LLM Configuration](./LLM_CONFIGURATION.md)** - AI provider setup and switching guide

## �🚀 Features

- **User Authentication**: JWT-based authentication with role-based access (Admin/User)
- **Article Management**: Create, read, update, and delete articles
- **AI Summarization**: Generate article summaries using Google Gemini AI
- **Version Control**: Track article edit history with version snapshots
- **Rate Limiting**: Protect LLM endpoints from abuse (5 requests per 15 minutes per user)
- **Advanced Search**: Filter articles by title, content, tags, and author
- **Pagination**: Efficient article browsing with first/last page navigation
- **Dark Mode**: Toggle between light and dark themes with persistent preferences
- **Responsive UI**: Mobile-friendly design with modern React components

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google AI API Key (for Gemini AI)
- npm or yarn package manager

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: Google Gemini AI (`@google/genai` package)
- **Rate Limiting**: express-rate-limit
- **Security**: bcryptjs, CORS, helmet

### Frontend
- **Framework**: React 19
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: Vite
- **Styling**: Pure CSS with CSS variables for theming

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AkaDeepanshu/Knowledge_Hub.git
cd Knowledge_Hub
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (see `.env.example` in root):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Update `frontend/src/utils/api.js` if your backend runs on a different port:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5000) | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `NODE_ENV` | Environment mode (development/production) | No |

### Getting API Keys

#### MongoDB Atlas (Free Tier)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free M0 tier available)
3. Go to Database Access → Add New Database User
4. Go to Network Access → Add IP Address (allow 0.0.0.0/0 for development)
5. Click "Connect" → "Connect your application" → Copy connection string
6. Replace `<password>` with your database user password

#### Google Gemini AI API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add to your `.env` file as `GEMINI_API_KEY`

**Note**: The free tier includes 15 requests per minute with rate limiting.

## 🚀 Running the Application

### Development Mode

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### Production Build

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

## 🤖 LLM Configuration

### Current Provider: **Google Gemini AI**

The application uses **Google Gemini 2.0 Flash Experimental** model for AI summarization.

#### Configuration Details

**Model**: `gemini-2.0-flash-exp`  
**Package**: `@google/genai`  
**Endpoint**: `/api/articles/:id/summarize`  
**Rate Limit**: 5 requests per 15 minutes per user

#### Implementation

Located in `backend/services/llmService.js`:

```javascript
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const summarizeWithGemini = async (content) => {
  const genModel = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  });

  const result = await genModel.generateContent(
    `Summarize the following article in 2-3 sentences:\n\n${content}`
  );

  return result.response.text();
};
```

### Switching LLM Providers

To use a different LLM provider (OpenAI, Anthropic, etc.):

1. Install the provider's SDK:
   ```bash
   npm install openai  # Example for OpenAI
   ```

2. Update `backend/services/llmService.js`:
   ```javascript
   import OpenAI from 'openai';
   
   const openai = new OpenAI({
     apiKey: process.env.OPENAI_API_KEY,
   });
   
   export const summarizeWithOpenAI = async (content) => {
     const response = await openai.chat.completions.create({
       model: 'gpt-4',
       messages: [
         { role: 'system', content: 'You are a helpful assistant that summarizes articles.' },
         { role: 'user', content: `Summarize the following article:\n\n${content}` }
       ],
     });
     return response.choices[0].message.content;
   };
   ```

3. Update `backend/controllers/articleController.js` to use the new function

### Mocking LLM for Testing

To mock the LLM service without API calls:

Create `backend/services/mockLlmService.js`:

```javascript
export const mockSummarize = async (content) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock summary
  const wordCount = content.split(' ').length;
  return `This is a mock summary of an article with approximately ${wordCount} words. The article discusses various topics and provides insights into the subject matter.`;
};
```

Update `backend/controllers/articleController.js`:

```javascript
// Toggle between real and mock
const USE_MOCK = process.env.USE_MOCK_LLM === 'true';

// Import based on environment
const { summarizeWithGemini } = USE_MOCK 
  ? await import('../services/mockLlmService.js')
  : await import('../services/llmService.js');
```

Add to `.env`:
```env
USE_MOCK_LLM=true  # Set to false for real API calls
```

## 🐳 Docker Setup

### Using Docker Compose (Recommended)

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - MONGO_URI=${MONGO_URI}
      - JWT_SECRET=${JWT_SECRET}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NODE_ENV=production
    depends_on:
      - mongo
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    restart: unless-stopped

volumes:
  mongo-data:
```

### Dockerfiles

#### Backend Dockerfile (`backend/Dockerfile`)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile (`frontend/Dockerfile`)

```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

#### Nginx Configuration (`frontend/nginx.conf`)

```nginx
server {
    listen 3000;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Running with Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Article Endpoints

| Method | Endpoint | Description | Auth Required | Admin Only |
|--------|----------|-------------|---------------|------------|
| GET | `/api/articles` | Get all articles (with filters) | No | No |
| GET | `/api/articles/:id` | Get single article | No | No |
| POST | `/api/articles` | Create new article | Yes | No |
| PUT | `/api/articles/:id` | Update article | Yes | Owner/Admin |
| DELETE | `/api/articles/:id` | Delete article | Yes | **Yes** |
| POST | `/api/articles/:id/summarize` | Generate AI summary | Yes | Owner/Admin |
| GET | `/api/articles/:id/versions` | Get article version history | Yes | Owner/Admin |
| GET | `/api/articles/:id/versions/:versionNumber` | Get specific version | Yes | Owner/Admin |

### Query Parameters (GET /api/articles)

- `search` - Search in title and content
- `tags` - Filter by tags (comma-separated)
- `author` - Filter by author username
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## 👥 User Roles

### Admin
- Can create, read, update articles
- Can delete **any** article (admin-only privilege)
- Can access all version histories
- Can generate summaries for any article

### Regular User
- Can create, read, update **own** articles
- Cannot delete articles (admin-only)
- Can access own article version histories
- Can generate summaries for own articles

### Creating Admin User

After registering a user, manually update their role in MongoDB:

```javascript
// Using MongoDB Compass or mongosh
db.users.updateOne(
  { username: "admin_username" },
  { $set: { role: "admin" } }
)
```

Or use MongoDB Atlas UI:
1. Browse Collections → users
2. Find your user document
3. Edit → Change `role: "user"` to `role: "admin"`
4. Update

## 🔒 Rate Limiting

### LLM Endpoint Rate Limits
- **5 requests per 15 minutes** per user
- Applied to: `POST /api/articles/:id/summarize`
- Error: `429 Too Many Requests`

### Auth Endpoint Rate Limits
- **10 requests per 15 minutes** per IP address
- Applied to: `/api/auth/register`, `/api/auth/login`
- IPv6 compatible with `ipKeyGenerator`

## 🎨 Features in Detail

### Article Versioning
- Automatic version snapshots on every update
- Track changes with edit reasons
- View complete version history
- Restore previous versions

### Dark Mode
- Toggle between light and dark themes
- Persistent preference in localStorage
- Applies globally across all pages
- Smooth transitions with CSS variables

### Advanced Search
- Real-time search in title and content
- Filter by tags and author
- MongoDB text indexes for performance
- Debounced search input

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📝 Project Structure

```
Knowledge_Hub/
├── backend/
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Auth, rate limiting, error handling
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # LLM service
│   ├── index.js          # Server entry point
│   └── package.json
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React contexts (Auth, Theme)
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API client, helpers
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   └── package.json
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify `GEMINI_API_KEY` is valid

### Frontend can't connect to backend
- Confirm backend is running on port 5000
- Check CORS settings in `backend/index.js`
- Verify `API_BASE_URL` in `frontend/src/utils/api.js`

### AI Summarization fails
- Verify `GEMINI_API_KEY` is correct
- Check rate limit (15 requests/minute for free tier)
- Review error logs in backend terminal
- Use mock LLM service for testing without API calls

### Dark mode issues
- Clear browser localStorage and refresh
- Check browser console for errors
- Ensure ThemeProvider wraps entire app in `main.jsx`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Deepanshu Agarwal**
- GitHub: [@AkaDeepanshu](https://github.com/AkaDeepanshu)
- Repository: [Knowledge_Hub](https://github.com/AkaDeepanshu/Knowledge_Hub)

## 🙏 Acknowledgments

- Google Gemini AI for article summarization
- MongoDB Atlas for database hosting
- React team for the amazing framework
- Express.js community for backend tools
