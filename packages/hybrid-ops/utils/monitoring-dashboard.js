/**
 * Hybrid-Ops Monitoring Dashboard
 *
 * CLI-based dashboard for monitoring Pedro Valério mind system performance
 * Displays real-time metrics, cache effectiveness, validation overhead, and fallback rates
 *
 * Usage:
 *   node monitoring-dashboard.js           # Single snapshot
 *   node monitoring-dashboard.js --watch   # Continuous monitoring (refresh every 5s)
 *   node monitoring-dashboard.js --export  # Export metrics to JSON file
 *
 * @module monitoring-dashboard
 */

const { getMetricsCollector } = require('./metrics-collector');
const { getLogger } = require('./logger');

class MonitoringDashboard {
  constructor(options = {}) {
    this.metrics = getMetricsCollector();
    this.logger = getLogger();
    this.refreshInterval = options.refreshInterval || 5000; // ms
    this.watchMode = options.watchMode || false;
    this.exportMode = options.exportMode || false;
    this.watchTimer = null;
  }

  /**
   * Format duration for display
   * @param {number} ms - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  formatDuration(ms) {
    if (ms === 0) return '0ms';
    if (ms < 1) return '<1ms';
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format percentage for display
   * @param {number} value - Percentage (0-100)
   * @returns {string} Formatted percentage
   */
  formatPercentage(value) {
    if (value === 0) return '0%';
    return `${value.toFixed(1)}%`;
  }

  /**
   * Get color code for value based on threshold
   * @param {number} value - Value to check
   * @param {object} thresholds - Threshold configuration
   * @returns {string} ANSI color code
   */
  getColorForValue(value, thresholds) {
    const { good, warning, critical } = thresholds;

    if (critical !== undefined && value >= critical) return '\x1b[31m'; // Red
    if (warning !== undefined && value >= warning) return '\x1b[33m'; // Yellow
    if (good !== undefined && value >= good) return '\x1b[32m'; // Green

    return '\x1b[0m'; // Default
  }

  /**
   * Get status indicator for metric
   * @param {number} value - Metric value
   * @param {object} thresholds - Threshold configuration
   * @returns {string} Status indicator (✓, ⚠, ✗)
   */
  getStatusIndicator(value, thresholds) {
    const { good, warning, critical } = thresholds;

    if (critical !== undefined && value >= critical) return '✗';
    if (warning !== undefined && value >= warning) return '⚠';
    if (good !== undefined && value >= good) return '✓';

    return '·';
  }

  /**
   * Render section header
   * @param {string} title - Section title
   */
  renderSectionHeader(title) {
    const width = 60;
    const padding = Math.floor((width - title.length - 2) / 2);
    const line = '─'.repeat(width);

    console.log(`\n\x1b[1m${line}\x1b[0m`);
    console.log(`\x1b[1m${' '.repeat(padding)}${title}${' '.repeat(padding)}\x1b[0m`);
    console.log(`\x1b[1m${line}\x1b[0m\n`);
  }

  /**
   * Render metric row
   * @param {string} label - Metric label
   * @param {string} value - Metric value
   * @param {string} status - Status indicator
   * @param {string} color - ANSI color code
   */
  renderMetricRow(label, value, status = '', color = '\x1b[0m') {
    const labelWidth = 35;
    const valueWidth = 15;
    const paddedLabel = label.padEnd(labelWidth);
    const paddedValue = value.padStart(valueWidth);

    console.log(`  ${paddedLabel}${color}${status} ${paddedValue}\x1b[0m`);
  }

  /**
   * Render the complete dashboard
   */
  render() {
    const summary = this.metrics.getSummary();

    // Clear screen in watch mode
    if (this.watchMode) {
      console.clear();
    }

    // Header
    console.log('\n\x1b[1m\x1b[36m╔════════════════════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[1m\x1b[36m║     Pedro Valério Mind System - Performance Monitor       ║\x1b[0m');
    console.log('\x1b[1m\x1b[36m╚════════════════════════════════════════════════════════════╝\x1b[0m');

    // Timestamp
    const now = new Date().toISOString();
    console.log(`\n  \x1b[2mLast Updated: ${now}\x1b[0m`);
    console.log(`  \x1b[2mCollection Period: ${summary.collectionPeriod.hours}h (${summary.collectionPeriod.start} to ${summary.collectionPeriod.end})\x1b[0m`);

    // Mind Loading Performance
    this.renderSectionHeader('🧠 Mind Loading Performance');

    const firstLoadAvg = summary.mindLoading.firstLoad.average;
    const firstLoadColor = this.getColorForValue(firstLoadAvg, { warning: 100, critical: 500 });
    const firstLoadStatus = this.getStatusIndicator(firstLoadAvg, { warning: 100, critical: 500 });

    this.renderMetricRow(
      'First Load (Average)',
      this.formatDuration(firstLoadAvg),
      firstLoadStatus,
      firstLoadColor
    );

    this.renderMetricRow(
      'First Load (Count)',
      summary.mindLoading.firstLoad.count.toString()
    );

    const cachedLoadAvg = summary.mindLoading.cached.average;
    const cachedLoadColor = this.getColorForValue(cachedLoadAvg, { warning: 10, critical: 50 });
    const cachedLoadStatus = this.getStatusIndicator(cachedLoadAvg, { warning: 10, critical: 50 });

    this.renderMetricRow(
      'Cached Load (Average)',
      this.formatDuration(cachedLoadAvg),
      cachedLoadStatus,
      cachedLoadColor
    );

    this.renderMetricRow(
      'Cached Load (Count)',
      summary.mindLoading.cached.count.toString()
    );

    this.renderMetricRow(
      'Total Loads',
      summary.mindLoading.total.toString()
    );

    // Validation Performance
    this.renderSectionHeader('✓ Validation Performance');

    const validationAvg = summary.validation.average;
    const validationAvgColor = this.getColorForValue(validationAvg, { warning: 5, critical: 20 });
    const validationAvgStatus = this.getStatusIndicator(validationAvg, { warning: 5, critical: 20 });

    this.renderMetricRow(
      'Average Overhead',
      this.formatDuration(validationAvg),
      validationAvgStatus,
      validationAvgColor
    );

    const validationP95 = summary.validation.p95;
    const validationP95Color = this.getColorForValue(validationP95, { warning: 10, critical: 50 });
    const validationP95Status = this.getStatusIndicator(validationP95, { warning: 10, critical: 50 });

    this.renderMetricRow(
      'P95 Overhead',
      this.formatDuration(validationP95),
      validationP95Status,
      validationP95Color
    );

    const validationP99 = summary.validation.p99;
    const validationP99Color = this.getColorForValue(validationP99, { warning: 20, critical: 100 });
    const validationP99Status = this.getStatusIndicator(validationP99, { warning: 20, critical: 100 });

    this.renderMetricRow(
      'P99 Overhead',
      this.formatDuration(validationP99),
      validationP99Status,
      validationP99Color
    );

    this.renderMetricRow(
      'Total Validations',
      summary.validation.count.toString()
    );

    // Cache Performance
    this.renderSectionHeader('💾 Cache Performance');

    const cacheHitRate = summary.cache.hitRate;
    const cacheHitRateColor = this.getColorForValue(cacheHitRate, { good: 80, warning: 50 });
    const cacheHitRateStatus = this.getStatusIndicator(cacheHitRate, { good: 80, warning: 50 });

    this.renderMetricRow(
      'Hit Rate',
      this.formatPercentage(cacheHitRate),
      cacheHitRateStatus,
      cacheHitRateColor
    );

    this.renderMetricRow(
      'Cache Hits',
      summary.cache.hits.toString()
    );

    this.renderMetricRow(
      'Cache Misses',
      summary.cache.misses.toString()
    );

    const totalCacheOps = summary.cache.hits + summary.cache.misses;
    this.renderMetricRow(
      'Total Operations',
      totalCacheOps.toString()
    );

    // Fallback Analysis
    this.renderSectionHeader('⚠️  Fallback Analysis');

    const fallbackTotal = summary.fallbacks.total;
    const fallbackColor = this.getColorForValue(fallbackTotal, { warning: 5, critical: 20 });
    const fallbackStatus = this.getStatusIndicator(fallbackTotal, { warning: 5, critical: 20 });

    this.renderMetricRow(
      'Total Fallbacks (24h)',
      fallbackTotal.toString(),
      fallbackStatus,
      fallbackColor
    );

    if (Object.keys(summary.fallbacks.byReason).length > 0) {
      console.log('\n  \x1b[2mFallbacks by Reason:\x1b[0m');
      for (const [reason, count] of Object.entries(summary.fallbacks.byReason)) {
        this.renderMetricRow(`    ${reason}`, count.toString());
      }
    } else {
      console.log('  \x1b[32m✓ No fallbacks recorded\x1b[0m');
    }

    // Heuristic Execution
    this.renderSectionHeader('🔧 Heuristic Execution');

    const heuristicAvg = summary.heuristics.averageDuration;
    const heuristicAvgColor = this.getColorForValue(heuristicAvg, { warning: 50, critical: 200 });
    const heuristicAvgStatus = this.getStatusIndicator(heuristicAvg, { warning: 50, critical: 200 });

    this.renderMetricRow(
      'Average Duration',
      this.formatDuration(heuristicAvg),
      heuristicAvgStatus,
      heuristicAvgColor
    );

    this.renderMetricRow(
      'Total Executions',
      summary.heuristics.executions.toString()
    );

    // Performance Recommendations
    this.renderSectionHeader('💡 Recommendations');

    const recommendations = this.generateRecommendations(summary);

    if (recommendations.length === 0) {
      console.log('  \x1b[32m✓ System performance is optimal\x1b[0m\n');
    } else {
      recommendations.forEach((rec, index) => {
        const icon = rec.severity === 'critical' ? '🔴' :
                     rec.severity === 'warning' ? '🟡' : '🔵';
        console.log(`  ${icon} ${rec.message}`);
      });
      console.log('');
    }

    // Footer
    console.log('\x1b[2m' + '─'.repeat(60) + '\x1b[0m');

    if (this.watchMode) {
      console.log(`\n  \x1b[2mRefreshing every ${this.refreshInterval / 1000}s... (Press Ctrl+C to exit)\x1b[0m\n`);
    }
  }

  /**
   * Generate performance recommendations based on metrics
   * @param {object} summary - Metrics summary
   * @returns {Array} Recommendations
   */
  generateRecommendations(summary) {
    const recommendations = [];

    // Mind loading recommendations
    if (summary.mindLoading.firstLoad.average > 500) {
      recommendations.push({
        severity: 'critical',
        message: 'First load time is high (>500ms). Consider optimizing mind artifact loading.'
      });
    } else if (summary.mindLoading.firstLoad.average > 100) {
      recommendations.push({
        severity: 'warning',
        message: 'First load time exceeds 100ms. Monitor for further increases.'
      });
    }

    // Validation overhead recommendations
    if (summary.validation.p99 > 100) {
      recommendations.push({
        severity: 'critical',
        message: 'P99 validation overhead is high (>100ms). Review validation logic complexity.'
      });
    } else if (summary.validation.p99 > 50) {
      recommendations.push({
        severity: 'warning',
        message: 'P99 validation overhead exceeds 50ms. Consider optimization.'
      });
    }

    // Cache recommendations
    if (summary.cache.hitRate < 50 && (summary.cache.hits + summary.cache.misses) > 10) {
      recommendations.push({
        severity: 'warning',
        message: 'Cache hit rate is below 50%. Review caching strategy.'
      });
    }

    // Fallback recommendations
    if (summary.fallbacks.total > 20) {
      recommendations.push({
        severity: 'critical',
        message: `High fallback rate (${summary.fallbacks.total} in 24h). Investigate root causes.`
      });
    } else if (summary.fallbacks.total > 5) {
      recommendations.push({
        severity: 'warning',
        message: `Elevated fallback rate (${summary.fallbacks.total} in 24h). Monitor trends.`
      });
    }

    // Heuristic execution recommendations
    if (summary.heuristics.averageDuration > 200) {
      recommendations.push({
        severity: 'critical',
        message: 'Heuristic execution time is high (>200ms). Optimize compilation logic.'
      });
    }

    return recommendations;
  }

  /**
   * Export metrics to JSON file
   * @param {string} outputPath - Output file path
   */
  exportMetrics(outputPath = './logs/performance-metrics.json') {
    const fs = require('fs');
    const path = require('path');

    const exportData = this.metrics.exportToJSON();

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, exportData, 'utf8');

    console.log(`\n✓ Metrics exported to: ${outputPath}\n`);
    this.logger.info('monitoring-dashboard', 'metrics_exported', {
      output_path: outputPath,
      file_size: exportData.length
    });
  }

  /**
   * Start watch mode (continuous monitoring)
   */
  startWatch() {
    this.watchMode = true;

    // Initial render
    this.render();

    // Set up refresh interval
    this.watchTimer = setInterval(() => {
      this.render();
    }, this.refreshInterval);
  }

  /**
   * Stop watch mode
   */
  stopWatch() {
    if (this.watchTimer) {
      clearInterval(this.watchTimer);
      this.watchTimer = null;
    }
    this.watchMode = false;
  }

  /**
   * Run dashboard based on mode
   */
  run() {
    if (this.exportMode) {
      this.exportMetrics();
    } else if (this.watchMode) {
      this.startWatch();

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        this.stopWatch();
        console.log('\n\n  \x1b[2mMonitoring stopped.\x1b[0m\n');
        process.exit(0);
      });
    } else {
      this.render();
    }
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const watchMode = args.includes('--watch') || args.includes('-w');
  const exportMode = args.includes('--export') || args.includes('-e');

  const dashboard = new MonitoringDashboard({
    watchMode,
    exportMode
  });

  dashboard.run();
}

module.exports = MonitoringDashboard;
