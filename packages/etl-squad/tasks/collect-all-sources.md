---
task-id: collect-all-sources
name: Master Orchestrator - Parallel Multi-Source Collection
agent: data-collector
version: 1.0.0
purpose: Master orchestrator for parallel multi-source data collection

workflow-mode: interactive
elicit: true
elicitation-type: custom

prerequisites:
  - Sources list file (sources_master.yaml, sources.yaml, or sources.json)
  - Node.js dependencies installed (npm install)
  - API keys configured (if using social media sources)

inputs:
  - name: sources_path
    type: file_path
    description: Path to sources list (YAML or JSON)
    required: true
    default: "auto-detect from MMOS or prompt user"

  - name: tiers
    type: array
    description: Which tiers to collect (1=essential, 2=important, 3=supplementary)
    required: false
    default: [1, 2, 3]
    user_friendly: "Which sources? All / Only essential / Essential + Important"

  - name: output_dir
    type: directory_path
    description: Where to save downloaded files
    required: false
    default: "auto-detect"
    user_friendly: "Save location (leave blank for default)"

  - name: mode
    type: enum
    description: Collection mode
    required: false
    default: "standard"
    options: ["fast", "standard", "careful"]
    user_friendly: "Fast (parallel, skip errors) / Standard (parallel, retry errors) / Careful (sequential, validate each)"

outputs:
  - path: "{output_dir}/downloads/"
    description: Raw downloaded data organized by type
    format: "directory"

  - path: "{output_dir}/processed/"
    description: Cleaned and structured data
    format: "directory"

  - path: "{output_dir}/COLLECTION_SUMMARY.yaml"
    description: Complete collection statistics and report
    format: "yaml"

  - path: "{output_dir}/COLLECTION_LOG.md"
    description: Detailed log with errors and retries
    format: "markdown"

dependencies:
  agents:
    - youtube-specialist
    - web-specialist
    - document-specialist
    - social-specialist

  tasks:
    - collect-youtube.md
    - collect-blogs.md
    - collect-podcasts.md
    - collect-books.md
    - collect-social.md
    - validate-collection.md

  templates:
    - collection-summary.yaml
    - collection-log.md

  checklists:
    - collection-quality.md
    - completeness-check.md

validation:
  success-criteria:
    - "At least 90% of sources downloaded"
    - "100% of Tier 1 sources downloaded"
    - "Average quality score > 85%"
    - "No security violations (rate limits, bans)"
    - "All outputs validated"

  warning-conditions:
    - "80-90% success rate"
    - "Some Tier 1 sources failed"
    - "Quality score 75-85%"

  failure-conditions:
    - "<80% success rate"
    - "Multiple Tier 1 sources failed"
    - "Security violations detected"

integration:
  mmos:
    trigger: "Post research-collection task"
    context-detection: "Auto-detect from sources_path containing '/minds/'"
    output-location: "outputs/minds/{mind_name}/sources/downloads/"
    next-phase: "Cognitive Analysis"

estimated-duration: "45-60 minutes for ~50 sources"
estimated-storage: "3-5 GB for mixed content"
---

# collect-all-sources

---

## Overview

This task orchestrates the complete data collection workflow from a sources list (YAML/JSON). It groups sources by type, delegates to specialist agents, manages parallel execution, validates completeness, and generates comprehensive reports.

**Use this task when:**
- You have a complete sources list (sources_master.yaml or similar)
- You need to collect data from multiple source types in parallel
- You want automated validation and reporting
- You're integrating with MMOS Mind Mapper (post-research phase)

**Outputs:**
- `downloads/` - Raw downloaded data organized by type
- `processed/` - Cleaned and structured data
- `COLLECTION_SUMMARY.yaml` - Complete collection report
- `COLLECTION_LOG.md` - Detailed log with errors and retries

---

## Prerequisites

### Required Files

1. **Sources List** (one of):
   - `sources_master.yaml` (MMOS format)
   - `sources.yaml` (standalone format)
   - `sources.json` (JSON format)

### Sources List Schema

```yaml
sources:
  - id: lex-fridman-sama
    type: youtube
    url: https://youtube.com/watch?v=...
    title: "Sam Altman: OpenAI, GPT-5, Sora"
    tier: 1
    priority: high
    tags: [ai-safety, openai, leadership]

  - id: sama-blog-moores-law
    type: blog
    url: https://blog.samaltman.com/moores-law-for-everything
    title: "Moore's Law for Everything"
    tier: 1
    priority: high
    tags: [economics, future, ai]

  - id: the-lean-startup
    type: pdf
    url: https://example.com/lean-startup.pdf
    title: "The Lean Startup"
    tier: 2
    priority: medium
    tags: [startups, methodology]
```

### Environment Setup

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (optional for advanced features)
pip install -r config/python-requirements.txt

# Configure API keys (if using social media)
export TWITTER_API_KEY="..."
export REDDIT_CLIENT_ID="..."
```

---

## Workflow Steps

### Step 1: Load and Validate Sources List

```javascript
// Load sources from file
const sourcesPath = await elicitSourcesPath();
const sources = await loadSourcesList(sourcesPath);

// Validate schema
const validation = validateSourcesSchema(sources);
if (!validation.valid) {
  throw new Error(`Invalid sources schema: ${validation.errors.join(', ')}`);
}

console.log(`✓ Loaded ${sources.length} sources`);
```

**Elicitation Point 1:**

```
📂 Sources Configuration

Please provide the path to your sources list:

1. Use MMOS sources_master.yaml (default for MMOS integration)
   Path: outputs/minds/{mind_name}/sources/sources_master.yaml

2. Use custom sources file
   Path: [enter custom path]

3. Use inline JSON (paste sources JSON directly)

Enter choice (1-3):
```

**User Response Handling:**
- Option 1: Auto-detect mind path or prompt for mind name
- Option 2: Validate custom path exists
- Option 3: Parse and validate inline JSON

---

### Step 2: Configure Collection Parameters

**Elicitation Point 2:**

```
⚙️  Collection Configuration

Found sources list: outputs/minds/sam_altman/sources/sources_master.yaml
Total sources: 47 (Tier 1: 15, Tier 2: 20, Tier 3: 12)

1. Which sources do you want to collect?
   [ ] Only essential (Tier 1 - 15 sources)
   [ ] Essential + Important (Tiers 1-2 - 35 sources)
   [x] All sources (Tiers 1-3 - 47 sources) ← RECOMMENDED

2. Collection mode:
   [ ] Fast - Parallel downloads, skip errors (~20 mins)
   [x] Standard - Parallel downloads, retry errors (~45 mins) ← RECOMMENDED
   [ ] Careful - One at a time, validate each (~90 mins)

3. Save location:
   [auto-detect: outputs/minds/sam_altman/sources/downloads/]
   Or enter custom path: ___________

Proceed with these settings? (yes/no/customize):
```

**Simplified User Experience:**
- No technical jargon (concurrent_per_type, error_strategy removed)
- Mode replaces 3 technical parameters with user-friendly options
- Time estimates help users choose appropriate mode
- Default selections work for 95% of use cases

---

### Step 3: Group Sources by Type

```javascript
const grouped = groupSourcesByType(sources);

console.log(`
🔄 Source Distribution:
   • YouTube/Video: ${grouped.youtube?.length || 0}
   • Blogs/Articles: ${grouped.blog?.length || 0}
   • PDFs/eBooks: ${grouped.pdf?.length || 0}
   • Social Media: ${grouped.social?.length || 0}
   • Podcasts/Audio: ${grouped.podcast?.length || 0}
   • Total: ${sources.length}
`);
```

**Human Checkpoint:**

```
⚠️  Review Source Distribution

You're about to collect:
  - 15 YouTube videos (~2.5 hours of content to transcribe)
  - 20 blog articles (~100 pages estimated)
  - 10 PDF files (~2500 pages estimated)
  - 2 social media threads

Estimated time: 45-60 minutes
Estimated storage: 3-5 GB

Proceed? (yes/no/edit):
```

**Conditional Branch: User Response**

```
IF user responds "yes":
  → Continue to Step 4 (Launch Parallel Collection)

IF user responds "no":
  → Abort collection, display "Collection cancelled by user"
  → Exit gracefully

IF user responds "edit":
  → Present interactive editor:
     • Show numbered list of all sources
     • Allow user to exclude specific sources (uncheck boxes)
     • Allow user to exclude entire source types
     • Recalculate time and storage estimates
     • Return to this checkpoint with updated values
  → Loop back to "Proceed?" prompt
```

**Implementation Note:** This checkpoint prevents accidental large downloads and gives users control before execution.

---

### Step 4: Launch Parallel Collection

```javascript
// Initialize progress tracker
const progress = new ProgressTracker(sources.length);

// Launch specialists in parallel with concurrency limits
const tasks = [
  grouped.youtube ? collectYouTube(grouped.youtube, progress) : null,
  grouped.blog ? collectBlogs(grouped.blog, progress) : null,
  grouped.pdf ? collectPDFs(grouped.pdf, progress) : null,
  grouped.social ? collectSocial(grouped.social, progress) : null,
  grouped.podcast ? collectPodcasts(grouped.podcast, progress) : null
].filter(Boolean);

// Execute with Promise.allSettled to handle partial failures
const results = await Promise.allSettled(tasks);

// Process results
const summary = processSummary(results);
```

**Real-time Progress Display:**

```
🚀 Collection In Progress...

YouTube (15)   ████████████░░░░░░░░ 60% (9/15) [Lex Fridman #342]
Blogs (20)     ██████████████████░░ 90% (18/20) [PaulGraham.com]
PDFs (10)      ████████░░░░░░░░░░░░ 40% (4/10) [The Lean Startup]
Social (2)     ████████████████████ 100% (2/2) ✓

Overall: 33/47 (70%) | Elapsed: 23m | ETA: 12m | Errors: 1
```

---

### Step 5: Handle Errors and Retries

```javascript
// Collect all failed downloads
const failed = results
  .filter(r => r.status === 'rejected')
  .map(r => r.reason);

if (failed.length > 0) {
  console.log(`⚠️  ${failed.length} sources failed on first attempt`);

  // Retry with exponential backoff
  const retryResults = await retryFailed(failed, {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  });

  // Update summary
  summary.retries = retryResults;
}
```

**Elicitation Point 3 (if failures persist):**

```
⚠️  Failed Downloads

After 3 retry attempts, ${finalFailed.length} sources still failed:

1. lex-fridman-342 (youtube) - "Video unavailable"
2. techcrunch-article (blog) - "403 Forbidden"
3. book-chapter-5.pdf (pdf) - "Download timeout"

Options:
1. Continue anyway (skip failed sources)
2. Retry manually (show commands for manual download)
3. Abort collection (stop and rollback)

Enter choice (1-3):
```

---

### Step 6: Validate Collection Quality

```javascript
// Run validation checklist
const validation = await validateCollection({
  downloads: summary.successful,
  outputDir: config.outputDir
});

console.log(`
✅ Validation Results:
   • File existence: ${validation.fileExistence.passed}/${validation.fileExistence.total}
   • File integrity: ${validation.fileIntegrity.passed}/${validation.fileIntegrity.total}
   • Metadata presence: ${validation.metadata.passed}/${validation.metadata.total}
   • Content quality: ${validation.quality.score}% average
`);

// Flag quality issues
if (validation.quality.score < 85) {
  const lowQuality = validation.quality.flagged;
  console.warn(`⚠️  ${lowQuality.length} sources have quality issues`);
  // List sources for review
}
```

---

### Step 7: Generate Reports

```javascript
// Generate summary YAML
await generateSummary(summary, `${outputDir}/COLLECTION_SUMMARY.yaml`);

// Generate detailed markdown log
await generateLog(summary, `${outputDir}/COLLECTION_LOG.md`);

// Generate by-type reports
await generateTypeReports(summary, `${outputDir}/logs/by-type/`);
```

**Final Output:**

```
✅ Collection Complete!

📊 Summary:
   • Total sources: 47
   • Successful: 43 (91.5%)
   • Failed: 4 (8.5%)
   • Total size: 2.8 GB
   • Duration: 47 minutes

📂 Output Structure:
   downloads/
   ├── youtube/     (14 videos, 1.2 GB)
   ├── blogs/       (19 articles, 12 MB)
   ├── pdf/         (8 documents, 1.5 GB)
   └── social/      (2 threads, 1 MB)

📋 Reports Generated:
   ✓ COLLECTION_SUMMARY.yaml
   ✓ COLLECTION_LOG.md
   ✓ logs/errors.log

⚠️  4 sources failed - see COLLECTION_LOG.md for details

Next Steps:
   1. Review low-quality transcripts (if any)
   2. Run: *chunk-and-index (prepare for analysis)
   3. Continue to cognitive analysis (MMOS integration)
```

---

## Output Files

### COLLECTION_SUMMARY.yaml

```yaml
collection_summary:
  timestamp: 2025-10-06T18:45:00Z
  sources_file: outputs/minds/sam_altman/sources/sources_master.yaml
  total_sources: 47
  successful: 43
  failed: 4
  success_rate: 91.5

  by_type:
    youtube:
      total: 15
      successful: 14
      failed: 1
      total_duration_seconds: 18432
      total_size_mb: 1247

    blog:
      total: 20
      successful: 19
      failed: 1
      total_size_mb: 12
      avg_word_count: 2847

    pdf:
      total: 10
      successful: 8
      failed: 2
      total_pages: 2483
      total_size_mb: 1542

    social:
      total: 2
      successful: 2
      failed: 0

  by_tier:
    tier_1: { total: 10, successful: 10, success_rate: 100 }
    tier_2: { total: 25, successful: 23, success_rate: 92 }
    tier_3: { total: 12, successful: 10, success_rate: 83.3 }

  performance:
    total_duration_minutes: 47
    avg_download_time_seconds: 12.5
    peak_concurrent_downloads: 8
    retry_count: 7

  quality:
    avg_quality_score: 94.2
    transcripts_above_85_percent: 38
    transcripts_needing_review: 2

  errors:
    - source_id: lex-fridman-podcast-342
      type: youtube
      error: "Video unavailable (private or deleted)"
      retries: 3
      final_status: failed

  next_steps:
    - "Review 2 transcripts with quality < 85%"
    - "Run chunk-and-index task"
    - "Proceed to cognitive analysis"
```

### COLLECTION_LOG.md

```markdown
# Data Collection Log

**Started:** 2025-10-06 17:00:00
**Completed:** 2025-10-06 17:47:32
**Duration:** 47 minutes 32 seconds

## Configuration

- **Sources:** outputs/minds/sam_altman/sources/sources_master.yaml
- **Tiers:** All (1-3)
- **Concurrency:** 4 per type
- **Retry Strategy:** 3 attempts with exponential backoff

## Execution Timeline

### 17:00:00 - Started Collection

Loaded 47 sources:
- YouTube: 15
- Blogs: 20
- PDFs: 10
- Social: 2

### 17:05:23 - First Downloads Complete

- ✓ social-thread-1 (Twitter) - 2.3 seconds
- ✓ social-thread-2 (Twitter) - 3.1 seconds

### 17:08:47 - Blog Collection 50% Complete

- ✓ 10/20 blogs downloaded
- ⚠️ techcrunch-article failed (403 Forbidden)

...

## Errors

### Critical Errors (Collection Failed)

1. **lex-fridman-342** (YouTube)
   - Error: Video unavailable
   - Retries: 3
   - Status: FAILED
   - Recommendation: Verify video URL or find alternative source

...

## Quality Review

### Transcripts Needing Manual Review

1. **lex-fridman-sama** (78% quality)
   - Issue: Background noise affected transcription
   - Location: downloads/youtube/lex-fridman-sama/transcript.txt

...
```

---

## Integration with MMOS

When called from MMOS Mind Mapper:

```javascript
// Auto-detect MMOS context
const isMindPath = config.sourcesPath.includes('/minds/');

if (isMindPath) {
  // Extract mind name
  const mindName = extractMindName(config.sourcesPath);

  // Use MMOS directory structure
  config.outputDir = `outputs/minds/${mindName}/sources/downloads/`;

  // Update MMOS collection status
  await updateMMOSCollectionStatus(mindName, summary);

  // Signal ready for next phase
  console.log(`
  ✅ MMOS Integration Complete

  Mind: ${mindName}
  Next MMOS Phase: Cognitive Analysis

  Run: *cognitive-analysis (from MMOS Mind Mapper)
  `);
}
```

---

## Error Recovery Commands

If collection fails or is interrupted:

```bash
# Resume from checkpoint
node scripts/orchestrator/resume-collection.js

# Retry specific sources
node scripts/orchestrator/retry-sources.js --ids lex-fridman-342,techcrunch-article

# Clean incomplete downloads
node tools/helpers/clean-incomplete.js

# Validate what's been collected so far
node tools/validators/check-completeness.js
```

---

## Performance Tuning

### For Faster Collection

```yaml
# config/etl-config.yaml
performance:
  concurrent_per_type: 8       # Increase parallelism (careful with rate limits)
  skip_video_download: true    # Audio only for transcription
  skip_metadata_enrichment: false
  use_cached_transcripts: true # Use YouTube captions if available
```

### For Better Quality

```yaml
quality:
  prefer_whisper_over_youtube_captions: true
  min_transcript_quality: 90
  validate_during_collection: true
  save_raw_html: true  # For blogs (larger storage but better for review)
```

---

## Troubleshooting

### "Sources file not found"

```bash
# Verify path
ls -la outputs/minds/sam_altman/sources/sources_master.yaml

# Or use absolute path
/Users/alan/Code/mmos/outputs/minds/sam_altman/sources/sources_master.yaml
```

### "Rate limited by API"

- Check API credentials in `.env`
- Reduce concurrency in config
- Wait for rate limit reset (shown in error message)

### "Out of disk space"

- Check available space: `df -h`
- Reduce tiers collected (Tier 1 only)
- Enable `skip_video_download` for YouTube sources

---

## Success Criteria

✅ **Collection is successful if:**
- At least 90% of sources downloaded
- 100% of Tier 1 sources downloaded
- Average quality score > 85%
- No security violations (rate limits, bans)
- All outputs validated

⚠️ **Needs review if:**
- 80-90% success rate
- Some Tier 1 sources failed
- Quality score 75-85%

❌ **Failed if:**
- <80% success rate
- Multiple Tier 1 sources failed
- Security violations detected

---

*collect-all-sources task v1.0.0*
