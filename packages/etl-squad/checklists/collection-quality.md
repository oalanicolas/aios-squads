# Collection Quality Checklist

This checklist validates the quality of collected data from ETL workflows. Use this after running any collection task to ensure data meets quality standards before proceeding to downstream processing.

## 1. SOURCE VALIDATION

### 1.1 Source List Validation
- [ ] Sources list file (YAML/JSON) is valid and parseable
- [ ] All required fields present: `id`, `type`, `url`, `tier`
- [ ] No duplicate source IDs
- [ ] URLs are valid and accessible
- [ ] Source types are supported (youtube, blog, pdf, social, podcast)
- [ ] Tier values are valid (1, 2, or 3)

### 1.2 Source Availability
- [ ] All Tier 1 sources are accessible (not 404, not deleted)
- [ ] At least 80% of Tier 2 sources are accessible
- [ ] Unavailable sources are logged with error codes
- [ ] Rate limits are respected (no 429 errors)
- [ ] No IP bans or blocking detected (403 errors)

## 2. DOWNLOAD COMPLETENESS

### 2.1 File Existence
- [ ] All successful downloads have output files
- [ ] Output directory structure matches expected format
- [ ] No zero-byte files (corrupted downloads)
- [ ] All metadata.json files are present for successful downloads
- [ ] Temporary files cleaned up (no .tmp, .partial files)

### 2.2 Download Coverage
- [ ] 100% of Tier 1 sources downloaded successfully
- [ ] At least 80% of Tier 2 sources downloaded successfully
- [ ] At least 60% of Tier 3 sources downloaded successfully
- [ ] Failed downloads are logged with error details
- [ ] Retry attempts documented in logs

### 2.3 File Integrity
- [ ] All downloaded files have valid checksums (if provided)
- [ ] Video files are playable (if applicable)
- [ ] Audio files are valid and not corrupted
- [ ] PDFs can be opened and read
- [ ] JSON/YAML files have valid syntax

## 3. TRANSCRIPT QUALITY (YouTube/Podcast)

### 3.1 Transcript Availability
- [ ] Transcripts generated for all audio/video sources
- [ ] Transcript format is clean markdown
- [ ] Timestamps preserved (if available)
- [ ] Speaker labels present (if diarization enabled)

### 3.2 Transcript Accuracy
- [ ] Transcript quality score > 85% (if measurable)
- [ ] No excessive "[INAUDIBLE]" markers (< 5% of content)
- [ ] Language correctly detected
- [ ] Technical terms and names spelled correctly
- [ ] No corrupted character encodings

### 3.3 Speaker Diarization (if applicable)
- [ ] Expected number of speakers detected
- [ ] Speaker labels are consistent throughout
- [ ] Interviewer correctly identified (if filter enabled)
- [ ] Target speaker (interviewee) correctly isolated
- [ ] Speaker filtering applied as configured

## 4. WEB CONTENT QUALITY (Blogs/Articles)

### 4.1 Content Extraction
- [ ] Main article content extracted successfully
- [ ] Navigation, headers, footers removed
- [ ] Advertisements and widgets removed
- [ ] Code blocks preserved with correct syntax highlighting
- [ ] Tables preserved in markdown format
- [ ] Links preserved and functional

### 4.2 Content Completeness
- [ ] Article is complete (not truncated)
- [ ] No "Read More" or paywall notices in content
- [ ] Images replaced with `[Image: alt text]` placeholders
- [ ] Author and publish date extracted (if available)
- [ ] Article metadata complete (title, URL, tags)

### 4.3 Markdown Quality
- [ ] Valid markdown syntax
- [ ] Heading hierarchy is logical
- [ ] Lists properly formatted
- [ ] Code blocks use correct language identifiers
- [ ] No HTML remnants in markdown

## 5. PDF/DOCUMENT QUALITY

### 5.1 Text Extraction
- [ ] Text extracted from all pages
- [ ] Page numbers and headers/footers removed appropriately
- [ ] Hyphenation issues resolved
- [ ] Line breaks and paragraphs preserved
- [ ] Special characters rendered correctly

### 5.2 Structure Preservation
- [ ] Chapter/section headings identified
- [ ] Table of contents extracted (if present)
- [ ] Footnotes and references preserved
- [ ] Tables extracted (if applicable)
- [ ] Figures noted with placeholders

### 5.3 OCR Quality (if scanned PDF)
- [ ] OCR accuracy > 90%
- [ ] No excessive OCR errors or gibberish
- [ ] Page orientation correct
- [ ] Images preprocessed for optimal OCR
- [ ] Multi-column layout handled correctly

## 6. SOCIAL MEDIA QUALITY

### 6.1 Thread/Post Collection
- [ ] Complete threads collected (all tweets/posts)
- [ ] Thread order preserved
- [ ] Replies and comments included (if configured)
- [ ] Timestamps preserved
- [ ] Author information captured

### 6.2 Content Quality
- [ ] Text content complete and untruncated
- [ ] URLs expanded (not shortened)
- [ ] Mentions and hashtags preserved
- [ ] Embedded media noted with placeholders
- [ ] No duplicate posts/tweets

## 7. METADATA QUALITY

### 7.1 Required Metadata
- [ ] Source ID matches sources list
- [ ] Source type documented
- [ ] Source URL captured
- [ ] Collection timestamp recorded
- [ ] File size and format documented

### 7.2 Optional Metadata (when available)
- [ ] Author/creator name
- [ ] Publication/upload date
- [ ] Duration (for audio/video)
- [ ] Word count (for text)
- [ ] Tags/categories
- [ ] Language detected

### 7.3 Metadata Consistency
- [ ] All metadata.json files have same schema
- [ ] Dates in ISO 8601 format
- [ ] File paths are correct and absolute
- [ ] No null or undefined values for required fields

## 8. OUTPUT ORGANIZATION

### 8.1 Directory Structure
- [ ] Output follows standard structure (downloads/, processed/)
- [ ] Files organized by source type (youtube/, blogs/, pdf/, social/)
- [ ] Each source has dedicated subdirectory (by source ID)
- [ ] No files in unexpected locations
- [ ] README files present in each category directory

### 8.2 File Naming
- [ ] Files use consistent naming convention
- [ ] No special characters in filenames
- [ ] Extensions match content type (.md, .json, .yaml)
- [ ] No name collisions or duplicates
- [ ] Filenames are descriptive and readable

## 9. COLLECTION SUMMARY

### 9.1 Summary Report Existence
- [ ] COLLECTION_SUMMARY.yaml generated
- [ ] COLLECTION_LOG.md generated
- [ ] Summary contains all required sections
- [ ] Statistics are accurate (counts, percentages)
- [ ] Errors logged with details

### 9.2 Summary Accuracy
- [ ] Total source count matches sources list
- [ ] Success/failure counts are correct
- [ ] Success rate calculation is accurate
- [ ] Breakdown by type is correct
- [ ] Breakdown by tier is correct
- [ ] Performance metrics are reasonable

## 10. ERROR HANDLING & LOGGING

### 10.1 Error Documentation
- [ ] All failed sources logged in errors section
- [ ] Error messages are descriptive
- [ ] Retry count documented for each failure
- [ ] Error types categorized (network, parsing, access)
- [ ] Recommendations for fixing errors provided

### 10.2 Log Quality
- [ ] Collection log is complete
- [ ] Timestamps for all major events
- [ ] Progress updates logged
- [ ] Warning conditions documented
- [ ] Debug information available (if enabled)

## 11. PERFORMANCE METRICS

### 11.1 Collection Efficiency
- [ ] Total collection time is reasonable (< 2 min per source average)
- [ ] No excessive retries (< 10% of requests)
- [ ] Parallelization working (multiple sources processing simultaneously)
- [ ] Memory usage acceptable (< 2GB for typical workloads)
- [ ] No memory leaks detected

### 11.2 Quality Metrics
- [ ] Overall success rate > 90% for well-formed sources
- [ ] Transcript accuracy > 85% average
- [ ] Content extraction quality > 95%
- [ ] Metadata completeness > 90%

## 12. READY FOR NEXT PHASE

### 12.1 Pre-Processing Readiness
- [ ] All critical sources (Tier 1) successfully collected
- [ ] Quality issues documented and acceptable
- [ ] Output format compatible with chunking/indexing tools
- [ ] No blocking issues preventing downstream processing

### 12.2 Documentation
- [ ] Collection report reviewed
- [ ] Quality issues triaged
- [ ] Decisions documented for failed sources
- [ ] Next steps identified

---

## SIGN-OFF

**Validation Date:** _______________
**Validated By:** _______________
**Total Sources:** _______________
**Success Rate:** _______________
**Quality Score:** _______________ / 100
**Ready for Processing:** [ ] YES  [ ] NO (reason: ________________)

---

**Checklist Version:** 1.0.0
**Last Updated:** 2025-10-07
**Part of:** ETL Data Collector Expansion Pack v1.0.0
