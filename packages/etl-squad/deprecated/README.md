# Deprecated Components - ETL Data Collector

**Date:** 2025-10-27
**Reason:** Refactoring based on real-world usage validation

## Why Deprecated

After validating actual usage across 14 minds in the MMOS system:
- **1/14 minds (7%)** used ETL orchestration
- **13/14 minds (93%)** used manual collection
- **Blog collection:** 100% success rate (9/9 posts)
- **YouTube collection:** 0% success rate (yt-dlp HTTP 403 blocked)
- **PDF/Podcast/Social:** Never tested in production

## What Moved Here

### Orchestration Layer (650 LOC)
- `orchestrator/parallel-collector.js`
- `orchestrator/task-manager.js`
- `orchestrator/progress-tracker.js`

**Reason:** Overhead not justified for typical workload (12 sources in 42s)

### Collectors (Not Validated)
- `collectors/youtube-collector.js` - HTTP 403 errors (yt-dlp blocked)
- `collectors/pdf-collector.js` - Never tested, MCP alternative available
- `collectors/podcast-collector.js` - Never tested
- `collectors/social-collector.js` - Never tested

**Reason:** Zero production usage or known failures

### AIOS Agents (6 agents)
All agent definitions moved to `deprecated/agents/`

**Reason:** AIOS overhead without proven value

### AIOS Tasks (8 tasks)
All task definitions moved to `deprecated/tasks/`

**Reason:** AIOS overhead without proven value

## What Remains Active

### Proven Components (100% Success)
- ✅ `scripts/utils/blog-discovery.js` - Smart blog discovery
- ✅ `scripts/collectors/web-collector.js` - WordPress, Medium, generic
- ✅ `bin/collect-blog.js` - End-to-end blog collection
- ✅ `scripts/transformers/speaker-filter.js` - Speaker diarization

### Dependencies
- Node packages: readability, cheerio, puppeteer, turndown
- Python packages: (none required for active components)

## Migration Path

### For Blog Collection
**Before (complex):**
```bash
cd expansion-packs/etl
node run-collection.js tier1_batch.yaml output/
```

**After (simple):**
```bash
cd expansion-packs/etl
node bin/collect-blog.js https://blog.example.com output/
```

### For YouTube/PDF
**Recommendation:** Use MCPs instead
- YouTube → `youtube-transcript` MCP
- PDF → `pdf-reader` MCP
- Web fetch → `web-fetch` MCP

### For Speaker Diarization
```javascript
// Still available as standalone utility
const { filterSpeaker } = require('./scripts/transformers/speaker-filter.js');
const filtered = filterSpeaker(transcript, 'Speaker B');
```

## Can I Still Use Deprecated Code?

**Yes,** but not recommended:
- Code remains in `deprecated/` folder
- No maintenance or updates
- Known issues not fixed
- May break with dependency updates

## Timeline

- **2025-10-27:** Components moved to deprecated/
- **2025-11-27:** 30-day grace period
- **2025-12-27:** Final removal of deprecated code

## Questions?

See: `expansion-packs/etl/README.md`
Or: `docs/guides/integration-etl-mmos.md`

---

**Decision based on:** Real usage validation across 14 production minds
**Approved by:** Architecture review 2025-10-27
