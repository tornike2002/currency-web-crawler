/**
 * Currency Crawler Entry Point
 * Main script to run the currency exchange rate crawler
 */

require('dotenv').config();
const CurrencyCrawler = require('./classes/CurrencyCrawler');
const StrapiService = require('./services/StrapiService');
const { log } = require('./utils/helpers');

/**
 * Main function to run the crawler
 */
async function main() {
  const crawler = new CurrencyCrawler({
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '30000')
  });

  // Initialize Strapi service
  const strapiService = new StrapiService({
    baseUrl: process.env.STRAPI_URL,
    apiToken: process.env.STRAPI_API_TOKEN
  });

  try {
    // Test Strapi connection (optional, only if STRAPI_URL is set)
    if (process.env.STRAPI_URL) {
      const connected = await strapiService.testConnection();
      if (!connected) {
        log('warn', 'Strapi connection failed, but continuing with scraping...');
      }
    }

    // Initialize the crawler
    await crawler.initialize();

    log('info', 'Available banks: ' + crawler.getAvailableBanks().join(', '));

    // Crawl all banks
    const results = await crawler.crawl();

    // Display results
    console.log(crawler.formatResults(results));

    // Output as JSON for programmatic use
    if (process.env.JSON_OUTPUT === 'true') {
      console.log('\nJSON Output:');
      console.log(JSON.stringify(results, null, 2));
    }

    // Save to Strapi if configured
    if (process.env.STRAPI_URL && results.success.length > 0) {
      log('info', '\n📤 Syncing data to Strapi...');
      const strapiResults = await strapiService.saveExchangeRates(results.success);
      
      log('info', `✓ Strapi sync complete: ${strapiResults.results.length} saved, ${strapiResults.errors.length} failed`);
      
      if (strapiResults.errors.length > 0) {
        log('warn', 'Some rates failed to save to Strapi:', 
          strapiResults.errors.map(e => `${e.bank}: ${e.error}`).join(', ')
        );
      }
    } else if (!process.env.STRAPI_URL) {
      log('info', '\nℹ️  Strapi not configured. Set STRAPI_URL and STRAPI_API_TOKEN to sync data.');
    }

    // Exit code based on results
    if (results.failed.length > 0 && results.success.length === 0) {
      process.exit(1);
    }

  } catch (error) {
    log('error', 'Fatal error in crawler', { error: error.message, stack: error.stack });
    process.exit(1);
  } finally {
    // Always close the browser
    await crawler.close();
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  log('error', 'Unhandled rejection', { error: error.message });
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch(error => {
    log('error', 'Unhandled error', { error: error.message });
    process.exit(1);
  });
}

module.exports = { CurrencyCrawler };
