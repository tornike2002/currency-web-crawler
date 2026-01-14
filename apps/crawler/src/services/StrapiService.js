/**
 * Strapi Service - Sends exchange rate data to Strapi API
 * Handles authentication and data submission to the exchange-rate endpoint
 */

const axios = require('axios');
const { log } = require('../utils/helpers');

class StrapiService {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || process.env.STRAPI_URL || 'http://localhost:1337';
    this.apiToken = options.apiToken || process.env.STRAPI_API_TOKEN;
    this.timeout = options.timeout || 10000;
  }

  /**
   * Send exchange rate data to Strapi
   * @param {Object} rateData - Exchange rate data from scraper
   * @returns {Promise<Object>} Strapi response
   */
  async saveExchangeRate(rateData) {
    log('info', `Saving ${rateData.bank} rates to Strapi...`);

    try {
      const endpoint = `${this.baseUrl}/api/exchange-rates`;
      
      // Format data for Strapi schema
      // Schema fields: source, currency, buyRate, sellRate, officialRate, scrapedAt
      const payload = {
        data: {
          source: rateData.bank,              // Using 'source' field for bank name
          currency: rateData.currency,
          buyRate: rateData.buy,
          sellRate: rateData.sell,
          officialRate: rateData.official,
          scrapedAt: rateData.timestamp
        }
      };

      log('debug', `Sending to ${endpoint}`, payload);

      const headers = {
        'Content-Type': 'application/json'
      };

      // Only add Authorization header if token is provided
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }

      const response = await axios.post(endpoint, payload, {
        headers,
        timeout: this.timeout
      });

      log('info', `✓ ${rateData.bank} rates saved to Strapi (ID: ${response.data?.data?.id || 'N/A'})`);
      
      return response.data;

    } catch (error) {
      log('error', `Failed to save ${rateData.bank} rates to Strapi`, { error: error.message });
      throw error;
    }
  }

  /**
   * Save multiple exchange rates in bulk
   * @param {Array<Object>} ratesArray - Array of exchange rate data
   * @returns {Promise<Array>} Array of Strapi responses
   */
  async saveExchangeRates(ratesArray) {
    log('info', `Saving ${ratesArray.length} exchange rates to Strapi...`);

    const results = [];
    const errors = [];

    for (const rateData of ratesArray) {
      try {
        const result = await this.saveExchangeRate(rateData);
        results.push({ success: true, bank: rateData.bank, data: result });
      } catch (error) {
        errors.push({ success: false, bank: rateData.bank, error: error.message });
        // Continue with other rates even if one fails
      }
    }

    // Summary
    log('info', `Strapi sync complete: ${results.length} succeeded, ${errors.length} failed`);

    if (errors.length > 0) {
      log('warn', 'Failed to save some rates:', errors);
    }

    return { results, errors };
  }


  /**
   * Test connection to Strapi
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      log('info', 'Testing Strapi connection...');
      
      const headers = {};
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }

      await axios.get(
        `${this.baseUrl}/api/exchange-rates?pagination[limit]=1`,
        {
          headers,
          timeout: this.timeout
        }
      );

      log('info', '✓ Strapi connection successful');
      return true;
    } catch (error) {
      log('error', 'Strapi connection test failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get latest exchange rates from Strapi
   * @param {Object} filters - Query filters (optional)
   * @returns {Promise<Array>} Array of exchange rates
   */
  async getLatestRates(filters = {}) {
    try {
      const params = {
        'sort[0]': 'scrapedAt:desc',
        'pagination[limit]': filters.limit || 10,
        ...(filters.currency && { 'filters[currency][$eq]': filters.currency }),
        ...(filters.bank && { 'filters[source][$eq]': filters.bank })
      };

      const headers = {};
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/exchange-rates`,
        {
          params,
          headers,
          timeout: this.timeout
        }
      );

      return response.data?.data || [];

    } catch (error) {
      log('error', 'Failed to fetch rates from Strapi', { error: error.message });
      throw error;
    }
  }
}

module.exports = StrapiService;
