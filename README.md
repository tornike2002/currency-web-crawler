# Currency Scraper

A complete currency exchange rate monitoring system for Georgian banks. This monorepo consists of three applications: a crawler that scrapes exchange rates, a Strapi backend for data storage, and a Next.js frontend for displaying the data.

## Overview

This system automatically collects USD/GEL exchange rates from major Georgian banks (Bank of Georgia, TBC Bank) and stores them in a database. The data is then displayed in a modern web interface with statistics, trends, and historical analysis.

## Architecture

The project is organized as a monorepo with three main applications:

1. **Crawler** - Scrapes exchange rates from bank websites
2. **Backend** - Strapi API for storing and serving exchange rate data
3. **Frontend** - Next.js application for displaying rates

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (for Strapi backend)
- npm or yarn

### Setup

1. Clone the repository

2. Install dependencies for all apps (using npm workspaces):

```bash
# Install all dependencies from root (installs for all workspaces)
npm install
```

This will install dependencies for all three apps automatically thanks to npm workspaces configuration.

3. Configure environment variables:

- **Crawler**: Create `apps/crawler/.env` (see crawler README)
- **Backend**: Configure Strapi database (see backend README)
- **Frontend**: Create `apps/currency-frontend/.env.local` with `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`

4. Start the applications:

You can run commands from the root directory using workspace scripts:

```bash
# Terminal 1: Start Strapi backend
npm run backend:dev

# Terminal 2: Start frontend
npm run frontend:dev

# Terminal 3: Run crawler (manual) or start scheduler
npm run crawler:start      # Manual run
npm run crawler:schedule   # Scheduled (runs every 24 hours)
```

Or run from individual directories (both methods work):

```bash
# Terminal 1: Start Strapi backend
cd apps/currency-backend
npm run develop

# Terminal 2: Start frontend
cd apps/currency-frontend
npm run dev

# Terminal 3: Run crawler
cd apps/crawler
npm start  # Manual run
npm run schedule  # Scheduled
```

5. Access the applications:

- Frontend: http://localhost:3000
- Strapi Admin: http://localhost:1337/admin
- Strapi API: http://localhost:1337/api

## Applications

### Crawler (`apps/crawler`)

Web scraper that collects exchange rates from Georgian banks.

**Features:**
- API-based scraping for Bank of Georgia (fast and reliable)
- Puppeteer-based scraping for TBC Bank
- Automatic data synchronization with Strapi
- Scheduled runs with cron jobs
- Error handling and retry logic

**Key Files:**
- `src/index.js` - Main entry point
- `src/scheduler.js` - Cron job scheduler
- `src/scrapers/` - Bank-specific scrapers
- `src/services/StrapiService.js` - Strapi integration

**Documentation:** See `apps/crawler/README.md`

### Backend (`apps/currency-backend`)

Strapi CMS backend for storing and serving exchange rate data.

**Features:**
- PostgreSQL database
- REST API for exchange rates
- Admin panel for data management
- Content type: `exchange-rate`

**Content Type Schema:**
- `source` (string) - Bank name
- `currency` (string) - Currency code (USD)
- `buyRate` (decimal) - Buy rate
- `sellRate` (decimal) - Sell rate
- `officialRate` (decimal) - Official rate
- `scrapedAt` (date) - Timestamp

**Documentation:** See `apps/currency-backend/README.md`

### Frontend (`apps/currency-frontend`)

Next.js application for displaying exchange rates.

**Features:**
- Dark mode interface
- Table view for rate comparison
- Statistics dashboard
- Color-coded rate changes (last 7 days)
- Server-side rendering
- Responsive design

**Key Technologies:**
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Server Actions

**Documentation:** See `apps/currency-frontend/README.md`

## Data Flow

1. **Crawler** runs on schedule (daily at midnight)
2. Scrapes rates from Bank of Georgia (API) and TBC Bank (Puppeteer)
3. Saves data to **Strapi Backend** via API
4. **Frontend** fetches data from Strapi and displays it

## Environment Configuration

### Crawler

```bash
# apps/crawler/.env
HEADLESS=true
TIMEOUT=30000
LOG_LEVEL=info
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your-token-here
CRON_SCHEDULE=0 0 * * *
TIMEZONE=Asia/Tbilisi
```

### Backend

Configure database connection in `apps/currency-backend/config/database.ts`

### Frontend

```bash
# apps/currency-frontend/.env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## Development Workflow

1. **Start Strapi backend** - Provides API for data storage
2. **Run crawler** - Collects initial data
3. **Start frontend** - Displays the data
4. **Set up scheduler** - Automates daily data collection

## Production Deployment

Each application can be deployed independently:

- **Crawler**: Deploy as a scheduled job (PM2, systemd, or cloud scheduler)
- **Backend**: Deploy Strapi to a Node.js hosting service
- **Frontend**: Deploy Next.js to Vercel, Netlify, or similar

See individual README files for deployment instructions.

## NPM Workspaces

This project uses npm workspaces to manage all three applications. This provides:

- Single dependency installation: Run `npm install` from root to install all dependencies
- Dependency deduplication: Shared dependencies are hoisted to root `node_modules`
- Convenient scripts: Run commands from root using workspace scripts

### Available Workspace Scripts (from root)

**Crawler:**
- `npm run crawler:start` - Run crawler manually
- `npm run crawler:schedule` - Start scheduler (runs every 24 hours)

**Backend:**
- `npm run backend:dev` - Start Strapi development server
- `npm run backend:build` - Build Strapi for production
- `npm run backend:start` - Start Strapi production server

**Frontend:**
- `npm run frontend:dev` - Start Next.js development server
- `npm run frontend:build` - Build Next.js for production
- `npm run frontend:start` - Start Next.js production server

You can also run scripts directly from each app's directory using their individual `package.json` scripts.

## Project Structure

```
currency-scraper/
├── apps/
│   ├── crawler/              # Web scraper
│   │   ├── src/
│   │   │   ├── scrapers/     # Bank-specific scrapers
│   │   │   ├── services/     # Strapi integration
│   │   │   └── utils/        # Helper functions
│   │   └── package.json
│   ├── currency-backend/     # Strapi backend
│   │   ├── src/
│   │   │   └── api/
│   │   │       └── exchange-rate/
│   │   └── package.json
│   └── currency-frontend/    # Next.js frontend
│       ├── app/
│       ├── components/
│       └── package.json
├── package.json              # Root workspace configuration
└── README.md
```

## License

MIT License

## Contributing

This is a personal project. Contributions and suggestions are welcome.
