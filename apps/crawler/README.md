# Currency Crawler

A Puppeteer-based web scraper for Georgian bank exchange rates (USD/GEL).

## Features

- Scrapes USD exchange rates from multiple Georgian banks:
  - Bank of Georgia (BOG)
  - National Bank of Georgia (NBG)
  - TBC Bank
- Gets official, buy, and sell rates
- Built with Puppeteer for reliable web scraping
- Retry mechanism for resilient scraping
- Formatted console output and JSON export

## Installation

```bash
cd apps/crawler
npm install
```

## Configuration

Create a `.env` file in the `apps/crawler` directory:

```env
# Browser Configuration
HEADLESS=true
TIMEOUT=30000

# Log Level (debug, info, warn, error)
LOG_LEVEL=info

# Optional: Output results as JSON
JSON_OUTPUT=false
```

## Usage

### Run the crawler

```bash
npm start
```

This will scrape exchange rates from all configured banks and display them in a formatted table.

### Programmatic Usage

```javascript
const { CurrencyCrawler } = require('./src');

async function example() {
  const crawler = new CurrencyCrawler({
    headless: true,
    timeout: 30000
  });

  try {
    // Initialize browser
    await crawler.initialize();

    // Crawl all banks
    const results = await crawler.crawl();
    
    // Display formatted results
    console.log(crawler.formatResults(results));

    // Or crawl a specific bank
    const bogRates = await crawler.crawlBank('Bank of Georgia');
    console.log(bogRates);

    // Get available banks
    const banks = crawler.getAvailableBanks();
    console.log('Available banks:', banks);

  } finally {
    await crawler.close();
  }
}

example();
```

## Project Structure

```
apps/crawler/
├── src/
│   ├── classes/
│   │   └── CurrencyCrawler.js    # Main crawler class
│   ├── scrapers/
│   │   ├── BOGScraper.js         # Bank of Georgia scraper
│   │   ├── NBGScraper.js         # National Bank scraper
│   │   └── TBCScraper.js         # TBC Bank scraper
│   ├── utils/
│   │   └── helpers.js            # Utility functions
│   └── index.js                  # Entry point
├── package.json
└── .env                          # Configuration (create this)
```

## Output Format

### Console Output

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

TBC Bank
------------------------------------------------------------
  Official Rate: 2.6500 GEL
  Buy Rate:      2.6500 GEL
  Sell Rate:     2.7500 GEL

============================================================
```

### JSON Output

```json
{
  "success": [
    {
      "bank": "Bank of Georgia",
      "currency": "USD",
      "official": 2.6470,
      "buy": 2.6470,
      "sell": 2.7470,
      "timestamp": "2026-01-14T08:30:00.000Z",
      "source": "https://bankofgeorgia.ge/ka/valutis-kursi/GEL-to-USD"
    }
  ],
  "failed": [],
  "timestamp": "2026-01-14T08:30:00.000Z"
}
```

## API Reference

### CurrencyCrawler

#### Constructor

```javascript
new CurrencyCrawler(options)
```

Options:
- `headless` (boolean): Run browser in headless mode (default: true)
- `timeout` (number): Page load timeout in milliseconds (default: 30000)

#### Methods

- `async initialize()` - Initialize the crawler and launch browser
- `async crawl(options)` - Crawl all configured banks
  - `options.banks` (Array<string>): Optional array of specific bank names to crawl
- `async crawlBank(bankName)` - Crawl a specific bank
- `getAvailableBanks()` - Get list of available bank names
- `formatResults(results)` - Format results for display
- `async close()` - Close browser and cleanup

## Error Handling

The crawler includes:
- Automatic retry with exponential backoff (3 attempts)
- Graceful error handling for individual scrapers
- Detailed error logging
- Non-zero exit codes on failure

## Troubleshooting

### Browser won't launch

If you get errors about Chrome/Chromium not found:

```bash
# Install Chromium manually (if needed)
npx puppeteer browsers install chrome
```

### Scraping fails

- Check your internet connection
- Some sites may have anti-bot measures
- Try setting `HEADLESS=false` in `.env` to see what's happening
- Increase `TIMEOUT` value if pages load slowly

## License

ISC
