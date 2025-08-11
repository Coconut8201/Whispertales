# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Whispertales is an AI-powered storytelling platform that combines story generation, voice synthesis, and image creation. The project is built around a Node.js/TypeScript backend using Express.js with MongoDB for data persistence.

## Development Commands

### Backend Development (in `/backend` directory)
- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `./build` directory
- **Development**: `npm run dev` - Runs TypeScript compiler in watch mode with nodemon for auto-restart
- **Development (kill port)**: `npm run noportdev` - Same as dev but kills port 7943 first
- **Production**: `npm start` - Runs the compiled application from `./build/app.js`
- **Process Management**: PM2 configuration available in `ecosystem.config.js` for production deployment

### Project Structure
```
backend/
├── src/
│   ├── app.ts              # Main application entry point
│   ├── Routers.ts          # Central route registration
│   ├── controller/         # Business logic handlers
│   │   ├── storyController.ts    # Story generation and management
│   │   ├── userController.ts     # User authentication and profiles
│   │   └── voiceController.ts    # Voice processing and synthesis
│   ├── models/             # MongoDB schemas
│   │   ├── storyModel.ts   # Story data structure
│   │   └── userModel.ts    # User data structure
│   ├── routers/            # API route definitions
│   │   ├── StoryRoute.ts   # /story/* endpoints
│   │   ├── userRoute.ts    # /user/* endpoints
│   │   └── VoiceRoute.ts   # /voice/* endpoints
│   ├── middleware/         # Request processing middleware
│   │   ├── autherMiddleware.ts   # JWT authentication
│   │   └── multerMiddleware.ts   # File upload handling
│   ├── utils/              # Helper utilities and integrations
│   │   ├── DataBase.ts     # MongoDB connection management
│   │   └── tools/          # AI/ML service integrations
└── build/                  # Compiled JavaScript output
```

## Architecture

### Core Features
1. **Story Management**: AI-powered story generation using LLM integration with image generation via Stable Diffusion
2. **User System**: JWT-based authentication with personal story libraries and favorites
3. **Voice Processing**: Speech-to-text (Whisper) and text-to-speech (F5-TTS) with custom voice model training

### Key Technologies
- **Backend**: Node.js, TypeScript, Express.js, Mongoose (MongoDB)
- **Authentication**: JWT with HTTP-only cookies
- **AI Integration**: Ollama, OpenAI API, Stable Diffusion models
- **Voice/Audio**: FFmpeg, Microsoft Speech SDK, Whisper, F5-TTS
- **Utilities**: Google Translate, OpenCC (Chinese text conversion)

### Route Structure
- `/user/*` - Authentication, registration, profile management
- `/story/*` - Story generation, retrieval, image generation, favorites
- `/voice/*` - Audio upload, voice synthesis, voice model management

### Environment Requirements
- MongoDB connection via `process.env.mongoDB_api`
- CORS configuration via `process.env.CORS_Options`
- Various API keys for AI services (OpenAI, Google Cloud, etc.)

## Development Notes

- Server runs on port 7943 by default
- TypeScript compiled to ES6 with CommonJS modules
- Middleware stack includes CORS, cookie-parser, and JSON parsing
- File uploads handled via Multer for audio/image processing
- Authentication middleware protects sensitive endpoints
- Extended timeouts configured for AI generation processes