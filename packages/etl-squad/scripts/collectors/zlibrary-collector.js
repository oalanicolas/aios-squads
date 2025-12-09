/**
 * Z-Library Collector
 * Responsible for locating and downloading books/eBooks before the extraction pipeline.
 */

import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { PDFCollector } from './pdf-collector.js';

const PYTHON_SCRIPT = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'python',
  'zlibrary_downloader.py'
);

export class ZLibraryCollector extends EventEmitter {
  constructor(downloadRules = {}) {
    super();
    this.downloadRules = downloadRules;
    this.pdfCollector = new PDFCollector(downloadRules);

    this._forwardPdfEvents();
  }

  async collect(source, outputDir) {
    this.emit('start', { source });

    if (source.local_path) {
      const pdfResult = await this._runPdfExtraction({
        source,
        primaryFile: source.local_path,
        outputDir,
        metadataPath: source.metadata_path
      });

      this.emit('completed', { source, result: pdfResult });
      return pdfResult;
    }

    if (!process.env.ZLIB_EMAIL || !process.env.ZLIB_PASSWORD) {
      const error = new Error('Environment variables ZLIB_EMAIL and ZLIB_PASSWORD are required to collect books.');
      this.emit('error', { source, error });
      throw error;
    }

    const baseDir = await this._resolveBaseDir(outputDir, source.id);
    const commandArgs = this._buildCommandArgs({ source, baseDir });

    try {
      const result = await this._runPython(commandArgs, source);

      if (result.status !== 'success') {
        const error = new Error(result.message || 'Failed to download book from Z-Library');
        this.emit('error', { source, error, result });
        throw error;
      }

      const files = await this._ensureFiles(result.downloaded_files);
      const primaryFile = this._selectPrimaryFile(files);

      if (!primaryFile) {
        const error = new Error('Downloaded files did not include a supported document (pdf/epub).');
        this.emit('error', { source, error, files });
        throw error;
      }

      const pdfResult = await this._runPdfExtraction({
        source,
        primaryFile,
        outputDir,
        metadataPath: result.metadata_path
      });

      const payload = {
        ...pdfResult,
        source_id: source.id,
        raw_files: files,
        download_metadata_path: result.metadata_path,
        status: result.status
      };

      this.emit('completed', { source, result: payload });
      return payload;
    } catch (error) {
      this.emit('error', { source, error });
      throw error;
    }
  }

  _forwardPdfEvents() {
    const events = ['start', 'status', 'completed', 'error', 'warning'];
    for (const eventName of events) {
      this.pdfCollector.on(eventName, (payload) => {
        this.emit(eventName, payload);
      });
    }
  }

  async _resolveBaseDir(outputDir, sourceId) {
    const rules = this.downloadRules.books || {};
    const savePathTemplate = rules.output?.save_path || 'downloads/books/{source_id}/';
    const relativePath = savePathTemplate.replace('{source_id}', sourceId || 'book');
    const absolute = path.isAbsolute(relativePath) ? relativePath : path.join(outputDir, relativePath);
    await fs.mkdir(absolute, { recursive: true });
    return absolute;
  }

  _buildCommandArgs({ source, baseDir }) {
    const rules = this.downloadRules.books || {};
    const args = [PYTHON_SCRIPT, 'download', '--output', baseDir, '--source-id', source.id];

    const twitterUrl = rules.twitter_url;
    if (rules.verify_official_url_on_start !== false && twitterUrl) {
      args.push('--twitter-url', twitterUrl);
    }

    if (source.zlibrary_base_url) {
      args.push('--base-url', source.zlibrary_base_url);
    } else if (rules.base_url) {
      args.push('--base-url', rules.base_url);
    }

    const maxResults = source.max_results || rules.max_results_per_query || 1;
    args.push('--max-results', String(maxResults));

    const delay = source.delay_between_downloads ?? rules.delay_between_downloads;
    if (delay) {
      args.push('--delay', String(delay));
    }

    if (source.query) {
      args.push('--query', source.query);
    } else if (source.title) {
      args.push('--query', source.title);
    }

    if (source.zlibrary_id || source.book_id) {
      args.push('--id', source.zlibrary_id || source.book_id);
    }

    if (process.env.ZLIB_TIMEOUT) {
      args.push('--timeout', process.env.ZLIB_TIMEOUT);
    } else if (rules.timeout_seconds) {
      args.push('--timeout', String(rules.timeout_seconds));
    }

    return args;
  }

  _runPython(args, source) {
    return new Promise((resolve, reject) => {
      const pythonExecutable = this._pythonExecutable();

      const child = spawn(pythonExecutable, args, {
        cwd: path.join(path.dirname(PYTHON_SCRIPT), '..'),
        env: { ...process.env },
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
        this.emit('status', {
          source,
          phase: 'python',
          message: chunk.toString().trim()
        });
      });

      child.on('error', (error) => {
        reject(error);
      });

      child.on('close', (code) => {
        if (!stdout.trim()) {
          return reject(new Error(`Python script produced no output. stderr: ${stderr}`));
        }

        let payload;
        try {
          payload = JSON.parse(stdout.trim());
        } catch (error) {
          return reject(new Error(`Failed to parse downloader response: ${error.message}. Payload: ${stdout}`));
        }

        if (code !== 0 && payload.status !== 'success') {
          return reject(new Error(payload.message || `Python process exited with code ${code}`));
        }

        resolve({
          status: payload.status,
          message: payload.message,
          downloaded_files: payload.downloaded_files || payload.files || [],
          metadata_path: payload.metadata_path || null,
          success: payload.status === 'success'
        });
      });
    });
  }

  _pythonExecutable() {
    if (process.env.ZLIB_PYTHON_PATH) {
      return process.env.ZLIB_PYTHON_PATH;
    }

    const isWindows = os.platform() === 'win32';
    return isWindows ? 'python' : 'python3';
  }

  async _ensureFiles(files = []) {
    const valid = [];
    for (const filePath of files) {
      try {
        await fs.access(filePath);
        valid.push(filePath);
      } catch {
        // ignore missing files
      }
    }
    return valid;
  }

  _selectPrimaryFile(files = []) {
    const normalized = files.map((file) => file.toLowerCase());
    const pdfIndex = normalized.findIndex((file) => file.endsWith('.pdf'));
    if (pdfIndex !== -1) {
      return files[pdfIndex];
    }
    const epubIndex = normalized.findIndex((file) => file.endsWith('.epub'));
    if (epubIndex !== -1) {
      return files[epubIndex];
    }
    return files[0];
  }

  async _runPdfExtraction({ source, primaryFile, outputDir, metadataPath }) {
    const pdfSource = {
      ...source,
      id: source.id,
      title: source.title || path.basename(primaryFile),
      local_path: primaryFile,
      url: source.url || primaryFile,
      type: 'pdf',
      zlibrary_metadata_path: metadataPath
    };

    return this.pdfCollector.collect(pdfSource, outputDir);
  }
}

export default ZLibraryCollector;


