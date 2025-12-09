# MMOS Mind Mapper Workflows

**Purpose:** AIOS-compliant executable workflows for mind clone creation and maintenance

---

## 📊 MMOS Workflow Matrix (2×3 Modes)

MMOS uses **2 consolidated workflows** with **6 execution modes** based on two dimensions:
1. **Source Type:** Public (web scraping) vs No-Public (interviews/materials)
2. **Starting Point:** Greenfield (new) vs Brownfield (existing)

**NEW: Modular Architecture** - Shared modules eliminate 62.7% code duplication

```
┌─────────────────┬──────────────────────────────┬──────────────────────────────┐
│                 │   GREENFIELD (New)           │   BROWNFIELD (Existing)      │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ PUBLIC          │  Mode: public                │  Mode: public-update         │
│ (Web Scraping)  │  greenfield-mind.yaml        │  brownfield-mind.yaml        │
│                 │  [Example: Sam Altman]       │  [Example: Update existing]  │
│                 │  8-12h | 2-3M tokens         │  2-4h | 500K-1M tokens       │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ NO-PUBLIC       │  Mode: no-public-interviews  │  Mode: no-public-incremental │
│ (Interviews)    │  greenfield-mind.yaml        │  brownfield-mind.yaml        │
│                 │  [Example: José, Alan]       │  [Example: Add materials]    │
│                 │  6-8h | 1.5-2M tokens        │  2-3h | 300K-700K tokens     │
├─────────────────┼──────────────────────────────┼──────────────────────────────┤
│ NO-PUBLIC       │  Mode: no-public-materials   │  Mode: no-public-migration   │
│ (Materials)     │  greenfield-mind.yaml        │  brownfield-mind.yaml        │
│                 │  [Example: Pre-collected]    │  [Example: João Lozano]      │
│                 │  4-6h | 1-2M tokens          │  4-6h | 1-2M tokens          │
└─────────────────┴──────────────────────────────┴──────────────────────────────┘
```

---

## 🧩 Modular Architecture

**Why Modules?** Before consolidation, we had 4 separate workflow files (3,023 lines) with massive code duplication. DNA Mental™ Layers 1-8, synthesis, implementation, and validation were copy-pasted across all workflows.

**Solution:** Extract shared phases into reusable modules, reference via imports.

### Module System

**7 Shared Modules** (`modules/`):

| Module | What It Contains | Used By | Lines |
|--------|------------------|---------|-------|
| `analysis-foundation.yaml` | DNA Mental™ Layers 1-5 (Observable patterns, mental models) | Both | 88 |
| `analysis-critical.yaml` | Layers 6-8 + Human checkpoints (Values, obsessions, paradoxes) | Both | 183 |
| `synthesis-knowledge.yaml` | Frameworks, communication templates, signature phrases | Both | 76 |
| `synthesis-kb.yaml` | Knowledge base chunking + specialist recommendations | Both | 71 |
| `implementation-identity.yaml` | Identity core extraction | Both | 37 |
| `implementation-prompt.yaml` | System prompt creation + operational manual | Both | 83 |
| `validation-complete.yaml` | Testing, validation, fidelity scoring, production approval | Both | 127 |

**Total module code:** 665 lines (shared)

### How Imports Work

Since AIOS doesn't support native YAML imports, we use a **preprocessor**:

```yaml
# In workflow file
sequence:
  - import: "modules/analysis-foundation.yaml"
    # Module phases will be expanded inline before execution
```

**Preprocessing:**
```bash
# Expand imports before execution
python lib/workflow_preprocessor.py workflows/greenfield-mind.yaml > expanded.yaml
```

The preprocessor loads each module and inserts its `phases:` section inline.

### Code Reduction Achieved

**Before Consolidation:**
- greenfield-mind.yaml: 767 lines
- private-individual.yaml: 921 lines
- brownfield-mind.yaml: 733 lines
- brownfield-private.yaml: 602 lines
- **Total: 3,023 lines** (massive duplication)

**After Consolidation:**
- greenfield-mind.yaml: 190 lines (75% reduction)
- brownfield-mind.yaml: 273 lines (63% reduction)
- modules/: 665 lines (shared)
- **Total: 1,128 lines** (62.7% reduction ✅)

### Benefits

✅ **Zero Duplication** - Shared logic defined once
✅ **Single Source of Truth** - Update Layer 8? Edit 1 file
✅ **Easier Maintenance** - Clear separation of concerns
✅ **Better Testing** - Test modules independently
✅ **Mode Flexibility** - 6 modes from 2 workflows

---

## 📋 Available Workflows

### Greenfield Mind Clone Creation ✅
**File:** `greenfield-mind.yaml` (190 lines)
**Modes:** `public`, `no-public-interviews`, `no-public-materials`
**Example:** Sam Altman (public), José Amorim (no-public)
**Duration:** 4-12h (mode-dependent) | **Tokens:** 1-3M

**Use when:**
- Creating new mind clone from scratch
- No existing clone to update

**3 Execution Modes:**

1. **public** - Public figures with web content
   - Auto-detect or user-specified
   - Web scraping + automated research
   - Simulated validation (no person access)
   - 8-12h | 2-3M tokens

2. **no-public-interviews** - Private via interview protocol
   - 5-session structured interviews
   - Direct validation with person
   - Privacy & consent protocols
   - 6-8h | 1.5-2M tokens

3. **no-public-materials** - Private with pre-collected materials
   - Process provided documents/transcripts
   - Skip viability assessment
   - Direct validation with person
   - 4-6h | 1-2M tokens

**Process (All Modes):**
1. Mode detection & initialization
2. Mode-specific research/viability
3. DNA Mental™ 8-layer analysis (shared modules)
4. Synthesis & knowledge base (shared modules)
5. System prompt creation (shared modules)
6. Validation & testing (mode-specific methods)
7. Finalization

**Key Features:**
- Intelligent mode auto-detection
- Shared pipeline (Phases 2-7) via modules
- 6 human checkpoints (Layers 6-8 critical)
- Mode-specific validation strategies

---

### Brownfield Mind Clone Update ✅
**File:** `brownfield-mind.yaml` (273 lines)
**Modes:** `public-update`, `no-public-incremental`, `no-public-migration`
**Example:** Update Sam Altman clone (public-update), João Lozano migration (no-public-migration)
**Duration:** 2-6h (mode-dependent) | **Tokens:** 300K-2M

**Use when:**
- Updating existing mind clone
- Adding new sources incrementally
- Migrating from another system
- Refining/fixing gaps

**3 Execution Modes:**

1. **public-update** - Update public figure clone
   - Add new web sources (incremental)
   - Selective re-analysis (delta only)
   - Regression testing
   - 2-4h | 500K-1M tokens

2. **no-public-incremental** - Update private clone with new materials
   - Process newly provided materials
   - Append to existing sources
   - Incremental updates only
   - 2-3h | 300K-700K tokens

3. **no-public-migration** - Migrate legacy private clone
   - Convert from other systems
   - Preserve existing quality (80%)
   - Fill critical gaps (20%)
   - 4-6h | 1-2M tokens

**Process (All Modes):**
1. Mode detection + mandatory backup
2. Mode-specific incremental research
3. Delta analysis (what changed?)
4. Selective module execution (only affected layers)
5. Regression testing (compare before/after)
6. Full validation suite
7. Commit or rollback decision

**Key Features:**
- **Mandatory backup** before changes (rollback safety)
- Smart delta analysis (avoid full re-run)
- Regression detection (score drops flagged)
- Selective module execution
- Version management
- 60-75% faster than greenfield

---

## 🎯 Workflow Selection Guide

### Decision Tree

```
❓ Do you have an existing mind to update?
├─ YES → Use brownfield-mind.yaml
│  └─ 60-75% faster, incremental changes
│
└─ NO → Use greenfield-mind.yaml
   ├─ Public figure? → Public Figure Mode
   │  └─ Full pipeline with web scraping
   │
   └─ Private individual? → Private Individual Mode
      └─ Use provided materials, skip viability
```

---

## 🔧 How to Use Workflows (AIOS)

### Method 1: Agent-Based Execution (Recommended)

```bash
# Activate MMOS agent
@mind-mapper

# Request workflow execution
"Execute greenfield-mind workflow for [person_name]"
"Execute brownfield-mind workflow to update [existing_mind]"
```

The agent will:
1. Load workflow YAML
2. Execute sequence step-by-step
3. Pause at human checkpoints
4. Track progress and outputs

### Method 2: Task-Based Execution

```bash
# Use AIOS task system
*task execute-mmos-pipeline [mind_name] --workflow=greenfield
*task execute-mmos-pipeline [mind_name] --workflow=brownfield
```

### Method 3: Manual Step Execution

Read the workflow YAML and execute each sequence step manually:

1. Review workflow structure
2. Execute each agent/task in sequence
3. Validate prerequisites before each step
4. Create outputs as specified
5. Pause at human checkpoints

---

## 📊 Workflow Comparison

| Feature | Greenfield | Brownfield |
|---------|-----------|-----------|
| **Use Case** | New mind clone | Update existing |
| **Duration** | 8-12 days | 2-5 days |
| **Tokens** | 2-3M | 500K-1M |
| **Risk** | Low (clean start) | Medium (may break) |
| **Backup** | Not needed | MANDATORY |
| **Testing** | Initial validation | Regression + new |
| **Phases** | 6 complete phases | Selective steps |
| **Rollback** | N/A | Always available |

---

## 🏗️ Workflow Structure (AIOS Standard)

All workflows follow this YAML structure:

```yaml
workflow:
  id: workflow-name
  name: Human-Readable Name
  description: What this workflow does
  type: greenfield | brownfield
  project_types: [list]

  sequence:
    - agent: agent-name
      phase: phase-name
      creates: output-description
      task: task-file-name
      prerequisites: [list]
      outputs: [paths]
      human_checkpoint: true/false
      checkpoint_type: TYPE
      notes: |
        Detailed instructions...
```

### Workflow Components

**Agent:** Which AIOS agent executes this step
- `analyst` - Research, analysis, data work
- `architect` - System design, architecture
- `qa` - Quality assurance, testing
- `pm` - Product management, documentation

**Phase:** Logical grouping of steps
- `viability` - Assessment
- `research` - Source collection
- `analysis` - DNA Mental™ layers
- `synthesis` - Knowledge compilation
- `implementation` - System prompt creation
- `testing` - Validation

**Task:** References to `../tasks/*.md` files
- Each task is a reusable operation
- Tasks can be executed independently
- Tasks have their own documentation

**Human Checkpoint:** Quality gates requiring approval
- Decision points that need human judgment
- Cannot be automated
- Workflow pauses until user approves

---

## ✅ Success Criteria

### Greenfield Workflow Success
- [ ] Viability validated (APEX ≥ 50 OR private mode)
- [ ] Sources adequate (≥15 total, ≥5 high-confidence)
- [ ] 8 DNA Mental™ layers complete
- [ ] All 6 human checkpoints approved
- [ ] System prompt v1.0 generated
- [ ] Fidelity ≥ 94% (or documented reasons)
- [ ] Production approval received

### Brownfield Workflow Success
- [ ] Backup created before changes
- [ ] Plan documented and approved
- [ ] Differential analysis complete
- [ ] Consistency checks passed
- [ ] Regression tests passed
- [ ] Fidelity stable or improved
- [ ] Documentation updated
- [ ] Rollback tested and available

---

## 🚨 Common Pitfalls

### Greenfield Mistakes
- ❌ Skipping human checkpoints (leads to low quality)
- ❌ Insufficient sources (<15 total)
- ❌ Rushing through Layer 8 paradoxes (critical!)
- ❌ Not validating triangulation (Layers 5-8)
- ❌ Deploying with <94% fidelity without documentation

### Brownfield Mistakes
- ❌ No backup created (no rollback possible)
- ❌ Regenerating from scratch (defeats purpose)
- ❌ Skipping regression tests (breaks production)
- ❌ Overwriting without versioning (loses history)
- ❌ Deploying without approval (risky changes)

---

## 📚 Related Documentation

### Expansion Pack Structure
```
expansion-packs/mmos/
├── workflows/           ← YOU ARE HERE
│   ├── greenfield-mind.yaml
│   ├── brownfield-mind.yaml
│   └── README.md
├── tasks/              ← Reusable operations
├── agents/             ← Agent personas
├── templates/          ← Document templates
├── checklists/         ← Validation checklists
└── README.md           ← Main pack documentation
```

### Documentation
- **Main Pack:** `../README.md` - Complete MMOS documentation
- **Tasks:** `../tasks/` - Individual task definitions
- **Agents:** `../agents/` - Agent personas and capabilities
- **Templates:** `../templates/` - Output templates
- **Methodology:** `docs/methodology/dna-mental.md` - 8-layer framework

### System Documentation
- **Architecture:** `docs/mmos/architecture/` - System design
- **Guides:** `docs/guides/` - User guides
- **PRD:** `docs/prd/mmos-prd.md` - Product vision

---

## 🔄 Workflow Lifecycle

### 1. Selection
Choose appropriate workflow (greenfield vs brownfield)

### 2. Planning
- Review prerequisites
- Gather required materials
- Estimate resources (time, tokens)

### 3. Execution
- Follow sequence steps
- Execute with appropriate agents
- Validate outputs at each step
- Pause at human checkpoints

### 4. Validation
- Run quality checks
- Execute test protocols
- Review fidelity scores
- Approve/reject for production

### 5. Deployment
- Finalize documentation
- Update catalogs
- Archive outputs
- Document learnings

---

## 💡 Best Practices

### Workflow Execution
1. **Read entire workflow** before starting
2. **Prepare prerequisites** in advance
3. **Execute sequentially** (respect dependencies)
4. **Validate at each step** (don't rush)
5. **Document decisions** at checkpoints
6. **Test thoroughly** before production

### Quality Management
- **Never skip** human checkpoints
- **Always validate** triangulation (Layers 5-8)
- **Test regressions** in brownfield updates
- **Document everything** (logs, decisions, changes)
- **Maintain backups** (brownfield) or snapshots (greenfield)

### Efficiency Tips
- **Use parallel execution** where indicated
- **Reuse existing tasks** (don't reinvent)
- **Leverage templates** for consistency
- **Automate validation** (use checklists)
- **Track token usage** (optimize as you go)

---

## 🎓 Learning Resources

### Understanding DNA Mental™
The 8-layer methodology is core to MMOS:

1. **Layer 1:** Behavioral Patterns (observable actions)
2. **Layer 2:** Communication Style (linguistic patterns)
3. **Layer 3:** Routine & Habits (temporal patterns)
4. **Layer 4:** Recognition Patterns (mental radars)
5. **Layer 5:** Mental Models (frameworks)
6. **Layer 6:** Values Hierarchy (principles)
7. **Layer 7:** Core Obsessions (driving forces)
8. **Layer 8:** Productive Paradoxes (complexity)

**Layer 8 is the differentiator** - what makes clones feel authentically human vs robotic.

See: `docs/methodology/dna-mental.md`

### AIOS Integration
- Workflows integrate with AIOS agent system
- Use `@mind-mapper` for MMOS workflows
- Use `*task` commands for specific operations
- Leverage AIOS memory for context retention

See: `.aios-core/` and AIOS documentation

---

## 🔧 Customization

### Creating Custom Workflows

Follow AIOS workflow YAML structure:

1. Copy existing workflow as template
2. Modify sequence for your use case
3. Update outputs to match your needs
4. Define custom checkpoints
5. Document prerequisites clearly
6. Test thoroughly before production use

### Extending Workflows

Add custom steps to existing workflows:

1. Identify insertion point in sequence
2. Define new step with proper structure
3. Specify prerequisites and outputs
4. Update validation criteria
5. Document changes in workflow notes

---

## ⚙️ Technical Specifications

### Workflow Metadata
- **Format:** YAML (`.yaml`)
- **Schema:** AIOS workflow schema v3.0
- **Encoding:** UTF-8
- **Line endings:** LF (Unix-style)

### Execution Environment
- **Runtime:** AIOS framework
- **Agents:** analyst, architect, qa, pm
- **Tasks:** `../tasks/*.md`
- **Templates:** `../templates/*.md` or `.yaml`
- **Checklists:** `../checklists/*.md`

### Output Specifications
- **Minds location:** `expansion-packs/mmos/minds/{slug}/`
- **Not versioned:** Outputs are gitignored
- **Structure:** Follows MMOS architecture rules
- **Format:** Markdown, YAML, plain text

---

## 📝 Version History

### v4.0 - 2025-10-25 (Current) - **Modular Architecture**
- ✅ **MAJOR REFACTORING:** 4 workflows → 2 consolidated workflows + 7 modules
- ✅ **Code reduction:** 3,023 lines → 1,128 lines (62.7% reduction)
- ✅ **Zero duplication:** Shared pipeline (Phases 2-7) extracted to modules
- ✅ **Mode system:** 6 execution modes across 2 workflows
- ✅ **Import mechanism:** Custom YAML preprocessor for module expansion
- ✅ **Intelligent mode detection:** Auto-detect public vs no-public
- ✅ **Deleted obsolete files:** private-individual.yaml, brownfield-private.yaml
- ✅ **Updated README:** Documented modular architecture and mode system

**Modules Created:**
- `modules/analysis-foundation.yaml` (88 lines)
- `modules/analysis-critical.yaml` (183 lines)
- `modules/synthesis-knowledge.yaml` (76 lines)
- `modules/synthesis-kb.yaml` (71 lines)
- `modules/implementation-identity.yaml` (37 lines)
- `modules/implementation-prompt.yaml` (83 lines)
- `modules/validation-complete.yaml` (127 lines)

**Impact:** Maintenance is now trivial - update Layer 8? Edit ONE file instead of FOUR.

### v3.0 - 2025-10-25 (Superseded)
- ✅ Converted to AIOS workflow YAML format
- ✅ Moved from `docs/mmos/workflows/` to expansion pack
- ✅ Added greenfield-mind.yaml (complete pipeline)
- ✅ Added brownfield-mind.yaml (incremental updates)
- ✅ Full AIOS compliance with CreatorOS pattern
- ✅ Added private individual mode support
- ✅ Enhanced human checkpoint documentation

### v2.0 - 2025-10-17 (Deprecated)
- Markdown-based workflows in `docs/mmos/workflows/`
- Non-executable, reference documentation only
- Moved to expansion pack for AIOS compliance

### v1.0 - 2025-10-04 (Legacy)
- Original workflow documentation
- Archived

---

## 🆘 Troubleshooting

### Workflow won't start
- ✅ Check prerequisites are met
- ✅ Verify AIOS agent is available
- ✅ Ensure required tasks exist in `../tasks/`
- ✅ Validate input parameters

### Human checkpoint stuck
- ✅ Review checkpoint criteria
- ✅ Examine validation results
- ✅ Check for missing outputs
- ✅ Consult checkpoint documentation

### Outputs not generating
- ✅ Verify output path is correct
- ✅ Check directory permissions
- ✅ Ensure prerequisites completed
- ✅ Review agent execution logs

### Fidelity score too low
- ✅ Review Layer 8 (paradoxes) - most common issue
- ✅ Check source quality and quantity
- ✅ Validate triangulation on Layers 5-8
- ✅ Re-execute analysis with more depth

---

## ⚙️ How Workflows Execute

**New in v3.5:** Workflows now execute via the **Workflow Orchestrator** (Story E001.6-SIMPLE).

### Execution Flow

```
User Command (*map {name})
    ↓
map_mind() function
    ↓
workflow_detector (auto-detect greenfield/brownfield + mode)
    ↓
workflow_preprocessor (expand module imports)
    ↓
workflow_orchestrator (sequence phases, present tasks to AI)
    ↓
AI executes tasks (reads markdown, interprets instructions, elicits if needed)
    ↓
Results tracked in metadata.yaml
```

### Simple Orchestration Pattern

The orchestrator follows a **simple pattern**:
1. **Load workflow YAML** (already preprocessed with modules expanded)
2. **Iterate through sequence phases**
3. **For each phase with task:**
   - Load task markdown (`tasks/{task_name}.md`)
   - Print full markdown to stdout
   - AI reads and executes autonomously
4. **Handle checkpoints** (GO/NO-GO decisions)
5. **Track progress** (update metadata.yaml)

**Key Principle:** Python sequences, AI executes.

### What AI Does

When presented with a task markdown, AI:
- Reads YAML frontmatter (task-id, elicit, inputs, outputs, etc.)
- Reads markdown instructions
- Validates required inputs from context
- Executes instructions step-by-step
- If `elicit: true`, uses AskUserQuestion tool
- Creates output files using Write tool
- Reports completion

**No Python executor needed** - AI has native markdown task execution capabilities.

### State Persistence

**Resume Capability:** Orchestrator updates `metadata.yaml` after each phase:

```yaml
pipeline_phases:
  phase_viability:
    status: completed
    completed_at: "2025-10-25T18:30:00Z"
  phase_research:
    status: in_progress
    updated_at: "2025-10-25T18:35:00Z"
```

If workflow fails or is aborted, it can resume from last completed phase.

### Error Handling

**Graceful failures:**
- Missing workflow/task files: Clear error message
- Invalid YAML: Logged with context
- Task execution failure: Workflow stops, error logged
- User abort: Workflow stops gracefully, state saved

### Architecture Details

For complete architecture documentation, see:
- `docs/architecture/workflow-orchestration.md` - Full architecture spec
- `lib/workflow_orchestrator.py` - Implementation (316 lines)
- `tests/test_workflow_orchestrator.py` - Unit tests (22 tests)
- `tests/test_integration_orchestrator.py` - Integration tests (13 tests)

---

## 📞 Support

### Questions?
- Read workflow YAML `notes` sections (detailed instructions)
- Check `../tasks/` for task-specific documentation
- Review `../README.md` for expansion pack overview
- Consult `docs/methodology/dna-mental.md` for methodology

### Issues?
- Document in `docs/logs/` with timestamp
- Update TODO.md with action items
- Report structural issues to architect
- Update this README if patterns found

---

**Workflow System Version:** 3.0 (AIOS-compliant)
**Last Updated:** 2025-10-25
**Maintained By:** MMOS Mind Mapper Team
