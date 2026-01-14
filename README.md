# Currency Frontend

A modern Next.js frontend application for displaying real-time USD/GEL exchange rates from Georgian banks.

## Overview

This application fetches currency exchange rate data from the Strapi backend and displays it in a beautiful, dark-themed interface. The rates are updated daily via a crawler that scrapes data from major Georgian banks.

## Features

- Real-time exchange rate data from Georgian banks (Bank of Georgia, TBC Bank)
- Dark mode interface with modern design
- Table view for easy comparison of rates across banks
- Statistics dashboard showing averages, best rates, and trends
- Color-coded indicators for rate changes (last 7 days)
- Server-side data fetching for optimal performance
- Responsive design for all screen sizes

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- Lucide React (Icons)
- Server Actions

## Prerequisites

- Node.js 20+ 
- npm or yarn
- Strapi backend running (see currency-backend)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

Replace with your Strapi URL if different.

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
apps/currency-frontend/
├── app/
│   ├── actions/
│   │   └── exchange-rates.ts    # Server actions for data fetching
│   ├── page.tsx                  # Main page (Server Component)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   ├── exchange-rates-client.tsx # Main client component
│   ├── rate-table.tsx            # Table component for rates
│   ├── rate-group-table.tsx      # Grouped table view
│   ├── rate-card-enhanced.tsx    # Enhanced card component
│   ├── rate-group-enhanced.tsx   # Grouped card view
│   └── stat-card.tsx             # Statistics card component
└── lib/
    ├── types.ts                  # TypeScript type definitions
    ├── helpers.ts                # Utility functions
    └── utils.ts                  # Common utilities
```

## Environment Variables

- `NEXT_PUBLIC_STRAPI_URL` - URL of your Strapi backend (default: http://localhost:1337)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Data Flow

1. Server Component (`app/page.tsx`) fetches data using Server Actions
2. Data is passed as props to Client Component
3. Client Component handles interactivity (refresh, expand/collapse)
4. Data is grouped by date and displayed in tables

## Display Modes

The application currently uses table view by default, showing:
- Bank name
- Official rate
- Buy rate
- Sell rate
- Spread (difference between buy and sell)
- Change indicator (with color coding for last 7 days)
- Time of data collection

## Color Coding

Rates from the last 7 days are color-coded:
- Green background: Rate improved (went down, better for buyers)
- Red background: Rate worsened (went up, worse for buyers)
- Default: Older than 7 days

## Statistics Dashboard

The dashboard displays:
- Average buy rate
- Average sell rate
- Best buy rate (lowest)
- Total records count

## Building for Production

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm run start
```

## Troubleshooting

### Data not loading

- Ensure Strapi backend is running
- Check `NEXT_PUBLIC_STRAPI_URL` is correct
- Verify Strapi API permissions are set correctly
- Check browser console for errors

### Styling issues

- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Integration with Backend

This frontend expects the Strapi backend to have:
- Content type: `exchange-rate`
- Fields: `source`, `currency`, `buyRate`, `sellRate`, `officialRate`, `scrapedAt`
- API endpoint: `/api/exchange-rates`

See the currency-backend README for backend setup instructions.

## Development

The application uses:
- Server Components for initial data fetching
- Client Components for interactive features
- Server Actions for data fetching from the server
- TypeScript for type safety

## License

Part of the currency-scraper monorepo project.
