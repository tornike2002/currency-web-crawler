/**
 * Bank of Georgia Currency Scraper (API-Based)
 * Fetches USD exchange rates directly from Bank of Georgia's currencies page API
 * 
 * Endpoint: https://bankofgeorgia.ge/api/currencies/page/pages/64ba400e3a4fec320092de07
 */

const { log, retry } = require('../utils/helpers');

class BOGScraperAPI {
  constructor() {
    this.apiUrl = 'https://bankofgeorgia.ge/api/currencies/page/pages/64ba400e3a4fec320092de07';
    this.name = 'Bank of Georgia';
    this.timeout = 10000; // 10 seconds
  }

  /**
   * Fetch USD exchange rates from Bank of Georgia API
   * @returns {Promise<Object>} Exchange rate data
   */
  async scrape() {
    log('info', `Fetching ${this.name} rates from API...`);
    
    return retry(async () => {
      try {
        // Fetch the currencies page data
        const response = await this.fetchWithTimeout(this.apiUrl, this.timeout);

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Navigate through the JSON structure to find USD currency data
        // data.data.tabs[0].tabContent.currenciesList[0] contains USD data
        const currenciesList = data?.data?.tabs?.[0]?.tabContent?.currenciesList;

        if (!currenciesList || !Array.isArray(currenciesList)) {
          throw new Error('Invalid API response structure: currenciesList not found');
        }

        // Find USD in the currencies list
        const usdData = currenciesList.find(currency => currency.ccy === 'USD');

        if (!usdData) {
          throw new Error('USD currency data not found in API response');
        }

        // Extract rates
        // buyRate and sellRate are the commercial rates
        // currentRate is the official rate
        const result = {
          bank: this.name,
          currency: 'USD',
          buy: usdData.buyRate,
          sell: usdData.sellRate,
          official: usdData.currentRate,
          timestamp: new Date().toISOString(),
          source: 'Bank of Georgia API'
        };

        log('info', `${this.name} API rates fetched successfully`, result);
        return result;

      } catch (error) {
        log('error', `Error fetching ${this.name} API rates`, { error: error.message });
        throw error;
      }
    }, 3, 2000); // 3 retries with 2 second delay
  }

  /**
   * Fetch with timeout support
   * @param {string} url - URL to fetch
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<Response>} Fetch response
   */
  async fetchWithTimeout(url, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BOG-Currency-Scraper/1.0'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  /**
   * No cleanup needed for API-based scraper
   */
  async close() {
    // No resources to clean up
  }
}

module.exports = BOGScraperAPI;
