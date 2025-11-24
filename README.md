# Family App Backend

Node.js/Express backend API for Family Management App.

## 🚀 Features

- User authentication (JWT-based)
- Family member management
- MongoDB integration
- RESTful API
- Security middleware (Helmet, CORS, Rate Limiting)

## 🛠️ Tech Stack

- Node.js 18+ with TypeScript
- Express.js
- MongoDB (Mongoose)
- JWT authentication
- Winston logging
- Zod validation

## 📦 Setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB connection string and JWT secret
```

### Environment Variables

Create a `.env` file in the backend folder root:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key_minimum_32_characters
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost
JWT_EXPIRES_IN=7d
```

**Important**: 
- `.env` file should be in the **backend folder root** (same level as `package.json`)
- Never commit `.env` to git (it's in `.gitignore`)
- For production, use AWS Secrets Manager (configured in ECS task definition)

### Run

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at `http://localhost:5000`

## 🐳 Docker

```bash
# Build Docker image
docker build -t family-app-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  family-app-backend
```

## 🚀 Deployment

This repository is configured with GitHub Actions CI/CD:

- **Automatic deployment** on PR merge to `main` branch
- **Builds Docker image** and pushes to AWS ECR
- **Updates ECS service** automatically

### GitHub Secrets Required

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### AWS Resources

- **ECR Repository**: `family-app-backend`
- **ECS Cluster**: `family-app-cluster`
- **ECS Service**: `backend-service`
- **Secrets Manager**: `family-app/mongodb-uri`, `family-app/jwt-secret`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Family Members
- `GET /api/family` - Get all family members (Protected)
- `POST /api/family` - Add family member (Protected)
- `PUT /api/family/:id` - Update family member (Protected)
- `DELETE /api/family/:id` - Delete family member (Protected)

### Health Check
- `GET /api/health` - Health check endpoint

## 📚 Documentation

- [CI/CD Setup](../SEPARATE_REPOS_SETUP.md)
- [Migration Guide](../MIGRATION_TO_SEPARATE_REPOS.md)
- [Security Documentation](./SECURITY.md)

## 🔗 Related Repositories

- Frontend: [family-app-frontend](https://github.com/Zriyaz/family-app-frontend)

