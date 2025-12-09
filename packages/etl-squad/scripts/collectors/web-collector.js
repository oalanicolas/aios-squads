/**
 * Web Collector
 * Orchestrates platform-specific extractors for blog/article collection
 * Handles rate limiting, robots.txt, retry logic, and error handling
 */

import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import pLimit from 'p-limit';
import * as cheerio from 'cheerio';
import { WordPressExtractor } from '../extractors/wordpress-extractor.js';
import { MediumExtractor } from '../extractors/medium-extractor.js';
import { GenericExtractor } from '../extractors/generic-extractor.js';

export class WebCollector {
  constructor(downloadRules = {}, mcpClient = null) {
    this.downloadRules = downloadRules;
    this.mcpClient = mcpClient;

    this.extractors = {
      wordpress: new WordPressExtractor(),
      medium: new MediumExtractor(),
      generic: new GenericExtractor()
    };

    this.headers = {
      'User-Agent': downloadRules.global?.user_agent || 'AIOS-ETL-Collector/1.0 (Educational/Research)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache'
    };

    // Rate limiting per domain
    this.domainLimiters = new Map();
    this.lastRequestTime = new Map();

    // Robots.txt cache
    this.robotsCache = new Map();

    // Stats
    this.stats = {
      attempted: 0,
      successful: 0,
      failed: 0,
      retried: 0
    };
  }

  /**
   * Collect single blog article
   */
  async collect(source, outputDir) {
    this.stats.attempted++;

    try {
      const url = source.url;

      // Check robots.txt
      const allowed = await this._checkRobotsTxt(url);
      if (!allowed) {
        throw new Error('Blocked by robots.txt');
      }

      // Apply rate limiting
      await this._applyRateLimit(url);

      // Fetch HTML with retry
      const html = await this._fetchHTMLWithRetry(url);

      // Detect platform
      const platform = this._detectPlatform(url, html);

      // Select extractor
      const extractor = this.extractors[platform] || this.extractors.generic;

      // Extract content
      const extracted = await extractor.extract(url, html);

      // Validate extraction
      const validation = extractor.validate(extracted);
      if (!validation.acceptable) {
        console.warn(`Low quality extraction for ${source.id}: ${validation.score}%`);
      }

      // Convert to markdown
      const markdown = extractor.toMarkdown(extracted);

      // Generate slug from title (or use source.slug if provided)
      const slug = source.slug || this._slugify(extracted.metadata.title || source.title || source.id);

      // Save with slug filename (metadata already in YAML front matter)
      const outputPath = path.join(outputDir, 'blogs', `${slug}.md`);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, markdown);

      this.stats.successful++;

      return {
        source_id: source.id,
        platform,
        markdown,
        metadata: extracted.metadata,
        output_path: outputPath,
        validation
      };

    } catch (_error) {
      this.stats.failed++;

      console.error(`Failed to collect ${source.id}:`, error.message);

      return {
        source_id: source.id,
        error: error.message,
        success: false
      };
    }
  }

  /**
   * Check robots.txt before scraping
   */
  async _checkRobotsTxt(url) {
    const urlObj = new URL(url);
    const domain = urlObj.origin;

    // Check cache
    if (this.robotsCache.has(domain)) {
      const cached = this.robotsCache.get(domain);
      return this._isAllowedByRobots(cached, urlObj.pathname);
    }

    // Fetch robots.txt
    try {
      const robotsUrl = `${domain}/robots.txt`;
      const response = await axios.get(robotsUrl, {
        timeout: 5000,
        validateStatus: (status) => status === 200
      });

      this.robotsCache.set(domain, response.data);
      return this._isAllowedByRobots(response.data, urlObj.pathname);

    } catch (_error) {
      // If robots.txt not found, assume allowed
      this.robotsCache.set(domain, '');
      return true;
    }
  }

  /**
   * Parse robots.txt and check if path is allowed
   */
  _isAllowedByRobots(robotsTxt, pathname) {
    const lines = robotsTxt.split('\n');
    let relevantUserAgent = false;
    const disallowedPaths = [];

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();

      // Check user-agent
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.split(':')[1].trim();
        relevantUserAgent = agent === '*' || agent.includes('bot') || agent.includes('crawler');
      }

      // Collect disallowed paths
      if (relevantUserAgent && trimmed.startsWith('disallow:')) {
        const path = trimmed.split(':')[1].trim();
        if (path) {
          disallowedPaths.push(path);
        }
      }
    }

    // Check if pathname matches any disallowed pattern
    for (const disallowedPath of disallowedPaths) {
      if (pathname.startsWith(disallowedPath)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply rate limiting per domain
   */
  async _applyRateLimit(url) {
    const domain = new URL(url).hostname;
    const requestsPerMinute = this.downloadRules.rate_limits?.web?.requests_per_domain_per_minute || 10;
    const delayMs = (60 * 1000) / requestsPerMinute;

    // Get last request time for this domain
    const lastTime = this.lastRequestTime.get(domain) || 0;
    const timeSinceLastRequest = Date.now() - lastTime;

    if (timeSinceLastRequest < delayMs) {
      const waitTime = delayMs - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Update last request time
    this.lastRequestTime.set(domain, Date.now());
  }

  /**
   * Fetch HTML with retry logic
   */
  async _fetchHTMLWithRetry(url, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const html = await this._fetchHTML(url);
        return html;

      } catch (_error) {
        lastError = error;

        if (attempt < maxRetries) {
          this.stats.retried++;

          // Exponential backoff
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
          console.log(`Retry ${attempt}/${maxRetries} for ${url} after ${backoffMs}ms`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    throw lastError;
  }

  /**
   * Fetch HTML from URL
   */
  async _fetchHTML(url) {
    const timeout = this.downloadRules.global?.timeout_seconds || 30;

    const response = await axios.get(url, {
      headers: this.headers,
      timeout: timeout * 1000,
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300
    });

    return response.data;
  }

  /**
   * Detect platform from URL and HTML
   */
  _detectPlatform(url, html) {
    const $ = cheerio.load(html);

    // Try WordPress first (most common)
    if (WordPressExtractor.detectWordPress($)) {
      return 'wordpress';
    }

    // Try Medium
    if (MediumExtractor.detectMedium($)) {
      return 'medium';
    }

    // Check URL for other platforms
    const urlLower = url.toLowerCase();

    if (urlLower.includes('substack.com')) {
      return 'generic'; // TODO: Create SubstackExtractor
    }

    if (urlLower.includes('ghost.io') || $('meta[name="generator"]').attr('content')?.includes('Ghost')) {
      return 'generic'; // TODO: Create GhostExtractor
    }

    // Default to generic (Readability)
    return 'generic';
  }

  /**
   * Get collection statistics
   */
  getStats() {
    return {
      ...this.stats,
      success_rate: this.stats.attempted > 0
        ? ((this.stats.successful / this.stats.attempted) * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  /**
   * Clear caches (useful for testing)
   */
  clearCaches() {
    this.robotsCache.clear();
    this.lastRequestTime.clear();
  }

  /**
   * Convert title to URL-friendly slug
   */
  _slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')  // Remove special chars
      .replace(/[\s_-]+/g, '-')   // Replace spaces/underscores with single hyphen
      .replace(/^-+|-+$/g, '')    // Remove leading/trailing hyphens
      .substring(0, 100);          // Limit length
  }
}

export default WebCollector;
