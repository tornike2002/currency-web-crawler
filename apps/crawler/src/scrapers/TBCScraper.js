/**
 * TBC Bank Currency Scraper
 * Scrapes USD exchange rates from TBC Bank website
 */

const { parseGeorgianNumber, log, retry } = require('../utils/helpers');

class TBCScraper {
  constructor(browser) {
    this.browser = browser;
    this.url = 'https://www.tbcbank.ge/web/ka/web/guest/exchange-rates';
    this.name = 'TBC Bank';
  }

  /**
   * Scrape USD exchange rates from TBC Bank
   * @returns {Promise<Object>} Exchange rate data
   */
  async scrape() {
    log('info', `Scraping ${this.name}...`);
    
    return retry(async () => {
      const page = await this.browser.newPage();
      
      try {
        // Set viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navigate to the page
        log('info', `Navigating to ${this.url}`);
        await page.goto(this.url, { 
          waitUntil: 'networkidle2',
          timeout: 60000 
        });

        // Wait for content to load (Angular app needs time)
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Extract exchange rates from TBC's custom elements
        const rates = await page.evaluate(() => {
          const result = {
            buy: null,
            sell: null,
            official: null
          };

          // Find all currency items
          const currencyItems = document.querySelectorAll('tbcx-pw-popular-currency-item');
          
          // Find the USD item (first one)
          for (const item of currencyItems) {
            const badge = item.querySelector('tbcx-pw-currency-badge');
            if (badge && badge.textContent.trim().includes('USD')) {
              // Get official rate from the <strong> tag
              const officialElement = item.querySelector('.tbcx-pw-popular-currencies__caption strong');
              if (officialElement) {
                result.official = parseFloat(officialElement.textContent.trim());
              }
              
              // Get buy and sell rates from body elements
              const bodyElements = item.querySelectorAll('.tbcx-pw-popular-currencies__body');
              if (bodyElements.length >= 2) {
                result.buy = parseFloat(bodyElements[0].textContent.trim());
                result.sell = parseFloat(bodyElements[1].textContent.trim());
              }
              
              break; // Stop after finding USD
            }
          }

          return result;
        });

        if (!rates.buy || !rates.sell) {
          await page.close();
          throw new Error('Failed to extract exchange rates from page');
        }

        const result = {
          bank: this.name,
          currency: 'USD',
          official: rates.official,
          buy: rates.buy,
          sell: rates.sell,
          timestamp: new Date().toISOString(),
          source: this.url
        };

        log('info', `${this.name} rates scraped successfully`, result);
        
        await page.close();
        return result;

      } catch (error) {
        try {
          await page.close();
        } catch (closeError) {
          // Page already closed, ignore
        }
        log('error', `Error scraping ${this.name}`, { error: error.message });
        throw error;
      }
    }, 3, 2000);
  }
}

module.exports = TBCScraper;
