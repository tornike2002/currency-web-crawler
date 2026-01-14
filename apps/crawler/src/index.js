/**
 * Currency Crawler Entry Point
 * Main script to run the currency exchange rate crawler
 */

require('dotenv').config();
const CurrencyCrawler = require('./classes/CurrencyCrawler');
const { log } = require('./utils/helpers');

/**
 * Main function to run the crawler
 */
async function main() {
  const crawler = new CurrencyCrawler({
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '30000')
  });

  try {
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
