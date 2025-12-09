# Legacy Scripts

⚠️ **DEPRECATED** - These scripts are no longer maintained and will be removed in a future version.

## Migration Guide

These scripts have been replaced by the new unified collection tools in `bin/`:

| Legacy Script | Replacement | Notes |
|---------------|-------------|-------|
| `discover-blog-posts.js` | `bin/collect-blog.js` | Now includes discovery + collection in one command |
| `collect-transcripts-simple.js` | `bin/collect-youtube.js` | Unified YouTube/podcast collection |
| `find-transcripts.js` | `bin/collect-youtube.js` | Discovery built-in |
| `download-transcripts.js` | `bin/collect-youtube.js` | Download + transcribe in one |
| `import-manual.js` | Manual import still needed | To be integrated in future |
| `validate-log-locations.js` | Built into collectors | Validation now automatic |

## New Workflow

**Old (Legacy):**
```bash
# Step 1: Discover
node discover-blog-posts.js https://blog.example.com sources.yaml

# Step 2: Collect
node run-collection.js sources.yaml ./output

# Step 3: Validate manually
# ...
```

**New (Unified):**
```bash
# ONE COMMAND - Discovery + Collection + Validation
node bin/collect-blog.js https://blog.example.com ./output
```

## Why Deprecated?

1. **Too many manual steps** - Required 3-5 commands for simple collection
2. **No validation** - Had to manually check if files were created
3. **Poor error handling** - Unclear error messages
4. **Not AIOS-compliant** - Hardcoded paths instead of CLI args

## See Also

- [Story 1.1: Simplify MMOS Collection](1.1.simplify-mmos-collection.md)
- [ETL README](../../README.md)
- [Blog Discovery Docs](../../docs/BLOG_DISCOVERY.md)

---

Last updated: 2025-10-11
