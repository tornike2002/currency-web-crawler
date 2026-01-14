/**
 * Helper utilities for the currency crawler
 */

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse Georgian number format (with comma as decimal separator)
 * @param {string} value - The value to parse
 * @returns {number|null} Parsed number or null
 */
function parseGeorgianNumber(value) {
  if (!value) return null;
  
  // Remove spaces and replace comma with dot
  const cleaned = value.toString().trim().replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Wait for a specified amount of time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Initial delay in milliseconds
 * @returns {Promise<any>}
 */
async function retry(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${waitTime}ms...`);
        await sleep(waitTime);
      }
    }
  }
  
  throw lastError;
}

/**
 * Log with timestamp
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Message to log
 * @param {Object} data - Additional data to log
 */
function log(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  
  if (Object.keys(data).length > 0) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

module.exports = {
  formatDate,
  parseGeorgianNumber,
  sleep,
  retry,
  log
};
