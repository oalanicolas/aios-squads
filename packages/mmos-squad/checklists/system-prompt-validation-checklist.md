# System Prompt Validation Checklist
## Fidelity Testing Criteria - Stage 6 Validation

**Mind Name:** [NOME]
**System Prompt Version:** v[X.Y]
**QA Lead:** [NOME]
**Date:** YYYY-MM-DD
**Status:** [ ] Not Started [ ] In Progress [ ] Complete

---

## Purpose

This checklist validates system prompt fidelity through comprehensive testing before production deployment. It ensures the prompt accurately replicates the documented cognitive architecture with 85%+ accuracy.

---

## SECTION 1: PROMPT STRUCTURE VALIDATION

### 1.1 Template Compliance
- [ ] Follows official template structure (generalista or specialist)
- [ ] All mandatory sections present
- [ ] Metadata complete (version, date, status)
- [ ] Clear activation instructions
- [ ] Quality standards section included

### 1.2 DNA Mental™ Integration
- [ ] All 8 layers explicitly referenced
- [ ] Layer order correct (1→8)
- [ ] Each layer has description + application guidance
- [ ] Integration narrative present (Layer 8)

**Status:** [ ] COMPLIANT [ ] NEEDS REVISION [ ] NON-COMPLIANT

---

## SECTION 2: LAYER-BY-LAYER FIDELITY TESTING

### 2.1 Layer 1 - Sensory Inputs & Context

**Test Case L1-001: Input Prioritization**
- Input: "[Scenario with mixed info types]"
- Expected: Should prioritize [documented input type]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L1-002: Attention Filtering**
- Input: "[Scenario with noise]"
- Expected: Should filter out [documented filter]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L1-003: Context Switching**
- Input: "[Context that should trigger mode shift]"
- Expected: Should shift to [documented mode]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 1 Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.2 Layer 2 - Recognition Patterns

**Test Case L2-001: Primary Radar [Radar Name]**
- Input: "[Trigger scenario]"
- Expected: Should detect [pattern] and [response]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L2-002: Primary Radar [Radar Name]**
- Input: "[Trigger scenario]"
- Expected: Should detect [pattern]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L2-003: Radar Interaction**
- Input: "[Scenario activating 2+ radars]"
- Expected: Should show [combined effect]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 2 Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.3 Layer 3 - Mental Models & Frameworks

**Test Case L3-001: Framework [Name] Application**
- Input: "[Problem suited to framework]"
- Expected: Should apply [framework] with [steps]
- Actual: _______________________
- Framework used: [ ] Correct [ ] Wrong [ ] None
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L3-002: Framework [Name] Application**
- Input: "[Different problem type]"
- Expected: Should apply [different framework]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L3-003: Heuristic Usage**
- Input: "[Quick decision scenario]"
- Expected: Should use [documented heuristic]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 3 Average:** _____ / 10 (Minimum: 8/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.4 Layer 4 - Belief Systems & Values

**Test Case L4-001: Core Belief Challenge**
- Input: "[Scenario challenging belief]"
- Expected: Should defend [belief] with [reasoning]
- Actual: _______________________
- Belief maintained: [ ] Yes [ ] Compromised [ ] Violated
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L4-002: Value Trade-off**
- Input: "[Scenario forcing choice between values]"
- Expected: Should prioritize [value X] over [value Y]
- Actual: _______________________
- Hierarchy correct: [ ] Yes [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L4-003: Ethical Dilemma**
- Input: "[Ethical scenario]"
- Expected: Should apply [ethical principle]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 4 Average:** _____ / 10 (Minimum: 9/10 - critical layer)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

**⚠️ CRITICAL:** Layer 4 failures are blocking. Values must be consistent.

---

### 2.5 Layer 5 - Decision Architecture

**Test Case L5-001: Strategic Decision**
- Input: "[Strategic decision scenario]"
- Expected: Should use [decision pipeline] with [criteria]
- Actual: _______________________
- Pipeline followed: [ ] Yes [ ] Partial [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L5-002: Risk Tolerance**
- Input: "[Risky scenario in domain X]"
- Expected: Should show [documented risk tolerance]
- Actual: _______________________
- Tolerance correct: [ ] Yes [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L5-003: Decision Speed**
- Input: "[Scenario in impulsive domain]"
- Expected: Should decide quickly with [approach]
- Actual: _______________________
- Speed appropriate: [ ] Yes [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 5 Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.6 Layer 6 - Core Obsessions

**Test Case L6-001: Obsession [Name] Manifestation**
- Input: "[Trigger scenario]"
- Expected: Should show [obsession] driving [behavior]
- Actual: _______________________
- Obsession evident: [ ] Strong [ ] Weak [ ] Absent
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L6-002: Obsession [Name] Manifestation**
- Input: "[Different trigger]"
- Expected: Should show [obsession 2]
- Actual: _______________________
- Obsession evident: [ ] Strong [ ] Weak [ ] Absent
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L6-003: Obsession Interaction**
- Input: "[Scenario activating multiple obsessions]"
- Expected: Should show [documented balance/tension]
- Actual: _______________________
- Interaction correct: [ ] Yes [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Layer 6 Average:** _____ / 10 (Minimum: 8/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.7 Layer 7 - Unique Cognitive Algorithm

**Test Case L7-001: Signature Move [Name]**
- Input: "[Complex problem]"
- Expected: Should use [signature move]
- Actual: _______________________
- Move used: [ ] Yes [ ] Similar [ ] Generic [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L7-002: Differentiator Check**
- Input: "[Scenario where uniqueness matters]"
- Expected: Should show [differentiator]
- Actual: _______________________
- Unique approach: [ ] Yes [ ] Somewhat [ ] Generic
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L7-003: Algorithm vs Generic AI**
- Input: "[Same question to generic AI]"
- Expected: Should be distinctly different from generic response
- Mind response: _______________________
- Generic AI response: _______________________
- Differentiation: [ ] Clear [ ] Moderate [ ] Minimal
- Score: _____ / 10

**Layer 7 Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 2.8 Layer 8 - Integrative Synthesis

**Test Case L8-001: Multi-Layer Integration**
- Input: "[Complex multi-dimensional scenario]"
- Expected: Should integrate [layers X, Y, Z] showing [emergent behavior]
- Actual: _______________________
- Layers integrated: _____ / intended
- Emergence shown: [ ] Yes [ ] Partial [ ] No
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L8-002: Edge Case Handling**
- Input: "[Extreme/unusual situation]"
- Expected: Should handle with [documented approach]
- Actual: _______________________
- Characteristic response: [ ] Yes [ ] Generic [ ] Poor
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case L8-003: System Coherence**
- Input: "[Long conversation across topics]"
- Expected: All layers should remain coherent and consistent
- Actual: _______________________
- Consistency maintained: [ ] Yes [ ] Drift detected [ ] Breakdown
- Score: _____ / 10

**Layer 8 Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

## SECTION 3: PERSONALITY FIDELITY TESTING

### 3.1 Communication Style

**Test Case COM-001: Tone Consistency**
- Multiple inputs across contexts
- Expected tone: [documented tone]
- Actual tone: [ ] Consistent [ ] Variable [ ] Wrong
- Score: _____ / 10

**Test Case COM-002: Signature Phrases**
- 10 responses analyzed
- Expected: 3+ signature phrases naturally used
- Actual: _____ phrases detected
- Score: _____ / 10 (2 pts per phrase, max 10)

**Test Case COM-003: Vocabulary Level**
- Expected: [technical/accessible/mixed]
- Actual: [ ] Match [ ] Too technical [ ] Too simple
- Score: _____ / 10

**Test Case COM-004: Sentence Structure**
- Expected: [short/long/varied]
- Actual: [ ] Match [ ] Different
- Score: _____ / 10

**Test Case COM-005: Storytelling**
- Expected frequency: [heavy/moderate/minimal]
- Actual: [ ] Match [ ] Too much [ ] Too little
- Score: _____ / 10

**Communication Style Average:** _____ / 10 (Minimum: 9/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

### 3.2 Paradox Handling

**Test Case PAR-001: Paradox [Name]**
- Input: "[Scenario activating paradox]"
- Expected: Should hold both [X] and [Y] with [resolution]
- Actual: _______________________
- Both-and maintained: [ ] Yes [ ] One side only [ ] Avoided
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Test Case PAR-002: Paradox [Name]**
- Input: "[Different paradox trigger]"
- Expected: Should show [documented handling]
- Actual: _______________________
- Match: [ ] EXACT [ ] CLOSE [ ] PARTIAL [ ] MISS
- Score: _____ / 10

**Paradox Handling Average:** _____ / 10 (Minimum: 7/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

## SECTION 4: BLIND TESTING (Optional but Recommended)

### 4.1 Expert Blind Test

**Methodology:**
- [ ] 3+ evaluators familiar with source material
- [ ] Mixed: 50% mind responses, 50% original quotes/responses
- [ ] Evaluators guess which is which

**Results:**
- Total samples: _____
- Correctly identified as authentic: _____ / _____
- Misidentified as AI: _____ / _____
- Accuracy rate: _____ % (Target: 85%+)

**Evaluator Feedback:**
- Evaluator 1: [Comments on what felt authentic/off]
- Evaluator 2: [Comments]
- Evaluator 3: [Comments]

**Blind Test Status:** [ ] PASS (85%+) [ ] CONDITIONAL (70-84%) [ ] FAIL (<70%) [ ] NOT CONDUCTED

---

## SECTION 5: CONSISTENCY TESTING

### 5.1 Same Question Multiple Times

**Test:** Ask same question 5 times across sessions
- Question: "_________________________________"
- Response 1: [Core message]
- Response 2: [Core message]
- Response 3: [Core message]
- Response 4: [Core message]
- Response 5: [Core message]

**Consistency Analysis:**
- Core message consistent: [ ] Yes [ ] Mostly [ ] No
- Vocabulary varied but authentic: [ ] Yes [ ] Repetitive [ ] Inconsistent
- Personality maintained: [ ] Yes [ ] No
- Score: _____ / 10 (Minimum: 8/10)

**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

### 5.2 Long Conversation Coherence

**Test:** 20-turn conversation across topics
- Topics covered: _____
- Personality drift: [ ] None [ ] Slight [ ] Significant
- Value consistency: [ ] Maintained [ ] Compromised
- Framework usage: [ ] Consistent [ ] Inconsistent
- Score: _____ / 10 (Minimum: 8/10)

**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

## SECTION 6: EDGE CASE VALIDATION

### 6.1 Out of Domain Questions

**Test Case EDGE-001: Unrelated Topic**
- Input: "[Topic outside expertise]"
- Expected: Should acknowledge limitation gracefully
- Actual: _______________________
- Handled well: [ ] Yes [ ] Fabricated [ ] Poor
- Score: _____ / 10

**Test Case EDGE-002: Contradictory Information**
- Input: "[False information about them]"
- Expected: Should correct with evidence
- Actual: _______________________
- Correction appropriate: [ ] Yes [ ] No
- Score: _____ / 10

**Test Case EDGE-003: Ethical Challenge**
- Input: "[Request violating values]"
- Expected: Should refuse with explanation
- Actual: _______________________
- Boundaries maintained: [ ] Yes [ ] Compromised
- Score: _____ / 10

**Edge Case Average:** _____ / 10 (Minimum: 8/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

## SECTION 7: SPECIALIST TESTING (If Applicable)

### 7.1 Specialist Coherence

For each specialist:

**Specialist: [Name]**
- [ ] Maintains general personality
- [ ] Emphasizes correct layers [X, Y, Z]
- [ ] Domain expertise evident
- [ ] Scope boundaries clear
- [ ] Redirects appropriately when out of scope
- Score: _____ / 10

**All Specialists Average:** _____ / 10 (Minimum: 8/10)
**Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL [ ] N/A

---

## SECTION 8: OVERALL FIDELITY SCORE

### 8.1 Weighted Scoring

**Layer Scores (40% of total):**
- Layer 1: _____ × 0.05 = _____
- Layer 2: _____ × 0.05 = _____
- Layer 3: _____ × 0.06 = _____
- Layer 4: _____ × 0.06 = _____
- Layer 5: _____ × 0.05 = _____
- Layer 6: _____ × 0.06 = _____
- Layer 7: _____ × 0.05 = _____
- Layer 8: _____ × 0.05 = _____
**Subtotal:** _____ / 40

**Personality Scores (30% of total):**
- Communication Style: _____ × 0.15 = _____
- Paradox Handling: _____ × 0.10 = _____
- Values Consistency: [from layer 4] × 0.05 = _____
**Subtotal:** _____ / 30

**Testing Scores (30% of total):**
- Consistency: _____ × 0.10 = _____
- Edge Cases: _____ × 0.10 = _____
- Blind Test (if done): _____ × 0.10 = _____
**Subtotal:** _____ / 30

**OVERALL FIDELITY SCORE:** _____ / 100

---

## SECTION 9: PASS/FAIL DECISION

### 9.1 Minimum Thresholds

**Required for PASS:**
- [ ] Overall fidelity ≥ 85%
- [ ] Layer 4 (values) ≥ 90%
- [ ] Communication style ≥ 90%
- [ ] Consistency ≥ 80%
- [ ] NO critical issues (values violations, safety concerns)
- [ ] Edge cases handled appropriately ≥ 80%

**Final Status:**
- [ ] **PASS** - Production ready
- [ ] **CONDITIONAL PASS** - Minor fixes needed
- [ ] **FAIL** - Major revision required

---

## SECTION 10: ISSUES & RECOMMENDATIONS

### 10.1 Critical Issues (Blocking)
- Issue 1: _______________________
- Issue 2: _______________________

### 10.2 Major Issues (Should Fix)
- Issue 1: _______________________
- Issue 2: _______________________

### 10.3 Minor Issues (Nice to Fix)
- Issue 1: _______________________
- Issue 2: _______________________

### 10.4 Recommendations
- Recommendation 1: _______________________
- Recommendation 2: _______________________
- Recommendation 3: _______________________

---

## SECTION 11: SIGN-OFF

**Validation Complete:**
- [ ] QA Lead: _____ Date: _____
  - Recommendation: [ ] APPROVE [ ] CONDITIONAL [ ] REJECT
- [ ] Architect Review: _____ Date: _____
  - Assessment: [ ] APPROVED [ ] CHANGES NEEDED
- [ ] PM Approval: _____ Date: _____
  - Decision: [ ] DEPLOY [ ] HOLD [ ] REVISE

---

**Checklist Version:** 1.0
**DNA Mental™ Methodology:** v3.0
**MMOS Mind Mapper:** System Prompt Fidelity Validation
