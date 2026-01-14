/**
 * Currency Crawler Scheduler
 * Runs the crawler on a schedule using cron
 */

require('dotenv').config();
const cron = require('node-cron');
const CurrencyCrawler = require('./classes/CurrencyCrawler');
const StrapiService = require('./services/StrapiService');
const { log } = require('./utils/helpers');

/**
 * Run the crawler once
 */
async function runCrawler() {
  const crawler = new CurrencyCrawler({
    headless: process.env.HEADLESS === 'true',
    timeout: parseInt(process.env.TIMEOUT || '30000')
  });

  const strapiService = new StrapiService({
    baseUrl: process.env.STRAPI_URL,
    apiToken: process.env.STRAPI_API_TOKEN
  });

  try {
    log('info', '🚀 Starting scheduled currency crawl...');
    
    // Initialize the crawler
    await crawler.initialize();

    // Crawl all banks
    const results = await crawler.crawl();

    // Display results
    console.log(crawler.formatResults(results));

    // Save to Strapi if configured
    if (process.env.STRAPI_URL && results.success.length > 0) {
      log('info', '📤 Syncing data to Strapi...');
      const strapiResults = await strapiService.saveExchangeRates(results.success);
      
      log('info', `✓ Strapi sync complete: ${strapiResults.results.length} saved, ${strapiResults.errors.length} failed`);
    }

    log('info', '✅ Scheduled crawl completed successfully');

  } catch (error) {
    log('error', '❌ Error in scheduled crawl', { error: error.message, stack: error.stack });
  } finally {
    await crawler.close();
  }
}

/**
 * Main scheduler function
 */
async function startScheduler() {
  const cronExpression = process.env.CRON_SCHEDULE || '0 0 * * *'; // Default: Every day at midnight
  
  log('info', '⏰ Currency Crawler Scheduler Starting...');
  log('info', `📅 Schedule: ${cronExpression}`);
  log('info', `🕐 Next run: ${getNextRunTime(cronExpression)}`);
  
  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    log('error', `Invalid cron expression: ${cronExpression}`);
    process.exit(1);
  }

  // Run immediately on startup if configured
  if (process.env.RUN_ON_STARTUP === 'true') {
    log('info', '▶️  Running crawler on startup...');
    await runCrawler();
  }

  // Schedule the cron job
  const task = cron.schedule(cronExpression, async () => {
    log('info', `⏰ Cron triggered at ${new Date().toISOString()}`);
    await runCrawler();
  }, {
    scheduled: true,
    timezone: process.env.TIMEZONE || 'UTC'
  });

  log('info', '✅ Scheduler is running. Press Ctrl+C to stop.');
  
  // Keep the process alive
  process.on('SIGINT', () => {
    log('info', 'Stopping scheduler...');
    task.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('info', 'Stopping scheduler...');
    task.stop();
    process.exit(0);
  });
}

/**
 * Get next run time for display
 */
function getNextRunTime(cronExpression) {
  // Simple display - in production you'd use a library to calculate this
  const scheduleMap = {
    '0 0 * * *': 'Every day at midnight (00:00)',
    '0 */12 * * *': 'Every 12 hours',
    '0 * * * *': 'Every hour',
    '*/30 * * * *': 'Every 30 minutes',
    '0 9 * * *': 'Every day at 9:00 AM',
    '0 0 * * 0': 'Every Sunday at midnight'
  };

  return scheduleMap[cronExpression] || cronExpression;
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  log('error', 'Unhandled rejection', { error: error.message });
});

// Start the scheduler
if (require.main === module) {
  startScheduler().catch(error => {
    log('error', 'Failed to start scheduler', { error: error.message });
    process.exit(1);
  });
}

module.exports = { runCrawler, startScheduler };
