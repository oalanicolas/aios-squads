/**
 * PDF Collector
 * Extracts text from PDFs with OCR support
 */

import { createWriteStream, promises as fsp } from 'fs';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';
import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import sanitizeFilename from 'sanitize-filename';
import { spawn } from 'child_process';
import { randomUUID } from 'crypto';
import tesseract from 'node-tesseract-ocr';
import { MarkdownConverter } from '../utils/markdown-converter.js';

const DEFAULT_OCR_OPTIONS = {
  lang: 'eng',
  oem: 1,
  psm: 1
};

export class PDFCollector extends EventEmitter {
  constructor(downloadRules) {
    super();
    this.downloadRules = downloadRules;
    this.converter = new MarkdownConverter();
  }

  async collect(_source, outputDir) {
    this.emit('start', { source });

    const tempArtifacts = [];
    let localPath = null;

    try {
      const baseDir = this._resolveBaseDir(outputDir);
      const sourceSlug = sanitizeFilename(source.id || this._slugify(source.title));
      const sourceDir = path.join(baseDir, sourceSlug);
      await fsp.mkdir(sourceDir, { recursive: true });

      this.emit('status', { source, phase: 'download', message: 'Preparing document source' });
      localPath = await this._ensureLocalFile(_source, tempArtifacts);

      this.emit('status', { source, phase: 'metadata', message: 'Reading PDF metadata' });
      const { pdf, metadata } = await this._extractWithPdfParse(localPath, source);

      let text = pdf.text || '';
      let ocrPerformed = false;

      if (this._needsOCR(text, pdf.numpages)) {
        this.emit('status', { source, phase: 'ocr', message: 'Running OCR via Tesseract (scanned PDF detected)' });
        text = await this._runOCR(localPath, metadata.language, tempArtifacts);
        ocrPerformed = true;
      }

      this.emit('status', { source, phase: 'analysis', message: 'Detecting chapters and sections' });
      const chapters = this._detectChapters(text);
      const quality = this._assessQuality(text, pdf.numpages, ocrPerformed);

      this.emit('status', { source, phase: 'output', message: 'Generating markdown artifacts' });
      const artifacts = await this._generateOutputs({
        source,
        sourceDir,
        text,
        pdf,
        metadata,
        chapters,
        quality,
        ocrPerformed
      });

      const result = {
        source_id: source.id || sourceSlug,
        metadata,
        text_path: artifacts.markdownPath,
        raw_text_path: artifacts.rawTextPath,
        chapters: artifacts.chapterPaths,
        quality,
        ocr_performed: ocrPerformed
      };

      this.emit('completed', { source, result });
      return result;
    } catch (error) {
      this.emit('error', { source, error });
      throw error;
    } finally {
      await this._cleanupTemps(tempArtifacts, localPath);
    }
  }

  _resolveBaseDir(outputDir) {
    const savePath = this.downloadRules.pdf?.output?.save_path;
    if (savePath) {
      const dir = savePath.replace('{source_id}', '');
      return path.isAbsolute(dir) ? dir : path.join(outputDir, dir);
    }
    return path.join(outputDir, 'pdf');
  }

  async _ensureLocalFile(_source, tempArtifacts) {
    if (source.local_path) {
      return source.local_path;
    }

    if (!source.url) {
      throw new Error('PDF source requires either local_path or url');
    }

    const response = await axios.get(source.url, {
      responseType: 'stream',
      timeout: (this.downloadRules.global?.timeout_seconds || 300) * 1000,
      headers: {
        'User-Agent': this.downloadRules.global?.user_agent || 'AIOS-ETL-PDFCollector/1.0'
      }
    });

    const tempPath = path.join(os.tmpdir(), `etl-pdf-${randomUUID()}.pdf`);
    tempArtifacts.push(tempPath);

    await new Promise((resolve, reject) => {
      const writer = createWriteStream(tempPath);
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return tempPath;
  }

  async _extractWithPdfParse(pdfPath, source) {
    const dataBuffer = await fsp.readFile(pdfPath);
    const _pdf = await pdfParse(dataBuffer);

    const metadata = {
      title: source.title || pdf.info?.Title || 'Untitled PDF',
      url: source.url,
      author: pdf.info?.Author || pdf.metadata?.get?.('pdf:author') || null,
      creator: pdf.info?.Creator || null,
      created_at: pdf.info?.CreationDate || null,
      modified_at: pdf.info?.ModDate || null,
      page_count: pdf.numpages,
      language: source.language || this._inferLanguage(pdf.text),
      tags: source.tags || [],
      source_type: 'pdf'
    };

    return { pdf, metadata };
  }

  _needsOCR(text, pageCount) {
    if (!this.downloadRules.pdf?.ocr_if_scanned) {
      return false;
    }

    const cleaned = text.replace(/[^a-zA-Z0-9]/g, '');
    const density = cleaned.length / Math.max(pageCount, 1);

    return density < 150; // fewer than ~150 alphanumeric chars per page → likely scanned
  }

  async _runOCR(pdfPath, language, tempArtifacts) {
    const outputPrefix = path.join(os.tmpdir(), `etl-pdf-ocr-${randomUUID()}`);
    await this._convertPdfToImages(pdfPath, outputPrefix);

    const imageFiles = await this._listGeneratedImages(outputPrefix);
    tempArtifacts.push(...imageFiles);

    if (!imageFiles.length) {
      throw new Error('OCR failed: no page images produced from PDF');
    }

    const options = {
      ...DEFAULT_OCR_OPTIONS,
      lang: language || DEFAULT_OCR_OPTIONS.lang
    };

    const texts = [];
    for (const image of imageFiles) {
      const text = await tesseract.recognize(image, options);
      texts.push(text.trim());
    }

    return texts.join('\n\n');
  }

  _convertPdfToImages(pdfPath, outputPrefix) {
    return new Promise((resolve, reject) => {
      const process = spawn('pdftoppm', ['-png', pdfPath, outputPrefix]);
      process.on('error', reject);
      process.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`pdftoppm exited with code ${code}`));
        }
      });
    });
  }

  async _listGeneratedImages(prefix) {
    const dir = path.dirname(prefix);
    const base = path.basename(prefix);
    const entries = await fsp.readdir(dir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.startsWith(base) && entry.name.endsWith('.png'))
      .map((entry) => path.join(dir, entry.name))
      .sort();
  }

  _detectChapters(text) {
    const lines = text.split(/\r?\n/);
    const chapters = [];
    let current = { title: 'Introduction', content: [] };

    const headingRegex = /^(chapter|section|part)\b\s*(\d+|[ivxlcdm]+)/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        current.content.push('');
        continue;
      }

      if (headingRegex.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length > 6)) {
        if (current.content.length) {
          chapters.push(current);
        }
        current = { title: trimmed, content: [] };
      }

      current.content.push(trimmed);
    }

    if (current.content.length) {
      chapters.push(current);
    }

    return chapters;
  }

  _assessQuality(text, pageCount, ocrPerformed) {
    const totalChars = text.replace(/\s+/g, '').length;
    const density = totalChars / Math.max(pageCount, 1);
    const qualityScore = Math.min(100, Math.round((density / 500) * 100));

    return {
      score: qualityScore,
      acceptable: qualityScore >= (this.downloadRules.pdf?.min_text_extraction_rate ? this.downloadRules.pdf.min_text_extraction_rate * 100 : 70),
      density_per_page: density,
      ocr_performed: ocrPerformed
    };
  }

  async _generateOutputs({ source, sourceDir, text, pdf, metadata, chapters, quality, ocrPerformed }) {
    const frontmatterData = {
      ...metadata,
      ocr_performed: ocrPerformed,
      text_density_per_page: quality.density_per_page,
      quality_score: quality.score
    };

    const markdown = this.converter.addFrontmatter(text.trim(), frontmatterData);
    const markdownPath = path.join(sourceDir, 'text.md');
    const rawTextPath = path.join(sourceDir, 'text.txt');

    await fsp.writeFile(markdownPath, markdown, 'utf-8');
    await fsp.writeFile(rawTextPath, text, 'utf-8');

    const chapterPaths = [];
    if (this.downloadRules.pdf?.structure?.split_by_chapters && chapters.length > 1) {
      for (let index = 0; index < chapters.length; index++) {
        const chapter = chapters[index];
        const chapterMarkdown = this.converter.addFrontmatter(chapter.content.join('\n'), {
          ...metadata,
          chapter: chapter.title,
          chapter_index: index + 1,
          total_chapters: chapters.length
        });

        const chapterFilename = path.join(sourceDir, `chapter-${String(index + 1).padStart(2, '0')}.md`);
        chapterPaths.push(chapterFilename);
        await fsp.writeFile(chapterFilename, chapterMarkdown, 'utf-8');
      }
    }

    // Metadata already in YAML front matter of text.md

    return { markdownPath, rawTextPath, chapterPaths };
  }

  async _cleanupTemps(tempArtifacts, localPath) {
    for (const file of tempArtifacts) {
      try {
        await fsp.unlink(file);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('warning', { phase: 'cleanup', message: `Failed to remove temp artifact ${file}`, error });
        }
      }
    }

    if (localPath && localPath.startsWith(os.tmpdir())) {
      try {
        await fsp.unlink(localPath);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          this.emit('warning', { phase: 'cleanup', message: `Failed to remove temp PDF ${localPath}`, error });
        }
      }
    }
  }

  _inferLanguage(text) {
    if (!text) return 'unknown';

    const sample = text.slice(0, 2000);
    if (/[áéíóúãõç]/i.test(sample)) return 'pt';
    if (/[ñáéíóú]/i.test(sample)) return 'es';
    if (/[äöüß]/i.test(sample)) return 'de';
    return 'en';
  }

  _slugify(value = '') {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'pdf-document';
  }
}

export default PDFCollector;
