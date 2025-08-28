# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web accessibility solution built with React + TypeScript + Vite. The application provides URL-based web accessibility reports with a user-friendly interface, designed to offer a differentiated SaaS solution for web accessibility testing.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview

# Type checking
tsc -b
```

## Architecture

### Tech Stack
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit with RTK Query for API calls
- **Styling**: Tailwind CSS with custom UI components
- **Routing**: React Router v7
- **Authentication**: JWT tokens with automatic refresh

### Project Structure

- `/src/app/` - Core application configuration (store, API setup)
  - `api.ts` - RTK Query base configuration with automatic token refresh
  - `store.ts` - Redux store with persist configuration

- `/src/features/` - Feature-based modules
  - `/api/` - RTK Query API endpoints (auth, scan, feedback, etc.)
  - `/store/` - Redux slices (user, menu)

- `/src/pages/` - Route components organized by feature
  - `/dashboard/` - Main scanning interface
  - `/scan-detail/` - Detailed accessibility reports
  - `/notion/` - Static content pages (terms, policies)

- `/src/components/` - Reusable components
  - `/common/` - Shared components (Header, Navigation, Auth)
  - `/ui/` - Base UI components (shadcn/ui based)

- `/src/hooks/` - Custom React hooks
- `/src/constants/` - Configuration constants
- `/src/types/` - TypeScript type definitions

### Key Architectural Patterns

1. **API Layer**: Uses RTK Query with separate `publicApi` and `privateApi` instances
   - `publicApi`: For unauthenticated endpoints (login, signup)
   - `privateApi`: For authenticated endpoints with automatic token refresh

2. **Authentication Flow**: JWT-based with refresh tokens
   - Access tokens stored in localStorage
   - Automatic token refresh on 401 responses using mutex to prevent race conditions
   - Redux persist for user state

3. **Routing**: Nested routing with layout components
   - `SimpleLayout`: Public pages
   - `BaseLayout`: Authenticated pages with navigation
   - `RequireAuth`: HOC for protected routes

4. **Path Aliases**: `@/` maps to `src/` directory for cleaner imports

## API Integration

The application connects to a backend API (configured via `VITE_API_BASE_URL` environment variable) that provides:
- Web accessibility scanning services
- User authentication and management
- Scan history and detailed reports
- Feedback and survey systems

## Testing Web Accessibility Features

The core functionality involves:
1. URL submission for accessibility scanning
2. Real-time scan status updates
3. Detailed categorized reports with issue descriptions
4. PDF report generation
5. Historical scan tracking