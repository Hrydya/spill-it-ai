# Spill It AI

An anonymous AI chat platform built with **Node.js, Express.js, MongoDB, and Google Gemini API**.

## Features

* **Anonymous Sessions** — HttpOnly cookie-based sessions with per-session conversation ownership and data isolation.
* **AI Chat** — Integrated with Gemini 2.5 Flash for conversational responses.
* **Streaming Responses** — Server-Sent Events (SSE) for incremental AI response delivery.
* **Conversation Management** — Create, retrieve, save, delete, and switch between conversations.
* **Context Summarization** — Rolling conversation summaries generated every 12 messages to prevent unbounded context growth while retaining full message history.
* **Rate Limiting** — Restricts excessive chat requests.
* **Request Validation** — Validates conversation IDs, message types, and message length.
* **Automatic Cleanup** — Unsaved conversations are removed when an anonymous session ends.

## Architecture

```text
Client
   │
   ▼
Express API
   │
   ├── Session Middleware
   │      └── HttpOnly Cookie → Session
   │
   ├── Conversation Routes
   │      └── MongoDB
   │
   └── Chat Route
          │
          ├── Rate Limiting
          ├── Request Validation
          ├── Context Retrieval
          │      ├── Rolling Summary
          │      └── Unsummarized Messages
          │
          ├── Gemini API
          │      └── SSE Stream
          │
          └── Message Persistence
```

## Context Management

The application uses a rolling summarization pipeline to prevent conversation context from growing indefinitely.

After every **12 messages**:

1. The existing summary and newly accumulated messages are sent to the summarization pipeline.
2. A new summary is generated and stored with the conversation.
3. `lastSummarizedMessageId` marks the latest message included in the summary.
4. Subsequent requests retrieve the stored summary and only messages created after this boundary.
5. Full message history remains persisted in MongoDB.

This keeps the model context bounded while preserving the complete conversation history.

## Performance

AI responses are streamed using **Server-Sent Events (SSE)** instead of waiting for the complete model response.

**Average TTFT improvement:**

`5.82s → 4.22s`

**27.6% reduction in time-to-first-token.**

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Frontend   | HTML, CSS, JavaScript    |
| Backend    | Node.js, Express.js      |
| Database   | MongoDB, Mongoose        |
| AI         | Google Gemini 2.5 Flash  |
| Streaming  | Server-Sent Events (SSE) |
| Deployment | Render                   |

## API Endpoints

```text
POST   /api/chat
POST   /api/session/end

POST   /api/conversations
GET    /api/conversations
GET    /api/conversations/:conversationId
GET    /api/conversations/:conversationId/messages
POST   /api/conversations/:conversationId/messages
PATCH  /api/conversations/:conversationId/save
DELETE /api/conversations/:conversationId
```

## Project Structure

```text
spill-it-ai/
├── config/
│   └── db.js
├── controllers/
│   ├── chatController.js
│   └── conversationController.js
├── middleware/
│   ├── rateLimiter.js
│   └── session.js
├── model/
│   ├── conversation.js
│   ├── Message.js
│   └── session.js
├── routes/
│   ├── chatRoutes.js
│   └── conversationRoutes.js
├── services/
│   ├── contextService.js
│   └── sessionCleanup.js
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
├── server.js
└── package.json
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file:

```env
PORT=3000
MONGO_URI=<mongodb-connection-string>
TOGETHER_API_KEY=<api-key>
NODE_ENV=development
```

### 3. Run the application

```bash
npm run dev
```

For production:

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```
