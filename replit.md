# Overview

Sehat Nabha is a comprehensive rural healthcare platform that bridges the gap between rural communities and modern medical services. The application provides telemedicine capabilities, health record management, medicine availability tracking, and AI-powered symptom checking to make healthcare accessible in remote areas. Built as a full-stack web application with multilingual support (Hindi, Punjabi, English), it addresses the unique challenges of rural healthcare delivery through technology.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React Context for global state (auth, language)
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Authentication**: Firebase Authentication with Google OAuth integration
- **Real-time Communication**: WebSocket implementation for video consultations and live features
- **Offline Support**: IndexedDB-based offline storage for health records, appointments, and medicines
- **Multilingual**: Complete i18n support for Hindi, Punjabi, and English

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Real-time**: WebSocket server integration with HTTP server
- **API Integration**: EndlessMedical API for free medical diagnosis and symptom analysis
- **Development**: Vite middleware integration for seamless development experience

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Offline Storage**: Browser IndexedDB for offline-first capabilities
- **File Storage**: Firebase Storage for profile pictures and medical documents
- **Session Management**: Express sessions with PostgreSQL store

## Authentication and Authorization
- **Primary Auth**: Firebase Authentication with Google OAuth
- **User Management**: Custom user profiles stored in PostgreSQL linked via Firebase UID
- **Role-Based Access**: Patient and doctor roles with different permissions
- **Session Handling**: Server-side session management for API security
- **Auto-provisioning**: Automatic user creation on first login

## External Service Integrations
- **AI Diagnosis**: EndlessMedical API for free medical symptom analysis and diagnosis suggestions
- **Video Calls**: WebRTC implementation for peer-to-peer video consultations
- **Maps/Location**: Integrated pharmacy location services
- **Emergency Services**: Direct integration with emergency helpline (108)
- **Push Notifications**: Browser-based notifications for appointments and health alerts

The architecture follows a modern full-stack pattern with offline-first capabilities, real-time communication, and comprehensive healthcare-specific features designed for rural accessibility and multilingual support.