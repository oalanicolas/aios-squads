/**
 * Progress Tracker
 * Real-time progress tracking with ETA calculation
 */

import EventEmitter from 'events';
import chalk from 'chalk';

const DEFAULT_REFRESH_INTERVAL = 2000;

export class ProgressTracker extends EventEmitter {
  constructor(total = 0, options = {}) {
    super();

    this.total = total;
    this.completed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
    this.smoothingFactor = options.smoothingFactor || 0.2;
    this.refreshInterval = options.refreshInterval || DEFAULT_REFRESH_INTERVAL;

    this.byType = new Map();
    this.history = [];
    this.smoothedRate = null;

    if (options.autoDisplay !== false) {
      this._startAutoDisplay();
    }
  }

  setTotal(total) {
    this.total = total;
    this.emit('progress', this.getProgress());
  }

  increment({ type = 'default', status = 'completed', count = 1 } = {}) {
    if (!this.byType.has(type)) {
      this.byType.set(type, {
        completed: 0,
        failed: 0,
        skipped: 0,
        total: 0,
        processed: 0,
        history: []
      });
    }

    const typeStats = this.byType.get(type);
    typeStats.total += count;

    if (status === 'completed') {
      this.completed += count;
      typeStats.completed += count;
    } else if (status === 'failed') {
      this.failed += count;
      typeStats.failed += count;
    } else if (status === 'skipped') {
      this.skipped += count;
      typeStats.skipped += count;
    }

    const processed = this.completed + this.failed + this.skipped;
    typeStats.processed = typeStats.completed + typeStats.failed + typeStats.skipped;

    const now = Date.now();
    const duration = now - this.startTime;
    const rate = processed / (duration / 1000);

    this.smoothedRate = this.smoothedRate === null
      ? rate
      : (this.smoothingFactor * rate) + ((1 - this.smoothingFactor) * this.smoothedRate);

    this.history.push({ timestamp: now, processed });
    typeStats.history.push({ timestamp: now, processed: typeStats.processed });

    this.lastUpdate = now;
    this.emit('progress', this.getProgress());
  }

  getProgress() {
    const processed = this.completed + this.failed + this.skipped;
    const percentage = this.total > 0 ? ((processed / this.total) * 100) : 0;
    const elapsedMs = Date.now() - this.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);

    const remaining = this.total > 0 ? Math.max(this.total - processed, 0) : 0;
    const rate = this.smoothedRate || (processed / Math.max(elapsedSeconds, 1));
    const etaSeconds = rate > 0 ? Math.max(remaining / rate, 0) : Infinity;

    const byType = Array.from(this.byType.entries()).map(([type, stats]) => ({
      type,
      ...stats,
      percentage: stats.total > 0 ? ((stats.processed / stats.total) * 100).toFixed(1) : '0.0'
    }));

    return {
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      skipped: this.skipped,
      processed,
      percentage: percentage.toFixed(1),
      elapsed_seconds: elapsedSeconds,
      elapsed_human: this._formatDuration(elapsedSeconds),
      eta_seconds: Math.floor(etaSeconds),
      eta_human: this._formatDuration(Math.floor(etaSeconds)),
      rate_per_minute: (rate * 60).toFixed(1),
      byType,
      history: this.history.slice(-50)
    };
  }

  display({ clear = true } = {}) {
    const progress = this.getProgress();

    if (clear) {
      process.stdout.write('\u001b[2J\u001b[0;0H');
    }

    const bar = this._createProgressBar(parseFloat(progress.percentage));
    console.log(`${bar} ${chalk.bold(progress.percentage)}% (${progress.processed}/${progress.total})`);
    console.log(`${chalk.green('✓')} ${progress.completed}  ${chalk.red('✗')} ${progress.failed}  ${chalk.yellow('⚪')} ${progress.skipped}`);
    console.log(`⏱ Elapsed: ${progress.elapsed_human}  |  ETA: ${progress.eta_human}  |  Rate: ${progress.rate_per_minute} items/min`);

    if (progress.byType.length > 0) {
      console.log('\nPer type:');
      progress.byType.forEach(typeStats => {
        const line = `${chalk.blue(typeStats.type.padEnd(12))} ${typeStats.percentage}% (${typeStats.processed}/${typeStats.total}) ` +
          `| ${chalk.green('✓')} ${typeStats.completed}  ${chalk.red('✗')} ${typeStats.failed}  ${chalk.yellow('⚪')} ${typeStats.skipped}`;
        console.log(line);
      });
    }
  }

  exportToJSON() {
    return JSON.stringify(this.getProgress(), null, 2);
  }

  stopAutoDisplay() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  _startAutoDisplay() {
    if (this.interval) return;
    this.interval = setInterval(() => this.display(), this.refreshInterval);
  }

  _createProgressBar(percentage, width = 40) {
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }

  _formatDuration(seconds) {
    if (!isFinite(seconds)) return '∞';
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

export default ProgressTracker;
