#!/usr/bin/env node
/**
 * Simple YouTube Transcript Collector
 * Uses youtube-transcript library to fetch transcripts directly from YouTube API
 * Fallback solution when audio downloads are blocked
 */

import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

async function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : null;
}

async function fetchTranscript(videoId, title = '') {
  try {
    console.log(`\n📥 Fetching transcript for: ${title || videoId}`);

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript available');
    }

    console.log(`✅ Transcript fetched: ${transcript.length} segments`);

    // Calculate duration
    const lastSegment = transcript[transcript.length - 1];
    const totalSeconds = Math.floor((lastSegment.offset + lastSegment.duration) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return {
      videoId,
      title,
      segments: transcript,
      totalSegments: transcript.length,
      duration: `${hours}h ${minutes}m`,
      durationSeconds: totalSeconds
    };

  } catch (error) {
    console.error(`❌ Failed to fetch transcript for ${videoId}: ${error.message}`);
    throw error;
  }
}

function formatAsMarkdown(transcriptData, source) {
  const { videoId, title, segments, duration } = transcriptData;

  let markdown = `# ${title}\n\n`;
  markdown += `**Video ID:** ${videoId}\n`;
  markdown += `**Duration:** ${duration}\n`;
  markdown += `**URL:** ${source.url}\n`;
  markdown += `**Collected:** ${new Date().toISOString()}\n`;
  markdown += `**Layers:** ${source.layers.join(', ')}\n\n`;

  if (source.layer_8_evidence) {
    markdown += `**Layer 8 Evidence:** ${source.layer_8_evidence}\n\n`;
  }

  markdown += `---\n\n## Transcript\n\n`;

  // Format transcript with timestamps
  for (const segment of segments) {
    const timestamp = formatTimestamp(segment.offset / 1000);
    markdown += `**[${timestamp}]** ${segment.text}\n\n`;
  }

  return markdown;
}

function formatTimestamp(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

async function collectAll(sourcesYaml, outputDir) {
  console.log('🚀 Simple YouTube Transcript Collector\n');
  console.log(`📋 Sources: ${sourcesYaml}`);
  console.log(`📁 Output: ${outputDir}\n`);

  // Load sources
  const content = await fs.readFile(sourcesYaml, 'utf8');
  const data = yaml.load(content);
  const sources = data.sources || [];

  const results = {
    successful: [],
    failed: [],
    startTime: Date.now()
  };

  // Process each source
  for (const source of sources) {
    try {
      const videoId = await extractVideoId(source.url);
      if (!videoId) {
        throw new Error(`Invalid YouTube URL: ${source.url}`);
      }

      const transcriptData = await fetchTranscript(videoId, source.title);
      const markdown = formatAsMarkdown(transcriptData, source);

      // Save to appropriate directory
      const sourceDir = path.join(outputDir, 'youtube', source.id);
      await fs.mkdir(sourceDir, { recursive: true });

      const transcriptPath = path.join(sourceDir, 'transcript.md');
      const jsonPath = path.join(sourceDir, 'transcript.json');

      await fs.writeFile(transcriptPath, markdown, 'utf-8');
      await fs.writeFile(jsonPath, JSON.stringify(transcriptData, null, 2), 'utf-8');

      console.log(`💾 Saved: ${transcriptPath}`);

      results.successful.push({
        id: source.id,
        videoId,
        title: source.title,
        path: transcriptPath,
        segments: transcriptData.totalSegments
      });

    } catch (error) {
      console.error(`❌ Failed: ${source.id} - ${error.message}`);
      results.failed.push({
        id: source.id,
        url: source.url,
        error: error.message
      });
    }
  }

  results.endTime = Date.now();
  results.durationSeconds = Math.floor((results.endTime - results.startTime) / 1000);

  // Save collection report in correct location
  const _mindName = 'sam_altman';  // Extract from path if needed
  const logsDir = path.join(outputDir, '..', '..', 'docs', 'logs');
  await fs.mkdir(logsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(logsDir, `${timestamp}-transcript-collection.yaml`);
  await fs.writeFile(reportPath, yaml.dump(results, { indent: 2 }), 'utf-8');

  // Print summary
  console.log('\n📊 Collection Summary:');
  console.log(`   Total: ${sources.length}`);
  console.log(`   Successful: ${results.successful.length}`);
  console.log(`   Failed: ${results.failed.length}`);
  console.log(`   Duration: ${results.durationSeconds}s`);
  console.log(`\n💾 Report: ${reportPath}\n`);

  if (results.failed.length > 0) {
    console.log('⚠️  Failed sources:');
    results.failed.forEach(f => console.log(`   - ${f.id}: ${f.error}`));
    console.log('');
  }

  return results;
}

// Main
const sourcesPath = process.argv[2] || '../../docs/minds/sam_altman/sources/tier1_batch.yaml';
const outputDir = process.argv[3] || '../../docs/minds/sam_altman/sources/downloads';

collectAll(sourcesPath, outputDir)
  .then(results => {
    const exitCode = results.failed.length > 0 ? 1 : 0;
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
