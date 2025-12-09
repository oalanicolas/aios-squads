---
template-id: collection-log
name: Collection Detailed Log
version: 1.0.0
description: Detailed narrative log of collection workflow with timeline, errors, and quality review

output-format: markdown
output-filename: "COLLECTION_LOG_{{timestamp}}.md"
output-title: "Collection Log - {{start_time}}"

workflow-mode: automated
elicit: false

usage-context: Generated automatically during collect-all-sources task, updated in real-time

placeholders:
  - name: start_time
    type: ISO8601
    description: Collection start timestamp
    example: "2025-10-07 17:00:00"

  - name: end_time
    type: ISO8601
    description: Collection completion timestamp
    example: "2025-10-07 17:47:32"

  - name: duration_minutes
    type: integer
    description: Total collection duration in minutes
    example: 47

  - name: sources_file
    type: file_path
    description: Sources list file path
    example: "outputs/minds/sam_altman/sources/sources_master.yaml"

  - name: tiers
    type: string
    description: Tiers collected
    example: "All (1-3)"

  - name: concurrency
    type: integer
    description: Concurrent downloads per type
    example: 4

  - name: retry_strategy
    type: string
    description: Retry configuration
    example: "3 attempts with exponential backoff"

  - name: total_sources
    type: integer
    description: Total sources count
    example: 47

  - name: successful
    type: integer
    description: Successful downloads
    example: 43

  - name: success_rate
    type: float
    description: Success percentage
    example: 91.5

  - name: failed
    type: integer
    description: Failed downloads
    example: 4

  - name: types
    type: array
    description: Source types with statistics
    item_template: |
      ### {{name}}
      - Total: {{total}}
      - Successful: {{successful}}
      - Failed: {{failed}}
      - Success Rate: {{success_rate}}%

  - name: errors
    type: array
    description: User-friendly error information with actionable fixes
    item_template: |
      ### {{source_id}} ({{type}})
      - **What happened:** {{error_plain_english}}
      - **Why it failed:** {{root_cause_explanation}}
      - **How to fix:** {{step_by_step_solution}}
      - **Retries:** {{retries}}
      - **Status:** {{status}}
    error_formatting_guidelines: |
      Transform technical errors into helpful explanations:
      - "Video not found" → "This video was deleted or made private by the owner. Try finding an alternative source."
      - "Rate limit" → "Website blocked us for downloading too fast. Wait 15 minutes and use '*retry' command."
      - "Authentication error" → "Need login credentials. Add API key to .env file: ASSEMBLYAI_API_KEY=your-key"
      - "Network timeout" → "Download took too long (slow connection or large file). Try again with better internet."

  - name: quality_issues
    type: array
    description: Sources with quality concerns
    optional: true
    item_template: |
      - **{{source_id}}:** {{issue}} ({{score}}% quality)

  - name: next_steps
    type: array
    description: Recommended next actions
    example: ["Review low-quality transcripts", "Run chunk-and-index", "Proceed to cognitive analysis"]

template_sections:
  - section: Configuration
    description: Collection parameters and settings
  - section: Summary
    description: High-level statistics
  - section: By Type
    description: Breakdown by source type
  - section: Errors
    description: Detailed error information
  - section: Quality Review
    description: Quality assessment and issues
  - section: Next Steps
    description: Recommended actions

validation:
  - start_time must be before end_time
  - duration_minutes must match time difference
  - All counts must be non-negative
  - Error array must include all failed sources
---

# Data Collection Log

**Started:** {{start_time}}
**Completed:** {{end_time}}
**Duration:** {{duration_minutes}} minutes

## Configuration

- **Sources:** {{sources_file}}
- **Tiers:** {{tiers}}
- **Concurrency:** {{concurrency}}
- **Retry Strategy:** {{retry_strategy}}

## Summary

- **Total Sources:** {{total_sources}}
- **Successful:** {{successful}} ({{success_rate}}%)
- **Failed:** {{failed}}

## By Type

{{#each types}}
### {{name}}
- Total: {{total}}
- Successful: {{successful}}
- Failed: {{failed}}
- Success Rate: {{success_rate}}%

{{/each}}

## Errors

{{#each errors}}
### {{source_id}} ({{type}})
- **Error:** {{error}}
- **Retries:** {{retries}}
- **Status:** {{status}}

{{/each}}

## Quality Review

{{#if quality_issues}}
### Sources Needing Review

{{#each quality_issues}}
- **{{source_id}}:** {{issue}} ({{score}}% quality)

{{/each}}
{{/if}}

---

**Next Steps:**
{{#each next_steps}}
- {{.}}
{{/each}}
