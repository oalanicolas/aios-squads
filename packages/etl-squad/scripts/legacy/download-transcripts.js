#!/usr/bin/env node
/**
 * Web Transcript Downloader
 * Downloads 100% of original content from transcript sites using proper ETL
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

class TranscriptDownloader {
  constructor() {
    this.turndown = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced'
    });
  }

  async downloadFromYTScribe(url, sourceId) {
    console.log(`\n📥 Downloading from YTScribe: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);

      // YTScribe stores transcript in specific divs
      const transcriptText = $('.transcript-text, .transcript-content, [class*="transcript"]')
        .map((i, el) => $(el).text().trim())
        .get()
        .join('\n\n');

      if (!transcriptText || transcriptText.length < 100) {
        throw new Error('Transcript not found or too short');
      }

      console.log(`✅ Downloaded: ${transcriptText.length} characters`);

      return {
        text: transcriptText,
        source: 'ytscribe',
        url
      };
    } catch (error) {
      throw new Error(`YTScribe download failed: ${error.message}`);
    }
  }

  async downloadFromHappyScribe(url, sourceId) {
    console.log(`\n📥 Downloading from HappyScribe: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const dom = new JSDOM(response.data, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article || !article.textContent) {
        throw new Error('Failed to extract transcript');
      }

      // Convert HTML to clean markdown
      const markdown = this.turndown.turndown(article.content);

      console.log(`✅ Downloaded: ${markdown.length} characters`);

      return {
        text: markdown,
        source: 'happyscribe',
        url
      };
    } catch (error) {
      throw new Error(`HappyScribe download failed: ${error.message}`);
    }
  }

  async downloadFromPodScripts(url, sourceId) {
    console.log(`\n📥 Downloading from PodScripts: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const dom = new JSDOM(response.data, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article) {
        throw new Error('Failed to extract transcript');
      }

      const markdown = this.turndown.turndown(article.content);

      console.log(`✅ Downloaded: ${markdown.length} characters`);

      return {
        text: markdown,
        source: 'podscripts',
        url
      };
    } catch (error) {
      throw new Error(`PodScripts download failed: ${error.message}`);
    }
  }

  async downloadGovernmentPDF(url, sourceId) {
    console.log(`\n📥 Downloading government PDF: ${url}`);
    console.log(`⚠️  PDF download requires manual processing`);
    console.log(`   1. Download: curl -L -o /tmp/${_sourceId}.pdf "${url}"`);
    console.log(`   2. Convert: pdftotext /tmp/${_sourceId}.pdf /tmp/${_sourceId}.txt`);
    console.log(`   3. Or manually copy text from PDF viewer`);

    return {
      text: null,
      source: 'government_pdf',
      url,
      requiresManual: true,
      instructions: [
        `curl -L -o /tmp/${_sourceId}.pdf "${url}"`,
        `pdftotext /tmp/${_sourceId}.pdf docs/minds/sam_altman/sources/manual/${_sourceId}.txt`,
        `# Or open PDF and copy text manually`
      ]
    };
  }

  async download(config) {
    const { _sourceId, urls, sourceData } = config;

    // Try each URL in priority order
    for (const urlConfig of urls) {
      try {
        let result;

        switch (urlConfig.type) {
          case 'ytscribe':
            result = await this.downloadFromYTScribe(urlConfig.url, sourceId);
            break;
          case 'happyscribe':
            result = await this.downloadFromHappyScribe(urlConfig.url, sourceId);
            break;
          case 'podscripts':
            result = await this.downloadFromPodScripts(urlConfig.url, sourceId);
            break;
          case 'government_pdf':
            result = await this.downloadGovernmentPDF(urlConfig.url, sourceId);
            break;
          default:
            continue;
        }

        if (result.requiresManual) {
          return result;
        }

        if (result.text && result.text.length > 100) {
          // Save immediately
          await this.saveTranscript(_sourceId, result, sourceData);
          return result;
        }
      } catch (error) {
        console.error(`   ❌ ${urlConfig.type} failed: ${error.message}`);
        continue; // Try next URL
      }
    }

    throw new Error(`All download methods failed for ${_sourceId}`);
  }

  async saveTranscript(_sourceId, result, sourceData) {
    const outputDir = path.join(
      process.cwd(),
      '../../docs/minds/sam_altman/sources/downloads/youtube',
      sourceId
    );

    await fs.mkdir(outputDir, { recursive: true });

    // Format as markdown with metadata
    let markdown = `# ${sourceData.title}\n\n`;
    markdown += `**Source ID:** ${_sourceId}\n`;
    markdown += `**Original URL:** ${sourceData.url}\n`;
    markdown += `**Transcript Source:** ${result.source}\n`;
    markdown += `**Transcript URL:** ${result.url}\n`;
    markdown += `**Downloaded:** ${new Date().toISOString()}\n`;
    markdown += `**Layers:** ${sourceData.layers.join(', ')}\n\n`;

    if (sourceData.layer_8_evidence) {
      markdown += `**Layer 8 Evidence:** ${sourceData.layer_8_evidence}\n\n`;
    }

    markdown += `---\n\n## Transcript\n\n`;
    markdown += result.text;

    const transcriptPath = path.join(outputDir, 'transcript.md');
    await fs.writeFile(transcriptPath, markdown, 'utf-8');

    const metadataPath = path.join(outputDir, 'metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify({
      source_id: sourceId,
      title: sourceData.title,
      original_url: sourceData.url,
      transcript_source: result.source,
      transcript_url: result.url,
      download_timestamp: new Date().toISOString(),
      word_count: result.text.split(/\s+/).length,
      char_count: result.text.length
    }, null, 2), 'utf-8');

    console.log(`💾 Saved: ${transcriptPath}`);
  }
}

// Main execution
async function main() {
  const downloader = new TranscriptDownloader();

  // Config for verified sources
  const sources = [
    {
      sourceId: 's002',
      sourceData: {
        title: 'Lex Fridman #419 - Sam Altman: OpenAI CEO on GPT-4, ChatGPT',
        url: 'https://www.youtube.com/watch?v=L_Guz73e6fw',
        layers: [4, 5, 6, 7, 8],
        layer_8_evidence: 'Discusses AGI existential risk + rapid deployment strategy simultaneously'
      },
      urls: [
        { type: 'ytscribe', url: 'https://ytscribe.com/v/jvqFAi7vkBc' },
        { type: 'happyscribe', url: 'https://podcasts.happyscribe.com/lex-fridman-podcast-artificial-intelligence-ai/419-sam-altman-openai-gpt-5-sora-board-saga-elon-musk-ilya-power-agi' },
        { type: 'podscripts', url: 'https://podscripts.co/podcasts/lex-fridman-podcast/419-sam-altman-openai-gpt-5-sora-board-saga-elon-musk-ilya-power-agi' }
      ]
    },
    {
      sourceId: 's001',
      sourceData: {
        title: 'Congressional Testimony on AI Regulation',
        url: 'https://www.youtube.com/watch?v=rCyp-lW8Rz8',
        layers: [5, 6, 7, 8],
        layer_8_evidence: 'AI safety advocacy while leading rapid OpenAI deployment'
      },
      urls: [
        { type: 'government_pdf', url: 'https://www.judiciary.senate.gov/download/2023-05-16-testimony-altman' }
      ]
    }
  ];

  const results = { successful: [], failed: [], manual: [] };

  for (const config of sources) {
    try {
      const result = await downloader.download(config);

      if (result.requiresManual) {
        results.manual.push({ ...config, instructions: result.instructions });
        console.log(`⚠️  ${config.sourceId} requires manual download`);
      } else {
        results.successful.push(config.sourceId);
        console.log(`✅ ${config.sourceId} downloaded successfully`);
      }
    } catch (error) {
      results.failed.push({ sourceId: config.sourceId, error: error.message });
      console.error(`❌ ${config.sourceId} failed: ${error.message}`);
    }
  }

  console.log(`\n📊 Download Summary:`);
  console.log(`   Successful: ${results.successful.length}`);
  console.log(`   Manual required: ${results.manual.length}`);
  console.log(`   Failed: ${results.failed.length}`);

  if (results.manual.length > 0) {
    console.log(`\n📋 Manual steps required:`);
    results.manual.forEach(m => {
      console.log(`\n${m.sourceId}:`);
      m.instructions.forEach(cmd => console.log(`   ${cmd}`));
    });
  }

  // Save report
  const logsDir = '../../docs/minds/sam_altman/docs/logs';
  await fs.mkdir(logsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const reportPath = path.join(logsDir, `${timestamp}-web-download-report.yaml`);
  await fs.writeFile(reportPath, yaml.dump(results, { indent: 2 }), 'utf-8');

  console.log(`\n💾 Report: ${reportPath}`);
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
