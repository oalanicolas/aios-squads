# Create Task Definitions Task

## Purpose

To create unified task definitions with explicit data contracts, enabling seamless handoffs between tasks and executors in the hybrid process.

## Inputs

- Process definition YAML from Phase 2 (`output/processes/{process_id}.yaml`)
- Workflow definitions from Phase 4 (`workflows/{workflow_id}.md`)
- Executor assignment matrix from Phase 3
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Load Required Context

**1.1 Review Process Structure**

Load and understand:
- Complete task list from process definition
- Task dependencies and sequencing
- Executor assignments per task
- Workflow definitions created in Phase 4

**1.2 Identify Data Flow**

Map data movement through process:
- What data is created in each task?
- What data is consumed by each task?
- Where does data come from?
- Where does data go?

### 2. Create Task Definitions

**For Each Task in Process:**

**2.1 Load Task Template**

Use: `templates/meta/task-unified-tmpl.yaml`
Output to: `tasks/{task_id}.yaml`

**2.2 Define Core Task Metadata**

```yaml
task:
  id: validate-customer-data
  name: "Validate Customer Data"
  description: "Verify customer information meets quality standards"
  phase: data-collection
  complexity: medium
  estimated_duration: 2h
```

**2.3 Configure Executor Assignment**

Reference executor from assignment matrix:

**For Human Executor:**
```yaml
executor:
  type: human
  executor_id: sarah-coordinator
  requires_access:
    - crm-system
    - validation-tools
```

**For Agent Executor:**
```yaml
executor:
  type: agent
  executor_id: data-validation-agent
  confidence_threshold: 0.85
  escalation:
    trigger: confidence < 0.85
    fallback_executor: sarah-coordinator
```

**For Hybrid Executor:**
```yaml
executor:
  type: hybrid
  primary: data-validation-agent
  fallback: sarah-coordinator
  decision_logic:
    - if: confidence >= 0.95
      then: agent_completes_automatically
    - if: 0.80 <= confidence < 0.95
      then: agent_flags_for_human_review
    - if: confidence < 0.80
      then: human_takeover_immediate
```

### 3. Define Data Contracts

**3.1 Define Input Schema**

What data does this task receive?

```yaml
input:
  schema:
    type: object
    properties:
      customer_id:
        type: string
        description: "Unique customer identifier"
      customer_data:
        type: object
        properties:
          name: { type: string, required: true }
          email: { type: string, format: email, required: true }
          phone: { type: string, pattern: "^\\+?[1-9]\\d{1,14}$" }
    required:
      - customer_id
      - customer_data
  source:
    task_id: fetch-customer-record
    field_mapping:
      customer_id: output.customer.id
      customer_data: output.customer.data
```

**3.2 Define Output Schema**

What data does this task produce?

```yaml
output:
  schema:
    type: object
    properties:
      validation_result:
        type: string
        enum: [pass, fail, needs_review]
      issues_found:
        type: array
        items:
          type: object
          properties:
            field: { type: string }
            issue_type: { type: string }
            severity: { type: string, enum: [critical, major, minor] }
      validated_data:
        type: object
    required:
      - validation_result
      - issues_found
  destination:
    - task_id: escalate-data-issues
      condition: validation_result == 'fail'
    - task_id: process-customer-order
      condition: validation_result == 'pass'
```

**3.3 Validate Data Contract Consistency**

Ensure:
- Output fields from previous task match input fields of this task
- Data types are consistent
- Required fields are provided
- Field mappings are correct

### 4. Configure Task Behavior

**4.1 Add Quality Checklist**

Works as checkbox list (humans) or validation rules (agents):

```yaml
quality_checklist:
  - item: "All required fields present and valid"
    validation_rule: "required_fields_complete == true"
  - item: "Email format validated"
    validation_rule: "email_format_valid == true"
  - item: "Phone number normalized"
    validation_rule: "phone_normalized == true"
  - item: "External validation performed"
    validation_rule: "external_validation_status == 'complete'"
```

**4.2 Configure Handoff**

Define how this task hands off to next:

```yaml
handoff:
  next_task:
    - task_id: process-customer-order
      condition: validation_result == 'pass'
      trigger: automatic
    - task_id: escalate-data-issues
      condition: validation_result == 'fail'
      trigger: automatic
    - task_id: manual-review-queue
      condition: validation_result == 'needs_review'
      trigger: manual
  data_mapping:
    customer_id: customer_id
    validated_data: customer_data
    validation_timestamp: validation_completed_at
  handoff_method: automatic
```

**4.3 Define Error Handling**

```yaml
error_handling:
  on_failure:
    - log_error: true
    - notify_executor: true
    - fallback_action: queue_for_manual_processing
  retry_policy:
    max_attempts: 3
    backoff: exponential
  escalation:
    - condition: attempts_exceeded
      action: notify_process_owner
    - condition: critical_error
      action: immediate_escalation
```

### 5. Link Supporting Resources

**5.1 Reference Workflow**

```yaml
workflow:
  workflow_id: validate-customer-data
  location: workflows/validate-customer-data.md
```

**5.2 Link Templates and Tools**

```yaml
resources:
  templates:
    - validation-checklist-template
    - data-quality-report-template
  tools:
    - name: CRM System
      url: https://crm.example.com
      access_required: true
    - name: Email Validator API
      url: https://api.emailvalidator.com
      credentials: email_validator_api_key
  documentation:
    - "Data Validation Standards (docs/standards/data-validation.md)"
    - "CRM System User Guide (docs/guides/crm-guide.pdf)"
```

### 6. Validate Complete Task Definitions

**6.1 Schema Validation**

For each task definition:
- Validate YAML syntax
- Validate against task definition schema
- Check all required fields present
- Verify data types correct

**6.2 Data Contract Validation**

Check data flow integrity:
- All task inputs have valid sources
- All task outputs have valid destinations
- Data types match between tasks
- No broken data dependencies

**6.3 Executor Assignment Validation**

Confirm:
- All tasks have executors assigned
- Executors have required capabilities
- Hybrid executors have complete decision logic
- Escalation paths are defined

### 7. Create Data Flow Map

**7.1 Generate Data Flow Diagram**

Create visual representation:
```
[Task 1] --{customer_data}--> [Task 2] --{validated_data}--> [Task 3]
                                   |
                                   +--{error_details}--> [Error Handler]
```

**7.2 Document Data Dependencies**

List for each task:
- Input dependencies (what data it needs)
- Output consumers (what tasks use its output)
- Optional vs required data
- Default values

## Outputs

- **Complete Task Definitions** (`tasks/{task_id}.yaml` for each task)
  - Core metadata complete
  - Executor assignments configured
  - Data contracts defined (input/output schemas)
  - Quality checklists included
  - Handoff configurations complete
  - Error handling defined

- **Data Contract Schemas** (embedded in task definitions)
  - JSON Schema format
  - Field mappings documented
  - Validation rules defined

- **Task-to-Task Data Mappings** (embedded in handoff configurations)
  - Source → Destination mappings
  - Data transformation rules
  - Conditional routing logic

- **Data Flow Map** (`output/processes/{process_id}-data-flow.md`)
  - Visual representation of data movement
  - Dependency documentation
  - Data lineage tracking

## Next Steps

**Handoff to Phase 6: QA Gate Design**

When task definitions are complete:
1. Confirm: All tasks have complete YAML definitions
2. Confirm: Data contracts validated (no broken dependencies)
3. Confirm: Handoff mappings complete
4. Confirm: Executor assignments valid
5. **Activate:** `@hybridOps:qa-architect` for Phase 6
6. **Pass:** Task definitions and data flow map

**Success Criteria for Handoff:**
- [ ] Task definition YAML for every task
- [ ] All input schemas defined with sources
- [ ] All output schemas defined with destinations
- [ ] Data contracts validated (no gaps)
- [ ] Quality checklists complete
- [ ] Handoff configurations complete
- [ ] Error handling strategies defined
- [ ] Data flow map generated
