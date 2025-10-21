# Hybrid-Ops Expansion Pack - Installation Guide

**Version**: 1.0.0 (PV Mind Refactored)
**Location**: `aios-fullstack/expansion-packs/hybrid-ops/`
**Status**: ✅ Migrated from `.claude/commands/`

---

## 📋 Overview

This expansion pack has been migrated to the AIOS-Fullstack structure for better organization and Git management. The pack now lives in `aios-fullstack/expansion-packs/hybrid-ops/` with a junction link at `.claude/commands/hybridOps/` for backward compatibility.

---

## 🏗️ Structure

```
aios-fullstack/expansion-packs/hybrid-ops/
├── agents/          # 18 agents (9 generic + 9 PV-powered)
├── tasks/           # 9 executable workflow tasks
├── utils/           # 14 utility modules (mind-loader, etc)
├── tools/           # 3 PV-powered tools
├── tests/           # Test suites
├── config/          # Configuration files
├── docs/            # Documentation
├── examples/        # Usage examples
├── package.json     # NPM configuration
└── INSTALLATION.md  # This file
```

**Junction Link** (for compatibility):
```
.claude/commands/hybridOps/ → aios-fullstack/expansion-packs/hybrid-ops/
```

---

## 🚀 Installation

### Prerequisites

- Node.js ≥18.0.0
- AIOS Framework v4.31.0+
- Pedro Valério Mind artifacts at `hybrid-ops/minds/pedro_valerio/`

### Install Dependencies

```bash
cd aios-fullstack/expansion-packs/hybrid-ops
npm install
```

### Verify Installation

```bash
# Run tests
npm test

# Run benchmarks
npm run benchmark

# Check junction link
ls -la .claude/commands/hybridOps
```

---

## 🎯 Usage

### Activate Agents

All agents are accessible via the junction link:

```bash
# Phase 1: Discovery
@hybridOps:process-mapper
*start-discovery

# Phase 2: Architecture
@hybridOps:process-architect
*design-process

# ... (Continue through 9 phases)
```

### PV-Powered vs Generic Modes

**PV-Powered Agents** (recommended):
- `@hybridOps:process-mapper-pv`
- `@hybridOps:clickup-engineer-pv`
- `@hybridOps:executor-designer-pv`
- etc.

**Generic Agents** (fallback):
- `@hybridOps:process-mapper`
- `@hybridOps:clickup-engineer`
- etc.

---

## 🔧 Configuration

### Mind Loading

The expansion pack automatically loads Pedro Valério's mind artifacts from:
```
hybrid-ops/minds/pedro_valerio/
├── artifacts/
│   ├── META_AXIOMAS_DE_PEDRO_VALÉRIO.md
│   └── heurísticas_de_decisão_e_algoritmos_mentais_únicos.md
└── sources/
    └── documentos/Gestão ClickUp.md
```

### Dual-Mode Configuration

Edit `config/hybrid-ops.yaml` to set default mode:
```yaml
default_mode: "pv"  # or "generic"
fallback_enabled: true
```

---

## 📊 Migration Details

### What Changed

1. **Location**: Moved from `.claude/commands/hybridOps/` → `aios-fullstack/expansion-packs/hybrid-ops/`
2. **Legacy Backup**: Old version saved at `aios-fullstack/expansion-packs/hybrid-ops.legacy/`
3. **Junction Link**: Created for backward compatibility
4. **Package Name**: Updated to `@aios-fullstack/hybrid-ops`
5. **Repository**: Added GitHub repository metadata

### Files Migrated

- ✅ 18 agent definitions (9 + 9 PV)
- ✅ 9 task workflows
- ✅ 14 utility modules
- ✅ 3 PV-powered tools
- ✅ Complete test suite
- ✅ Configuration files
- ✅ Documentation

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Specific Test Suites

```bash
# Mind loading tests
npm run test:workflow

# Performance tests
npm run test:performance

# Memory leak tests
npm run test:memory
```

### Expected Results

- ✅ 29/29 tests passing
- ✅ Performance overhead <500ms
- ✅ No memory leaks

---

## 📚 Documentation

- **Main README**: `README.md`
- **User Guide**: `aios-fullstack/expansion-packs/hybrid-ops.legacy/user-guide.md`
- **PV Mind Philosophy**: See `HYBRID-OPS-REFACTORING-PLAN.md` (project root)
- **Phase 1 Validation**: `PHASE-1-VALIDATION.md`

---

## 🔍 Troubleshooting

### Junction Link Not Working

**Windows**:
```powershell
# Remove old junction
Remove-Item .claude/commands/hybridOps

# Recreate
New-Item -ItemType Junction -Path '.\.claude\commands\hybridOps' -Target '.\aios-fullstack\expansion-packs\hybrid-ops'
```

**Linux/Mac**:
```bash
# Remove old symlink
rm .claude/commands/hybridOps

# Recreate
ln -s ../../../aios-fullstack/expansion-packs/hybrid-ops .claude/commands/hybridOps
```

### Mind Loading Fails

Verify mind artifacts exist:
```bash
ls -la hybrid-ops/minds/pedro_valerio/artifacts/
```

Expected files:
- `META_AXIOMAS_DE_PEDRO_VALÉRIO.md`
- `heurísticas_de_decisão_e_algoritmos_mentais_únicos.md`

### Tests Failing

```bash
# Reinstall dependencies
cd aios-fullstack/expansion-packs/hybrid-ops
rm -rf node_modules package-lock.json
npm install

# Run verbose tests
npm run test:verbose
```

---

## 🚨 Rollback Instructions

If migration causes issues, restore legacy version:

```bash
# Remove junction
rm .claude/commands/hybridOps

# Restore legacy
mv aios-fullstack/expansion-packs/hybrid-ops.legacy .claude/commands/hybridOps

# Remove new location
rm -rf aios-fullstack/expansion-packs/hybrid-ops
```

---

## 📝 Development

### Adding New Agents

1. Create agent file: `agents/my-agent-pv.md`
2. Load PV mind components:
```yaml
cognitive_layer: "PV Meta-Axiomas + Heurísticas"
decision_logic:
  - Load: META_AXIOMAS_DE_PEDRO_VALÉRIO.md
  - Apply: PV_BS_001, PV_PA_001, PV_PM_001
```
3. Add tests: `tests/my-agent.test.js`
4. Update README

### Running in Development

```bash
# Watch mode
npm run test:watch

# Check performance impact
npm run benchmark
```

---

## 🎯 Next Steps

1. **Review Migration**: Verify all agents work correctly
2. **Run Full Test Suite**: `npm test`
3. **Update Stories**: Mark Story 1.15 (migration) as complete
4. **Git Commit**: Commit migration changes
5. **Continue Development**: Proceed with Phase 2+ stories

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `docs/` directory
- **Stories**: `docs/stories/1.1-*.md` through `1.14-*.md`
- **Refactoring Plan**: `HYBRID-OPS-REFACTORING-PLAN.md`

---

**Last Updated**: 2025-10-20
**Migration Status**: ✅ Complete
**Story**: Story 1.15 - Hybrid-Ops Git Migration
