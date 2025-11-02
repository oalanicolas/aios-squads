# Generate Agents Task

## Purpose

To generate AIOS agent definitions for new agents identified in the executor design phase, enabling automated execution of process tasks.

## Inputs

- Agent development plan from Phase 3 (`output/processes/{process_id}-executor-matrix.yaml`)
- Task definitions from Phase 5 (`tasks/{task_id}.yaml`)
- Workflow definitions from Phase 4 (`workflows/{workflow_id}.md`)
- Executor assignment matrix from Phase 3
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Review Agent Development Plan

**1.1 Load Agent Development Plan**

From Phase 3 executor design:
- List of agents to be created
- Required capabilities per agent
- Development priority ranking
- Tasks assigned to each agent

**1.2 Confirm Agent Scope**

For each agent to be generated:
- What tasks will it execute?
- What systems will it access?
- What skills/capabilities required?
- What's the migration timeline?

**Ask:** "Should we generate all planned agents, or start with high-priority ones?"

### 2. Design Agent Personas

**For Each New Agent:**

**2.1 Define Agent Identity**

```yaml
agent:
  id: data-validation-agent
  name: "Data Validation Agent"
  role: "Automated Data Quality Checker"
  purpose: "Validates customer data against quality standards and business rules"
  expertise:
    - Data validation
    - Format checking
    - Business rule enforcement
    - Duplicate detection
```

**2.2 Define Agent Capabilities**

What CAN this agent do?

```yaml
capabilities:
  - validate_data_formats:
      description: "Check email, phone, postal code formats"
      confidence: high
  - check_completeness:
      description: "Verify all required fields present"
      confidence: high
  - detect_duplicates:
      description: "Find existing records with same email/phone"
      confidence: medium
  - assess_data_quality:
      description: "Score data quality on 0-100 scale"
      confidence: medium
  - apply_business_rules:
      description: "Validate against configurable business rules"
      confidence: medium
```

**2.3 Define Agent Limitations**

What CANNOT this agent do?

```yaml
limitations:
  - "Cannot make subjective judgments about data legitimacy"
  - "Cannot handle edge cases requiring human context"
  - "Cannot approve exceptions to business rules"
  - "Cannot modify external systems directly"
  - "Limited to validation only, not data correction"
```

### 3. Define Agent Behavior

**3.1 Configure Decision-Making Logic**

```yaml
decision_logic:
  confidence_thresholds:
    high_confidence: ">= 0.95"
    medium_confidence: "0.80 - 0.94"
    low_confidence: "< 0.80"

  actions_by_confidence:
    high_confidence:
      - complete_task_automatically
      - mark_status: validated
      - handoff_to_next_task
    medium_confidence:
      - flag_for_human_review
      - add_note: "Medium confidence - please verify"
      - assign_to_fallback_executor
    low_confidence:
      - escalate_immediately
      - assign_to_human_executor
      - log_escalation_reason
```

**3.2 Define Error Handling**

```yaml
error_handling:
  on_system_error:
    - log_error_details
    - retry_with_backoff:
        max_attempts: 3
        backoff: exponential
    - if_still_failing:
        escalate_to: it-support
        fallback_to: human_executor

  on_data_error:
    - log_data_issue
    - create_data_quality_report
    - notify_data_owner
    - escalate_to: data-quality-team

  on_validation_timeout:
    - log_timeout
    - mark_for_manual_processing
    - notify_process_owner
```

**3.3 Define Escalation Rules**

```yaml
escalation:
  triggers:
    - condition: confidence < 0.80
      escalate_to: human_fallback_executor
      reason: low_confidence

    - condition: error_count > 3
      escalate_to: process_owner
      reason: repeated_failures

    - condition: validation_time > 30s
      escalate_to: it_support
      reason: performance_issue

    - condition: compliance_flag == true
      escalate_to: compliance_officer
      reason: compliance_concern
      priority: immediate
```

### 4. Configure Agent Tools & Integrations

**4.1 Define System Access**

```yaml
tools_and_integrations:
  systems:
    - name: CRM System
      type: database
      access_level: read-only
      credentials: crm_api_key
      endpoints:
        - GET /customers/{id}
        - GET /customers/search

    - name: Email Validator API
      type: rest_api
      access_level: read
      credentials: email_validator_key
      rate_limit: 100_per_minute

    - name: ClickUp API
      type: rest_api
      access_level: read_write
      credentials: clickup_api_token
      operations:
        - update_task_status
        - add_comment
        - update_custom_field
```

**4.2 Define Agent Commands**

```yaml
commands:
  - command: "*validate-data"
    description: "Validate customer data against quality standards"
    parameters:
      - name: customer_id
        type: string
        required: true
      - name: validation_level
        type: enum
        options: [basic, standard, comprehensive]
        default: standard
    output: validation_report

  - command: "*check-duplicates"
    description: "Search for duplicate customer records"
    parameters:
      - name: customer_data
        type: object
        required: true
    output: duplicate_check_result

  - command: "*help"
    description: "Show available commands and usage"
```

### 5. Generate Agent Files

**5.1 Create Agent Definition File**

Output to: `agents/{agent_id}.md`

Follow AIOS agent markdown format:

```markdown
# Data Validation Agent

## Role & Purpose

**Agent ID:** data-validation-agent
**Role:** Automated Data Quality Checker
**Purpose:** Validates customer data against quality standards before processing

## Expertise

- Data format validation (email, phone, postal codes)
- Business rule enforcement
- Duplicate detection
- Data quality scoring

## Commands

### *validate-data

Validates customer data against quality standards.

**Parameters:**
- `customer_id` (string, required): Customer ID to validate
- `validation_level` (enum, optional): basic | standard | comprehensive

**Example:**
```
@data-validation-agent *validate-data customer_id="CUST-12345" validation_level="comprehensive"
```

### *check-duplicates
...

### *help
...

## Task References

This agent executes:
- `tasks/validate-customer-data.yaml`
- `tasks/check-data-quality.yaml`

## Template Usage

Uses templates:
- `templates/validation-report-tmpl.yaml`
- `templates/data-quality-score-tmpl.yaml`

## Integration with Process

**Activation:** `@hybridOps:data-validator`
**Phase:** Phase 2 - Data Validation
**Replaces:** Manual data validation by coordinators
**Confidence Threshold:** 0.85
**Fallback Executor:** sarah-coordinator

## Capabilities & Limitations

**Can Do:**
- Validate data formats automatically
- Check completeness of required fields
- Detect duplicate records
- Score data quality
- Apply configurable business rules

**Cannot Do:**
- Make subjective judgments about data legitimacy
- Handle edge cases requiring human context
- Approve exceptions to business rules
- Modify external systems directly

## Decision Logic

**High Confidence (≥ 0.95):**
- Complete task automatically
- Proceed to next task

**Medium Confidence (0.80-0.94):**
- Flag for human review
- Add review note

**Low Confidence (< 0.80):**
- Escalate immediately to human executor
- Log escalation reason
```

**5.2 Include Integration Details**

In agent file, document:
- How to activate agent in ClickUp
- What custom fields agent reads/writes
- Notification preferences
- Logging configuration

### 6. Create Agent Activation Commands

**6.1 Define Slash Commands**

```yaml
agent_commands:
  - slash_command: "@hybridOps:data-validator"
    agent_id: data-validation-agent
    activation_context: hybrid-ops
    description: "Activate data validation agent"
    auto_load_task: true

  - slash_command: "@hybridOps:risk-assessor"
    agent_id: risk-assessment-agent
    activation_context: hybrid-ops
    description: "Activate risk assessment agent"
```

**6.2 Configure Auto-Activation Rules**

When should agent automatically activate?

```yaml
auto_activation:
  - trigger:
      task_type: validate-customer-data
      executor_type: agent
    then:
      activate: data-validation-agent
      load_task_context: true

  - trigger:
      clickup_webhook: task_status_changed
      new_status: Validation Required
    then:
      activate: data-validation-agent
      with_task_id: from_webhook
```

### 7. Create Agent-to-Task Mapping

**7.1 Document Agent Assignments**

```yaml
agent_task_mapping:
  data-validation-agent:
    primary_tasks:
      - validate-customer-data
      - check-data-quality
      - detect-duplicates
    backup_tasks:
      - manual-data-review (when human unavailable)

  risk-assessment-agent:
    primary_tasks:
      - assess-customer-risk
      - evaluate-transaction-risk
    backup_tasks: []
```

### 8. Define Agent Testing Strategy

**8.1 Create Test Plan**

For each agent:

```yaml
testing:
  unit_tests:
    - test_data_format_validation
    - test_duplicate_detection
    - test_confidence_scoring
    - test_error_handling

  integration_tests:
    - test_crm_integration
    - test_clickup_integration
    - test_email_validator_api

  end_to_end_tests:
    - test_full_validation_workflow
    - test_escalation_path
    - test_low_confidence_handling

  performance_tests:
    - test_validation_speed (< 5s)
    - test_concurrent_validations (10+ simultaneous)
```

**8.2 Define Readiness Criteria**

When is agent ready for production?

```yaml
readiness_criteria:
  - [ ] All unit tests passing
  - [ ] Integration tests passing
  - [ ] End-to-end workflow tested
  - [ ] Performance benchmarks met
  - [ ] Error handling verified
  - [ ] Escalation paths tested
  - [ ] Confidence thresholds validated
  - [ ] Fallback executor confirmed available
  - [ ] Logging and monitoring configured
  - [ ] Documentation complete
```

### 9. Plan Agent Go-Live

**9.1 Define Rollout Strategy**

```yaml
rollout:
  phase_1_pilot:
    duration: 1 week
    scope: 10% of tasks
    success_criteria:
      - confidence_accuracy >= 90%
      - false_positives < 5%
      - escalation_rate < 20%

  phase_2_expansion:
    duration: 2 weeks
    scope: 50% of tasks
    success_criteria:
      - confidence_accuracy >= 92%
      - false_positives < 3%
      - escalation_rate < 15%

  phase_3_full:
    duration: ongoing
    scope: 100% of tasks
    success_criteria:
      - confidence_accuracy >= 95%
      - false_positives < 2%
      - escalation_rate < 10%
```

## Outputs

- **Agent Definition Files** (`agents/{agent_id}.md`)
  - Complete agent persona
  - Commands and parameters
  - Task references
  - Integration details
  - Capabilities and limitations

- **Agent Activation Commands**
  - Slash commands for each agent
  - Auto-activation rules
  - Integration with hybrid-ops prefix

- **Agent-to-Task Mapping**
  - Primary task assignments
  - Backup task assignments
  - Activation contexts

- **Agent Testing Plans**
  - Test strategies per agent
  - Readiness criteria
  - Performance benchmarks

- **Agent Rollout Plan**
  - Phased rollout strategy
  - Success criteria
  - Go-live timelines

## Next Steps

**Handoff to Phase 9: Compliance Validation & Documentation**

When agent generation is complete:
1. Confirm: All required agents defined
2. Confirm: Agent behaviors specified
3. Confirm: Testing plans complete
4. Confirm: Rollout strategy defined
5. **Activate:** `@hybridOps:compliance-validator` + `@hybridOps:doc-generator` for Phase 9
6. **Pass:** Agent definitions and testing plans

**Success Criteria for Handoff:**
- [ ] Agent definitions complete for all planned agents
- [ ] Commands defined with parameters
- [ ] Decision logic configured
- [ ] Error handling and escalation rules defined
- [ ] System integrations documented
- [ ] Testing plans complete
- [ ] Readiness criteria defined
- [ ] Rollout strategy approved
