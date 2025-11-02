# AIOS-PM Compliance Checklist

**Version**: 1.0.0
**Purpose**: Standard compliance criteria for AIOS-PM hybrid processes
**Audience**: Process designers, compliance validators, quality auditors

---

## Overview

This checklist defines the **AIOS-PM methodology standards** that all hybrid processes must meet before production deployment.

**Total Possible Score**: 100 points
**Minimum for Production**: 90 points (90%)
**Critical Categories Minimum**: 85% each

---

## Scoring System

### Grade Thresholds

| Grade | Score Range | Status | Action |
|-------|-------------|--------|--------|
| ✅ **Excellent** | 90-100% | Ready for production | Deploy |
| ⚠️ **Good** | 75-89% | Minor improvements needed | Fix major issues, deploy |
| ❌ **Fair** | 60-74% | Major improvements required | Significant rework needed |
| 🚫 **Poor** | < 60% | Not ready | Redesign required |

### Critical Categories

These categories **MUST** score ≥ 85% individually:
- Tasks (15 points)
- Executors (15 points)
- Data Contracts (15 points)

---

## Category 1: Process Structure (20 points)

### Process Metadata (10 points)

**Criteria**:
- [ ] **2 pts**: Process ID present and valid format (kebab-case)
- [ ] **2 pts**: Process name descriptive and clear
- [ ] **2 pts**: Process type specified (operational/development/hybrid)
- [ ] **2 pts**: Process owner assigned (name + contact)
- [ ] **2 pts**: Version number present (semantic versioning)

**Validation**:
```yaml
process:
  id: customer-onboarding
  name: Customer Onboarding Process
  type: operational
  owner:
    name: Sarah Thompson
    email: sarah@company.com
  version: 1.0.0
```

### Phase Structure (10 points)

**Criteria**:
- [ ] **2 pts**: 3-7 phases defined (not too few, not too many)
- [ ] **2 pts**: Each phase has entry criteria
- [ ] **2 pts**: Each phase has exit criteria
- [ ] **2 pts**: Phase sequence is logical (no skips)
- [ ] **2 pts**: Phase gates configured where appropriate

**Validation Rules**:
- Minimum 3 phases
- Maximum 7 phases
- Entry criteria: list of conditions to start phase
- Exit criteria: list of conditions to complete phase
- Gates: at least 1 gate at a critical transition

### Task Organization (Included in Phase Structure)

**Criteria** (embedded validation):
- [ ] All tasks belong to exactly one phase
- [ ] Task IDs unique across process
- [ ] Task names use action verbs (collect, validate, configure, etc.)
- [ ] Complexity estimated for all tasks (trivial/low/medium/high/very-high)

---

## Category 2: Task Definitions (15 points)

**Critical Category**: Must score ≥ 85% (13/15 points)

### Required Fields per Task (10 points)

**Criteria** (per task):
- [ ] **1 pt**: Task metadata complete (id, name, phase)
- [ ] **1 pt**: Executor assigned (type + assigned_to)
- [ ] **2 pts**: Workflow reference present (workflow_id + file)
- [ ] **2 pts**: Input schema defined (JSON Schema format)
- [ ] **2 pts**: Output schema defined (JSON Schema format)
- [ ] **1 pt**: Quality checklist present (≥ 3 items)
- [ ] **1 pt**: Handoff configuration complete (next_task, trigger, method)

**Validation**:
```yaml
task:
  metadata:
    id: task-name
    name: Task Name
    phase: 1
  executor:
    type: human
    assigned_to: executor-id
  workflow:
    workflow_id: task-name
    workflow_file: workflows/task-name.md
  data_contracts:
    input:
      schema: { ... }
    output:
      schema: { ... }
  quality_checklist:
    - item: Check X
    - item: Verify Y
    - item: Validate Z
  handoff:
    next_task: next-task-id
    trigger: status_change
    method: automatic
```

### Quality Standards per Task (5 points)

**Criteria** (per task):
- [ ] **1 pt**: Task description clear and actionable
- [ ] **1 pt**: Prerequisites documented
- [ ] **1 pt**: Tools/systems specified
- [ ] **1 pt**: Estimated duration provided
- [ ] **1 pt**: Success criteria measurable

**Scoring**:
- Calculate average completeness across all tasks
- Deduct 1 point for each task with missing elements

---

## Category 3: Executors (15 points)

**Critical Category**: Must score ≥ 85% (13/15 points)

### Executor Definitions (10 points)

**Criteria** (per executor):
- [ ] **2 pts**: All executors have definition files
- [ ] **2 pts**: Skills and expertise documented
- [ ] **2 pts**: Tools and systems access specified
- [ ] **2 pts**: Capacity/availability noted
- [ ] **1 pt**: For agents: framework and capabilities defined
- [ ] **1 pt**: For hybrid: primary/fallback logic clear

**Validation**:
```yaml
executor:
  id: executor-name
  type: human | agent | hybrid
  skills:
    - skill-1
    - skill-2
  tools:
    - tool-1
    - tool-2
  capacity:
    hours_per_week: 40
    utilization: 75%
  # If agent:
  framework: AIOS
  capabilities:
    - capability-1
  # If hybrid:
  primary: agent-id
  fallback: human-id
  escalation_trigger: confidence < 0.8
```

### Assignment Matrix (5 points)

**Criteria**:
- [ ] **1 pt**: All tasks have executors assigned
- [ ] **1 pt**: Assignment rationale provided
- [ ] **1 pt**: No executor over-allocated (>80% capacity)
- [ ] **1 pt**: Skill gaps identified
- [ ] **1 pt**: RACI matrix present (Responsible, Accountable, Consulted, Informed)

**Validation Rules**:
- Every task must have assigned_executor
- Workload calculation: task count × complexity × duration
- Maximum utilization: 80% of capacity
- Skill gap: required skill not available in any executor

---

## Category 4: Data Contracts (15 points)

**Critical Category**: Must score ≥ 85% (13/15 points)

### Schema Completeness (10 points)

**Criteria**:
- [ ] **2 pts**: All tasks have input schema
- [ ] **2 pts**: All tasks have output schema
- [ ] **2 pts**: Schemas use valid JSON Schema format
- [ ] **2 pts**: Required fields marked
- [ ] **2 pts**: Data types specified

**Validation**:
```yaml
data_contracts:
  input:
    schema:
      type: object
      properties:
        field_1:
          type: string
          description: What this field contains
        field_2:
          type: number
          minimum: 0
      required:
        - field_1
    source: previous-task-id

  output:
    schema:
      type: object
      properties:
        result_1:
          type: string
        result_2:
          type: boolean
      required:
        - result_1
    destination: next-task-id
```

### Handoff Mappings (5 points)

**Criteria** (per handoff):
- [ ] **1 pt**: Each handoff has data mapping
- [ ] **1 pt**: Output fields map to input fields
- [ ] **1 pt**: Transformation rules documented (if needed)
- [ ] **1 pt**: Validation before handoff defined
- [ ] **1 pt**: Error handling for mapping failures

**Validation Rules**:
- Output schema of Task A must contain all required input fields of Task B
- Field types must be compatible
- Transformations must be deterministic

---

## Category 5: QA Gates (10 points)

### Gate Configuration (7 points)

**Criteria** (per gate):
- [ ] **1 pt**: Critical handoffs have QA gates
- [ ] **1 pt**: Validation criteria measurable
- [ ] **1 pt**: Severity levels defined (critical/major/minor)
- [ ] **2 pts**: Decision matrix complete (PASS/CONCERNS/FAIL/WAIVED)
- [ ] **1 pt**: Escalation rules present
- [ ] **1 pt**: Gate validators assigned

**Validation**:
```yaml
qa_gate:
  gate_id: gate-name
  location: after-task-id
  type: blocking | warning | informational
  validator:
    type: agent | human
    assigned_to: validator-id
  validation_criteria:
    - criterion: All required fields present
      severity: critical
      check: automated
    - criterion: Data format valid
      severity: critical
      check: automated
  decision_matrix:
    PASS:
      criteria: All critical checks pass
      action: proceed_automatically
    FAIL:
      criteria: Any critical check fails
      action: block_handoff
  escalation:
    trigger: blocked > 4 hours
    to: process-owner
```

### Gate Coverage (3 points)

**Criteria**:
- [ ] **1 pt**: High-risk tasks have gates
- [ ] **1 pt**: Phase boundaries have gates (where appropriate)
- [ ] **1 pt**: No unnecessary gates (avoid gate fatigue)

**Validation Rules**:
- High-risk: tasks with complexity ≥ high
- Phase boundaries: at least 1 gate between phases
- Gate fatigue: no more than 30% of handoffs have gates

---

## Category 6: ClickUp Configuration (10 points)

### Structure (3 points)

**Criteria**:
- [ ] **2 pts**: Space/folder/list structure defined
- [ ] **1 pt**: Lists map to phases (1:1 or logical grouping)

**Validation**:
```yaml
clickup_config:
  space:
    name: Process Name
    id: space-id
  lists:
    - list_id: list-1
      list_name: Phase 1 Name
      maps_to_phase: 1
    - list_id: list-2
      list_name: Phase 2 Name
      maps_to_phase: 2
```

### Custom Fields (4 points)

**Criteria**:
- [ ] **2 pts**: All AIOS-PM standard fields configured (20 fields)
- [ ] **1 pt**: Field types appropriate for data
- [ ] **1 pt**: Required fields marked

**AIOS-PM Standard Fields** (must have):
1. Executor Type (dropdown)
2. Assigned Executor (text/user)
3. Task Type (dropdown)
4. Complexity (dropdown)
5. Automation Ready (checkbox)
6. Primary Executor (text) [hybrid]
7. Fallback Executor (text) [hybrid]
8. Escalation Trigger (text) [hybrid]
9. Migration Stage (dropdown) [hybrid]
10. Input Schema (URL)
11. Output Schema (URL)
12. Data Complete (checkbox)
13. Gate Status (dropdown)
14. Validation Issues (long text)
15. Validation Score (number)
16. Quality Score (number)
17. Estimated Duration (time)
18. Actual Duration (time)
19. Handoff Trigger (text)
20. Process Version (text)

### Automations (2 points)

**Criteria**:
- [ ] **1 pt**: Handoff automations configured
- [ ] **1 pt**: QA gate triggers defined

**Validation**:
- At least 1 automation per automatic handoff
- At least 1 automation per QA gate

### Views & Templates (1 point)

**Criteria**:
- [ ] **0.5 pt**: Views for each stakeholder type
- [ ] **0.5 pt**: Task templates for each task type

---

## Category 7: Documentation (5 points)

### Required Documentation

**Criteria**:
- [ ] **1 pt**: Process README present
- [ ] **1 pt**: All workflows documented (1 file per task)
- [ ] **1 pt**: All executors documented (1 file per executor)
- [ ] **0.5 pt**: All agents documented (if applicable)
- [ ] **0.5 pt**: Quick start guide present
- [ ] **0.5 pt**: Troubleshooting section present
- [ ] **0.5 pt**: Examples provided

**Validation**:
```
process/
├── README.md                    # Required
├── workflows/                   # Required
│   ├── task-1.md
│   └── task-2.md
├── executors/                   # Required
│   ├── executor-1.md
│   └── executor-2.md
├── agents/                      # If applicable
│   └── agent-1.md
├── QUICKSTART.md                # Required
├── TROUBLESHOOTING.md           # Required
└── examples/                    # Required
    └── example-1.md
```

---

## Usage

### For Process Designers

**Before Validation**:
1. Use this checklist during design
2. Self-assess each category
3. Fix issues before formal validation

**Self-Assessment**:
```
Category 1: Process Structure
  ✅ Process ID: customer-onboarding
  ✅ Process name: Customer Onboarding
  ✅ Process type: operational
  ✅ Owner: Sarah Thompson
  ✅ Version: 1.0.0
  ✅ 5 phases (within 3-7 range)
  ⚠️ Phase gate missing after Phase 1
  Score: 18/20 (90%)
```

### For Compliance Validators

**Validation Process**:
1. Load process artifacts
2. Check each category systematically
3. Score each criterion (binary: 0 or max points)
4. Calculate category totals
5. Calculate overall score
6. Identify critical/major/minor issues
7. Generate compliance report

**Automated Validation**:
Use `@hybridOps:compliance-validator` agent with `*validate-process` command.

### For Stakeholders

**Go/No-Go Decision**:
- **Score ≥ 90%** + **Zero critical issues** → ✅ APPROVED
- **Score 75-89%** + **Minor issues only** → ⚠️ CONDITIONAL APPROVAL
- **Score < 75%** OR **Critical issues** → ❌ NOT APPROVED

---

## Issue Severity Levels

### Critical Issues (Block Deployment)

**Must Fix Before Go-Live**:
- Missing required task fields
- Data contract mismatches
- No executor assigned to tasks
- Missing input/output schemas
- Critical QA gates missing
- Zero documentation

**Impact**: Process will fail in production

### Major Issues (Should Fix)

**Can Deploy with Waiver**:
- Minor schema incompatibilities
- Missing quality checklists
- Workload imbalances
- Incomplete documentation
- Missing non-critical automations

**Impact**: Process may have quality issues

### Minor Issues (Nice to Fix)

**Track for Future Improvement**:
- Missing examples
- Incomplete descriptions
- Suggested additional gates
- Style inconsistencies

**Impact**: Reduces usability but doesn't block

---

## Compliance Scoring Examples

### Example 1: Excellent Process (94%)

```
Category 1: Process Structure       18/20 (90%)
Category 2: Tasks                   14/15 (93%)
Category 3: Executors               15/15 (100%)
Category 4: Data Contracts          13/15 (87%)
Category 5: QA Gates                 9/10 (90%)
Category 6: ClickUp Config          10/10 (100%)
Category 7: Documentation            5/5  (100%)
-------------------------------------------
TOTAL:                              94/100 (94%) ✅ EXCELLENT
```

**Issues**:
- MINOR: Add gate after Phase 1
- MAJOR: Fix output schema on 1 task

**Decision**: ✅ APPROVED for production (fix major issue first)

### Example 2: Good Process (82%)

```
Category 1: Process Structure       16/20 (80%)
Category 2: Tasks                   12/15 (80%)
Category 3: Executors               13/15 (87%)
Category 4: Data Contracts          12/15 (80%)
Category 5: QA Gates                 8/10 (80%)
Category 6: ClickUp Config           9/10 (90%)
Category 7: Documentation            4/5  (80%)
-------------------------------------------
TOTAL:                              82/100 (82%) ⚠️ GOOD
```

**Issues**:
- MAJOR: 3 tasks missing quality checklists
- MAJOR: 2 data contract mismatches
- MINOR: Incomplete documentation

**Decision**: ⚠️ CONDITIONAL APPROVAL (fix major issues first)

### Example 3: Poor Process (58%)

```
Category 1: Process Structure       12/20 (60%)
Category 2: Tasks                    9/15 (60%)
Category 3: Executors                8/15 (53%) ❌ BELOW CRITICAL
Category 4: Data Contracts           8/15 (53%) ❌ BELOW CRITICAL
Category 5: QA Gates                 5/10 (50%)
Category 6: ClickUp Config           7/10 (70%)
Category 7: Documentation            3/5  (60%)
-------------------------------------------
TOTAL:                              58/100 (58%) 🚫 POOR
```

**Issues**:
- CRITICAL: 5 tasks have no executor assigned
- CRITICAL: 8 tasks missing data contracts
- CRITICAL: No QA gates at critical handoffs
- MAJOR: Multiple structural issues

**Decision**: 🚫 NOT APPROVED - Significant redesign required

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-10-06 | Initial release |

---

## References

- **AIOS-PM Methodology**: Full methodology documentation
- **Compliance Validator Agent**: Automated validation tool
- **Process Templates**: Standard templates for AIOS-PM processes
- **Best Practices Guide**: Design patterns and recommendations

---

_AIOS-PM Compliance Checklist v1.0.0_
_Part of: hybrid-ops expansion pack_
