# Portfolio Backend API

A clean, scalable backend server for [Manik's Portfolio Website](https://github.com/manikkDev/portfolio-web-frontend) — built with **Express.js** and **MongoDB**.

## 🏗️ Architecture

This backend follows a **clean layered architecture** pattern:

```
src/
├── config/         # Environment, MongoDB client, constants
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
| **Config** | Environment variables, MongoDB client, app constants |
| **Utils** | Validators, custom error class, structured logger |

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **npm** 9+
- A MongoDB database (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster is enough)

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

Edit `.env` with your own values:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/

YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id

# Optional: email each contact message through https://resend.com
RESEND_API_KEY=
CONTACT_TO_EMAIL=
```

`MONGODB_URI` is required: the server will not start without it. The database is
named `portfolio` (set in `src/config/db.js`) and its collections are created on
first use. When hosting on Atlas, allow your host's IP addresses under Network Access.
The same variables must be set on whatever service hosts this API.

### 3. Run

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start

# Tests
npm test
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
| `GET` | `/api/youtube/videos` | Latest long videos and Shorts, as `{ videos, shorts }` (cached for an hour) | 100/min |
| `GET` | `/api/linkedin/posts` | Hackathon wins, each backed by a LinkedIn post | 100/min |

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

## 🗄️ Database

MongoDB database `portfolio`. Collections:

| Collection | Holds |
|------------|-------|
| `contacts` | Contact form messages: `name`, `email`, `subject`, `message`, `created_at` |
| `ratings` | Website ratings: `name`, `rating` (1 to 5), `comment`, `created_at` |
| `cache` | One document, `_id: "youtube"`: the latest videos and Shorts, refreshed hourly |
| `linkedin_posts` | One document per win: the post's link plus `title`, `tag`, `org`, `summary`, `facts` |

### Adding a hackathon win

LinkedIn does not let an app list a person's posts, so wins are added by link. The
server then re-reads each public post page once a day.

```bash
npm run add-post -- "<linkedin post link>" --title "Event name" --tag "1st Place"   --org "Organiser" --summary "What was built" --facts "Team of 4, 24 hours"

npm run add-post -- "<linkedin post link>" --remove
```

## 🔒 Security

- **Rate limiting** on submission endpoints (contact, ratings)
- **Input validation** on all POST endpoints
- **CORS** restricted to frontend origin
- **JSON body limit** set to 10KB to prevent abuse
- **API keys** stored in environment variables, never committed

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5
- **Database:** MongoDB (official `mongodb` driver)
- **Rate Limiting:** express-rate-limit
- **Architecture:** Clean layered (MVC-inspired)

## 📖 Project Structure

```
portfolio-web-backend/
├── src/
│   ├── config/
│   │   ├── constants.js        # Pagination limits, cache TTL
│   │   ├── db.js               # MongoDB client
│   │   └── env.js              # Env validation & export
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
│   │   ├── linkedin.js         # Reads a public LinkedIn post page
│   │   ├── logger.js           # Structured logger
│   │   ├── ratingStats.js      # Average and star counts
│   │   └── validators.js       # Input validators
│   └── server.js               # Entry point
├── scripts/
│   └── add-post.js             # Add or remove a hackathon win
├── test/
│   └── api.test.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 📄 License

MIT © Manikaraj Anburaj
