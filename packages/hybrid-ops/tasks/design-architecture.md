# Design Process Architecture Task

## Purpose

To design the high-level structure of a hybrid process, including phases, tasks, dependencies, and handoff flows. This creates the blueprint that all subsequent design work will follow.

## Inputs

- Discovery document from Phase 1 (`output/discovery/{process_id}-discovery.md`)
- Process requirements and scope
- Automation opportunity list
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Define Process Metadata

**Elicit core process information:**

**Process Identity:**
- **Process ID:** Ask "What ID should we use? (kebab-case, e.g., 'customer-onboarding')"
- **Process Name:** Ask "Human-readable name? (e.g., 'Customer Onboarding Process')"
- **Process Type:** Ask "Is this operational, development, or hybrid?"

**Process Ownership:**
- **Owner:** Ask "Who owns this process? (Name + contact)"
- **Stakeholders:** List from discovery document

**Process Metrics:**
- **Frequency:** How often does this process run?
- **Volume:** How many instances per month/week/day?
- **SLAs:** What are the time commitments?

### 2. Design Phase Structure

**2.1 Break Process into Phases**

Organize tasks into 3-7 logical phases:
- Each phase represents a distinct stage
- Phases should have clear start/end boundaries
- Phases may have gates between them

**Ask:** "How should we group this process into phases?"

**Guidelines:**
- **Minimum:** 3 phases (too few = poor organization)
- **Maximum:** 7 phases (too many = complexity)
- **Typical pattern:** Initiation → Execution → Validation → Completion

**2.2 Define Entry/Exit Criteria**

For each phase:
- **Entry Criteria:** What must be true to START this phase?
- **Exit Criteria:** What must be true to COMPLETE this phase?

**Example:**
```
Phase 1: Data Collection
  Entry: Customer request received
  Exit: All required data collected and validated
```

**2.3 Identify Phase Gates**

Where do we need approval/validation between phases?
- Critical data validation points
- Management approval requirements
- Compliance checkpoints
- Quality gates

### 3. Define Task Breakdown

**3.1 List Tasks per Phase**

For each phase, identify all tasks:
- Use action verb + object (e.g., "Validate Customer Data")
- Break complex work into atomic tasks
- Aim for tasks that take < 4 hours

**Ask:** "What tasks are needed in [Phase Name]?"

**3.2 Assign Complexity Estimates**

Rate each task:
- **Trivial:** < 15 minutes, straightforward
- **Low:** 15-60 minutes, simple logic
- **Medium:** 1-4 hours, some complexity
- **High:** 4-8 hours, complex logic or multiple systems
- **Very High:** > 8 hours (consider breaking down further)

**3.3 Identify Task Dependencies**

For each task:
- What tasks must complete BEFORE this one?
- What data does this task need from previous tasks?
- Can this task run in parallel with others?

**Create dependency map:**
```
Task A → Task B → Task D
      ↘ Task C ↗
```

### 4. Design Handoff Map

**4.1 Define Data Flow**

For each handoff between tasks:
- What data is passed?
- In what format?
- What validation is needed?
- Who/what receives it?

**4.2 Specify Handoff Triggers**

When does handoff occur?
- **Automatic:** When task status changes to "Complete"
- **Manual:** When executor marks "Ready for Handoff"
- **Conditional:** When specific criteria met

**4.3 Identify QA Gate Requirements**

Which handoffs need validation gates?
- Critical data transitions
- Human-to-agent transitions
- Error-prone steps
- Compliance requirements

### 5. Generate Process Definition

**5.1 Load Template**

Use: `templates/meta/process-tmpl.yaml`

**5.2 Populate All Sections**

Fill in:
- Process metadata
- Phase definitions (with entry/exit criteria)
- Task list (with complexity, dependencies)
- Handoff map
- QA gate placeholders

**5.3 Create Dependency Graph**

Visual representation of task flow:
```
[Task 1] → [Task 2] → [Task 5]
         ↘ [Task 3] ↗
         ↘ [Task 4] ↗
```

**5.4 Save Process Definition**

Output to: `output/processes/{process_id}.yaml`

### 6. Validate Architecture

**Check completeness:**
- [ ] All phases have entry/exit criteria
- [ ] All tasks assigned to phases
- [ ] Dependencies are acyclic (no circular dependencies)
- [ ] Handoff map covers all task transitions
- [ ] Critical handoffs have QA gates identified

**Review with stakeholders:**
- Does phase structure make sense?
- Are all tasks captured?
- Do dependencies reflect reality?

## Outputs

- **Process Definition YAML** (`output/processes/{process_id}.yaml`)
  - Complete process metadata
  - Phase breakdown with entry/exit criteria
  - Full task list with complexity estimates
  
- **Handoff Map** (embedded in process definition)
  - Data flow between all tasks
  - Handoff triggers and methods
  - QA gate requirements

- **Dependency Graph** (visual representation)
  - Task sequence and parallelization opportunities
  - Critical path identification

## Next Steps

**Handoff to Phase 3: Executor Design**

When architecture is complete:
1. Confirm: Process structure validated with stakeholders
2. Confirm: All tasks identified and assigned to phases
3. Confirm: Handoff map complete with QA gate requirements
4. **Activate:** `@hybridOps:executor-designer` for Phase 3
5. **Pass:** Process definition YAML as input to executor design

**Success Criteria for Handoff:**
- [ ] Process definition YAML complete
- [ ] 3-7 phases defined with clear boundaries
- [ ] All tasks listed with complexity estimates
- [ ] Dependencies mapped (no circular dependencies)
- [ ] Handoff map covers all transitions
- [ ] Stakeholder approval received
