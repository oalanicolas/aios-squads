---
task-id: chunk-and-index
name: Chunk Text & Create Search Index
agent: data-collector
version: 1.0.0
purpose: Chunk text into semantic segments and create searchable index

workflow-mode: automated
elicit: false

inputs:
  - name: downloads_dir
    type: directory_path
    description: Raw downloaded data directory
    required: true
  - name: chunking_strategy
    type: object
    description: Chunking configuration
    required: false
    default:
      max_tokens: 500
      overlap: 50
      preserve_paragraphs: true

outputs:
  - path: "{output_dir}/processed/chunks/"
    format: directory
    description: Chunked text files
  - path: "{output_dir}/processed/index.json"
    format: json
    description: Search index
  - path: "{output_dir}/processed/CHUNKING_REPORT.yaml"
    format: yaml

dependencies:
  tools:
    - tools/transformers/chunk-text.js
---

# chunk-and-index

---

## Overview

Post-processing step that chunks collected text into semantic segments, creates embeddings (optional), and generates search index for efficient retrieval during cognitive analysis.

**Inputs:**
- `{output_dir}/downloads/` - Raw downloaded data
- Chunking strategy configuration

**Outputs:**
- `{output_dir}/processed/chunks/` - Chunked text files
- `{output_dir}/processed/index.json` - Search index
- `{output_dir}/processed/CHUNKING_REPORT.yaml`

---

## Workflow

```javascript
async function chunkAndIndex(downloadsDir, outputDir) {
  // 1. Collect all text files
  const textFiles = await collectTextFiles(downloadsDir);

  // 2. Chunk each file
  const chunks = [];
  for (const file of textFiles) {
    const text = await fs.readFile(file, 'utf-8');

    // Semantic chunking (context-aware)
    const fileChunks = semanticChunk(text, {
      maxTokens: 500,
      overlap: 50,
      preserveParagraphs: true
    });

    chunks.push(...fileChunks);
  }

  // 3. Create index
  const index = createSearchIndex(chunks);

  // 4. Save
  await saveChunks(chunks, `${outputDir}/processed/chunks/`);
  await saveIndex(index, `${outputDir}/processed/index.json`);

  // 5. Report
  await generateChunkingReport({
    total_chunks: chunks.length,
    avg_chunk_size: calculateAvgSize(chunks),
    total_tokens: countTotalTokens(chunks)
  });
}
```

---

## Chunking Strategies

### 1. Fixed-Size Chunking
```javascript
function fixedSizeChunk(text, maxTokens = 500, overlap = 50) {
  // Simple token-based chunking with overlap
}
```

### 2. Semantic Chunking (Recommended)
```javascript
function semanticChunk(text, options) {
  // Preserve:
  // - Paragraph boundaries
  // - Section headings
  // - Code blocks
  // - Lists
}
```

### 3. Hybrid (For Cognitive Analysis)
```javascript
function hybridChunk(text, metadata) {
  // Context-aware chunking based on source type
  if (metadata.type === 'youtube') {
    // Timestamp-aware chunks
  } else if (metadata.type === 'pdf') {
    // Chapter/section-aware chunks
  }
}
```

---

## Index Schema

```json
{
  "chunks": [
    {
      "id": "chunk_0001",
      "source_id": "lex-fridman-sama",
      "source_type": "youtube",
      "text": "Sam Altman discusses AI safety...",
      "tokens": 487,
      "metadata": {
        "timestamp_start": "00:15:23",
        "timestamp_end": "00:17:42",
        "topics": ["ai-safety", "alignment"],
        "layer_hint": 3
      }
    }
  ],
  "index": {
    "by_source": {...},
    "by_topic": {...},
    "by_layer": {...}
  },
  "stats": {
    "total_chunks": 1247,
    "total_tokens": 618432,
    "avg_chunk_size": 496
  }
}
```

---

## Integration with MMOS

Chunked data is optimized for MMOS Cognitive Analysis:

```javascript
// MMOS can query chunks by layer
const layer5Chunks = index.byLayer[5]; // Values & trade-offs evidence

// Or by topic
const aiSafetyChunks = index.byTopic['ai-safety'];

// Direct chunk retrieval
const chunk = index.chunks.find(c => c.id === 'chunk_0042');
```

---

*chunk-and-index task v1.0.0*
