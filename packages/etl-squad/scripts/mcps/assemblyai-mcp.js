/**
 * AssemblyAI MCP Wrapper
 * Complete integration with AssemblyAI API for transcription with speaker diarization
 * Includes audio upload, progress tracking, and cost management
 */

import axios from 'axios';
import fs from 'fs/promises';
import { createReadStream, statSync } from 'fs';
import { EventEmitter } from 'events';

const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB (AssemblyAI recommendation)
const DEFAULT_POLL_INTERVAL = 2000;
const MAX_POLL_INTERVAL = 10000;

export class AssemblyAIMCP extends EventEmitter {
  constructor(apiKey, config = {}) {
    super();

    this.apiKey = apiKey || process.env.ASSEMBLYAI_API_KEY;

    if (!this.apiKey) {
      throw new Error('AssemblyAI API key required. Set ASSEMBLYAI_API_KEY environment variable.');
    }

    this.baseURL = 'https://api.assemblyai.com/v2';
    this.uploadURL = 'https://api.assemblyai.com/v2/upload';

    this.config = {
      language_code: 'en',
      speaker_labels: true,
      speakers_expected: 2,
      punctuate: true,
      format_text: true,
      ...config
    };

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        authorization: this.apiKey,
        'content-type': 'application/json'
      }
    });

    this.totalCost = 0;
    this.transcriptionCount = 0;
    this.jobs = new Map(); // transcript_id -> metadata
  }

  async uploadAudio(filePath, options = {}) {
    this.emit('upload_start', { file: filePath });

    try {
      const stats = statSync(filePath);
      const fileSizeBytes = stats.size;
      const fileSizeMB = (fileSizeBytes / 1024 / 1024).toFixed(2);
      const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;

      this.emit('upload_info', {
        file: filePath,
        size_mb: fileSizeMB,
        chunk_size_mb: (chunkSize / 1024 / 1024).toFixed(2)
      });

      const stream = createReadStream(filePath, { highWaterMark: chunkSize });
      let uploadedBytes = 0;
      let part = 0;

      for await (const chunk of stream) {
        part += 1;

        await axios.post(this.uploadURL, chunk, {
          headers: {
            authorization: this.apiKey,
            'content-type': 'application/octet-stream'
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });

        uploadedBytes += chunk.length;
        const progress = uploadedBytes / fileSizeBytes;

        this.emit('upload_progress', {
          file: filePath,
          part,
          uploaded_bytes: uploadedBytes,
          total_bytes: fileSizeBytes,
          progress
        });
      }

      // Retrieve final upload URL
      const uploadURL = `${this.uploadURL}/${part}`.replace(/\/\d+$/, ''); // AssemblyAI returns same endpoint

      this.emit('upload_complete', {
        file: filePath,
        url: uploadURL
      });

      return uploadURL;
    } catch (error) {
      this.emit('upload_error', {
        file: filePath,
        error: error.message
      });
      throw new Error(`Audio upload failed: ${error.message}`);
    }
  }

  async transcribe(audioPathOrURL, options = {}) {
    let audioURL = audioPathOrURL;

    if (!audioPathOrURL.startsWith('http')) {
      audioURL = await this.uploadAudio(audioPathOrURL, options.upload || {});
    }

    if (options.duration_seconds) {
      const estimatedCost = this.estimateCost(options.duration_seconds);
      this.emit('cost_estimate', {
                duration_seconds: options.duration_seconds,
                estimated_cost: estimatedCost
      });

      if (parseFloat(estimatedCost) > (options.cost_warning_threshold || 10)) {
        this.emit('cost_warning', {
          cost: estimatedCost,
          message: 'Transcription cost exceeds threshold'
        });
      }
    }

    const transcriptConfig = {
      audio_url: audioURL,
      language_code: options.language_code || this.config.language_code,
      speaker_labels: options.speaker_labels !== false,
      speakers_expected: options.speakers_expected || this.config.speakers_expected,
      punctuate: this.config.punctuate,
      format_text: this.config.format_text,
      auto_chapters: options.auto_chapters || false,
      entity_detection: options.entity_detection || false,
      sentiment_analysis: options.sentiment_analysis || false,
      auto_highlights: options.auto_highlights || false,
      filter_profanity: options.filter_profanity || false,
      language_detection: options.language_detection || false
    };

    this.emit('transcription_start', {
      audio_url: audioURL,
      config: transcriptConfig
    });

    const response = await this.client.post('/transcript', transcriptConfig);
    const transcriptId = response.data.id;

    const job = {
      id: transcriptId,
      status: 'submitted',
      created_at: Date.now(),
      audio_url: audioURL,
      options,
      polling: {
        interval: options.poll_interval || DEFAULT_POLL_INTERVAL,
        max_attempts: options.max_attempts || 300
      }
    };

    this.jobs.set(transcriptId, job);

    this.emit('transcription_submitted', {
      transcript_id: transcriptId,
      polling: job.polling
    });

    const transcript = await this._pollTranscript(transcriptId, options);

    if (transcript.audio_duration) {
      const actualCost = this.estimateCost(transcript.audio_duration);
      this.totalCost += parseFloat(actualCost);
      this.transcriptionCount += 1;

      this.emit('transcription_complete', {
        transcript_id: transcriptId,
        duration: transcript.audio_duration,
        cost: actualCost,
        total_cost: this.totalCost.toFixed(2)
      });
    }

    this.jobs.delete(transcriptId);

    return transcript;
  }

  async _pollTranscript(transcriptId, options = {}) {
    const job = this.jobs.get(transcriptId);
    if (!job) {
      throw new Error(`Unknown job ${transcriptId}`);
    }

    const maxAttempts = job.polling.max_attempts;
    let attempts = 0;
    let interval = job.polling.interval;
    let lastStatus = null;

    while (attempts < maxAttempts) {
      if (job.cancelled) {
        this.emit('transcription_cancelled', { transcript_id: transcriptId });
        throw new Error(`Transcription ${transcriptId} cancelled`);
      }

      try {
        const response = await this.client.get(`/transcript/${transcriptId}`);
        const data = response.data;
        const status = data.status;

        if (status !== lastStatus || status === 'processing') {
          this.emit('transcription_status', {
            transcript_id: transcriptId,
            status,
            attempt: attempts,
            processing_progress: data.processing_progress || null
          });

          if (typeof options.onProgress === 'function') {
            options.onProgress({
              status,
              attempt: attempts,
              progress: data.processing_progress || null
            });
          }

          lastStatus = status;
        }

        if (status === 'completed') {
          return data;
        }

        if (status === 'error') {
          const errorMessage = data.error || 'Unknown transcription error';
          this.emit('transcription_error', {
            transcript_id: transcriptId,
            error: errorMessage
          });
          throw new Error(`Transcription failed: ${errorMessage}`);
        }
      } catch (error) {
        if (error.response?.status === 429) {
          interval = Math.min(interval * 1.5, MAX_POLL_INTERVAL);
          this.emit('rate_limited', {
            transcript_id: transcriptId,
            retry_in_ms: interval,
            attempt: attempts,
            error: error.message
          });
        } else {
          this.emit('transcription_poll_error', {
            transcript_id: transcriptId,
            attempt: attempts,
            error: error.message
          });
        }
      }

      attempts += 1;
      await new Promise(resolve => setTimeout(resolve, interval));
      interval = Math.min(interval * 1.05, MAX_POLL_INTERVAL);
    }

    this.emit('transcription_timeout', {
      transcript_id: transcriptId,
      attempts
    });

    throw new Error(`Transcription timeout after ${maxAttempts} attempts (~${(maxAttempts * interval / 1000 / 60).toFixed(1)} minutes)`);
  }

  async cancelTranscription(transcriptId) {
    const job = this.jobs.get(transcriptId);
    if (!job) {
      return;
    }

    job.cancelled = true;

    try {
      await this.client.delete(`/transcript/${transcriptId}`);
      this.emit('transcription_cancelled', { transcript_id: transcriptId, deleted: true });
    } catch (error) {
      this.emit('transcription_cancelled', { transcript_id: transcriptId, deleted: false, error: error.message });
    }
  }

  getJob(transcriptId) {
    return this.jobs.get(transcriptId) || null;
  }

  async getTranscript(transcriptId) {
    const response = await this.client.get(`/transcript/${transcriptId}`);
    return response.data;
  }

  async deleteTranscript(transcriptId) {
    const response = await this.client.delete(`/transcript/${transcriptId}`);
    return response.data;
  }

  async listTranscripts(limit = 10) {
    const response = await this.client.get('/transcript', {
      params: { limit }
    });
    return response.data.transcripts || [];
  }

  estimateCost(durationSeconds) {
    const hours = durationSeconds / 3600;
    const cost = hours * 0.65;
    return cost.toFixed(2);
  }

  getCostStats() {
    return {
      total_cost: this.totalCost.toFixed(2),
      transcription_count: this.transcriptionCount,
      avg_cost_per_transcription: this.transcriptionCount > 0
        ? (this.totalCost / this.transcriptionCount).toFixed(2)
        : '0.00'
    };
  }

  async validateAPIKey() {
    try {
      await this.listTranscripts(1);
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return false;
      }
      throw error;
    }
  }

  getSupportedLanguages() {
    return [
      'en','es','fr','de','it','pt','nl','hi','ja','zh','fi','ko','pl','ru','tr','uk','vi'
    ];
  }
}

export default AssemblyAIMCP;
