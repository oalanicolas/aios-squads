# Hybrid-Ops Examples

This directory contains runnable examples demonstrating Hybrid-Ops functionality in PV mode.

## Available Examples

### sample-process-mapping.js
**Purpose**: Demonstrates basic PV mode workflow with cognitive validation

**What it shows:**
- Mind loading and session management
- Heuristic execution (PV_BS_001, PV_PA_001, PV_PM_001)
- Axioma validation (4-level quality gates)
- Process mapping with cognitive feedback

**Usage:**
```bash
node examples/sample-process-mapping.js
```

**Expected Output:**
- Mind loading confirmation
- Heuristic scores for each process step
- Axioma validation results
- Summary of validated process

**Prerequisites:**
- Mind artifacts in `hybrid-ops/minds/pedro_valerio/` (49 files)
- Dependencies installed: `npm install`

## Running Examples

All examples are self-contained and can be run directly from the project root:

```bash
# From project root
cd .claude/commands/hybridOps/

# Run sample
node examples/sample-process-mapping.js
```

## Troubleshooting

**Error: "Mind artifacts not found"**
- Verify: `ls hybrid-ops/minds/pedro_valerio/` shows 49 files
- If missing, clone mind artifacts repository

**Error: "Cannot find module..."**
- Run: `npm install` from hybridOps directory
- Verify package.json dependencies installed

**Validation fails unexpectedly**
- Enable debug: `export AIOS_DEBUG=true`
- Check config: `cat config/heuristics.yaml`
- Review validation scores in output

## Adding New Examples

To add a new example:
1. Create `examples/your-example.js`
2. Follow the pattern in `sample-process-mapping.js`
3. Include clear comments and error handling
4. Test thoroughly before committing
5. Update this README with usage instructions
