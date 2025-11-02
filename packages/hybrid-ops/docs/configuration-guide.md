# Phase 2 Configuration System - User Guide

## Overview

The Phase 2 Configuration System enables runtime tuning of Pedro Valério's decision heuristics without code changes. All heuristic weights and thresholds are externalized into a YAML configuration file with support for:

- **Hot-reload**: Changes apply immediately without restart
- **Environment overrides**: Production-specific tuning via env vars
- **Validation**: Strict type and range checking
- **Defaults**: Falls back to Phase 1 hardcoded values

## Configuration File

**Location**: `.claude/commands/hybridOps/config/heuristics.yaml`

### Structure

```yaml
version: "1.0"

heuristics:
  PV_BS_001:    # Future System Back-Casting
    weights:
      end_state_vision: 0.9
      current_market_signals: 0.1
    thresholds:
      confidence: 0.8
      priority: 0.8

  PV_PA_001:    # Systemic Coherence Scan
    weights:
      truthfulness: 1.0      # VETO POWER
      system_adherence: 0.8
      skill: 0.3
    thresholds:
      veto: 0.7
      approve: 0.8
      review: 0.6

  PV_PM_001:    # Automation Tipping Point
    weights:
      frequency: 0.7
      standardization: 0.9
      guardrails: 1.0        # VETO POWER
    thresholds:
      tipping_point: 2
      standardization: 0.7
      automate: 0.75

validation:
  strict_mode: true
  minimum_score: 7.0
  enable_veto: true
```

## Heuristic Details

### PV_BS_001: Future System Back-Casting

**Domain**: Business Strategy
**Algorithm**: Design from desired end-state backwards

#### Weights
- `end_state_vision` (0.0-1.0): Long-term vision clarity weight
  - **Higher** = prioritize strategic clarity over current market
  - **Default**: 0.9 (90% weight on vision)

- `current_market_signals` (0.0-1.0): Current market alignment weight
  - **Higher** = prioritize market timing
  - **Default**: 0.1 (10% weight on market)
  - **Note**: Should sum to 1.0 with `end_state_vision`

#### Thresholds
- `confidence` (0.0-1.0): Minimum end-state clarity for "high" confidence
  - **Default**: 0.8 (80% clarity required)

- `priority` (0.0-1.0): Minimum weighted score for "HIGH" priority
  - **Default**: 0.8 (80% score required)

---

### PV_PA_001: Systemic Coherence Scan

**Domain**: People Assessment
**Algorithm**: Assess people based on truthfulness, system fit, and skills

#### Weights
- `truthfulness` (0.7-1.5): Truthfulness/Coherence weight - **VETO POWER**
  - This factor can veto the entire assessment if below threshold
  - **Higher** = prioritize coherence over all else
  - **Default**: 1.0 (100% weight - maximum importance)

- `system_adherence` (0.0-1.0): System adherence/fit weight
  - **Higher** = prioritize cultural/systemic alignment
  - **Default**: 0.8 (80% weight)

- `skill` (0.0-1.0): Technical skill/capability weight
  - **Lower** = reflects PV principle: coherence > capability
  - **Default**: 0.3 (30% weight)

#### Thresholds
- `veto` (0.5-0.9): Minimum truthfulness score (below = automatic REJECT)
  - This is the **VETO threshold** - non-negotiable minimum
  - **Default**: 0.7 (70% truthfulness required)

- `approve` (0.6-1.0): Minimum weighted score for "APPROVE" recommendation
  - **Default**: 0.8 (80% overall score required)

- `review` (0.4-0.8): Minimum weighted score for "REVIEW" recommendation
  - **Below this** = REJECT
  - **Default**: 0.6 (60% score required)

---

### PV_PM_001: Automation Tipping Point

**Domain**: Process Management
**Algorithm**: Determine if task should be automated based on frequency and readiness

#### Weights
- `frequency` (0.0-1.0): Execution frequency weight
  - **Higher** = prioritize frequency in automation decision
  - **Default**: 0.7 (70% weight)

- `standardization` (0.0-1.0): Process standardization weight
  - **Higher** = require more standardization before automating
  - **Default**: 0.9 (90% weight - high importance)

- `guardrails` (0.5-1.5): Safety guardrails weight - **VETO POWER**
  - Missing guardrails = automatic rejection of automation
  - **Default**: 1.0 (100% weight - maximum importance)

#### Thresholds
- `tipping_point` (1-10 executions/month): Executions per month threshold
  - **Above this** = task becomes automation candidate
  - **Default**: 2 (twice per month)
  - **Note**: Must be integer ≥ 1

- `standardization` (0.5-0.9): Minimum standardization score required
  - **Default**: 0.7 (70% standardization required)

- `automate` (0.5-0.9): Minimum weighted score to recommend automation
  - **Default**: 0.75 (75% overall score required)

## Environment Variable Overrides

For production environments, you can override configuration values using environment variables:

### Format

```
HEURISTIC_{HEURISTIC_ID}_{PARAMETER_NAME}={value}
```

### Examples

```bash
# Override PV_BS_001 weights
export HEURISTIC_BS001_END_STATE_WEIGHT=0.95
export HEURISTIC_BS001_MARKET_WEIGHT=0.05

# Override PV_PA_001 thresholds
export HEURISTIC_PA001_VETO_THRESHOLD=0.75
export HEURISTIC_PA001_APPROVE_THRESHOLD=0.85

# Override PV_PM_001 settings
export HEURISTIC_PM001_TIPPING_POINT=3
export HEURISTIC_PM001_AUTOMATE_THRESHOLD=0.8

# Override validation settings
export VALIDATION_STRICT_MODE=true
export VALIDATION_MINIMUM_SCORE=8.0
```

### Available Environment Variables

#### PV_BS_001
- `HEURISTIC_BS001_END_STATE_WEIGHT`
- `HEURISTIC_BS001_MARKET_WEIGHT`
- `HEURISTIC_BS001_CONFIDENCE_THRESHOLD`
- `HEURISTIC_BS001_PRIORITY_THRESHOLD`

#### PV_PA_001
- `HEURISTIC_PA001_TRUTHFULNESS_WEIGHT`
- `HEURISTIC_PA001_SYSTEM_WEIGHT`
- `HEURISTIC_PA001_SKILL_WEIGHT`
- `HEURISTIC_PA001_VETO_THRESHOLD`
- `HEURISTIC_PA001_APPROVE_THRESHOLD`
- `HEURISTIC_PA001_REVIEW_THRESHOLD`

#### PV_PM_001
- `HEURISTIC_PM001_FREQUENCY_WEIGHT`
- `HEURISTIC_PM001_STANDARDIZATION_WEIGHT`
- `HEURISTIC_PM001_GUARDRAILS_WEIGHT`
- `HEURISTIC_PM001_TIPPING_POINT`
- `HEURISTIC_PM001_STANDARDIZATION_THRESHOLD`
- `HEURISTIC_PM001_AUTOMATE_THRESHOLD`

#### Validation
- `VALIDATION_STRICT_MODE` (true/false)
- `VALIDATION_MINIMUM_SCORE` (0.0-10.0)

## Hot-Reload

The configuration system supports hot-reload - changes to `heuristics.yaml` are detected and applied automatically:

1. **Edit** the configuration file
2. **Save** the changes
3. **System detects** file change via `fs.watch()`
4. **Validates** the new configuration
5. **Recompiles** all heuristics with new values
6. **Applies** changes to all active agents

### Hot-Reload Logs

```
🔄 Configuration file changed, reloading...
✓ Loaded configuration from: config/heuristics.yaml
✓ Configuration validated successfully
🔄 Configuration change detected, invalidating heuristic cache...
✓ Cleared heuristic compilation cache (3 heuristics)
🔧 Compiling heuristic: PV_BS_001 (Future System Back-Casting)
   Source: Configuration file
🔧 Compiling heuristic: PV_PA_001 (Systemic Coherence Scan)
   Source: Configuration file
🔧 Compiling heuristic: PV_PM_001 (Automation Tipping Point)
   Source: Configuration file
```

### Validation Errors

If the new configuration is invalid, the system keeps the old configuration:

```
❌ New configuration is invalid:
❌ Configuration validation failed with 2 error(s):
  1. PV_BS_001.weights: Sum should equal 1.0 for proper weighting (got 0.80)
  2. PV_PA_001.thresholds.veto (0.9) must be < review (0.6)
  Keeping old configuration
```

## Fallback Behavior

The configuration system has multiple fallback layers:

1. **File Configuration** (highest priority)
   - Load from `config/heuristics.yaml`
   - Apply environment variable overrides

2. **Environment Variables Only**
   - If no file exists but env vars are set
   - Creates config from env vars alone

3. **Hardcoded Defaults** (fallback)
   - If file missing and no env vars
   - Uses Phase 1 hardcoded values
   - Ensures system always works

### Checking Configuration Source

When mind loads, it logs the configuration source:

```
✅ Pedro Valério mind loaded successfully
   - Configuration Source: file           # Loaded from heuristics.yaml
   - Configuration Source: env+file       # File + environment overrides
   - Configuration Source: defaults       # Using hardcoded defaults
```

## Validation Rules

The configuration validator enforces:

### Type Checking
- All weights must be **numbers**
- All thresholds must be **numbers**
- Version must be a **string**
- Validation flags must be **booleans**

### Range Validation
- Weights must be **≥ 0**
- Most thresholds must be **0.0-1.0**
- `tipping_point` must be **integer ≥ 1**
- `minimum_score` must be **0.0-10.0** (Axioma scale)

### Heuristic-Specific Rules

#### PV_BS_001
- Weight sum: `end_state_vision + current_market_signals ≈ 1.0`

#### PV_PA_001
- Threshold ordering: `veto < review < approve`

#### PV_PM_001
- Threshold ordering: `standardization ≤ automate`

### Strict Mode

When `validation.strict_mode = true`:
- All validation errors cause configuration rejection
- Falls back to previous/default configuration
- Logs detailed error messages

When `validation.strict_mode = false`:
- Validation warnings are logged
- System attempts to use configuration anyway
- May result in runtime errors

## Troubleshooting

### Configuration Not Loading

**Symptom**: System uses defaults despite having `heuristics.yaml`

**Possible Causes**:
1. YAML syntax error
2. Validation failure
3. File permissions

**Solution**:
```bash
# Check for YAML syntax errors
node -e "console.log(require('yaml').parse(require('fs').readFileSync('.claude/commands/hybridOps/config/heuristics.yaml', 'utf-8')))"

# Check file permissions
ls -la .claude/commands/hybridOps/config/heuristics.yaml

# Check logs for validation errors
# Look for: ❌ Configuration validation failed
```

### Hot-Reload Not Working

**Symptom**: Changes to config file don't apply automatically

**Possible Causes**:
1. File watcher not started
2. Validation rejecting new config
3. Cache not being invalidated

**Solution**:
```bash
# Check logs for hot-reload messages
# Look for: 🔄 Configuration file changed, reloading...

# If not seeing hot-reload, restart the system
# The watcher starts during mind initialization
```

### Environment Variables Not Applied

**Symptom**: Env vars set but config unchanged

**Possible Causes**:
1. Incorrect env var name format
2. Env vars set after mind initialization
3. File config overriding env vars

**Solution**:
```bash
# Check env var format (must start with HEURISTIC_)
env | grep HEURISTIC_

# Ensure env vars are set BEFORE starting the system
# Env vars are only read during mind.load()

# Verify env var was parsed correctly
# Look for logs: Applied N environment variable override(s)
```

### Veto Not Triggering

**Symptom**: Low truthfulness/guardrails not rejecting assessments

**Possible Causes**:
1. `enable_veto = false` in config
2. Veto threshold too low
3. Input data formatted incorrectly

**Solution**:
```yaml
# Check validation.enable_veto setting
validation:
  enable_veto: true    # Must be true for veto to work

# Check veto thresholds
heuristics:
  PV_PA_001:
    thresholds:
      veto: 0.7        # Truthfulness must be ≥ 0.7
  PV_PM_001:
    weights:
      guardrails: 1.0  # Must be present and high weight
```

## Best Practices

### 1. Version Control

Always commit `heuristics.yaml` to version control:

```bash
git add .claude/commands/hybridOps/config/heuristics.yaml
git commit -m "feat: update heuristic weights for Q2 strategy"
```

### 2. Gradual Tuning

Make small incremental changes:

```yaml
# ❌ Bad: Large sudden changes
end_state_vision: 0.5  # Was 0.9

# ✓ Good: Small adjustments
end_state_vision: 0.85 # Was 0.9, testing slight reduction
```

### 3. Document Changes

Add inline comments explaining calibration decisions:

```yaml
weights:
  # Increased from 0.9 to 0.95 after Q1 retrospective
  # Rationale: Long-term vision was de-prioritized too often
  end_state_vision: 0.95
```

### 4. Test Before Production

Use environment variables for testing:

```bash
# Test configuration changes without modifying file
export HEURISTIC_BS001_END_STATE_WEIGHT=0.95
npm start

# If works well, then update heuristics.yaml
```

### 5. Monitor Impact

Track how configuration changes affect decisions:

```bash
# Check heuristic compilation logs
# Look for: Source: Configuration file

# Monitor decision outcomes
# Check if priority/recommendation distribution changes
```

## Related Files

- **Configuration**: `.claude/commands/hybridOps/config/heuristics.yaml`
- **Validator**: `.claude/commands/hybridOps/utils/config-validator.js`
- **Loader**: `.claude/commands/hybridOps/utils/config-loader.js`
- **Compiler**: `.claude/commands/hybridOps/utils/heuristic-compiler.js`
- **Mind Loader**: `.claude/commands/hybridOps/utils/mind-loader.js`
- **Tests**: `.claude/commands/hybridOps/tests/config/config.test.js`
- **Calibration Workflow**: `.claude/commands/hybridOps/docs/calibration-workflow.md`

## Support

For issues or questions about configuration:

1. **Check logs** for validation errors
2. **Run tests**: `node .claude/commands/hybridOps/tests/config/config.test.js`
3. **Consult calibration workflow**: See `calibration-workflow.md`
4. **Review defaults** in `heuristic-compiler.js` (lines 34-37, 105-110, 198-203)

---

*Last Updated: Story 1.7 - Phase 2 Configuration System*
