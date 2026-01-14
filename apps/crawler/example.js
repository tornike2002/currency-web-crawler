/**
 * Example usage of the Currency Crawler
 * This demonstrates different ways to use the crawler
 */

const { CurrencyCrawler } = require('./src');

async function example1_CrawlAll() {
  console.log('\n=== Example 1: Crawl All Banks ===\n');
  
  const crawler = new CurrencyCrawler({ headless: true });

  try {
    await crawler.initialize();
    const results = await crawler.crawl();
    console.log(crawler.formatResults(results));
  } finally {
    await crawler.close();
  }
}

async function example2_CrawlSpecificBank() {
  console.log('\n=== Example 2: Crawl Specific Bank ===\n');
  
  const crawler = new CurrencyCrawler({ headless: true });

  try {
    await crawler.initialize();
    const bogRates = await crawler.crawlBank('Bank of Georgia');
    
    console.log('Bank of Georgia USD Rates:');
    console.log(`  Official: ${bogRates.official} GEL`);
    console.log(`  Buy:      ${bogRates.buy} GEL`);
    console.log(`  Sell:     ${bogRates.sell} GEL`);
  } finally {
    await crawler.close();
  }
}

async function example3_CrawlMultipleSpecific() {
  console.log('\n=== Example 3: Crawl Multiple Specific Banks ===\n');
  
  const crawler = new CurrencyCrawler({ headless: true });

  try {
    await crawler.initialize();
    
    // Only crawl Bank of Georgia and TBC Bank
    const results = await crawler.crawl({
      banks: ['Bank of Georgia', 'TBC Bank']
    });
    
    console.log(crawler.formatResults(results));
  } finally {
    await crawler.close();
  }
}

async function example4_GetJSON() {
  console.log('\n=== Example 4: Get JSON Output ===\n');
  
  const crawler = new CurrencyCrawler({ headless: true });

  try {
    await crawler.initialize();
    const results = await crawler.crawl();
    
    // Output as JSON
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await crawler.close();
  }
}

// Run examples
async function main() {
  try {
    // Uncomment the example you want to run:
    
    await example1_CrawlAll();
    // await example2_CrawlSpecificBank();
    // await example3_CrawlMultipleSpecific();
    // await example4_GetJSON();
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
