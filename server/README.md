# Tasker Server

This is the server-side implementation for the Tasker application, responsible for managing and processing tasks. Built with Fastify, PostgreSQL, Redis, and TypeScript.

## Features

- User authentication (Email/Password and Google OAuth)
- Task management (CRUD operations)
- Real-time task updates via Socket.IO
- Push notifications for task reminders
- API documentation with Swagger/OpenAPI

## Prerequisites

- Node.js (v22 or higher)
- Bun (package manager)
- Docker (v4.37 or higher for watch mode)
- Firebase project (for push notifications - name the service account key: firebase-service-account.json and put it in the root directory)
- Google Cloud project (for Google OAuth Web Client ID)

## Environment Variables

Create a `.env` file in the root directory, following the structure in `.env.example` for all required environment variables

## Getting Started

#### Note: If you want to use another package manager than Bun, then you need to change the docker and compose files and change the bun commands to the matching package manager commands.

1. Clone the repository

2. Install dependencies (using Bun):

   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev:docker
   ```

The server will be available at `http://localhost:8000`

## API Documentation

The API documentation is available at `http://localhost:8000/docs`

## Development

- Run tests: `bun test`
- Check types: `bun type-check`
- Format code: `bun format`
- Lint code: `bun lint`
- Run the database viewer: `bun run db:studio`

## Production Deployment

1. Build the application:

   ```bash
   bun build
   ```

2. Start the production server:
   ```bash
   bun run start
   ```
