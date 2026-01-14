# Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies

```bash
cd apps/crawler
npm install
```

This will install:
- `puppeteer` - For web scraping with headless Chrome
- `dotenv` - For environment configuration

### 2. Create Configuration File

Create a `.env` file in the `apps/crawler` directory:

```bash
# Copy the example configuration
cp config.example.env .env
```

Or manually create `.env` with:

```env
HEADLESS=true
TIMEOUT=30000
LOG_LEVEL=info
```

### 3. Run the Crawler

```bash
npm start
```

That's it! The crawler will fetch today's USD exchange rates from Georgian banks.

## What You'll Get

The crawler retrieves three types of rates for USD:

1. **Official Rate** - The official exchange rate
2. **Buy Rate** - The rate at which the bank buys USD from you
3. **Sell Rate** - The rate at which the bank sells USD to you

### Example Output:

```
============================================================
CURRENCY EXCHANGE RATES - USD/GEL
============================================================
Date: 1/14/2026, 10:30:00 AM
============================================================

Bank of Georgia
------------------------------------------------------------
  Official Rate: 2.6470 GEL
  Buy Rate:      2.6470 GEL
  Sell Rate:     2.7470 GEL

National Bank of Georgia
------------------------------------------------------------
  Official Rate: 2.6670 GEL

TBC Bank
------------------------------------------------------------
  Official Rate: 2.6500 GEL
  Buy Rate:      2.6500 GEL
  Sell Rate:     2.7500 GEL

============================================================
```

## Supported Banks

- ✅ **Bank of Georgia** - https://bankofgeorgia.ge
- ✅ **National Bank of Georgia** - https://nbg.gov.ge (official rates only)
- ✅ **TBC Bank** - https://www.tbcbank.ge

## Advanced Usage

### Run with visible browser (debugging)

Edit `.env`:
```env
HEADLESS=false
```

### Get JSON output

Edit `.env`:
```env
JSON_OUTPUT=true
```

### Use programmatically

```javascript
const { CurrencyCrawler } = require('./src');

const crawler = new CurrencyCrawler({ headless: true });
await crawler.initialize();
const results = await crawler.crawl();
await crawler.close();
```

### Run examples

```bash
node example.js
```

## Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org/

### "Cannot find module 'puppeteer'"
Run: `npm install`

### "Failed to launch browser"
Run: `npx puppeteer browsers install chrome`

### Slow scraping
Increase timeout in `.env`:
```env
TIMEOUT=60000
```

## What's Next?

- Modify scrapers to add more banks
- Schedule automatic runs with cron
- Save results to a database
- Build an API around the crawler
- Add more currencies (EUR, GBP, etc.)

Check `README.md` for full documentation.
