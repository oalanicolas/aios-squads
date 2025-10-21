# Pedro Valério Mind System - Monitoring & Operations Runbook

## Overview

This runbook provides operational guidance for monitoring and maintaining the Pedro Valério mind system's performance, health, and reliability.

**Version:** 1.0
**Last Updated:** 2025
**Maintained By:** Hybrid-Ops Team

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Monitoring Infrastructure](#monitoring-infrastructure)
3. [Common Operational Tasks](#common-operational-tasks)
4. [Performance Thresholds](#performance-thresholds)
5. [Alert Response Procedures](#alert-response-procedures)
6. [Troubleshooting Guide](#troubleshooting-guide)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Escalation Paths](#escalation-paths)

---

## Quick Start

### View Real-Time Metrics

```bash
# Single snapshot
node .claude/commands/hybridOps/utils/monitoring-dashboard.js

# Continuous monitoring (refreshes every 5s)
node .claude/commands/hybridOps/utils/monitoring-dashboard.js --watch

# Export metrics to JSON
node .claude/commands/hybridOps/utils/monitoring-dashboard.js --export
```

### Start Fallback Alert System

```javascript
const { getFallbackAlertSystem } = require('./utils/fallback-alert-system');

const alertSystem = getFallbackAlertSystem();
alertSystem.start();
```

### View Logs

```bash
# View all logs (last 100 lines)
tail -n 100 .claude/commands/hybridOps/logs/hybrid-ops.log

# Follow logs in real-time
tail -f .claude/commands/hybridOps/logs/hybrid-ops.log

# Filter by level
grep "ERROR" .claude/commands/hybridOps/logs/hybrid-ops.log
grep "WARN" .claude/commands/hybridOps/logs/hybrid-ops.log

# View specific component logs
grep "mind-loader" .claude/commands/hybridOps/logs/hybrid-ops.log
grep "axioma-validator" .claude/commands/hybridOps/logs/hybrid-ops.log
grep "heuristic-compiler" .claude/commands/hybridOps/logs/hybrid-ops.log
```

---

## Monitoring Infrastructure

### Components

#### 1. Logger (`logger.js`)
- **Purpose:** Structured logging with severity levels
- **Configuration:** `config/logging.yaml`
- **Output:** `logs/hybrid-ops.log`
- **Levels:** DEBUG, INFO, WARN, ERROR

#### 2. Metrics Collector (`metrics-collector.js`)
- **Purpose:** Lightweight performance metrics collection
- **Overhead Target:** <5ms per operation
- **Retention:** 24 hours (configurable)
- **Storage:** In-memory with circular buffer (max 10,000 metrics)

#### 3. Monitoring Dashboard (`monitoring-dashboard.js`)
- **Purpose:** CLI-based real-time metrics visualization
- **Refresh Rate:** 5 seconds (watch mode)
- **Export Format:** JSON

#### 4. Fallback Alert System (`fallback-alert-system.js`)
- **Purpose:** Automated monitoring and alerting for fallback events
- **Check Interval:** 1 minute
- **Alert Cooldown:** 10 minutes

### Metrics Collected

#### Mind Loading Performance
- **First Load Time:** Time to load mind from disk (target: <100ms)
- **Cached Load Time:** Time to load from cache (target: <10ms)
- **Load Count:** Number of loads (first vs cached)

#### Validation Performance
- **Average Overhead:** Mean validation time (target: <5ms)
- **P95 Overhead:** 95th percentile (target: <10ms)
- **P99 Overhead:** 99th percentile (target: <20ms)
- **Validation Count:** Total validations executed

#### Cache Performance
- **Hit Rate:** Percentage of cache hits (target: >80%)
- **Cache Hits:** Number of successful cache retrievals
- **Cache Misses:** Number of cache misses requiring load

#### Fallback Events
- **Total Fallbacks:** Count in last 24h (target: <5)
- **By Reason:** Breakdown by fallback type
  - `config_validation_failed`: Configuration syntax/schema errors
  - `validation_veto_triggered`: CRITICAL violations in Social level

#### Heuristic Execution
- **Average Duration:** Mean compilation time (target: <50ms)
- **Total Executions:** Number of compilations performed

---

## Common Operational Tasks

### Check System Health

```bash
# Quick health check
node .claude/commands/hybridOps/utils/monitoring-dashboard.js
```

**Healthy System Indicators:**
- ✓ First load time <100ms
- ✓ Cached load time <10ms
- ✓ Cache hit rate >80%
- ✓ No fallbacks in last hour
- ✓ P99 validation overhead <20ms

### Export Performance Data

```bash
# Export current metrics
node .claude/commands/hybridOps/utils/monitoring-dashboard.js --export

# Output: logs/performance-metrics.json
```

### Monitor Specific Component

```bash
# Mind loader activity
grep "mind-loader" logs/hybrid-ops.log | tail -n 50

# Validation activity
grep "axioma-validator" logs/hybrid-ops.log | tail -n 50

# Heuristic compilation
grep "heuristic-compiler" logs/hybrid-ops.log | tail -n 50
```

### Reset Metrics (Testing/Troubleshooting)

```javascript
const { getMetricsCollector } = require('./utils/metrics-collector');

const metrics = getMetricsCollector();
metrics.reset();
```

---

## Performance Thresholds

### Mind Loading

| Metric | Good | Warning | Critical | Action |
|--------|------|---------|----------|--------|
| First Load | <100ms | 100-500ms | >500ms | Optimize artifact loading |
| Cached Load | <10ms | 10-50ms | >50ms | Review cache implementation |

### Validation Overhead

| Metric | Good | Warning | Critical | Action |
|--------|------|---------|----------|--------|
| Average | <5ms | 5-20ms | >20ms | Simplify validation logic |
| P95 | <10ms | 10-50ms | >50ms | Identify slow validators |
| P99 | <20ms | 20-100ms | >100ms | Review edge cases |

### Cache Performance

| Metric | Good | Warning | Critical | Action |
|--------|------|---------|----------|--------|
| Hit Rate | >80% | 50-80% | <50% | Review caching strategy |

### Fallback Rate (per hour)

| Count | Level | Action |
|-------|-------|--------|
| 0 | ✓ Good | Continue monitoring |
| 1-4 | ℹ️ Info | Note for trends |
| 5-9 | ⚠️ Warning | Investigate causes |
| 10+ | 🔴 Critical | Immediate action required |

### Heuristic Execution

| Metric | Good | Warning | Critical | Action |
|--------|------|---------|----------|--------|
| Average | <50ms | 50-200ms | >200ms | Optimize compilation |

---

## Alert Response Procedures

### 🔴 Critical: High Fallback Rate (10+/hour)

**Symptoms:**
- Dashboard shows red status for fallback count
- Alert system sends CRITICAL notification

**Immediate Actions:**
1. Check recent logs for fallback patterns:
   ```bash
   grep "fallback" logs/hybrid-ops.log | tail -n 100
   ```

2. Identify dominant fallback reason:
   - `config_validation_failed`: Check `config/logging.yaml` syntax
   - `validation_veto_triggered`: Review recent validation failures

3. Review fallback details:
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js
   ```

**Resolution Steps:**

#### For `config_validation_failed`:
```bash
# 1. Validate config syntax
cat config/logging.yaml

# 2. Check for recent config changes
git log -p -- config/logging.yaml

# 3. Restore known-good config if needed
git checkout HEAD~1 -- config/logging.yaml
```

#### For `validation_veto_triggered`:
```bash
# 1. Review recent validation logs
grep "validation_veto" logs/hybrid-ops.log | tail -n 50

# 2. Check for systematic violations
grep "CRITICAL" logs/hybrid-ops.log | grep "Level -2" | tail -n 50

# 3. Review output alignment with META_AXIOMAS
```

**Escalation:** If fallback rate doesn't decrease within 30 minutes, escalate to framework team.

---

### 🟡 Warning: Elevated Fallback Rate (5-9/hour)

**Symptoms:**
- Dashboard shows yellow status for fallback count
- Alert system sends WARNING notification

**Actions:**
1. Monitor trends over next hour
2. Review fallback reasons and patterns
3. Document patterns for trend analysis
4. Schedule investigation during maintenance window

**Prevention:**
- Review and update configuration
- Enhance validation test coverage
- Update documentation on common issues

---

### 🔴 Critical: High Validation Overhead (P99 >100ms)

**Symptoms:**
- Dashboard shows red status for P99 validation overhead
- Slow system responses

**Immediate Actions:**
1. Check validation counts:
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js
   ```

2. Review recent validation logs:
   ```bash
   grep "axioma-validator" logs/hybrid-ops.log | tail -n 100
   ```

3. Identify slow validations:
   ```bash
   grep "duration_ms" logs/hybrid-ops.log | grep "axioma-validator" | sort -t: -k5 -n | tail -n 20
   ```

**Resolution Steps:**
1. Review validation logic in `axioma-validator.js`
2. Check for complex regex patterns or recursive checks
3. Consider caching validation results for identical content
4. Profile validation execution for bottlenecks

**Temporary Mitigation:**
- Increase validation timeout if appropriate
- Consider relaxing non-critical validation rules

---

### 🟡 Warning: Low Cache Hit Rate (<50%)

**Symptoms:**
- Dashboard shows yellow/red status for cache hit rate
- Increased load times

**Actions:**
1. Review cache statistics:
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js
   ```

2. Check cache invalidation patterns:
   ```bash
   grep "cache_miss" logs/hybrid-ops.log | tail -n 50
   ```

3. Review cache key uniqueness:
   ```javascript
   // Check cache implementation in mind-loader.js
   // Verify cache keys are properly structured
   ```

**Resolution Steps:**
1. Analyze cache miss reasons
2. Review cache key generation logic
3. Consider increasing cache size if memory allows
4. Validate cache invalidation strategy

---

### 🔴 Critical: High Mind Load Time (>500ms)

**Symptoms:**
- Dashboard shows red status for first load time
- Slow system startup

**Immediate Actions:**
1. Check disk I/O performance
2. Review artifact sizes:
   ```bash
   du -sh hybrid-ops/minds/pedro_valerio/*
   ```

3. Monitor system resources:
   ```bash
   # Windows
   tasklist /FI "IMAGENAME eq node.exe"

   # Linux/Mac
   top -p $(pgrep -d, node)
   ```

**Resolution Steps:**
1. Profile mind loading:
   ```bash
   grep "mind_loading" logs/hybrid-ops.log | tail -n 50
   ```

2. Identify slow components:
   - Artifact loading
   - Heuristic compilation
   - Validation initialization

3. Optimize bottlenecks:
   - Compress large artifacts
   - Lazy-load non-critical components
   - Parallelize independent loads

---

## Troubleshooting Guide

### Issue: No Logs Being Generated

**Symptoms:**
- `logs/hybrid-ops.log` is empty or not updating
- Dashboard shows no recent data

**Diagnosis:**
```bash
# Check if log directory exists
ls -la .claude/commands/hybridOps/logs/

# Check logger configuration
cat config/logging.yaml

# Check file permissions
ls -l logs/hybrid-ops.log
```

**Solutions:**
1. Verify logger is initialized:
   ```javascript
   const { getLogger } = require('./utils/logger');
   const logger = getLogger();
   console.log('Logger enabled:', logger.isEnabled());
   ```

2. Check log level configuration:
   ```yaml
   # config/logging.yaml
   level: DEBUG  # Should be DEBUG, INFO, WARN, or ERROR
   ```

3. Ensure log directory is writable:
   ```bash
   chmod 755 logs/
   touch logs/hybrid-ops.log
   chmod 644 logs/hybrid-ops.log
   ```

---

### Issue: Metrics Not Collecting

**Symptoms:**
- Dashboard shows zero metrics
- All metric counts are 0

**Diagnosis:**
```javascript
const { getMetricsCollector } = require('./utils/metrics-collector');

const metrics = getMetricsCollector();
console.log('Metrics enabled:', metrics.isEnabled());
console.log('Summary:', metrics.getSummary());
```

**Solutions:**
1. Verify metrics collector is enabled:
   ```javascript
   // Should be enabled by default
   // Check constructor options if disabled
   ```

2. Confirm instrumentation is active:
   ```bash
   # Check for startTimer/endTimer calls
   grep "startTimer\|endTimer" utils/mind-loader.js
   grep "recordCacheHit\|recordCacheMiss" utils/mind-loader.js
   ```

3. Reset metrics if needed:
   ```javascript
   metrics.reset();
   ```

---

### Issue: Dashboard Not Displaying Data

**Symptoms:**
- Dashboard shows "No data" or all zeros
- Export produces empty JSON

**Diagnosis:**
```bash
# Run dashboard in debug mode
DEBUG=* node .claude/commands/hybridOps/utils/monitoring-dashboard.js
```

**Solutions:**
1. Verify mind system has been used:
   ```bash
   # Metrics only collected when system is active
   # Run a test operation to generate data
   ```

2. Check metrics retention:
   ```javascript
   // Metrics older than 24h are cleaned up
   // Verify recent activity exists
   ```

3. Verify dashboard is reading correct metrics:
   ```bash
   # Check metrics collector instance
   node -e "const m = require('./utils/metrics-collector').getMetricsCollector(); console.log(m.getSummary());"
   ```

---

### Issue: Alert System Not Triggering

**Symptoms:**
- Fallbacks occurring but no alerts
- Alert system status shows "not running"

**Diagnosis:**
```javascript
const { getFallbackAlertSystem } = require('./utils/fallback-alert-system');

const alertSystem = getFallbackAlertSystem();
console.log('Status:', alertSystem.getStatus());
```

**Solutions:**
1. Verify alert system is started:
   ```javascript
   alertSystem.start();
   ```

2. Check alert thresholds:
   ```javascript
   const status = alertSystem.getStatus();
   console.log('Thresholds:', status.thresholds);
   // Adjust if thresholds are too high
   ```

3. Verify cooldown period hasn't suppressed alerts:
   ```javascript
   // Cooldown is 10 minutes by default
   // Check alert history
   console.log('Active alerts:', status.activeAlerts);
   ```

4. Reset alert history if needed:
   ```javascript
   alertSystem.resetAlerts();
   ```

---

## Maintenance Procedures

### Daily Checks

```bash
# 1. Quick health check
node .claude/commands/hybridOps/utils/monitoring-dashboard.js

# 2. Review error logs
grep "ERROR" logs/hybrid-ops.log | tail -n 20

# 3. Check fallback rate
grep "fallback" logs/hybrid-ops.log | wc -l
```

### Weekly Maintenance

```bash
# 1. Export metrics for trend analysis
node .claude/commands/hybridOps/utils/monitoring-dashboard.js --export
mv logs/performance-metrics.json logs/performance-metrics-$(date +%Y%m%d).json

# 2. Archive old logs
gzip logs/hybrid-ops.log.1

# 3. Review performance trends
# Compare weekly exports for patterns

# 4. Update runbook if new issues discovered
```

### Monthly Review

1. **Performance Analysis:**
   - Review monthly metric exports
   - Identify performance degradation trends
   - Plan optimization initiatives

2. **Threshold Tuning:**
   - Adjust alert thresholds based on actual performance
   - Update dashboard recommendations
   - Document threshold changes

3. **Capacity Planning:**
   - Review metrics storage usage
   - Check log file sizes
   - Plan for scaling if needed

4. **Documentation Updates:**
   - Update runbook with new procedures
   - Document new alert types or thresholds
   - Add new troubleshooting sections

---

## Escalation Paths

### Level 1: First Responder (Self-Service)
- **Response Time:** Immediate
- **Actions:** Use this runbook, check dashboard, review logs
- **Escalate If:** Issue persists >30 minutes or is CRITICAL

### Level 2: Framework Team
- **Contact:** Hybrid-Ops team lead
- **Response Time:** 1 hour for CRITICAL, 4 hours for WARNING
- **Escalate If:** Issue requires code changes or is systemic

### Level 3: Architecture Review
- **Contact:** System architect
- **Response Time:** 24 hours
- **Required For:** Performance redesign, threshold policy changes

---

## Appendix A: Configuration Reference

### Logger Configuration (`config/logging.yaml`)

```yaml
logging:
  enabled: true
  level: INFO          # DEBUG, INFO, WARN, ERROR
  output:
    file: logs/hybrid-ops.log
    maxSize: 10485760  # 10MB
    maxFiles: 5
  format:
    timestamp: true
    colors: false
```

### Metrics Collector Options

```javascript
const metrics = getMetricsCollector({
  enabled: true,
  collectionInterval: 1000,    // ms
  retentionHours: 24,
  maxMetrics: 10000
});
```

### Alert System Options

```javascript
const alertSystem = getFallbackAlertSystem({
  enabled: true,
  checkInterval: 60000,        // 1 minute
  alertCooldown: 600000,       // 10 minutes
  infoThreshold: 4,            // fallbacks/hour
  warningThreshold: 9,         // fallbacks/hour
  criticalThreshold: 10        // fallbacks/hour
});
```

---

## Appendix B: Metric Definitions

### Timer-Based Metrics
- **Mind Load Time:** Duration from MindLoader.load() start to completion
- **Validation Overhead:** Duration of AxiomaValidator.validate() execution
- **Heuristic Execution:** Duration of HeuristicCompiler.compile() execution

### Counter-Based Metrics
- **Cache Hits:** Successful retrievals from cache (memory)
- **Cache Misses:** Required loads from disk/source
- **Fallbacks:** Events where system falls back to default/heuristic behavior

### Derived Metrics
- **Cache Hit Rate:** (hits / (hits + misses)) × 100%
- **P95 Overhead:** 95th percentile of validation times
- **P99 Overhead:** 99th percentile of validation times
- **Average Duration:** Mean of all recorded durations

---

## Appendix C: Log Format

### Log Entry Structure

```json
{
  "timestamp": "2025-01-15T14:30:45.123Z",
  "level": "INFO",
  "component": "mind-loader",
  "event": "mind_loading_completed",
  "metadata": {
    "config_source": "file",
    "duration_ms": 87,
    "cached_artifacts": 3
  }
}
```

### Event Types by Component

**mind-loader:**
- `mind_loading_started`
- `mind_loading_completed`
- `mind_loading_failed`
- `config_validation_failed`
- `cache_hit` / `cache_miss`

**axioma-validator:**
- `validation_started`
- `validation_completed`
- `validation_veto_triggered`

**heuristic-compiler:**
- `compilation_started`
- `compilation_completed`
- `compilation_failed`
- `cache_hit` / `cache_miss`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-01 | Initial runbook created for Story 1.14 |

---

**End of Runbook**
