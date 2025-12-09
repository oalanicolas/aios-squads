#!/usr/bin/env node
/**
 * Transcript Finder - Search for existing transcripts across the web
 * Many podcasts/interviews have transcripts published by third parties
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

class TranscriptFinder {
  constructor() {
    this.knownSites = [
      {
        name: 'Podcast Notes',
        baseUrl: 'https://podcastnotes.org',
        searchPattern: (title) => `site:podcastnotes.org "${title}"`
      },
      {
        name: 'Rev Blog',
        baseUrl: 'https://www.rev.com/blog',
        searchPattern: (title) => `site:rev.com/blog "${title}" transcript`
      },
      {
        name: 'Medium',
        baseUrl: 'https://medium.com',
        searchPattern: (title) => `site:medium.com "${title}" transcript`
      },
      {
        name: 'Scribd',
        baseUrl: 'https://www.scribd.com',
        searchPattern: (title) => `site:scribd.com "${title}"`
      },
      {
        name: 'Read That Podcast',
        baseUrl: 'https://readthat.fm',
        searchPattern: (title) => `site:readthat.fm "${title}"`
      }
    ];
  }

  async findTranscripts(sources) {
    console.log('\n🔍 Searching for existing transcripts across the web...\n');

    const results = [];

    for (const source of sources) {
      console.log(`📝 Searching for: ${source.title}`);

      const findings = await this._searchForSource(source);

      if (findings.length > 0) {
        console.log(`   ✅ Found ${findings.length} potential sources`);
        findings.forEach(f => console.log(`      - ${f.site}: ${f.url}`));
      } else {
        console.log(`   ⚠️  No transcripts found`);
      }

      results.push({
        source_id: source.id,
        title: source.title,
        url: source.url,
        findings
      });

      // Respectful delay between searches
      await this._sleep(2000);
    }

    return results;
  }

  async _searchForSource(source) {
    const findings = [];

    // Generate search queries for each known site
    for (const site of this.knownSites) {
      try {
        const searchQuery = site.searchPattern(source.title);
        const url = await this._googleSearch(searchQuery);

        if (url) {
          findings.push({
            site: site.name,
            url,
            searchQuery
          });
        }
      } catch (_error) {
        // Silent fail, try next site
      }
    }

    // Try direct URL patterns
    const directUrls = await this._tryDirectPatterns(source);
    findings.push(...directUrls);

    return findings;
  }

  async _tryDirectPatterns(source) {
    const findings = [];
    const videoId = this._extractVideoId(source.url);

    // Common patterns for transcript sites
    const patterns = [
      `https://readthat.fm/youtube/${videoId}`,
      `https://podcastnotes.org/?s=${encodeURIComponent(source.title)}`,
      `https://www.rev.com/blog/transcript/${source.title.toLowerCase().replace(/\s+/g, '-')}`
    ];

    for (const url of patterns) {
      try {
        const exists = await this._checkUrlExists(url);
        if (exists) {
          findings.push({
            site: 'Direct Pattern',
            url,
            searchQuery: 'Direct URL pattern match'
          });
        }
      } catch (_error) {
        // Silent fail
      }
    }

    return findings;
  }

  async _googleSearch(_query) {
    // Note: This is a placeholder. In production, use Google Custom Search API
    // For now, return null and suggest manual search
    return null;
  }

  async _checkUrlExists(url) {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
        validateStatus: (status) => status < 400
      });
      return response.status === 200;
    } catch (_error) {
      return false;
    }
  }

  _extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  }

  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async generateSearchInstructions(sources) {
    console.log('\n📋 Manual Search Instructions\n');

    const instructions = [];

    for (const source of sources) {
      const videoId = this._extractVideoId(source.url);

      instructions.push({
        source_id: source.id,
        title: source.title,
        searches: [
          {
            site: 'Google',
            query: `"${source.title}" transcript full text`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`"${source.title}" transcript full text`)}`
          },
          {
            site: 'Podcast Notes',
            query: source.title,
            url: `https://podcastnotes.org/?s=${encodeURIComponent(source.title)}`
          },
          {
            site: 'Read That Podcast',
            query: videoId,
            url: `https://readthat.fm/youtube/${videoId}`
          },
          {
            site: 'Google (site-specific)',
            query: `site:podcastnotes.org OR site:medium.com OR site:readthat.fm "${source.title}"`,
            url: `https://www.google.com/search?q=${encodeURIComponent(`site:podcastnotes.org OR site:medium.com OR site:readthat.fm "${source.title}"`)}`
          }
        ]
      });

      console.log(`\n${source.id}: ${source.title}`);
      console.log(`   Video: ${source.url}`);
      console.log('\n   🔍 Try these searches:');

      instructions[instructions.length - 1].searches.forEach((search, idx) => {
        console.log(`   ${idx + 1}. ${search.site}`);
        console.log(`      ${search.url}\n`);
      });
    }

    return instructions;
  }

  async saveInstructions(sources, outputPath) {
    const instructions = await this.generateSearchInstructions(sources);

    const markdown = this._formatAsMarkdown(instructions);
    await fs.writeFile(outputPath, markdown, 'utf-8');

    console.log(`\n💾 Search instructions saved to: ${outputPath}`);

    return instructions;
  }

  _formatAsMarkdown(instructions) {
    let md = '# Transcript Search Guide\n\n';
    md += '**Generated:** ' + new Date().toISOString() + '\n\n';
    md += 'Use these search queries to find existing transcripts for Sam Altman sources.\n\n';
    md += '---\n\n';

    for (const inst of instructions) {
      md += `## ${inst.source_id}: ${inst.title}\n\n`;

      inst.searches.forEach((search, idx) => {
        md += `### ${idx + 1}. ${search.site}\n\n`;
        md += `**Search:** \`${search.query}\`\n\n`;
        md += `**URL:** [Click here](${search.url})\n\n`;
      });

      md += '**If found:**\n';
      md += '1. Copy the full transcript text\n';
      md += `2. Paste into: \`docs/minds/sam_altman/sources/manual/${inst.source_id}.txt\`\n`;
      md += `3. Run: \`node import-manual.js --source ${inst.source_id} --mind sam_altman\`\n\n`;
      md += '---\n\n';
    }

    return md;
  }
}

// CLI
async function main() {
  const sourcesPath = '../../docs/minds/sam_altman/sources/tier1_batch.yaml';
  const outputPath = '../../docs/minds/sam_altman/sources/TRANSCRIPT_SEARCH_GUIDE.md';

  const finder = new TranscriptFinder();

  // Load failed sources
  const content = await fs.readFile(sourcesPath, 'utf-8');
  const data = yaml.load(content);
  const sources = data.sources || [];

  // Generate search instructions (since automated search requires API keys)
  await finder.saveInstructions(sources, outputPath);

  console.log('\n✅ Next steps:');
  console.log('   1. Open the search guide:');
  console.log(`      open ${outputPath}`);
  console.log('   2. Click through the search links');
  console.log('   3. When you find a transcript, copy/paste into the template files');
  console.log('   4. Run: node import-manual.js --batch --mind sam_altman\n');
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
