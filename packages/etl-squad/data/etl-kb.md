# ETL Data Collector - Knowledge Base

<!-- TODO: EXPAND - Complete knowledge base with full details -->

## Overview

Industrial-grade ETL system for multi-source data collection optimized for AI cognitive analysis.

## Key Features

- **Speaker Diarization:** AssemblyAI identifies interviewee vs interviewer
- **Platform Detection:** Auto-detects WordPress, Medium, Substack, etc
- **Minimal Content:** Markdown only, no images/videos
- **Parallel Processing:** Concurrent downloads across source types
- **Quality Validation:** Automatic quality checks and validation

## Architecture

### Collectors
- **YouTube:** ytdl-core + AssemblyAI transcription
- **Web:** Platform-specific extractors (WordPress, Medium, Generic/Readability)
- **PDF:** pdf-parse + OCR fallback
- **Podcast:** RSS parsing + AssemblyAI
- **Social:** Twitter/Reddit/LinkedIn

### MCPs
- **AssemblyAI:** Primary transcription with diarization
- **YouTube Transcript:** Fallback for captions
- **PDF Reader:** Optional MCP for PDFs
- **Web Fetch:** Optional MCP for web scraping

## Best Practices

1. **Always enable speaker diarization** for interviews/podcasts
2. **Use Tier 1** for most important sources (100% collection rate)
3. **Clean up audio files** after transcription (save space)
4. **Validate quality** before proceeding to analysis
5. **Respect rate limits** to avoid IP bans

## Troubleshooting

### Low Transcript Quality
- Check audio quality
- Verify AssemblyAI API key
- Try manual speaker labeling

### Failed Downloads
- Check internet connection
- Verify source URLs
- Check rate limits

---

*ETL Data Collector KB v1.0.0*
