---
task-id: collect-social
name: Social Media Data Collection
agent: social-specialist
version: 1.0.0
purpose: Collect social media data (Twitter, LinkedIn, Reddit) with API/MCP integration

workflow-mode: automated
elicit: false

inputs:
  - name: sources
    type: array
    description: Sources filtered for type 'twitter', 'linkedin', 'reddit'
    required: true
  - name: output_dir
    type: directory_path
    required: true

outputs:
  - path: "{output_dir}/social/{source_id}/thread.md"
    format: markdown
  - path: "{output_dir}/social/{source_id}/metadata.json"
    format: json

dependencies:
  data:
    - data/platform-support.yaml
---

# collect-social

---

## Overview

Collects social media content using APIs or MCPs, respecting rate limits and privacy.

**Inputs:** Sources list filtered for `type: twitter`, `type: linkedin`, `type: reddit`

**Outputs:**
- `{output_dir}/social/{source_id}/posts.json`
- `{output_dir}/social/{source_id}/thread.md`
- `{output_dir}/social/{source_id}/metadata.json`

---

## Workflow (Hybrid: MCP + API)

```javascript
async function collectSocial(sources, outputDir) {
  for (const source of sources) {
    // Strategy: Try MCP first, fallback to direct API
    let content;

    try {
      // Option 1: Use MCP if available
      if (hasMCP('twitter')) {
        content = await mcpTwitter.fetchThread(source.url);
      } else {
        // Option 2: Direct API via library
        content = await twitterApi.fetchThread(extractTweetId(source.url));
      }

      // Format as markdown
      const markdown = formatThreadAsMarkdown(content);

      // Save
      await saveSocialContent(source.id, {
        raw: content,
        markdown,
        metadata: extractSocialMetadata(content)
      });

    } catch (error) {
      if (error.code === 429) {
        // Rate limited - wait and retry
        await waitForRateLimit(error.resetTime);
        // Retry logic here
      }
    }
  }
}
```

---

## MCP Integration

**Preferred MCPs:**
- Twitter/X: Custom MCP or Twitter API client
- Reddit: Reddit MCP (snoowrap-based)
- LinkedIn: Limited to public posts only

**Fallback:** Direct API clients if MCPs unavailable

---

## Rate Limiting

- **Twitter:** 100 tweets/15min (API v2)
- **Reddit:** 60 requests/minute
- **LinkedIn:** Very conservative (5-10 posts max)

---

*collect-social task v1.0.0*
