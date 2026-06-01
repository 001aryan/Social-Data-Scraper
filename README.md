# Social Data Scraper

A full-stack demo application that simulates multi-platform social media data collection workflows. The project combines a modern React dashboard, an Express.js backend API, Prisma ORM, SQLite storage, and a background job processing system to manage scraping tasks, store results, and visualize analytics.

---

## Features

### Job Management

* Create, monitor, and manage scraping jobs.
* Support for multiple social media platforms:

  * Twitter (X)
  * Instagram
  * LinkedIn
  * YouTube
* Track job status, progress, execution history, and logs.
* Store and review scraping results.

### Background Processing

* Queue-based job execution.
* Scheduled task processing.
* Real-time progress tracking.
* Detailed job logging.
* Persistent storage with Prisma and SQLite.

### Dashboard & Analytics

* Interactive React dashboard.
* Job monitoring and status tracking.
* Analytics and runtime insights.
* Notifications and activity feeds.
* Historical results and trend visualization.

---

## Technology Stack

### Frontend

* React
* Vite
* TypeScript
* Tailwind CSS

### Backend

* Express.js
* Prisma ORM
* SQLite

### Background Services

* Queue Worker
* Scheduled Task Processing

---

## Architecture

```text
┌─────────────────┐
│ React Dashboard │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Express API   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Prisma + SQLite │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Queue Worker   │
└─────────────────┘
```

---

## Quick Start

### Prerequisites

* Node.js 18+
* npm

### Installation

```bash
npm install
```

### Environment Setup

Create a server environment file:

```bash
cp .env.example .env
```

Update the required values in `.env`.

Client-side defaults use Vite's `VITE_` variables and can be configured in `.env` or overridden in `.env.local` (not committed to Git).

### Database Setup

```bash
npx prisma db push
```

### Run Development Server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

or the port specified in the `PORT` environment variable.

### Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

### Docker (Optional)

```bash
docker compose up --build
```

---

## API Endpoints

| Endpoint           | Description                    |
| ------------------ | ------------------------------ |
| `GET /api/health`  | Database health status         |
| `GET /api/ready`   | Application readiness check    |
| `GET /api/metrics` | Runtime metrics and statistics |

---

## Environment Variables

### Server Configuration

Loaded via `dotenv`.

| Variable               | Description                      |
| ---------------------- | -------------------------------- |
| `GEMINI_API_KEY`       | Required for AI-powered features |
| `PORT`                 | Server port (default: 3000)      |
| `NODE_ENV`             | `development` or `production`    |
| `JWT_SECRET`           | Access token signing secret      |
| `JWT_REFRESH_SECRET`   | Refresh token signing secret     |
| `REDIS_URL`            | Optional queue storage backend   |
| `YOUTUBE_API_KEY`      | YouTube Data API integration     |
| `TWITTER_BEARER_TOKEN` | Twitter/X API integration        |
| `SCRAPINGBEE_API_KEY`  | ScrapingBee integration          |

### Client Configuration (Optional)

| Variable                     | Description                              |
| ---------------------------- | ---------------------------------------- |
| `VITE_STRIPE_WEBHOOK_SECRET` | Demo webhook signing secret              |
| `VITE_API_BEARER_TOKEN`      | Demo API bearer token for code templates |
| `VITE_SLACK_WEBHOOK_URL`     | Demo Slack webhook URL                   |
| `VITE_SLACK_CHANNEL`         | Default Slack channel                    |
| `VITE_WEBHOOK_AUTH_HEADER`   | Demo webhook authorization header        |
| `VITE_NOTION_API_TOKEN`      | Demo Notion API token                    |
| `VITE_NOTION_DATABASE_ID`    | Demo Notion database ID                  |

---

## Available Scripts

| Command         | Description                                     |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Start Express server with Vite middleware       |
| `npm run build` | Build frontend and backend bundles              |
| `npm run start` | Start production server                         |
| `npm run lint`  | Run type checking and linting                   |
| `npm run clean` | Remove build artifacts and development database |

---

## Project Structure

```text
prisma/
├── schema.prisma

src/
├── components/
├── config/
├── controllers/
├── middleware/
├── routes/
├── services/
├── utils/
├── App.tsx
├── main.tsx
└── index.css

server.ts
```

---

## Data Storage

Local development data is stored in:

```text
prisma/dev.db
```

This database is intended for local development and testing only.

---

## License

This project is intended for educational and demonstration purposes.

---

## Author

Built with ❤️ by **Aryan Singh**.
