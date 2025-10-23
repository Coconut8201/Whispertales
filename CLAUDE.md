# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Whispertales is a full-stack AI-powered storytelling platform that combines story generation, voice synthesis, and image creation. The project consists of a TypeScript/Node.js backend and a React/TypeScript frontend, designed to create interactive children's books with AI-generated content, images, and narration.

## Monorepo Structure

```
Whispertales/
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── app.ts              # Application entry point
│   │   ├── Routers.ts          # Centralized route registration
│   │   ├── database.ts         # Database module exports (ConnectionManager, services)
│   │   ├── controller/         # Request handlers
│   │   ├── routers/            # Route definitions (StoryRoute, UserRoute, etc.)
│   │   ├── models/             # Mongoose schemas
│   │   ├── middleware/         # Express middleware
│   │   ├── services/           # Business logic (GridFSStorageService)
│   │   ├── database/services/  # Data access layer (StoryService, UserService)
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Helper utilities and AI integrations
│   └── build/        # Compiled JavaScript output
└── frontend/         # React/Vite web application
    ├── src/
    │   ├── App.tsx             # Route configuration
    │   ├── components/         # Page components and UI library
    │   ├── view/               # Static pages
    │   ├── services/           # API client services
    │   └── utils/              # Helper utilities
    └── dist/         # Production build output
```

## Backend Development

### Commands (run in `/backend` directory)
- **Build**: `pnpm run build` - Compiles TypeScript to JavaScript in `./build`
- **Development**: `pnpm run dev` - Runs TypeScript compiler in watch mode with nodemon
- **Development (kill port)**: `pnpm run noportdev` - Kills port 7943 before starting dev server
- **Production**: `pnpm start` - Runs compiled application from `./build/app.js`

### Backend Architecture

**Application Entry**: `src/app.ts` initializes Express server with middleware stack and database connection using singleton pattern (`ConnectionManager`)

**Route Registration**: `src/Routers.ts` centralizes all route registration. Routes are conditionally loaded based on `NODE_ENV` (debug routes only in development)

**Middleware Stack Order** (defined in `app.ts`):
1. CORS with credential support
2. Cookie parser
3. JSON body parser
4. Request logger (`requestLogger`)
5. Response middleware (`responseMiddleware`)
6. Application routes
7. 404 handler (`notFoundHandler`)
8. Global error handler (`errorHandler`)

**Route Structure**:
- `/user/*` - Authentication (login/register), logout, profile management, ownership verification
- `/story/*` - Story generation, retrieval, image generation, favorites management
- `/voice/*` - Audio upload, voice synthesis, voice model training
- `/debug/*` - Debug endpoints (development only)

**Authentication System**:
- Uses JWT tokens stored in HTTP-only cookies
- Middleware: `authenticateToken` (in `middleware/autherMiddleware.ts`)
- Type-safe user injection via `req.user` (see `types/express.d.ts`)
- Supports dual token sources: cookies and Authorization header

**Database Architecture**:
- MongoDB via Mongoose with singleton connection pattern
- **Connection Management**: `ConnectionManager` in `database.ts` (exported from `database/index.ts`)
- **Legacy Wrapper**: `utils/DataBase.ts` provides backward compatibility but delegates to new modular services
- **Data Access Layer**: Service classes in `database/services/`
  - `StoryService`: Story CRUD operations
  - `UserService`: User management and authentication
- **Models**: `models/userModel.ts`, `models/storyModel.ts`
- **File Storage**: GridFS for images via `services/GridFSStorageService.ts`
  - Stores base64 images as text in GridFS (no binary conversion)
  - Must call `GridFSStorageService.initializeBucket()` after database connection
  - Bucket name: "images"

**AI/ML Integrations** (in `utils/tools/`):
- LLM: Ollama, OpenAI API
- Image Generation: Stable Diffusion
- Voice: Whisper (speech-to-text), F5-TTS (text-to-speech)
- Audio Processing: FFmpeg
- Text Processing: Google Translate, OpenCC (Chinese conversion)

**File Uploads**: Handled by Multer middleware (`middleware/multerMiddleware.ts`)

**Key Configuration**:
- Server Port: 7943 (default)
- TypeScript: ES6 target, CommonJS modules
- Environment Variables: MongoDB connection, CORS origins, API keys

## Frontend Development

### Commands (run in `/frontend` directory)
- **Development**: `pnpm run dev` - Starts Vite dev server on port 3151
- **Build**: `pnpm run build` - TypeScript compilation + Vite production build
- **Lint**: `pnpm run lint` - ESLint with TypeScript support
- **Preview**: `pnpm run preview` - Preview production build locally

### Frontend Architecture

**Framework**: React 18 with TypeScript, Vite build tool (port 3151)

**Routing** (defined in `src/App.tsx`):
- `/login` - User login (Login component)
- `/login/register` - User registration (Register component)
- `/style` - Story style selection (Creating component)
- `/style/role` - Character creation (Advanced component)
- `/style/role/startStory` - Story generation initiation (StartStory component)
- `/voice` - Voice management (Voice component)
- `/bookmanage` - Book library management (BookManage component)
- `/mybook` - Book reader (MyBook component)
- `/PdfTest` - PDF generation testing
- `/instruction`, `/user_setting`, `/faq`, `/about_us` - Static view pages
- `/test` - Test component
- `/ui-demo` - Children's UI component showcase (ChildrenUIDemo)

**Component Organization**:
- `components/` - Main page components (Login, Register, Creating, etc.)
- `components/ui/` - Reusable UI components (button, card, badge, loading, etc.)
- `components/story/` - Story-specific components (StyleSelector, CharacterForm, StoryReader, etc.)
- `view/` - Static pages (FAQ, Instruction, UserSetting, AboutUs)
- `utils/` - Helper utilities (pdfGenerator.tsx)

**Key Features**:
- PDF generation and download for stories
- Interactive flip-book reader (StoryFlipBook)
- Voice recording and synthesis controls
- Image style gallery and selection
- Character and relationship management forms

**Styling**: 
- Tailwind CSS with custom configuration
- Bootstrap 5.3 integration
- Shadcn UI components (button, card, input, etc.)
- Path alias: `@` → `./src`

**Notable Dependencies**:
- React Router for navigation
- React PDF for document generation/viewing
- Socket.io client for real-time updates
- FontAwesome icons
- Radix UI primitives

## Development Workflow

### Type Safety
- Backend uses custom Express type extensions (`types/express.d.ts`) for authenticated requests
- Use `AuthenticatedRequest` type for routes protected by `authenticateToken` middleware
- Frontend components use TypeScript with strict mode enabled

### Authentication Flow
1. User authenticates via `/user/login` or `/user/adduser`
2. Backend issues JWT stored in HTTP-only cookie
3. Frontend includes cookie automatically; can also use Authorization header
4. Protected routes use `authenticateToken` middleware
5. Access user data via `req.user` (type-safe)

### Story Generation Flow
1. User selects style and configures characters (`/style`, `/style/role`)
2. Initiates story generation (`/style/role/startStory`)
3. Backend orchestrates LLM for text, Stable Diffusion for images
4. Frontend can request voice synthesis for narration
5. Complete story viewable in book reader with download options

### Environment Setup
- Backend requires `.env` with MongoDB connection string, CORS origins, JWT secret, and AI service API keys
- Frontend connects to backend API (configure in Vite proxy or environment variables)
- Both projects use `pnpm` for package management

## Critical Architecture Patterns

### Backend Initialization Sequence
The application **must** initialize in this exact order (see `app.ts:initializeApp()`):
1. Database connection (`ConnectionManager.getInstance().connect()`)
2. GridFS initialization (`GridFSStorageService.initializeBucket()`)
3. Express server startup

Failure to follow this sequence will cause GridFS operations to fail.

### Route Class Pattern
All routes follow a class-based pattern implementing `RouteHandler` interface:
- Must have `getRouter()` method returning Express Router
- Registered centrally in `Routers.ts`
- Example: `StoryRoute`, `UserRoute`, `VoiceRoute`, `ImageRoute`, `DebugRoute`

### Service Layer Architecture
The codebase uses a **three-tier data access pattern**:
1. **Controllers** (`controller/*.ts`) - Handle HTTP requests/responses
2. **Service Layer** (`database/services/*.ts`) - Business logic and data validation
3. **Models** (`models/*.ts`) - Mongoose schemas and database structure

**Important**: New database operations should use service classes (`StoryService`, `UserService`), not the legacy `DataBase` class.

### Image Storage Strategy
Images are stored as **binary data** in GridFS (converted from base64):
- **存儲流程**: `GridFSStorageService.saveImageFromBase64()` 接收 base64 字串 → 解碼成二進制 Buffer → 存入 GridFS
  - 節省約 33% 儲存空間（base64 編碼會增加 33% 體積）
- **讀取流程**: `GridFSStorageService.getImageBase64()` 從 GridFS 讀取二進制數據 → 轉換回 base64 字串
- Frontend 接收 `data:image/xxx;base64,...` 格式的完整 data URI（可直接用於 `<img src="...">` ）
- 每張圖片的 metadata 包含: `storyId`, `index`, `contentType`, `originalSize`, `binarySize`, `uploadDate`

## Important Notes

- **語言**: 回覆以及程式碼備註盡量使用繁體中文
- **程式碼兼容性**: 除非有顯性要求，否則不要寫兼容程式碼（如舊版瀏覽器支援、polyfills 等）
- **Middleware Order**: CORS and cookie-parser must come before route handlers in backend
- **Authentication**: Always use `authenticateToken` from `middleware/autherMiddleware.ts` (not the old `authMiddleware` from utils)
- **Database Connection**: Singleton pattern ensures only one MongoDB connection across the application
- **Debug Routes**: Automatically excluded in production builds based on `NODE_ENV`
- **Port Conflicts**: Use `noportdev` script if port 7943 is already in use
- **File Uploads**: Audio/image files processed through Multer middleware with appropriate size limits
- **TypeScript Compilation**: Backend uses CommonJS modules, Frontend uses ESNext modules
