# Hybrid-Ops Workflow Orchestration Guide

**Story**: 1.8 - Phase 3 Workflow Orchestration
**Version**: 2.0 (with PV Validation Gates)
**Last Updated**: 2025-01-19

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Running Workflows](#running-workflows)
4. [Phase-by-Phase Guide](#phase-by-phase-guide)
5. [Handling Validation Failures](#handling-validation-failures)
6. [Workflow Recovery & Retry](#workflow-recovery--retry)
7. [Best Practices](#best-practices)
8. [Common Scenarios](#common-scenarios)
9. [Troubleshooting](#troubleshooting)
10. [Advanced Topics](#advanced-topics)

---

## Introduction

The Hybrid-Ops workflow orchestrator provides a structured approach to business process automation with embedded quality gates. It integrates Pedro Valério's validation heuristics to ensure high-quality outputs at each critical phase.

### Key Features

- **9-Phase Workflow**: Structured progression from Discovery to Documentation
- **5 Validation Checkpoints**: Strategic quality gates using PV heuristics
- **Mode Toggle**: Choose between PV mode (with validation) or Generic mode (fast)
- **VETO System**: Non-negotiable failure conditions that force quality standards
- **Actionable Feedback**: Context-specific suggestions for validation failures
- **Agent Awareness**: All agents receive workflow context during execution

### When to Use This Workflow

Use the Hybrid-Ops workflow when:
- Designing complex business process automation
- Creating ClickUp workspace structures with AI agents
- Building end-to-end operational systems
- Requiring high-quality, validated outputs
- Collaborating across multiple roles (mapper, architect, designer, engineer)

---

## Getting Started

### Prerequisites

1. **ClickUp MCP Server**: Ensure ClickUp integration is configured
2. **Agent Files**: Verify required PV agent files exist:
   - ✅ `process-mapper-pv.md`
   - ✅ `process-architect-pv.md`
   - ✅ `executor-designer-pv.md`
   - ✅ `clickup-engineer-pv.md`
   - ⚠️ Missing: `qa-validator-pv.md`, `agent-creator-pv.md`, `validation-reviewer-pv.md`, `documentation-writer-pv.md`
3. **Heuristic Files**: PV heuristics compiled and available
4. **Validation Utilities**: `validation-gate.js` and `validation-feedback-generator.js` present

### Installation

```bash
# Ensure workflow file exists
ls .claude/commands/hybridOps/workflows/hybrid-ops-pv.yaml

# Verify utilities
ls .claude/commands/hybridOps/utils/validation-gate.js
ls .claude/commands/hybridOps/utils/workflow-orchestrator.js
ls .claude/commands/hybridOps/utils/validation-feedback-generator.js

# Check heuristic compiler
ls .claude/commands/hybridOps/utils/heuristic-compiler.js
```

---

## Running Workflows

### Mode Selection

When starting a workflow, you'll be prompted to select a mode:

**PV Mode (Recommended)**
```
✅ Quality by construction
✅ 5 validation checkpoints
✅ Actionable feedback on failures
⚠️ ~10% slower execution
⚠️ May abort on critical failures (VETO)
```

**Generic Mode (Fast)**
```
✅ Fastest execution
✅ No validation overhead
⚠️ Lower quality assurance
⚠️ Post-hoc validation required
⚠️ Suitable for prototyping only
```

**Recommendation**: Always use PV mode for production workflows. Only use Generic mode for rapid prototyping or when validation is not critical.

### Starting a Workflow

```javascript
// Option 1: Using workflow orchestrator directly
const { executeWorkflow } = require('./utils/workflow-orchestrator');

const result = await executeWorkflow('hybrid-ops-pv', {
  mode: 'PV', // or 'Generic'
  context: {
    // Initial workflow context
    projectName: 'My Automation Project',
    stakeholders: ['John Doe', 'Jane Smith']
  }
});

// Option 2: Using command interface (if available)
// @hybrid-ops *run --mode=PV
```

### Workflow Execution Flow

```
1. Mode Selection (PV vs Generic)
   ↓
2. Phase 1: Discovery (process-mapper-pv)
   ↓
3. Phase 2: Architecture (process-architect-pv)
   ↓
4. Checkpoint 1: Strategic Alignment (PV_BS_001)
   ↓
5. Phase 3: Executors (executor-designer-pv)
   ↓
6. Checkpoint 2: Coherence Scan (PV_PA_001) - VETO RISK
   ↓
7. Phase 4: Workflows (workflow-designer-pv)
   ↓
8. Checkpoint 3: Automation Readiness (PV_PM_001) - VETO RISK
   ↓
9. Phase 5: QA & Validation (qa-validator-pv) ⚠️ MISSING
   ↓
10. Checkpoint 4: Axioma Compliance
   ↓
11. Checkpoint 5: Task Anatomy Pre-Check
   ↓
12. Phase 6-9: ClickUp Creation, Agents, Review, Documentation
   ↓
13. Workflow Complete
```

---

## Phase-by-Phase Guide

### Phase 1: Discovery
**Agent**: `process-mapper-pv`
**No Validation Gate**

**Objective**: Analyze current state, identify pain points, map stakeholders

**Key Outputs**:
- Current process documentation
- Pain point analysis
- Stakeholder map
- Opportunity assessment

**Tips**:
- Be thorough in discovery - quality here impacts all downstream phases
- Document edge cases and exceptions
- Identify all stakeholders, not just primary users
- Look for hidden inefficiencies

---

### Phase 2: Architecture
**Agent**: `process-architect-pv`
**Validation Gate**: Checkpoint 1 - Strategic Alignment (PV_BS_001)

**Objective**: Design system architecture, define end-state vision

**Key Outputs**:
- System architecture diagram
- End-state vision statement
- Strategic priorities
- Technology stack recommendations

**Validation Criteria**:
- End-state vision clarity ≥0.8
- Strategic priority score ≥0.7
- Recommendation: PROCEED (not DEFER)

**Common Failures**:
- Vision too tactical or short-term
- Market signals prioritized over strategic goals
- Unclear long-term objectives

**How to Pass**:
1. Define clear 3-5 year vision
2. Document strategic architecture explicitly
3. Align priorities with long-term goals
4. Balance market signals with strategic intent

---

### Phase 3: Executors
**Agent**: `executor-designer-pv`
**Validation Gate**: Checkpoint 2 - Coherence Scan (PV_PA_001) 🛑 VETO

**Objective**: Define executor roles, responsibilities, and capabilities

**Key Outputs**:
- Executor definitions with truthfulness scores
- Role descriptions
- Capability matrices
- Coherence assessments

**Validation Criteria**:
- **All executors: truthfulness ≥0.7** (VETO if violated)
- Primary executor: weighted coherence ≥0.8

**VETO Conditions**:
- Any executor with truthfulness <0.7 triggers automatic VETO
- Must replace executor - no [SKIP] option available

**How to Pass**:
1. Assess each executor's domain expertise truthfully
2. Replace low-scoring executors before checkpoint
3. Provide training/onboarding if coherence is low
4. Document executor selection rationale

---

### Phase 4: Workflows
**Agent**: `workflow-designer-pv`
**Validation Gate**: Checkpoint 3 - Automation Readiness (PV_PM_001) 🛑 VETO

**Objective**: Design process workflows, identify automation candidates

**Key Outputs**:
- Process workflow diagrams
- Automation candidate list
- Standardization scores
- Frequency analysis

**Validation Criteria**:
- Frequency: >2x per month
- **Guardrails present** (VETO if missing)
- Standardization ≥0.7

**VETO Conditions**:
- Missing safety guardrails triggers VETO
- Must add error handling, checkpoints, rollback procedures

**How to Pass**:
1. Define at least one safety guardrail per automation
2. Document error handling procedures
3. Create rollback mechanisms
4. Ensure process runs frequently enough to justify automation

---

### Phase 5: QA & Validation
**Agent**: `qa-validator-pv` ⚠️ **FILE MISSING**
**Validation Gate**: Checkpoint 4 - Axioma Compliance

**Objective**: Define quality checks, test strategy, validation rules

**Key Outputs**:
- QA test plan
- Validation rules
- Quality metrics
- Axioma dimension scores

**Validation Criteria**:
- Overall Axioma score ≥7.0/10.0
- No dimension below 6.0/10.0
- 10 dimensions evaluated

**Common Failures**:
- Low scores on Innovation Capacity or Adaptability
- Risk Management below threshold
- Strategic Alignment not carried forward

**How to Pass**:
1. Review all 10 Axioma dimensions
2. Improve lowest-scoring dimensions first
3. Balance across all dimensions - no single weak point
4. Document improvement strategies

---

### Phase 5.5: Task Anatomy Pre-Check
**Validation Gate**: Checkpoint 5 - Task Anatomy

**Objective**: Ensure all tasks have complete, structured definitions

**Validation Criteria**:
- All 8 required fields present in each task:
  1. `task_name`
  2. `status`
  3. `responsible_executor`
  4. `execution_type`
  5. `estimated_time`
  6. `input`
  7. `output`
  8. `action_items`

**Common Failures**:
- Missing `action_items` field
- Incomplete `input` or `output` definitions
- No `estimated_time` provided

**How to Pass**:
1. Review Task Anatomy documentation
2. Complete all 8 fields for every task
3. Use standardized task structure
4. Validate against template before checkpoint

---

### Phase 6: ClickUp Creation
**Agent**: `clickup-engineer-pv`
**No Validation Gate**

**Objective**: Create ClickUp workspace structure with Task Anatomy

**Key Outputs**:
- ClickUp workspace hierarchy
- Tasks with complete Task Anatomy
- Automation triggers configured
- Dependency links established

**Tips**:
- Use Task Anatomy fields validated in Checkpoint 5
- Leverage ClickUp custom fields for Task Anatomy mapping
- Create templates for recurring task types
- Test automation triggers before finalizing

---

### Phases 7-9: Agent Creation, Review, Documentation
**Agents**: Missing (⚠️ `agent-creator-pv`, `validation-reviewer-pv`, `documentation-writer-pv`)
**No Validation Gates**

**Current Status**: These phases are defined but agent files are missing. Workflow will skip or use placeholder logic.

**Workaround**:
- Manually create AI agent definitions
- Perform final review with existing agents
- Generate documentation using template-based approach

---

## Handling Validation Failures

### Understanding Validation Results

When a validation checkpoint fails, you'll receive structured feedback:

```
================================================================================
❌ STRATEGIC ALIGNMENT - VALIDATION FAILED
================================================================================

📋 FAILED CRITERIA:
   1. End-state vision clarity ≥0.8
      • Current value: 0.65
      • Required threshold: 0.8

🔧 SUGGESTED FIXES:
   1. Clarify end-state vision and long-term goals
      • What does success look like in 3-5 years?
      • Document strategic architecture explicitly

📚 DOCUMENTATION:
   • PV_BS_001 Heuristic: docs/heuristics/PV_BS_001-future-back-casting.md
   • Strategic Alignment Guide: docs/guides/strategic-alignment-guide.md

================================================================================
Choose: [FIX] [SKIP VALIDATION] [ABORT WORKFLOW]
================================================================================
```

### Action Options

**[FIX] - Recommended**
1. Stop workflow execution
2. Review detailed feedback and suggestions
3. Update phase outputs to meet criteria
4. Workflow automatically retries checkpoint
5. Continue if checkpoint passes

**When to use**: Always, unless time-critical prototyping

**[SKIP VALIDATION]**
1. Bypass current checkpoint
2. Log failure reason for review
3. Continue workflow with quality warning
4. Risk: suboptimal results in downstream phases

**When to use**: Rapid prototyping, non-critical workflows, time constraints

**[ABORT WORKFLOW]**
1. Immediately stop execution
2. Return partial results up to current phase
3. No subsequent phases executed
4. Safe exit when fundamental issues detected

**When to use**: Critical flaws detected, resources unavailable, requirements changed

---

### VETO Failures (Non-Negotiable)

VETO failures are different - they allow **only two options**:

```
================================================================================
🛑 COHERENCE SCAN - VETO TRIGGERED
================================================================================

⚠️  CRITICAL: Non-negotiable validation failure detected.
    These conditions MUST be fixed before proceeding.

📋 VETO CONDITIONS:
   1. Executor "John Doe" has truthfulness 0.65 < 0.7 (VETO)
      • Current value: 0.65
      • Required threshold: 0.7

🔧 REQUIRED FIXES:
   1. Replace "John Doe" with executor having truthfulness ≥0.7
      • Review executor selection criteria
      • Consider domain expertise alignment
      • Verify coherence with system architecture

📚 DOCUMENTATION:
   • PV_PA_001 Heuristic: docs/heuristics/PV_PA_001-coherence-scan.md

================================================================================
Choose: [FIX VETOES] [ABORT WORKFLOW]
================================================================================
```

**VETO Triggers**:
- Executor truthfulness <0.7 (Coherence Scan)
- Missing safety guardrails (Automation Readiness)
- Axioma dimension <6.0/10.0 (Axioma Compliance)

**VETO Behavior**:
- Workflow halts immediately
- [SKIP] option is NOT available
- Must fix or abort - no shortcuts
- Checkpoint automatically re-runs after fix

---

## Workflow Recovery & Retry

### Automatic Retry

When you choose [FIX] for a validation failure:

1. Workflow pauses at failed checkpoint
2. You make necessary updates to phase outputs
3. Workflow automatically retries validation
4. If successful, workflow continues
5. If still failing, you're prompted again

### Manual Resume

If workflow is interrupted:

```javascript
const { resumeWorkflow } = require('./utils/workflow-orchestrator');

// Resume from last successful phase
const result = await resumeWorkflow('workflow-id', {
  resumeFromPhase: 'phase-3',
  updatedContext: {
    // Your fixes/updates
  }
});
```

### Rollback Procedure

To roll back to a previous phase:

1. Stop current workflow execution
2. Review outputs from target phase
3. Restart workflow from that phase:

```javascript
await executeWorkflow('hybrid-ops-pv', {
  startFromPhase: 'phase-2',
  context: previousPhase2Context
});
```

---

## Best Practices

### 1. Always Use PV Mode for Production

- Generic mode is for prototyping only
- Validation overhead is minimal (~7% avg)
- Quality benefits far outweigh time cost
- Fixing issues early is cheaper than post-hoc fixes

### 2. Prepare for Checkpoints

Before each phase that has a validation gate:
- Review upcoming checkpoint criteria
- Structure outputs to meet requirements
- Document rationale for key decisions
- Test locally before committing

### 3. Fix VETOs Immediately

Don't try to work around VETO conditions:
- They exist to prevent critical quality issues
- Downstream phases will fail anyway
- Fix the root cause, not symptoms
- Use VETO as learning opportunity

### 4. Document All Decisions

Especially for validation failures:
- Why did validation fail?
- What was the fix applied?
- Was [SKIP] used? Why?
- What were the consequences?

### 5. Maintain Agent Context

Agents receive workflow context - leverage it:
```javascript
// Agents automatically receive:
agentContext = {
  workflow: {
    phase: { id, name, description },
    mode: 'PV',
    validation: { next_checkpoint, criteria },
    previous_phases: [...]
  }
}
```

Use this to:
- Structure outputs for validation success
- Reference previous phase results
- Understand upcoming requirements
- Maintain consistency across phases

### 6. Monitor Performance

Track checkpoint execution times:
- Target: <100ms per checkpoint
- Total validation overhead: <500ms
- Memory usage: <50MB increase

If exceeding targets, investigate:
- Complex heuristic logic
- Large context objects
- Inefficient validators

---

## Common Scenarios

### Scenario 1: Strategic Vision Unclear

**Problem**: Phase 2 fails strategic alignment validation

**Solution**:
1. Schedule vision workshop with stakeholders
2. Use Future Back-Casting (PV_BS_001) methodology
3. Document 3-5 year end state
4. Validate with leadership before retry

**Example Fix**:
```javascript
// Before (failed)
context.end_state_vision = 0.65; // Too tactical

// After (passed)
context.end_state_vision = 0.85;
context.vision_statement = "By 2028, fully automated order-to-cash process...";
context.strategic_priorities = [
  { priority: 'Customer Experience', weight: 0.8 },
  { priority: 'Operational Efficiency', weight: 0.7 }
];
```

---

### Scenario 2: Executor Truthfulness VETO

**Problem**: Phase 3 triggers VETO due to low executor truthfulness

**Solution**:
1. Reassess executor selection criteria
2. Replace executor with more experienced alternative
3. Provide training if executor is required
4. Document replacement rationale

**Example Fix**:
```javascript
// Before (VETO)
executors: [
  { name: 'John Doe', truthfulness: 0.65, coherence: 0.85 }
]

// After (passed)
executors: [
  { name: 'Jane Smith', truthfulness: 0.82, coherence: 0.88 },
  // Documented: John moved to training, Jane has 10y domain exp
]
```

---

### Scenario 3: Missing Guardrails VETO

**Problem**: Phase 4 triggers VETO - no safety guardrails defined

**Solution**:
1. Add error handling procedures
2. Create rollback mechanisms
3. Define checkpoint validations
4. Document edge cases

**Example Fix**:
```javascript
// Before (VETO)
context.guardrails = [];

// After (passed)
context.guardrails = [
  {
    name: 'Duplicate Order Check',
    type: 'validation',
    action: 'Block and notify if order ID exists'
  },
  {
    name: 'Rollback on Payment Failure',
    type: 'error_handling',
    action: 'Reverse inventory allocation and notify customer'
  },
  {
    name: 'Manual Review Threshold',
    type: 'checkpoint',
    action: 'Flag orders >$10k for manual approval'
  }
];
```

---

### Scenario 4: Axioma Dimension Below Threshold

**Problem**: Phase 5 fails Axioma validation - Innovation Capacity at 5.8/10.0

**Solution**:
1. Review dimension-specific improvement strategies
2. Add innovative elements to design
3. Balance with other dimensions
4. Document innovation rationale

**Example Fix**:
```javascript
// Before (failed)
context.axioma = {
  'Innovation Capacity': 5.8,
  // other dimensions at 7.0+
};

// After (passed)
context.axioma = {
  'Innovation Capacity': 6.5,
  innovations: [
    'AI-powered demand forecasting',
    'Blockchain-based supply chain tracking',
    'Predictive maintenance algorithms'
  ]
};
```

---

### Scenario 5: Task Anatomy Incomplete

**Problem**: Pre-Phase 6 fails task anatomy validation - missing action items

**Solution**:
1. Review Task Anatomy template
2. Complete all 8 required fields
3. Add detailed action items
4. Validate structure before retry

**Example Fix**:
```javascript
// Before (failed)
tasks: [
  {
    task_name: 'Process Order',
    status: 'pending',
    responsible_executor: 'Order Bot'
    // Missing: execution_type, estimated_time, input, output, action_items
  }
]

// After (passed)
tasks: [
  {
    task_name: 'Process Order',
    status: 'pending',
    responsible_executor: 'Order Bot',
    execution_type: 'automated',
    estimated_time: '2 minutes',
    input: { order_details, customer_info, payment_method },
    output: { order_id, confirmation_status, estimated_delivery },
    action_items: [
      'Validate order details',
      'Check inventory availability',
      'Process payment',
      'Generate confirmation',
      'Notify warehouse'
    ]
  }
]
```

---

## Troubleshooting

### Workflow Stuck at Checkpoint

**Symptoms**:
- Validation fails repeatedly
- Feedback suggests same fixes
- Unable to meet criteria

**Solutions**:
1. Review detailed feedback carefully
2. Consult validation reference documentation
3. Check if requirements are achievable
4. Consider [SKIP] if prototyping (with risk acknowledgment)
5. Escalate to technical lead if criteria seem wrong

**Debug Steps**:
```javascript
// Enable verbose logging
process.env.AIOS_DEBUG = 'true';

// Check validation result details
console.log(JSON.stringify(validationResult, null, 2));

// Review heuristic logic
const heuristic = compiler.compile('PV_BS_001');
console.log(heuristic(context));
```

---

### VETO Cannot Be Cleared

**Symptoms**:
- VETO persists after applying fixes
- Threshold seems unreachable
- Data formatting issues

**Solutions**:
1. Verify data types match expected formats
2. Check for off-by-one errors (0.7 vs 0.70)
3. Review VETO criteria documentation
4. Ensure all fields are present and non-null
5. Test with minimal example first

**Common Issues**:
```javascript
// ❌ Wrong: String instead of number
executor.truthfulness = "0.75";

// ✅ Correct: Number
executor.truthfulness = 0.75;

// ❌ Wrong: Missing field entirely
context.guardrails = undefined;

// ✅ Correct: Empty array if none yet
context.guardrails = [];
```

---

### Mode Toggle Not Working

**Symptoms**:
- PV mode still runs validation when set to Generic
- Generic mode stops at validation gates

**Solutions**:
1. Check workflow YAML mode configuration
2. Verify mode parameter passed correctly:
   ```javascript
   await executeWorkflow('hybrid-ops-pv', { mode: 'PV' }); // or 'Generic'
   ```
3. Clear cached workflow definitions
4. Restart workflow orchestrator

---

### Missing Agent Files

**Symptoms**:
- Workflow fails at Phases 5, 7, 8, or 9
- Error: "Agent file not found"

**Current Status**:
The following PV agent files are missing:
- `qa-validator-pv.md`
- `agent-creator-pv.md`
- `validation-reviewer-pv.md`
- `documentation-writer-pv.md`

**Workarounds**:
1. **Phase 5 (QA)**: Use generic QA agent or manual validation
2. **Phase 7 (Agents)**: Create agent definitions manually
3. **Phase 8 (Review)**: Use existing validation tools
4. **Phase 9 (Docs)**: Generate with template-based approach

**Long-term Solution**:
Create missing PV agent files following existing patterns:
- Study existing PV agents (process-mapper-pv, process-architect-pv, etc.)
- Follow agent template structure
- Include workflow awareness sections
- Add validation checkpoint awareness

---

### Checkpoint Execution Timeout

**Symptoms**:
- Validation takes >100ms
- Workflow feels slow
- Memory usage high

**Solutions**:
1. **Optimize Context Size**:
   ```javascript
   // ❌ Don't pass entire codebase
   context.sourceCode = fs.readFileSync('huge-file.js');

   // ✅ Pass summary only
   context.sourceCodeSummary = generateSummary(sourceCode);
   ```

2. **Cache Heuristic Compilations**:
   - Heuristic compiler should cache compiled functions
   - Check cache hit rate
   - Warm up cache on workflow start

3. **Use Incremental Validation**:
   - Validate incrementally during phase execution
   - Don't wait until phase end
   - Fix issues early

---

## Advanced Topics

### Custom Validation Gates

You can add custom validation checkpoints:

```yaml
phases:
  - id: custom-phase
    name: Custom Phase
    agent: custom-agent
    validation:
      checkpoint: custom-checkpoint
      heuristic: CUSTOM_001  # Your custom heuristic
      criteria:
        - "Custom metric ≥0.8"
      veto_conditions:
        - "Critical field missing"
      feedback_on_failure:
        - "Check custom documentation"
```

### Parallel Phase Execution

For independent phases:

```javascript
const { executePhaseParallel } = require('./utils/workflow-orchestrator');

// Execute phases 7, 8, 9 in parallel (if independent)
const results = await executePhaseParallel([
  { id: 'phase-7', agent: 'agent-creator' },
  { id: 'phase-8', agent: 'validation-reviewer' },
  { id: 'phase-9', agent: 'documentation-writer' }
], sharedContext);
```

### Workflow Composition

Compose workflows from smaller workflows:

```javascript
// Main workflow calls sub-workflows
await executeWorkflow('hybrid-ops-pv', {
  subworkflows: {
    discovery: 'discovery-workflow',
    architecture: 'architecture-workflow'
  }
});
```

---

## Related Documentation

- [Workflow Diagram](./workflow-diagram.md) - Visual workflow representation
- [Validation Gate Reference](./validation-gate-reference.md) - Detailed validator documentation
- [PV Heuristics](../heuristics/) - Individual heuristic documentation
- [Agent Guides](../agents/) - Agent-specific usage guides

---

**Questions or Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review [Common Scenarios](#common-scenarios)
- Consult validation reference for specific checkpoints
- Escalate to technical lead if unresolved

---

*Hybrid-Ops Workflow Orchestration Guide v2.0 - Story 1.8*
