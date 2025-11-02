/**
 * Hybrid-Ops Metrics Collector
 *
 * Lightweight performance metrics collection with <5ms overhead
 * Tracks mind loading, validation, cache, fallback, and heuristic execution metrics
 *
 * Target: <5ms overhead per operation, in-memory storage
 *
 * @module metrics-collector
 */

const { getLogger } = require('./logger');

class MetricsCollector {
  constructor(options = {}) {
    this.logger = getLogger();
    this.enabled = options.enabled !== undefined ? options.enabled : true;
    this.collectionInterval = options.collectionInterval || 1000; // ms
    this.retentionHours = options.retentionHours || 24;
    this.maxMetrics = options.maxMetrics || 10000; // Maximum metrics to keep in memory

    // Metric storage (circular buffer approach for memory efficiency)
    this.metrics = {
      mindLoadTime: [],
      validationOverhead: [],
      cacheHits: 0,
      cacheMisses: 0,
      fallbacks: [],
      heuristicExecutionTime: []
    };

    // Active timers for performance tracking
    this.activeTimers = new Map();

    // Start periodic cleanup
    this.startPeriodicCleanup();
  }

  /**
   * Check if metrics collection is enabled
   * @returns {boolean}
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Start a performance timer
   * @param {string} operationId - Unique operation identifier
   * @param {string} operationType - Type of operation (mind_load, validation, heuristic_exec)
   * @param {object} metadata - Additional metadata
   */
  startTimer(operationId, operationType, metadata = {}) {
    if (!this.enabled) return;

    this.activeTimers.set(operationId, {
      type: operationType,
      startTime: Date.now(),
      metadata
    });
  }

  /**
   * End a performance timer and record the metric
   * @param {string} operationId - Unique operation identifier
   * @param {object} additionalMetadata - Additional metadata to merge
   * @returns {number} Duration in milliseconds
   */
  endTimer(operationId, additionalMetadata = {}) {
    if (!this.enabled) return 0;

    const timer = this.activeTimers.get(operationId);
    if (!timer) {
      this.logger.warn('metrics-collector', 'timer_not_found', { operation_id: operationId });
      return 0;
    }

    const duration_ms = Date.now() - timer.startTime;
    this.activeTimers.delete(operationId);

    // Record metric based on operation type
    const metric = {
      timestamp: new Date().toISOString(),
      duration_ms,
      ...timer.metadata,
      ...additionalMetadata
    };

    switch (timer.type) {
      case 'mind_load':
        this.recordMindLoadTime(metric);
        break;
      case 'validation':
        this.recordValidationOverhead(metric);
        break;
      case 'heuristic_exec':
        this.recordHeuristicExecutionTime(metric);
        break;
      default:
        this.logger.warn('metrics-collector', 'unknown_timer_type', { type: timer.type });
    }

    return duration_ms;
  }

  /**
   * Record mind load time metric
   * @param {object} metric - Metric data
   */
  recordMindLoadTime(metric) {
    this.addMetric('mindLoadTime', metric);
    this.logger.debug('metrics-collector', 'mind_load_time_recorded', {
      duration_ms: metric.duration_ms,
      cached: metric.cached || false
    });
  }

  /**
   * Record validation overhead metric
   * @param {object} metric - Metric data
   */
  recordValidationOverhead(metric) {
    this.addMetric('validationOverhead', metric);
    this.logger.debug('metrics-collector', 'validation_overhead_recorded', {
      duration_ms: metric.duration_ms,
      score: metric.score || 0
    });
  }

  /**
   * Record heuristic execution time metric
   * @param {object} metric - Metric data
   */
  recordHeuristicExecutionTime(metric) {
    this.addMetric('heuristicExecutionTime', metric);
    this.logger.debug('metrics-collector', 'heuristic_execution_time_recorded', {
      duration_ms: metric.duration_ms,
      heuristic_id: metric.heuristic_id
    });
  }

  /**
   * Record cache hit
   * @param {object} metadata - Cache hit metadata
   */
  recordCacheHit(metadata = {}) {
    if (!this.enabled) return;

    this.metrics.cacheHits++;
    this.logger.debug('metrics-collector', 'cache_hit_recorded', {
      total_hits: this.metrics.cacheHits,
      ...metadata
    });
  }

  /**
   * Record cache miss
   * @param {object} metadata - Cache miss metadata
   */
  recordCacheMiss(metadata = {}) {
    if (!this.enabled) return;

    this.metrics.cacheMisses++;
    this.logger.debug('metrics-collector', 'cache_miss_recorded', {
      total_misses: this.metrics.cacheMisses,
      ...metadata
    });
  }

  /**
   * Record fallback event
   * @param {string} reason - Reason for fallback
   * @param {object} metadata - Additional metadata
   */
  recordFallback(reason, metadata = {}) {
    if (!this.enabled) return;

    const fallback = {
      timestamp: new Date().toISOString(),
      reason,
      ...metadata
    };

    this.addMetric('fallbacks', fallback);

    this.logger.warn('metrics-collector', 'fallback_recorded', {
      reason,
      total_fallbacks: this.metrics.fallbacks.length
    });
  }

  /**
   * Add a metric to a collection (with circular buffer behavior)
   * @private
   * @param {string} metricType - Type of metric
   * @param {object} metric - Metric data
   */
  addMetric(metricType, metric) {
    const collection = this.metrics[metricType];

    if (!Array.isArray(collection)) {
      this.logger.error('metrics-collector', 'invalid_metric_type', { metric_type: metricType });
      return;
    }

    // Add metric
    collection.push(metric);

    // Enforce max size (circular buffer)
    if (collection.length > this.maxMetrics) {
      collection.shift(); // Remove oldest
    }
  }

  /**
   * Get cache hit rate
   * @returns {number} Hit rate as percentage (0-100)
   */
  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    if (total === 0) return 0;

    return (this.metrics.cacheHits / total) * 100;
  }

  /**
   * Get average mind load time
   * @param {boolean} cachedOnly - Only include cached loads
   * @returns {number} Average duration in milliseconds
   */
  getAverageMindLoadTime(cachedOnly = false) {
    const loads = cachedOnly
      ? this.metrics.mindLoadTime.filter(m => m.cached)
      : this.metrics.mindLoadTime;

    if (loads.length === 0) return 0;

    const total = loads.reduce((sum, m) => sum + m.duration_ms, 0);
    return total / loads.length;
  }

  /**
   * Get average validation overhead
   * @returns {number} Average duration in milliseconds
   */
  getAverageValidationOverhead() {
    const validations = this.metrics.validationOverhead;
    if (validations.length === 0) return 0;

    const total = validations.reduce((sum, m) => sum + m.duration_ms, 0);
    return total / validations.length;
  }

  /**
   * Get percentile value from a metric collection
   * @private
   * @param {Array} collection - Metric collection
   * @param {number} percentile - Percentile (0-100)
   * @returns {number} Percentile value
   */
  getPercentile(collection, percentile) {
    if (collection.length === 0) return 0;

    const sorted = collection.map(m => m.duration_ms).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get P95 validation overhead
   * @returns {number} P95 duration in milliseconds
   */
  getP95ValidationOverhead() {
    return this.getPercentile(this.metrics.validationOverhead, 95);
  }

  /**
   * Get P99 validation overhead
   * @returns {number} P99 duration in milliseconds
   */
  getP99ValidationOverhead() {
    return this.getPercentile(this.metrics.validationOverhead, 99);
  }

  /**
   * Get fallback rate in the last N hours
   * @param {number} hours - Number of hours to look back
   * @returns {object} Fallback statistics
   */
  getFallbackRate(hours = 1) {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentFallbacks = this.metrics.fallbacks.filter(f => {
      const timestamp = new Date(f.timestamp).getTime();
      return timestamp >= cutoffTime;
    });

    const fallbacksByReason = {};
    recentFallbacks.forEach(f => {
      fallbacksByReason[f.reason] = (fallbacksByReason[f.reason] || 0) + 1;
    });

    return {
      total: recentFallbacks.length,
      byReason: fallbacksByReason,
      windowHours: hours
    };
  }

  /**
   * Get all metrics summary
   * @returns {object} Complete metrics summary
   */
  getSummary() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    // Filter metrics from last 24 hours
    const recentMindLoads = this.metrics.mindLoadTime.filter(m =>
      new Date(m.timestamp).getTime() >= oneDayAgo
    );
    const recentValidations = this.metrics.validationOverhead.filter(m =>
      new Date(m.timestamp).getTime() >= oneDayAgo
    );
    const recentFallbacks = this.metrics.fallbacks.filter(f =>
      new Date(f.timestamp).getTime() >= oneDayAgo
    );

    return {
      mindLoading: {
        firstLoad: {
          average: this.getAverageMindLoadTime(false),
          count: recentMindLoads.filter(m => !m.cached).length
        },
        cached: {
          average: this.getAverageMindLoadTime(true),
          count: recentMindLoads.filter(m => m.cached).length
        },
        total: recentMindLoads.length
      },
      validation: {
        average: this.getAverageValidationOverhead(),
        p95: this.getP95ValidationOverhead(),
        p99: this.getP99ValidationOverhead(),
        count: recentValidations.length
      },
      cache: {
        hits: this.metrics.cacheHits,
        misses: this.metrics.cacheMisses,
        hitRate: this.getCacheHitRate()
      },
      fallbacks: {
        total: recentFallbacks.length,
        byReason: recentFallbacks.reduce((acc, f) => {
          acc[f.reason] = (acc[f.reason] || 0) + 1;
          return acc;
        }, {})
      },
      heuristics: {
        executions: this.metrics.heuristicExecutionTime.length,
        averageDuration: this.metrics.heuristicExecutionTime.length > 0
          ? this.metrics.heuristicExecutionTime.reduce((sum, m) => sum + m.duration_ms, 0) /
            this.metrics.heuristicExecutionTime.length
          : 0
      },
      collectionPeriod: {
        start: recentMindLoads.length > 0
          ? recentMindLoads[0].timestamp
          : new Date(oneDayAgo).toISOString(),
        end: new Date().toISOString(),
        hours: 24
      }
    };
  }

  /**
   * Export metrics to JSON format (for performance log file)
   * @returns {string} JSON string
   */
  exportToJSON() {
    return JSON.stringify({
      exported_at: new Date().toISOString(),
      summary: this.getSummary(),
      raw_metrics: {
        mind_load_count: this.metrics.mindLoadTime.length,
        validation_count: this.metrics.validationOverhead.length,
        fallback_count: this.metrics.fallbacks.length,
        heuristic_exec_count: this.metrics.heuristicExecutionTime.length
      }
    }, null, 2);
  }

  /**
   * Clear old metrics based on retention policy
   * @private
   */
  cleanupOldMetrics() {
    const cutoffTime = Date.now() - (this.retentionHours * 60 * 60 * 1000);

    // Clean up time-series metrics
    ['mindLoadTime', 'validationOverhead', 'fallbacks', 'heuristicExecutionTime'].forEach(metricType => {
      const collection = this.metrics[metricType];
      if (Array.isArray(collection)) {
        const sizeBefore = collection.length;
        const filtered = collection.filter(m => {
          const timestamp = new Date(m.timestamp).getTime();
          return timestamp >= cutoffTime;
        });

        if (filtered.length < sizeBefore) {
          this.metrics[metricType] = filtered;
          this.logger.debug('metrics-collector', 'metrics_cleaned', {
            metric_type: metricType,
            removed: sizeBefore - filtered.length,
            remaining: filtered.length
          });
        }
      }
    });
  }

  /**
   * Start periodic cleanup of old metrics
   * @private
   */
  startPeriodicCleanup() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Reset all metrics (for testing or manual reset)
   */
  reset() {
    this.metrics = {
      mindLoadTime: [],
      validationOverhead: [],
      cacheHits: 0,
      cacheMisses: 0,
      fallbacks: [],
      heuristicExecutionTime: []
    };

    this.activeTimers.clear();

    this.logger.info('metrics-collector', 'metrics_reset', {
      reset_at: new Date().toISOString()
    });
  }
}

// Singleton instance
let metricsInstance = null;

/**
 * Get metrics collector instance (singleton)
 * @param {object} options - Collector options
 * @returns {MetricsCollector}
 */
function getMetricsCollector(options = {}) {
  if (!metricsInstance) {
    metricsInstance = new MetricsCollector(options);
  }
  return metricsInstance;
}

/**
 * Create a new metrics collector instance (non-singleton, for testing)
 * @param {object} options - Collector options
 * @returns {MetricsCollector}
 */
function createMetricsCollector(options = {}) {
  return new MetricsCollector(options);
}

module.exports = {
  MetricsCollector,
  getMetricsCollector,
  createMetricsCollector
};
