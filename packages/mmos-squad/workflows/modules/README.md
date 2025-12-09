# MMOS Workflow Modules

This directory contains **reusable workflow modules** shared across greenfield and brownfield workflows.

## Purpose

Eliminate duplication by extracting common phases (Layers 1-8, synthesis, implementation, validation) into modules that both workflows reference.

## Module Import Mechanism

Since AIOS doesn't support native YAML imports, modules are expanded via preprocessor before workflow execution.

### Syntax (in workflow files)

```yaml
sequence:
  - import: "modules/analysis-foundation.yaml"
    # Module phases will be expanded inline here
```

### How It Works

1. **Development:** Edit modules individually (cleaner, modular)
2. **Execution:** Preprocessor expands `import:` directives before AIOS runs workflow
3. **Command:** `python lib/workflow_preprocessor.py workflows/greenfield-mind.yaml`

## Available Modules

| Module | Description | Phases | Lines |
|--------|-------------|--------|-------|
| `analysis-foundation.yaml` | DNA Mental™ Layers 1-5 | 5 | ~120 |
| `analysis-critical.yaml` | Layers 6-8 + Checkpoints | 4 | ~140 |
| `synthesis-knowledge.yaml` | Frameworks, communication, signatures | 3 | ~90 |
| `synthesis-kb.yaml` | KB chunking + specialists | 2 | ~70 |
| `implementation-identity.yaml` | Identity core generation | 1 | ~50 |
| `implementation-prompt.yaml` | System prompt + manual | 1 | ~60 |
| `validation-complete.yaml` | Testing, fidelity, approval | 3 | ~90 |

**Total module LOC:** ~620 lines

## Module Structure

All modules follow this format:

```yaml
module:
  id: module-id
  name: Module Name
  description: What this module does
  version: 1.0.0

phases:
  - agent: analyst
    phase: analysis
    creates: artifact-name
    # ... (standard workflow phase syntax)
```

When imported, **only the `phases:` section is expanded** into the parent workflow.

## Usage Example

**Before (duplicated):**
- greenfield-mind.yaml: 767 lines
- private-individual.yaml: 921 lines
- brownfield-mind.yaml: 733 lines
- brownfield-private.yaml: 602 lines
- **Total: 3,023 lines** (massive duplication)

**After (modular):**
- greenfield-mind.yaml: ~200 lines (modes + unique phases + imports)
- brownfield-mind.yaml: ~200 lines (modes + unique phases + imports)
- modules/: ~620 lines (shared across both)
- **Total: ~1,020 lines** (66% reduction, zero duplication)

## Updating Shared Logic

Need to update Layer 8? **Edit ONE file:**

```bash
vim workflows/modules/analysis-critical.yaml
# Changes apply to ALL workflows that import this module
```

## Benefits

✅ **Zero Duplication** - Shared phases defined once
✅ **Single Source of Truth** - Update layer = edit 1 file
✅ **Easier Maintenance** - Clear separation of concerns
✅ **Better Testing** - Test modules independently
✅ **Version Control** - Track module changes separately

---

**Last Updated:** 2025-10-25
**Owner:** MMOS Team
