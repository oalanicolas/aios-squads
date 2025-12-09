/**
 * Podcast Collector
 * Downloads podcast episodes and transcribes with speaker diarization
 */

import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import Parser from 'rss-parser';
import axios from 'axios';
import sanitizeFilename from 'sanitize-filename';
import { AssemblyAIMCP } from '../mcps/assemblyai-mcp.js';
import { getMCPClient } from '../mcps/mcp-client.js';
import {
  identifyTargetSpeaker,
  filterByTargetSpeaker,
  calculateSpeakerStats,
  formatTranscriptMarkdown,
  createTranscriptDocument,
  validateTranscriptQuality
} from '../utils/speaker-filter.js';

export class PodcastCollector extends EventEmitter {
  constructor(downloadRules, mcpClient = null) {
    super();
    this.downloadRules = downloadRules;
    this.mcpClient = mcpClient;
    this.parser = new Parser();
    this.assemblyAI = null;
  }

  async collect(source, outputDir) {
    this.emit('start', { source });

    let audioPath = null;

    try {
      const sourceSlug = sanitizeFilename(source.id || source.guid || this._slugify(source.title));
      const baseDir = this._resolveBaseDir(outputDir);
      const sourceDir = path.join(baseDir, sourceSlug);
      await fs.mkdir(sourceDir, { recursive: true });

      this.emit('status', { source, phase: 'metadata', message: 'Fetching RSS metadata' });
      const _metadata = await this._collectMetadata(source);

      this.emit('status', { source, phase: 'download', message: 'Downloading audio file' });
      audioPath = await this._downloadAudio({ source, sourceDir, metadata });

      this.emit('status', { source, phase: 'transcription', message: 'Submitting to AssemblyAI' });
      const transcript = await this._transcribe({ audioPath, metadata, source });

      this.emit('status', { source, phase: 'processing', message: 'Filtering speakers and generating markdown' });
      const processed = await this._processTranscript({ transcript, metadata, sourceDir, source });

      this.emit('status', { source, phase: 'quality', message: 'Validating transcript quality' });
      const quality = validateTranscriptQuality(transcript);

      if (!quality.acceptable) {
        this.emit('warning', { source, message: 'Transcript quality below threshold', quality });
      }

      await this._saveArtifacts({ source, sourceDir, metadata, transcript, processed, quality, audioPath });

      const result = {
        source_id: source.id || sourceSlug,
        metadata,
        transcript,
        filtered_transcript: processed.filtered,
        markdown_path: processed.markdownPath,
        full_transcript_path: processed.fullTranscriptPath,
        filtered_markdown_path: processed.filteredTranscriptPath,
        quality
      };

      this.emit('completed', { source, result });
      return result;
    } catch (error) {
      this.emit('error', { source, error });
      throw error;
    } finally {
      if (audioPath && this._shouldDeleteAudio()) {
        await this._safeDelete(_audioPath);
      }
    }
  }

  _resolveBaseDir(outputDir) {
    const savePath = this.downloadRules.podcasts?.audio?.save_path;
    if (savePath) {
      const base = savePath.replace('{source_id}', '');
      return path.isAbsolute(base) ? base : path.join(outputDir, base);
    }

    return path.join(outputDir, 'podcasts');
  }

  _shouldDeleteAudio() {
    const rules = this.downloadRules.podcasts?.audio;
    if (rules && typeof rules.delete_after_transcription === 'boolean') {
      return rules.delete_after_transcription;
    }

    return this.downloadRules.podcasts?.delete_audio_after !== false;
  }

  async _collectMetadata(source) {
    const _metadata = {
      id: source.id,
      url: source.url,
      title: source.title,
      description: source.description,
      published_at: source.published_at || source.pubDate,
      author: source.author,
      podcast_title: source.podcast_title,
      episode: source.episode,
      duration: source.duration_seconds,
      language: source.language || 'en',
      rss_url: source.rss_url
    };

    if (!source.feed_url && source.rss_url) {
      metadata.feed_url = source.rss_url;
    }

    // If we have an RSS feed, fetch additional metadata
    if (source.feed_url) {
      try {
        const feed = await this.parser.parseURL(source.feed_url);
        metadata.podcast_title = feed.title;
        metadata.podcast_description = feed.description;
        metadata.language = feed.language || metadata.language;
        metadata.publisher = feed.itunes?.author;
        metadata.image = feed.itunes?.image;

        if (!metadata.episode) {
          const episode = feed.items.find(item => item.link === source.url || item.guid === source.guid);
          if (episode) {
            metadata.episode = {
              title: episode.title,
              description: episode.contentSnippet || episode.content,
              duration: episode.itunes?.duration,
              episode_number: episode.itunes?.episode,
              season: episode.itunes?.season,
              explicit: episode.itunes?.explicit
            };

            if (!metadata.duration && metadata.episode.duration) {
              metadata.duration = this._parseDuration(metadata.episode.duration);
            }
          }
        }
      } catch (error) {
        this.emit('warning', { source, phase: 'metadata', message: 'RSS metadata fetch failed', error });
      }
    }

    return metadata;
  }

  async _downloadAudio({ source, sourceDir, metadata }) {
    const audioRules = this.downloadRules.podcasts?.audio || {};
    const format = audioRules.format || 'mp3';
    const filename = `audio.${format}`;
    const tempFilename = `${filename}.tmp`;
    const tempPath = path.join(sourceDir, tempFilename);
    const finalPath = path.join(sourceDir, filename);

    const response = await axios.get(source.url, {
      responseType: 'stream',
      timeout: (audioRules.timeout_seconds || 600) * 1000,
      headers: {
        'User-Agent': this.downloadRules.global?.user_agent || 'AIOS-ETL-PodcastCollector/1.0'
      }
    });

    const totalBytes = parseInt(response.headers['content-length'], 10) || null;
    let downloadedBytes = 0;

    const streamPromise = new Promise((resolve, reject) => {
      const writer = createWriteStream(tempPath);

      response.data
        .on('data', (chunk) => {
          downloadedBytes += chunk.length;
          if (totalBytes) {
            this.emit('download_progress', {
              source,
              downloaded: downloadedBytes,
              total: totalBytes,
              progress: downloadedBytes / totalBytes
            });
          }
        })
        .on('error', reject)
        .pipe(writer)
        .on('error', reject)
        .on('finish', resolve);
    });

    try {
      await streamPromise;
    } catch (error) {
      await this._safeDelete(tempPath);
      throw new Error(`Failed to download podcast audio: ${error.message}`);
    }

    await fs.rename(tempPath, finalPath);
    this.emit('download_complete', { source, audioPath: finalPath, totalBytes: downloadedBytes });

    return finalPath;
  }

  async _transcribe({ audioPath, metadata, source }) {
    if (!this.assemblyAI) {
      this.assemblyAI = new AssemblyAIMCP(process.env.ASSEMBLYAI_API_KEY);
    }

    const transcriptOptions = {
      speakers_expected: source.diarization?.expected_speakers || 2,
      language_code: this._mapLanguage(metadata.language || 'en'),
      entity_detection: true,
      sentiment_analysis: false,
      onProgress: (status) => {
        this.emit('transcription_progress', {
          source,
          status: status.status,
          progress: status.processing_progress,
          message: status.message
        });
      }
    };

    try {
      const transcript = await this.assemblyAI.transcribe(_audioPath, transcriptOptions);
      this.emit('transcription_complete', { source, transcript });
      return transcript;
    } catch (error) {
      this.emit('warning', { source, phase: 'transcription', message: 'AssemblyAI transcription failed, attempting fallback', error });

      try {
        return await this._fallbackTranscript({ source, metadata, audioPath });
      } catch (fallbackError) {
        this.emit('error', { source, phase: 'transcription', message: 'All transcription methods failed', error: fallbackError });
        throw fallbackError;
      }
    }
  }

  async _fallbackTranscript({ source, metadata, audioPath }) {
    if (!this.mcpClient) {
      this.mcpClient = await getMCPClient();
    }

    // Try podcast transcript MCP if available
    if (this.mcpClient.isMCPAvailable('podcast-transcript')) {
      try {
        const transcript = await this.mcpClient.call('podcast-transcript', 'transcribe', {
          source,
          metadata
        });

        if (transcript?.utterances?.length) {
          return transcript;
        }
      } catch (error) {
        this.emit('warning', { source, phase: 'transcription', message: 'Podcast MCP unavailable', error });
      }
    }

    throw new Error('No transcription fallback available for podcasts');
  }

  async _processTranscript({ transcript, metadata, sourceDir, source }) {
    const utterances = transcript.utterances || [];
    const targetSpeaker = identifyTargetSpeaker(utterances, {
      expectedSpeakers: source.diarization?.expected_speakers || 2
    });

    const stats = calculateSpeakerStats(utterances);
    const filteredUtterances = filterByTargetSpeaker(utterances, targetSpeaker);

    const filteredMarkdown = formatTranscriptMarkdown(filteredUtterances, {
      showSpeakers: true,
      showTimestamps: true,
      highlightTarget: targetSpeaker
    });

    const fullMarkdown = formatTranscriptMarkdown(utterances, {
      showSpeakers: true,
      showTimestamps: true,
      highlightTarget: targetSpeaker
    });

    const markdownDocument = createTranscriptDocument(transcript, {
      ...metadata,
      source_type: 'podcast',
      target_speaker: targetSpeaker,
      stats
    });

    const markdownPath = path.join(sourceDir, 'transcript.md');
    const fullTranscriptPath = path.join(sourceDir, 'transcript.full.md');
    const filteredTranscriptPath = path.join(sourceDir, 'transcript.filtered.md');

    await fs.writeFile(markdownPath, markdownDocument, 'utf-8');
    await fs.writeFile(fullTranscriptPath, fullMarkdown, 'utf-8');
    await fs.writeFile(filteredTranscriptPath, filteredMarkdown, 'utf-8');

    return {
      targetSpeaker,
      stats,
      markdownPath,
      fullTranscriptPath,
      filteredTranscriptPath,
      filtered: {
        targetSpeaker,
        stats,
        utterances: filteredUtterances,
        markdown: filteredMarkdown
      }
    };
  }

  async _saveArtifacts({ source, sourceDir, metadata, transcript, processed, quality, audioPath }) {
    const transcriptPath = path.join(sourceDir, 'transcript.json');

    const artifact = {
      source,
      metadata,
      transcript,
      filtered: processed.filtered,
      quality,
      audioPath: this._shouldDeleteAudio() ? null : audioPath,
      generated_at: new Date().toISOString()
    };

    // Save full transcript artifact (metadata already in transcript.md YAML front matter)
    await fs.writeFile(transcriptPath, JSON.stringify(artifact, null, 2), 'utf-8');
  }

  async _safeDelete(filePath) {
    if (!filePath) return;

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('warning', { phase: 'cleanup', message: `Failed to delete temporary file ${filePath}`, error });
      }
    }
  }

  _mapLanguage(language) {
    const map = {
      pt: 'pt',
      'pt-br': 'pt',
      en: 'en',
      es: 'es',
      fr: 'fr',
      de: 'de'
    };

    const normalized = language.toLowerCase();
    return map[normalized] || 'en';
  }

  _slugify(text = '') {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'podcast-episode';
  }

  _parseDuration(duration) {
    if (!duration) return null;

    if (typeof duration === 'number') {
      return duration;
    }

    if (typeof duration === 'string') {
      const parts = duration.split(':').map(Number).reverse();
      let seconds = 0;

      if (parts[0]) seconds += parts[0];
      if (parts[1]) seconds += parts[1] * 60;
      if (parts[2]) seconds += parts[2] * 3600;

      return seconds;
    }

    return null;
  }
}

export default PodcastCollector;
