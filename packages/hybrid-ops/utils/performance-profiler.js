/**
 * Performance Profiler
 *
 * Lightweight profiling utility for measuring operation latency and generating
 * statistical reports. Used for identifying bottlenecks and validating
 * performance targets in Story 1.10.
 *
 * @module PerformanceProfiler
 * @created 2025-01-19 (Story 1.10)
 */

const { performance } = require('perf_hooks');

/**
 * Calculate percentile value from sorted array
 * @param {number[]} values - Array of numeric values (will be sorted)
 * @param {number} p - Percentile (0-1, e.g., 0.95 for P95)
 * @returns {number} Percentile value
 */
function percentile(values, p) {
  if (!values || values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil(sorted.length * p) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Performance profiler with statistical analysis
 */
class PerformanceProfiler {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Start a timer for an operation
   * @param {string} operation - Operation name
   * @returns {number} Start timestamp (high-resolution)
   */
  startTimer(operation) {
    return performance.now();
  }

  /**
   * End a timer and record the duration
   * @param {string} operation - Operation name
   * @param {number} startTime - Start timestamp from startTimer()
   * @returns {number} Duration in milliseconds
   */
  endTimer(operation, startTime) {
    const duration = performance.now() - startTime;
    this.recordMetric(operation, duration);
    return duration;
  }

  /**
   * Record a metric value
   * @param {string} operation - Operation name
   * @param {number} value - Metric value
   */
  recordMetric(operation, value) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    this.metrics.get(operation).push(value);
  }

  /**
   * Get statistics for an operation
   * @param {string} operation - Operation name
   * @returns {Object} Statistics (count, mean, p50, p95, p99, max)
   */
  getStats(operation) {
    const values = this.metrics.get(operation) || [];

    if (values.length === 0) {
      return {
        count: 0,
        mean: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        max: 0
      };
    }

    const sum = values.reduce((a, b) => a + b, 0);

    return {
      count: values.length,
      mean: sum / values.length,
      p50: percentile(values, 0.5),
      p95: percentile(values, 0.95),
      p99: percentile(values, 0.99),
      max: Math.max(...values)
    };
  }

  /**
   * Generate comprehensive report for all operations
   * @returns {Object} Report object with stats for all operations
   */
  generateReport() {
    const report = {};
    for (const [operation, values] of this.metrics) {
      report[operation] = this.getStats(operation);
    }
    return report;
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Get all recorded operations
   * @returns {string[]} List of operation names
   */
  getOperations() {
    return Array.from(this.metrics.keys());
  }

  /**
   * Check if operation meets target (P95 latency)
   * @param {string} operation - Operation name
   * @param {number} targetMs - Target latency in ms
   * @returns {boolean} True if P95 meets target
   */
  meetsTarget(operation, targetMs) {
    const stats = this.getStats(operation);
    return stats.p95 <= targetMs;
  }
}

module.exports = { PerformanceProfiler, percentile };
