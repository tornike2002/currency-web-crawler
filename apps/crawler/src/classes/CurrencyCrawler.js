/**
 * CurrencyCrawler - Main class for crawling currency exchange rates
 * Manages browser instance and coordinates scrapers
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { log } = require('../utils/helpers');
const BOGScraperAPI = require('../scrapers/BOGScraperAPI');
const CREDOscraper = require('../scrapers/CREDOscraper');
const SOLOscraper = require('../scrapers/SOLOscraper');
const TBCScraper = require('../scrapers/TBCScraper');

function resolveChromeStablePath() {
  const fromEnv =
    process.env.CHROME_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.PUPPETEER_CHROMIUM_EXECUTABLE_PATH;

  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const candidates = [];

  if (process.platform === 'win32') {
    candidates.push(
      'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
      'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe'
    );
    if (process.env.LOCALAPPDATA) {
      candidates.push(path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'));
    }
  } else if (process.platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  } else {
    candidates.push('/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/snap/bin/chromium');
  }

  for (const p of candidates) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch (_) {
      // ignore
    }
  }

  return null;
}

class CurrencyCrawler {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== undefined ? options.headless : true,
      timeout: options.timeout || 30000,
      ...options
    };
    this.browser = null;
    this.scrapers = [];
  }

  /**
   * Initialize the crawler and browser instance
   */
  async initialize() {
    log('info', 'Initializing Currency Crawler...');
    
    try {
      const chromePath = resolveChromeStablePath();
      if (chromePath) {
        log('info', 'Using Google Chrome Stable executable', { chromePath });
      } else {
        log('warn', 'Google Chrome Stable not found; falling back to bundled Chromium');
      }

      // Launch browser with Puppeteer
      this.browser = await puppeteer.launch({
        headless: this.options.headless ? 'new' : false,
        executablePath: chromePath || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080'
        ],
        defaultViewport: {
          width: 1920,
          height: 1080
        }
      });

      log('info', 'Browser launched successfully');

      // Initialize scrapers
      this.scrapers = [
        new BOGScraperAPI(this.browser),
        new CREDOscraper(),
        new SOLOscraper(),
        new TBCScraper(this.browser)
      ];

      log('info', `Initialized ${this.scrapers.length} scrapers`);

    } catch (error) {
      log('error', 'Failed to initialize crawler', { error: error.message });
      throw error;
    }
  }

  /**
   * Crawl exchange rates from all configured banks
   * @param {Object} options - Crawl options
   * @param {Array<string>} options.banks - Specific banks to crawl (optional)
   * @returns {Promise<Object>} Results from all scrapers
   */
  async crawl(options = {}) {
    if (!this.browser) {
      throw new Error('Crawler not initialized. Call initialize() first.');
    }

    log('info', 'Starting currency crawl...');

    const results = {
      success: [],
      failed: [],
      timestamp: new Date().toISOString()
    };

    // Filter scrapers if specific banks requested
    let scrapersToRun = this.scrapers;
    if (options.banks && Array.isArray(options.banks)) {
      scrapersToRun = this.scrapers.filter(scraper => 
        options.banks.includes(scraper.name)
      );
    }

    // Run scrapers sequentially to avoid overloading
    for (const scraper of scrapersToRun) {
      try {
        log('info', `Running ${scraper.name} scraper...`);
        const result = await scraper.scrape();
        results.success.push(result);
      } catch (error) {
        log('error', `Failed to scrape ${scraper.name}`, { error: error.message });
        results.failed.push({
          bank: scraper.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    log('info', `Crawl completed. Success: ${results.success.length}, Failed: ${results.failed.length}`);

    return results;
  }

  /**
   * Crawl rates from a specific bank
   * @param {string} bankName - Name of the bank to crawl
   * @returns {Promise<Object>} Scraper result
   */
  async crawlBank(bankName) {
    if (!this.browser) {
      throw new Error('Crawler not initialized. Call initialize() first.');
    }

    const scraper = this.scrapers.find(s => s.name === bankName);
    
    if (!scraper) {
      throw new Error(`Scraper not found for bank: ${bankName}`);
    }

    log('info', `Crawling ${bankName}...`);
    return await scraper.scrape();
  }

  /**
   * Get list of available banks
   * @returns {Array<string>} List of bank names
   */
  getAvailableBanks() {
    return this.scrapers.map(scraper => scraper.name);
  }

  /**
   * Close the browser and cleanup resources
   */
  async close() {
    if (this.browser) {
      log('info', 'Closing browser...');
      await this.browser.close();
      this.browser = null;
      log('info', 'Browser closed successfully');
    }
  }

  /**
   * Get formatted results summary
   * @param {Object} results - Results from crawl()
   * @returns {string} Formatted summary
   */
  formatResults(results) {
    let output = '\n' + '='.repeat(60) + '\n';
    output += 'CURRENCY EXCHANGE RATES - USD/GEL\n';
    output += '='.repeat(60) + '\n';
    output += `Date: ${new Date(results.timestamp).toLocaleString()}\n`;
    output += '='.repeat(60) + '\n\n';

    if (results.success.length > 0) {
      results.success.forEach(rate => {
        output += `${rate.bank}\n`;
        output += '-'.repeat(60) + '\n';
        if (rate.official !== null) {
          output += `  Official Rate: ${rate.official.toFixed(4)} GEL\n`;
        }
        if (rate.buy !== null) {
          output += `  Buy Rate:      ${rate.buy.toFixed(4)} GEL\n`;
        }
        if (rate.sell !== null) {
          output += `  Sell Rate:     ${rate.sell.toFixed(4)} GEL\n`;
        }
        output += '\n';
      });
    }

    if (results.failed.length > 0) {
      output += 'FAILED SCRAPERS\n';
      output += '-'.repeat(60) + '\n';
      results.failed.forEach(failure => {
        output += `  ${failure.bank}: ${failure.error}\n`;
      });
      output += '\n';
    }

    output += '='.repeat(60) + '\n';

    return output;
  }
}

module.exports = CurrencyCrawler;
