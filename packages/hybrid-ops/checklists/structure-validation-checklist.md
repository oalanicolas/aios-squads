# Hybrid-Ops Expansion Pack Structure Validation Checklist

## Overview

This checklist validates compliance with AIOS expansion pack standards.
Target compliance score: **≥ 95%**

## Required Files & Directories (Critical)

### Root Level Files
- [ ] `config.yaml` exists
  - [ ] Contains: name, version, short-title, description, author, slashPrefix
  - [ ] Valid YAML syntax
  - [ ] Version follows semver (e.g., 1.0.0)

- [ ] `README.md` exists
  - [ ] Contains: overview, features, installation, usage, agents, tasks
  - [ ] Minimum 100 lines
  - [ ] Well-structured markdown

### Required Directories
- [ ] `agents/` directory exists
  - [ ] Contains ≥ 1 agent file
  - [ ] All files are .md format
  - [ ] Follow agent template structure

- [ ] `tasks/` directory exists
  - [ ] Contains ≥ 1 task file
  - [ ] All files are .md or .yaml format
  - [ ] Follow task template structure

- [ ] `templates/` directory exists
  - [ ] Contains ≥ 1 template file
  - [ ] Subdirectories organized (optional)

- [ ] `data/` directory exists
  - [ ] Contains knowledge base or reference data

- [ ] `checklists/` directory exists (this directory)
  - [ ] Contains validation checklists

## Agent Files Validation

For each agent in `agents/`:

- [ ] File naming: kebab-case with .md extension
- [ ] Contains required sections:
  - [ ] ## Persona
  - [ ] ## Commands
  - [ ] ## Tasks
  - [ ] ## Templates
  - [ ] ## Activation
- [ ] Commands use * prefix (e.g., *help, *start)
- [ ] Task references point to valid task files
- [ ] Template references point to valid template files

## Task Files Validation

For each task in `tasks/`:

- [ ] File naming: kebab-case with .md or .yaml extension
- [ ] Contains required sections:
  - [ ] ## Purpose
  - [ ] ## Inputs
  - [ ] ## Key Activities & Instructions
  - [ ] ## Outputs
  - [ ] ## Next Steps
- [ ] Clear step-by-step instructions
- [ ] Well-defined inputs and outputs
- [ ] Handoff criteria specified

## Template Files Validation

For each template in `templates/`:

- [ ] Valid YAML syntax (for .yaml files)
- [ ] Contains placeholders: {variable_name}
- [ ] Documented usage in README or agent files
- [ ] Organized in subdirectories (if applicable)

## Cross-Reference Validation

### Agent → Task References
- [ ] All agent task references point to existing task files
- [ ] No broken paths (e.g., tasks/nonexistent.md)
- [ ] Task IDs match file names

### Agent → Template References
- [ ] All agent template references point to existing template files
- [ ] Template paths are correct
- [ ] Templates are accessible

### Task → Task References (Handoffs)
- [ ] Task handoff references point to valid next tasks
- [ ] No circular dependencies
- [ ] Dependency chains are logical

## Compliance Scoring

### Critical Items (50 points)
- [ ] config.yaml exists (10 pts)
- [ ] README.md exists (10 pts)
- [ ] agents/ directory with ≥ 1 agent (10 pts)
- [ ] tasks/ directory with ≥ 1 task (10 pts)
- [ ] No broken agent→task references (10 pts)

### Major Items (30 points)
- [ ] templates/ directory exists (10 pts)
- [ ] data/ directory exists (5 pts)
- [ ] checklists/ directory exists (5 pts)
- [ ] All agent files follow template structure (5 pts)
- [ ] All task files follow template structure (5 pts)

### Minor Items (20 points)
- [ ] Template references valid (5 pts)
- [ ] Documentation quality high (5 pts)
- [ ] Organized subdirectories (5 pts)
- [ ] Consistent naming conventions (5 pts)

**Total Score**: ____ / 100

**Grade**:
- 95-100: Excellent ✅
- 85-94: Good ⚠️
- 70-84: Acceptable ⚠️⚠️
- < 70: Needs Improvement ❌

## Common Issues & Fixes

### Issue: Broken Task References
**Symptoms**: Agents reference `tasks/old-file.md` that doesn't exist
**Fix**: Update agent files to reference correct task files

### Issue: Missing config.yaml
**Symptoms**: Expansion pack won't install
**Fix**: Create config.yaml with required fields

### Issue: Missing checklists/ Directory
**Symptoms**: Validation checklist not found
**Fix**: Create checklists/ directory and add validation checklists

### Issue: Inconsistent Naming
**Symptoms**: Mix of camelCase and kebab-case
**Fix**: Standardize all file names to kebab-case

## Validation Commands

Run these commands to validate structure:

```bash
# Validate config.yaml syntax
cat expansion-packs/hybrid-ops/config.yaml | yaml-validator

# Count agents
ls expansion-packs/hybrid-ops/agents/ | wc -l

# Count tasks
ls expansion-packs/hybrid-ops/tasks/ | wc -l

# Check for broken references
grep -r "tasks/create-hybrid-process.md" expansion-packs/hybrid-ops/agents/
# (Should return no results if all references updated)

# Validate all YAML files
find expansion-packs/hybrid-ops -name "*.yaml" -exec yaml-validator {} \;
```

## Success Criteria

- [ ] All critical items pass (50/50 points minimum)
- [ ] Overall score ≥ 95%
- [ ] No broken references
- [ ] All files follow naming conventions
- [ ] Documentation is complete and clear

---
*Checklist Version: 1.0.0*
*Last Updated: 2025-10-06*
