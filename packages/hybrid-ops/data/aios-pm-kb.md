# AIOS-PM Knowledge Base

**Version**: 1.0.0
**Purpose**: Central knowledge repository for AIOS-PM methodology
**Audience**: Process designers, agents, developers, architects

---

## Table of Contents

1. [AIOS-PM Fundamentals](#aios-pm-fundamentals)
2. [Process Architecture](#process-architecture)
3. [Design Patterns](#design-patterns)
4. [Best Practices](#best-practices)
5. [Compliance Standards](#compliance-standards)
6. [Troubleshooting](#troubleshooting)
7. [Integration Guides](#integration-guides)
8. [Glossary](#glossary)

---

## AIOS-PM Fundamentals

### What is AIOS-PM?

**AIOS-PM** (AI-Orchestrated Systems Process Management) is a methodology for designing, implementing, and managing **hybrid human-agent processes** where humans and AI agents collaborate seamlessly.

**Key Principles**:
1. **Universal Design**: Workflows executable by humans AND agents
2. **Explicit Contracts**: Clear input/output schemas for every task
3. **Progressive Automation**: Gradual migration from manual to automated
4. **Quality Gates**: Validation checkpoints at critical transitions
5. **Dual Output**: Process runs in ClickUp (humans) and YAML/AIOS (agents)

### Core Concepts

#### Process
A structured sequence of phases and tasks that achieve a business goal.

**Components**:
- **Metadata**: ID, name, type, owner, version
- **Phases**: 3-7 logical groupings of related tasks
- **Tasks**: Individual units of work
- **Executors**: Who/what performs each task
- **Data Contracts**: Input/output schemas
- **QA Gates**: Validation checkpoints
- **Handoffs**: Transitions between tasks

#### Phase
A logical grouping of related tasks within a process.

**Characteristics**:
- Clear purpose and scope
- Entry criteria (when phase starts)
- Exit criteria (when phase completes)
- 2-10 tasks per phase (typically)
- May have phase gates at boundaries

**Example**:
```yaml
phase:
  id: data-collection
  name: Data Collection
  description: Gather all required customer information
  entry_criteria:
    - Contract signed
    - Customer assigned to onboarding team
  exit_criteria:
    - All required data collected
    - Data validated
  tasks:
    - collect-customer-data
    - validate-customer-data
    - update-crm-record
```

#### Task
An atomic unit of work with a single clear outcome.

**Properties**:
- **Metadata**: ID, name, complexity, duration
- **Executor**: Human, agent, or hybrid
- **Workflow**: Step-by-step instructions
- **Data Contracts**: Input/output schemas
- **Quality Checklist**: Validation criteria
- **Handoff**: How to transition to next task

**Task Types**:
- **Operational**: Recurring business operations
- **Development**: Software/system development
- **Research**: Information gathering/analysis
- **Approval**: Decision-making/authorization

#### Executor
The entity (human or agent) that performs a task.

**Types**:

**Human Executor**:
```yaml
executor:
  type: human
  assigned_to: sarah-onboarding-coordinator
  skills:
    - Customer communication
    - CRM expertise
    - Data validation
  tools:
    - ClickUp
    - CRM
    - Email
  capacity:
    hours_per_week: 40
```

**Agent Executor**:
```yaml
executor:
  type: agent
  assigned_to: data-validation-agent
  framework: AIOS
  capabilities:
    - JSON Schema validation
    - API integration
    - Pattern matching
  tools:
    - ClickUp API
    - CRM API
    - Validation libraries
```

**Hybrid Executor**:
```yaml
executor:
  type: hybrid
  primary: data-validation-agent
  fallback: sarah-onboarding-coordinator
  escalation_trigger: confidence < 0.8
  decision_logic:
    - if: validation_score >= 0.95
      then: agent_completes
    - if: 0.80 <= validation_score < 0.95
      then: agent_flags_for_human_review
    - if: validation_score < 0.80
      then: human_takeover_immediate
```

#### Workflow
Step-by-step instructions for executing a task.

**Universal Workflow Pattern**:
```markdown
## Prerequisites
- [ ] Access to System X
- [ ] Input data available
- [ ] Tools configured

## Steps

### Step 1: Validate Input
1. Check `customer_id` field is present
2. Verify `customer_id` matches pattern: CUS-[0-9]{5}
3. If invalid: reject with error "Invalid customer ID format"
4. If valid: proceed to Step 2

### Step 2: Query Database
1. Connect to database using credentials in .env
2. Execute query: SELECT * FROM customers WHERE id = {customer_id}
3. If no results: reject with error "Customer not found"
4. If results: store in variable `customer_data`

### Step 3: Transform Data
1. Extract fields: name, email, phone
2. Format phone to E.164: +[country][number]
3. Validate email contains "@" and "."
4. Create output object per output schema

## Decision Points

**Decision**: Is customer status "Active"?
- **YES** → Continue to Step 4
- **NO** → Skip to Step 6

## Output
Return JSON object matching output schema
```

**Key Features**:
- Uses imperative language ("Check", "Verify", "Execute")
- Explicit conditions (no ambiguity)
- Error handling at each step
- Measurable success criteria
- Works for humans AND agents

#### Data Contract
Explicit specification of input and output data for a task.

**Structure**:
```yaml
data_contracts:
  input:
    schema:
      type: object
      properties:
        customer_id:
          type: string
          pattern: "^CUS-[0-9]{5}$"
          description: Unique customer identifier
        customer_name:
          type: string
          minLength: 2
          description: Customer company name
      required:
        - customer_id
        - customer_name
    source: collect-customer-data
    validation_before_execution: true

  output:
    schema:
      type: object
      properties:
        validation_result:
          type: string
          enum: [pass, fail, warning]
        validation_score:
          type: number
          minimum: 0
          maximum: 1
        issues:
          type: array
          items:
            type: object
            properties:
              field:
                type: string
              severity:
                type: string
                enum: [critical, major, minor]
              message:
                type: string
      required:
        - validation_result
        - validation_score
    destination: configure-system
```

**Why Data Contracts Matter**:
- Eliminate ambiguity in data exchange
- Enable automated validation
- Support agent execution
- Facilitate testing
- Document data flow

#### QA Gate
A validation checkpoint before a handoff occurs.

**Components**:
```yaml
qa_gate:
  gate_id: customer-data-gate
  location: after-task-id: validate-customer-data
  type: blocking  # blocking | warning | informational

  validator:
    type: agent
    assigned_to: data-validation-agent
    fallback: sarah-onboarding-coordinator

  validation_criteria:
    - criterion: All required fields present
      severity: critical
      validation_method: automated
      check: schema_validation

    - criterion: Email format valid
      severity: critical
      validation_method: automated
      check: regex_match

    - criterion: No duplicate customer
      severity: critical
      validation_method: automated
      check: database_query

    - criterion: Data quality score >= 90%
      severity: major
      validation_method: automated
      check: quality_algorithm

  decision_matrix:
    PASS:
      criteria: All critical checks pass AND quality >= 90%
      action: proceed_automatically
      notification: none

    CONCERNS:
      criteria: All critical pass AND quality 70-89%
      action: flag_for_review
      notification: notify_reviewer
      reviewer: sarah-onboarding-coordinator
      sla: 4 hours

    FAIL:
      criteria: Any critical check fails OR quality < 70%
      action: block_handoff
      notification: notify_executor_and_owner
      remediation: return_to_previous_task

    WAIVED:
      criteria: Failed but exception granted
      action: proceed_with_documentation
      requires_approval: process_owner
      requires_rationale: true

  escalation:
    trigger: blocked > 4 hours
    path:
      - level: 1
        to: sarah-onboarding-coordinator
        sla: 4 hours
      - level: 2
        to: onboarding-manager
        sla: 8 hours
      - level: 3
        to: process-owner
        sla: 24 hours
```

**Gate Types**:
- **Blocking**: Must pass to proceed
- **Warning**: Flags issues but allows proceed with approval
- **Informational**: Records metrics but doesn't block

#### Handoff
The transition of work and data from one task to the next.

**Handoff Types**:

**1. Automatic Handoff**:
```yaml
handoff:
  from_task: collect-customer-data
  to_task: validate-customer-data
  trigger:
    type: status_change
    condition: status == "Complete"
  method: automatic
  data_mapping:
    - from: output.customer_id
      to: input.customer_id
      required: true
    - from: output.customer_data
      to: input.customer_data
      required: true
      transformation: none
  validation_before_handoff:
    - check: output.customer_data != null
      on_fail: block_handoff
```

**2. Manual Handoff**:
```yaml
handoff:
  from_task: review-proposal
  to_task: send-proposal
  trigger:
    type: manual_approval
    approver: sales-manager
  method: manual
  approval_criteria:
    - Proposal complete
    - Pricing approved
    - Legal reviewed
```

**3. QA-Gated Handoff**:
```yaml
handoff:
  from_task: validate-customer-data
  to_task: configure-system
  trigger:
    type: qa_gate_pass
    gate_id: customer-data-gate
  method: automatic
  requires_gate: true
```

---

## Process Architecture

### Architecture Layers

**Layer 1: Process Definition**
- High-level process structure
- Phases and their relationships
- Process metadata and ownership

**Layer 2: Task Network**
- Individual tasks and dependencies
- Executor assignments
- Complexity estimates

**Layer 3: Execution Layer**
- Workflows (step-by-step instructions)
- Data contracts (schemas)
- Quality checklists

**Layer 4: Validation Layer**
- QA gates
- Validation criteria
- Decision logic

**Layer 5: Orchestration Layer**
- Handoff configurations
- Trigger logic
- Automation rules

**Layer 6: Implementation Layer**
- ClickUp configuration
- Agent integrations
- Tool connections

### Architectural Patterns

#### Pattern: Linear Sequential Process
```
Task 1 → Task 2 → Task 3 → Task 4 → Done
```

**Use When**:
- Steps must happen in order
- Each task depends on previous
- No parallelization possible

**Example**: Customer onboarding

#### Pattern: Parallel Branching Process
```
         ┌→ Task 2A ─┐
Task 1 ──┤           ├→ Task 4
         └→ Task 2B ─┘
```

**Use When**:
- Independent tasks can run simultaneously
- Need to optimize duration
- No dependencies between branches

**Example**: Product launch (marketing + engineering tracks)

#### Pattern: Conditional Process
```
         ┌→ [Approved] → Task 2A → Done
Task 1 ──┤
         └→ [Rejected] → Task 2B → Task 1
```

**Use When**:
- Decision points exist
- Different paths for different outcomes
- Need validation before proceeding

**Example**: Approval workflows

#### Pattern: Iterative Process
```
Task 1 → Task 2 → [Check] ──→ [Pass] → Done
                     ↓
                   [Fail]
                     ↓
                  Task 1 (retry)
```

**Use When**:
- Quality validation required
- May need multiple attempts
- Feedback loops necessary

**Example**: Code review, content approval

---

## Design Patterns

### Process Structure Patterns

#### Pattern: Phase-Based Organization

**Structure**:
```yaml
process:
  phases:
    - phase: 1
      name: Discovery
      tasks: [discover-requirements, interview-stakeholders, document-current-state]
    - phase: 2
      name: Design
      tasks: [design-architecture, create-specs, review-design]
    - phase: 3
      name: Implementation
      tasks: [implement-feature-1, implement-feature-2, test]
    - phase: 4
      name: Deployment
      tasks: [deploy-staging, validate, deploy-production]
```

**Benefits**:
- Logical grouping
- Clear milestones
- Easy to track progress
- Supports phase gates

**When to Use**:
- Medium to large processes (10+ tasks)
- Clear logical stages
- Multiple stakeholders

#### Pattern: Role-Based Organization

**Structure**:
```yaml
process:
  phases:
    - phase: Sales
      tasks: [qualify-lead, demo-product, negotiate-contract]
    - phase: Onboarding
      tasks: [collect-data, setup-system, train-customer]
    - phase: Success
      tasks: [monitor-usage, conduct-review, upsell]
```

**Benefits**:
- Clear ownership
- Aligns with org structure
- Easy to understand responsibilities

**When to Use**:
- Process spans departments
- Role handoffs critical
- Organizational alignment important

### Executor Assignment Patterns

#### Pattern: Skill-Based Assignment

**Logic**:
```yaml
assignment_logic:
  for_each_task:
    - identify_required_skills
    - match_executor_with_skills
    - check_availability
    - assign_to_best_match
```

**Example**:
```yaml
task: configure-database
required_skills:
  - database-administration
  - SQL
  - AWS
available_executors:
  - executor: mike-sysadmin
    skills: [database-administration, SQL, AWS, Linux]
    availability: 80%
  - executor: jane-devops
    skills: [AWS, Docker, Kubernetes]
    availability: 40%
assigned_to: mike-sysadmin
rationale: Has all required skills and good availability
```

#### Pattern: Workload Balancing

**Logic**:
```yaml
assignment_logic:
  calculate_workload:
    formula: task_count × complexity_factor × duration
  max_utilization: 80%
  rebalance_if: any_executor > 80% utilization
```

**Example**:
```yaml
executors:
  - id: sarah
    capacity: 40 hours/week
    assigned_tasks: 15
    estimated_workload: 28 hours (70%)
    status: OK

  - id: mike
    capacity: 40 hours/week
    assigned_tasks: 20
    estimated_workload: 36 hours (90%)
    status: OVERLOADED - Reassign 2 tasks

action: Move 2 low-complexity tasks from Mike to Sarah
```

### Hybrid Execution Patterns

#### Pattern: Agent-Primary, Human-Fallback

**Use Case**: Tasks being migrated to automation

**Implementation**:
```yaml
executor:
  type: hybrid
  primary: validation-agent
  fallback: sarah-coordinator

  execution_flow:
    step_1:
      action: agent_attempts_task
      timeout: 5_minutes

    step_2:
      condition: if agent.confidence < 0.8 OR agent.error
      action: escalate_to_human
      notification: immediate

    step_3:
      condition: if agent.confidence >= 0.8
      action: agent_completes
      notification: log_only
```

**Example Tasks**:
- Data validation
- Format checking
- Simple calculations
- Status updates

#### Pattern: Human-Primary, Agent-Assist

**Use Case**: Complex judgment with data support

**Implementation**:
```yaml
executor:
  type: hybrid
  primary: human-expert
  assistant: research-agent

  execution_flow:
    step_1:
      action: agent_provides_analysis
      includes:
        - data_summary
        - recommendations
        - risk_assessment

    step_2:
      action: human_reviews_and_decides
      has_access_to:
        - agent_analysis
        - original_data
        - historical_context

    step_3:
      action: human_makes_final_decision
      agent_role: advisory_only
```

**Example Tasks**:
- Strategic decisions
- Customer negotiations
- Complex troubleshooting
- Creative work

#### Pattern: Agent-Draft, Human-Review

**Use Case**: Content creation, report generation

**Implementation**:
```yaml
executor:
  type: hybrid
  drafter: content-generation-agent
  reviewer: content-manager

  execution_flow:
    step_1:
      action: agent_creates_draft
      quality_target: 80%_acceptable
      output: draft_document

    step_2:
      action: human_reviews_draft
      can:
        - approve_as_is
        - edit_and_approve
        - reject_with_feedback

    step_3:
      condition: if rejected
      action: agent_revises_based_on_feedback
      max_iterations: 3
```

**Example Tasks**:
- Report writing
- Email drafting
- Documentation creation
- Content generation

### Data Contract Patterns

#### Pattern: Schema Inheritance

**Use Case**: Related tasks with similar data

**Implementation**:
```yaml
base_schema:
  customer_base:
    type: object
    properties:
      customer_id:
        type: string
      customer_name:
        type: string
      email:
        type: string
        format: email

task_1_output:
  allOf:
    - $ref: "#/base_schema/customer_base"
    - properties:
        data_collection_date:
          type: string
          format: date

task_2_input:
  allOf:
    - $ref: "#/base_schema/customer_base"
    - properties:
        data_collection_date:
          type: string
```

**Benefits**:
- Reduces duplication
- Ensures consistency
- Easy to update

#### Pattern: Transformation Pipeline

**Use Case**: Data needs transformation between tasks

**Implementation**:
```yaml
handoff:
  from_task: collect-data
  to_task: process-data

  data_mapping:
    - from: output.rawData.phoneNumber
      to: input.phone
      transformation:
        function: format_phone_e164
        params:
          default_country: US

    - from: output.rawData.customerName
      to: input.companyName
      transformation:
        function: normalize_string
        params:
          case: title
          trim: true
```

### QA Gate Patterns

#### Pattern: Progressive Validation

**Use Case**: Multi-tier validation for critical data

**Implementation**:
```yaml
validation_tiers:
  tier_1_automated:
    - schema_validation
    - format_checks
    - required_fields
    decision: if_pass → tier_2, if_fail → reject

  tier_2_automated:
    - business_rules
    - data_quality_scoring
    - duplicate_detection
    decision: if_pass → tier_3, if_fail → human_review

  tier_3_human:
    - contextual_review
    - exception_handling
    - final_approval
    decision: approve_or_reject
```

---

## Best Practices

### Process Design

#### ✅ Do's

**1. Start with Discovery**
- Interview stakeholders
- Map current state
- Identify pain points
- Understand constraints

**2. Design Phase-First**
- Define 3-7 phases
- Establish phase boundaries
- Set entry/exit criteria
- Plan phase gates

**3. Keep Tasks Atomic**
- One clear outcome per task
- 30 min - 4 hours duration
- Single executor
- Testable completion criteria

**4. Balance Human and Agent Work**
- Automate repetitive tasks
- Keep judgment with humans
- Use hybrid for transition
- Plan progressive migration

**5. Make Data Contracts Explicit**
- Define schemas upfront
- Use JSON Schema format
- Document transformations
- Validate at boundaries

#### ❌ Don'ts

**1. Don't Create Mega-Tasks**
- Tasks > 1 day should be split
- Multiple executors = split task
- Complex logic = multiple tasks

**2. Don't Skip Data Contracts**
- "We'll figure it out later" = problems
- Implicit assumptions cause failures
- Missing schemas break automation

**3. Don't Over-Gate**
- Not every handoff needs a gate
- Gate fatigue reduces effectiveness
- Focus on critical transitions

**4. Don't Forget Error Handling**
- Every task can fail
- Define failure scenarios
- Plan recovery paths
- Document escalation

**5. Don't Design for One Executor Type**
- Workflows should work for humans OR agents
- Avoid human-only language
- Avoid agent-only technical specs
- Universal design = flexibility

### Workflow Writing

#### Universal Workflow Guidelines

**Clear Language**:
```markdown
✅ GOOD: "Check if email field contains '@' symbol"
❌ BAD: "Make sure email looks right"

✅ GOOD: "If customer_id is null, return error code E001"
❌ BAD: "Handle missing customer ID appropriately"

✅ GOOD: "Execute SQL: SELECT * FROM customers WHERE id = {id}"
❌ BAD: "Get customer from database"
```

**Explicit Conditions**:
```markdown
✅ GOOD:
**Decision**: Is order_total > 1000?
- **YES** (order_total > 1000) → Require approval
- **NO** (order_total ≤ 1000) → Auto-approve

❌ BAD:
Check if order needs approval
```

**Error Handling**:
```markdown
✅ GOOD:
3. Query database
   - If connection fails: Wait 5 seconds, retry (max 3 attempts)
   - If no results found: Return error "Customer not found"
   - If multiple results: Return error "Duplicate customer ID"
   - If success: Continue to step 4

❌ BAD:
3. Query database and handle errors
```

### Agent Development

#### Agent Persona Design

**Components**:
```yaml
persona:
  role: What is this agent?
    # Example: Data Validation Specialist

  expertise: What does it know?
    # Example: JSON Schema, data quality rules, CRM APIs

  style: How does it behave?
    # Example: Strict validator, fails fast, clear errors

  focus: What does it prioritize?
    # Example: Zero invalid data reaches downstream
```

**Good Example**:
```markdown
### Role
API Integration Specialist

### Expertise
- REST API design and implementation
- OAuth 2.0 authentication
- Rate limiting and retry logic
- Error handling patterns
- JSON data transformation

### Style
- Defensive: Validates all inputs
- Resilient: Retries transient failures
- Informative: Logs detailed error context
- Safe: Never exposes credentials

### Focus
- 100% successful integrations
- < 100ms average response time
- Graceful degradation on failures
- Complete audit trail
```

#### Agent Command Design

**Pattern**:
```markdown
#### `*command-name`
Brief description of what command does.

**Usage**:
```
*command-name [required-arg] [optional-arg]
```

**Workflow**:
1. Validate inputs
2. Execute main logic
3. Handle errors
4. Return results

**Output**: What this command produces

**Errors**:
- E001: Input validation failed
- E002: External API error
- E003: Data transformation failed
```

### ClickUp Configuration

#### Custom Field Standards

**Always Include** (AIOS-PM standard 20 fields):
1. Executor Type (dropdown: human/agent/hybrid)
2. Assigned Executor (text or user field)
3. Task Type (dropdown: operational/development/research/approval)
4. Complexity (dropdown: trivial/low/medium/high/very-high)
5. Automation Ready (checkbox)
6. Primary Executor (text) [for hybrid]
7. Fallback Executor (text) [for hybrid]
8. Escalation Trigger (text) [for hybrid]
9. Migration Stage (dropdown) [for hybrid]
10. Input Schema (URL)
11. Output Schema (URL)
12. Data Complete (checkbox)
13. Gate Status (dropdown: pass/concerns/fail/waived)
14. Validation Issues (long text)
15. Validation Score (number 0-1)
16. Quality Score (number 0-100)
17. Estimated Duration (time tracking)
18. Actual Duration (time tracking)
19. Handoff Trigger (text)
20. Process Version (text)

#### Automation Guidelines

**Handoff Automation**:
```
Trigger: Status changed to "Complete"
Conditions:
  - Checklist 100% complete
  - Required custom fields filled
  - No QA gate blocking
Actions:
  - Create next task
  - Copy data fields
  - Assign to next executor
  - Update process status
```

**QA Gate Automation**:
```
Trigger: Status changed to "Ready for QA"
Conditions:
  - Task has QA gate configured
Actions:
  - Trigger validation (webhook to agent)
  - Update "Gate Status" field
  - If fail: Change status to "Needs Correction"
  - If pass: Change status to "Complete"
```

---

## Compliance Standards

### Minimum Requirements for Production

**Overall Score**: ≥ 90/100 (90%)

**Critical Categories** (must each score ≥ 85%):
- Tasks: ≥ 13/15 points
- Executors: ≥ 13/15 points
- Data Contracts: ≥ 13/15 points

**Zero Tolerance**:
- Missing required task fields
- Data contract mismatches
- Unassigned tasks
- Missing critical QA gates

### Validation Process

**Automated Validation**:
```bash
# Run compliance validation
@hybridOps:compliance-validator *validate-process

# Expected output:
# - Category scores (8 categories)
# - Overall compliance score
# - Critical/major/minor issues
# - Action plan
# - Go/no-go recommendation
```

---

## Troubleshooting

### Common Issues

#### Issue: Process Stuck at Task

**Symptoms**:
- Task not moving to next status
- No handoff triggered
- Automation didn't run

**Diagnosis**:
1. Check task status in ClickUp
2. Verify checklist completion
3. Check required custom fields
4. Review automation logs

**Solutions**:
- Complete missing checklist items
- Fill required custom fields
- Manually trigger automation
- Check ClickUp automation is enabled

#### Issue: Data Contract Mismatch

**Symptoms**:
- Next task can't start
- Error: "Required field missing"
- Validation failures

**Diagnosis**:
1. Compare output schema of Task A
2. Compare input schema of Task B
3. Check handoff data mapping

**Solutions**:
- Update output schema to include missing fields
- Update input schema to make fields optional
- Add transformation in handoff mapping
- Fix data mapping configuration

#### Issue: Agent Escalation Loop

**Symptoms**:
- Agent repeatedly escalates to human
- Same error every time
- No progress made

**Diagnosis**:
1. Check agent escalation logs
2. Review escalation trigger conditions
3. Examine input data quality

**Solutions**:
- Adjust escalation thresholds
- Improve input data quality
- Fix bug in agent logic
- Temporarily switch to human executor

#### Issue: QA Gate Always Failing

**Symptoms**:
- Gate blocks every time
- Validation criteria too strict
- Process bottlenecked

**Diagnosis**:
1. Review gate validation criteria
2. Check recent pass/fail rate
3. Analyze failure reasons

**Solutions**:
- Relax non-critical criteria
- Fix upstream data quality issues
- Add waiver process for exceptions
- Consider gate removal if not adding value

---

## Integration Guides

### ClickUp Integration

**Setup**:
```yaml
clickup_integration:
  api_key: stored-in-env
  webhooks:
    - event: task_status_changed
      url: https://aios.example.com/webhook/clickup/status
      filters:
        space_id: process-space-id

    - event: custom_field_updated
      url: https://aios.example.com/webhook/clickup/field
      filters:
        field_id: gate-status-field-id
```

**Webhook Handler Example**:
```javascript
// Handle status change
app.post('/webhook/clickup/status', async (req, res) => {
  const { task_id, status_new, custom_fields } = req.body;

  // Check if handoff should trigger
  if (status_new === 'Complete') {
    const nextTask = await getNextTask(task_id);
    await createTask(nextTask, custom_fields);
  }

  res.status(200).send('OK');
});
```

### AIOS Agent Integration

**Agent Activation**:
```javascript
// Activate agent for task execution
const agent = await AIOS.activateAgent('validation-agent');

// Load task definition
const task = await loadTask('validate-customer-data');

// Execute workflow
const result = await agent.executeWorkflow(task.workflow, {
  input: task.input_data,
  schemas: task.data_contracts
});

// Update ClickUp with results
await updateClickUpTask(task.clickup_task_id, {
  status: result.success ? 'Complete' : 'Failed',
  custom_fields: result.validation_report
});
```

---

## Glossary

**Agent**: AI entity that can execute tasks autonomously

**Automation Ready**: Flag indicating task is ready for agent execution

**Complexity**: Estimate of task difficulty (trivial, low, medium, high, very-high)

**Data Contract**: Explicit input/output schema specification

**Escalation**: Transferring issue to higher authority

**Executor**: Entity (human/agent/hybrid) that performs tasks

**Handoff**: Transition of work and data between tasks

**Hybrid Execution**: Task performed by agent with human fallback

**Migration Stage**: Stage of transition from manual to automated (manual, hybrid-pilot, hybrid-active, automated)

**Phase**: Logical grouping of related tasks

**Process**: End-to-end workflow with phases and tasks

**QA Gate**: Validation checkpoint before handoff

**Task**: Atomic unit of work with single outcome

**Validation Criteria**: Specific rules for QA gate decisions

**Workflow**: Step-by-step instructions for task execution

---

## References

### Related Methodologies
- **BPM** (Business Process Management): Traditional process design
- **Six Sigma**: Quality improvement methodology
- **Lean**: Waste reduction and efficiency
- **Agile**: Iterative development approach
- **DevOps**: Development and operations integration

### AIOS-PM Differentiators
- Hybrid human-agent execution
- Universal workflow design
- Explicit data contracts
- Progressive automation
- Dual implementation (ClickUp + YAML)

### Tool Integrations
- **ClickUp**: Task management and orchestration
- **AIOS**: Agent framework
- **GitHub**: Version control
- **APIs**: External system integration

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-10-06 | Initial release |

---

_AIOS-PM Knowledge Base v1.0.0_
_Part of: hybrid-ops expansion pack_
_Maintained by: AIOS-PM community_
