# Portfolio Backend API

A clean, scalable backend server for [Manik's Portfolio Website](https://github.com/manikkDev/portfolio-web-frontend) — built with **Express.js** and **Supabase (PostgreSQL)**.

## 🏗️ Architecture

This backend follows a **clean layered architecture** pattern:

```
src/
├── config/         # Environment, Supabase client, constants
├── controllers/    # Request handling & response formatting
├── middlewares/    # Validation, rate limiting, error handling
├── routes/         # HTTP verb mapping & URL paths
├── services/       # Business logic & external API calls
├── utils/          # Shared helpers (validators, logger, ApiError)
└── server.js       # Express entry point
```

| Layer | Responsibility |
|-------|---------------|
| **Routes** | Map HTTP verbs + URLs to controllers |
| **Controllers** | Parse requests, format responses, set HTTP status |
| **Services** | Business logic, data transformation, external APIs |
| **Middlewares** | Validation, rate limiting, CORS, error handling |
| **Config** | Environment variables, Supabase clients, app constants |
| **Utils** | Validators, custom error class, structured logger |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/manikkDev/portfolio-web-backend.git
cd portfolio-web-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id
```

### 3. Run

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The API server starts at **http://localhost:3001**.

## 📡 API Endpoints

| Method | Path | Description | Rate Limit |
|--------|------|-------------|------------|
| `GET` | `/api/health` | Health check | 100/min |
| `POST` | `/api/contact` | Submit contact form | 5/15min |
| `GET` | `/api/ratings` | Get ratings (paginated) | 100/min |
| `GET` | `/api/ratings/stats` | Get aggregate rating stats | 100/min |
| `POST` | `/api/ratings` | Submit a rating | 3/10min |
| `GET` | `/api/youtube/videos` | Get YouTube videos (cached) | 100/min |
| `GET` | `/api/linkedin/posts` | Get LinkedIn posts | 100/min |

### Response Format

All endpoints return consistent JSON:

```json
{
  "success": true,
  "message": "Optional message",
  "data": { ... },
  "meta": { "count": 3 }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": ["Name is required", "A valid email is required"]
  }
}
```

## 🗄️ Database Schema

### `contacts`
Stores contact form submissions.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Sender's name |
| `email` | text | Sender's email |
| `subject` | text | Optional subject |
| `message` | text | Message body |
| `created_at` | timestamptz | Submission time |

### `ratings`
Stores website ratings and comments.

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `name` | text | Reviewer's name |
| `rating` | integer | 1–5 stars |
| `comment` | text | Optional comment |
| `created_at` | timestamptz | Submission time |

### `youtube_cache`
Caches YouTube video data (auto-refreshed hourly).

### `linkedin_posts`
Stores LinkedIn posts (manually managed via Supabase dashboard).

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Rate limiting** on submission endpoints (contact, ratings)
- **Input validation** on all POST endpoints
- **CORS** restricted to frontend origin
- **JSON body limit** set to 10KB to prevent abuse
- **API keys** stored in environment variables, never committed

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5
- **Database:** Supabase (PostgreSQL)
- **Rate Limiting:** express-rate-limit
- **Architecture:** Clean layered (MVC-inspired)

## 📖 Project Structure

```
portfolio-web-backend/
├── src/
│   ├── config/
│   │   ├── constants.js        # Pagination limits, cache TTL
│   │   ├── env.js              # Env validation & export
│   │   └── supabase.js         # Supabase client setup
│   ├── controllers/
│   │   ├── contact.controller.js
│   │   ├── linkedin.controller.js
│   │   ├── rating.controller.js
│   │   └── youtube.controller.js
│   ├── middlewares/
│   │   ├── errorHandler.js     # Global error handler
│   │   ├── rateLimiter.js      # Per-route rate limits
│   │   └── validate.js         # Validation middleware factory
│   ├── routes/
│   │   ├── contact.routes.js
│   │   ├── linkedin.routes.js
│   │   ├── rating.routes.js
│   │   ├── youtube.routes.js
│   │   └── index.js            # Route aggregator
│   ├── services/
│   │   ├── contact.service.js
│   │   ├── linkedin.service.js
│   │   ├── rating.service.js
│   │   └── youtube.service.js
│   ├── utils/
│   │   ├── ApiError.js         # Custom error class
│   │   ├── logger.js           # Structured logger
│   │   └── validators.js       # Input validators
│   └── server.js               # Entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 📄 License

MIT © Manikaraj Anburaj
