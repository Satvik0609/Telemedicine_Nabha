# SehatSetu Rural Telemedicine App - Complete Setup Guide

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Step 1: Clone and Install Dependencies
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd SehatSetu

# Install all dependencies
npm install
```

### Step 2: Environment Setup
Create a `.env` file in the root directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/sehatsetu"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="1h"

# Encryption Configuration
ENCRYPTION_KEY="your-32-character-encryption-key"

# Firebase Configuration (for authentication)
FIREBASE_API_KEY="your-firebase-api-key"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
FIREBASE_APP_ID="your-app-id"

# Server Configuration
PORT=3000
NODE_ENV=development

# External APIs
ENDLESSMEDICAL_API_KEY="your-endlessmedical-api-key"
```

### Step 3: Database Setup
```bash
# Push database schema
npm run db:push
```

### Step 4: Run the Application

#### Option A: Run Both Client and Server Together
```bash
# Start development server (includes both frontend and backend)
npm run dev
```

#### Option B: Run Client and Server Separately
```bash
# Terminal 1: Start the backend server
npm run dev:server

# Terminal 2: Start the frontend client
npm run dev:client
```

### Step 5: Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## 🏗️ Development Commands

```bash
# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
```

## 📱 Application Features

### User Roles
1. **Patient**: Book appointments, video consultations, manage health records
2. **Doctor**: Manage appointments, conduct consultations, write prescriptions
3. **Pharmacist**: Manage medicine stock, process prescriptions
4. **Admin**: User management, analytics, system administration

### Key Features
- 🔐 **Authentication**: Firebase Auth with role-based access
- 📹 **Video Consultation**: WebRTC with Jitsi fallback
- 🤖 **AI Symptom Checker**: Offline-capable multilingual analysis
- 💊 **Medicine Management**: Real-time stock tracking
- 📊 **Analytics Dashboard**: Comprehensive health insights
- 🌐 **Multilingual**: Hindi, Punjabi, English support
- 📱 **Offline-First**: Works without internet connection
- 🔒 **Security**: End-to-end encryption, FHIR compliance

## 🛠️ Troubleshooting

### Common Issues

#### 1. NODE_ENV not recognized (Windows)
**Solution**: Use the updated scripts with `cross-env`:
```bash
npm run dev
```

#### 2. Database Connection Issues
**Solution**: Check your DATABASE_URL in `.env` file and ensure PostgreSQL is running.

#### 3. Firebase Authentication Issues
**Solution**: Verify Firebase configuration in `.env` file.

#### 4. Port Already in Use
**Solution**: Change the PORT in `.env` file or kill the process using the port.

### Development Tips

1. **Hot Reload**: Both client and server support hot reloading
2. **Type Safety**: Run `npm run check` to verify TypeScript compilation
3. **Database Changes**: Use `npm run db:push` after schema changes
4. **Production Build**: Use `npm run build` before deployment

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production
Ensure all environment variables are properly set in your production environment.

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Ensure all dependencies are installed correctly
4. Verify environment configuration

## 🎯 Next Steps

1. Set up your database (PostgreSQL)
2. Configure Firebase authentication
3. Set up environment variables
4. Run the application
5. Test all features with different user roles

Happy coding! 🎉
