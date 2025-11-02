# Create Hybrid Process Workflow

## Purpose

To create a complete hybrid process (human + agent execution) through a guided 9-phase workflow. This task orchestrates all META agents in the hybrid-ops expansion pack to generate a production-ready process implementation that works in both ClickUp (for humans) AND YAML (for agents).

## Inputs

- User's process requirements and domain knowledge
- Existing process documentation (if migrating from current state)
- Stakeholder input from discovery sessions
- Templates from `expansion-packs/hybrid-ops/templates/`
- Knowledge base from `expansion-packs/hybrid-ops/data/aios-pm-kb.md`

## Workflow Type

**Mode**: Interactive with comprehensive elicitation
**Audience**: Process-to-Agent Implementers (intermediate level)
**Estimated Duration**: 4-8 hours (depending on process complexity)

---

## Phase 1: Discovery & Process Mapping

### Purpose
Understand the current process and identify automation opportunities.

### Agent
**process-mapper** - Facilitates discovery sessions and captures current state

### Activities

1. **Initiate Discovery Session**
   - Ask: "Are we mapping an existing process or designing a new one?"
   - If existing: Conduct structured discovery interview
   - If new: Jump to high-level design

2. **Capture Current State** (for existing processes)
   - Stakeholder interviews
   - Current workflow documentation
   - Pain points identification
   - Tool/system inventory
   - Handoff mapping

3. **Generate Discovery Document**
   - Use template: `templates/process-discovery-tmpl.yaml`
   - Output: `output/discovery/{process_id}-discovery.md`
   - Document: pain points, handoffs, automation opportunities

4. **Identify Migration Candidates**
   - Which tasks can be automated?
   - Which need human oversight?
   - Which are good hybrid candidates?

### Outputs
- Process discovery document
- Initial automation opportunity list
- Stakeholder requirements summary

### Handoff to Phase 2
- Discovery document complete
- Process scope defined
- Key stakeholders identified

---

## Phase 2: Process Architecture Design

### Purpose
Design the high-level process structure with phases, tasks, and flow.

### Agent
**process-architect** - Designs process structure and task breakdown

### Activities

1. **Define Process Metadata**
   - Process ID, name, type (operational/development/hybrid)
   - Process owner and stakeholders
   - Frequency, volume, SLAs

2. **Design Phase Structure**
   - Break process into logical phases
   - Define entry/exit criteria for each phase
   - Identify phase gates and approval points

3. **Define Task Breakdown**
   - List all tasks within each phase
   - Assign initial complexity estimates
   - Identify task dependencies
   - Map handoffs between tasks

4. **Design Handoff Map**
   - Define data flow between tasks
   - Specify handoff triggers
   - Identify QA gate requirements

5. **Generate Process Definition**
   - Use template: `templates/meta/process-tmpl.yaml`
   - Output: `output/processes/{process_id}.yaml`

### Outputs
- Complete process definition YAML
- Phase breakdown with tasks
- Handoff map
- Dependency graph

### Handoff to Phase 3
- Process structure validated
- All tasks identified
- Handoff map complete

---

## Phase 3: Executor Design

### Purpose
Define executors (humans, agents, hybrid) and assign to tasks.

### Agent
**executor-designer** - Designs executor definitions and assignment matrix

### Activities

1. **Inventory Executors**
   - List available humans (names, roles, skills)
   - List available agents (IDs, capabilities)
   - Identify skill gaps

2. **Design Executor Definitions**
   - For each unique executor role:
     - Use template: `templates/meta/executor-tmpl.yaml`
     - Output: `executors/{executor_id}.md`
   - Define:
     - Skills and expertise
     - Tools and systems access
     - Capacity and availability

3. **Create Assignment Matrix**
   - Use template: `templates/executor-assignment-matrix-tmpl.yaml`
   - Output: `output/processes/{process_id}-executor-matrix.yaml`
   - Map each task to executor(s)
   - Justify assignments with rationale
   - Define hybrid execution rules

4. **Workload Analysis**
   - Check for overallocation
   - Balance workload across executors
   - Identify bottlenecks

5. **Agent Development Plan**
   - For agents that don't exist yet:
     - Define development roadmap
     - Set readiness criteria
     - Plan testing strategy

### Outputs
- Executor definitions (one per executor)
- Executor assignment matrix
- RACI matrix
- Agent development plan (if needed)

### Handoff to Phase 4
- All executors defined
- All tasks assigned to executors
- Workload balanced

---

## Phase 4: Workflow Design

### Purpose
Create detailed step-by-step workflows for each task.

### Agent
**workflow-designer** - Creates executable workflows for humans and agents

### Activities

1. **For Each Task in Process**
   - Use template: `templates/meta/workflow-tmpl.yaml`
   - Output: `workflows/{workflow_id}.md`

2. **Define Workflow Steps**
   - Break task into atomic steps
   - Provide clear action verbs
   - Define expected outputs per step
   - Add validation checkpoints

3. **Design for Universal Execution**
   - Make workflows understandable by humans AND agents
   - Include examples
   - Document decision points
   - Define error handling

4. **Add Prerequisites and Tools**
   - Required access/permissions
   - Tools and systems needed
   - Reference materials

5. **Link to Task Definitions**
   - Update task definitions with workflow references
   - Ensure workflow IDs match task IDs

### Outputs
- Workflow definition for each task (markdown format)
- Updated task definitions with workflow links

### Handoff to Phase 5
- All tasks have workflows
- Workflows are executable
- Decision points documented

---

## Phase 5: Task Definition & Data Contracts

### Purpose
Create unified task definitions with explicit data contracts.

### Agent
**workflow-designer** (continues from Phase 4)

### Activities

1. **For Each Task**
   - Use template: `templates/meta/task-unified-tmpl.yaml`
   - Output: `tasks/{task_id}.yaml`

2. **Define Data Contracts**
   - **Input Schema**:
     - What data does this task receive?
     - Where does it come from?
     - JSON Schema format
   - **Output Schema**:
     - What data does this task produce?
     - Where does it go?
     - JSON Schema format

3. **Configure Executor Assignment**
   - Reference executor from assignment matrix
   - For hybrid: define primary/fallback
   - Define escalation triggers

4. **Add Quality Checklist**
   - Validation items for task completion
   - Works as checkbox list (humans) or validation rules (agents)

5. **Configure Handoff**
   - Next task reference
   - Data mapping (output fields → input fields)
   - Handoff method (automatic/manual/qa-gate)

### Outputs
- Complete task definitions (YAML)
- Data contract schemas (JSON Schema)
- Task-to-task data mappings

### Handoff to Phase 6
- All tasks have complete definitions
- Data contracts validated
- Handoff mappings complete

---

## Phase 6: QA Gate Design

### Purpose
Design quality gates for critical handoffs and outputs.

### Agent
**qa-architect** - Designs validation checkpoints

### Activities

1. **Identify QA Gate Candidates**
   - Tasks with critical outputs
   - Handoffs between executors
   - Compliance requirements
   - High-risk transitions

2. **For Each QA Gate**
   - Use template: `templates/meta/qa-gate-tmpl.yaml`
   - Output: `qa-gates/{task_id}-gate.yaml`

3. **Define Validation Criteria**
   - Completeness checks
   - Correctness checks
   - Quality standards
   - Compliance requirements

4. **Design Validation Process**
   - Automated checks (scripts, rules)
   - Manual review steps
   - Hybrid validation (agent pre-check + human approval)

5. **Define Decision Matrix**
   - PASS: proceed to next task
   - CONCERNS: requires review
   - FAIL: block handoff
   - WAIVED: exception granted

6. **Configure Severity Levels**
   - Critical issues (blocking)
   - Major issues (warning)
   - Minor issues (informational)

### Outputs
- QA gate definitions (YAML)
- Validation criteria per gate
- Issue templates
- Escalation rules

### Handoff to Phase 7
- Critical gates identified
- Validation criteria defined
- Decision logic complete

---

## Phase 7: ClickUp Implementation Design

### Purpose
Design the complete ClickUp configuration for this process.

### Agent
**clickup-engineer** - Designs ClickUp structure and automations

### Activities

1. **Design Space/Folder/List Structure**
   - Map phases to ClickUp lists
   - Define list names and purposes
   - Plan folder hierarchy (if needed)

2. **Configure Custom Fields**
   - Use template: `templates/clickup-config-tmpl.yaml`
   - Output: `output/clickup/{process_id}-clickup-config.yaml`
   - AIOS-PM standard fields:
     - Executor Type
     - Assigned Executor
     - Task Type
     - Complexity
     - Automation Ready
     - Data contracts
     - QA Gate settings
     - Workflow ID
     - Next Task

3. **Design Automations**
   - Status change triggers
   - Automatic handoffs
   - QA gate triggers
   - Notification rules
   - Webhook integrations

4. **Create Views**
   - By executor type
   - By phase
   - By automation readiness
   - Management dashboard

5. **Define Task Templates**
   - Template per task type
   - Pre-filled custom fields
   - Standard checklists
   - Default assignees

6. **Generate Implementation Guide**
   - Step-by-step ClickUp setup
   - Screenshots/mockups
   - Testing checklist

### Outputs
- Complete ClickUp configuration (YAML)
- Automation definitions
- View configurations
- Task templates
- 10-step implementation guide

### Handoff to Phase 8
- ClickUp structure designed
- Automations configured
- Implementation guide ready

---

## Phase 8: Agent Generation (if needed)

### Purpose
Generate agent definitions for new agents identified in executor design.

### Agent
**agent-generator** - Creates AIOS agent definitions

### Activities

1. **Review Agent Development Plan**
   - From Phase 3: executor-assignment-matrix
   - Identify agents to be created

2. **For Each New Agent**
   - Agent persona definition
   - Capabilities and skills
   - Tools and integrations
   - Command set
   - Task/template references

3. **Define Agent Behavior**
   - Decision-making logic
   - Error handling
   - Escalation rules
   - Memory/context requirements

4. **Generate Agent Files**
   - Output: `agents/{agent_id}.md` (AIOS agent format)
   - Include:
     - Persona
     - Commands
     - Task references
     - Template usage
     - Integration with process

5. **Create Agent Activation Commands**
   - Slash commands for agent activation
   - Integration with hybrid-ops prefix

### Outputs
- Agent definition files (markdown)
- Agent activation commands
- Agent-to-task mapping

### Handoff to Phase 9
- All required agents defined
- Agent behaviors specified
- Ready for testing

---

## Phase 9: Compliance Validation & Documentation

### Purpose
Validate process against AIOS-PM standards and generate documentation.

### Agent
**compliance-validator** + **doc-generator**

### Activities

#### Compliance Validation (compliance-validator)

1. **Run Automated Validation**
   - Use template: `templates/compliance-report-tmpl.yaml`
   - Output: `output/processes/{process_id}-compliance-report.md`

2. **Validate Against AIOS-PM Standards**
   - Process structure compliance
   - Task definition completeness
   - Executor assignments valid
   - Data contracts present and valid
   - Handoff configurations complete
   - QA gates properly configured
   - ClickUp configuration complete
   - Documentation present

3. **Generate Compliance Score**
   - Overall score (0-100%)
   - Category scores
   - Critical issues list
   - Recommendations

4. **Create Action Plan**
   - For issues found
   - Prioritized by severity
   - Assigned to owners
   - Due dates

#### Documentation Generation (doc-generator)

5. **Generate Process README**
   - Use template: `templates/process-readme-tmpl.yaml`
   - Output: `output/processes/{process_id}/README.md`

6. **Create Quick Start Guide**
   - For humans
   - For agents
   - For process managers

7. **Generate Process Diagrams**
   - Mermaid flow diagrams
   - Phase diagrams
   - Handoff maps

8. **Compile Process Artifacts**
   - All generated files
   - Reference links
   - Version control

### Outputs
- Compliance report with score
- Process README
- Quick start guide
- Process diagrams
- Complete documentation package

---

## Final Handoff & Completion

### Completion Criteria

- [ ] Discovery document complete (Phase 1)
- [ ] Process definition created (Phase 2)
- [ ] All executors defined and assigned (Phase 3)
- [ ] All workflows created (Phase 4)
- [ ] All tasks have complete definitions with data contracts (Phase 5)
- [ ] QA gates configured for critical handoffs (Phase 6)
- [ ] ClickUp configuration complete (Phase 7)
- [ ] Required agents generated (Phase 8)
- [ ] Compliance score ≥ 90% (Phase 9)
- [ ] Documentation package complete (Phase 9)

### Validation Checklist

**Process Structure**
- [ ] Process YAML is valid
- [ ] All phases have entry/exit criteria
- [ ] Dependency graph is acyclic

**Tasks & Workflows**
- [ ] Each task has a workflow
- [ ] Each workflow is executable
- [ ] Data contracts are valid JSON Schema
- [ ] Handoff mappings are complete

**Executors**
- [ ] All tasks have executors assigned
- [ ] No executor is over-allocated
- [ ] Hybrid executors have escalation rules

**QA Gates**
- [ ] Critical handoffs have QA gates
- [ ] Validation criteria are measurable
- [ ] Decision matrix is complete

**ClickUp Implementation**
- [ ] Custom fields configured
- [ ] Automations defined
- [ ] Views created
- [ ] Task templates ready

**Compliance**
- [ ] Compliance score ≥ 90%
- [ ] No critical issues
- [ ] All documentation present

### Output Directory Structure

```
output/processes/{process_id}/
├── README.md                           # Main process documentation
├── {process_id}.yaml                   # Process definition
├── {process_id}-executor-matrix.yaml   # Executor assignments
├── {process_id}-compliance-report.md   # Validation report
├── discovery/
│   └── {process_id}-discovery.md       # Discovery session output
├── clickup/
│   └── {process_id}-clickup-config.yaml # ClickUp configuration
├── executors/
│   ├── {executor_1}.md
│   ├── {executor_2}.md
│   └── ...
├── tasks/
│   ├── {task_1}.yaml
│   ├── {task_2}.yaml
│   └── ...
├── workflows/
│   ├── {workflow_1}.md
│   ├── {workflow_2}.md
│   └── ...
├── qa-gates/
│   ├── {task_1}-gate.yaml
│   ├── {task_2}-gate.yaml
│   └── ...
└── agents/ (if new agents generated)
    ├── {agent_1}.md
    ├── {agent_2}.md
    └── ...
```

---

## Integration with AIOS

This workflow integrates with:
- Core AIOS-FULLSTACK framework
- hybrid-ops expansion pack
- Standard agent activation system (@agent-id syntax)
- Memory layer for context persistence
- ClickUp MCP for workspace integration

## Usage

Activate the hybrid-ops pack and run:

```bash
@hybridOps:process-mapper
*create-process
```

The process-mapper will orchestrate this 9-phase workflow, activating appropriate agents at each phase.

## Notes

- **Incremental Execution**: Phases can be executed incrementally with checkpoints
- **Quality Over Speed**: Take time in discovery and design phases
- **Validation is Critical**: Don't skip Phase 9 compliance validation
- **Templates Drive Consistency**: Always use provided templates
- **Document Everything**: Each phase generates artifacts for auditability

---

_Workflow Version: 1.0_
_Last Updated: 2025-10-06_
_Part of: hybrid-ops expansion pack_
