# Heuristic Calibration Workflow

## Overview

This document describes the process for calibrating Pedro Valério's decision heuristics based on real-world feedback and performance metrics.

## When to Calibrate

Calibration should occur when:

1. **Decision misalignment detected** - Heuristics producing recommendations that don't align with PV's actual decisions
2. **Strategic shift** - Business strategy or priorities change (e.g., new market focus)
3. **Performance issues** - High false positive/negative rate in assessments
4. **Quarterly review** - Regular scheduled calibration (every 3 months)
5. **Major milestone** - After significant project completion or pivot

## Calibration Process

### Phase 1: Data Collection

**Goal**: Gather evidence of heuristic performance

**Steps**:

1. **Collect decision data** (minimum 10-20 samples)
   - Record heuristic inputs
   - Record heuristic outputs (recommendations, scores)
   - Record actual PV decisions
   - Note any overrides or disagreements

2. **Identify patterns**
   ```
   Example:
   - Heuristic recommended "HIGH priority" for 15 strategic initiatives
   - PV actually prioritized only 8 of those 15
   - Pattern: Heuristic over-weights market signals
   ```

3. **Document misalignments**
   ```markdown
   ## Misalignment Cases

   ### Case 1: Over-prioritization of market signals
   - **Input**: End-state clarity: 0.7, Market alignment: 0.9
   - **Heuristic output**: HIGH priority (score: 0.81)
   - **Actual PV decision**: MEDIUM priority
   - **Reasoning**: "Market timing less important than strategic clarity"
   ```

### Phase 2: Hypothesis Formation

**Goal**: Identify which weights/thresholds need adjustment

**Analysis Framework**:

```
For each misalignment:

1. Which heuristic parameters influenced the decision?
   - Weight values
   - Threshold values
   - Veto conditions

2. What direction should they move?
   - Increase/decrease weight
   - Raise/lower threshold
   - Tighten/loosen veto

3. How large should the adjustment be?
   - Small (±0.05): Fine-tuning
   - Medium (±0.10): Noticeable shift
   - Large (±0.20): Major recalibration
```

**Example Hypotheses**:

```yaml
# Hypothesis 1: Reduce market signals weight
# Current: end_state_vision=0.9, current_market_signals=0.1
# Proposed: end_state_vision=0.95, current_market_signals=0.05
# Rationale: PV consistently prioritizes vision over market

# Hypothesis 2: Raise truthfulness veto threshold
# Current: veto=0.7
# Proposed: veto=0.75
# Rationale: Recent hires with 0.72 truthfulness had coherence issues
```

### Phase 3: Testing & Validation

**Goal**: Validate hypotheses before production deployment

**Steps**:

1. **Create test configuration**
   ```bash
   # Make a copy of current config
   cp config/heuristics.yaml config/heuristics.test.yaml
   ```

2. **Apply proposed changes**
   ```yaml
   # In heuristics.test.yaml
   heuristics:
     PV_BS_001:
       weights:
         end_state_vision: 0.95    # Was 0.9
         current_market_signals: 0.05  # Was 0.1
   ```

3. **Test with historical data**
   ```javascript
   // Load test config
   const testConfig = require('./config/heuristics.test.yaml');
   const compiler = getCompiler();

   // Compile with test config
   const testHeuristic = compiler.compile('PV_BS_001', testConfig.heuristics.PV_BS_001);

   // Run against historical cases
   historicalCases.forEach(case => {
     const result = testHeuristic(case.input);
     console.log(`Historical: ${case.actualDecision}, Heuristic: ${result.recommendation}`);
   });
   ```

4. **Calculate accuracy metrics**
   ```javascript
   const accuracy = {
     totalCases: 20,
     matches: 17,        // Heuristic matched PV decision
     mismatches: 3,      // Heuristic disagreed with PV
     accuracy: 17/20     // 85% match rate
   };

   // Goal: >80% accuracy for production deployment
   ```

### Phase 4: Staged Rollout

**Goal**: Safely deploy calibration to production

**Rollout Strategy**:

```
Level 1: Environment Variables (Safest)
↓
Level 2: Configuration File (Standard)
↓
Level 3: Code Update (Last Resort)
```

#### Level 1: Environment Variable Testing

**Use for**: Small adjustments, temporary testing

```bash
# Test in staging environment first
export HEURISTIC_BS001_END_STATE_WEIGHT=0.95
export HEURISTIC_BS001_MARKET_WEIGHT=0.05

# Run for 1-2 weeks
# Monitor decision quality
# Gather feedback

# If successful, proceed to Level 2
```

#### Level 2: Configuration File Update

**Use for**: Permanent calibration changes

```bash
# Update config file
vim .claude/commands/hybridOps/config/heuristics.yaml

# Commit with detailed message
git add config/heuristics.yaml
git commit -m "feat: calibrate PV_BS_001 weights based on Q1 data

- Increase end_state_vision from 0.9 to 0.95
- Decrease market_signals from 0.1 to 0.05

Rationale: Q1 analysis showed vision consistently
prioritized over market timing (17/20 cases).

Test results: 85% accuracy (up from 70%)
Data: 20 strategic decisions from Jan-Mar 2024"

git push
```

#### Level 3: Code Update

**Use for**: New heuristic algorithms, structural changes

```javascript
// Only when config changes aren't sufficient
// Requires code review and thorough testing
// Example: Adding new weight factor
```

### Phase 5: Monitoring & Iteration

**Goal**: Validate calibration in production and refine

**Monitoring Plan**:

```
Week 1-2: Daily monitoring
  - Check decision logs
  - Compare heuristic vs actual decisions
  - Watch for edge cases

Week 3-4: Weekly monitoring
  - Calculate weekly accuracy
  - Identify new patterns
  - Gather stakeholder feedback

Month 2+: Monthly review
  - Full accuracy analysis
  - Decision quality metrics
  - Prepare next calibration if needed
```

**Metrics to Track**:

1. **Accuracy Rate**
   - % of heuristic recommendations matching actual decisions
   - Target: >80% for business strategy, >85% for people assessment

2. **False Positive Rate**
   - % of HIGH priority recommendations that were actually LOW
   - Target: <10%

3. **False Negative Rate**
   - % of LOW priority recommendations that were actually HIGH
   - Target: <10%

4. **Veto Effectiveness**
   - % of veto'd items that would have caused issues
   - Target: >95% (veto should rarely be wrong)

## Calibration Scenarios

### Scenario 1: Strategic Pivot

**Situation**: Company shifts from market-driven to vision-driven strategy

**Impact**: PV_BS_001 (Future Back-Casting)

**Calibration**:

```yaml
# Before (market-driven era)
PV_BS_001:
  weights:
    end_state_vision: 0.7
    current_market_signals: 0.3

# After (vision-driven era)
PV_BS_001:
  weights:
    end_state_vision: 0.95
    current_market_signals: 0.05
```

**Rationale**: Long-term vision now dominates decision-making

---

### Scenario 2: Hiring Quality Issues

**Situation**: Recent hires with borderline coherence scores had performance issues

**Impact**: PV_PA_001 (Coherence Scan)

**Calibration**:

```yaml
# Before (lenient veto)
PV_PA_001:
  thresholds:
    veto: 0.65
    review: 0.6
    approve: 0.8

# After (stricter veto)
PV_PA_001:
  thresholds:
    veto: 0.75   # Raised from 0.65
    review: 0.65  # Adjusted accordingly
    approve: 0.85  # Raised for quality
```

**Rationale**: Coherence threshold too low, allowing misaligned hires

---

### Scenario 3: Over-Automation

**Situation**: Tasks automated too early, causing quality issues

**Impact**: PV_PM_001 (Automation Tipping Point)

**Calibration**:

```yaml
# Before (aggressive automation)
PV_PM_001:
  thresholds:
    tipping_point: 2        # 2x/month
    standardization: 0.6    # 60% standardized
    automate: 0.7           # 70% score

# After (conservative automation)
PV_PM_001:
  thresholds:
    tipping_point: 3        # 3x/month (higher bar)
    standardization: 0.75   # 75% standardized
    automate: 0.8           # 80% score
```

**Rationale**: Need higher standardization before automation

---

### Scenario 4: Seasonal Variation

**Situation**: Q4 requires more aggressive market responsiveness

**Impact**: PV_BS_001 (temporary shift)

**Calibration**:

```bash
# Q1-Q3: Vision-driven (permanent config)
# Q4: Market-responsive (env var override)

export HEURISTIC_BS001_MARKET_WEIGHT=0.2   # Temporarily increase
export HEURISTIC_BS001_END_STATE_WEIGHT=0.8

# Reverts to config defaults in Q1
```

**Rationale**: Seasonal business cycles require temporary tuning

## Calibration Anti-Patterns

### ❌ Anti-Pattern 1: Overfitting to Recent Data

**Problem**: Calibrating based on 1-2 recent decisions

```yaml
# Bad: Based on single decision
# "PV rejected one high-market-signal opportunity"
current_market_signals: 0.05  # From 0.1 (too drastic)
```

**Solution**: Require minimum 10-20 samples before calibration

---

### ❌ Anti-Pattern 2: Ignoring Veto Power

**Problem**: Weakening veto mechanisms to reduce rejections

```yaml
# Bad: Lowering veto to approve more candidates
thresholds:
  veto: 0.5  # From 0.7 (defeats purpose of veto)
```

**Solution**: Veto thresholds are PV's hard limits - respect them

---

### ❌ Anti-Pattern 3: Frequent Thrashing

**Problem**: Changing config every week based on noise

```
Week 1: end_state_vision = 0.9
Week 2: end_state_vision = 0.85
Week 3: end_state_vision = 0.95
Week 4: end_state_vision = 0.9
```

**Solution**: Implement minimum 4-week stabilization period

---

### ❌ Anti-Pattern 4: Undocumented Changes

**Problem**: Changing config without explaining why

```yaml
# Bad: No context
end_state_vision: 0.93  # Why 0.93? Why not 0.9 or 0.95?
```

**Solution**: Always document rationale in commit message or inline comments

## Calibration Checklist

Before deploying calibration changes:

- [ ] Collected minimum 10-20 decision samples
- [ ] Identified clear pattern of misalignment
- [ ] Formed testable hypothesis
- [ ] Calculated proposed adjustments with rationale
- [ ] Tested against historical data
- [ ] Achieved >80% accuracy in testing
- [ ] Documented changes in git commit
- [ ] Staged rollout (env vars → config → code)
- [ ] Set up monitoring plan (daily → weekly → monthly)
- [ ] Scheduled next review (3 months)

## Tools & Scripts

### Accuracy Calculator

```javascript
// utils/calibration-accuracy.js

function calculateAccuracy(historicalCases, heuristic) {
  let matches = 0;
  let total = historicalCases.length;

  historicalCases.forEach(case => {
    const heuristicResult = heuristic(case.input);
    if (heuristicResult.recommendation === case.actualDecision) {
      matches++;
    }
  });

  return {
    accuracy: matches / total,
    matches: matches,
    mismatches: total - matches,
    total: total
  };
}
```

### Config Diff Tool

```bash
# Compare two config versions
diff -u config/heuristics.yaml.old config/heuristics.yaml

# Or use git diff
git diff HEAD~1 config/heuristics.yaml
```

### Validation Test

```bash
# Before committing config changes, run validation
node tests/config/config.test.js

# Should see: All 13 configuration tests passed successfully!
```

## Example: Complete Calibration Cycle

### Step 1: Data Collection (Week 1-2)

```markdown
## Decision Log - January 2024

### Case 1: Project Alpha
- **Input**: Vision clarity: 0.9, Market alignment: 0.4
- **Heuristic**: HIGH priority (score: 0.85)
- **Actual PV**: HIGH priority ✓ MATCH
- **Notes**: Strong vision alignment drove decision

### Case 2: Project Beta
- **Input**: Vision clarity: 0.6, Market alignment: 0.9
- **Heuristic**: HIGH priority (score: 0.69)
- **Actual PV**: MEDIUM priority ✗ MISMATCH
- **PV reasoning**: "Market timing not enough without clear vision"

[...18 more cases...]

## Summary
- Total: 20 cases
- Matches: 14 (70%)
- Mismatches: 6 (30%)
- **Pattern**: Heuristic over-weights market signals
```

### Step 2: Hypothesis (Week 3)

```yaml
# Hypothesis: Increase vision weight from 0.9 to 0.95
# Decrease market weight from 0.1 to 0.05

PV_BS_001:
  weights:
    end_state_vision: 0.95   # +0.05
    current_market_signals: 0.05  # -0.05
```

### Step 3: Testing (Week 4)

```javascript
// Test with historical data
const testAccuracy = calculateAccuracy(januaryCases, testHeuristic);

console.log(`Test Accuracy: ${testAccuracy.accuracy * 100}%`);
// Output: Test Accuracy: 85% (17/20 matches)
// Improvement: +15% from baseline
```

### Step 4: Deployment (Week 5)

```bash
# Stage 1: Environment variable (1 week)
export HEURISTIC_BS001_END_STATE_WEIGHT=0.95
export HEURISTIC_BS001_MARKET_WEIGHT=0.05

# Monitor for 1 week, validate in real decisions

# Stage 2: Config file update
vim config/heuristics.yaml
git commit -m "feat: calibrate PV_BS_001 for vision-driven strategy

Based on 20 strategic decisions from Jan 2024:
- Baseline accuracy: 70% (14/20 matches)
- Test accuracy: 85% (17/20 matches)
- Improvement: +15%

Changes:
- end_state_vision: 0.9 → 0.95 (+0.05)
- current_market_signals: 0.1 → 0.05 (-0.05)

Rationale: Analysis showed PV consistently prioritizes
long-term vision over market timing. Market signals
only considered when vision is equally clear."

git push
```

### Step 5: Monitoring (Weeks 6-10)

```
Week 6: Daily checks - 5/5 decisions matched ✓
Week 7: Daily checks - 4/5 decisions matched ✓
Week 8: Weekly check - 12/14 decisions matched (86%)
Week 9: Weekly check - 11/13 decisions matched (85%)
Week 10: Review - Stable at 85% accuracy

Next calibration: April 2024 (quarterly review)
```

## Related Documentation

- **Configuration Guide**: `configuration-guide.md` - Detailed parameter reference
- **Test Suite**: `tests/config/config.test.js` - Automated validation tests
- **Heuristic Compiler**: `utils/heuristic-compiler.js` - Implementation details

---

*Last Updated: Story 1.7 - Phase 2 Configuration System*
