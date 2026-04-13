# Spill It AI

Overshare. Overthink. Outta here.

A lightweight anonymous AI chat web app where users can freely vent their thoughts without login, without memory, and without judgment. Everything is ephemeral — nothing is stored.

---

## Live Demo
https://spill-it-ai.onrender.com/

---

## Features

### Anonymous AI Chat
- No login required
- No user tracking
- No message storage (ephemeral conversations)

### Natural Conversation Flow
- Context-aware AI replies using last few messages
- Casual, non-judgmental tone designed for venting

### Fast & Lightweight UI
- Minimal chat interface
- Typing animation for AI responses
- Smooth chat experience

### Rate Limiting
- IP-based rate limiting (15 requests/minute)
- Prevents spam and abuse

---

## Key Concept

### Ephemeral Conversation Architecture
- No database used for storing chats
- Messages exist only during the session
- Zero login friction
- Privacy-first design (nothing is saved)

---

## Tech Stack

Frontend: HTML, CSS, Vanilla JavaScript  
Backend: Node.js, Express.js, dotenv  
AI: Gemini 2.5 Flash (Google Generative Language API)

---

## Project Structure

spill-it-ai/
├── server.js  
├── controllers/  
│   └── chatController.js  
├── routes/  
│   └── chatRoutes.js  
├── middleware/  
│   └── rateLimiter.js  
├── api/  
│   └── chat.js  
├── public/  
│   ├── index.html  
│   ├── script.js  
│   └── style.css  

---

## How It Works

1. User types a message in chat UI  
2. Frontend sends chat history to backend  
3. Backend forwards last few messages to AI API  
4. AI generates a short, casual response  
5. Frontend displays response with typing animation  
6. No conversation is stored anywhere  

---

## Setup Instructions

Clone repo:
git clone https://github.com/your-username/spill-it-ai.git  
cd spill-it-ai  

Install dependencies:
npm install  

Create .env file:
PORT=5000  
TOGETHER_API_KEY=your_api_key_here  

Run project:
npm run dev  

---

## Rate Limit

15 requests per minute per IP  
Returns 429 Too Many Requests when exceeded  

---

## Note

This project uses a free AI API, so response speed and availability may vary depending on usage limits.

---

## Future Improvements

- Streaming responses  
- Better mobile UI  
- Optional session memory mode  
- Improved error handling UX
