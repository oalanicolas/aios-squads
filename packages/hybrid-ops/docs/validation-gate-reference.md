# Validation Gate Reference

**Story**: 1.8 - Phase 3 Workflow Orchestration
**Version**: 2.0 (with PV Validation Gates)
**Last Updated**: 2025-01-19

---

## Table of Contents

1. [Overview](#overview)
2. [Validation System Architecture](#validation-system-architecture)
3. [Checkpoint Reference](#checkpoint-reference)
4. [PV Heuristics](#pv-heuristics)
5. [Special Validators](#special-validators)
6. [Criteria Types](#criteria-types)
7. [VETO Conditions](#veto-conditions)
8. [Feedback Interpretation](#feedback-interpretation)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Appendix](#appendix)

---

## Overview

The Hybrid-Ops validation system uses **5 strategic checkpoints** to ensure quality at critical workflow phases. Each checkpoint uses either a **PV heuristic** (Pedro Valério's validation logic) or a **special validator** (Axioma, Task Anatomy) to evaluate phase outputs.

### Validation Philosophy

- **Quality by Construction**: Catch issues early, not post-hoc
- **Actionable Feedback**: Every failure includes fix suggestions
- **Non-Negotiable Standards**: VETO conditions enforce critical thresholds
- **Context-Specific**: Validation aware of phase context and history
- **Minimal Overhead**: Target <100ms per checkpoint

### Checkpoint Summary

| # | Checkpoint | Phase | Validator | VETO? | Purpose |
|---|-----------|-------|-----------|-------|---------|
| 1 | Strategic Alignment | Architecture | PV_BS_001 | No | Ensure vision clarity |
| 2 | Coherence Scan | Executors | PV_PA_001 | Yes | Validate executor quality |
| 3 | Automation Readiness | Workflows | PV_PM_001 | Yes | Confirm safety guardrails |
| 4 | Axioma Compliance | QA | axioma-validator | Yes* | 10-dimension quality check |
| 5 | Task Anatomy | Pre-ClickUp | task-anatomy | No | Validate task structure |

*Axioma VETO only if any dimension <6.0/10.0

---

## Validation System Architecture

### Components

```
┌─────────────────────────────────────────────┐
│  Phase Execution                            │
│  (process-architect-pv, etc.)               │
└──────────────────┬──────────────────────────┘
                   │ Phase Output
                   ▼
┌─────────────────────────────────────────────┐
│  Validation Gate Executor                   │
│  (validation-gate.js)                       │
│  • Load validation config from workflow     │
│  • Execute heuristic or validator           │
│  • Evaluate criteria                        │
│  • Check VETO conditions                    │
└──────────────────┬──────────────────────────┘
                   │ Validation Result
                   ▼
┌─────────────────────────────────────────────┐
│  Feedback Generator                         │
│  (validation-feedback-generator.js)         │
│  • Generate context-specific feedback       │
│  • Add documentation links                  │
│  • Format for user consumption              │
└──────────────────┬──────────────────────────┘
                   │ Formatted Feedback
                   ▼
┌─────────────────────────────────────────────┐
│  User Decision                              │
│  [FIX] [SKIP] [ABORT]                       │
└─────────────────────────────────────────────┘
```

### Workflow Integration

```yaml
phases:
  - id: phase-2
    name: Architecture
    agent: process-architect-pv
    validation:
      checkpoint: strategic-alignment
      heuristic: PV_BS_001
      criteria:
        - "End-state vision clarity ≥0.8"
        - "Strategic priority score ≥0.7"
      veto_conditions: []
      feedback_on_failure:
        - "Clarify end-state vision"
        - "Align architecture with strategic priorities"
```

---

## Checkpoint Reference

### Checkpoint 1: Strategic Alignment
**Phase**: Architecture (Phase 2)
**Validator**: PV_BS_001 (Future System Back-Casting)
**VETO Risk**: None

#### Purpose

Ensures the system architecture aligns with long-term strategic vision rather than short-term tactical needs. Uses future back-casting methodology to validate vision clarity.

#### Validation Criteria

1. **End-state vision clarity ≥0.8**
   - Measures: How clearly the future state is defined
   - Scale: 0.0 (undefined) to 1.0 (crystal clear)
   - Threshold: 0.8 (80% clarity required)

2. **Strategic priority score ≥0.7**
   - Measures: Alignment between architecture and strategic goals
   - Scale: 0.0 (misaligned) to 1.0 (perfect alignment)
   - Threshold: 0.7 (70% alignment required)

3. **Recommendation: PROCEED or REVIEW**
   - Heuristic must recommend proceeding
   - DEFER recommendation = automatic failure

#### Context Requirements

```javascript
context = {
  end_state_vision: 0.85,        // Required: vision clarity score
  market_signals: 0.6,           // Optional: market alignment
  strategic_priority: 0.75,      // Required: priority score
  vision_statement: "...",       // Recommended: textual description
  architecture_diagram: "...",   // Recommended: visual representation
  time_horizon: "3-5 years"      // Recommended: planning window
}
```

#### Common Failures

- **Vision too tactical**: Focused on immediate needs, not long-term state
- **Market-driven**: Prioritizing market signals over strategic intent
- **Unclear objectives**: Vision statement vague or contradictory

#### Fix Strategies

1. **Clarify Vision**:
   - Define 3-5 year end state explicitly
   - Document what success looks like
   - Align team understanding

2. **Strategic Priority**:
   - Review strategic goals vs architecture
   - Ensure architecture serves vision, not tactics
   - Balance market signals with strategic direction

3. **Documentation**:
   - Create visual architecture diagrams
   - Write vision statement
   - Define success metrics

#### Related Documentation

- Heuristic: `docs/heuristics/PV_BS_001-future-back-casting.md`
- Guide: `docs/guides/strategic-alignment-guide.md`

---

### Checkpoint 2: Coherence Scan
**Phase**: Executors (Phase 3)
**Validator**: PV_PA_001 (Systemic Coherence Scan)
**VETO Risk**: 🛑 Yes - Truthfulness <0.7

#### Purpose

Validates that all executors (human or AI agents) have sufficient domain expertise and truthfulness to perform assigned roles. Prevents low-quality executors from degrading system performance.

#### Validation Criteria

1. **All executors: truthfulness ≥0.7** 🛑 VETO
   - Measures: Domain expertise and reliability
   - Scale: 0.0 (no expertise) to 1.0 (expert)
   - Threshold: 0.7 (minimum acceptable expertise)
   - **VETO**: Any executor below 0.7 triggers non-negotiable failure

2. **Primary executor: weighted coherence ≥0.8**
   - Measures: Alignment with system architecture
   - Scale: 0.0 (incoherent) to 1.0 (perfectly coherent)
   - Threshold: 0.8 (80% coherence for primary executor)

#### Context Requirements

```javascript
context = {
  executors: [
    {
      name: 'Jane Smith',
      role: 'Order Processor',
      truthfulness: 0.82,      // Required: expertise score
      coherence: 0.88,         // Required: system alignment
      domain_experience: '10y', // Recommended: background
      training_completed: true  // Recommended: readiness
    },
    // ... more executors
  ]
}
```

#### VETO Conditions

**Trigger**: Any executor with `truthfulness < 0.7`

**Behavior**:
- Workflow halts immediately
- [SKIP] option NOT available
- Must [FIX VETOES] or [ABORT WORKFLOW]

**Rationale**: Low-expertise executors will cause downstream failures. Better to catch now than fail later.

#### Common Failures

- **Inexperienced executor**: Domain expertise insufficient for role
- **Wrong role assignment**: Executor assigned outside expertise area
- **Insufficient training**: Executor not onboarded to system

#### Fix Strategies

1. **Replace Executor**:
   - Find executor with truthfulness ≥0.7
   - Verify domain expertise matches role
   - Document replacement rationale

2. **Provide Training**:
   - If executor is required but low-scoring
   - Onboard to system architecture
   - Reassess after training

3. **Reassign Roles**:
   - Move executor to role matching expertise
   - Adjust responsibilities to match capability
   - Update coherence assessment

#### Related Documentation

- Heuristic: `docs/heuristics/PV_PA_001-coherence-scan.md`
- Guide: `docs/guides/executor-coherence-guide.md`

---

### Checkpoint 3: Automation Readiness
**Phase**: Workflows (Phase 4)
**Validator**: PV_PM_001 (Automation Tipping Point)
**VETO Risk**: 🛑 Yes - Missing guardrails

#### Purpose

Determines if a process is ready for automation using tipping point analysis. Prevents automating processes that are too risky, infrequent, or unstandardized.

#### Validation Criteria

1. **Frequency: >2 times per month**
   - Measures: How often process runs
   - Threshold: 2x/month minimum
   - Rationale: Automation overhead not justified for rare processes

2. **Guardrails present** 🛑 VETO
   - Measures: Safety mechanisms defined
   - Threshold: At least one guardrail required
   - **VETO**: No guardrails = automatic failure

3. **Standardization ≥0.7**
   - Measures: Process consistency
   - Scale: 0.0 (ad-hoc) to 1.0 (fully standardized)
   - Threshold: 0.7 (70% standardization)

#### Context Requirements

```javascript
context = {
  frequency: 15,                    // Required: runs per month
  standardization: 0.8,             // Required: consistency score
  guardrails: [                     // Required: safety mechanisms
    {
      name: 'Duplicate Check',
      type: 'validation',
      action: 'Block duplicate orders'
    },
    {
      name: 'Rollback on Error',
      type: 'error_handling',
      action: 'Reverse on payment failure'
    }
  ],
  edge_cases: [...],                // Recommended: documented exceptions
  error_rate: 0.02                  // Recommended: historical error rate
}
```

#### VETO Conditions

**Trigger**: `guardrails` array is empty or undefined

**Behavior**:
- Workflow halts immediately
- [SKIP] option NOT available
- Must [FIX VETOES] or [ABORT WORKFLOW]

**Rationale**: Automating without safety mechanisms is dangerous. Prevents runaway automation failures.

#### Common Failures

- **No guardrails**: Safety mechanisms not defined
- **Low frequency**: Process doesn't run often enough
- **Unstandardized**: Too many exceptions and edge cases

#### Fix Strategies

1. **Add Guardrails** (VETO fix):
   - Error handling: What happens on failure?
   - Validation: How to prevent bad inputs?
   - Checkpoints: Where to pause for review?
   - Rollback: How to undo partial execution?

2. **Increase Frequency**:
   - Batch infrequent operations
   - Combine with similar processes
   - Wait until process matures

3. **Standardize Process**:
   - Document standard operating procedure
   - Reduce exceptions
   - Codify decision logic

#### Guardrail Types

| Type | Purpose | Example |
|------|---------|---------|
| **Validation** | Prevent bad inputs | Duplicate order check |
| **Error Handling** | Recover from failures | Rollback on payment failure |
| **Checkpoint** | Manual review points | Approve orders >$10k |
| **Rate Limiting** | Prevent overload | Max 100 orders/hour |
| **Monitoring** | Detect anomalies | Alert on 5% error rate |

#### Related Documentation

- Heuristic: `docs/heuristics/PV_PM_001-automation-tipping-point.md`
- Guide: `docs/guides/automation-readiness-guide.md`

---

### Checkpoint 4: Axioma Compliance
**Phase**: QA & Validation (Phase 5)
**Validator**: axioma-validator
**VETO Risk**: ⚠️ Yes - If any dimension <6.0/10.0

#### Purpose

Evaluates quality across 10 dimensions using the Axioma framework. Ensures balanced, high-quality outputs before proceeding to implementation.

#### The 10 Axioma Dimensions

1. **Truthfulness** (Factual Accuracy)
   - Information is accurate and verifiable
   - No misleading or false claims

2. **Coherence** (Logical Consistency)
   - Ideas connect logically
   - No internal contradictions

3. **Strategic Alignment** (Vision Fit)
   - Supports long-term strategic goals
   - Not just tactical quick wins

4. **Operational Excellence** (Execution Quality)
   - Well-designed processes
   - Efficient resource usage

5. **Innovation Capacity** (Creativity)
   - Novel approaches or ideas
   - Not just following templates

6. **Risk Management** (Safety)
   - Risks identified and mitigated
   - Contingency plans in place

7. **Resource Optimization** (Efficiency)
   - Minimal waste
   - Balanced resource allocation

8. **Stakeholder Value** (Impact)
   - Benefits clear stakeholders
   - Positive ROI

9. **Sustainability** (Long-term Viability)
   - Can be maintained over time
   - Scales with growth

10. **Adaptability** (Flexibility)
    - Can adjust to changing conditions
    - Not brittle or rigid

#### Validation Criteria

1. **Overall score ≥7.0/10.0**
   - Average across all 10 dimensions
   - Threshold: 7.0 (70% quality)

2. **No dimension below 6.0/10.0** ⚠️ VETO
   - Every dimension must score at least 6.0
   - Prevents single weak point from degrading system

3. **10 dimensions validated**
   - All dimensions must be evaluated
   - Cannot skip dimensions

#### Context Requirements

```javascript
context = {
  axioma: {
    'Truthfulness': 8.0,
    'Coherence': 7.5,
    'Strategic Alignment': 7.2,
    'Operational Excellence': 8.5,
    'Innovation Capacity': 6.8,
    'Risk Management': 7.0,
    'Resource Optimization': 7.3,
    'Stakeholder Value': 8.2,
    'Sustainability': 7.1,
    'Adaptability': 6.5
  },
  // Optional: evidence for each dimension
  evidence: {
    'Truthfulness': ['Source 1', 'Verification method'],
    // ...
  }
}
```

#### VETO Conditions

**Trigger**: Any dimension scores <6.0/10.0

**Behavior**:
- Workflow halts immediately
- [SKIP] option NOT available
- Must [FIX VETOES] or [ABORT WORKFLOW]

**Rationale**: Single weak dimension can undermine entire system. Must maintain minimum quality across all areas.

#### Common Failures

- **Low Innovation**: Replicating existing solutions without improvement
- **Poor Risk Management**: Risks not identified or mitigated
- **Weak Adaptability**: System too rigid to handle changes

#### Fix Strategies (By Dimension)

**Truthfulness** (if <6.0):
- Verify all claims with sources
- Remove speculative statements
- Add citations and evidence

**Coherence** (if <6.0):
- Resolve contradictions
- Clarify logical flow
- Connect disparate ideas

**Strategic Alignment** (if <6.0):
- Review against strategic vision
- Align priorities with long-term goals
- Remove tactical distractions

**Operational Excellence** (if <6.0):
- Streamline processes
- Reduce complexity
- Improve efficiency

**Innovation Capacity** (if <6.0):
- Add creative elements
- Consider alternative approaches
- Benchmark against industry leaders

**Risk Management** (if <6.0):
- Identify all risks
- Create mitigation plans
- Add contingencies

**Resource Optimization** (if <6.0):
- Eliminate waste
- Balance resource allocation
- Improve utilization

**Stakeholder Value** (if <6.0):
- Clarify benefits
- Quantify ROI
- Identify all affected stakeholders

**Sustainability** (if <6.0):
- Plan for maintenance
- Ensure scalability
- Document dependencies

**Adaptability** (if <6.0):
- Add configuration options
- Design for change
- Reduce coupling

#### Scoring Guidelines

| Score | Interpretation | Action |
|-------|---------------|--------|
| 9.0-10.0 | Excellent | Minimal improvement needed |
| 7.0-8.9 | Good | Minor enhancements recommended |
| 6.0-6.9 | Acceptable | Moderate improvements suggested |
| <6.0 | **VETO** | **Must fix before proceeding** |

#### Related Documentation

- Framework: `docs/frameworks/axioma-quality-framework.md`
- Dimension Guides: `docs/guides/axioma-dimensions/`

---

### Checkpoint 5: Task Anatomy
**Phase**: Pre-ClickUp Creation (Phase 5.5)
**Validator**: task-anatomy
**VETO Risk**: No (but all tasks must pass)

#### Purpose

Ensures all tasks have complete, structured definitions before ClickUp creation. Prevents incomplete or ambiguous task specifications.

#### The 8 Required Fields

1. **task_name**
   - Clear, descriptive task title
   - Example: "Process Customer Order"

2. **status**
   - Current task state
   - Values: pending, in-progress, done, blocked

3. **responsible_executor**
   - Who performs the task
   - Human name or agent ID

4. **execution_type**
   - How task is executed
   - Values: manual, automated, hybrid

5. **estimated_time**
   - Expected duration
   - Format: "X minutes" or "Y hours"

6. **input**
   - What task receives
   - Object or array of input fields

7. **output**
   - What task produces
   - Object or array of output fields

8. **action_items**
   - Step-by-step instructions
   - Array of strings

#### Validation Criteria

1. **All 8 fields present in each task**
   - Every task must have all fields
   - No missing or undefined fields

2. **Field values valid**
   - status: one of allowed values
   - execution_type: one of allowed values
   - estimated_time: parseable duration
   - action_items: non-empty array

#### Context Requirements

```javascript
context = {
  tasks: [
    {
      task_name: 'Process Customer Order',
      status: 'pending',
      responsible_executor: 'Order Processing Agent',
      execution_type: 'automated',
      estimated_time: '2 minutes',
      input: {
        order_details: 'object',
        customer_info: 'object',
        payment_method: 'string'
      },
      output: {
        order_id: 'string',
        confirmation_status: 'boolean',
        estimated_delivery: 'date'
      },
      action_items: [
        'Validate order details against schema',
        'Check inventory availability for all items',
        'Process payment using configured gateway',
        'Generate order confirmation number',
        'Send confirmation email to customer',
        'Notify warehouse of new order'
      ]
    },
    // ... more tasks
  ]
}
```

#### Common Failures

- **Missing action_items**: Most common - step-by-step instructions not provided
- **Incomplete input/output**: Fields not specified or vague
- **No estimated_time**: Duration not estimated

#### Fix Strategies

1. **Use Task Anatomy Template**:
   ```javascript
   const taskTemplate = {
     task_name: '',
     status: 'pending',
     responsible_executor: '',
     execution_type: 'automated',
     estimated_time: '',
     input: {},
     output: {},
     action_items: []
   };
   ```

2. **Complete action_items**:
   - Break task into 5-10 specific steps
   - Use imperative verbs (Validate, Check, Process, Send)
   - Make steps testable and verifiable

3. **Specify input/output**:
   - List all required input fields
   - Define output structure
   - Include data types

#### Task Anatomy Best Practices

**Good Task Example**:
```javascript
{
  task_name: 'Validate Customer Eligibility',
  status: 'pending',
  responsible_executor: 'Eligibility Checker Agent',
  execution_type: 'automated',
  estimated_time: '30 seconds',
  input: {
    customer_id: 'string',
    product_type: 'string',
    order_amount: 'number'
  },
  output: {
    eligible: 'boolean',
    eligibility_reasons: 'array[string]',
    credit_limit: 'number'
  },
  action_items: [
    'Retrieve customer credit history from database',
    'Check customer payment history for last 12 months',
    'Verify customer credit limit vs order amount',
    'Validate product type eligibility rules',
    'Calculate final eligibility score',
    'Return eligibility decision with detailed reasons'
  ]
}
```

**Bad Task Example** (will fail):
```javascript
{
  task_name: 'Check Customer',
  status: 'pending',
  responsible_executor: 'Agent',
  // Missing: execution_type, estimated_time, input, output, action_items
}
```

#### Related Documentation

- Template: `docs/templates/task-anatomy-template.md`
- Guide: `docs/guides/task-creation-guide.md`

---

## PV Heuristics

### PV_BS_001: Future System Back-Casting

**Type**: Strategic Planning Heuristic
**Author**: Pedro Valério
**Purpose**: Validate strategic vision clarity using future back-casting methodology

#### Methodology

1. **Define Future State** (3-5 years out)
   - What does the ideal end state look like?
   - What problems are solved?
   - What capabilities exist?

2. **Work Backwards**
   - What needs to exist immediately before?
   - What are the dependencies?
   - What's the critical path?

3. **Validate Present Alignment**
   - Does current architecture support future state?
   - Are we building the right foundation?
   - Are we avoiding premature optimization?

#### Scoring Algorithm

```javascript
function PV_BS_001(context) {
  const vision_clarity = context.end_state_vision || 0;
  const market_alignment = context.market_signals || 0;
  const strategic_priority = context.strategic_priority || 0;

  // Weighted scoring
  const weighted_score = (
    vision_clarity * 0.5 +        // 50% weight on vision
    strategic_priority * 0.4 +    // 40% weight on priority
    market_alignment * 0.1        // 10% weight on market
  );

  // Recommendation logic
  let recommendation;
  if (vision_clarity >= 0.8 && strategic_priority >= 0.7) {
    recommendation = 'PROCEED';
  } else if (vision_clarity >= 0.6 && strategic_priority >= 0.5) {
    recommendation = 'REVIEW';
  } else {
    recommendation = 'DEFER';
  }

  return {
    recommendation,
    weighted_score: weighted_score * 10, // Scale to 0-10
    score: weighted_score * 10
  };
}
```

#### When to Use

- Phase 2 (Architecture) validation
- Any strategic decision point
- Long-term planning validation

#### Related Documentation

- Full Heuristic: `docs/heuristics/PV_BS_001-future-back-casting.md`

---

### PV_PA_001: Systemic Coherence Scan

**Type**: Executor Validation Heuristic
**Author**: Pedro Valério
**Purpose**: Validate executor quality and system coherence

#### Methodology

1. **Assess Truthfulness**
   - Domain expertise level
   - Track record in similar roles
   - Training and certification

2. **Measure Coherence**
   - Alignment with system architecture
   - Understanding of dependencies
   - Integration with other executors

3. **Check VETO Conditions**
   - Any executor below 0.7 truthfulness?
   - Primary executor below 0.8 coherence?

#### Scoring Algorithm

```javascript
function PV_PA_001(context) {
  const executors = context.executors || [];

  // Check VETO first
  const low_truthfulness = executors.filter(e => e.truthfulness < 0.7);
  if (low_truthfulness.length > 0) {
    return {
      recommendation: 'DEFER',
      vetoes: low_truthfulness.map(e => ({
        type: 'truthfulness',
        executor: e.name,
        value: e.truthfulness,
        threshold: 0.7
      })),
      score: 0
    };
  }

  // Calculate weighted coherence
  const primary_executor = executors[0];
  const weighted_coherence = primary_executor
    ? primary_executor.coherence
    : 0;

  const recommendation = weighted_coherence >= 0.8
    ? 'PROCEED'
    : 'DEFER';

  return {
    recommendation,
    weighted_score: weighted_coherence * 10,
    score: weighted_coherence * 10
  };
}
```

#### VETO Triggers

- `executor.truthfulness < 0.7` for any executor
- Non-negotiable - must fix

#### When to Use

- Phase 3 (Executors) validation
- Team capability assessments
- Role assignment validation

#### Related Documentation

- Full Heuristic: `docs/heuristics/PV_PA_001-coherence-scan.md`

---

### PV_PM_001: Automation Tipping Point

**Type**: Process Automation Heuristic
**Author**: Pedro Valério
**Purpose**: Determine if process is ready for automation

#### Methodology

1. **Frequency Analysis**
   - How often does process run?
   - Is automation overhead justified?
   - Threshold: 2x/month minimum

2. **Guardrail Assessment**
   - Are safety mechanisms defined?
   - Can failures be contained?
   - Can actions be rolled back?

3. **Standardization Evaluation**
   - How consistent is the process?
   - Are exceptions documented?
   - Is decision logic codified?

#### Scoring Algorithm

```javascript
function PV_PM_001(context) {
  const frequency = context.frequency || 0;
  const guardrails = context.guardrails || [];
  const standardization = context.standardization || 0;

  // Check VETO: no guardrails
  if (guardrails.length === 0) {
    return {
      recommendation: 'DEFER',
      vetoes: [{
        type: 'guardrails',
        message: 'Missing safety guardrails (VETO)'
      }],
      score: 0
    };
  }

  // Check frequency
  if (frequency < 2) {
    return {
      recommendation: 'DEFER',
      score: standardization * 10,
      reason: 'Frequency too low to justify automation'
    };
  }

  // Check standardization
  const recommendation = standardization >= 0.7
    ? 'AUTOMATE'
    : 'DEFER';

  return {
    recommendation,
    score: standardization * 10
  };
}
```

#### VETO Triggers

- `guardrails` array empty or undefined
- Automation without safety is dangerous

#### When to Use

- Phase 4 (Workflows) validation
- Any automation decision
- Process readiness assessments

#### Related Documentation

- Full Heuristic: `docs/heuristics/PV_PM_001-automation-tipping-point.md`

---

## Special Validators

### Axioma Validator

**Purpose**: 10-dimensional quality framework validation
**Implementation**: `validation-gate.js` lines 198-236
**Checkpoints**: Checkpoint 4 (Axioma Compliance)

#### Algorithm

```javascript
function validateAxiomaCompliance(context, validationConfig) {
  const dimensions = [
    'Truthfulness', 'Coherence', 'Strategic Alignment',
    'Operational Excellence', 'Innovation Capacity', 'Risk Management',
    'Resource Optimization', 'Stakeholder Value', 'Sustainability', 'Adaptability'
  ];

  // Get scores from context or default to 7.0
  const axioma = context.axioma || {};
  const scores = dimensions.map(dim => axioma[dim] || 7.0);

  // Calculate overall and minimum
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);

  // Check VETO: any dimension <6.0
  const vetoes = [];
  if (minScore < 6.0) {
    const weakDimension = dimensions[scores.indexOf(minScore)];
    vetoes.push({
      type: 'axioma_minimum',
      dimension: weakDimension,
      value: minScore,
      threshold: 6.0
    });
  }

  return {
    score: overallScore,
    minScore,
    dimensions: Object.fromEntries(dimensions.map((dim, idx) => [dim, scores[idx]])),
    vetoes,
    validatorName: 'axioma-validator'
  };
}
```

#### Configuration

```yaml
validation:
  checkpoint: axioma-compliance
  validator: axioma-validator
  criteria:
    - "Overall score ≥7.0/10.0"
    - "No dimension below 6.0/10.0"
    - "10 dimensions validated"
  veto_conditions:
    - "dimension_score < 6.0"
```

---

### Task Anatomy Validator

**Purpose**: Ensure complete task definitions
**Implementation**: `validation-gate.js` lines 241-272
**Checkpoints**: Checkpoint 5 (Task Anatomy)

#### Algorithm

```javascript
function validateTaskAnatomy(context, validationConfig) {
  const requiredFields = [
    'task_name', 'status', 'responsible_executor', 'execution_type',
    'estimated_time', 'input', 'output', 'action_items'
  ];

  const tasks = context.tasks || [];
  const vetoes = [];
  const missingFields = {};

  tasks.forEach((task, idx) => {
    const taskMissing = requiredFields.filter(
      field => !task[field] && !task[field.toLowerCase()]
    );

    if (taskMissing.length > 0) {
      missingFields[task.name || `Task ${idx + 1}`] = taskMissing;
      vetoes.push({
        type: 'missing_fields',
        task: task.name || `Task ${idx + 1}`,
        missing: taskMissing
      });
    }
  });

  return {
    score: tasks.length > 0
      ? ((tasks.length - vetoes.length) / tasks.length) * 10
      : 0,
    totalTasks: tasks.length,
    compliantTasks: tasks.length - vetoes.length,
    missingFields,
    vetoes,
    validatorName: 'task-anatomy'
  };
}
```

#### Configuration

```yaml
validation:
  checkpoint: task-anatomy-check
  validator: task-anatomy
  required_fields:
    - Name
    - Status
    - Assignee
    - Due Date
    - Dependencies
    - Automation Trigger
    - Validation Criteria
```

---

## Criteria Types

### Numeric Criteria

Format: `"Field name ≥threshold"`

**Operators**:
- `≥` or `>=`: Greater than or equal
- `>`: Greater than
- `≤` or `<=`: Less than or equal
- `<`: Less than
- `=` or `==`: Equal

**Examples**:
```yaml
criteria:
  - "End-state vision clarity ≥0.8"
  - "Frequency >2"
  - "Overall score ≥7.0/10.0"
```

**Evaluation**:
```javascript
// Parse criterion
const match = criterion.match(/(.+?)\s*([≥>=<≤]+)\s*(\d+\.?\d*)/);
const [, field, operator, threshold] = match;

// Get actual value from context
const actualValue = context[field] || validationResult.score;

// Compare
const passed = compareValues(actualValue, operator, parseFloat(threshold));
```

---

### Boolean Criteria

Format: `"Field description (VETO)"`

**Examples**:
```yaml
criteria:
  - "Guardrails present (VETO)"
  - "Task Anatomy fields present"
```

**Evaluation**:
```javascript
// Check for presence
if (criterion.includes('Guardrails present')) {
  const hasGuardrails = context.guardrails && context.guardrails.length > 0;
  return { passed: hasGuardrails, actual: hasGuardrails ? 'Present' : 'Missing' };
}
```

---

### Recommendation Criteria

Format: `"Recommendation is X or Y"`

**Examples**:
```yaml
criteria:
  - "Recommendation is PROCEED or REVIEW (not DEFER)"
  - "Recommendation: AUTOMATE"
```

**Evaluation**:
```javascript
const recommendation = validationResult.recommendation;
const allowedValues = ['PROCEED', 'REVIEW'];
const passed = allowedValues.includes(recommendation);
```

---

## VETO Conditions

### What is a VETO?

A **VETO** is a non-negotiable validation failure that **forces** the user to fix the issue before proceeding. Unlike regular failures (where [SKIP] is allowed), VETO failures offer only:
- **[FIX VETOES]**: Fix the issue and retry
- **[ABORT WORKFLOW]**: Stop execution

### VETO Philosophy

VETOs exist to prevent **critical quality failures** that would:
1. Cause downstream phase failures
2. Create safety or security risks
3. Violate fundamental requirements
4. Produce unusable outputs

**Principle**: Better to halt now than fail catastrophically later.

---

### VETO Conditions by Checkpoint

#### Checkpoint 2: Coherence Scan
**VETO**: `truthfulness < 0.7`

**Rationale**: Executor with insufficient domain expertise will:
- Make poor decisions
- Require excessive oversight
- Delay or block workflow
- Produce low-quality outputs

**Fix**: Replace with qualified executor or provide intensive training

---

#### Checkpoint 3: Automation Readiness
**VETO**: `guardrails.length === 0`

**Rationale**: Automation without safety mechanisms will:
- Cause uncontrolled failures
- Be unable to rollback errors
- Lack error detection
- Create operational risks

**Fix**: Define at least one guardrail per automation type (validation, error handling, checkpoint, etc.)

---

#### Checkpoint 4: Axioma Compliance
**VETO**: Any dimension `< 6.0/10.0`

**Rationale**: Single weak dimension can:
- Undermine entire system
- Create single point of failure
- Cause rejection by stakeholders
- Prevent scaling or maintenance

**Fix**: Improve weak dimension to at least 6.0

---

### VETO Detection Flow

```
┌─────────────────────────────────┐
│ Execute Validation              │
│ (heuristic or validator)        │
└────────────┬────────────────────┘
             │
             ▼
   ┌─────────────────────┐
   │ Check VETO          │
   │ Conditions          │
   └─────┬───────┬───────┘
         │       │
      VETO     NO VETO
         │       │
         ▼       ▼
   ┌─────────┐ ┌──────────────┐
   │ HALT    │ │ Check        │
   │ workflow│ │ Criteria     │
   └─────────┘ └──────────────┘
         │              │
         ▼              ▼
   [FIX VETOES]   [FIX] [SKIP] [ABORT]
   [ABORT]
```

---

## Feedback Interpretation

### Feedback Structure

All validation failures use a consistent format:

```
================================================================================
🛑 [CHECKPOINT NAME] - [FAILURE TYPE]
================================================================================

[Severity Warning]

📋 [FAILED CONDITIONS]:
   • Specific failures listed
   • With actual vs expected values

🔧 [FIX SUGGESTIONS]:
   1. Context-specific improvement strategies
   2. Step-by-step instructions
   3. Best practices

📚 DOCUMENTATION:
   • Link to relevant heuristic documentation
   • Link to improvement guides
   • Link to related resources

================================================================================
Choose: [ACTION OPTIONS]
================================================================================
```

---

### Feedback Sections

#### 1. Header
- **Checkpoint Name**: Which validation failed
- **Failure Type**: VALIDATION FAILED or VETO TRIGGERED
- **Severity**: ❌ (Major) or 🛑 (Critical)

#### 2. Failed Conditions
Lists specific criteria that didn't pass:
```
📋 FAILED CRITERIA:
   1. End-state vision clarity ≥0.8
      • Current value: 0.65
      • Required threshold: 0.8
      • Gap: 0.15 (19% below threshold)
```

#### 3. Fix Suggestions
Context-specific actionable advice:
```
🔧 SUGGESTED FIXES:
   1. Clarify end-state vision and long-term goals
      • What does success look like in 3-5 years?
      • Document strategic architecture explicitly
      • Align team understanding of future state
```

#### 4. Documentation Links
References to detailed guides:
```
📚 DOCUMENTATION:
   • PV_BS_001 Heuristic: docs/heuristics/PV_BS_001-future-back-casting.md
   • Strategic Alignment Guide: docs/guides/strategic-alignment-guide.md
```

#### 5. Action Options
What you can do next:
- Regular failure: `[FIX] [SKIP VALIDATION] [ABORT WORKFLOW]`
- VETO failure: `[FIX VETOES] [ABORT WORKFLOW]`

---

### Interpreting Scores

#### Heuristic Scores (0-10 scale)

| Score | Interpretation | Typical Action |
|-------|---------------|----------------|
| 9.0-10.0 | Excellent | Proceed with confidence |
| 7.0-8.9 | Good | Minor improvements recommended |
| 6.0-6.9 | Acceptable | Moderate improvements suggested |
| 5.0-5.9 | Below threshold | Must improve to pass |
| <5.0 | Poor | Significant rework needed |

#### Axioma Dimensions (0-10 scale)

| Score | Quality Level | Action Required |
|-------|--------------|-----------------|
| 8.0-10.0 | High | Maintain standards |
| 6.0-7.9 | Medium | Incremental improvements |
| <6.0 | **VETO** | **Must fix immediately** |

#### Truthfulness (0-1 scale)

| Score | Expertise Level | Action |
|-------|----------------|--------|
| 0.9-1.0 | Expert | Ideal executor |
| 0.7-0.89 | Competent | Acceptable |
| <0.7 | **VETO** | **Replace or train** |

---

## Troubleshooting Guide

### Problem: Validation Fails Repeatedly

**Symptoms**:
- Same checkpoint fails multiple times
- Feedback suggests same fixes
- Unable to improve scores

**Debugging Steps**:

1. **Enable Debug Mode**:
   ```javascript
   process.env.AIOS_DEBUG = 'true';
   ```

2. **Inspect Validation Result**:
   ```javascript
   console.log(JSON.stringify(validationResult, null, 2));
   ```

3. **Check Context Structure**:
   ```javascript
   console.log('Context fields:', Object.keys(context));
   console.log('Required fields:', criteria.map(extractField));
   ```

4. **Verify Data Types**:
   ```javascript
   // Common issue: string instead of number
   console.log(typeof context.end_state_vision); // Should be 'number'
   ```

**Solutions**:
- Verify field names match exactly (case-sensitive)
- Ensure numeric values are numbers, not strings
- Check for typos in field names
- Validate context structure against validator requirements

---

### Problem: VETO Won't Clear

**Symptoms**:
- Applied fix but VETO persists
- Threshold seems unreachable
- Error message confusing

**Debugging Steps**:

1. **Check Actual Values**:
   ```javascript
   console.log('Executor truthfulness:', context.executors[0].truthfulness);
   console.log('Type:', typeof context.executors[0].truthfulness);
   console.log('Threshold:', 0.7);
   ```

2. **Verify Field Presence**:
   ```javascript
   console.log('Guardrails:', context.guardrails);
   console.log('Is array?', Array.isArray(context.guardrails));
   console.log('Length:', context.guardrails?.length);
   ```

3. **Test with Minimal Context**:
   ```javascript
   const minimalContext = {
     executors: [{ name: 'Test', truthfulness: 0.75, coherence: 0.85 }]
   };
   const result = await executeValidationGate(phase, minimalContext);
   ```

**Solutions**:
- Convert string numbers to actual numbers: `parseFloat(value)`
- Initialize arrays properly: `context.guardrails = []` not `undefined`
- Match exact field names from validator requirements
- Check for floating-point precision issues (0.699999 vs 0.7)

---

### Problem: Feedback Not Helpful

**Symptoms**:
- Generic suggestions
- No specific fix guidance
- Missing documentation links

**Causes**:
- Checkpoint not recognized by feedback generator
- Context missing for context-specific suggestions
- Documentation links not configured

**Solutions**:

1. **Add Checkpoint to Feedback Generator**:
   ```javascript
   // In validation-feedback-generator.js
   const DOCUMENTATION_LINKS = {
     'custom-checkpoint': {
       heuristic: 'docs/heuristics/CUSTOM_001.md',
       guide: 'docs/guides/custom-guide.md'
     }
   };
   ```

2. **Provide Rich Context**:
   ```javascript
   // Include extra context for better suggestions
   context.metadata = {
     phase: 'Architecture',
     previous_failures: ['strategic-alignment'],
     user_role: 'architect'
   };
   ```

3. **Enhance Criteria**:
   ```yaml
   validation:
     feedback_on_failure:
       - "Specific instruction 1"
       - "Specific instruction 2"
       - "Link to template: docs/templates/x.md"
   ```

---

### Problem: Performance Degradation

**Symptoms**:
- Checkpoints taking >100ms
- Workflow feels slow
- High memory usage

**Profiling**:

```javascript
// Measure checkpoint time
const startTime = Date.now();
const result = await executeValidationGate(phase, context);
const duration = Date.now() - startTime;
console.log(`Checkpoint took ${duration}ms`);

// Check context size
console.log('Context size:', JSON.stringify(context).length, 'bytes');
```

**Optimizations**:

1. **Reduce Context Size**:
   ```javascript
   // ❌ Don't pass entire codebase
   context.sourceCode = fs.readFileSync('huge-file.js', 'utf8');

   // ✅ Pass summary only
   context.sourceCodeSummary = summarize(sourceCode);
   ```

2. **Cache Heuristic Compilation**:
   ```javascript
   // Heuristic compiler should cache compiled functions
   const compiler = getCompiler();
   compiler.precompile(['PV_BS_001', 'PV_PA_001', 'PV_PM_001']);
   ```

3. **Use Incremental Validation**:
   ```javascript
   // Validate during phase execution, not at end
   if (phase.supportsIncrementalValidation) {
     await phase.execute({
       onProgress: async (partialOutput) => {
         await executeValidationGate(checkpointConfig, partialOutput);
       }
     });
   }
   ```

---

## Appendix

### Complete Validation Result Schema

```typescript
interface ValidationResult {
  // Basic result
  gate: string;              // Checkpoint name
  passed: boolean;           // Overall pass/fail
  skipped?: boolean;         // If validation was skipped

  // VETO information
  veto?: boolean;            // Is this a VETO failure?
  vetoes?: Veto[];           // VETO conditions triggered

  // Criteria results
  criteriaResults?: CriteriaResult[];

  // Scores
  score?: number;            // Overall score (0-10)
  minScore?: number;         // Minimum score (Axioma)
  dimensions?: object;       // Dimension scores (Axioma)

  // Metadata
  heuristicId?: string;      // Which heuristic was used
  validatorName?: string;    // Which validator was used
  recommendation?: string;   // Heuristic recommendation

  // Feedback
  feedback?: string;         // Formatted user feedback
  message?: string;          // Success/error message

  // Severity
  severity?: 'CRITICAL' | 'MAJOR' | 'MINOR';
}

interface Veto {
  type: string;              // truthfulness, guardrails, axioma_minimum, etc.
  message: string;           // Human-readable description
  value?: number;            // Actual value (if numeric)
  threshold?: number;        // Required threshold (if numeric)
  executor?: string;         // Executor name (coherence scan)
  dimension?: string;        // Axioma dimension (axioma)
  task?: string;             // Task name (task anatomy)
  missing?: string[];        // Missing fields (task anatomy)
}

interface CriteriaResult {
  criterion: string;         // Original criterion string
  passed: boolean;           // Did it pass?
  actual: any;               // Actual value
  expected: string;          // Expected value
  message: string;           // Result message
}
```

---

### Validation Configuration Schema

```yaml
validation:
  # Checkpoint identification
  checkpoint: string         # e.g., "strategic-alignment"

  # Validator selection (choose one)
  heuristic: string         # PV_BS_001, PV_PA_001, PV_PM_001
  validator: string         # axioma-validator, task-anatomy

  # Evaluation criteria
  criteria:
    - string                # e.g., "End-state vision ≥0.8"
    - string                # Can have multiple criteria

  # VETO conditions (optional)
  veto_conditions:
    - string                # e.g., "truthfulness < 0.7"

  # Custom feedback (optional)
  feedback_on_failure:
    - string                # Context-specific suggestions
    - string

  # Special configurations (optional)
  dimensions:              # For Axioma validator
    - string               # Dimension names
  required_fields:         # For Task Anatomy validator
    - string               # Field names
```

---

### Error Code Reference

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| VAL_001 | Validation gate has neither heuristic nor validator | Configuration error | Add heuristic or validator to config |
| VAL_002 | Heuristic not found or failed to compile | Missing heuristic file | Create heuristic file or fix compilation |
| VAL_003 | Unknown validator | Invalid validator name | Use axioma-validator or task-anatomy |
| VAL_004 | Context missing required fields | Incomplete phase output | Add missing fields to context |
| VAL_005 | Criteria evaluation failed | Malformed criterion | Check criterion syntax |

---

### Performance Benchmarks

From Phase C.7 test suite:

| Metric | Target | Typical | Max Observed |
|--------|--------|---------|--------------|
| Checkpoint execution | <100ms | ~50ms | 85ms |
| Heuristic compilation | <10ms | ~5ms | 8ms |
| Criteria evaluation | <20ms | ~10ms | 15ms |
| Feedback generation | <30ms | ~15ms | 25ms |
| Total validation overhead | <500ms | ~250ms | 380ms |

**Memory Usage**:
- Baseline workflow: ~50MB
- With validation: ~65MB (+15MB)
- Target increase: <50MB

---

### Related Files

**Core Implementation**:
- `utils/validation-gate.js` - Validation execution
- `utils/validation-feedback-generator.js` - Feedback generation
- `utils/heuristic-compiler.js` - Heuristic compilation
- `utils/workflow-orchestrator.js` - Workflow integration

**Tests**:
- `tests/workflow.test.js` - Comprehensive test suite (22 tests)

**Documentation**:
- `docs/workflow-diagram.md` - Visual workflow diagram
- `docs/workflow-orchestration-guide.md` - Orchestration guide
- `heuristics/PV_BS_001-future-back-casting.md` - Strategic alignment
- `heuristics/PV_PA_001-coherence-scan.md` - Executor validation
- `heuristics/PV_PM_001-automation-tipping-point.md` - Automation readiness

---

**Questions or Issues?**
- Consult [Troubleshooting Guide](#troubleshooting-guide)
- Review checkpoint-specific sections
- Check validation result schema
- Enable debug mode for detailed logging

---

*Validation Gate Reference v2.0 - Story 1.8*
