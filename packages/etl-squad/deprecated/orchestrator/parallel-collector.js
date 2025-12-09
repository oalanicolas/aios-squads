/**
 * Parallel Collector - Master Orchestrator
 * Coordinates parallel collection across all source types
 */

import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';
import { _getLogsDir } from '../utils/path-helpers.js';
import { TaskManager } from './task-manager.js';
import { ProgressTracker } from './progress-tracker.js';
import { YouTubeCollector } from '../collectors/youtube-collector.js';
import { WebCollector } from '../collectors/web-collector.js';
import { PDFCollector } from '../collectors/pdf-collector.js';
import { PodcastCollector } from '../collectors/podcast-collector.js';
import { SocialCollector } from '../collectors/social-collector.js';
import { ZLibraryCollector } from '../collectors/zlibrary-collector.js';

export class ParallelCollector {
  constructor(configPath, options = {}) {
    this.configPath = configPath;
    this.downloadRules = null;
    this.collectors = {};
    this.outputDir = options.outputDir; // Store outputDir for state file location

    // Derive state path from outputDir structure
    // If outputDir is {something}/sources/downloads, use {something}/docs/logs
    // Otherwise, use outputDir/../logs
    const defaultStatePath = this.outputDir
      ? (this.outputDir.includes('/sources/downloads')
          ? path.join(this.outputDir, '../../docs/logs/.etl-task-state.json')
          : path.join(path.dirname(this.outputDir), 'logs/.etl-task-state.json'))
      : path.join(process.cwd(), '.etl-task-state.json');

    this.options = {
      maxConcurrent: options.maxConcurrent || 5,
      statePath: options.statePath || defaultStatePath,
      progressRefresh: options.progressRefresh || 2000,
      allowResume: options.allowResume !== false
    };

    this.results = {
      successful: [],
      failed: [],
      skipped: [],
      startTime: null,
      endTime: null
    };

    this.progressTracker = null;
    this.taskManager = null;
  }

  async initialize() {
    const rulesPath = path.join(path.dirname(this.configPath), 'download-rules.yaml');
    const rulesContent = await fs.readFile(rulesPath, 'utf8');
    this.downloadRules = yaml.load(rulesContent);

    this.collectors = {
      youtube: new YouTubeCollector(this.downloadRules),
      blog: new WebCollector(this.downloadRules),
      pdf: new PDFCollector(this.downloadRules),
      book: new ZLibraryCollector(this.downloadRules),
      podcast: new PodcastCollector(this.downloadRules),
      social: new SocialCollector(this.downloadRules)
    };
  }

  async collectAll(sourcesPath, outputDir) {
    this.results.startTime = Date.now();

    const sourcesContent = await fs.readFile(sourcesPath, 'utf8');
    const sourcesData = yaml.load(sourcesContent);
    const sources = sourcesData.sources || [];

    this.progressTracker = new ProgressTracker(sources.length, {
      refreshInterval: this.options.progressRefresh
    });

    this.taskManager = new TaskManager({
      maxConcurrent: this.options.maxConcurrent,
      statePath: this.options.allowResume ? this.options.statePath : null
    });

    this._wireTaskEvents();

    const grouped = this._groupByType(sources);
    for (const [type, typeSources] of Object.entries(grouped)) {
      for (const source of typeSources) {
        this.taskManager.addTask({
          id: source.id,
          type,
          source,
          execute: async ({ cancelToken }) => {
            const collector = this.collectors[type];
            if (!collector) {
              throw new Error(`No collector found for type ${type}`);
            }
            return await collector.collect({ ...source, cancelToken }, outputDir);
          }
        });
      }
    }

    await this._waitForCompletion();

    this.results.endTime = Date.now();
    this.progressTracker.stopAutoDisplay();

    return this._generateReport(sources.length);
  }

  cancel(sourceId) {
    this.taskManager?.cancelTask(sourceId);
  }

  async shutdown() {
    await this.taskManager?.shutdown();
    this.progressTracker?.stopAutoDisplay();
  }

  _wireTaskEvents() {
    this.taskManager.on('task_started', (task) => {
      this.progressTracker.increment({ type: task.type, status: 'started', count: 0 });
    });

    this.taskManager.on('task_completed', (task) => {
      this.results.successful.push(task);
      this.progressTracker.increment({ type: task.type, status: 'completed' });
    });

    this.taskManager.on('task_failed', (task) => {
      this.results.failed.push(task);
      this.progressTracker.increment({ type: task.type, status: 'failed' });
    });

    this.taskManager.on('task_cancelled', (task) => {
      this.results.skipped.push(task);
      this.progressTracker.increment({ type: task.type, status: 'skipped' });
    });
  }

  _groupByType(sources) {
    const grouped = {};
    for (const source of sources) {
      const type = source.type || 'blog';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(source);
    }
    return grouped;
  }

  async _waitForCompletion() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const stats = this.taskManager.getStats();
        if (stats.totals.running === 0 && stats.totals.pending === 0) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 1000);
    });
  }

  _generateReport(totalSources) {
    const durationSeconds = Math.floor((this.results.endTime - this.results.startTime) / 1000);
    const progress = this.progressTracker.getProgress();
    const taskStats = this.taskManager.getStats();

    return {
      totals: {
        total: totalSources,
        successful: this.results.successful.length,
        failed: this.results.failed.length,
        skipped: this.results.skipped.length,
        successRate: totalSources > 0
          ? ((this.results.successful.length / totalSources) * 100).toFixed(1)
          : '0.0'
      },
      duration_seconds: durationSeconds,
      duration_human: this._formatDuration(durationSeconds),
      progress,
      task_metrics: taskStats.metrics,
      results: this.results,
      generated_at: new Date().toISOString()
    };
  }

  _formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  }
}

export default ParallelCollector;
