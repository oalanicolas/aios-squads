---
task-id: validate-collection
name: Validate Collection Completeness & Quality
agent: data-collector
version: 1.0.0
purpose: Comprehensive validation of collected data for completeness and quality

workflow-mode: automated
elicit: false

inputs:
  - name: downloads_dir
    type: directory_path
    description: Downloaded data directory
    required: true
  - name: sources_list
    type: file_path
    description: Original sources list for comparison
    required: true

outputs:
  - path: "{output_dir}/VALIDATION_REPORT.yaml"
    format: yaml
  - path: "{output_dir}/logs/validation_errors.log"
    format: text

dependencies:
  checklists:
    - checklists/collection-quality.md
    - checklists/completeness-check.md
  tools:
    - tools/validators/check-completeness.js
    - tools/validators/validate-transcript.js
    - tools/validators/verify-quality.js
---

# validate-collection

---

## Overview

Validates all downloaded sources against quality criteria, checks file integrity, and generates validation report.

**Inputs:**
- `{output_dir}/downloads/` - Downloaded data directory
- `sources_master.yaml` - Original sources list for comparison

**Outputs:**
- `{output_dir}/VALIDATION_REPORT.yaml`
- `{output_dir}/logs/validation_errors.log`

---

## Validation Checklist

```javascript
async function validateCollection(downloadsDir, sourcesList) {
  const results = {
    fileExistence: await checkFileExistence(downloadsDir, sourcesList),
    fileIntegrity: await checkFileIntegrity(downloadsDir),
    metadataPresence: await checkMetadata(downloadsDir),
    contentQuality: await assessContentQuality(downloadsDir),
    structureCompliance: await validateStructure(downloadsDir)
  };

  // Calculate overall score
  const score = calculateValidationScore(results);

  // Generate report
  await generateValidationReport(results, score);

  return {
    passed: score >= 90,
    score,
    results
  };
}
```

---

## Validation Criteria

### 1. File Existence (Weight: 30%)
- ✅ All Tier 1 sources have files
- ✅ 80%+ of Tier 2 sources have files
- ✅ 60%+ of Tier 3 sources have files

### 2. File Integrity (Weight: 25%)
- ✅ No zero-byte files
- ✅ No corrupted files
- ✅ All files readable

### 3. Metadata Presence (Weight: 20%)
- ✅ Every download has metadata.json
- ✅ Metadata includes required fields (title, author, date, etc.)

### 4. Content Quality (Weight: 20%)
- ✅ Transcripts: Quality score ≥ 85%
- ✅ Articles: Word count ≥ 100
- ✅ PDFs: Text extraction successful

### 5. Structure Compliance (Weight: 5%)
- ✅ Correct directory structure
- ✅ Naming conventions followed
- ✅ README.md present per source

---

## Validation Report Schema

```yaml
validation_report:
  timestamp: 2025-10-06T19:00:00Z
  overall_score: 94
  status: PASSED  # PASSED | NEEDS_REVIEW | FAILED

  file_existence:
    total_expected: 47
    found: 43
    missing: 4
    percentage: 91.5
    status: PASSED

  file_integrity:
    total_files: 43
    valid: 43
    corrupted: 0
    zero_byte: 0
    status: PASSED

  metadata_presence:
    total_files: 43
    with_metadata: 43
    missing_metadata: 0
    status: PASSED

  content_quality:
    avg_score: 92.3
    above_threshold: 41
    needs_review: 2
    failed: 0
    status: NEEDS_REVIEW

    flagged_sources:
      - id: lex-fridman-sama
        type: youtube
        issue: "Transcript quality 78% (below 85% threshold)"
        recommendation: "Manual review or re-transcribe with Whisper"

  structure_compliance:
    correct_structure: true
    naming_compliant: true
    readmes_present: 43
    status: PASSED

  next_actions:
    - "Review 2 transcripts with quality < 85%"
    - "Retry 4 failed downloads"
    - "Proceed to chunk-and-index after review"
```

---

## Usage

```bash
# Run validation
node scripts/validate-collection.js \
  --downloads ./downloads \
  --sources ./sources_master.yaml

# Auto-fix minor issues
node scripts/validate-collection.js --auto-fix

# Generate report only (no fail on errors)
node scripts/validate-collection.js --report-only
```

---

*validate-collection task v1.0.0*
