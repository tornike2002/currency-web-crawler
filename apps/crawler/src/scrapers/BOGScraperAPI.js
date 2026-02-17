/**
 * Bank of Georgia Currency Scraper (XHR-Based)
 * Grabs the same JSON response you see in Network > Fetch/XHR.
 *
 * Example endpoint:
 * https://bankofgeorgia.ge/api/currencies/history/USD?startDate=...&endDate=...
 */

const { log, retry } = require('../utils/helpers');

class BOGScraperAPI {
  constructor(browser) {
    this.browser = browser;
    this.name = 'Bank of Georgia';
    // Page that triggers the same Fetch/XHR calls you see in DevTools
    this.pageUrl = 'https://bankofgeorgia.ge/ka/valutis-kursi/GEL-to-USD#commercial-rates';
    this.currency = 'USD';
    this.waitMs = 1500; // 1-2 second delay to allow XHR to fire
    this.responseTimeoutMs = 12000;
  }

  /**
   * Fetch USD official rate history from Bank of Georgia XHR response.
   * @returns {Promise<Object>} Exchange rate data
   */
  async scrape() {
    if (!this.browser) {
      throw new Error('BOGScraperAPI requires a Puppeteer browser instance');
    }

    log('info', `Grabbing ${this.name} ${this.currency} rates from XHR response...`);
    
    return retry(async () => {
      const page = await this.browser.newPage();
      try {
        await page.setViewport({ width: 850, height: 850 });
        await page.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        );

        // We'll grab two JSON responses if they appear:
        // 1) /api/currencies/history/USD?...  -> daily official-ish rate series
        // 2) /api/currencies/page/pages/...   -> may include buy/sell/currentRate (commercial/official) list
        let historyJson = null;
        let pageJson = null;

        const historyPath = `/api/currencies/history/${this.currency}?`;
        const pagePath = '/api/currencies/page/pages/';

        const maybeCapture = async (response) => {
          try {
            const url = response.url();
            // Only care about fetch/xhr-ish responses with JSON
            const resourceType = response.request().resourceType();
            if (resourceType !== 'xhr' && resourceType !== 'fetch') return;
            if (!url.includes('bankofgeorgia.ge')) return;

            if (!historyJson && url.includes(historyPath)) {
              historyJson = await response.json();
            } else if (!pageJson && url.includes(pagePath)) {
              pageJson = await response.json();
            }
          } catch (_) {
            // ignore parsing errors, we'll retry via refresh if needed
          }
        };

        page.on('response', maybeCapture);

        const waitForCaptured = async () => {
          const start = Date.now();
          while (Date.now() - start < this.responseTimeoutMs) {
            if (historyJson) return true;
            await new Promise(r => setTimeout(r, 250));
          }
          return false;
        };

        const navigateOnce = async () => {
          await page.goto(this.pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await new Promise(resolve => setTimeout(resolve, this.waitMs));
          return await waitForCaptured();
        };

        let ok = await navigateOnce();
        if (!ok) {
          log('warn', `${this.name} XHR not captured yet, refreshing once...`);
          await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
          await new Promise(resolve => setTimeout(resolve, this.waitMs));
          ok = await waitForCaptured();
        }

        if (!historyJson) {
          throw new Error('Failed to capture history XHR response');
        }

        const ratesArr = historyJson?.data?.rates?.[this.currency];
        if (!Array.isArray(ratesArr) || ratesArr.length === 0) {
          throw new Error('Invalid XHR response structure: rates array not found');
        }

        const latest = ratesArr[ratesArr.length - 1];
        const latestRate = typeof latest?.rate === 'number' ? latest.rate : null;

        // Optional: extract commercial buy/sell and currentRate from the page JSON (if it exists).
        let buy = null;
        let sell = null;
        let currentRate = null;

        const currenciesList = pageJson?.data?.tabs?.[0]?.tabContent?.currenciesList;
        if (Array.isArray(currenciesList)) {
          const usdData = currenciesList.find(c => c?.ccy === this.currency);
          if (usdData) {
            buy = typeof usdData.buyRate === 'number' ? usdData.buyRate : null;
            sell = typeof usdData.sellRate === 'number' ? usdData.sellRate : null;
            currentRate = typeof usdData.currentRate === 'number' ? usdData.currentRate : null;
          }
        }

        const result = {
          bank: this.name,
          currency: this.currency,
          // Prefer currentRate from page JSON if available; else use latest from history series
          official: currentRate ?? latestRate,
          buy,
          sell,
          history: ratesArr,
          timestamp: new Date().toISOString(),
          source: this.pageUrl
        };

        log('info', `${this.name} XHR rates grabbed successfully`, {
          bank: result.bank,
          currency: result.currency,
          official: result.official,
          buy: result.buy,
          sell: result.sell,
          historyPoints: ratesArr.length,
          capturedPageJson: !!pageJson
        });

        await page.close();
        return result;

      } catch (error) {
        try {
          await page.close();
        } catch (_) {
          // ignore
        }
        log('error', `Error grabbing ${this.name} XHR rates`, { error: error.message });
        throw error;
      }
    }, 3, 2000); // 3 retries with 2 second delay
  }

  /**
   * No cleanup needed (page is closed per scrape)
   */
  async close() {
    // No resources to clean up
  }
}

module.exports = BOGScraperAPI;
