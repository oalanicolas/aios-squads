# Hybrid-Ops Workflow Diagram

**Story**: 1.8 - Phase 3 Workflow Orchestration
**Version**: 2.0 (with PV Validation Gates)
**Last Updated**: 2025-01-19

---

## Complete 9-Phase Workflow with Validation Gates

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        WORKFLOW MODE SELECTION                          │
│                                                                         │
│    ┌──────────────────┐                    ┌──────────────────┐       │
│    │   PV Mode        │                    │  Generic Mode    │       │
│    │  (RECOMMENDED)   │                    │    (FAST)        │       │
│    ├──────────────────┤                    ├──────────────────┤       │
│    │ • 5 Validation   │                    │ • No validation  │       │
│    │   Gates          │                    │ • Faster exec    │       │
│    │ • Quality by     │                    │ • Lower QA       │       │
│    │   construction   │                    │ • Prototyping    │       │
│    │ • May abort on   │                    │                  │       │
│    │   critical fail  │                    │                  │       │
│    └──────────────────┘                    └──────────────────┘       │
│             │                                       │                  │
└─────────────┼───────────────────────────────────────┼──────────────────┘
              │                                       │
              ▼                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         WORKFLOW EXECUTION                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Discovery                                                       │
│ Agent: process-mapper-pv                                                 │
│ Output: Current state analysis, pain points, stakeholders               │
│ Validation: None (discovery phase)                                       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Architecture                                                    │
│ Agent: process-architect-pv                                              │
│ Output: System design, end-state vision, strategic priorities           │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ CHECKPOINT 1                  │
                    │ Strategic Alignment           │
                    ├───────────────────────────────┤
                    │ Heuristic: PV_BS_001          │
                    │ Criteria:                     │
                    │  • End-state vision ≥0.8      │
                    │  • Strategic priority ≥0.7    │
                    │  • Recommendation: PROCEED    │
                    └───────────────────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                         PASS             FAIL
                            │                │
                            │                ▼
                            │    ┌──────────────────────────┐
                            │    │ 🔧 Feedback:             │
                            │    │ • Clarify vision         │
                            │    │ • Align architecture     │
                            │    │ • Reassess priorities    │
                            │    │                          │
                            │    │ Choose: [FIX] [SKIP]     │
                            │    │         [ABORT]          │
                            │    └──────────────────────────┘
                            │                │
                            ◄────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Executors                                                       │
│ Agent: executor-designer-pv                                              │
│ Output: Executor definitions, roles, capabilities, truthfulness         │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ CHECKPOINT 2                  │
                    │ Coherence Scan                │
                    ├───────────────────────────────┤
                    │ Heuristic: PV_PA_001          │
                    │ Criteria:                     │
                    │  • All executors              │
                    │    truthfulness ≥0.7 (VETO)   │
                    │  • Primary executor           │
                    │    weighted coherence ≥0.8    │
                    └───────────────────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                         PASS            VETO!
                            │                │
                            │                ▼
                            │    ┌──────────────────────────┐
                            │    │ 🛑 VETO TRIGGERED        │
                            │    │ • Replace executor       │
                            │    │ • Minimum: 0.7           │
                            │    │ • NON-NEGOTIABLE         │
                            │    │                          │
                            │    │ Choose: [FIX]            │
                            │    │         [ABORT]          │
                            │    └──────────────────────────┘
                            │                │
                            ◄────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: Workflows                                                       │
│ Agent: workflow-designer-pv                                              │
│ Output: Process workflows, automation candidates, standardization       │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ CHECKPOINT 3                  │
                    │ Automation Readiness          │
                    ├───────────────────────────────┤
                    │ Heuristic: PV_PM_001          │
                    │ Criteria:                     │
                    │  • Frequency >2x/month        │
                    │  • Guardrails present (VETO)  │
                    │  • Standardization ≥0.7       │
                    └───────────────────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                         PASS            VETO!
                            │                │
                            │                ▼
                            │    ┌──────────────────────────┐
                            │    │ 🛑 VETO: No Guardrails   │
                            │    │ • Add error handling     │
                            │    │ • Create checkpoints     │
                            │    │ • Establish rollback     │
                            │    │ • Document edge cases    │
                            │    │                          │
                            │    │ Choose: [FIX]            │
                            │    │         [ABORT]          │
                            │    └──────────────────────────┘
                            │                │
                            ◄────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: QA & Validation                                                 │
│ Agent: qa-validator-pv                                                   │
│ Output: Quality checks, test strategy, validation rules                 │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │ CHECKPOINT 4                  │
                    │ Axioma Compliance             │
                    ├───────────────────────────────┤
                    │ Validator: axioma-validator   │
                    │ Criteria:                     │
                    │  • Overall score ≥7.0/10.0    │
                    │  • No dimension <6.0/10.0     │
                    │  • 10 dimensions validated    │
                    └───────────────────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                         PASS             FAIL
                            │                │
                            │                ▼
                            │    ┌──────────────────────────┐
                            │    │ 🔧 Feedback:             │
                            │    │ • Improve low dimensions │
                            │    │ • Address violations     │
                            │    │ • Review systemic gaps   │
                            │    │                          │
                            │    │ Choose: [FIX] [SKIP]     │
                            │    │         [ABORT]          │
                            │    └──────────────────────────┘
                            │                │
                            ◄────────────────┘
                            │
                            ▼
                    ┌───────────────────────────────┐
                    │ CHECKPOINT 5                  │
                    │ Task Anatomy Pre-Check        │
                    ├───────────────────────────────┤
                    │ Validator: task-anatomy       │
                    │ Required Fields (8):          │
                    │  • task_name                  │
                    │  • status                     │
                    │  • responsible_executor       │
                    │  • execution_type             │
                    │  • estimated_time             │
                    │  • input                      │
                    │  • output                     │
                    │  • action_items               │
                    └───────────────────────────────┘
                                    │
                            ┌───────┴────────┐
                            │                │
                         PASS             FAIL
                            │                │
                            │                ▼
                            │    ┌──────────────────────────┐
                            │    │ 🔧 Feedback:             │
                            │    │ • Complete missing fields│
                            │    │ • All 8 fields required  │
                            │    │ • Review Task Anatomy    │
                            │    │                          │
                            │    │ Choose: [FIX] [SKIP]     │
                            │    │         [ABORT]          │
                            │    └──────────────────────────┘
                            │                │
                            ◄────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: ClickUp Creation                                                │
│ Agent: clickup-engineer-pv                                               │
│ Output: ClickUp workspace structure, tasks with Task Anatomy            │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 7: Agent Creation                                                  │
│ Agent: agent-creator-pv                                                  │
│ Output: AI agent definitions, prompts, behaviors                        │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 8: Validation & Review                                             │
│ Agent: validation-reviewer-pv                                            │
│ Output: Final review, validation results, recommendations               │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ PHASE 9: Documentation                                                   │
│ Agent: documentation-writer-pv                                           │
│ Output: Process documentation, runbooks, guides                         │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │   WORKFLOW COMPLETE           │
                    │   Status: COMPLETED           │
                    │   All 5 checkpoints: PASSED   │
                    └───────────────────────────────┘
```

---

## Validation Gate Legend

| Symbol | Meaning |
|--------|---------|
| ✅ PASS | Checkpoint passed, workflow continues |
| ❌ FAIL | Checkpoint failed, user must choose action |
| 🛑 VETO | Non-negotiable failure, MUST fix to proceed |
| 🔧 | Actionable feedback and fix suggestions provided |

---

## Mode Comparison

| Feature | PV Mode | Generic Mode |
|---------|---------|--------------|
| **Validation Gates** | 5 checkpoints | None |
| **Quality Assurance** | By construction | Post-hoc |
| **Execution Speed** | +10% overhead | Fastest |
| **Abort Risk** | Possible (VETO) | None |
| **Recommended For** | Production workflows | Prototyping |
| **Default Mode** | Yes ✅ | No |

---

## Checkpoint Summary

| # | Checkpoint | Phase | Validator | VETO Conditions |
|---|-----------|-------|-----------|-----------------|
| 1 | Strategic Alignment | Phase 2 (Architecture) | PV_BS_001 | None |
| 2 | Coherence Scan | Phase 3 (Executors) | PV_PA_001 | Truthfulness <0.7 |
| 3 | Automation Readiness | Phase 4 (Workflows) | PV_PM_001 | No guardrails |
| 4 | Axioma Compliance | Phase 5 (QA) | axioma-validator | Dimension <6.0 |
| 5 | Task Anatomy | Pre-Phase 6 (ClickUp) | task-anatomy | Missing fields |

---

## User Actions on Validation Failure

When a validation checkpoint fails, the user is prompted with three options:

### [FIX] - Recommended
- Stop workflow execution
- Review detailed feedback with suggestions
- Update phase outputs to meet criteria
- Retry checkpoint
- Continue workflow if checkpoint passes

### [SKIP VALIDATION]
- Bypass the current checkpoint
- Log failure reason
- Continue workflow with quality warning
- **Risk**: May produce suboptimal results

### [ABORT WORKFLOW]
- Immediately stop execution
- Return partial results up to current phase
- No subsequent phases executed
- Safe exit when fundamental issues detected

---

## VETO Behavior

VETO conditions are **non-negotiable**:

1. **VETO Detected**
   - Workflow immediately halts
   - User prompted with ONLY two options: [FIX] or [ABORT]
   - [SKIP] option is NOT available
   - CRITICAL severity

2. **Common VETO Triggers**
   - Executor truthfulness <0.7 (Coherence Scan)
   - Missing safety guardrails (Automation Readiness)
   - Axioma dimension <6.0/10.0 (Axioma Compliance)

3. **Recovery**
   - User MUST address VETO conditions
   - Checkpoint automatically re-runs after fix
   - Workflow continues only if VETO cleared

---

## Workflow Context Available to Agents

All agents receive workflow context during execution:

```javascript
agentContext = {
  workflow: {
    phase: {
      id: 'phase-2',
      name: 'Architecture',
      description: 'System architecture design'
    },
    mode: 'PV',  // or 'Generic'
    validation: {
      next_checkpoint: 'strategic-alignment',
      heuristic: 'PV_BS_001',
      criteria: ['End-state vision clarity ≥0.8', ...],
      veto_conditions: []
    },
    previous_phases: [
      {
        id: 'phase-1',
        name: 'Discovery',
        status: 'COMPLETED',
        output: { ... }
      }
    ]
  }
}
```

This enables agents to:
- Understand current workflow position
- Access previous phase outputs
- Know upcoming validation requirements
- Structure outputs for validation success

---

## Performance Metrics

Based on Phase C.7 performance tests:

| Metric | Target | Actual |
|--------|--------|--------|
| Checkpoint execution time | <100ms | ~50ms avg |
| Total validation overhead | <500ms | ~250ms avg |
| Memory usage increase | <50MB | ~15MB avg |
| Workflow completion time impact | <10% | ~7% avg |

**Conclusion**: PV validation gates add minimal overhead while providing significant quality benefits.

---

## Troubleshooting

### Workflow Stuck at Checkpoint
**Symptom**: Validation fails repeatedly
**Solution**: Review detailed feedback, consult validation reference guide, consider [SKIP] if appropriate

### VETO Cannot Be Cleared
**Symptom**: VETO condition persists after fixes
**Solution**: Review VETO criteria carefully, ensure all requirements met, check for data formatting issues

### Mode Toggle Not Working
**Symptom**: PV mode still runs validation or Generic mode stops at gates
**Solution**: Check workflow YAML mode configuration, verify mode parameter passed correctly

### All Agent Files Verified (✅)
**Status**: All 9 phase agents are now available
**Files**: process-mapper-pv, process-architect-pv, executor-designer-pv, workflow-designer-pv, qa-validator-pv, clickup-engineer-pv, agent-creator-pv, validation-reviewer-pv, documentation-writer-pv

---

**Related Documentation**:
- [Workflow Orchestration Guide](./workflow-orchestration-guide.md)
- [Validation Gate Reference](./validation-gate-reference.md)
- [PV Heuristics Documentation](../heuristics/)

---

*Hybrid-Ops Workflow Diagram v2.0 - Story 1.8*
