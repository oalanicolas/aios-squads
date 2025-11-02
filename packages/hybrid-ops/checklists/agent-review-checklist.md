# Hybrid-Ops Agent Review Checklist

## Overview

Use this checklist to review each agent definition for quality, completeness, and compliance with AIOS standards.

## Agent Quality Standards

### Core Structure (Critical)

For each agent file:

- [ ] **File Location**: Placed in `agents/` directory
- [ ] **Naming Convention**: kebab-case with .md extension (e.g., `process-mapper.md`)
- [ ] **File Header**: Contains version, role, and expansion pack reference

### Required Sections

#### 1. Persona Section
- [ ] **## Persona** heading present
- [ ] Subsections included:
  - [ ] ### Role
  - [ ] ### Expertise (list of skills)
  - [ ] ### Style (behavioral traits)
  - [ ] ### Focus (priorities and approach)
- [ ] Clear, specific role definition
- [ ] Expertise list is relevant and comprehensive
- [ ] Style describes agent personality
- [ ] Focus defines agent priorities

#### 2. Commands Section
- [ ] **## Commands** heading present
- [ ] Subsections:
  - [ ] ### Primary Commands (main workflows)
  - [ ] ### Supporting Commands (helpers like *help)
- [ ] All commands use * prefix (e.g., `*start-discovery`)
- [ ] Each command documented with:
  - [ ] Description
  - [ ] Usage example
  - [ ] Workflow or parameters
  - [ ] Expected output
- [ ] At least 1 primary command
- [ ] `*help` command included

#### 3. Tasks Section
- [ ] **## Tasks** heading present
- [ ] Subsections:
  - [ ] ### Primary Task(s)
  - [ ] ### Workflow Reference
- [ ] Task references point to existing task files
- [ ] Task file paths are correct (e.g., `tasks/discover-process.md`)
- [ ] No broken references

#### 4. Templates Section
- [ ] **## Templates** heading present
- [ ] Subsection: ### Uses Templates
- [ ] Lists all templates used by agent
- [ ] Template paths are correct
- [ ] Template purposes documented

#### 5. Integration Points Section
- [ ] **## Integration Points** heading present
- [ ] Subsections:
  - [ ] ### Inputs
  - [ ] ### Outputs
  - [ ] ### Handoff To
- [ ] Clear inputs defined
- [ ] Clear outputs defined
- [ ] Handoff to next agent specified

#### 6. Activation Section
- [ ] **## Activation** heading present
- [ ] Activation command documented (e.g., `@hybridOps:process-mapper`)
- [ ] Slash prefix correct

### Optional Sections (Recommended)

- [ ] **## Example Usage** - Demonstrates typical interaction
- [ ] **## Best Practices** - Do's and Don'ts
- [ ] **## Error Handling** - Common issues and resolutions
- [ ] **## Memory Integration** - Context to save/retrieve
- [ ] **## Knowledge Base** - References to knowledge resources

## Agent-Specific Validation

### Process Mapper Agent
- [ ] Discovery-focused commands present
- [ ] Pain point identification workflow
- [ ] Handoff to process-architect defined
- [ ] References: `tasks/discover-process.md`

### Process Architect Agent
- [ ] Architecture design commands present
- [ ] Phase structure workflow
- [ ] Handoff to executor-designer defined
- [ ] References: `tasks/design-architecture.md`

### Executor Designer Agent
- [ ] Executor assignment commands present
- [ ] Hybrid executor patterns documented
- [ ] Handoff to workflow-designer defined
- [ ] References: `tasks/design-executors.md`

### Workflow Designer Agent
- [ ] Workflow creation commands present
- [ ] Universal execution design pattern
- [ ] Handles BOTH Phase 4 and Phase 5
- [ ] References:
  - [ ] `tasks/design-workflows.md`
  - [ ] `tasks/create-task-definitions.md`

### QA Architect Agent
- [ ] QA gate design commands present
- [ ] Validation criteria patterns
- [ ] Handoff to clickup-engineer defined
- [ ] References: `tasks/design-qa-gates.md`

### ClickUp Engineer Agent
- [ ] ClickUp configuration commands present
- [ ] AIOS-PM custom fields documented
- [ ] Automation patterns included
- [ ] References: `tasks/implement-clickup.md`

### Agent Generator Agent
- [ ] Agent creation commands present
- [ ] Persona design workflow
- [ ] Decision logic patterns
- [ ] References: `tasks/generate-agents.md`

### Compliance Validator Agent
- [ ] Validation commands present
- [ ] Compliance scoring logic
- [ ] Handoff to doc-generator
- [ ] References: `tasks/validate-compliance.md`

### Doc Generator Agent
- [ ] Documentation generation commands present
- [ ] Artifact compilation workflow
- [ ] Final handoff logic
- [ ] References: `tasks/validate-compliance.md`

## Quality Checks

### Writing Quality
- [ ] Clear, concise language
- [ ] No typos or grammatical errors
- [ ] Consistent tone and style
- [ ] Proper markdown formatting

### Technical Accuracy
- [ ] Commands are logically sound
- [ ] Workflows are executable
- [ ] References are accurate
- [ ] Examples are realistic

### Completeness
- [ ] All required sections present
- [ ] No placeholder text (e.g., "TODO", "TBD")
- [ ] All templates documented
- [ ] All handoffs specified

### Consistency
- [ ] Naming matches config.yaml slashPrefix
- [ ] Task IDs match file names
- [ ] Command naming follows * prefix convention
- [ ] Style consistent with other agents

## Common Issues

### Issue: Broken Task References
**Example**: Agent references `tasks/create-hybrid-process.md` Section X
**Fix**: Update to reference specific task file (e.g., `tasks/discover-process.md`)

### Issue: Missing Commands
**Example**: No `*help` command
**Fix**: Add `*help` command to supporting commands section

### Issue: Unclear Handoffs
**Example**: Integration Points section missing
**Fix**: Add Integration Points section with clear handoff specification

### Issue: No Examples
**Example**: No Example Usage section
**Fix**: Add realistic example interaction demonstrating agent usage

## Review Scoring

### Agent Completeness Score

**Critical Sections (60 points)**:
- Persona (10 pts)
- Commands (20 pts)
- Tasks (15 pts)
- Templates (5 pts)
- Activation (10 pts)

**Major Sections (30 points)**:
- Integration Points (15 pts)
- Example Usage (10 pts)
- Error Handling (5 pts)

**Quality Factors (10 points)**:
- Writing quality (3 pts)
- Technical accuracy (3 pts)
- Consistency (2 pts)
- Completeness (2 pts)

**Total Score**: ____ / 100

**Pass Criteria**: ≥ 85% (85/100 points)

## Review Sign-Off

Reviewer: ___________________
Date: ___________________
Score: _____ / 100
Status: [ ] Approved [ ] Needs Revision

**Revision Notes** (if applicable):
-
-
-

---
*Checklist Version: 1.0.0*
*Last Updated: 2025-10-06*
