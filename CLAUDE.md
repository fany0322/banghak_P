# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Korean community app called "banghak_P" built with React Native, Expo, and TypeScript. The app features a board system, calendar functionality, user profiles, and authentication system organized in a tab-based navigation structure with Flask backend integration.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (opens options for iOS/Android/Web)
npx expo start

# Platform-specific development
npm run ios          # iOS simulator
npm run android      # Android emulator  
npm run web          # Web browser

# Linting
npm run lint         # Run ESLint using expo lint

# Reset project (moves starter code to app-example)
npm run reset-project
```

## Architecture

### File-Based Routing
The app uses Expo Router with file-based routing in the `app/` directory:
- `app/_layout.tsx` - Root layout with PostProvider context wrapper
- `app/(tabs)/` - Tab navigation group
- `app/(tabs)/boards/[boardId]/` - Dynamic board routing
- `app/(tabs)/popular/[postId].tsx` - Popular posts detail view

### Key Components and Systems

#### State Management
- **React Context**: `context/PostContext.tsx` manages posts, comments, and likes with backend API integration
- **AuthContext**: `context/AuthContext.tsx` handles user authentication and profile management
- **Zustand Store**: `stores/eventsStore.ts` handles calendar events with color coding

#### Board System
- `constants/boards.ts` defines board types and mock data
- Supports categories: 게시판, 정보, 홍보, 기타
- Dynamic routing: `/boards/[boardId]` and `/boards/[boardId]/[PostId]`

#### Navigation Structure
- Tab-based navigation with 4 main tabs: 홈, 게시판, 캘린더, 프로필
- Stack navigation within tabs for nested screens

### TypeScript Configuration
- Uses strict TypeScript settings
- Path alias `@/*` points to root directory
- Includes legacy JS file: `context/PostContext.js` (should be migrated to TS)

### Styling Approach
- React Native StyleSheet for component styling
- Custom themed components in `components/` directory
- Color constants in `constants/Colors.ts`

## Development Notes

### Board Post Flow
1. Posts created via `context/PostContext.tsx` with `addPost` function
2. Posts rendered using `components/PostCard.tsx` component
3. Comments and likes managed through context methods

### Calendar Integration
- Uses `react-native-calendars` library
- Event storage in Zustand with color-coded dots
- Server import functionality for bulk event creation

### Mock Data
- Board posts: `MOCK_POSTS` in `constants/boards.ts`
- Initial post data in PostContext provider

## Backend Integration

### Authentication System
- **Google OAuth 2.0**: School email verification for login
- **JWT Tokens**: Access and refresh token management
- **User Profile Setup**: Grade and class configuration after first login
- **AsyncStorage**: Local token and user data persistence

### API Service
- **Backend URL**: Configure in `.env` file (see `.env.example`)
- **Service Layer**: `services/api.ts` handles all backend communication
- **Error Handling**: Automatic token refresh and retry logic
- **Endpoints**: Posts, comments, votes, user profile management

### Database Models (Backend)
- **User**: Email, name, grade, class, student ID
- **Post**: Title, content, category, view count, votes
- **Comment**: Threaded commenting system with replies
- **Vote**: Upvote/downvote system for posts

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure Google OAuth client IDs
3. Set backend API URL based on your development environment
4. Install dependencies: `npm install`

### Backend Requirements
- Flask backend running on port 5000
- Google OAuth client configuration
- PostgreSQL/SQLite database
- CORS enabled for frontend domain