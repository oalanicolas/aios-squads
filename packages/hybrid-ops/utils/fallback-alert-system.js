/**
 * Hybrid-Ops Fallback Alert System
 *
 * Monitors fallback events and triggers alerts when thresholds are exceeded
 * Helps identify system degradation and configuration issues early
 *
 * Alert Levels:
 * - INFO: 1-4 fallbacks/hour (informational)
 * - WARNING: 5-9 fallbacks/hour (monitor closely)
 * - CRITICAL: 10+ fallbacks/hour (immediate attention required)
 *
 * Usage:
 *   const { getFallbackAlertSystem } = require('./fallback-alert-system');
 *   const alertSystem = getFallbackAlertSystem();
 *   alertSystem.start(); // Start monitoring
 *
 * @module fallback-alert-system
 */

const { getMetricsCollector } = require('./metrics-collector');
const { getLogger } = require('./logger');

class FallbackAlertSystem {
  constructor(options = {}) {
    this.metrics = getMetricsCollector();
    this.logger = getLogger();

    // Configuration
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.checkInterval = options.checkInterval || 60000; // Check every minute
    this.alertCooldown = options.alertCooldown !== undefined ? options.alertCooldown : 600000; // 10 minutes cooldown between same alerts

    // Thresholds
    this.thresholds = {
      info: options.infoThreshold || 4,      // 1-4 fallbacks/hour
      warning: options.warningThreshold || 9, // 5-9 fallbacks/hour
      critical: options.criticalThreshold || 10 // 10+ fallbacks/hour
    };

    // Alert state tracking
    this.lastAlerts = new Map(); // reason -> { level, timestamp }
    this.checkTimer = null;
    this.running = false;
  }

  /**
   * Check if alert system is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Check if alert system is running
   * @returns {boolean}
   */
  isRunning() {
    return this.running;
  }

  /**
   * Determine alert level based on fallback count
   * @param {number} count - Fallback count in last hour
   * @returns {string|null} Alert level ('critical', 'warning', 'info', or null)
   */
  determineAlertLevel(count) {
    if (count >= this.thresholds.critical) return 'critical';
    if (count > this.thresholds.info) return 'warning';
    if (count >= 1) return 'info';
    return null;
  }

  /**
   * Check if we should send alert (respects cooldown)
   * @param {string} reason - Fallback reason
   * @param {string} level - Alert level
   * @returns {boolean}
   */
  shouldSendAlert(reason, level) {
    const key = `${reason}:${level}`;
    const lastAlert = this.lastAlerts.get(key);

    if (!lastAlert) return true;

    const timeSinceLastAlert = Date.now() - lastAlert.timestamp;
    return timeSinceLastAlert >= this.alertCooldown;
  }

  /**
   * Record that an alert was sent
   * @param {string} reason - Fallback reason
   * @param {string} level - Alert level
   */
  recordAlert(reason, level) {
    const key = `${reason}:${level}`;
    this.lastAlerts.set(key, {
      level,
      timestamp: Date.now()
    });
  }

  /**
   * Format alert message
   * @param {string} level - Alert level
   * @param {object} details - Alert details
   * @returns {string} Formatted message
   */
  formatAlertMessage(level, details) {
    const { reason, count, windowHours, recommendation } = details;

    const emoji = {
      critical: '🔴',
      warning: '🟡',
      info: '🔵'
    }[level] || '⚪';

    const levelText = level.toUpperCase();

    let message = `\n${emoji} FALLBACK ALERT [${levelText}]\n`;
    message += `${'─'.repeat(50)}\n`;
    message += `Reason: ${reason}\n`;
    message += `Count: ${count} fallbacks in last ${windowHours}h\n`;

    if (recommendation) {
      message += `\nRecommendation: ${recommendation}\n`;
    }

    message += `${'─'.repeat(50)}\n`;

    return message;
  }

  /**
   * Get recommendation for specific fallback reason
   * @param {string} reason - Fallback reason
   * @param {number} count - Fallback count
   * @returns {string} Recommendation
   */
  getRecommendation(reason, count) {
    const recommendations = {
      config_validation_failed: `Review configuration file syntax and schema. ${count > 10 ? 'High frequency suggests systematic issue.' : 'Validate config against logging.yaml schema.'}`,

      validation_veto_triggered: `Check for CRITICAL violations in Social level (Level -2). ${count > 5 ? 'Persistent vetoes may indicate alignment issues.' : 'Review recent validation logs for patterns.'}`,

      default: `Investigate root cause of '${reason}' fallbacks. Check logs for detailed error messages.`
    };

    return recommendations[reason] || recommendations.default;
  }

  /**
   * Send alert (logs + console output)
   * @param {string} level - Alert level
   * @param {object} details - Alert details
   */
  sendAlert(level, details) {
    const { reason, count, windowHours } = details;

    // Add recommendation
    details.recommendation = this.getRecommendation(reason, count);

    // Format and output message
    const message = this.formatAlertMessage(level, details);
    console.log(message);

    // Log based on level
    const logMethod = {
      critical: 'error',
      warning: 'warn',
      info: 'info'
    }[level] || 'info';

    this.logger[logMethod]('fallback-alert-system', 'alert_triggered', {
      alert_level: level,
      fallback_reason: reason,
      fallback_count: count,
      window_hours: windowHours,
      recommendation: details.recommendation
    });

    // Record alert
    this.recordAlert(reason, level);
  }

  /**
   * Check fallback rates and trigger alerts if needed
   */
  checkFallbackRates() {
    if (!this.enabled) return;

    const fallbackStats = this.metrics.getFallbackRate(1); // Last 1 hour

    if (fallbackStats.total === 0) {
      this.logger.debug('fallback-alert-system', 'check_completed', {
        fallbacks_found: 0,
        status: 'healthy'
      });
      return;
    }

    // Check each fallback reason
    for (const [reason, count] of Object.entries(fallbackStats.byReason)) {
      const level = this.determineAlertLevel(count);

      if (!level) continue; // No alert needed

      if (this.shouldSendAlert(reason, level)) {
        this.sendAlert(level, {
          reason,
          count,
          windowHours: fallbackStats.windowHours
        });
      } else {
        this.logger.debug('fallback-alert-system', 'alert_cooldown', {
          reason,
          level,
          count,
          message: 'Alert suppressed due to cooldown period'
        });
      }
    }
  }

  /**
   * Start the alert monitoring system
   */
  start() {
    if (this.running) {
      this.logger.warn('fallback-alert-system', 'already_running', {
        message: 'Alert system is already running'
      });
      return;
    }

    if (!this.enabled) {
      this.logger.info('fallback-alert-system', 'disabled', {
        message: 'Alert system is disabled in configuration'
      });
      return;
    }

    this.running = true;

    this.logger.info('fallback-alert-system', 'started', {
      check_interval_ms: this.checkInterval,
      alert_cooldown_ms: this.alertCooldown,
      thresholds: this.thresholds
    });

    console.log('\n🔔 Fallback Alert System started');
    console.log(`   Check interval: ${this.checkInterval / 1000}s`);
    console.log(`   Alert cooldown: ${this.alertCooldown / 60000}min\n`);

    // Initial check
    this.checkFallbackRates();

    // Set up periodic checks
    this.checkTimer = setInterval(() => {
      this.checkFallbackRates();
    }, this.checkInterval);
  }

  /**
   * Stop the alert monitoring system
   */
  stop() {
    if (!this.running) {
      this.logger.warn('fallback-alert-system', 'not_running', {
        message: 'Alert system is not running'
      });
      return;
    }

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }

    this.running = false;

    this.logger.info('fallback-alert-system', 'stopped', {
      message: 'Alert system stopped successfully'
    });

    console.log('\n🔕 Fallback Alert System stopped\n');
  }

  /**
   * Get alert system status
   * @returns {object} Status information
   */
  getStatus() {
    return {
      enabled: this.enabled,
      running: this.running,
      checkInterval: this.checkInterval,
      alertCooldown: this.alertCooldown,
      thresholds: this.thresholds,
      activeAlerts: this.lastAlerts.size
    };
  }

  /**
   * Reset alert history (useful for testing)
   */
  resetAlerts() {
    this.lastAlerts.clear();
    this.logger.info('fallback-alert-system', 'alerts_reset', {
      message: 'Alert history cleared'
    });
  }
}

// Singleton instance
let alertSystemInstance = null;

/**
 * Get fallback alert system instance (singleton)
 * @param {object} options - Alert system options
 * @returns {FallbackAlertSystem}
 */
function getFallbackAlertSystem(options = {}) {
  if (!alertSystemInstance) {
    alertSystemInstance = new FallbackAlertSystem(options);
  }
  return alertSystemInstance;
}

/**
 * Create a new fallback alert system instance (non-singleton, for testing)
 * @param {object} options - Alert system options
 * @returns {FallbackAlertSystem}
 */
function createFallbackAlertSystem(options = {}) {
  return new FallbackAlertSystem(options);
}

module.exports = {
  FallbackAlertSystem,
  getFallbackAlertSystem,
  createFallbackAlertSystem
};
