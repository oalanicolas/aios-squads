# Pedro Valério Mind System - Migration Guide

## Overview

This guide provides step-by-step instructions for migrating to new versions of the Pedro Valério mind system and adopting new framework features.

**Current Version:** Phase 2 (Configuration System + Monitoring)
**Last Updated:** 2025

---

## Table of Contents

1. [Version History](#version-history)
2. [Migration Paths](#migration-paths)
3. [Section 6.1: Phase 1 → Phase 2 (Configuration System)](#section-61-phase-1--phase-2-configuration-system)
4. [Section 6.2: Environment Variables Migration](#section-62-environment-variables-migration)
5. [Section 6.3: Heuristic API Changes](#section-63-heuristic-api-changes)
6. [Section 6.4: Validation Framework Updates](#section-64-validation-framework-updates)
7. [Section 6.5: Cache Strategy Migration](#section-65-cache-strategy-migration)
8. [Section 6.6: Monitoring & Logging Infrastructure](#section-66-monitoring--logging-infrastructure)

---

## Version History

| Version | Release Date | Major Features | Breaking Changes |
|---------|--------------|----------------|------------------|
| Phase 1 | 2024-Q4 | Hardcoded heuristics, basic validation | - |
| Phase 2 | 2025-Q1 | External configuration, monitoring & logging | Configuration API, Logger integration |

---

## Migration Paths

### From Phase 1 to Phase 2

**Estimated Time:** 2-4 hours
**Complexity:** Medium
**Breaking Changes:** Yes (Configuration API)

**Benefits:**
- Runtime configuration tuning
- Comprehensive monitoring and logging
- Performance metrics collection
- Fallback alert system

**Steps:**
1. Follow [Section 6.1](#section-61-phase-1--phase-2-configuration-system)
2. Follow [Section 6.6](#section-66-monitoring--logging-infrastructure)
3. Update agent integrations
4. Test in staging environment
5. Deploy to production

---

## Section 6.1: Phase 1 → Phase 2 (Configuration System)

### Overview

Phase 2 introduces external YAML configuration for heuristics, enabling runtime tuning without code changes.

### Prerequisites

- Phase 1 system running successfully
- Node.js 18+ installed
- Git version control initialized

### Step 1: Create Configuration File

Create `.claude/commands/hybridOps/config/heuristics.yaml`:

```yaml
version: "1.0"

heuristics:
  PV_BS_001:
    weights:
      end_state_vision: 0.9
      current_market_signals: 0.1
    thresholds:
      confidence: 0.8
      priority: 0.8

  PV_PA_001:
    weights:
      truthfulness: 1.0
      system_adherence: 0.8
      skill: 0.3
    thresholds:
      veto: 0.7
      approve: 0.8
      review: 0.6

  PV_PM_001:
    weights:
      frequency: 0.7
      standardization: 0.9
      guardrails: 1.0
    thresholds:
      tipping_point: 2
      standardization: 0.7
      automate: 0.75

validation:
  strict_mode: true
  minimum_score: 7.0
  enable_veto: true
```

### Step 2: Update Mind Loader

The MindLoader now accepts optional configuration:

```javascript
// Before (Phase 1)
const loader = new MindLoader();
await loader.load();

// After (Phase 2)
const loader = new MindLoader({
  configPath: 'config/heuristics.yaml'  // Optional
});
await loader.load();
```

### Step 3: Test Configuration

```bash
# Run tests
npm test

# Verify configuration loading
node -e "
  const { MindLoader } = require('./utils/mind-loader');
  const loader = new MindLoader({ configPath: 'config/heuristics.yaml' });
  loader.load().then(() => console.log('✓ Configuration loaded successfully'));
"
```

### Rollback Plan

If issues occur, remove configuration file to fall back to Phase 1 defaults:

```bash
# Backup current config
mv config/heuristics.yaml config/heuristics.yaml.bak

# System automatically falls back to hardcoded defaults
```

---

## Section 6.2: Environment Variables Migration

### Overview

Phase 2 supports environment-specific overrides via environment variables.

### Environment Variable Format

```bash
# Override heuristic weights
export PV_BS_001_WEIGHT_END_STATE_VISION=0.95

# Override thresholds
export PV_PA_001_THRESHOLD_VETO=0.75

# Override validation settings
export VALIDATION_STRICT_MODE=false
export VALIDATION_MINIMUM_SCORE=6.5
```

### Migration Steps

1. Identify production-specific tuning needs
2. Create environment-specific `.env` files:
   ```bash
   # .env.production
   PV_BS_001_WEIGHT_END_STATE_VISION=0.95
   VALIDATION_MINIMUM_SCORE=8.0
   ```

3. Load environment variables:
   ```javascript
   require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
   ```

4. Verify overrides:
   ```bash
   node -e "
     require('dotenv').config();
     const { MindLoader } = require('./utils/mind-loader');
     const loader = new MindLoader();
     loader.load().then(() => {
       const stats = loader.getStats();
       console.log('Config source:', stats.configSource);
     });
   "
   ```

---

## Section 6.3: Heuristic API Changes

### Breaking Changes

#### HeuristicCompiler API

**Before (Phase 1):**
```javascript
const compiler = new HeuristicCompiler();
const heuristic = compiler.compile('PV_BS_001');
```

**After (Phase 2):**
```javascript
const compiler = new HeuristicCompiler();
const config = {
  weights: { end_state_vision: 0.9, current_market_signals: 0.1 },
  thresholds: { confidence: 0.8, priority: 0.8 }
};
const heuristic = compiler.compile('PV_BS_001', config);
```

#### Validation API

**Before (Phase 1):**
```javascript
const validator = new AxiomaValidator();
const result = validator.validate(output);
```

**After (Phase 2):**
```javascript
const validator = new AxiomaValidator();
const result = validator.validate(output, {
  levels: ['existential', 'epistemological', 'social', 'operational'],
  minScore: 7.0,
  strict: true
});
```

### Migration Script

```bash
# Find all Phase 1 API usage
grep -r "new HeuristicCompiler()" --include="*.js"
grep -r "validator.validate(" --include="*.js"

# Update to Phase 2 API
# Manual updates required for each occurrence
```

---

## Section 6.4: Validation Framework Updates

### Overview

Phase 2 introduces configurable validation with 4-level META_AXIOMAS hierarchy.

### Validation Levels

| Level | Name | Weight | Veto Power | Description |
|-------|------|--------|------------|-------------|
| -4 | Existential | 2.0 | No | Core existence coherence |
| -3 | Epistemological | 1.5 | No | Knowledge grounding |
| -2 | Social | 1.0 | **YES** | Truthfulness & ethics |
| 0 | Operational | 1.0 | No | Practical execution |

### Migration Steps

1. Update validation calls to include options:
   ```javascript
   const result = validator.validate(output, {
     levels: ['existential', 'epistemological', 'social', 'operational'],
     minScore: 7.0,
     strict: true
   });
   ```

2. Handle veto conditions:
   ```javascript
   if (result.veto) {
     console.error('CRITICAL violation detected');
     console.error('Reason:', result.violations[0].reason);
     // Fall back to heuristic approach
   }
   ```

3. Update test assertions:
   ```javascript
   // Before
   expect(result.score).toBeGreaterThan(7);

   // After
   expect(result.overall_score).toBeGreaterThan(7);
   expect(result.veto).toBe(false);
   expect(result.recommendation).toMatch(/APPROVE|REVIEW/);
   ```

---

## Section 6.5: Cache Strategy Migration

### Overview

Phase 2 introduces intelligent caching for artifacts, sources, and compiled heuristics.

### Cache Behavior

- **Artifacts:** Cached after first load
- **Sources:** Cached after first read
- **Heuristics:** Cached after first compilation

### Migration Steps

1. No code changes required (automatic)

2. Monitor cache performance:
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js
   ```

3. Adjust cache settings if needed:
   ```javascript
   const loader = new MindLoader({
     cacheEnabled: true,  // Default: true
     cacheSize: 100       // Max cached items
   });
   ```

4. Clear cache if issues occur:
   ```javascript
   loader.clearCache();
   ```

---

## Section 6.6: Monitoring & Logging Infrastructure

### Overview

Phase 2 introduces comprehensive monitoring and logging infrastructure for production observability, including:

- **Structured Logging:** JSON-formatted logs with severity levels
- **Performance Metrics:** Lightweight <5ms overhead tracking
- **Monitoring Dashboard:** Real-time CLI-based metrics visualization
- **Fallback Alerts:** Automated monitoring and alerting

### Prerequisites

- Phase 2 base system installed
- Node.js 18+ with file system write access
- Sufficient disk space for logs (10MB minimum)

### Migration Steps

#### Step 1: Create Logging Configuration

Create `.claude/commands/hybridOps/config/logging.yaml`:

```yaml
logging:
  enabled: true
  level: INFO          # Options: DEBUG, INFO, WARN, ERROR
  output:
    file: logs/hybrid-ops.log
    maxSize: 10485760  # 10MB
    maxFiles: 5        # Keep 5 rotated log files
  format:
    timestamp: true
    colors: false      # Disable for production logs
```

#### Step 2: Create Log Directory

```bash
# Create logs directory
mkdir -p .claude/commands/hybridOps/logs

# Set appropriate permissions
chmod 755 .claude/commands/hybridOps/logs
```

#### Step 3: Update Component Initialization

The logger and metrics are automatically initialized by the existing components. No changes needed to existing code.

#### Step 4: Verify Logging

```bash
# Run a test operation
node -e "
  const { MindLoader } = require('./utils/mind-loader');
  const loader = new MindLoader();
  loader.load().then(() => console.log('✓ Test complete'));
"

# Check log output
tail -n 50 .claude/commands/hybridOps/logs/hybrid-ops.log
```

Expected log entries:
```json
{
  "timestamp": "2025-01-15T14:30:45.123Z",
  "level": "INFO",
  "component": "mind-loader",
  "event": "mind_loading_started",
  "metadata": {}
}
```

#### Step 5: Set Up Monitoring Dashboard

```bash
# Test dashboard
node .claude/commands/hybridOps/utils/monitoring-dashboard.js

# Start continuous monitoring (optional)
node .claude/commands/hybridOps/utils/monitoring-dashboard.js --watch
```

#### Step 6: Configure Fallback Alert System

Add to your agent initialization:

```javascript
const { getFallbackAlertSystem } = require('./utils/fallback-alert-system');

// Start alert monitoring
const alertSystem = getFallbackAlertSystem({
  enabled: true,
  checkInterval: 60000,        // Check every minute
  alertCooldown: 600000,       // 10 minutes between same alerts
  infoThreshold: 4,            // Info alert at 4 fallbacks/hour
  warningThreshold: 9,         // Warning alert at 9 fallbacks/hour
  criticalThreshold: 10        // Critical alert at 10+ fallbacks/hour
});

alertSystem.start();
```

#### Step 7: Verify Metrics Collection

```bash
# Check metrics are being collected
node -e "
  const { getMetricsCollector } = require('./utils/metrics-collector');
  const metrics = getMetricsCollector();
  const summary = metrics.getSummary();
  console.log('Metrics:', JSON.stringify(summary, null, 2));
"
```

### Configuration Options

#### Logger Options

```yaml
logging:
  enabled: true              # Enable/disable logging
  level: DEBUG               # Minimum level to log (DEBUG, INFO, WARN, ERROR)
  output:
    file: logs/hybrid-ops.log    # Log file path
    maxSize: 10485760            # Max size before rotation (bytes)
    maxFiles: 5                  # Number of rotated files to keep
  format:
    timestamp: true              # Include timestamps
    colors: false                # ANSI color codes (false for production)
```

#### Metrics Collector Options

```javascript
const metrics = getMetricsCollector({
  enabled: true,               // Enable metrics collection
  collectionInterval: 1000,    // Collection interval (ms)
  retentionHours: 24,          // Metrics retention period
  maxMetrics: 10000            // Max metrics in memory (circular buffer)
});
```

#### Alert System Options

```javascript
const alertSystem = getFallbackAlertSystem({
  enabled: true,               // Enable alert system
  checkInterval: 60000,        // Check every minute
  alertCooldown: 600000,       // 10 min cooldown between same alerts
  infoThreshold: 4,            // INFO: 1-4 fallbacks/hour
  warningThreshold: 9,         // WARNING: 5-9 fallbacks/hour
  criticalThreshold: 10        // CRITICAL: 10+ fallbacks/hour
});
```

### Performance Impact

The monitoring infrastructure is designed for minimal overhead:

- **Logging:** <1ms per log entry
- **Metrics Collection:** <5ms per operation
- **Memory Usage:** ~10MB for 24h of metrics
- **Disk Usage:** ~50MB for 5 days of logs (with rotation)

### Monitoring Best Practices

1. **Daily Health Checks:**
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js
   ```

2. **Export Metrics Weekly:**
   ```bash
   node .claude/commands/hybridOps/utils/monitoring-dashboard.js --export
   mv logs/performance-metrics.json logs/metrics-$(date +%Y%m%d).json
   ```

3. **Review Error Logs Daily:**
   ```bash
   grep "ERROR" logs/hybrid-ops.log | tail -n 20
   ```

4. **Monitor Fallback Rates:**
   ```bash
   grep "fallback" logs/hybrid-ops.log | wc -l
   ```

### Troubleshooting

#### Issue: No Logs Generated

**Solution:**
```bash
# Check directory permissions
ls -la logs/

# Verify logger is enabled
grep "enabled: true" config/logging.yaml

# Check log level
grep "level:" config/logging.yaml
```

#### Issue: Dashboard Shows No Data

**Solution:**
```bash
# Verify metrics are being collected
node -e "
  const { getMetricsCollector } = require('./utils/metrics-collector');
  console.log('Enabled:', getMetricsCollector().isEnabled());
"

# Ensure system has been used (metrics only collected during operations)
```

#### Issue: Alerts Not Triggering

**Solution:**
```javascript
const { getFallbackAlertSystem } = require('./utils/fallback-alert-system');
const alertSystem = getFallbackAlertSystem();

// Verify status
console.log('Status:', alertSystem.getStatus());

// Start if not running
if (!alertSystem.isRunning()) {
  alertSystem.start();
}
```

### Rollback Plan

If monitoring causes issues:

1. **Disable Logging:**
   ```yaml
   # config/logging.yaml
   logging:
     enabled: false
   ```

2. **Disable Metrics:**
   ```javascript
   const metrics = getMetricsCollector({ enabled: false });
   ```

3. **Stop Alert System:**
   ```javascript
   alertSystem.stop();
   ```

4. **Remove Log Files:**
   ```bash
   rm -rf logs/
   ```

### Reference Documentation

- **Monitoring Runbook:** `docs/monitoring-runbook.md`
- **Configuration Guide:** `docs/configuration-guide.md`
- **Logger Source:** `utils/logger.js`
- **Metrics Source:** `utils/metrics-collector.js`
- **Dashboard Source:** `utils/monitoring-dashboard.js`
- **Alert System Source:** `utils/fallback-alert-system.js`

---

## Post-Migration Validation

### Checklist

After completing any migration:

- [ ] All tests pass: `npm test`
- [ ] Configuration loads successfully
- [ ] Logs are being generated
- [ ] Metrics are being collected
- [ ] Dashboard displays data
- [ ] Alert system is running
- [ ] Cache hit rate >80%
- [ ] Validation overhead <5ms (average)
- [ ] No fallbacks in last hour
- [ ] Documentation updated

### Validation Script

```bash
#!/bin/bash

echo "🔍 Running post-migration validation..."

# Test suite
echo "1. Running tests..."
npm test || exit 1

# Configuration
echo "2. Validating configuration..."
test -f config/heuristics.yaml || echo "⚠️  heuristics.yaml not found"
test -f config/logging.yaml || echo "⚠️  logging.yaml not found"

# Logging
echo "3. Checking logs..."
test -d logs || echo "⚠️  logs/ directory not found"
test -f logs/hybrid-ops.log || echo "⚠️  hybrid-ops.log not found"

# Monitoring
echo "4. Testing monitoring..."
node .claude/commands/hybridOps/utils/monitoring-dashboard.js || echo "⚠️  Dashboard failed"

# Metrics
echo "5. Checking metrics..."
node -e "
  const { getMetricsCollector } = require('./utils/metrics-collector');
  const metrics = getMetricsCollector();
  const summary = metrics.getSummary();
  console.log('✓ Metrics:', summary.mindLoading.total, 'loads recorded');
"

echo "✅ Migration validation complete!"
```

---

## Support & Resources

### Documentation
- **User Guides:** `docs/`
- **API Reference:** Component source files
- **Monitoring Runbook:** `docs/monitoring-runbook.md`

### Troubleshooting
1. Check runbooks for common issues
2. Review logs for error details
3. Use monitoring dashboard for health status
4. Consult configuration guides

### Contact
- **Framework Team:** hybrid-ops@example.com
- **GitHub Issues:** https://github.com/org/repo/issues
- **Internal Slack:** #hybrid-ops

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01 | Hybrid-Ops Team | Initial guide with Sections 6.1-6.6 |

---

**End of Migration Guide**
