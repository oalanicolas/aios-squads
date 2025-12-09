---
task-id: collect-blogs
name: Blog & Article Web Scraping
agent: web-specialist
version: 1.0.0
purpose: Scrape blog posts and articles, convert to clean markdown

workflow-mode: automated
elicit: false

inputs:
  - name: sources
    type: array
    description: Sources filtered for type 'blog' or 'article'
    required: true
  - name: output_dir
    type: directory_path
    required: true

outputs:
  - path: "{output_dir}/blogs/{source_id}/article.md"
    format: markdown
  - path: "{output_dir}/blogs/{source_id}/metadata.json"
    format: json

dependencies:
  scripts:
    - scripts/collectors/web-collector.js
    - scripts/extractors/article-extractor.js
  tools:
    - tools/transformers/markdown-converter.js
---

# collect-blogs

---

## Overview

Extracts main content from web pages using Readability algorithm, converts to markdown, and validates quality.

**Inputs:** Sources list filtered for `type: blog` or `type: article`

**Outputs:**
- `{output_dir}/blogs/{source_id}/article.md`
- `{output_dir}/blogs/{source_id}/metadata.json`

---

## Workflow

```javascript
async function collectBlogs(sources, outputDir) {
  const limit = pLimit(5); // Max 5 concurrent requests

  await Promise.allSettled(
    sources.map(source => limit(async () => {
      // 1. Check robots.txt
      if (!await checkRobotsTxt(source.url)) {
        throw new Error('Scraping not allowed by robots.txt');
      }

      // 2. Fetch HTML
      const html = await fetch(source.url, { headers: getHeaders() });

      // 3. Extract article content
      const $ = cheerio.load(html);
      const reader = new Readability($);
      const article = reader.parse();

      // 4. Convert to markdown
      const markdown = turndownService.turndown(article.content);

      // 5. Extract metadata
      const metadata = extractMetadata($, source);

      // 6. Save
      await saveArticle(source.id, markdown, metadata);

      // 7. Validate
      return validateExtraction({ markdown, metadata });
    }))
  );
}
```

---

## Ethical Scraping

- **Respects robots.txt**
- **Rate limiting:** 1 request/second per domain
- **User-Agent rotation**
- **No aggressive scraping**

---

*collect-blogs task v1.0.0*
