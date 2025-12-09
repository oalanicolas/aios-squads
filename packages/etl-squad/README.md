# ETL - Blog Collection Utilities

**Version:** 2.0.0 (Refactored)
**Status:** ✅ Production Ready (100% Success Rate)
**Author:** Academia Lendar[IA] (Alan Nicolas)

Lightweight, proven utilities for blog discovery and collection.

## Purpose

Focused expansion pack for blog content collection with battle-tested reliability:
- ✅ **100% success rate** (9/9 Sam Altman blog posts)
- ✅ **Smart discovery rules** (featured posts, temporal filtering)
- ✅ **Platform detection** (WordPress, Medium, Substack, generic)
- ✅ **Semantic slugs** (clean filenames like `how-to-be-successful.md`)
- ✅ **Speaker diarization** (filter interviewer from transcripts)

## What Changed in v2.0.0

**2025-10-27 Refactoring:**

After validating usage across 14 minds:
- **1/14 (7%)** used ETL orchestration
- **13/14 (93%)** used manual collection
- **Blog collection:** 100% success (proven)
- **YouTube collection:** 0% success (yt-dlp blocked)
- **PDF/Podcast/Social:** Never tested

**Actions taken:**
- ✅ Kept proven blog utilities
- ✅ Kept speaker diarization tools
- ❌ Deprecated orchestration (650 LOC overhead)
- ❌ Deprecated untested collectors (YouTube, PDF, podcast, social)
- ❌ Deprecated 6 agents + 8 tasks (AIOS overhead)

See `deprecated/README.md` for migration guide.

## Quick Start

```bash
# 1. Install dependencies
cd expansion-packs/etl
npm install

# 2. Collect blog posts
node bin/collect-blog.js https://blog.samaltman.com ./output

# Output:
# output/blogs/
#   ├── how-to-be-successful.md
#   ├── moores-law-for-everything.md
#   └── the-days-are-long-but-the-decades-are-short.md
```

## Active Components

### Blog Collection (Proven)

**Discovery:**
```bash
node scripts/utils/blog-discovery.js
```

Features:
- Auto-detects featured/top posts
- Temporal filtering (last 3 years)
- Complete archive for small blogs (< 50 posts)
- RSS and HTML parsing

**Collection:**
```bash
node bin/collect-blog.js <blog_url> <output_dir>
```

Features:
- WordPress optimized extraction
- Medium paywall detection
- Substack support
- Generic Readability fallback
- Semantic slug generation
- Clean markdown output (no images)

**Platform Support:**
- ✅ WordPress
- ✅ Medium
- ✅ Substack
- ✅ Generic blogs

### Speaker Diarization (Utility)

```javascript
const { filterSpeaker } = require('./scripts/transformers/speaker-filter.js');

// Filter transcript to keep only target speaker
const filtered = filterSpeaker(transcript, 'Speaker B');
```

Use cases:
- Remove interviewer from podcast transcripts
- Focus on target personality in dialogues
- Clean up multi-speaker content

### Validation Tools

```bash
node scripts/validators/check-completeness.js <sources_dir>
```

## Integration with MMOS

### In research-collection.md

```yaml
# Blog sources
- type: blog
  url: https://blog.example.com
  tool: expansion-packs/etl/bin/collect-blog.js
```

### Standalone Usage

```bash
# Simple blog collection
node expansion-packs/etl/bin/collect-blog.js \
  https://blog.example.com \
  ./output
```

## Proven Track Record

**Sam Altman Blog Collection (2025-10-11):**
- Sources: 9 blog posts
- Success Rate: 100%
- Duration: 42 seconds
- Output Quality: Clean markdown, semantic slugs
- Platform: Generic blog (Readability extractor)

## Dependencies

```json
{
  "@mozilla/readability": "^0.5.0",
  "cheerio": "^1.0.0-rc.12",
  "puppeteer": "^21.0.0",
  "axios": "^1.6.0",
  "turndown": "^7.1.2",
  "js-yaml": "^4.1.0"
}
```

**Python:** None required

## Deprecated Components

Moved to `deprecated/` folder (30-day grace period until 2025-12-27):

**Orchestration (650 LOC):**
- parallel-collector.js
- task-manager.js
- progress-tracker.js
- **Reason:** Overhead not justified

**Collectors (Not Validated):**
- youtube-collector.js (HTTP 403 errors)
- pdf-collector.js (never tested)
- podcast-collector.js (never tested)
- social-collector.js (never tested)
- **Reason:** Zero production usage or known failures

**AIOS Components:**
- 6 agents (all deprecated)
- 8 tasks (all deprecated)
- **Reason:** AIOS overhead without proven value

## Recommended Alternatives

For non-blog sources, use MCPs instead:

**YouTube:**
```bash
# Use youtube-transcript MCP
mcp://youtube-transcript/get-transcript?v=VIDEO_ID
```

**PDF:**
```bash
# Use pdf-reader MCP
mcp://pdf-reader/read?url=PDF_URL
```

**Web Fetch:**
```bash
# Use web-fetch MCP
mcp://web-fetch/fetch?url=URL
```

## File Structure

```
expansion-packs/etl/
├── bin/
│   └── collect-blog.js          # End-to-end blog collection ✅
├── scripts/
│   ├── utils/
│   │   └── blog-discovery.js    # Smart discovery ✅
│   ├── collectors/
│   │   ├── web-collector.js     # Platform-specific extraction ✅
│   │   └── zlibrary-collector.js # Future: book collection
│   ├── transformers/
│   │   ├── speaker-filter.js    # Diarization ✅
│   │   └── clean-transcript.js
│   └── validators/
│       └── check-completeness.js
├── deprecated/                  # Grace period until 2025-12-27
│   ├── orchestrator/
│   ├── collectors/
│   ├── agents/
│   └── tasks/
├── config.yaml                  # v2.0.0 simplified config
└── README.md                    # This file
```

## Smart Rules

### Featured Posts Priority
If blog highlights TOP/featured → collect only those

### Temporal Filtering
If no featured → collect last 3 years

### Complete Archive
If < 50 total posts → collect 100%

## Error Handling

- Graceful platform detection fallbacks
- Retry logic with exponential backoff
- robots.txt compliance
- Rate limiting
- Clear error messages

## Performance

- Concurrent collection (3-5 parallel)
- Progress indicators
- Average: ~5 seconds per blog post
- Proven: 9 posts in 42 seconds

## Migration from v1.0.0

**Before (complex):**
```bash
# Multiple steps, YAML config, orchestration
cd expansion-packs/etl
vim tier1_batch.yaml  # Manual config
node run-collection.js tier1_batch.yaml output/
```

**After (simple):**
```bash
# Single command
cd expansion-packs/etl
node bin/collect-blog.js https://blog.example.com output/
```

**YouTube/PDF users:**
- Migrate to MCPs (youtube-transcript, pdf-reader)
- Or use manual collection
- Deprecated collectors available in `deprecated/` for 30 days

## Support

**Issues:** Report in main MMOS repo
**Docs:** `docs/guides/integration-etl-mmos.md`
**Deprecation Guide:** `expansion-packs/etl/deprecated/README.md`

---

**Maintained by:** MMOS Team
**Last Updated:** 2025-10-27
**Stability:** Production (blog utilities), Deprecated (orchestration/collectors)
**Next Review:** 2025-12-27 (remove deprecated components)
