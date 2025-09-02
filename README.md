# UTD Social

A comprehensive social media application for UTD students, featuring a React Native mobile app with a Node.js backend API.

## 🏗️ Project Structure

```
UTD Social/
├── utd-map-app/          # React Native Expo app (Frontend)
├── backend/              # Node.js Express API (Backend)
├── package.json          # Root package.json with workspace scripts
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **Expo CLI** (for mobile development)
- **iOS Simulator** or **Android Emulator** (for mobile testing)

### Installation

1. **Clone and install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Set up environment variables:**
   ```bash
   cd backend
   cp env.example .env
   # Edit .env with your MongoDB connection and JWT secret
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string in .env
   ```

### Development

#### Start Both Frontend and Backend
```bash
# Start both servers simultaneously
npm run dev
```

#### Start Individual Services
```bash
# Backend only (API server)
npm run dev:backend

# Frontend only (React Native app)
npm run dev:frontend
```

## 📱 Frontend (React Native)

The mobile app is built with **Expo** and **React Native**, providing a native mobile experience.

### Features
- **User Authentication**: Login/registration with JWT
- **Social Feed**: Personalized posts from followed users
- **Location Services**: Map integration for location-based posts
- **User Profiles**: Rich user profiles with following/followers
- **Post Creation**: Create posts with text, media, and location
- **Real-time Updates**: Live feed updates and notifications

### Tech Stack
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context + Hooks
- **UI Components**: Custom themed components
- **Maps**: React Native Maps integration
- **Icons**: Expo Vector Icons

### Development Commands
```bash
cd utd-map-app

# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web

# Lint code
npm run lint
```

## 🔧 Backend (Node.js)

A robust REST API built with **Express** and **TypeScript**, providing all the backend services for the mobile app.

### Features
- **RESTful API**: Complete CRUD operations for users and posts
- **Authentication**: JWT-based user authentication and authorization
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Input validation and sanitization
- **Security**: CORS, Helmet, rate limiting
- **Location Services**: Geospatial queries for location-based features

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **Validation**: Express Validator
- **Security**: Helmet, CORS

### Development Commands
```bash
cd backend

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
npm run lint:fix
```

## 🌐 API Endpoints

### Base URL: `http://localhost:3001`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | User registration | ❌ |
| `POST` | `/api/auth/login` | User login | ❌ |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `PUT` | `/api/auth/profile` | Update profile | ✅ |
| `GET` | `/api/users` | Get all users | ✅ |
| `GET` | `/api/users/:id` | Get user by ID | ✅ |
| `POST` | `/api/users/:id/follow` | Follow user | ✅ |
| `GET` | `/api/posts` | Get all posts | ✅ |
| `GET` | `/api/posts/feed` | Get personalized feed | ✅ |
| `POST` | `/api/posts` | Create post | ✅ |
| `GET` | `/api/posts/:id` | Get post by ID | ✅ |
| `PUT` | `/api/posts/:id` | Update post | ✅ |
| `DELETE` | `/api/posts/:id` | Delete post | ✅ |
| `POST` | `/api/posts/:id/like` | Like/unlike post | ✅ |

## 🗄️ Database Schema

### Users Collection
- **Authentication**: username, email, password (hashed)
- **Profile**: firstName, lastName, profilePicture, bio
- **Academic**: major, graduationYear, interests
- **Social**: followers[], following[]
- **Metadata**: role, isVerified, lastActive, timestamps

### Posts Collection
- **Content**: text content, media URLs, tags
- **Location**: coordinates (longitude, latitude), address
- **Social**: likes[], comments[], shares[]
- **Settings**: visibility, category, expiration
- **Metadata**: author, timestamps

## 🔐 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **CORS Protection**: Configurable cross-origin resource sharing
- **Security Headers**: Helmet for additional security
- **Error Handling**: Centralized error handling with sanitization

## 🚀 Deployment

### Backend Deployment
1. Build the TypeScript code: `npm run build:backend`
2. Set production environment variables
3. Use PM2 or similar process manager
4. Configure reverse proxy (Nginx/Apache)
5. Set up SSL certificates

### Frontend Deployment
1. Build the Expo app: `npm run build:frontend`
2. Deploy to app stores (iOS App Store, Google Play)
3. Configure push notifications
4. Set up analytics and crash reporting

## 🧪 Testing

### Backend Testing
- Manual API testing with Postman or similar tools
- Unit testing setup (can be added with Jest)
- Integration testing for database operations

### Frontend Testing
- Expo development tools for debugging
- React Native debugging tools
- Device testing on physical devices

## 📚 Development Workflow

1. **Feature Development**: Create feature branches from main
2. **Backend First**: Implement API endpoints and test with Postman
3. **Frontend Integration**: Connect React Native app to backend APIs
4. **Testing**: Test on both iOS and Android devices/simulators
5. **Code Review**: Review and merge feature branches
6. **Deployment**: Deploy backend first, then frontend

## 🤝 Contributing

1. Follow the established code style and patterns
2. Use meaningful commit messages
3. Test thoroughly on both platforms
4. Update documentation for new features
5. Follow the Git workflow

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Port Conflicts**: Check if ports 3000 (frontend) and 3001 (backend) are available
3. **Expo Issues**: Clear Expo cache with `expo r -c`
4. **TypeScript Errors**: Run `npm run build:backend` to check compilation
5. **Environment Variables**: Verify `.env` file exists in backend directory

### Getting Help

- Check the individual README files in `utd-map-app/` and `backend/`
- Review the API documentation in the backend README
- Check console logs for detailed error messages
- Ensure all dependencies are properly installed

## 📄 License

This project is part of the UTD Social application suite.

## 🙏 Acknowledgments

- UTD community for inspiration
- Expo team for the excellent development platform
- React Native community for the robust mobile framework
- MongoDB team for the flexible database solution
