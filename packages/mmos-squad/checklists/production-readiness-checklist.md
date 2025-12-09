# Production Readiness Checklist
## Final QA Before Deployment

**Mind Name:** [NOME]
**Version:** v[X.Y]
**Release Manager:** [NOME]
**Target Deployment Date:** YYYY-MM-DD
**Status:** [ ] Not Started [ ] In Progress [ ] Ready [ ] Deployed

---

## Purpose

This checklist ensures all components are production-ready, tested, documented, and deployable. Final gate before mind goes live.

---

## SECTION 1: PIPELINE COMPLETION VERIFICATION

### 1.1 All Stages Complete

**Stage 1: Viability**
- [ ] viability_output.yaml exists and approved
- [ ] APEX score ≥ 5.0
- [ ] ICP score ≥ 6.0
- [ ] GO decision documented
- [ ] Human checkpoint #1 passed

**Stage 2: Research**
- [ ] sources_master.yaml complete
- [ ] Minimum sources collected (15+ total, 5+ Tier 1)
- [ ] Temporal coverage ≥ 60%
- [ ] All Tier 1 sources processed
- [ ] Human checkpoint #2 passed

**Stage 3: Analysis**
- [ ] All 8 DNA Mental™ layers documented
- [ ] All required artifacts created (13+ files)
- [ ] COGNITIVE_SPEC.md complete
- [ ] Triangulation score ≥ 70%
- [ ] Human checkpoint #3 passed

**Stage 4: Synthesis**
- [ ] KB created (500+ chunks for generalista)
- [ ] Templates extracted
- [ ] Communication patterns documented
- [ ] Human checkpoint #4 passed

**Stage 5: Implementation**
- [ ] System prompt(s) created and versioned
- [ ] MIND_BRIEF.md complete
- [ ] All specialists created (if applicable)
- [ ] Human checkpoint #5 passed

**Stage 6: Testing**
- [ ] Fidelity testing complete (85%+ score)
- [ ] validation_report.yaml exists
- [ ] All critical issues resolved
- [ ] Human checkpoint #6 passed

**Pipeline Completion:** _____ / 6 stages (Requirement: 6/6)

**Status:** [ ] COMPLETE [ ] INCOMPLETE (blocking)

---

## SECTION 2: FILE STRUCTURE VALIDATION

### 2.1 ACS V3.0 Compliance

**Root Structure:**
```
minds/[mind_name]/
├── sources/
├── artifacts/
├── kb/
├── docs/
├── system_prompts/
└── specialists/ (if applicable)
```

**Sources Directory:**
- [ ] sources_master.yaml exists
- [ ] Source files organized by type
- [ ] All Tier 1 sources accessible

**Artifacts Directory (FLAT):**
- [ ] personality_profile.json
- [ ] cognitive_architecture.yaml
- [ ] behavioral_patterns.md
- [ ] mental_models.md
- [ ] decision_architecture.yaml
- [ ] values_hierarchy.yaml
- [ ] belief_system.md
- [ ] contradictions_map.md
- [ ] unique_algorithm.md
- [ ] communication_templates.md
- [ ] signature_phrases.md
- [ ] linguistic_forensics.md
- [ ] recognition_patterns.md

**Minimum Artifacts:** 13/13 required

**KB Directory (FLAT):**
- [ ] Chunks exist (500+ for generalista)
- [ ] All chunks formatted in Markdown
- [ ] Naming convention: chunk_NNN.md
- [ ] Cross-references functional

**Docs Directory:**
- [ ] README.md
- [ ] MIND_BRIEF.md
- [ ] COGNITIVE_SPEC.md
- [ ] PRD.md
- [ ] logs/ subdirectory with stage outputs

**System Prompts Directory:**
- [ ] Versioned prompts exist
- [ ] Naming: YYYYMMDD-HHMM-vX.Y-generalista/specialist-[descriptor].md
- [ ] Latest version clearly identified

**Specialists Directory (if applicable):**
- [ ] Each specialist has own subdirectory
- [ ] Each has kb/ and system_prompts/
- [ ] Structure mirrors main mind

**Structure Compliance:** [ ] PASS [ ] FAIL (blocking)

---

## SECTION 3: NAMING CONVENTION COMPLIANCE

### 3.1 Snake_Case Verification

**File/Directory Names:**
- [ ] All use snake_case (no hyphens, camelCase, or spaces)
- [ ] Timestamps: YYYYMMDD-HHMM format
- [ ] Versions: vX.Y format
- [ ] No special characters except underscore and hyphen (in timestamps)

**Random Sampling (10 files):**
1. _____ [ ] Compliant [ ] Non-compliant
2. _____ [ ] Compliant [ ] Non-compliant
3. _____ [ ] Compliant [ ] Non-compliant
4. _____ [ ] Compliant [ ] Non-compliant
5. _____ [ ] Compliant [ ] Non-compliant
[Continue for 10 files]

**Naming Compliance:** [ ] PASS [ ] FAIL

---

## SECTION 4: DOCUMENTATION QUALITY

### 4.1 Core Documents Complete

**MIND_BRIEF.md:**
- [ ] All sections filled out
- [ ] Status: APPROVED
- [ ] All checkpoints documented
- [ ] Single source of truth maintained
- [ ] Version current

**COGNITIVE_SPEC.md:**
- [ ] All 8 layers documented
- [ ] Evidence cited
- [ ] Confidence levels assigned
- [ ] Gaps acknowledged
- [ ] Implementation notes complete

**PRD.md:**
- [ ] Requirements clear
- [ ] Use cases defined
- [ ] Success metrics specified
- [ ] Sign-offs obtained

**README.md:**
- [ ] Overview clear
- [ ] Use cases explained
- [ ] Limitations noted
- [ ] Version info current

**Documentation Score:** [ ] EXCELLENT [ ] GOOD [ ] NEEDS IMPROVEMENT

---

## SECTION 5: FIDELITY & QUALITY METRICS

### 5.1 Test Results Validation

**Fidelity Testing:**
- [ ] Overall fidelity score: _____ % (Minimum: 85%)
- [ ] All layers tested: 8/8
- [ ] Communication style: _____ % (Minimum: 90%)
- [ ] Consistency: _____ % (Minimum: 80%)
- [ ] Edge cases: _____ % (Minimum: 80%)

**Blind Testing (if conducted):**
- [ ] Accuracy: _____ % (Target: 85%+)
- [ ] Evaluator feedback: Positive/Mixed/Negative

**Quality Metrics:**
- [ ] Triangulation score: _____ % (Minimum: 70%)
- [ ] Source credibility: _____ % primary (Target: 60%+)
- [ ] Temporal coverage: _____ % (Minimum: 60%)
- [ ] Layer confidence average: _____ % (Minimum: 75%)

**Metrics Status:** [ ] ALL PASS [ ] SOME BELOW THRESHOLD (action: _____)

---

## SECTION 6: ISSUE RESOLUTION

### 6.1 Critical Issues

**From Testing:**
- [ ] Number of critical issues: _____ (Requirement: 0)
- [ ] All resolved: [ ] Yes [ ] No (blocking if No)

**List Critical Issues (if any):**
1. Issue: _____ Status: _____ Resolution: _____
2. Issue: _____ Status: _____ Resolution: _____

**Critical Status:** [ ] CLEAR [ ] BLOCKING

### 6.2 Major Issues

**From Testing:**
- [ ] Number of major issues: _____
- [ ] Resolved: _____ / _____
- [ ] Accepted as-is (with justification): _____ / _____

**Outstanding Major Issues:**
1. Issue: _____ Impact: _____ Acceptance: _____
2. Issue: _____ Impact: _____ Acceptance: _____

**Major Issues Status:** [ ] ACCEPTABLE [ ] NEEDS ATTENTION

### 6.3 Minor Issues

- [ ] Number of minor issues: _____
- [ ] Fix target: [immediate/next version/backlog]

**Minor Issues Status:** [ ] DOCUMENTED [ ] IGNORED

---

## SECTION 7: PERFORMANCE & TECHNICAL VALIDATION

### 7.1 System Prompt Performance

**Technical Checks:**
- [ ] Prompt size: _____ tokens (Acceptable: <30K tokens)
- [ ] No syntax errors
- [ ] All placeholders filled
- [ ] No broken references
- [ ] Activation instructions clear

**KB Performance:**
- [ ] Chunk retrieval tested: [ ] Pass [ ] Fail
- [ ] Search functionality: [ ] Pass [ ] Fail
- [ ] Average chunks per query: _____ (Target: 5-10)
- [ ] Relevance score: _____ % (Target: 80%+)

**Integration:**
- [ ] KB integrates with system prompt: [ ] Yes [ ] No
- [ ] Specialist handoffs work (if applicable): [ ] Yes [ ] No [ ] N/A
- [ ] Context maintenance across turns: [ ] Yes [ ] No

**Performance Status:** [ ] PASS [ ] CONDITIONAL [ ] FAIL

---

## SECTION 8: DEPLOYMENT READINESS

### 8.1 Deployment Package

**Required Files:**
- [ ] System prompt(s) finalized
- [ ] KB uploaded and indexed
- [ ] MIND_BRIEF.md published
- [ ] README.md user-facing
- [ ] validation_report.yaml archived

**Deployment Configuration:**
- [ ] Target platform: _____ (Claude Pro/API/Custom/etc)
- [ ] KB integration method: _____ (Projects/RAG/etc)
- [ ] Access controls: [ ] Public [ ] Limited [ ] Private
- [ ] Version control: [ ] Setup [ ] N/A

**Rollback Plan:**
- [ ] Backup of all files created
- [ ] Rollback procedure documented
- [ ] Rollback trigger defined
- [ ] Restoration tested: [ ] Yes [ ] No [ ] N/A

**Deployment Readiness:** [ ] READY [ ] NOT READY

### 8.2 User-Facing Materials

**End-User Documentation:**
- [ ] Quick start guide: [ ] Created [ ] N/A
- [ ] Use case examples: [ ] Created [ ] N/A
- [ ] Limitations clearly stated
- [ ] Contact/support info: [ ] Provided [ ] N/A

**Marketing Materials (if applicable):**
- [ ] Description/bio written
- [ ] Key capabilities highlighted
- [ ] Differentiators clear
- [ ] Target audience defined

**User Materials Status:** [ ] COMPLETE [ ] SUFFICIENT [ ] NEEDS WORK

---

## SECTION 9: BROWNFIELD PREPARATION

### 9.1 Future Update Strategy

**Monitoring:**
- [ ] Source monitoring strategy defined
- [ ] Update frequency: [ ] Quarterly [ ] Semi-annual [ ] Annual [ ] As-needed
- [ ] Alert system: [ ] Setup [ ] Planned [ ] N/A

**Brownfield Workflow:**
- [ ] Team trained on brownfield_plan.yaml usage
- [ ] Incremental update process understood
- [ ] Regression testing plan defined

**Continuous Improvement:**
- [ ] User feedback collection method: _____
- [ ] Quality monitoring metrics: _____
- [ ] Improvement cycle: _____

**Brownfield Readiness:** [ ] PREPARED [ ] BASIC [ ] NOT PREPARED

---

## SECTION 10: LEGAL & COMPLIANCE

### 10.1 Legal Review

**Legal Status:**
- [ ] Legal viability confirmed (Stage 1)
- [ ] No active litigation
- [ ] Educational use documented
- [ ] Attribution appropriate

**Compliance:**
- [ ] Privacy considerations addressed
- [ ] Ethical guidelines followed
- [ ] Bias mitigation documented
- [ ] Representation concerns addressed

**Legal/Compliance Status:** [ ] CLEARED [ ] CONDITIONAL [ ] BLOCKING

---

## SECTION 11: STAKEHOLDER APPROVALS

### 11.1 Sign-Offs Required

**Technical Approvals:**
- [ ] QA Lead: _____ Date: _____ [ ] APPROVED
- [ ] Cognitive Analyst: _____ Date: _____ [ ] APPROVED
- [ ] System Prompt Architect: _____ Date: _____ [ ] APPROVED

**Business Approvals:**
- [ ] Product Manager: _____ Date: _____ [ ] APPROVED
- [ ] Legal (if required): _____ Date: _____ [ ] APPROVED [ ] N/A

**Final Approval:**
- [ ] Release Manager: _____ Date: _____ [ ] APPROVED

**All Approvals Obtained:** [ ] YES [ ] NO (blocking)

---

## SECTION 12: DEPLOYMENT CHECKLIST

### 12.1 Pre-Deployment

**24 Hours Before:**
- [ ] All approvals obtained
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] Rollback plan ready
- [ ] Backup verified

**1 Hour Before:**
- [ ] Final file check
- [ ] Platform access confirmed
- [ ] Monitoring tools ready
- [ ] Team on standby

### 12.2 Deployment Steps

**Step 1: Upload System Prompt**
- [ ] Prompt uploaded to platform
- [ ] Version tagged correctly
- [ ] Activation tested

**Step 2: Deploy Knowledge Base**
- [ ] KB uploaded/indexed
- [ ] Retrieval tested
- [ ] Integration verified

**Step 3: Publish Documentation**
- [ ] User-facing docs published
- [ ] Access links working
- [ ] Support channels ready

**Step 4: Smoke Testing**
- [ ] 5 test queries run
- [ ] Responses checked for quality
- [ ] No errors detected

**Step 5: Go Live**
- [ ] Access opened to users
- [ ] Monitoring active
- [ ] Team on standby (2 hours)

**Deployment Complete:** [ ] YES [ ] NO

---

## SECTION 13: POST-DEPLOYMENT MONITORING

### 13.1 First 48 Hours

**Monitoring Plan:**
- [ ] Response quality sampling: Every _____ hours
- [ ] User feedback collection: [ ] Active
- [ ] Error tracking: [ ] Active
- [ ] Performance metrics: [ ] Tracked

**Health Checks:**
- [ ] Hour 2: [ ] Pass [ ] Issues: _____
- [ ] Hour 6: [ ] Pass [ ] Issues: _____
- [ ] Hour 24: [ ] Pass [ ] Issues: _____
- [ ] Hour 48: [ ] Pass [ ] Issues: _____

**Issues Detected:**
- Issue 1: _____ Severity: _____ Action: _____
- Issue 2: _____ Severity: _____ Action: _____

**Rollback Triggered:** [ ] YES (reason: _____) [ ] NO

### 13.2 First Week Review

**Week 1 Metrics:**
- [ ] User satisfaction: _____ / 10
- [ ] Response quality (sampled): _____ %
- [ ] Errors/failures: _____ (Target: <1%)
- [ ] User feedback: [summary]

**Week 1 Status:** [ ] STABLE [ ] ISSUES [ ] ROLLED BACK

---

## SECTION 14: PRODUCTION STATUS

### 14.1 Final Checklist

**All Prerequisites Met:**
- [ ] Pipeline 100% complete (6/6 stages)
- [ ] File structure compliant (ACS v3.0)
- [ ] Fidelity score ≥ 85%
- [ ] All critical issues resolved
- [ ] Documentation complete
- [ ] All approvals obtained
- [ ] Deployment successful
- [ ] 48h monitoring passed

**Production Status:** [ ] LIVE [ ] CONDITIONAL [ ] BLOCKED [ ] ROLLED BACK

### 14.2 Version Registration

**Official Version:**
- Version: v[X.Y]
- Deployment Date: YYYY-MM-DD
- Status: [PRODUCTION/BETA/ALPHA]
- Next Review: YYYY-MM-DD

**Registered In:**
- [ ] Version control system
- [ ] Mind portfolio tracking
- [ ] Documentation hub
- [ ] User-facing catalog

---

## SECTION 15: HANDOFF & MAINTENANCE

### 15.1 Handoff to Ops Team

**Handoff Package:**
- [ ] Complete file structure
- [ ] All documentation
- [ ] Monitoring setup
- [ ] Support runbook
- [ ] Escalation procedure
- [ ] Brownfield update guide

**Training:**
- [ ] Ops team trained: [ ] Yes [ ] Scheduled
- [ ] Support team briefed: [ ] Yes [ ] Scheduled

**Handoff Complete:** [ ] YES [ ] IN PROGRESS

### 15.2 Ongoing Maintenance

**Scheduled Activities:**
- [ ] Quarterly quality check
- [ ] Source monitoring
- [ ] User feedback review
- [ ] Performance tuning
- [ ] Security updates (if applicable)

**Maintenance Plan:** [ ] DEFINED [ ] NEEDS DEFINITION

---

## NOTES

**Special considerations, deployment notes, or lessons learned:**

___________________________________________________________________
___________________________________________________________________
___________________________________________________________________

---

## FINAL SIGN-OFF

**Production Deployment Approved:**

- [ ] Release Manager: _____ Date: _____
  - **Decision:** [ ] DEPLOY TO PRODUCTION [ ] HOLD [ ] ROLLBACK

**Deployment Timestamp:** YYYYMMDD-HHMM

**Production Status:** [ ] LIVE [ ] PENDING [ ] CANCELLED

---

**Checklist Version:** 1.0
**DNA Mental™ Methodology:** v3.0
**MMOS Mind Mapper:** Production Readiness & Deployment
