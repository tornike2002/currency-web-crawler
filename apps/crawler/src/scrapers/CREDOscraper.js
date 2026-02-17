/**
 * CREDO Currency Scraper (API/XHR-Based)
 *
 * Website: https://credobank.ge/currency
 * API: https://m7.mdello.com/api_public/v1/nbg/USD
 *
 * Example response:
 * {"success":true,"data":{"code":"USD","rate":"2.6799","quantity":"1.0000"}}
 */

const axios = require('axios');
const { log, retry } = require('../utils/helpers');

class CREDOscraper {
  constructor() {
    this.name = 'CREDO';
    this.apiUrl = 'https://m7.mdello.com/api_public/v1/nbg/USD';
    this.websiteUrl = 'https://credobank.ge/currency';
    this.timeout = 10000;
  }

  async scrape() {
    log('info', `Fetching ${this.name} rates from API...`);

    return retry(async () => {
      try {
        const res = await axios.get(this.apiUrl, {
          timeout: this.timeout,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'currency-scraper/1.0'
          }
        });

        const ok = res?.data?.success === true;
        const data = res?.data?.data;

        if (!ok || !data) {
          throw new Error('Invalid CREDO response: success/data missing');
        }

        const rateRaw = typeof data.rate === 'string' || typeof data.rate === 'number' ? Number(data.rate) : NaN;
        const qtyRaw = typeof data.quantity === 'string' || typeof data.quantity === 'number' ? Number(data.quantity) : NaN;

        if (!Number.isFinite(rateRaw)) {
          throw new Error('Invalid CREDO response: rate is not a number');
        }

        // If quantity is not 1, normalize to 1 unit.
        const official = Number.isFinite(qtyRaw) && qtyRaw > 0 ? rateRaw / qtyRaw : rateRaw;

        const result = {
          bank: this.name,
          currency: data.code || 'USD',
          official,
          buy: null,
          sell: null,
          timestamp: new Date().toISOString(),
          source: this.apiUrl,
          meta: {
            quantity: data.quantity ?? null,
            rate: data.rate ?? null,
            website: this.websiteUrl
          }
        };

        log('info', `${this.name} rates fetched successfully`, {
          bank: result.bank,
          currency: result.currency,
          official: result.official
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

module.exports = CREDOscraper;

