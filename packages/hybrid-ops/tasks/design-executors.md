# Design Executors Task

## Purpose

To define all executors (human, agent, hybrid) that will perform process tasks, create executor profiles, and build an assignment matrix that maps each task to its optimal executor.

## Inputs

- Process definition YAML from Phase 2 (`output/processes/{process_id}.yaml`)
- Discovery document with stakeholder information
- Automation opportunity list
- Templates from `expansion-packs/hybrid-ops/templates/`

## Key Activities & Instructions

### 1. Inventory Available Executors

**1.1 List Human Executors**

For each human who will work in this process:
- Full name and role
- Skills and expertise areas
- Tools/systems they have access to
- Capacity (hours per week available for this process)
- Current utilization (%)

**1.2 List Existing Agents**

For agents already available:
- Agent ID and name
- Framework (AIOS, LangChain, custom, etc.)
- Capabilities and limitations
- Systems they can access
- Current utilization

**1.3 Identify Skill Gaps**

Compare required skills (from tasks) against available executors:
- What skills are missing?
- Which tasks have no suitable executor?
- What agents need to be developed?

### 2. Design Executor Definitions

**For each unique executor:**

**2.1 Create Executor Profile**

Use template: `templates/meta/executor-tmpl.yaml`
Output to: `executors/{executor_id}.md`

**Profile includes:**
- Executor ID, name, type (human/agent/hybrid)
- Role and responsibilities
- Skills and expertise
- Tools and systems access
- Capacity and availability
- Contact information (for humans)

**2.2 For Agent Executors:**

Additional details:
- Framework and version
- Capabilities (what it CAN do)
- Limitations (what it CANNOT do)
- Confidence thresholds
- Error handling strategy
- Escalation rules

**2.3 For Hybrid Executors:**

Define hybrid execution pattern:
```yaml
executor:
  type: hybrid
  primary: data-validation-agent
  fallback: sarah-coordinator
  escalation_trigger: confidence < 0.8
  decision_logic:
    - if: confidence >= 0.95
      then: agent_completes_automatically
    - if: 0.80 <= confidence < 0.95
      then: agent_flags_for_human_review
    - if: confidence < 0.80
      then: human_takeover_immediate
```

### 3. Create Assignment Matrix

**3.1 Load Template**

Use: `templates/executor-assignment-matrix-tmpl.yaml`

**3.2 Assign Each Task**

For every task in the process:
- **Executor ID:** Who/what will execute this task?
- **Assignment Rationale:** Why this executor?
- **Backup Executor:** Who covers if primary unavailable?
- **Escalation Path:** Who handles exceptions?

**Assignment Principles:**
- Match task complexity to executor capability
- Balance workload across executors
- Consider system access requirements
- Plan for agent development timeline

**3.3 Define Migration Strategy**

For tasks transitioning human → agent:
- **Phase 1:** Human execution (baseline)
- **Phase 2:** Hybrid (agent assists human)
- **Phase 3:** Hybrid (agent primary, human reviews)
- **Phase 4:** Agent only (human monitors)

### 4. Workload Analysis

**4.1 Calculate Workload**

For each executor:
```
Total Hours = Σ (Task Complexity × Process Frequency)
Utilization = Total Hours / Available Capacity
```

**4.2 Balance Workload**

Identify overallocation:
- **Red Flag:** Utilization > 80%
- **Action:** Reassign tasks or add executor capacity

**4.3 Identify Bottlenecks**

Where will work pile up?
- Executors with highest utilization
- Single points of failure
- Skills in short supply

### 5. Create RACI Matrix

**Define for each task:**
- **R**esponsible: Who does the work? (Primary executor)
- **A**ccountable: Who approves/owns outcome? (Process owner/manager)
- **C**onsulted: Who provides input? (Subject matter experts)
- **I**nformed: Who needs to know status? (Stakeholders)

### 6. Agent Development Plan

**For agents that don't exist yet:**

**6.1 Prioritize Agent Development**

Rank by:
- Volume of tasks (high volume = high priority)
- Pain point severity (biggest bottleneck)
- ROI potential (time saved × frequency)

**6.2 Define Agent Roadmap**

For each planned agent:
- Agent ID and purpose
- Required capabilities
- Development effort estimate
- Testing strategy
- Readiness criteria
- Go-live timeline

**6.3 Interim Solution**

Until agent ready:
- Assign to human temporarily
- Document expected switchover date
- Plan transition/training

## Outputs

- **Executor Definitions** (`executors/{executor_id}.md` for each executor)
  - Complete profiles for all humans, agents, and hybrid executors
  
- **Executor Assignment Matrix** (`output/processes/{process_id}-executor-matrix.yaml`)
  - Every task mapped to executor with rationale
  - Backup assignments and escalation paths
  
- **RACI Matrix** (embedded in assignment matrix)
  - Responsibility clarity for all stakeholders

- **Workload Analysis Report**
  - Utilization calculations per executor
  - Bottleneck identification
  - Rebalancing recommendations

- **Agent Development Plan** (if applicable)
  - Prioritized list of agents to develop
  - Development roadmap with timelines
  - Interim human assignments

## Next Steps

**Handoff to Phase 4: Workflow Design**

When executor design is complete:
1. Confirm: All executors defined with complete profiles
2. Confirm: Every task assigned to an executor
3. Confirm: Workload balanced (no >80% utilization)
4. Confirm: Agent development plan approved
5. **Activate:** `@hybridOps:workflow-designer` for Phase 4
6. **Pass:** Executor assignment matrix and definitions

**Success Criteria for Handoff:**
- [ ] All unique executors have definition files
- [ ] Assignment matrix complete (all tasks assigned)
- [ ] Workload analysis shows no overallocation
- [ ] RACI matrix defines all roles
- [ ] Agent development plan (if needed) with timelines
- [ ] Stakeholder approval received
