# Design QA Gates Task

## Purpose

To design quality assurance gates for critical handoffs and outputs, ensuring data quality, compliance, and process integrity throughout the hybrid process.

## Inputs

- Task definitions from Phase 5 (`tasks/{task_id}.yaml`)
- Data flow map from Phase 5
- Executor assignment matrix from Phase 3
- Compliance requirements from discovery
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Identify QA Gate Candidates

**1.1 Review Critical Handoffs**

Identify where QA gates are needed:
- **Critical Data Transitions:** Data moving between major process phases
- **Executor Type Changes:** Human → Agent or Agent → Human handoffs
- **Compliance Checkpoints:** Regulatory or policy requirements
- **High-Risk Steps:** Tasks with high error rates or severe failure impact
- **External Integrations:** Data going to/from external systems

**Ask:** "Which task outputs are critical to process success?"

**1.2 Prioritize QA Gates**

Rank by:
- **Impact of failure:** Critical > Major > Minor
- **Frequency of errors:** High error rate = high priority
- **Compliance requirements:** Mandatory > Nice-to-have
- **Downstream effects:** How many tasks depend on this output?

**Guidelines:**
- Not every handoff needs a QA gate
- Focus on highest-risk transitions
- Balance thoroughness with process speed
- Typical: 3-7 gates per process

### 2. Design Individual QA Gates

**For Each QA Gate:**

**2.1 Load QA Gate Template**

Use: `templates/meta/qa-gate-tmpl.yaml`
Output to: `qa-gates/{task_id}-gate.yaml`

**2.2 Define Gate Metadata**

```yaml
qa_gate:
  gate_id: customer-data-validation-gate
  gate_name: "Customer Data Quality Gate"
  description: "Ensures customer data meets quality standards before processing"
  applies_to:
    task_id: validate-customer-data
    handoff_point: output
  criticality: high
  enforcement: blocking
```

### 3. Define Validation Criteria

**3.1 Completeness Checks**

What must be present?

```yaml
validation_criteria:
  completeness:
    - check: "All required customer fields present"
      fields_required:
        - customer_id
        - name
        - email
        - phone
      severity: critical
    - check: "Contact information complete"
      fields_required:
        - address.street
        - address.city
        - address.postal_code
      severity: major
```

**3.2 Correctness Checks**

Is the data valid?

```yaml
  correctness:
    - check: "Email format valid"
      validation_rule: "email matches regex pattern"
      pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      severity: critical
    - check: "Phone number valid format"
      validation_rule: "phone matches E.164 format"
      pattern: "^\\+?[1-9]\\d{1,14}$"
      severity: major
    - check: "Postal code valid for country"
      validation_rule: "postal_code matches country pattern"
      severity: minor
```

**3.3 Quality Standards**

Does it meet business rules?

```yaml
  quality:
    - check: "Customer age >= 18"
      validation_rule: "calculated_age >= 18"
      severity: critical
    - check: "Email domain not blacklisted"
      validation_rule: "email_domain not in blacklist"
      severity: major
    - check: "Duplicate customer check"
      validation_rule: "no existing customer with same email"
      severity: major
```

**3.4 Compliance Requirements**

Legal/regulatory checks:

```yaml
  compliance:
    - check: "GDPR consent recorded"
      validation_rule: "gdpr_consent == true AND consent_date present"
      severity: critical
      compliance_standard: "GDPR Article 6"
    - check: "Data retention policy applied"
      validation_rule: "retention_end_date calculated and set"
      severity: major
```

### 4. Design Validation Process

**4.1 Configure Automated Checks**

What can be validated automatically?

```yaml
automated_validation:
  - check_id: email_format
    method: regex_match
    script: "validators/email-validator.js"
    timeout: 5s
  - check_id: duplicate_check
    method: database_query
    query: "SELECT COUNT(*) FROM customers WHERE email = ?"
    expected_result: 0
    timeout: 10s
  - check_id: external_validation
    method: api_call
    endpoint: "https://api.emailvalidator.com/v1/verify"
    auth: email_validator_api_key
    timeout: 30s
```

**4.2 Configure Manual Review Steps**

What requires human judgment?

```yaml
manual_validation:
  - check_id: data_quality_review
    description: "Human review of data completeness and accuracy"
    reviewer_role: data-quality-specialist
    review_checklist:
      - "Customer information is complete"
      - "Data appears legitimate (not spam)"
      - "Special cases handled appropriately"
    estimated_time: 5m
  - check_id: compliance_approval
    description: "Legal team confirms compliance requirements met"
    reviewer_role: compliance-officer
    required_for:
      - enterprise_customers
      - international_customers
    estimated_time: 15m
```

**4.3 Configure Hybrid Validation**

Agent pre-check + human approval:

```yaml
hybrid_validation:
  - check_id: risk_assessment
    agent_precheck:
      agent_id: risk-assessment-agent
      confidence_threshold: 0.90
    human_review:
      required_when: confidence < 0.90
      reviewer_role: risk-manager
      escalation_path: senior-risk-manager
```

### 5. Define Decision Matrix

**5.1 Configure Pass/Fail Logic**

```yaml
decision_matrix:
  pass:
    condition: "all critical checks pass AND major checks >= 90%"
    action: proceed_to_next_task
    notification: none
  concerns:
    condition: "all critical checks pass BUT major checks < 90%"
    action: flag_for_review
    notification: notify_reviewer
    reviewer: data-quality-specialist
  fail:
    condition: "any critical check fails"
    action: block_handoff
    notification: notify_executor_and_owner
    remediation_required: true
  waived:
    condition: "manual waiver approved"
    action: proceed_with_warning
    notification: log_exception
    requires_approval_from: process_owner
```

**5.2 Define Remediation Process**

What happens when validation fails?

```yaml
remediation:
  on_fail:
    - notify_executor: true
    - create_issue:
        title: "Data validation failed for {task_id}"
        severity: based_on_check_severity
        assigned_to: original_executor
    - block_handoff: true
  retry_policy:
    allowed: true
    max_attempts: 3
    requires_changes: true
```

### 6. Configure Severity Levels

**6.1 Define Issue Categories**

```yaml
severity_levels:
  critical:
    description: "Blocking issues that prevent task completion"
    examples:
      - Missing required data
      - Invalid data format
      - Compliance violation
    action: immediate_block
    notification: immediate
  major:
    description: "Significant issues that impact quality"
    examples:
      - Incomplete optional data
      - Data quality concerns
      - Business rule violations
    action: flag_for_review
    notification: within_1_hour
  minor:
    description: "Informational issues for improvement"
    examples:
      - Formatting inconsistencies
      - Optimization suggestions
    action: log_only
    notification: daily_summary
```

### 7. Create Issue Templates

**7.1 Define Standard Issue Format**

```yaml
issue_template:
  title: "{severity}: {check_name} failed for {task_id}"
  description: |
    **Check:** {check_name}
    **Task:** {task_id}
    **Severity:** {severity}

    **Issue Details:**
    {issue_details}

    **Expected:**
    {expected_value}

    **Actual:**
    {actual_value}

    **Remediation Steps:**
    {remediation_steps}
  labels:
    - qa-gate-issue
    - "{severity}"
    - "{task_id}"
  assigned_to: "{original_executor}"
```

### 8. Configure Escalation Rules

**8.1 Define Escalation Triggers**

```yaml
escalation:
  - trigger: "critical issues remain unresolved > 4 hours"
    escalate_to: process_owner
    notification: email + slack
  - trigger: "same check fails 3+ times for same task"
    escalate_to: quality_team
    action: investigate_root_cause
  - trigger: "compliance issues detected"
    escalate_to: compliance_officer
    notification: immediate
    action: halt_all_instances
```

### 9. Validate QA Gate Design

**9.1 Review with Stakeholders**

For each QA gate:
- Review validation criteria with process owner
- Confirm severity levels with quality team
- Validate compliance checks with legal/compliance team
- Get approval from affected executors

**9.2 Test QA Gate Logic**

Dry run with sample data:
- Test pass scenarios
- Test fail scenarios
- Test edge cases
- Verify decision matrix logic
- Confirm notifications work

## Outputs

- **QA Gate Definitions** (`qa-gates/{task_id}-gate.yaml`)
  - Complete validation criteria
  - Automated + manual checks defined
  - Decision matrix configured
  - Severity levels specified
  - Escalation rules defined

- **Validation Criteria per Gate**
  - Completeness checks
  - Correctness checks
  - Quality standards
  - Compliance requirements

- **Issue Templates** (embedded in gate definitions)
  - Standard issue format
  - Remediation guidance
  - Assignment rules

- **Escalation Rules** (embedded in gate definitions)
  - Trigger conditions
  - Escalation paths
  - Notification rules

## Next Steps

**Handoff to Phase 7: ClickUp Implementation Design**

When QA gate design is complete:
1. Confirm: Critical handoffs have QA gates
2. Confirm: Validation criteria defined and measurable
3. Confirm: Decision matrix complete
4. Confirm: Stakeholder approval received
5. **Activate:** `@hybridOps:clickup-engineer` for Phase 7
6. **Pass:** QA gate definitions and validation rules

**Success Criteria for Handoff:**
- [ ] QA gates identified for critical handoffs
- [ ] Validation criteria defined (completeness, correctness, quality, compliance)
- [ ] Decision matrix complete (pass/concerns/fail/waived)
- [ ] Severity levels configured
- [ ] Escalation rules defined
- [ ] Issue templates created
- [ ] Stakeholder approval received
