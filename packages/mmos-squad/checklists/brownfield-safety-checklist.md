# Brownfield Safety Checklist
## Update Safety Checks & Rollback Verification

**Mind Name:** [NOME]
**Current Version:** v[X.Y]
**Target Version:** v[X.Y+1]
**Update Coordinator:** [NOME]
**Date:** YYYY-MM-DD
**Status:** [ ] Planning [ ] In Progress [ ] Complete [ ] Rolled Back

---

## Purpose

This checklist ensures safe incremental updates to existing minds without breaking production quality or losing established fidelity. Validates backup, testing, and rollback procedures before making changes.

---

## SECTION 1: PRE-UPDATE SAFETY

### 1.1 Backup Verification

**Complete Backup Created:**
- [ ] Backup timestamp: YYYYMMDD-HHMM
- [ ] Backup location: _____________________________
- [ ] Backup includes:
  - [ ] All sources/ files
  - [ ] All artifacts/ files
  - [ ] All kb/ chunks
  - [ ] All docs/ files
  - [ ] All system_prompts/ files
  - [ ] All specialists/ (if applicable)
- [ ] Backup verified (restoration test): [ ] Pass [ ] Not tested
- [ ] Backup size: _____ MB (expected: _____ MB)

**Backup Status:** [ ] COMPLETE & VERIFIED [ ] INCOMPLETE (blocking)

**⚠️ STOP POINT:** Do not proceed without verified backup.

### 1.2 Version Control

**Current State Documented:**
- [ ] Current version tagged: v[X.Y]
- [ ] Git commit (if applicable): _____
- [ ] MIND_BRIEF.md status: APPROVED
- [ ] Last validation_report.yaml: Date _____
- [ ] Production metrics baseline: [ ] Captured [ ] N/A

**Baseline Metrics:**
- Fidelity score: _____ %
- User satisfaction: _____ / 10
- Response quality: _____ %
- Consistency: _____ %

**Version Control Status:** [ ] DOCUMENTED [ ] INCOMPLETE

---

## SECTION 2: CHANGE IMPACT ASSESSMENT

### 2.1 Scope of Changes

**Change Type:**
- [ ] NEW SOURCES (adding new material)
- [ ] DRIFT CORRECTION (fixing identified issues)
- [ ] QUALITY IMPROVEMENT (enhancing existing)
- [ ] MINOR UPDATE (cosmetic/documentation)
- [ ] MAJOR REVISION (significant changes)

**Layers Affected:**
- [ ] Layer 1: _____ (None/Minor/Moderate/Major)
- [ ] Layer 2: _____ (None/Minor/Moderate/Major)
- [ ] Layer 3: _____ (None/Minor/Moderate/Major)
- [ ] Layer 4: _____ (None/Minor/Moderate/Major)
- [ ] Layer 5: _____ (None/Minor/Moderate/Major)
- [ ] Layer 6: _____ (None/Minor/Moderate/Major)
- [ ] Layer 7: _____ (None/Minor/Moderate/Major)
- [ ] Layer 8: _____ (None/Minor/Moderate/Major)

**Impact Level:** [ ] LOW [ ] MEDIUM [ ] HIGH [ ] CRITICAL

**Risk Assessment:**
- Regression risk: [ ] LOW [ ] MEDIUM [ ] HIGH
- User impact: [ ] MINIMAL [ ] MODERATE [ ] SIGNIFICANT
- Rollback complexity: [ ] EASY [ ] MODERATE [ ] DIFFICULT

---

## SECTION 3: BROWNFIELD PLAN VALIDATION

### 3.1 Plan Document Complete

**brownfield_plan.yaml:**
- [ ] File exists and complete
- [ ] All sections filled out:
  - [ ] Executive summary
  - [ ] Change analysis
  - [ ] Layer impact assessment
  - [ ] Artifact update plan
  - [ ] Execution plan (all phases)
  - [ ] Prompts to re-execute
  - [ ] Risk assessment
  - [ ] Rollback plan
  - [ ] Testing plan
  - [ ] Success criteria

**Plan Quality:**
- [ ] Impact analysis detailed and justified
- [ ] All affected files identified
- [ ] Effort estimated
- [ ] Dependencies mapped
- [ ] Timeline realistic

**Plan Status:** [ ] APPROVED [ ] NEEDS REVISION [ ] INCOMPLETE

### 3.2 Stakeholder Review

**Plan Reviewed By:**
- [ ] Cognitive Analyst: _____ Date: _____ [ ] Approved
- [ ] System Prompt Architect: _____ Date: _____ [ ] Approved
- [ ] Product Manager: _____ Date: _____ [ ] Approved

**Concerns Raised:**
- Concern 1: _____ Resolution: _____
- Concern 2: _____ Resolution: _____

**Stakeholder Status:** [ ] ALL APPROVED [ ] PENDING [ ] CONCERNS

---

## SECTION 4: SAFETY GATES

### 4.1 Core Values Protection

**⚠️ CRITICAL: Values MUST NOT Change**

**Values Hierarchy Check:**
- [ ] Current hierarchy documented: _____
- [ ] New sources challenge values: [ ] No [ ] Yes (requires review)
- [ ] If yes, resolution strategy: _____
- [ ] Values remain intact after changes: [ ] Confirmed [ ] TBD

**Core Beliefs Check:**
- [ ] All core beliefs documented: _____
- [ ] Changes would affect beliefs: [ ] No [ ] Yes (requires review)
- [ ] If yes, contradiction resolution: _____
- [ ] Beliefs remain consistent: [ ] Confirmed [ ] TBD

**Values Safety:** [ ] PROTECTED [ ] AT RISK (action: _____) [ ] VIOLATED (blocking)

**⚠️ STOP POINT:** Values violations are BLOCKING. Do not proceed.

### 4.2 Personality Continuity

**Communication Style:**
- [ ] Tone remains consistent: [ ] Yes [ ] Changes (document: _____)
- [ ] Signature phrases preserved: [ ] Yes [ ] Evolving (acceptable)
- [ ] Vocabulary level same: [ ] Yes [ ] Changes (justify: _____)

**Cognitive Patterns:**
- [ ] Primary frameworks unchanged: [ ] Yes [ ] Refined (acceptable)
- [ ] Core obsessions stable: [ ] Yes [ ] Evolved (document: _____)
- [ ] Unique algorithm preserved: [ ] Yes [ ] Enhanced (acceptable)

**Personality Continuity:** [ ] MAINTAINED [ ] ACCEPTABLE EVOLUTION [ ] BREAKING CHANGE (review)

### 4.3 Fidelity Floor Protection

**Minimum Fidelity Thresholds:**
- [ ] Post-update fidelity must be ≥ baseline - 5%
- [ ] Layer 4 (values) must remain ≥ 90%
- [ ] Communication style must remain ≥ 85%
- [ ] No new critical issues introduced

**Fidelity Protection:** [ ] THRESHOLDS SET [ ] NOT DEFINED

---

## SECTION 5: TESTING REQUIREMENTS

### 5.1 Regression Test Suite

**Mandatory Regression Tests:**
- [ ] Core personality traits (10 tests)
- [ ] Communication style (5 tests)
- [ ] Framework application (3 tests per framework)
- [ ] Value consistency (3 tests)
- [ ] Edge cases (previous failures)

**Test Suite Prepared:**
- [ ] Test cases documented
- [ ] Expected outcomes defined (from baseline)
- [ ] Pass thresholds set (≥90% match baseline)
- [ ] Test environment ready

**Regression Tests:** [ ] READY [ ] IN PROGRESS [ ] NOT PREPARED

### 5.2 New Capability Testing

**If Adding New Capabilities:**
- [ ] New behaviors documented
- [ ] Test cases created
- [ ] Success criteria defined
- [ ] Non-interference verified (doesn't break existing)

**New Tests:** [ ] READY [ ] N/A

### 5.3 Comparison Testing

**Side-by-Side Validation:**
- [ ] Same queries to old and new versions
- [ ] Sample size: _____ queries (Minimum: 20)
- [ ] Quality comparison method: _____
- [ ] Acceptance: New ≥ Old quality

**Comparison Tests:** [ ] PLANNED [ ] NOT PLANNED

---

## SECTION 6: INCREMENTAL EXECUTION

### 6.1 Phase-by-Phase Safety

**Phase 1: Preparation**
- [ ] Backup verified
- [ ] Plan approved
- [ ] Team briefed
- [ ] Rollback ready

**Phase 2: Analysis (if needed)**
- [ ] New sources processed
- [ ] Contradictions identified
- [ ] Resolution strategy defined
- [ ] Review checkpoint: [ ] Pass [ ] Fail

**Phase 3: Synthesis (if needed)**
- [ ] Artifacts updated
- [ ] KB modified
- [ ] Changes documented
- [ ] Review checkpoint: [ ] Pass [ ] Fail

**Phase 4: Implementation**
- [ ] System prompt revised
- [ ] Version incremented
- [ ] Changes logged
- [ ] Review checkpoint: [ ] Pass [ ] Fail

**Phase 5: Testing**
- [ ] Regression tests run: [ ] Pass [ ] Fail
- [ ] New tests run: [ ] Pass [ ] Fail [ ] N/A
- [ ] Comparison done: [ ] Acceptable [ ] Concerns
- [ ] Review checkpoint: [ ] Pass [ ] Fail

**Phase 6: Deployment**
- [ ] Staged deployment (test environment first)
- [ ] Smoke tests: [ ] Pass [ ] Fail
- [ ] Limited rollout: [ ] Pass [ ] Fail
- [ ] Full deployment: [ ] Yes [ ] Hold [ ] Rollback

**Execution Status:** Current Phase: _____ Status: [ ] On Track [ ] Issues [ ] Blocked

---

## SECTION 7: ROLLBACK PROCEDURES

### 7.1 Rollback Triggers

**Automatic Rollback If:**
- [ ] Critical test failure (values/safety)
- [ ] Fidelity drops >10% from baseline
- [ ] Production errors >5% in first hour
- [ ] User complaints spike (>5 negative in first day)

**Manual Rollback If:**
- [ ] Major quality degradation observed
- [ ] Unintended behavior changes
- [ ] Stakeholder veto
- [ ] Technical issues

**Rollback Triggers Defined:** [ ] YES [ ] NO

### 7.2 Rollback Procedure

**Step-by-Step Rollback:**

**Step 1: Decision (Immediate)**
- [ ] Rollback decision made by: _____
- [ ] Reason documented: _____
- [ ] Stakeholders notified

**Step 2: Restoration (15 minutes)**
- [ ] Restore from backup
- [ ] Verify file integrity
- [ ] Re-deploy previous version
- [ ] Test restoration

**Step 3: Verification (30 minutes)**
- [ ] Previous functionality restored: [ ] Yes [ ] No
- [ ] Baseline metrics confirmed: [ ] Yes [ ] No
- [ ] Users notified of rollback

**Step 4: Post-Mortem (24 hours)**
- [ ] Root cause analysis
- [ ] Lessons learned documented
- [ ] Plan revised
- [ ] Retry date scheduled (if applicable)

**Rollback Procedure:** [ ] DOCUMENTED [ ] TESTED [ ] NOT READY

### 7.3 Rollback Test

**Pre-Update Rollback Dry Run:**
- [ ] Backup restoration tested
- [ ] Time to restore: _____ minutes (Target: <15)
- [ ] Restoration verified: [ ] Pass [ ] Fail
- [ ] Rollback procedure clear to team

**Rollback Readiness:** [ ] VERIFIED [ ] NOT TESTED (high risk)

**⚠️ RECOMMENDATION:** Always test rollback before making changes.

---

## SECTION 8: MONITORING & ALERTS

### 8.1 Update Monitoring Plan

**During Update (real-time):**
- [ ] Progress tracking: [ ] Active
- [ ] Error monitoring: [ ] Active
- [ ] Team communication: [ ] Channel open

**Post-Update (48 hours):**
- [ ] Response quality sampling: Every _____ hours
- [ ] Baseline comparison: [ ] Scheduled
- [ ] User feedback: [ ] Collecting
- [ ] Error rate: [ ] Tracking

**Monitoring Setup:** [ ] ACTIVE [ ] PLANNED [ ] NOT SETUP

### 8.2 Alert Conditions

**Immediate Alert If:**
- [ ] Any test failure in Phase 5
- [ ] Fidelity score drops >5% from baseline
- [ ] Values consistency fails
- [ ] Critical error detected
- [ ] User complaints spike

**Alert Recipients:**
- Primary: _____
- Secondary: _____
- Escalation: _____

**Alerts Configured:** [ ] YES [ ] NO

---

## SECTION 9: DOCUMENTATION REQUIREMENTS

### 9.1 Change Documentation

**Required Docs:**
- [ ] CHANGELOG.md updated
  - [ ] Version incremented
  - [ ] Changes summarized
  - [ ] Date documented
- [ ] MIND_BRIEF.md updated
  - [ ] Version history section
  - [ ] Changes reflected
- [ ] version_history in artifacts updated
- [ ] brownfield_plan.yaml completed (lessons learned)

**Documentation Status:** [ ] CURRENT [ ] NEEDS UPDATE

### 9.2 Audit Trail

**Traceability:**
- [ ] All changes have justification
- [ ] Source of new information documented
- [ ] Decision points recorded
- [ ] Review checkpoints logged
- [ ] Test results archived

**Audit Trail:** [ ] COMPLETE [ ] INCOMPLETE

---

## SECTION 10: SUCCESS CRITERIA

### 10.1 Update Success Criteria

**Required for Success:**
- [ ] All regression tests pass (≥90%)
- [ ] Fidelity score ≥ baseline - 5%
- [ ] No values violations
- [ ] No critical issues
- [ ] User feedback neutral or positive
- [ ] Performance maintained

**Desired for Success:**
- [ ] Fidelity improved (>baseline)
- [ ] New capabilities working
- [ ] User feedback positive
- [ ] Process smooth (no major delays)

**Success Evaluation:**
- [ ] All required criteria met: [ ] Yes [ ] No
- [ ] Most desired criteria met: [ ] Yes [ ] Some [ ] No

**Update Success:** [ ] SUCCESS [ ] CONDITIONAL [ ] FAILURE [ ] ROLLED BACK

---

## SECTION 11: POST-UPDATE REVIEW

### 11.1 Results Validation

**Final Metrics (vs Baseline):**
- Fidelity score: _____ % (baseline: _____ %) Change: _____
- User satisfaction: _____ / 10 (baseline: _____) Change: _____
- Response quality: _____ % (baseline: _____ %) Change: _____
- Consistency: _____ % (baseline: _____ %) Change: _____

**Regression Test Results:**
- Total tests: _____
- Passed: _____ (Target: ≥90%)
- Failed: _____ (Acceptable: ≤10%)
- Pass rate: _____ %

**Results Status:** [ ] EXCELLENT [ ] ACCEPTABLE [ ] CONCERNING [ ] FAILURE

### 11.2 Lessons Learned

**What Worked Well:**
1. _____
2. _____
3. _____

**What Could Improve:**
1. _____
2. _____
3. _____

**For Next Brownfield Update:**
1. _____
2. _____
3. _____

**Process Improvements:**
- [ ] Update brownfield_plan.yaml template
- [ ] Update this checklist
- [ ] Brief team on learnings
- [ ] Document in knowledge base

---

## SECTION 12: FINAL APPROVAL

### 12.1 Update Validation

**All Safety Gates Passed:**
- [ ] Backup verified
- [ ] Plan approved
- [ ] Values protected
- [ ] Personality continuity maintained
- [ ] Regression tests passed
- [ ] Rollback tested
- [ ] Monitoring active

**Update Approved:**
- [ ] Update Coordinator: _____ Date: _____
- [ ] Cognitive Analyst: _____ Date: _____
- [ ] PM Approval: _____ Date: _____

**Final Status:** [ ] APPROVED & COMPLETE [ ] CONDITIONAL [ ] FAILED & ROLLED BACK

### 12.2 Version Registration

**New Version Official:**
- Version: v[X.Y+1]
- Update Completed: YYYY-MM-DD HH:MM
- Status: [ ] PRODUCTION [ ] STAGED [ ] ROLLED BACK
- Next Review: YYYY-MM-DD

**Post-Update Actions:**
- [ ] Update tracked in version control
- [ ] Stakeholders notified
- [ ] Documentation published
- [ ] Monitoring continues (7 days)

---

## SECTION 13: CONTINUOUS IMPROVEMENT

### 13.1 Next Brownfield Update

**Planning for Future:**
- [ ] Source monitoring active
- [ ] Update frequency: [ ] Quarterly [ ] Semi-annual [ ] Annual [ ] As-needed
- [ ] Alert system for new sources: [ ] Active [ ] N/A
- [ ] Next scheduled review: YYYY-MM-DD

**Continuous Improvement:** [ ] PLANNED [ ] AD-HOC

---

## NOTES

**Special observations, challenges, or recommendations for future updates:**

___________________________________________________________________
___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## EMERGENCY CONTACTS

**If Issues Arise:**
- Update Coordinator: _____ [contact]
- Technical Lead: _____ [contact]
- PM (escalation): _____ [contact]
- After-hours: _____ [contact]

---

**Checklist Version:** 1.0
**DNA Mental™ Methodology:** v3.0
**MMOS Mind Mapper:** Brownfield Safety & Rollback Verification
