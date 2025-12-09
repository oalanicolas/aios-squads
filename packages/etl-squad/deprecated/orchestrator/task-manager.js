/**
 * Task Manager
 * Manages task queue with priority and concurrency control
 */

import EventEmitter from 'events';
import fs from 'fs/promises';
import path from 'path';

export class TaskManager extends EventEmitter {
  constructor(options = {}) {
    super();

    this.maxConcurrent = options.maxConcurrent || 5;
    this.maxRetries = options.maxRetries || 3;
    this.statePath = options.statePath || null;
    this.autoPersistInterval = options.autoPersistInterval || 10000;

    this.queue = [];
    this.running = new Map();
    this.completed = [];
    this.failed = [];
    this.cancelled = new Set();
    this.dependencies = new Map();
    this.metrics = {
      started: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      cancelled: 0,
      avgDuration: 0
    };

    if (this.statePath) {
      this._loadState();
      this._autoPersist();
    }
  }

  addTask(task) {
    const taskWithMetadata = {
      ...task,
      status: 'pending',
      attempts: 0,
      created_at: Date.now(),
      updated_at: Date.now(),
      result: null,
      error: null
    };

    if (task.dependencies?.length) {
      this.dependencies.set(task.id, task.dependencies);
    }

    this.queue.push(taskWithMetadata);
    this.emit('task_added', taskWithMetadata);
    this._processQueue();
    this._persistState();
  }

  addTasks(tasks) {
    tasks.forEach(task => this.addTask(task));
  }

  cancelTask(taskId) {
    this.cancelled.add(taskId);
    const runningTask = this.running.get(taskId);
    if (runningTask?.cancel) {
      runningTask.cancel();
    }

    this.emit('task_cancelled', { id: taskId });
    this.metrics.cancelled += 1;
    this._persistState();
  }

  async _processQueue() {
    while (this.running.size < this.maxConcurrent && this.queue.length > 0) {
      const index = this.queue.findIndex(task => this._canRun(task));
      if (index === -1) break;

      const task = this.queue.splice(index, 1)[0];
      this._executeTask(task);
    }
  }

  _canRun(task) {
    if (this.cancelled.has(task.id)) return false;

    const deps = this.dependencies.get(task.id);
    if (!deps?.length) return true;

    return deps.every(depId =>
      this.completed.some(t => t.id === depId) &&
      !this.failed.some(t => t.id === depId)
    );
  }

  async _executeTask(task) {
    const startTime = Date.now();
    const taskWithCancel = {
      ...task,
      status: 'running',
      started_at: startTime,
      updated_at: startTime,
      cancel: null
    };

    this.running.set(task.id, taskWithCancel);
    this.metrics.started += 1;
    this.emit('task_started', taskWithCancel);

    const cancelToken = { cancelled: false };
    taskWithCancel.cancel = () => {
      cancelToken.cancelled = true;
    };

    try {
      const result = await task.execute({ cancelToken });

      if (cancelToken.cancelled) {
        throw new Error('Task cancelled');
      }

      const duration = Date.now() - startTime;
      this.metrics.completed += 1;
      this.metrics.avgDuration = this._computeNewAverage(this.metrics.avgDuration, this.metrics.completed, duration);

      const completedTask = {
        ...taskWithCancel,
        status: 'completed',
        completed_at: Date.now(),
        updated_at: Date.now(),
        result,
        duration
      };

      this.running.delete(task.id);
      this.completed.push(completedTask);
      this.emit('task_completed', completedTask);
    } catch (error) {
      const attempts = task.attempts + 1;
      const taskWithError = {
        ...taskWithCancel,
        attempts,
        error: error.message,
        updated_at: Date.now()
      };

      this.running.delete(task.id);

      if (cancelToken.cancelled || this.cancelled.has(task.id)) {
        taskWithError.status = 'cancelled';
        this.cancelled.delete(task.id);
        this.metrics.cancelled += 1;
        this.emit('task_cancelled', taskWithError);
      } else if (attempts < (task.maxRetries || this.maxRetries)) {
        taskWithError.status = 'retrying';
        this.queue.push(taskWithError);
        this.metrics.retried += 1;
        this.emit('task_retrying', taskWithError);
      } else {
        taskWithError.status = 'failed';
        this.failed.push(taskWithError);
        this.metrics.failed += 1;
        this.emit('task_failed', taskWithError);
      }
    }

    this._persistState();
    this._processQueue();
  }

  async _loadState() {
    try {
      const stateJSON = await fs.readFile(this.statePath, 'utf-8');
      const state = JSON.parse(stateJSON);

      this.queue = state.queue || [];
      this.completed = state.completed || [];
      this.failed = state.failed || [];
      this.metrics = state.metrics || this.metrics;
      this.dependencies = new Map(Object.entries(state.dependencies || {}));

      this.emit('state_loaded', state);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.emit('state_load_error', { error: error.message });
      }
    }
  }

  async _persistState() {
    if (!this.statePath) return;

    const state = {
      queue: this.queue,
      running: Array.from(this.running.values()),
      completed: this.completed,
      failed: this.failed,
      metrics: this.metrics,
      dependencies: Object.fromEntries(this.dependencies)
    };

    try {
      await fs.mkdir(path.dirname(this.statePath), { recursive: true });
      await fs.writeFile(this.statePath, JSON.stringify(state, null, 2));
      this.emit('state_saved', { path: this.statePath });
    } catch (error) {
      this.emit('state_save_error', { error: error.message });
    }
  }

  _autoPersist() {
    if (!this.statePath || this.autoPersistTimer) return;

    this.autoPersistTimer = setInterval(() => this._persistState(), this.autoPersistInterval);
  }

  getStats() {
    const totals = {
      pending: this.queue.length,
      running: this.running.size,
      completed: this.completed.length,
      failed: this.failed.length,
      cancelled: this.metrics.cancelled,
      total: this.queue.length + this.running.size + this.completed.length + this.failed.length
    };

    return {
      totals,
      metrics: { ...this.metrics }
    };
  }

  async flush() {
    this.queue.length = 0;
    this.completed.length = 0;
    this.failed.length = 0;
    this.running.clear();
    this.cancelled.clear();
    this.metrics = {
      started: 0,
      completed: 0,
      failed: 0,
      retried: 0,
      cancelled: 0,
      avgDuration: 0
    };
    await this._persistState();
  }

  _computeNewAverage(currentAverage, count, newValue) {
    if (count === 0) return newValue;
    return (currentAverage * ((count - 1) / count)) + (newValue / count);
  }

  async shutdown() {
    if (this.autoPersistTimer) {
      clearInterval(this.autoPersistTimer);
      this.autoPersistTimer = null;
    }
    await this._persistState();
  }
}

export default TaskManager;
