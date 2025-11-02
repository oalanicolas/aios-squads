/**
 * Hybrid-Ops Logger Utility
 *
 * Provides structured logging with rotation, levels, and performance optimization
 * Target: <5ms overhead per operation
 *
 * @module logger
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const appendFile = promisify(fs.appendFile);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'INFO';
    this.logDir = options.logDir || path.join(__dirname, '../logs');
    this.rotationDays = options.rotationDays || 7;
    this.maxFileSizeMB = options.maxFileSizeMB || 50;
    this.environment = options.environment || process.env.NODE_ENV || 'development';

    // Log levels hierarchy
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    };

    // Write queue for async batching
    this.writeQueue = [];
    this.isFlushing = false;
    this.flushInterval = options.flushInterval || 1000; // ms

    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Start periodic flush
    this.startPeriodicFlush();

    // Auto-cleanup old logs on initialization
    this.cleanupOldLogs().catch(err => {
      console.error('Failed to cleanup old logs:', err.message);
    });
  }

  /**
   * Get current date string for log file naming
   * @returns {string} YYYY-MM-DD
   */
  getCurrentDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0];
  }

  /**
   * Get log file path for a specific log type
   * @param {string} type - Log type (main, performance, fallback)
   * @returns {string} Full path to log file
   */
  getLogFilePath(type = 'main') {
    const date = this.getCurrentDateString();
    const fileMap = {
      main: `hybrid-ops-${date}.log`,
      performance: `performance-${date}.json`,
      fallback: `fallback-${date}.log`
    };
    return path.join(this.logDir, fileMap[type] || fileMap.main);
  }

  /**
   * Check if log level should be logged
   * @param {string} level - Log level
   * @returns {boolean}
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  /**
   * Format log entry as JSON
   * @param {string} level - Log level
   * @param {string} component - Component name
   * @param {string} event - Event name
   * @param {object} metadata - Additional metadata
   * @returns {object} Formatted log entry
   */
  formatLogEntry(level, component, event, metadata = {}) {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      event,
      metadata: {
        ...metadata,
        environment: this.environment
      }
    };
  }

  /**
   * Log a message (generic)
   * @param {string} level - Log level
   * @param {string} component - Component name
   * @param {string} event - Event name
   * @param {object} metadata - Additional metadata
   */
  async log(level, component, event, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry = this.formatLogEntry(level, component, event, metadata);
    const logLine = JSON.stringify(entry) + '\n';

    // Add to write queue (async batching for performance)
    this.writeQueue.push({
      type: 'main',
      content: logLine
    });

    // Special handling for fallback events
    if (event === 'fallback_triggered' || component === 'fallback') {
      this.writeQueue.push({
        type: 'fallback',
        content: logLine
      });
    }

    // In development, also console log for visibility
    if (this.environment === 'development') {
      const emoji = { DEBUG: '🔍', INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌' }[level] || 'ℹ️';
      console.log(`${emoji} [${component}] ${event}`, metadata);
    }
  }

  /**
   * Log debug message
   */
  debug(component, event, metadata) {
    return this.log('DEBUG', component, event, metadata);
  }

  /**
   * Log info message
   */
  info(component, event, metadata) {
    return this.log('INFO', component, event, metadata);
  }

  /**
   * Log warning message
   */
  warn(component, event, metadata) {
    return this.log('WARN', component, event, metadata);
  }

  /**
   * Log error message
   */
  error(component, event, metadata) {
    return this.log('ERROR', component, event, metadata);
  }

  /**
   * Log performance metrics
   * @param {object} metrics - Performance metrics object
   */
  async logPerformance(metrics) {
    const entry = {
      timestamp: new Date().toISOString(),
      ...metrics
    };

    this.writeQueue.push({
      type: 'performance',
      content: JSON.stringify(entry) + '\n'
    });
  }

  /**
   * Start periodic flush of write queue
   */
  startPeriodicFlush() {
    setInterval(() => {
      this.flush().catch(err => {
        console.error('Failed to flush logs:', err.message);
      });
    }, this.flushInterval);
  }

  /**
   * Flush write queue to disk (async batch write)
   */
  async flush() {
    if (this.isFlushing || this.writeQueue.length === 0) {
      return;
    }

    this.isFlushing = true;

    try {
      // Group writes by log type
      const writesByType = {};

      while (this.writeQueue.length > 0) {
        const write = this.writeQueue.shift();
        if (!writesByType[write.type]) {
          writesByType[write.type] = [];
        }
        writesByType[write.type].push(write.content);
      }

      // Write batches to files
      const writePromises = Object.entries(writesByType).map(([type, contents]) => {
        const filePath = this.getLogFilePath(type);
        const batch = contents.join('');
        return appendFile(filePath, batch);
      });

      await Promise.all(writePromises);
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Cleanup old log files based on rotation policy
   */
  async cleanupOldLogs() {
    try {
      const files = await readdir(this.logDir);
      const now = Date.now();
      const maxAge = this.rotationDays * 24 * 60 * 60 * 1000; // days to ms

      const cleanupPromises = files
        .filter(file => file.endsWith('.log') || file.endsWith('.json'))
        .map(async (file) => {
          const filePath = path.join(this.logDir, file);
          try {
            const stats = await stat(filePath);
            const age = now - stats.mtimeMs;

            // Delete if older than rotation policy
            if (age > maxAge) {
              await unlink(filePath);
              console.log(`Deleted old log file: ${file} (age: ${Math.round(age / (24 * 60 * 60 * 1000))} days)`);
            }

            // Also check file size and warn if exceeded
            const sizeMB = stats.size / (1024 * 1024);
            if (sizeMB > this.maxFileSizeMB) {
              console.warn(`Log file ${file} exceeds max size (${sizeMB.toFixed(2)}MB / ${this.maxFileSizeMB}MB)`);
            }
          } catch (err) {
            // Ignore errors for individual files
            console.error(`Error processing log file ${file}:`, err.message);
          }
        });

      await Promise.all(cleanupPromises);
    } catch (err) {
      console.error('Failed to cleanup logs:', err.message);
    }
  }

  /**
   * Force flush on shutdown
   */
  async shutdown() {
    await this.flush();
  }
}

// Singleton instance
let loggerInstance = null;

/**
 * Get logger instance (singleton)
 * @param {object} options - Logger options
 * @returns {Logger}
 */
function getLogger(options = {}) {
  if (!loggerInstance) {
    loggerInstance = new Logger(options);
  }
  return loggerInstance;
}

/**
 * Create a new logger instance (non-singleton, for testing)
 * @param {object} options - Logger options
 * @returns {Logger}
 */
function createLogger(options = {}) {
  return new Logger(options);
}

module.exports = {
  getLogger,
  createLogger,
  Logger
};
