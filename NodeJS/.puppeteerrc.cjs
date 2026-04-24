const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Store the browser download inside the project folder so the path is
  // identical during `postinstall` (build step) and at runtime.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
