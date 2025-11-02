# Hybrid-Ops Expansion Pack Installation Checklist

## Pre-Installation

- [ ] AIOS-FULLSTACK core framework installed (v2.0+)
- [ ] Node.js 18+ installed
- [ ] Git configured
- [ ] Sufficient disk space (minimum 50MB)

## Installation Steps

### 1. Install Expansion Pack

- [ ] Navigate to AIOS-V3 directory
- [ ] Run: `npm run install-expansion hybrid-ops`
- [ ] Verify: No installation errors

### 2. Verify Directory Structure

- [ ] `expansion-packs/hybrid-ops/` exists
- [ ] `agents/` directory present (9 agent files)
- [ ] `tasks/` directory present (9 task files)
- [ ] `templates/` directory present
- [ ] `data/` directory present
- [ ] `config.yaml` exists at root
- [ ] `README.md` exists at root

### 3. Validate Agent Registration

- [ ] Run: `aios agents list --expansion hybrid-ops`
- [ ] Verify 9 agents registered:
  - `@hybridOps:process-mapper`
  - `@hybridOps:process-architect`
  - `@hybridOps:executor-designer`
  - `@hybridOps:workflow-designer`
  - `@hybridOps:qa-architect`
  - `@hybridOps:clickup-engineer`
  - `@hybridOps:agent-generator`
  - `@hybridOps:compliance-validator`
  - `@hybridOps:doc-generator`

### 4. Validate Task Registration

- [ ] Run: `aios tasks list --expansion hybrid-ops`
- [ ] Verify 9 tasks registered:
  - `discover-process`
  - `design-architecture`
  - `design-executors`
  - `design-workflows`
  - `create-task-definitions`
  - `design-qa-gates`
  - `implement-clickup`
  - `generate-agents`
  - `validate-compliance`

### 5. Test Agent Activation

- [ ] Test: `@hybridOps:process-mapper`
- [ ] Verify: Agent activates and displays commands
- [ ] Test: `*help` command works
- [ ] Verify: No errors in console

### 6. Verify Template Access

- [ ] Check templates directory readable
- [ ] Verify template files present:
  - `templates/meta/*.yaml`
  - `templates/*.yaml`
- [ ] Test template loading (run any agent command)

## Post-Installation

### Configuration

- [ ] Review `config.yaml` for customization needs
- [ ] Update slashPrefix if needed (default: `hybridOps`)
- [ ] Configure any environment variables

### Documentation Review

- [ ] Read `README.md`
- [ ] Review agent documentation in `agents/`
- [ ] Understand task workflows in `tasks/`

### First Process Creation

- [ ] Activate: `@hybridOps:process-mapper`
- [ ] Run: `*start-discovery`
- [ ] Complete discovery phase
- [ ] Verify: Discovery document generated

## Troubleshooting

### Common Issues

**Issue**: Agents not registered
**Solution**:
- Check config.yaml syntax
- Re-run installation
- Check AIOS core version

**Issue**: Templates not found
**Solution**:
- Verify templates/ directory exists
- Check file permissions
- Ensure relative paths correct

**Issue**: Task commands fail
**Solution**:
- Check task files exist in tasks/
- Verify YAML syntax
- Review error logs

## Success Criteria

- [ ] All 9 agents activate successfully
- [ ] All 9 tasks are accessible
- [ ] Templates load without errors
- [ ] Can complete Phase 1 discovery session
- [ ] Documentation is clear and accessible

## Support

For issues or questions:
- Review expansion pack README.md
- Check AIOS core documentation
- Report issues to expansion pack maintainer

---
*Checklist Version: 1.0.0*
*Last Updated: 2025-10-06*
