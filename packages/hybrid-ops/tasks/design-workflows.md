# Design Workflows Task

## Purpose

To create detailed step-by-step workflows for each task in the process, making them executable by both humans and agents using universal instructions.

## Inputs

- Process definition YAML from Phase 2 (`output/processes/{process_id}.yaml`)
- Executor assignment matrix from Phase 3 (`output/processes/{process_id}-executor-matrix.yaml`)
- Task complexity estimates
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Load Process Tasks

**1.1 Review Task List**

From process definition YAML:
- Get complete list of all tasks
- Note assigned executors for each
- Review complexity estimates
- Identify dependencies

**1.2 Prioritize Workflow Creation**

Start with:
- Critical path tasks
- High-complexity tasks
- Tasks with most dependencies
- Tasks assigned to agents

### 2. Create Individual Workflows

**For Each Task in Process:**

**2.1 Load Workflow Template**

Use: `templates/meta/workflow-tmpl.yaml`
Output to: `workflows/{workflow_id}.md`

**2.2 Define Workflow Steps**

Break task into atomic steps:
- Use action verbs (Verify, Fetch, Calculate, Send, etc.)
- Each step should take < 15 minutes
- Define expected outputs per step
- Add validation checkpoints

**Example Structure:**
```
## Workflow: Validate Customer Data

### Step 1: Fetch Customer Record
- Access CRM system
- Search by customer ID
- Retrieve full customer record
- **Output:** Customer data object

### Step 2: Verify Required Fields
- Check all mandatory fields present
- Validate field formats (email, phone, etc.)
- **Output:** Validation result (pass/fail + issues)

### Step 3: Cross-Reference with External Systems
- Query credit bureau
- Verify business registration
- **Output:** External validation status
```

**2.3 Design for Universal Execution**

Make workflows understandable by humans AND agents:
- **Clear Language:** No jargon or ambiguity
- **Examples:** Show sample inputs/outputs
- **Decision Points:** Explicit if-then logic
- **Error Handling:** What to do when things go wrong

**Example Decision Point:**
```
### Decision Point: Data Quality Check

IF all required fields present AND formats valid:
  → Proceed to Step 3
ELSE IF missing non-critical fields:
  → Flag for review, proceed with caution
ELSE:
  → STOP workflow, escalate to coordinator
```

**2.4 Add Prerequisites and Tools**

For each workflow document:

**Prerequisites:**
- Required access/permissions
- Knowledge/skills needed
- Prior tasks that must complete

**Tools and Systems:**
- Software/platforms needed
- Login credentials (reference, not actual credentials)
- APIs or integrations

**Reference Materials:**
- Documentation links
- Training materials
- Templates to use

### 3. Integrate with Task Definitions

**3.1 Link Workflows to Tasks**

Update task definitions with workflow references:
```yaml
task:
  id: validate-customer-data
  workflow_id: validate-customer-data
  workflow_location: workflows/validate-customer-data.md
```

**3.2 Ensure Consistency**

- Workflow ID matches task ID
- Workflow inputs match task input schema
- Workflow outputs match task output schema
- Executor capabilities align with workflow requirements

### 4. Design Error Handling

**For Each Workflow:**

**4.1 Identify Failure Points**

Where can this workflow fail?
- System unavailable
- Invalid data
- Permission denied
- Timeout
- External dependency failure

**4.2 Define Error Responses**

For each failure point:
- **Detection:** How do we know it failed?
- **Logging:** What information to capture?
- **Recovery:** Can we retry? Fallback?
- **Escalation:** Who to notify? When to stop?

**Example:**
```
### Error Handling: CRM System Unavailable

**Detection:** HTTP timeout or 503 error
**Logging:** Log error code, timestamp, request details
**Recovery:**
  - Retry 3 times with exponential backoff
  - If still failing, queue for manual processing
**Escalation:**
  - Notify IT team if system down > 15 minutes
  - Escalate to process owner if backlog > 50 tasks
```

### 5. Add Quality Checkpoints

**5.1 Validation Steps**

Within workflow, add validation checkpoints:
- Data completeness checks
- Format validation
- Business rule validation
- Cross-reference checks

**5.2 Quality Checklist**

End each workflow with quality checklist:
```
## Completion Checklist

- [ ] All required data collected
- [ ] Data formats validated
- [ ] Business rules satisfied
- [ ] External validations complete
- [ ] Results logged in system
- [ ] Next task notified (if applicable)
```

### 6. Review and Test Workflows

**6.1 Walkthrough with Stakeholders**

For each workflow:
- Review with executor who will perform it
- Validate step sequence makes sense
- Confirm tools/access are correct
- Get feedback on clarity

**6.2 Dry Run**

Test workflow execution:
- Human executor walks through it
- Note any confusing steps
- Identify missing information
- Time how long it takes

**6.3 Refine Based on Feedback**

Update workflows based on testing:
- Add missing steps
- Clarify ambiguous instructions
- Add more examples
- Improve error handling

## Outputs

- **Workflow Definitions** (`workflows/{workflow_id}.md` for each task)
  - Step-by-step instructions
  - Decision points documented
  - Error handling defined
  - Quality checklists included

- **Updated Task Definitions**
  - All tasks linked to workflows
  - Workflow IDs consistent
  - Inputs/outputs aligned

- **Workflow Index** (`workflows/README.md`)
  - List of all workflows
  - Quick reference guide
  - Complexity estimates

## Next Steps

**Handoff to Phase 5: Task Definition & Data Contracts**

When workflow design is complete:
1. Confirm: All tasks have workflows
2. Confirm: Workflows are executable by assigned executors
3. Confirm: Decision points and error handling documented
4. Confirm: Stakeholder approval received
5. **Continue:** Same agent (`workflow-designer`) proceeds to Phase 5
6. **Pass:** Workflow definitions and updated task references

**Success Criteria for Handoff:**
- [ ] Workflow created for every task
- [ ] All workflows tested with dry runs
- [ ] Decision points explicitly documented
- [ ] Error handling strategies defined
- [ ] Quality checklists complete
- [ ] Stakeholder approval received
