# Implement ClickUp Configuration Task

## Purpose

To design the complete ClickUp workspace configuration for the hybrid process, enabling operational tracking, automation, and human-agent collaboration.

## Inputs

- Task definitions from Phase 5 (`tasks/{task_id}.yaml`)
- Executor assignment matrix from Phase 3
- QA gate definitions from Phase 6 (`qa-gates/{task_id}-gate.yaml`)
- Process definition from Phase 2
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Design Space/Folder/List Structure

**1.1 Map Process to ClickUp Hierarchy**

**Ask:** "How should we organize this process in ClickUp?"

**Common Patterns:**

**Option A: One List per Phase**
```
Space: Customer Onboarding
├── Folder: (none)
├── List: Phase 1 - Data Collection
├── List: Phase 2 - Validation
├── List: Phase 3 - Setup
└── List: Phase 4 - Completion
```

**Option B: One List for Entire Process**
```
Space: Customer Onboarding
└── List: Onboarding Pipeline
    (Tasks move through statuses representing phases)
```

**Option C: Folder per Process Instance**
```
Space: Customer Operations
├── Folder: Customer-12345 Onboarding
│   ├── List: Collection Tasks
│   ├── List: Validation Tasks
│   └── List: Setup Tasks
```

**1.2 Define List Structure**

For each list:
- **List Name:** Clear, descriptive name
- **Purpose:** What tasks go here?
- **Default Status Workflow:** Planned → In Progress → Review → Complete
- **List Color:** Visual identification

### 2. Configure Custom Fields

**2.1 Load ClickUp Configuration Template**

Use: `templates/clickup-config-tmpl.yaml`
Output to: `output/clickup/{process_id}-clickup-config.yaml`

**2.2 Configure AIOS-PM Standard Fields**

**Required Fields for All Tasks:**

```yaml
custom_fields:
  # Executor Management
  - name: "Executor Type"
    type: dropdown
    options: [Human, Agent, Hybrid]
    required: true

  - name: "Assigned Executor"
    type: text
    description: "Executor ID from assignment matrix"
    required: true

  # Task Classification
  - name: "Task Type"
    type: dropdown
    options: [Manual, Semi-Automated, Fully-Automated]
    required: true

  - name: "Complexity"
    type: dropdown
    options: [Trivial, Low, Medium, High, Very High]
    required: true

  # Automation Tracking
  - name: "Automation Ready"
    type: dropdown
    options: [Not Ready, In Development, Testing, Production]
    default: Not Ready

  - name: "Agent Confidence"
    type: number
    description: "For agent/hybrid tasks: confidence score 0-1"
    applies_to: [Agent, Hybrid]

  # Data Contracts
  - name: "Input Data Schema"
    type: text
    description: "Reference to input schema definition"

  - name: "Output Data Schema"
    type: text
    description: "Reference to output schema definition"

  - name: "Data Source"
    type: text
    description: "Previous task ID providing input"

  - name: "Data Destination"
    type: text
    description: "Next task ID receiving output"

  # QA Gates
  - name: "QA Gate"
    type: dropdown
    options: [None, Automatic, Manual, Hybrid]
    default: None

  - name: "QA Status"
    type: dropdown
    options: [Not Started, In Review, Pass, Concerns, Fail, Waived]
    applies_when: "QA Gate != None"

  # Workflow Integration
  - name: "Workflow ID"
    type: text
    description: "Reference to workflow definition file"

  - name: "Next Task"
    type: relationship
    link_to: tasks
    description: "Next task in sequence"

  - name: "Blocked By"
    type: relationship
    link_to: tasks
    description: "Dependencies that must complete first"
```

**2.3 Add Process-Specific Custom Fields**

Add fields specific to your process:
- Customer ID
- Order Number
- Priority Level
- SLA Deadline
- Cost Center
- Approval Status
- etc.

### 3. Design Automations

**3.1 Status Change Automations**

Configure automatic actions when task status changes:

```yaml
automations:
  - name: "Automatic Handoff on Complete"
    trigger:
      type: status_change
      from: In Progress
      to: Complete
    condition: "QA Gate == None OR QA Status == Pass"
    actions:
      - create_next_task:
          from_field: Next Task
          copy_data:
            - Input Data Schema
            - Customer ID
      - notify_executor:
          executor_field: Assigned Executor
          message: "New task assigned: {task_name}"

  - name: "QA Gate Trigger on Complete"
    trigger:
      type: status_change
      from: In Progress
      to: Complete
    condition: "QA Gate != None"
    actions:
      - change_status:
          to: QA Review
      - assign_to_reviewer:
          role: qa_reviewer
      - send_notification:
          to: qa_team
          message: "Task ready for QA: {task_name}"
```

**3.2 QA Gate Automations**

```yaml
  - name: "QA Pass - Automatic Handoff"
    trigger:
      type: custom_field_change
      field: QA Status
      to: Pass
    actions:
      - change_status:
          to: Complete
      - create_next_task:
          from_field: Next Task

  - name: "QA Fail - Return to Executor"
    trigger:
      type: custom_field_change
      field: QA Status
      to: Fail
    actions:
      - change_status:
          to: In Progress
      - assign_to:
          field: Assigned Executor
      - add_comment:
          text: "QA validation failed. Please review and correct."
      - notify_executor:
          message: "Task returned for correction: {task_name}"
```

**3.3 Escalation Automations**

```yaml
  - name: "Overdue Task Escalation"
    trigger:
      type: scheduled
      frequency: hourly
    condition: "Status == In Progress AND Due Date < NOW() - 4 hours"
    actions:
      - send_notification:
          to: process_owner
          message: "Task overdue: {task_name}"
      - add_tag: overdue

  - name: "Agent Low Confidence Alert"
    trigger:
      type: custom_field_change
      field: Agent Confidence
      condition: "< 0.80"
    actions:
      - change_executor_type:
          to: Human
      - assign_to:
          from_field: Fallback Executor
      - notify:
          message: "Low confidence detected, escalated to human"
```

### 4. Create Views

**4.1 Executor-Specific Views**

```yaml
views:
  - name: "My Human Tasks"
    type: list
    filters:
      - Executor Type == Human
      - Assigned Executor == {current_user}
      - Status != Complete
    group_by: Status
    sort_by: Due Date

  - name: "Agent Tasks Dashboard"
    type: board
    filters:
      - Executor Type == Agent
      - Status != Complete
    group_by: Assigned Executor
    show_fields:
      - Agent Confidence
      - QA Status
      - Next Task
```

**4.2 Management Views**

```yaml
  - name: "Process Overview"
    type: timeline
    filters:
      - Process ID == {process_id}
    group_by: Phase
    show_fields:
      - Executor Type
      - Complexity
      - Due Date

  - name: "Automation Readiness"
    type: table
    filters:
      - Executor Type == Human
      - Automation Ready != Production
    group_by: Automation Ready
    sort_by: Complexity (descending)
    show_fields:
      - Task Type
      - Complexity
      - Assigned Executor
      - Automation Ready
```

**4.3 QA and Compliance Views**

```yaml
  - name: "QA Review Queue"
    type: list
    filters:
      - Status == QA Review
      - QA Status == In Review
    sort_by: Created Date
    show_fields:
      - Assigned Executor
      - QA Gate
      - Due Date

  - name: "Failed QA Gates"
    type: table
    filters:
      - QA Status == Fail
      - Status != Complete
    group_by: Task Type
    sort_by: Created Date
```

### 5. Define Task Templates

**5.1 Create Template per Task Type**

For each unique task in process:

```yaml
task_templates:
  - template_name: "Validate Customer Data"
    task_type_id: validate-customer-data
    pre_filled_fields:
      Executor Type: Hybrid
      Assigned Executor: data-validation-agent
      Task Type: Semi-Automated
      Complexity: Medium
      QA Gate: Automatic
      Workflow ID: validate-customer-data
    default_checklist:
      - "Fetch customer record from CRM"
      - "Verify all required fields present"
      - "Validate email and phone formats"
      - "Run duplicate check"
      - "Update validation status"
    default_description: |
      Validate customer data meets quality standards before processing.

      Workflow: workflows/validate-customer-data.md
      Input Schema: schemas/customer-data-input.json
      Output Schema: schemas/validation-result-output.json
```

**5.2 Configure Template Automations**

When template is used:
- Auto-fill custom fields from template
- Apply default checklist
- Set default assignee
- Configure due date (relative to creation)

### 6. Generate Implementation Guide

**6.1 Create Step-by-Step Setup Instructions**

Output to: `output/clickup/{process_id}-setup-guide.md`

```markdown
# ClickUp Implementation Guide: {Process Name}

## Step 1: Create Space
1. In ClickUp, create new Space: "{Space Name}"
2. Set space color: {color}
3. Add team members: {list members}

## Step 2: Create Lists
1. In space, create lists for each phase:
   - {List 1 name}
   - {List 2 name}
   - etc.

## Step 3: Configure Custom Fields
1. In space settings, go to Custom Fields
2. Add each field from configuration:
   - {Field 1}: {type} - {options}
   - {Field 2}: {type} - {options}
   - etc.

## Step 4: Set Up Automations
1. In space settings, go to Automations
2. Create each automation:
   - Automation 1: {description}
     - Trigger: {trigger}
     - Actions: {actions}
   - etc.

## Step 5: Create Views
...

## Step 6: Create Task Templates
...

## Step 7: Testing Checklist
- [ ] Create test task in each list
- [ ] Verify custom fields appear correctly
- [ ] Test status change automations
- [ ] Verify QA gate automation works
- [ ] Test task template creation
- [ ] Confirm notifications work
```

**6.2 Include Screenshots/Mockups**

- Custom field configuration screenshots
- Automation setup examples
- View configuration examples
- Task template examples

**6.3 Create Testing Checklist**

Validation steps to confirm setup is correct:
- All custom fields present
- Automations fire correctly
- Views show expected data
- Templates work as designed
- Notifications deliver

## Outputs

- **Complete ClickUp Configuration** (`output/clickup/{process_id}-clickup-config.yaml`)
  - Space/List structure defined
  - Custom fields configured (AIOS-PM standard + process-specific)
  - Automations defined (handoffs, QA gates, escalations)

- **Automation Definitions** (embedded in config)
  - Status change triggers
  - QA gate automations
  - Escalation rules
  - Notification automations

- **View Configurations** (embedded in config)
  - Executor-specific views
  - Management dashboards
  - QA and compliance views

- **Task Templates** (embedded in config)
  - Template per task type
  - Pre-filled custom fields
  - Default checklists
  - Auto-assignment rules

- **Implementation Guide** (`output/clickup/{process_id}-setup-guide.md`)
  - Step-by-step ClickUp setup
  - Screenshots and examples
  - Testing checklist
  - Troubleshooting guide

## Next Steps

**Handoff to Phase 8: Agent Generation**

When ClickUp implementation design is complete:
1. Confirm: ClickUp structure designed (space/lists/fields)
2. Confirm: Automations configured (handoffs, QA, escalations)
3. Confirm: Views created (executors, management, QA)
4. Confirm: Task templates defined
5. Confirm: Implementation guide ready
6. **Activate:** `@hybridOps:agent-generator` for Phase 8
7. **Pass:** ClickUp configuration and setup guide

**Success Criteria for Handoff:**
- [ ] Space/List structure defined
- [ ] AIOS-PM custom fields configured
- [ ] Process-specific custom fields added
- [ ] Automations defined for all key triggers
- [ ] Views created for all stakeholder types
- [ ] Task templates created for all task types
- [ ] Implementation guide complete with testing checklist
- [ ] Stakeholder approval received
