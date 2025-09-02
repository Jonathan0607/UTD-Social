# UTD Social Backend

A Node.js backend API for the UTD Social mobile application, built with Express, TypeScript, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **User Management**: Profile management, following/followers system
- **Social Posts**: Create, read, update, delete posts with location support
- **Real-time Features**: Feed generation, post interactions (likes, comments)
- **Location Services**: Geospatial queries for location-based posts
- **Security**: Input validation, authentication middleware, error handling

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, bcryptjs

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/utd-social
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas connection string
   ```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (with search and pagination)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/:id/follow` - Follow a user
- `DELETE /api/users/:id/follow` - Unfollow a user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get user's following list

### Posts
- `POST /api/posts` - Create a new post
- `GET /api/posts` - Get all posts (with filtering and pagination)
- `GET /api/posts/feed` - Get personalized feed
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like/unlike a post

## Data Models

### User
- Basic info: username, email, password, firstName, lastName
- Profile: profilePicture, bio, major, graduationYear, interests
- Social: followers, following
- Metadata: role, isVerified, lastActive, timestamps

### Post
- Content: text content, media URLs, tags
- Location: coordinates (longitude, latitude), address, place name
- Social: likes, comments, shares
- Settings: visibility, category, expiration
- Metadata: author, timestamps

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Express Validator for all inputs
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers and protection
- **Rate Limiting**: Built-in Express rate limiting
- **Error Handling**: Centralized error handling with sanitization

## Development Workflow

1. **Code Changes**: Edit TypeScript files in `src/` directory
2. **Auto-reload**: Nodemon automatically restarts server on file changes
3. **Type Checking**: TypeScript compilation with strict mode
4. **Linting**: ESLint with TypeScript rules
5. **Testing**: Manual testing with Postman or similar tools

## Production Deployment

1. **Build**: `npm run build` creates optimized JavaScript in `dist/` folder
2. **Environment**: Set `NODE_ENV=production` and configure production MongoDB
3. **Process Manager**: Use PM2 or similar for process management
4. **Reverse Proxy**: Nginx or Apache for load balancing
5. **SSL**: Configure HTTPS with Let's Encrypt or similar

## Contributing

1. Follow TypeScript best practices
2. Use meaningful commit messages
3. Test API endpoints thoroughly
4. Update documentation for new features
5. Follow the established code style

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and connection string is correct
2. **Port Conflicts**: Check if port 3001 is available
3. **TypeScript Errors**: Run `npm run build` to check for compilation errors
4. **Environment Variables**: Verify `.env` file exists and contains required values

### Debug Mode

Enable debug logging by setting `DEBUG=*` in your environment variables.

## License

This project is part of the UTD Social application suite. 