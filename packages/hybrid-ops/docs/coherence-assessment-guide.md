# Systemic Coherence Assessment Guide (PV_PA_001)

**Version**: 1.0.0
**Author**: Pedro Valério (Cognitive Architecture)
**Part of**: Hybrid-Ops Expansion Pack
**Story**: 1.5 - Executor Designer Agent

---

## Table of Contents

1. [What is Systemic Coherence Assessment?](#what-is-systemic-coherence-assessment)
2. [Core Principles](#core-principles)
3. [The Coherence Scan Algorithm](#the-coherence-scan-algorithm)
4. [Step-by-Step Assessment Process](#step-by-step-assessment-process)
5. [Classification Matrix](#classification-matrix)
6. [Real-World Examples](#real-world-examples)
7. [Common Pitfalls](#common-pitfalls)
8. [Troubleshooting](#troubleshooting)
9. [Integration with Agents](#integration-with-agents)

---

## What is Systemic Coherence Assessment?

**PV_PA_001** (Systemic Coherence Scan) is an executor assessment heuristic from Pedro Valério's cognitive architecture that prioritizes **truthfulness and systemic coherence** over technical capability when evaluating executors (team members, contractors, partners).

### Key Insight

Traditional hiring and executor evaluation focuses on **technical skills first**, treating alignment as secondary. Coherence assessment **inverts this paradigm**:

```
❌ Traditional: Technical Skill → Cultural Fit → Values Alignment
✅ Coherence Scan: Truthfulness (VETO) → System Adherence → Technical Skill
```

### When to Use

Use PV_PA_001 for:
- **Executor assessment** and hiring decisions
- **Team composition** and role assignment
- **Partnership evaluation** for long-term collaborations
- **Performance reviews** with coherence emphasis
- **Contractor vetting** for critical projects

**Don't use** for:
- One-time transactional work (<1 week duration)
- Roles with zero systemic impact
- Emergency short-term fixes
- Isolated technical consulting

---

## Core Principles

### Principle 1: Truthfulness as Non-Negotiable Foundation

**Veto Power**: Truthfulness < 0.7 → **AUTOMATIC REJECT** (overrides all other factors)

**Rationale**: Technical capability cannot compensate for fundamental truthfulness issues. An executor who cannot be truthful about challenges, mistakes, or limitations poses systemic risk that outweighs any skill advantage.

**Behavioral Evidence** (from PV mind artifacts):
> "Demissão dos filmmakers tecnicamente superiores mas que mentiam consistentemente.
> O parâmetro 'truthfulness_coherence' foi violado, tornando 'technical_skill' irrelevante."

**Translation**: "Dismissal of technically superior filmmakers who consistently lied. The 'truthfulness_coherence' parameter was violated, making 'technical_skill' irrelevant."

### Principle 2: Weighted Priority System

**Weight Distribution**:
- **Truthfulness**: 1.0 (100% weight, VETO power)
- **System Adherence**: 0.8 (80% weight)
- **Technical Skill**: 0.3 (30% weight)

**Formula**:
```javascript
coherenceScore = (truthfulness * 1.0 + systemAdherence * 0.8 + skill * 0.3) / 2.1
```

**Rationale**: Long-term executor value derives from **coherence in belief systems**, not just capability. An executor aligned with system principles will grow capabilities over time, while a misaligned executor with high current skills creates ongoing friction.

### Principle 3: Coherence Hierarchy

**Classification Scale**:
- **EXCELLENT** (≥0.9): Exceptional coherence across all dimensions → APPROVE
- **GOOD** (≥0.75): Strong truthfulness with solid alignment → APPROVE
- **ACCEPTABLE** (≥0.6): Adequate coherence, some gaps → REVIEW
- **POOR** (<0.6 or veto): Fundamental coherence issues → REJECT

---

## The Coherence Scan Algorithm

### Assessment Formula

```javascript
// Step 1: Check veto condition (truthfulness <0.7)
if (truthfulness < 0.7) {
  return {
    score: 0,
    veto: true,
    recommendation: 'REJECT',
    hierarchyRank: 'POOR',
    vetoReason: 'TRUTHFULNESS_BELOW_THRESHOLD'
  };
}

// Step 2: Calculate weighted coherence score
const coherenceScore = (
  truthfulness * 1.0 +
  systemAdherence * 0.8 +
  skill * 0.3
) / 2.1;

// Step 3: Classify and recommend
let hierarchyRank, recommendation;
if (coherenceScore >= 0.9) {
  hierarchyRank = 'EXCELLENT';
  recommendation = 'APPROVE';
} else if (coherenceScore >= 0.75) {
  hierarchyRank = 'GOOD';
  recommendation = 'APPROVE';
} else if (coherenceScore >= 0.6) {
  hierarchyRank = 'ACCEPTABLE';
  recommendation = 'REVIEW';
} else {
  hierarchyRank = 'POOR';
  recommendation = 'REJECT';
}
```

### Scoring Dimensions

#### Truthfulness (0-1 scale, VETO <0.7)

**Indicators**:
- ✅ **High (0.8-1.0)**: Proactively reports mistakes, admits knowledge gaps, gives realistic estimates
- ⚠️ **Medium (0.7-0.8)**: Generally honest but occasional omissions, needs prompting for bad news
- ❌ **Low (<0.7)**: Hides failures, overstates capabilities, gives optimistic timelines without caveats

**Evidence Sources**:
- Track record of delivery vs. commitments
- Response to discovery of own errors
- Clarity in communicating blockers
- Acknowledgment of limitations

#### System Adherence (0-1 scale, weight: 0.8)

**Indicators**:
- ✅ **High (0.8-1.0)**: Deeply understands system principles, applies them consistently, challenges misalignment
- ⚠️ **Medium (0.5-0.8)**: Follows system patterns when guided, occasional drift
- ❌ **Low (<0.5)**: Resists system principles, creates exceptions, undermines coherence

**Evidence Sources**:
- Alignment with META_AXIOMAS
- Adoption of established patterns
- Contribution to system improvement
- Resistance to anti-patterns

#### Technical Skill (0-1 scale, weight: 0.3)

**Indicators**:
- ✅ **High (0.8-1.0)**: Expert-level capability, teaches others, solves complex problems
- ⚠️ **Medium (0.5-0.8)**: Solid practitioner, handles routine work well, needs guidance on complex issues
- ❌ **Low (<0.5)**: Struggles with standard tasks, frequent errors, steep learning curve

**Evidence Sources**:
- Code quality and architecture decisions
- Problem-solving effectiveness
- Knowledge breadth and depth
- Learning velocity

---

## Step-by-Step Assessment Process

### Step 1: Gather Evidence (Do not skip!)

**Critical**: Never assess based on impressions alone. Gather objective behavioral evidence.

**Evidence Collection**:
```
Truthfulness Evidence:
- [ ] Review past delivery commitments vs. actual outcomes
- [ ] Analyze communication patterns around challenges
- [ ] Check error acknowledgment and correction behavior
- [ ] Assess realism in estimates and capabilities claims

System Adherence Evidence:
- [ ] Review code/design against META_AXIOMAS
- [ ] Check pattern adoption and anti-pattern avoidance
- [ ] Evaluate contribution to system improvement
- [ ] Assess response to system guidance

Technical Skill Evidence:
- [ ] Review work quality (code, designs, deliverables)
- [ ] Assess problem-solving track record
- [ ] Check knowledge demonstrated in discussions
- [ ] Evaluate learning velocity over time
```

### Step 2: Score Each Dimension (0-1 scale)

**Scoring Guidelines**:
1. Use **evidence**, not impressions
2. Be conservative - round down in uncertainty
3. Consider **trajectory** (improving vs. declining)
4. Weight **recent behavior** more heavily
5. Distinguish **pattern** from isolated incidents

**Example Scoring**:
```yaml
Executor: Mid-Level Developer
Truthfulness: 0.85
  Evidence:
    - Proactively reported 3 blockers in last sprint
    - Admitted knowledge gap on caching, requested pairing
    - Gave realistic 2-day estimate that held true
    - No instances of hiding mistakes

System Adherence: 0.75
  Evidence:
    - Follows established patterns consistently
    - Occasionally needs reminders on error handling standards
    - Contributed 2 improvements to build process
    - Generally aligned with META_AXIOMAS principles

Skill: 0.70
  Evidence:
    - Solid practitioner, handles CRUD well
    - Needs guidance on complex state management
    - Clean code, follows conventions
    - Learning velocity: good, 2 new frameworks in 6 months
```

### Step 3: Apply PV_PA_001 Algorithm

```javascript
// Example calculation for executor above
const truthfulness = 0.85;
const systemAdherence = 0.75;
const skill = 0.70;

// Check veto
if (truthfulness < 0.7) {
  // VETO TRIGGERED - automatic REJECT
  return { recommendation: 'REJECT', reason: 'Truthfulness veto' };
}

// Calculate coherence score
const coherenceScore = (0.85 * 1.0 + 0.75 * 0.8 + 0.70 * 0.3) / 2.1;
// = (0.85 + 0.60 + 0.21) / 2.1
// = 1.66 / 2.1
// = 0.790

// Classify
// 0.790 >= 0.75 → hierarchyRank: GOOD
// recommendation: APPROVE
```

### Step 4: Document Reasoning

**Critical**: Always document **why** the scores were assigned and **why** the recommendation was made.

**Template**:
```markdown
## Executor Assessment: [Name]

### Coherence Score: 0.790 (GOOD)

**Recommendation**: APPROVE

### Dimension Scores:
- Truthfulness: 0.85 (HIGH)
- System Adherence: 0.75 (GOOD)
- Technical Skill: 0.70 (MEDIUM)

### Reasoning:
Strong truthfulness foundation (0.85) provides high confidence in reliability.
System adherence (0.75) demonstrates solid alignment with META_AXIOMAS.
Technical skill (0.70) is adequate and shows consistent improvement.

### Evidence Summary:
- Truthfulness: Proactive communication, realistic estimates, acknowledges gaps
- System: Follows patterns, contributes improvements, generally aligned
- Skill: Solid practitioner, good learning velocity

### Veto Status: NO VETO
Truthfulness (0.85) well above veto threshold (0.7).

### Decision: APPROVE for role
Expected trajectory: Skill will improve with mentorship, coherence foundation strong.
```

---

## Classification Matrix

| Truthfulness | System Adherence | Skill | Score | Hierarchy | Recommendation | Reasoning |
|-------------|------------------|-------|-------|-----------|----------------|-----------|
| <0.7 (ANY) | (ANY) | (ANY) | 0.00 | POOR | REJECT | **VETO**: Truthfulness below threshold |
| 0.95 | 0.90 | 0.85 | 0.91 | EXCELLENT | APPROVE | Exceptional coherence, all dimensions strong |
| 0.85 | 0.75 | 0.70 | 0.79 | GOOD | APPROVE | Strong truthfulness, solid alignment, adequate skill |
| 0.80 | 0.70 | 0.60 | 0.74 | ACCEPTABLE | REVIEW | Moderate coherence, consider role fit and mentorship |
| 0.72 | 0.50 | 0.45 | 0.58 | POOR | REJECT | Low coherence score despite passing veto |
| 0.65 | 0.85 | 0.95 | 0.00 | POOR | REJECT | **VETO**: High skill cannot override truthfulness |

**Key Patterns**:
- **Veto trumps all**: Truthfulness <0.7 → REJECT, regardless of other scores
- **Skill weight is low**: High skill (0.95) with low truthfulness (0.65) still gets REJECTED
- **Coherence > Capability**: Score 0.79 (GOOD) beats score 0.00 (high skill, low truthfulness)

---

## Real-World Examples

### Example 1: High Skill, Low Truthfulness → REJECT

**Context**: Senior developer with 10 years experience, excellent technical portfolio, but pattern of optimistic estimates and hidden blockers.

**Assessment**:
```yaml
Executor: Senior Developer
Truthfulness: 0.65  # ⚠️ BELOW VETO THRESHOLD
  Evidence:
    - 4 sprints with missed commitments, no early warnings
    - Claimed expertise in distributed systems, struggled with implementation
    - Delayed reporting of breaking change for 2 days
    - Pattern of "almost done" estimates that extended 2-3x

System Adherence: 0.85
  Evidence:
    - Follows code patterns well
    - Good architectural instincts
    - Contributes to design discussions

Skill: 0.95
  Evidence:
    - Expert-level coding ability
    - Solves complex problems quickly
    - Deep knowledge of frameworks
```

**Coherence Scan Output**:
```javascript
{
  score: 0,
  veto: true,
  vetoReason: "TRUTHFULNESS_BELOW_THRESHOLD (0.65 < 0.7)",
  recommendation: "REJECT",
  hierarchyRank: "POOR",
  reasoning: "Truthfulness veto power triggered. Cannot recommend executor with " +
             "coherence issues, regardless of technical skill level. Pattern of " +
             "hiding challenges and overestimating capabilities creates systemic " +
             "risk that outweighs coding expertise. This reflects PV principle: " +
             "coherence in belief systems takes absolute priority over technical capability."
}
```

**Decision**: **REJECT** - Veto power overrides exceptional technical skills.

**Rationale**: A technically brilliant executor who cannot reliably communicate challenges creates cascading risks:
- Project planning becomes unreliable
- Other team members cannot trust status updates
- Hidden blockers compound over time
- Systemic coherence is compromised

**PV Behavioral Evidence**: "Demissão dos filmmakers tecnicamente superiores mas que mentiam consistentemente." (Dismissal of technically superior filmmakers who consistently lied.)

---

### Example 2: Balanced Executor → APPROVE

**Context**: Mid-level developer with solid track record, strong communication, growing skills.

**Assessment**:
```yaml
Executor: Mid-Level Developer
Truthfulness: 0.85
  Evidence:
    - Proactively flagged 3 blockers last quarter
    - Acknowledged knowledge gaps, requested pairing
    - Gave realistic estimates that held true
    - Quick to report and fix own mistakes

System Adherence: 0.75
  Evidence:
    - Follows established patterns consistently
    - Contributes to process improvements
    - Occasionally needs reminders on standards
    - Generally aligned with META_AXIOMAS

Skill: 0.70
  Evidence:
    - Solid practitioner for CRUD operations
    - Needs guidance on complex architecture
    - Clean code, follows conventions
    - Good learning velocity (2 frameworks in 6 months)
```

**Coherence Scan Output**:
```javascript
{
  score: 0.790,  // (0.85*1.0 + 0.75*0.8 + 0.70*0.3) / 2.1 = 0.790
  veto: false,
  recommendation: "APPROVE",
  hierarchyRank: "GOOD",
  reasoning: "Strong truthfulness (0.85) provides high confidence in reliability. " +
             "System adherence (0.75) demonstrates solid alignment with META_AXIOMAS. " +
             "Technical skills adequate (0.70) with consistent improvement trajectory. " +
             "Executor's coherence foundation enables skill growth over time. Recommended " +
             "for role with expectation of continued development.",
  confidence: "HIGH",
  heuristic: "PV_PA_001"
}
```

**Decision**: **APPROVE** - Strong coherence foundation with growth potential.

**Rationale**:
- Truthfulness (0.85) ensures reliable communication
- System adherence (0.75) indicates cultural fit
- Skill (0.70) is adequate and improving
- **Coherence enables skill growth**: An aligned executor with moderate skills will improve faster than a misaligned executor with high skills

**Expected Trajectory**: With mentorship and continued learning, skill will reach 0.85+ within 12-18 months while maintaining strong coherence.

---

### Example 3: Veto Boundary Case (0.70) → ACCEPTABLE

**Context**: Junior developer, exactly at veto threshold, needs monitoring.

**Assessment**:
```yaml
Executor: Junior Developer
Truthfulness: 0.70  # Exactly at veto threshold
  Evidence:
    - Generally honest but needs prompting for bad news
    - Occasionally optimistic in estimates
    - Admitted mistakes when directly asked
    - No pattern of deception, but needs improvement

System Adherence: 0.80
  Evidence:
    - Eager to follow established patterns
    - Asks good questions about principles
    - Quick to adopt feedback
    - Strong alignment with system values

Skill: 0.75
  Evidence:
    - Junior-level solid fundamentals
    - Handles routine tasks well
    - Needs guidance on complex problems
    - Fast learner, good trajectory
```

**Coherence Scan Output**:
```javascript
{
  score: 0.745,  // (0.70*1.0 + 0.80*0.8 + 0.75*0.3) / 2.1 = 0.745
  veto: false,  // Exactly 0.7 does NOT trigger veto (threshold is <0.7)
  recommendation: "REVIEW",
  hierarchyRank: "ACCEPTABLE",
  reasoning: "Truthfulness at veto threshold boundary (0.70) requires monitoring. " +
             "Strong system adherence (0.80) indicates good cultural alignment. " +
             "Skill level (0.75) appropriate for junior role. Recommend REVIEW with " +
             "focus on improving truthfulness through explicit communication coaching.",
  confidence: "MEDIUM",
  heuristic: "PV_PA_001"
}
```

**Decision**: **REVIEW** - Conditional approval with monitoring plan.

**Action Plan**:
1. **Approve** for junior role
2. **Monitor** truthfulness during 90-day period
3. **Coach** on proactive communication of challenges
4. **Re-assess** at 90 days with target truthfulness ≥0.75

**Rationale**: Executor at boundary can improve with guidance. Strong system adherence (0.80) indicates willingness to learn and adapt.

---

## Common Pitfalls

### Pitfall 1: Skill Overvaluation

**Symptom**: "But they're so technically brilliant, we can't reject them for honesty issues!"

**Why It's Wrong**:
- Technical skills can be learned; truthfulness patterns are deeply rooted
- High-skill, low-truthfulness executors create **systemic debt**
- One brilliant liar causes more damage than hiring three honest juniors
- Veto power exists **precisely** to prevent this rationalization

**Fix**:
1. Acknowledge the veto is working as designed
2. Trust the PV behavioral evidence (filmmaker dismissal story)
3. Calculate the **systemic cost** of low truthfulness over 6-12 months
4. Recognize coherence enables skill growth, not vice versa

**PV Principle**: "Coherence in belief systems > Technical capability"

---

### Pitfall 2: Insufficient Evidence Collection

**Symptom**: Scoring based on interviews or impressions rather than behavioral evidence.

**Why It's Wrong**:
- Interviews test **performance**, not **patterns**
- First impressions miss long-term behavioral trends
- Executors can fake truthfulness short-term but not long-term
- Scoring without evidence leads to inaccurate assessments

**Fix**:
1. Require **minimum evidence threshold**: 3+ data points per dimension
2. Use **behavioral indicators**: actual actions, not claimed values
3. Check **references** with specific truthfulness questions
4. Review **work product** for evidence of system adherence
5. Analyze **communication patterns** in writing (emails, tickets, docs)

**Example Evidence Checklist**:
```
Truthfulness:
✓ Delivery commitment vs. actual outcome (3+ sprints)
✓ Response to discovering own errors (2+ incidents)
✓ Communication of blockers (evidence of proactive flagging)
✓ Estimate accuracy (5+ estimates with ±20% tolerance)

System Adherence:
✓ Code reviews (5+ PRs reviewed for pattern alignment)
✓ Design decisions (alignment with META_AXIOMAS)
✓ Process contributions (improvements vs. resistance)

Skill:
✓ Work product quality (code samples, designs)
✓ Problem-solving (2+ complex challenges handled)
✓ Knowledge demonstration (technical discussions)
```

---

### Pitfall 3: Ignoring Trajectory

**Symptom**: Scoring executor based on current state, not trend direction.

**Why It's Wrong**:
- Improving executor (0.72 → 0.78) better long-term than declining (0.85 → 0.80)
- Current snapshot misses **velocity of change**
- Trajectory indicates **learning capability and willingness**

**Fix**:
1. Score current state as baseline
2. **Adjust** based on trajectory (+0.05 for improving, -0.05 for declining)
3. Consider **timeframe**: 3-6 month trends more meaningful than week-to-week
4. Weight **recent** behavior more heavily than distant past

**Example**:
```yaml
Executor: Improving Junior
Current Scores:
  Truthfulness: 0.72 (was 0.65 six months ago)
  System Adherence: 0.70 (was 0.60 six months ago)
  Skill: 0.65 (was 0.55 six months ago)

Trajectory Adjustment:
  All dimensions improving (+0.05 each for strong positive trajectory)

Adjusted Scores:
  Truthfulness: 0.77
  System Adherence: 0.75
  Skill: 0.70

Coherence Score: 0.77 (GOOD) → APPROVE with monitoring
```

---

### Pitfall 4: Confusing Niceness with Truthfulness

**Symptom**: Scoring pleasant, agreeable executors high on truthfulness despite avoidance of difficult conversations.

**Why It's Wrong**:
- **Niceness** ≠ **Truthfulness**
- Avoiding conflict by withholding bad news is **low truthfulness**
- "Yes-man" behavior masks blockers and creates systemic risk
- Agreeableness without honesty is a **false positive**

**Fix**:
1. Define truthfulness explicitly: **willingness to report difficult truths**
2. Test for **uncomfortable honesty**: Do they proactively flag risks?
3. Look for **evidence of difficult conversations** handled well
4. Distinguish **kindness** (good) from **conflict avoidance** (bad)

**Red Flags**:
- Always agrees with leadership, never challenges
- No record of escalating blockers or concerns
- Avoids "bad news" conversations
- Surprises stakeholders with delays (no early warning)

**Green Flags**:
- Disagrees respectfully when appropriate
- Proactively flags risks before they become crises
- Admits mistakes quickly and publicly
- Gives realistic (sometimes disappointing) estimates

---

## Troubleshooting

### Issue: Veto Triggered, Stakeholders Push Back

**Scenario**: High-value executor (e.g., critical contractor, senior hire) scores <0.7 on truthfulness, veto is triggered, stakeholders argue for exception.

**Resolution**:

1. **Acknowledge the veto is working correctly**
   - Veto power exists to prevent exactly this scenario
   - PV behavioral evidence: technically superior filmmakers were dismissed for truthfulness violations

2. **Quantify systemic cost**
   ```
   Cost of Low-Truthfulness Executor (12 months):
   - 4 sprints with surprise delays (20% capacity loss)
   - 3 critical blockers hidden until crisis (emergency fixes)
   - Team trust erosion (morale impact)
   - Project planning unreliability (schedule slippage)

   Total estimated cost: 3-6 months of equivalent salary
   ```

3. **Propose alternatives**
   - Find executor with truthfulness ≥0.7 and skill ≥0.6 (train up)
   - Scope down the role (isolate low-truth executor from critical path)
   - Time-box engagement (1-3 months max, no long-term dependencies)

4. **Document override if stakeholders insist**
   ```
   COHERENCE VETO OVERRIDE
   Executor: [Name]
   Veto Reason: Truthfulness 0.65 < 0.7
   Override Authority: [Stakeholder Name]
   Override Reason: [Business justification]
   Mitigation Plan:
   - Weekly truthfulness check-ins
   - Redundant verification of all estimates
   - No critical path dependencies
   - 90-day review with veto re-evaluation
   ```

**Critical**: If override is granted, **track outcomes** to validate/invalidate veto decision.

---

### Issue: All Scores Moderate, No Clear Recommendation

**Scenario**: Executor scores 0.72 truthfulness, 0.68 system adherence, 0.65 skill → coherence score 0.70 (ACCEPTABLE).

**Resolution**:

1. **Recognize this is a "REVIEW" scenario**
   - ACCEPTABLE (0.6-0.75) means: not automatic approve, not automatic reject
   - Requires **role-specific analysis**

2. **Analyze role requirements**
   ```yaml
   Role: Frontend Developer (non-critical path)
   Requirements:
     Truthfulness: ≥0.7 (moderate, okay for non-critical)
     System: ≥0.65 (adequate)
     Skill: ≥0.6 (adequate)

   Executor Fit:
     Truthfulness: 0.72 ✓ (meets minimum)
     System: 0.68 ✓ (meets minimum)
     Skill: 0.65 ✓ (meets minimum)

   Decision: APPROVE with 90-day review
   ```

3. **Consider trajectory**
   - Improving executor (0.68 → 0.75 over 6 months) → APPROVE
   - Declining executor (0.78 → 0.70 over 6 months) → REJECT

4. **Define monitoring plan**
   ```
   90-Day Review Plan:
   - Target: Truthfulness ≥0.75, System ≥0.72, Skill ≥0.70
   - Check-ins: Weekly 1:1s focused on communication
   - Metrics: Estimate accuracy, blocker flagging frequency
   - Success: Continue, Failure: Re-assess role fit
   ```

---

### Issue: Generic Mode Fallback (PV Mind Unavailable)

**Scenario**: PV mind artifacts not loaded, coherence scan falls back to generic mode with equal weighting.

**Resolution**:

1. **Verify mind loading**
   ```bash
   # Check mind artifacts exist
   ls hybrid-ops/minds/pedro_valerio/

   # Verify mind-loader.js functioning
   node -e "const { loadMind } = require('./utils/mind-loader'); loadMind().then(m => console.log('Loaded:', m.loaded));"
   ```

2. **Understand generic mode limitations**
   ```javascript
   // Generic mode: equal weighting (0.33, 0.33, 0.34)
   const score = (truthfulness * 0.33 + systemAdherence * 0.33 + skill * 0.34);
   // No veto power, no PV principles
   ```

3. **Options**:
   - **Fix mind loading** (preferred): Restore PV mode for accurate assessment
   - **Use generic mode** (fallback): Lower confidence, document as generic assessment
   - **Manual assessment**: Apply PV principles manually using this guide

4. **Document fallback**
   ```yaml
   Executor Assessment: [Name]
   Mode: GENERIC (PV mind unavailable)
   Confidence: LOW
   Note: Assessment uses equal weighting without veto power.
         Re-assess in PV mode when mind artifacts available.
   ```

---

## Integration with Agents

### Executor Designer Agent

**File**: `.claude/commands/hybridOps/agents/executor-designer-pv.md`

**Integration Pattern**:
```javascript
const { loadMind } = require('../utils/mind-loader');
const { compileHeuristic } = require('../utils/heuristic-compiler');

// Initialize PV mind (session-scoped)
const pvMind = await loadMind();
const coherenceScan = pvMind.coherenceScan;  // PV_PA_001

// Assess executor
const assessment = evaluateExecutorCoherence(
  truthfulness,
  systemAdherence,
  skill,
  pvMind
);

// Use assessment in design decisions
if (assessment.recommendation === 'APPROVE') {
  assignExecutor(executor, role);
} else if (assessment.recommendation === 'REVIEW') {
  proposeMonitoringPlan(executor, assessment);
} else {
  rejectExecutor(executor, assessment.vetoReason || 'Low coherence score');
}
```

**Agent Commands Using PV_PA_001**:
- `*design-executors`: Coherence scan applied to all executor candidates
- `*define-executor`: Individual executor assessment with reasoning
- `*create-assignment-matrix`: Role assignment considers coherence scores
- `*analyze-workload`: Workload distribution accounts for executor coherence
- `*identify-skill-gaps`: Gaps analyzed with coherence context

---

### Testing Integration

**File**: `.claude/commands/hybridOps/tests/executor-integration.test.js`

**Test Coverage**:
- PV_PA_001 Coherence Scan Tests (7 tests)
- Veto Logic Tests (4 tests)
- Dual-Mode Fallback Tests (3 tests)
- Integration Tests (5 tests)
- Scenario Validation Tests (2 tests from story examples)

**Running Tests**:
```bash
node .claude/commands/hybridOps/tests/executor-integration.test.js
```

**Expected Output**:
```
✅ All 21 tests passing
✅ Execution time: <100ms (AC6 compliance)
✅ 100% pass rate
```

---

## Appendix: Quick Reference

### Veto Threshold

```
Truthfulness < 0.7 → AUTOMATIC REJECT
```

### Weight Formula

```javascript
coherenceScore = (truthfulness * 1.0 + systemAdherence * 0.8 + skill * 0.3) / 2.1
```

### Classification Thresholds

```
≥0.9   → EXCELLENT → APPROVE
≥0.75  → GOOD      → APPROVE
≥0.6   → ACCEPTABLE → REVIEW
<0.6   → POOR      → REJECT
```

### Evidence Checklist

```
Truthfulness:
□ Delivery commitment accuracy (3+ sprints)
□ Error acknowledgment (2+ incidents)
□ Blocker communication (proactive flagging)
□ Estimate realism (5+ estimates)

System Adherence:
□ Pattern alignment (5+ code reviews)
□ META_AXIOMAS compliance (design decisions)
□ Process contributions (improvements vs. resistance)

Skill:
□ Work product quality (code samples, designs)
□ Problem-solving (2+ complex challenges)
□ Knowledge demonstration (technical discussions)
□ Learning velocity (trajectory over 3-6 months)
```

### Decision Matrix (Quick)

| Truthfulness | System | Skill | → | Decision |
|--------------|--------|-------|---|----------|
| <0.7 | ANY | ANY | → | REJECT (veto) |
| ≥0.85 | ≥0.75 | ≥0.70 | → | APPROVE (GOOD) |
| ≥0.75 | ≥0.65 | ≥0.60 | → | REVIEW (ACCEPTABLE) |
| ≥0.70 | <0.60 | <0.60 | → | REJECT (POOR) |

---

**Version History**:
- v1.0.0 (2025-01-19): Initial release - Executor Designer PV Integration (Story 1.5)

**Related Documents**:
- Story 1.5: `docs/stories/1.5-phase-2-executor-designer.md`
- Executor Designer Agent: `.claude/commands/hybridOps/agents/executor-designer-pv.md`
- Integration Tests: `.claude/commands/hybridOps/tests/executor-integration.test.js`
- Back-Casting Guide: `.claude/commands/hybridOps/docs/back-casting-guide.md` (Story 1.4 reference)

---

_Guide Version: 1.0.0_
_Part of: hybrid-ops expansion pack (PV Mind Edition)_
_Heuristic: PV_PA_001 (Systemic Coherence Scan)_
_Cognitive Architecture: Pedro Valério META_AXIOMAS_
