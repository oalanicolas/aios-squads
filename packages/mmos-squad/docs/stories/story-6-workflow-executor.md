# Story E001.6: Workflow Executor Implementation

**⚠️ DEPRECATED - DO NOT IMPLEMENT**

**Replacement:** See `story-6-simple-workflow-orchestrator.md` (E001.6-SIMPLE)

**Reason:** QA analysis revealed 70-80% overengineering. This story proposes building complex executor/runner infrastructure (800-1200 lines) that reinvents AI's native markdown task execution capabilities. The simplified approach (E001.6-SIMPLE) uses a simple orchestrator (~250 lines) that leverages proven AIOS/CreatorOS patterns.

**Analysis:** See `docs/logs/2025-10-25-qa-story-analysis.md`

---

**Epic:** MMOS-E001 (Workflow Auto-Detection & Consolidation)
**Story ID:** E001.6
**Created:** 2025-10-25
**Priority:** ~~P0 - BLOCKER~~ DEPRECATED
**Effort Estimate:** ~~24-34 hours~~ DEPRECATED
**Status:** ~~Draft~~ REJECTED (Overengineered)

---

## 📖 Story

**As a** MMOS pipeline user,
**I want** the `*map {name}` command to execute real YAML workflows and tasks,
**so that** the documented workflow architecture is followed instead of manual workarounds.

---

## 🎯 Context

**Current State (BROKEN):**
- `*map` command calls `map_mind.py` ✅
- Auto-detection works (`workflow_detector.py`) ✅
- Workflow YAML files exist (`greenfield-mind.yaml`, `brownfield-mind.yaml`) ✅
- Workflow preprocessor works (`workflow_preprocessor.py`) ✅
- Task markdown files exist (`viability-assessment.md`, `research-collection.md`, etc.) ✅
- **❌ CRITICAL GAP:** `_execute_workflow()` is a TODO placeholder that logs instead of executing
- **❌ Result:** AI creates manual simulations that bypass architecture

**Root Cause Analysis:**
See: `docs/logs/2025-10-25-qa-root-cause-analysis.md`

**What's Missing:**
1. **Workflow Executor** (`lib/workflow_executor.py`) - Parse and execute YAML workflow sequences
2. **Task Runner** (`lib/task_runner.py`) - Load and execute task markdown files
3. **Integration** - Connect auto-detection → preprocessor → executor → task runner

**Desired State:**
```
*map Thiago Finch
  ↓
map_mind.py: auto_detect_workflow() → {workflow: "greenfield", mode: "public"}
  ↓
workflow_preprocessor.py: Expand modules
  ↓
workflow_executor.py: Execute sequence phases
  ↓
task_runner.py: Execute each task (viability-assessment.md, research-collection.md, etc.)
  ↓
Result: Real workflow executed, architecture followed
```

---

## ✅ Acceptance Criteria

### AC1: Workflow Executor Exists and Functions
- [ ] File `expansion-packs/mmos/lib/workflow_executor.py` created
- [ ] Function `execute_workflow(workflow: Dict, context: Dict) -> Dict` implemented
- [ ] Parses workflow `sequence:` phases
- [ ] Executes phases in order
- [ ] Handles `import:` directives (via preprocessor)
- [ ] Handles `human_checkpoint: true` (elicits user input)
- [ ] Tracks phase execution status
- [ ] Returns structured result with status, phases_executed, outputs

### AC2: Task Runner Exists and Functions
- [ ] File `expansion-packs/mmos/lib/task_runner.py` created
- [ ] Function `execute_task(task_name: str, context: Dict) -> Dict` implemented
- [ ] Loads task markdown from `tasks/{task_name}.md`
- [ ] Parses YAML frontmatter (task metadata)
- [ ] Extracts task instructions from markdown body
- [ ] Handles `elicit: true` (triggers user interaction)
- [ ] Executes task instructions (AI-assisted)
- [ ] Returns structured result with status, outputs

### AC3: Integration Complete
- [ ] `map_mind.py` updated - TODO placeholder removed
- [ ] `_execute_workflow()` calls `workflow_preprocessor.preprocess_workflow()`
- [ ] `_execute_workflow()` calls `workflow_executor.execute_workflow()`
- [ ] Context passed correctly (slug, mode, person_name, materials_path, decision_log)
- [ ] No placeholder/TODO code remains in critical path

### AC4: End-to-End Execution Works
- [ ] `*map test_person` executes real workflow (not placeholder)
- [ ] Workflow phases execute in sequence
- [ ] Tasks load and execute from markdown files
- [ ] Human checkpoints trigger user interaction
- [ ] Execution logs show actual phase completion
- [ ] Results match documented workflow architecture

### AC5: All 6 Workflow Modes Tested
- [ ] Greenfield + public: Works end-to-end
- [ ] Greenfield + no-public-interviews: Works end-to-end
- [ ] Greenfield + no-public-materials: Works end-to-end
- [ ] Brownfield + public-update: Works end-to-end
- [ ] Brownfield + no-public-incremental: Works end-to-end
- [ ] Brownfield + no-public-migration: Works end-to-end

### AC6: Error Handling Robust
- [ ] Missing workflow file: Clear error message
- [ ] Missing task file: Clear error message
- [ ] Invalid YAML: Clear error message
- [ ] Task execution failure: Logged with context
- [ ] User abort (checkpoint): Handled gracefully
- [ ] Partial execution: State saved for resume

### AC7: Tests Pass
- [ ] Unit tests for `workflow_executor.py` (≥90% coverage)
- [ ] Unit tests for `task_runner.py` (≥90% coverage)
- [ ] Integration test: `test_map_mind_executes_workflow()` passes
- [ ] Integration test: `test_all_workflow_modes()` passes
- [ ] No placeholder/TODO execution detected in tests

---

## 🛠️ Tasks / Subtasks

### Task 1: Implement Workflow Executor (AC1)
- [ ] Create `expansion-packs/mmos/lib/workflow_executor.py`
  - [ ] Define `execute_workflow(workflow: Dict, context: Dict) -> Dict` function
  - [ ] Implement sequence parser (iterate `workflow['sequence']`)
  - [ ] Implement phase executor (call task_runner for each phase)
  - [ ] Implement checkpoint handler (elicit user input when `human_checkpoint: true`)
  - [ ] Implement result tracking (phases_executed, outputs, status)
  - [ ] Add comprehensive error handling
  - [ ] Add logging for each phase execution

- [ ] Handle special phase types
  - [ ] `task:` directive → Call `task_runner.execute_task()`
  - [ ] `agent:` directive → Log agent assignment (future: agent coordination)
  - [ ] `creates:` directive → Track artifact creation
  - [ ] `skip_if:` directive → Conditional phase execution
  - [ ] `prerequisites:` directive → Validate before execution

- [ ] Implement checkpoint system
  - [ ] Detect `human_checkpoint: true` in phase
  - [ ] Extract checkpoint_type (GO_NO-GO, REVIEW, DECISION, etc.)
  - [ ] Present checkpoint to user with context
  - [ ] Handle user responses (APPROVE, REJECT, ABORT, REVISE)
  - [ ] Return decision to workflow executor

### Task 2: Implement Task Runner (AC2)
- [ ] Create `expansion-packs/mmos/lib/task_runner.py`
  - [ ] Define `execute_task(task_name: str, context: Dict) -> Dict` function
  - [ ] Implement markdown loader (read `tasks/{task_name}.md`)
  - [ ] Implement frontmatter parser (extract YAML metadata)
  - [ ] Implement instruction extractor (parse markdown sections)
  - [ ] Implement elicitation handler (`elicit: true` → user interaction)
  - [ ] Implement AI-assisted execution (interpret markdown instructions)
  - [ ] Add comprehensive error handling
  - [ ] Add logging for task execution

- [ ] Handle task metadata
  - [ ] `task:` identifier
  - [ ] `agent:` assignment
  - [ ] `params:` required/optional parameters
  - [ ] `elicit:` user interaction flag
  - [ ] `outputs:` expected artifacts

- [ ] Implement elicitation system
  - [ ] Parse elicitation requirements from markdown
  - [ ] Present questions/options to user
  - [ ] Validate user responses
  - [ ] Merge responses into context
  - [ ] Continue execution with enriched context

- [ ] Implement instruction execution
  - [ ] Parse markdown sections (## headings)
  - [ ] Identify executable instructions vs documentation
  - [ ] Use AI to interpret and execute instructions
  - [ ] Track execution progress
  - [ ] Generate outputs as specified

### Task 3: Integrate with map_mind.py (AC3)
- [ ] Update `expansion-packs/mmos/lib/map_mind.py`
  - [ ] Import `workflow_preprocessor` and `workflow_executor`
  - [ ] Replace TODO placeholder in `_execute_workflow()`
  - [ ] Call `preprocess_workflow(workflow_path)` to expand modules
  - [ ] Prepare execution context (slug, mode, person_name, etc.)
  - [ ] Call `execute_workflow(expanded_workflow, context)`
  - [ ] Return structured result (status, phases_executed, outputs)
  - [ ] Remove all placeholder print statements

- [ ] Update error handling
  - [ ] Catch workflow execution errors
  - [ ] Provide clear error messages to user
  - [ ] Log errors with context
  - [ ] Return error status (not placeholder status)

### Task 4: Create Integration Tests (AC4, AC7)
- [ ] Create `expansion-packs/mmos/tests/test_workflow_executor.py`
  - [ ] Test `execute_workflow()` with sample workflow
  - [ ] Test checkpoint handling
  - [ ] Test phase execution tracking
  - [ ] Test error scenarios
  - [ ] Achieve ≥90% code coverage

- [ ] Create `expansion-packs/mmos/tests/test_task_runner.py`
  - [ ] Test `execute_task()` with sample task
  - [ ] Test frontmatter parsing
  - [ ] Test elicitation handling
  - [ ] Test instruction execution
  - [ ] Achieve ≥90% code coverage

- [ ] Create `expansion-packs/mmos/tests/test_integration_map_mind.py`
  - [ ] Test `*map test_person` end-to-end
  - [ ] Verify real workflow execution (no placeholder)
  - [ ] Verify tasks are loaded and executed
  - [ ] Verify checkpoints trigger user interaction
  - [ ] Verify results match architecture

- [ ] Create `expansion-packs/mmos/tests/test_all_workflow_modes.py`
  - [ ] Test greenfield + public
  - [ ] Test greenfield + no-public-interviews
  - [ ] Test greenfield + no-public-materials
  - [ ] Test brownfield + public-update
  - [ ] Test brownfield + no-public-incremental
  - [ ] Test brownfield + no-public-migration

### Task 5: Update Agent Instructions (AC3)
- [ ] Update `.claude/commands/MMOS/agents/mind-mapper.md`
  - [ ] Clarify STEP 7: "Execute map_mind() function, NOT manual simulation"
  - [ ] Add error handling: "If execution fails, STOP and report error"
  - [ ] Add validation: "NEVER create manual workflows"

- [ ] Update `expansion-packs/mmos/agents/mind-mapper.md` (sync)

### Task 6: Documentation (AC6)
- [ ] Create `expansion-packs/mmos/docs/architecture/workflow-execution.md`
  - [ ] Document workflow executor architecture
  - [ ] Document task runner architecture
  - [ ] Document integration flow
  - [ ] Document checkpoint system
  - [ ] Document error handling

- [ ] Update `expansion-packs/mmos/workflows/README.md`
  - [ ] Add "How Workflows Execute" section
  - [ ] Document executor usage
  - [ ] Document task runner usage

- [ ] Create developer guide
  - [ ] `expansion-packs/mmos/docs/guides/adding-new-tasks.md`
  - [ ] `expansion-packs/mmos/docs/guides/testing-workflows.md`

---

## 🧑‍💻 Dev Notes

### Relevant Architecture

**Workflow Structure:**
```yaml
# workflows/greenfield-mind.yaml
workflow:
  id: greenfield-mind
  modes: [public, no-public-interviews, no-public-materials]

sequence:
  - agent: analyst
    phase: viability
    creates: viability-assessment
    task: viability-assessment
    outputs: [docs/viability.yaml]
    human_checkpoint: true
    checkpoint_type: GO_NO-GO_DECISION

  - agent: analyst
    phase: research
    task: research-collection
    task_mode: "{mode}_research"  # Mode-specific variation

  - import: "modules/analysis-foundation.yaml"  # Shared module
  # ... etc
```

**Task Structure:**
```markdown
---
task: viability-assessment
agent: analyst
params:
  - person_name (required)
elicit: true
---

# Viability Assessment Task

**Purpose:** Evaluate mind clone viability using APEX scoring.

## Instructions

1. Calculate APEX score (Availability, Prominence, Expertise, X-Factor)
2. If score ≥75: Auto-approve
3. If score 50-74: Elicit user decision
4. If score <50: Auto-reject

## Elicitation (if 50-74)

Present APEX breakdown to user:
- Show scores for each dimension
- Ask: "Proceed with this mind? (yes/no/revise)"
```

### Workflow Executor Pseudo-code

```python
def execute_workflow(workflow: Dict, context: Dict) -> Dict:
    results = {'status': 'in_progress', 'phases_executed': [], 'outputs': {}}

    for phase in workflow['sequence']:
        # Skip if condition
        if 'skip_if' in phase and eval_condition(phase['skip_if'], context):
            continue

        # Check prerequisites
        if 'prerequisites' in phase:
            if not check_prerequisites(phase['prerequisites'], results):
                raise PrerequisiteError(...)

        # Execute task
        if 'task' in phase:
            task_result = execute_task(phase['task'], context)
            results['phases_executed'].append({
                'phase': phase['phase'],
                'task': phase['task'],
                'status': task_result['status'],
                'outputs': task_result['outputs']
            })
            results['outputs'].update(task_result['outputs'])

        # Human checkpoint
        if phase.get('human_checkpoint'):
            checkpoint_result = handle_checkpoint(phase, results)
            if checkpoint_result['decision'] == 'ABORT':
                results['status'] = 'aborted'
                return results

    results['status'] = 'completed'
    return results
```

### Task Runner Pseudo-code

```python
def execute_task(task_name: str, context: Dict) -> Dict:
    # Load task
    task_path = Path(f"tasks/{task_name}.md")
    frontmatter, markdown_body = parse_task_markdown(task_path)

    # Validate parameters
    required_params = frontmatter.get('params', [])
    validate_context(required_params, context)

    # Elicit if needed
    if frontmatter.get('elicit'):
        user_input = elicit_from_user(markdown_body, context)
        context.update(user_input)

    # Execute instructions
    result = execute_instructions(markdown_body, context)

    return {
        'status': 'completed',
        'outputs': result['outputs'],
        'context_updates': result['context_updates']
    }
```

### Testing Standards

**Location:**
- Unit tests: `expansion-packs/mmos/tests/test_*.py`
- Integration tests: `expansion-packs/mmos/tests/test_integration_*.py`

**Framework:** pytest

**Coverage:** ≥90% for new modules

**Patterns:**
```python
def test_workflow_executor_basic():
    """Test basic workflow execution."""
    workflow = {
        'sequence': [
            {'phase': 'test', 'task': 'sample-task'}
        ]
    }
    context = {'slug': 'test_person'}

    result = execute_workflow(workflow, context)

    assert result['status'] == 'completed'
    assert len(result['phases_executed']) == 1
```

**Mock Strategy:**
- Mock file I/O for task loading
- Mock AI execution for instruction interpretation
- Mock user input for elicitation

### Related Files

**Source Tree:**
```
expansion-packs/mmos/
├── lib/
│   ├── map_mind.py              (UPDATE: Remove TODO)
│   ├── workflow_detector.py     (EXISTS: Auto-detection)
│   ├── workflow_preprocessor.py (EXISTS: Module expansion)
│   ├── workflow_executor.py     (CREATE: This story)
│   └── task_runner.py           (CREATE: This story)
├── workflows/
│   ├── greenfield-mind.yaml     (EXISTS: Workflow spec)
│   ├── brownfield-mind.yaml     (EXISTS: Workflow spec)
│   └── modules/                 (EXISTS: 7 shared modules)
├── tasks/
│   ├── viability-assessment.md  (EXISTS: Task specs)
│   ├── research-collection.md   (EXISTS)
│   └── ... (12 total tasks)
└── tests/
    ├── test_workflow_executor.py    (CREATE)
    ├── test_task_runner.py          (CREATE)
    ├── test_integration_map_mind.py (CREATE)
    └── test_all_workflow_modes.py   (CREATE)
```

### Dependencies

**Python Modules:**
- `PyYAML` - YAML parsing (already in requirements.txt)
- `pathlib` - File path handling (standard library)
- `typing` - Type hints (standard library)

**Internal Dependencies:**
- `workflow_preprocessor.py` - Module expansion
- `workflow_detector.py` - Auto-detection
- `metadata_manager.py` - Metadata reading/writing

**AI Integration:**
- Task instruction execution requires AI interpretation
- Use existing patterns from codebase
- Consider using Gemini API for cost efficiency (like Story 1-5)

---

## 📊 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-25 | 1.0 | Initial story creation | Quinn (QA) |

---

## 🧪 Dev Agent Record

*(Populated during implementation)*

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

---

## ✅ QA Results

*(Populated after implementation)*

---

**Story Created By:** Quinn (Test Architect)
**Based On:** Root Cause Analysis (docs/logs/2025-10-25-qa-root-cause-analysis.md)
**Epic:** MMOS-E001
**Status:** Draft - Ready for Dev Agent
