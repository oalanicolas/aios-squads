/**
 * YouTube Collector
 * Downloads audio and generates transcripts with speaker diarization
 */

import fs from 'fs/promises';
import { _createWriteStream } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import ytdl from 'ytdl-core';
import sanitizeFilename from 'sanitize-filename';
import { AssemblyAIMCP } from '../mcps/assemblyai-mcp.js';
import { getMCPClient } from '../mcps/mcp-client.js';

const execPromise = promisify(exec);
import {
  identifyTargetSpeaker,
  filterByTargetSpeaker,
  calculateSpeakerStats,
  formatTranscriptMarkdown,
  createTranscriptDocument,
  validateTranscriptQuality
} from '../utils/speaker-filter.js';

export class YouTubeCollector extends EventEmitter {
  constructor(downloadRules, mcpClient = null) {
    super();
    this.downloadRules = downloadRules;
    this.mcpClient = mcpClient;
    this.assemblyAI = null;
  }

  async collect(source, outputDir) {
    this.emit('start', { source });

    let audioPath = null;

    try {
      const videoId = this._extractVideoId(source.url);
      if (!videoId) {
        throw new Error(`Invalid YouTube URL: ${source.url}`);
      }

      const sourceSlug = sanitizeFilename(source.id || videoId);
      const baseDir = this._resolveBaseDir(outputDir);
      const sourceDir = path.join(baseDir, sourceSlug);
      await fs.mkdir(sourceDir, { recursive: true });

      this.emit('status', { source, phase: 'metadata', message: 'Fetching video metadata' });
      const _metadata = await this._fetchMetadata(_videoId, source);

      this.emit('status', { source, phase: 'download', message: 'Downloading audio stream' });
      audioPath = await this._downloadAudio({ url: source.url, videoId, sourceDir, metadata });

      this.emit('status', { source, phase: 'transcription', message: 'Submitting to AssemblyAI' });
      const transcript = await this._transcribe({ audioPath, metadata, source, videoId });

      this.emit('status', { source, phase: 'processing', message: 'Filtering speakers and generating markdown' });
      const processed = await this._processTranscript({ transcript, metadata, sourceDir, source, videoId });

      this.emit('status', { source, phase: 'quality', message: 'Running quality checks' });
      const quality = validateTranscriptQuality(transcript);

      if (!quality.acceptable) {
        this.emit('warning', { source, message: 'Transcript quality below threshold', quality });
      }

      await this._saveArtifacts({ source, sourceDir, metadata, transcript, processed, quality, audioPath });

      const result = {
        source_id: source.id || videoId,
        video_id: videoId,
        metadata,
        transcript,
        filtered_transcript: processed.filtered,
        markdown_path: processed.markdownPath,
        filtered_markdown_path: processed.filteredTranscriptPath,
        full_transcript_path: processed.fullTranscriptPath,
        quality
      };

      this.emit('completed', { source, result });
      return result;
    } catch (error) {
      this.emit('error', { source, error });
      throw error;
    } finally {
      if (audioPath && this.downloadRules.youtube?.audio?.delete_after_transcription !== false) {
        await this._safeDelete(_audioPath);
      }
    }
  }

  _resolveBaseDir(outputDir) {
    const youtubeRules = this.downloadRules.youtube?.audio?.save_path;
    if (youtubeRules) {
      const basePath = youtubeRules.replace('{source_id}', '');
      return path.isAbsolute(basePath)
        ? basePath
        : path.join(outputDir, basePath);
    }

    return path.join(outputDir, 'youtube');
  }

  async _fetchMetadata(_videoId, source) {
    try {
      const info = await ytdl.getInfo(_videoId);
      const details = info.videoDetails;

      const durationSeconds = parseInt(details.lengthSeconds, 10) || 0;
      const estimatedCost = this._estimateTranscriptionCost(durationSeconds);

      return {
        id: videoId,
        title: details.title,
        description: details.description,
        author: details.author?.name,
        author_channel: details.author?.user,
        author_url: details.author?.channel_url,
        publish_date: details.publishDate,
        upload_date: details.uploadDate,
        view_count: parseInt(details.viewCount, 10) || 0,
        category: details.category,
        keywords: details.keywords || [],
        length_seconds: durationSeconds,
        length_pretty: this._formatDuration(durationSeconds),
        estimated_transcription_cost: estimatedCost,
        chapters: info.player_response?.storyboards?.playerStoryboardSpecRenderer?.suggestedQuality || [],
        thumbnails: details.thumbnails || [],
        source_title: source.title,
        url: source.url,
        language: source.language || details.language || 'en'
      };
    } catch (error) {
      this.emit('warning', { source, phase: 'metadata', message: 'Failed to fetch metadata via ytdl', error });

      if (this.mcpClient) {
        try {
          const direct = await this.mcpClient.call('youtube-transcript', 'metadata', { videoId });
          return { ...direct, id: videoId, url: source.url };
        } catch (fallbackError) {
          this.emit('warning', { source, phase: 'metadata', message: 'Fallback metadata fetch failed', error: fallbackError });
        }
      }

      return {
        id: videoId,
        title: source.title || `YouTube Video ${videoId}`,
        url: source.url,
        language: source.language || 'en'
      };
    }
  }

  async _downloadAudio({ url, videoId, sourceDir, metadata }) {
    const audioRules = this.downloadRules.youtube?.audio || {};
    const format = audioRules.format || 'mp3';

    const audioFilename = `audio.${format}`;
    const finalPath = path.join(sourceDir, audioFilename);

    // Use yt-dlp CLI (more robust than ytdl-core)
    const ytdlpCmd = [
      'yt-dlp',
      '--extract-audio',
      `--audio-format ${format}`,
      '--audio-quality 0',  // Best quality
      '-o', `"${finalPath}"`,
      '--no-playlist',
      '--quiet',
      '--progress',
      `"${url}"`
    ].join(' ');

    this.emit('download_progress', {
      videoId,
      downloaded: 0,
      total: 0,
      progress: 0,
      audio: true,
      message: 'Starting yt-dlp download...'
    });

    try {
      const { _stdout, _stderr } = await execPromise(ytdlpCmd, {
        maxBuffer: 50 * 1024 * 1024  // 50MB buffer for progress output
      });

      // Check if file exists
      try {
        await fs.access(finalPath);
      } catch (_accessError) {
        throw new Error(`Download completed but file not found at ${finalPath}`);
      }

      this.emit('download_complete', { videoId, audioPath: finalPath });
      return finalPath;

    } catch (error) {
      await this._safeDelete(finalPath);
      throw new Error(`Failed to download audio via yt-dlp: ${error.message}`);
    }
  }

  async _transcribe({ audioPath, metadata, source, videoId }) {
    if (!this.assemblyAI) {
      this.assemblyAI = new AssemblyAIMCP(process.env.ASSEMBLYAI_API_KEY);
    }

    // Upload using AssemblyAI client (handles streaming/uploads)
    const transcriptOptions = {
      speakers_expected: source.diarization?.expected_speakers || 2,
      language_code: this._mapLanguage(metadata.language || 'en'),
      entity_detection: true,
      auto_chapters: true,
      onProgress: (status) => {
        this.emit('transcription_progress', {
          videoId,
          status: status.status,
          progress: status.processing_progress,
          message: status.message
        });
      }
    };

    try {
      const transcript = await this.assemblyAI.transcribe(_audioPath, transcriptOptions);
      this.emit('transcription_complete', { videoId, transcript });
      return transcript;
    } catch (error) {
      this.emit('warning', { source, phase: 'transcription', message: 'AssemblyAI transcription failed, attempting fallback', error });

      try {
        return await this._fallbackTranscript({ videoId, audioPath, source, metadata });
      } catch (fallbackError) {
        this.emit('error', { source, phase: 'transcription', message: 'All transcription methods failed', error: fallbackError });
        throw fallbackError;
      }
    }
  }

  async _fallbackTranscript({ videoId, audioPath, source, metadata }) {
    if (!this.mcpClient) {
      this.mcpClient = await getMCPClient();
    }

    // Try YouTube transcript MCP first
    try {
      const transcript = await this.mcpClient.call('youtube-transcript', 'transcribe', { videoId });
      if (transcript?.length) {
        return this._formatYouTubeTranscript(transcript, metadata);
      }
    } catch (error) {
      this.emit('warning', { source, phase: 'transcription', message: 'YouTube transcript API unavailable', error });
    }

    // Last resort: use AssemblyAI again, but ensure file is accessible (upload to remote storage)
    throw new Error('No transcription method succeeded');
  }

  async _processTranscript({ transcript, metadata, sourceDir, source, videoId }) {
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
      source_type: 'youtube',
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
      quality,
      filtered: processed.filtered,
      audioPath: this.downloadRules.youtube?.audio?.delete_after_transcription === false ? audioPath : null,
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

  _estimateTranscriptionCost(durationSeconds) {
    const hours = durationSeconds / 3600;
    const costPerHour = 0.65; // AssemblyAI standard pricing
    return `$${(hours * costPerHour).toFixed(2)}`;
  }

  _formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    if (secs > 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
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

  _formatYouTubeTranscript(transcript, metadata) {
    const utterances = transcript.map((entry, index) => ({
      id: index,
      start: entry.offset * 1000,
      end: (entry.offset + entry.duration) * 1000,
      text: entry.text,
      speaker: entry.speaker || 'Speaker A'
    }));

    const totalDuration = metadata?.length_seconds ?? transcript.reduce((sum, entry) => sum + (entry.duration || 0), 0);

    return {
      text: transcript.map(entry => entry.text).join(' '),
      utterances,
      words: transcript,
      audio_duration: totalDuration,
      confidence: 0.95
    };
  }

  _extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  }
}

export default YouTubeCollector;
