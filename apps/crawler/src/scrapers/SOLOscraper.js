/**
 * SOLO Currency Scraper (API/XHR-Based)
 * Uses the same fetch/xhr endpoint seen in DevTools on solo.ge.
 *
 * Example endpoint:
 * https://solo.ge/api/currencies/convert/GEL/USD?amountFrom=1&amountTo=
 */

const axios = require('axios');
const { log, retry } = require('../utils/helpers');

class SOLOscraper {
  constructor() {
    this.name = 'SOLO';
    this.url = 'https://solo.ge/api/currencies/convert/GEL/USD?amountFrom=1&amountTo=';
    this.timeout = 10000;
  }

  /**
   * Scrape USD/GEL conversion rate from SOLO convert API
   * @returns {Promise<Object>} Exchange rate data
   */
  async scrape() {
    log('info', `Fetching ${this.name} rates from XHR endpoint...`);

    return retry(async () => {
      try {
        const res = await axios.get(this.url, {
          timeout: this.timeout,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'currency-scraper/1.0'
          }
        });

        const payload = res?.data?.data;
        const rate = typeof payload?.rate === 'number' ? payload.rate : null;
        const rateSelf = typeof payload?.rateSelf === 'number' ? payload.rateSelf : null;

        if (rate === null && rateSelf === null) {
          throw new Error('Invalid SOLO response structure: rate fields not found');
        }

        // For GEL->USD conversion, the API returns a USD/GEL style rate (e.g., 2.71).
        // We expose it as "sell" (bank sells USD) and also as "official" for consistent output.
        const sell = rateSelf ?? rate;

        const result = {
          bank: this.name,
          currency: 'USD',
          official: sell,
          buy: null,
          sell,
          timestamp: new Date().toISOString(),
          source: this.url,
          meta: {
            amountFrom: payload?.amountSelf ?? payload?.amount ?? null,
            rate,
            rateSelf,
            rateDifference: typeof payload?.rateDifference === 'number' ? payload.rateDifference : null,
            baseCcy: payload?.baseCcy ?? null
          }
        };

        log('info', `${this.name} rates fetched successfully`, {
          bank: result.bank,
          currency: result.currency,
          official: result.official,
          sell: result.sell
        });

        return result;
      } catch (error) {
        log('error', `Error fetching ${this.name} rates`, { error: error.message });
        throw error;
      }
    }, 3, 2000);
  }

  async close() {
    // No resources to clean up
  }
}

module.exports = SOLOscraper;

