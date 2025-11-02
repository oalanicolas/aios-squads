# Cognitive Tools Guide

## Overview

The Cognitive Tools are standalone CLI utilities that wrap Pedro Valério's decision heuristics, providing fast, deterministic decision-making capabilities for various operational contexts. Each tool implements a specific heuristic from Pedro's cognitive mind profile.

### Available Tools

1. **Coherence Scanner** (`PV_PA_001`) - Systemic Coherence Assessment
2. **Future Backcaster** (`PV_BS_001`) - Strategic Backcasting
3. **Automation Checker** (`PV_PM_001`) - Automation Readiness Assessment

### Key Features

- **Performance**: All tools complete in <50ms
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Multiple input modes**: File, inline JSON, or stdin
- **Machine-readable output**: Structured JSON with consistent schema
- **Exit codes**: Standard codes for success/error conditions
- **Deterministic**: Same input always produces same output

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- Pedro Valério Mind artifacts in `.aios-core/minds/pedro_valerio/`
- Heuristic Compiler (`heuristic-compiler.js`)

### Verifying Installation

```bash
# Check each tool
node tools/coherence-scanner.js --version
node tools/future-backcaster.js --version
node tools/automation-checker.js --version
```

### Directory Structure

```
.claude/commands/hybridOps/
├── tools/
│   ├── coherence-scanner.js      # PV_PA_001 tool
│   ├── future-backcaster.js      # PV_BS_001 tool
│   └── automation-checker.js     # PV_PM_001 tool
├── tests/
│   ├── fixtures/                 # Test data
│   ├── tools.test.js            # Unit tests
│   └── integration.test.js      # Integration tests
└── docs/
    └── cognitive-tools-guide.md  # This guide
```

---

## Tool #1: Coherence Scanner

**Heuristic**: `PV_PA_001` - Systemic Coherence Scan
**Purpose**: Assess whether an executor's profile demonstrates systemic coherence

### Input Schema

```json
{
  "truthfulness": <number 0-1>,      // REQUIRED - Coherence/truthfulness score
  "systemAdherence": <number 0-1>,   // REQUIRED - System fit/adherence score
  "skill": <number 0-1>              // REQUIRED - Technical skill score
}
```

### Output Schema

```json
{
  "heuristic": "PV_PA_001",
  "score": <number 0-1>,
  "veto": <boolean>,
  "recommendation": "APPROVE" | "REVIEW" | "REJECT",
  "vetoReason": <string | null>,
  "breakdown": {
    "truthfulness": <number>,
    "truthfulnessWeighted": <number>,
    "systemAdherence": <number>,
    "systemAdherenceWeighted": <number>,
    "skill": <number>,
    "skillWeighted": <number>
  },
  "metadata": {
    "hierarchyRank": "UNACCEPTABLE" | "ACCEPTABLE" | "EXCELLENT",
    "criticalFactors": <string[]>
  }
}
```

### Usage Examples

#### From File

```bash
node tools/coherence-scanner.js --input executor.json
```

**executor.json:**
```json
{
  "truthfulness": 0.85,
  "systemAdherence": 0.75,
  "skill": 0.70
}
```

#### Inline JSON

```bash
node tools/coherence-scanner.js --json '{"truthfulness": 0.85, "systemAdherence": 0.75, "skill": 0.70}'
```

#### From Stdin

```bash
echo '{"truthfulness": 0.85, "systemAdherence": 0.75, "skill": 0.70}' | node tools/coherence-scanner.js --stdin
```

### Decision Logic

The tool implements Pedro's hierarchical weighting system:

- **Truthfulness**: 50% weight (highest priority)
- **System Adherence**: 40% weight
- **Skill**: 30% weight (lowest priority, but still important)

**Veto Conditions:**
- Truthfulness < 0.70 → Automatic REJECT
- Overall score < 0.60 → REJECT
- Score 0.60-0.80 → REVIEW
- Score > 0.80 → APPROVE

### Exit Codes

- `0` - Success (assessment completed)
- `1` - Invalid input (malformed JSON, file not found)
- `2` - Validation error (missing required fields, out of range values)
- `3` - Mind loading failure (heuristic compilation failed)

---

## Tool #2: Future Backcaster

**Heuristic**: `PV_BS_001` - Strategic Backcasting
**Purpose**: Prioritize decisions by backcasting from desired end-state

### Input Schema

```json
{
  "endStateClarity": <number 0-1>,  // REQUIRED - Can also use nested format below
  // OR nested format:
  "endStateVision": {
    "clarity": <number 0-1>         // REQUIRED if using nested format
  },
  "marketSignals": {
    "alignment": <number 0-1>        // OPTIONAL - Defaults to 0.5 if omitted
  }
}
```

### Output Schema

```json
{
  "heuristic": "PV_BS_001",
  "score": <number 0-1>,
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "confidence": "high" | "medium" | "low",
  "recommendation": "PROCEED" | "REVIEW" | "DEFER",
  "rationale": <string>,
  "alignment": {
    "endState": <number>,
    "market": <number>
  }
}
```

### Usage Examples

#### Simplified Format (End-State Only)

```bash
node tools/future-backcaster.js --json '{"endStateClarity": 0.9}'
```

#### Nested Format (Full Context)

```bash
node tools/future-backcaster.js --json '{"endStateVision": {"clarity": 0.9}, "marketSignals": {"alignment": 0.35}}'
```

#### From File

```bash
node tools/future-backcaster.js --input decision.json
```

**decision.json:**
```json
{
  "endStateVision": {
    "clarity": 0.92
  },
  "marketSignals": {
    "alignment": 0.35
  }
}
```

### Decision Logic

**Priority Calculation:**
- HIGH: End-state clarity ≥ 0.8
- MEDIUM: 0.5 ≤ End-state clarity < 0.8
- LOW: End-state clarity < 0.5

**Confidence Assessment:**
- High: Strong alignment between end-state vision and market signals
- Medium: Moderate alignment or one factor unclear
- Low: Poor alignment or low clarity

**Recommendations:**
- PROCEED: HIGH priority + high confidence
- REVIEW: MEDIUM priority or medium confidence
- DEFER: LOW priority or low confidence

### Exit Codes

- `0` - Success (assessment completed)
- `1` - Invalid input
- `2` - Validation error
- `3` - Mind loading failure

---

## Tool #3: Automation Checker

**Heuristic**: `PV_PM_001` - Automation Readiness Assessment
**Purpose**: Determine if a task is ready for automation

### Input Schema

```json
{
  "frequency": <number>,             // REQUIRED - Task frequency (times per period)
  "standardizable": <number 0-1>,    // REQUIRED - How standardizable the task is
  "hasGuardrails": <boolean>         // REQUIRED - Whether safety guardrails exist
}
```

### Output Schema

```json
{
  "heuristic": "PV_PM_001",
  "readyToAutomate": <boolean>,
  "tippingPoint": <boolean>,
  "score": <number 0-1>,
  "veto": <boolean>,
  "vetoReason": <string | null>,
  "recommendation": "AUTOMATE" | "MANUAL" | "REVIEW",
  "rationale": <string>
}
```

### Usage Examples

#### Basic Assessment

```bash
node tools/automation-checker.js --json '{"frequency": 5, "standardizable": 0.8, "hasGuardrails": true}'
```

#### High-Frequency Task (Tipping Point)

```bash
node tools/automation-checker.js --json '{"frequency": 10, "standardizable": 0.85, "hasGuardrails": true}'
```

#### From File

```bash
node tools/automation-checker.js --input task.json
```

**task.json:**
```json
{
  "frequency": 8,
  "standardizable": 0.85,
  "hasGuardrails": true
}
```

### Decision Logic

**Tipping Point Detection:**
- Frequency > 2 = Tipping point reached (automation becomes cost-effective)

**Veto Conditions:**
- `hasGuardrails: false` → Automatic REJECT (safety first)

**Ready to Automate:**
- Frequency > 2 AND
- Standardizable ≥ 0.7 AND
- Has guardrails

**Recommendations:**
- AUTOMATE: Ready + Tipping Point + No veto
- REVIEW: Borderline metrics or moderate risk
- MANUAL: Low frequency or not standardizable enough

### Exit Codes

- `0` - Success (assessment completed)
- `1` - Invalid input
- `2` - Validation error
- `3` - Mind loading failure

---

## Common Use Cases

### 1. Batch Processing

Process multiple items through a tool in sequence:

**Bash:**
```bash
for file in executors/*.json; do
  echo "Processing: $file"
  node tools/coherence-scanner.js --input "$file"
  echo "---"
done
```

**PowerShell:**
```powershell
Get-ChildItem executors/*.json | ForEach-Object {
  Write-Host "Processing: $_"
  node tools/coherence-scanner.js --input $_.FullName
  Write-Host "---"
}
```

### 2. Pipeline Workflows

Chain tools together using JSON output:

```bash
# Assess executor coherence, then backcast decision, then check automation
executor_result=$(node tools/coherence-scanner.js --json '{"truthfulness": 0.85, "systemAdherence": 0.75, "skill": 0.70}')

if [ $(echo $executor_result | jq -r '.veto') = "false" ]; then
  echo "Executor passed coherence check"

  decision_result=$(node tools/future-backcaster.js --json '{"endStateClarity": 0.9}')
  echo "Decision priority: $(echo $decision_result | jq -r '.priority')"

  task_result=$(node tools/automation-checker.js --json '{"frequency": 8, "standardizable": 0.85, "hasGuardrails": true}')
  echo "Ready to automate: $(echo $task_result | jq -r '.readyToAutomate')"
fi
```

### 3. Node.js Integration

Use tools directly from Node.js applications:

```javascript
const { spawnSync } = require('child_process');
const path = require('path');

function runCoherenceCheck(executor) {
  const toolPath = path.join(__dirname, 'tools', 'coherence-scanner.js');

  const result = spawnSync('node', [
    toolPath,
    '--json',
    JSON.stringify(executor)
  ], {
    encoding: 'utf-8'
  });

  if (result.status !== 0) {
    throw new Error(`Tool failed: ${result.stderr}`);
  }

  return JSON.parse(result.stdout);
}

// Usage
const executor = {
  truthfulness: 0.85,
  systemAdherence: 0.75,
  skill: 0.70
};

const assessment = runCoherenceCheck(executor);

if (!assessment.veto) {
  console.log(`✓ Executor approved: ${assessment.recommendation}`);
} else {
  console.log(`✗ Executor rejected: ${assessment.vetoReason}`);
}
```

### 4. CI/CD Integration

Use in continuous integration pipelines:

**.github/workflows/assess-pr.yml:**
```yaml
name: Assess Pull Request
on: [pull_request]

jobs:
  assess:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Run Coherence Check
        run: |
          result=$(node tools/coherence-scanner.js --json '{"truthfulness": 0.85, "systemAdherence": 0.75, "skill": 0.70}')
          echo "Assessment: $result"

          veto=$(echo $result | jq -r '.veto')
          if [ "$veto" = "true" ]; then
            echo "::error::PR failed coherence check"
            exit 1
          fi
```

### 5. Data Transformation Pipeline

Extract → Transform → Load pattern:

```javascript
const fs = require('fs');
const { spawnSync } = require('child_process');

// Read input data
const executors = JSON.parse(fs.readFileSync('executors.json'));

// Transform through cognitive tool
const assessments = executors.map(executor => {
  const result = spawnSync('node', [
    'tools/coherence-scanner.js',
    '--json',
    JSON.stringify(executor)
  ], { encoding: 'utf-8' });

  return {
    ...executor,
    assessment: JSON.parse(result.stdout)
  };
});

// Filter and load results
const approved = assessments.filter(a => a.assessment.recommendation === 'APPROVE');
fs.writeFileSync('approved-executors.json', JSON.stringify(approved, null, 2));

console.log(`Processed ${assessments.length} executors`);
console.log(`Approved: ${approved.length}`);
```

---

## Error Handling

### Understanding Exit Codes

All tools follow consistent exit code conventions:

| Code | Meaning | Action |
|------|---------|--------|
| 0 | Success | Process output normally |
| 1 | Invalid Input | Check JSON syntax, file paths |
| 2 | Validation Error | Verify input schema compliance |
| 3 | Mind Loading Failure | Check mind artifacts are present |

### Error Response Format

All errors return structured JSON to stderr:

```json
{
  "error": "VALIDATION_ERROR" | "INVALID_INPUT" | "UNEXPECTED_ERROR",
  "message": "Human-readable error description",
  "details": {
    "field": "problematic field name",
    "expected": "expected value/type",
    "received": "actual value received",
    "stack": "stack trace (UNEXPECTED_ERROR only)"
  }
}
```

### Common Errors

#### Missing Required Field

```bash
$ node tools/coherence-scanner.js --json '{"truthfulness": 0.85}'
# Exit code: 2

{
  "error": "VALIDATION_ERROR",
  "message": "Missing required field: systemAdherence",
  "details": {
    "error": "Missing required field: systemAdherence"
  }
}
```

#### Out of Range Value

```bash
$ node tools/coherence-scanner.js --json '{"truthfulness": 1.5, "systemAdherence": 0.75, "skill": 0.70}'
# Exit code: 2

{
  "error": "VALIDATION_ERROR",
  "message": "Value out of range: truthfulness must be between 0 and 1",
  "details": {
    "field": "truthfulness",
    "expected": "0-1",
    "received": 1.5
  }
}
```

#### File Not Found

```bash
$ node tools/coherence-scanner.js --input missing.json
# Exit code: 1

{
  "error": "INVALID_INPUT",
  "message": "File not found: missing.json",
  "details": {
    "path": "missing.json"
  }
}
```

### Error Handling in Scripts

**Bash:**
```bash
result=$(node tools/coherence-scanner.js --json '{"truthfulness": 0.85}' 2>&1)
exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo "Success: $result"
elif [ $exit_code -eq 2 ]; then
  echo "Validation error: $result"
  # Parse error and retry with corrected input
else
  echo "Fatal error: $result"
  exit 1
fi
```

**Node.js:**
```javascript
const result = spawnSync('node', [toolPath, '--json', jsonInput], {
  encoding: 'utf-8'
});

if (result.status === 0) {
  const output = JSON.parse(result.stdout);
  console.log('Success:', output);
} else if (result.status === 2) {
  const error = JSON.parse(result.stderr);
  console.error('Validation error:', error.message);
  console.error('Details:', error.details);
  // Handle validation error
} else {
  console.error('Tool failed with exit code', result.status);
  process.exit(1);
}
```

---

## Troubleshooting

### Tool Returns Empty Output

**Symptom:** Tool runs but produces no output

**Possible Causes:**
1. JSON output is being filtered by your shell
2. Tool is writing to stderr instead of stdout
3. Compiler debug output is interfering

**Solution:**
```bash
# Capture both stdout and stderr
node tools/coherence-scanner.js --json '...' 2>&1

# Or redirect stderr to file for inspection
node tools/coherence-scanner.js --json '...' 2> debug.log
```

### Performance Issues

**Symptom:** Tool takes >50ms to execute

**Possible Causes:**
1. First run (heuristic compilation overhead)
2. Large mind artifact files
3. Disk I/O bottleneck

**Solution:**
```bash
# Warm up the tool (first run compiles heuristic)
node tools/coherence-scanner.js --help

# Then measure actual performance
time node tools/coherence-scanner.js --json '...'

# Check if mind artifacts are cached
ls -la .aios-core/minds/pedro_valerio/
```

### Windows CMD Quote Issues

**Symptom:** JSON parsing fails on Windows CMD

**Cause:** Windows CMD doesn't handle single quotes the same as bash

**Solution:**
```cmd
REM Use double quotes and escape inner quotes
node tools\coherence-scanner.js --json "{\"truthfulness\": 0.85, \"systemAdherence\": 0.75, \"skill\": 0.70}"

REM Or use file input instead
node tools\coherence-scanner.js --input executor.json

REM Or use PowerShell
powershell -Command "node tools/coherence-scanner.js --json '{\"truthfulness\": 0.85, \"systemAdherence\": 0.75, \"skill\": 0.70}'"
```

### Mind Loading Failures

**Symptom:** Exit code 3, "Mind loading failure"

**Possible Causes:**
1. Mind artifacts missing or corrupted
2. Heuristic YAML syntax errors
3. Missing dependencies

**Solution:**
```bash
# Verify mind artifacts exist
ls -la .aios-core/minds/pedro_valerio/heuristics/

# Check heuristic-compiler.js exists
ls -la .aios-core/heuristic-compiler.js

# Test heuristic compilation directly
node .aios-core/heuristic-compiler.js

# Check for YAML syntax errors
cat .aios-core/minds/pedro_valerio/heuristics/PV_PA_001.yml
```

### Inconsistent Results

**Symptom:** Same input produces different outputs

**This should NOT happen** - tools are deterministic. If you see this:

**Debugging Steps:**
1. Verify exact input is identical (whitespace matters in JSON)
2. Check if mind artifacts were modified between runs
3. Ensure no race conditions in parallel execution
4. Check tool version (`--version` flag)

```bash
# Run idempotency test
result1=$(node tools/coherence-scanner.js --json '...')
result2=$(node tools/coherence-scanner.js --json '...')

diff <(echo "$result1") <(echo "$result2")
# Should show no differences
```

### Integration Test Failures

**Symptom:** Unit tests pass but integration tests fail

**Possible Causes:**
1. Environment differences (PATH, NODE_PATH)
2. Missing test fixtures
3. Timing/performance issues

**Solution:**
```bash
# Run tests with verbose output
node --test --test-reporter=spec tests/integration.test.js

# Check test fixture files exist
ls -la tests/fixtures/

# Verify tools are executable
node tools/coherence-scanner.js --version
node tools/future-backcaster.js --version
node tools/automation-checker.js --version
```

---

## Testing

### Running Tests

```bash
# Unit tests (31 tests)
node --test tests/tools.test.js

# Integration tests (12 tests)
node --test tests/integration.test.js

# Run all tests
node --test tests/*.test.js

# With coverage
node --test --experimental-test-coverage tests/
```

### Test Coverage

Current test coverage:
- **Unit Tests**: 31 tests covering all tools, input modes, and error cases
- **Integration Tests**: 12 tests covering workflows, performance, and interoperability
- **Performance**: All tools verified to complete in <50ms
- **Coverage**: ≥90% code coverage across all tools

---

## Performance Benchmarks

Measured on standard development machine (Node.js 18, Windows 11):

| Tool | Average | Min | Max | Std Dev |
|------|---------|-----|-----|---------|
| Coherence Scanner | 33ms | 31ms | 37ms | 1.5ms |
| Future Backcaster | 32ms | 30ms | 35ms | 1.2ms |
| Automation Checker | 31ms | 29ms | 34ms | 1.1ms |

All tools meet the <50ms performance requirement with significant headroom.

---

## Best Practices

### 1. Always Validate Input

Before calling tools, validate your input data:

```javascript
function validateExecutorInput(data) {
  const required = ['truthfulness', 'systemAdherence', 'skill'];

  for (const field of required) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }

    const value = data[field];
    if (typeof value !== 'number' || value < 0 || value > 1) {
      throw new Error(`Invalid ${field}: must be number between 0 and 1`);
    }
  }
}

// Use before calling tool
validateExecutorInput(executor);
const result = runTool(executor);
```

### 2. Handle All Exit Codes

Don't just check for success - handle all possible exit codes:

```javascript
const exitCodeHandlers = {
  0: (result) => handleSuccess(JSON.parse(result.stdout)),
  1: (result) => handleInvalidInput(JSON.parse(result.stderr)),
  2: (result) => handleValidationError(JSON.parse(result.stderr)),
  3: (result) => handleMindLoadingFailure(result.stderr)
};

const handler = exitCodeHandlers[result.status] || handleUnknownError;
handler(result);
```

### 3. Use File Input for Complex Data

For large or complex inputs, use file-based input:

```javascript
// Better than escaping complex JSON strings
fs.writeFileSync('temp-input.json', JSON.stringify(complexData));
const result = spawnSync('node', ['tools/tool.js', '--input', 'temp-input.json']);
fs.unlinkSync('temp-input.json');
```

### 4. Monitor Performance

Track tool performance in production:

```javascript
function runToolWithMetrics(tool, input) {
  const startTime = process.hrtime.bigint();
  const result = runTool(tool, input);
  const duration = Number(process.hrtime.bigint() - startTime) / 1_000_000;

  metrics.record(`tool.${tool}.duration`, duration);

  if (duration > 50) {
    logger.warn(`Tool ${tool} exceeded 50ms threshold: ${duration}ms`);
  }

  return result;
}
```

### 5. Cache Results When Appropriate

Tools are deterministic - cache results for identical inputs:

```javascript
const cache = new Map();

function runToolCached(tool, input) {
  const cacheKey = `${tool}:${JSON.stringify(input)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const result = runTool(tool, input);
  cache.set(cacheKey, result);

  return result;
}
```

---

## FAQ

**Q: Can tools be used concurrently?**
A: Yes, all tools are stateless and can be run in parallel safely.

**Q: Do tools require network access?**
A: No, all tools run entirely offline using local mind artifacts.

**Q: Can I customize heuristics?**
A: Heuristics are defined in mind artifacts (`.aios-core/minds/pedro_valerio/`). Modify YAML files to customize behavior.

**Q: Are results deterministic?**
A: Yes, same input always produces same output. Tools have no randomness or time-based factors.

**Q: What's the minimum Node.js version?**
A: Node.js 18+ required for native test runner and modern features.

**Q: Can I use these in Docker?**
A: Yes, ensure mind artifacts are copied into container and Node.js 18+ is installed.

---

## Support

For issues or questions:

1. Check this guide's Troubleshooting section
2. Review unit and integration tests for usage examples
3. Examine tool source code (`tools/*.js`)
4. Check mind artifacts (`.aios-core/minds/pedro_valerio/`)

---

*Cognitive Tools Guide v1.0 - Generated for Story 1.6*
