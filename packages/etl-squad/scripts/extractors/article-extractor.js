/**
 * Article Extractor - Base Class
 * Abstract base class for platform-specific article extractors
 * Based on Python ArticleScraperAgent patterns
 */

import * as cheerio from 'cheerio';
import { MarkdownConverter } from '../utils/markdown-converter.js';

export class ArticleExtractor {
  constructor(platform = 'generic') {
    this.platform = platform;
    this.converter = new MarkdownConverter();

    // Default selectors (can be overridden by subclasses)
    this.contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '#content',
      'main'
    ];

    // Elements to remove before processing
    this.removeSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.sidebar', '.widget', '.social-share',
      '.related-posts', '.comments', '.cookie-notice',
      '.advertisement', '[class*="ad-"]', '[class*="banner"]',
      '[id*="sidebar"]',
      'script', 'style', 'noscript', 'iframe'
    ];

    // Metadata selectors
    this.metadataSelectors = {
      title: [
        'h1',
        '.entry-title',
        '.post-title',
        'article h1',
        'meta[property="og:title"]',
        'title'
      ],
      author: [
        '[rel="author"]',
        '.author-name',
        '.entry-author',
        'meta[name="author"]',
        'meta[property="article:author"]'
      ],
      date: [
        'time[datetime]',
        '.entry-date',
        '.post-date',
        'meta[property="article:published_time"]'
      ],
      excerpt: [
        'meta[name="description"]',
        'meta[property="og:description"]',
        '.entry-summary',
        '.post-excerpt'
      ]
    };
  }

  /**
   * Extract article from HTML
   * @param {string} url - Article URL
   * @param {string} html - HTML content
   * @returns {Promise<object>} Extracted article data
   */
  async extract(url, html) {
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML content');
    }

    const $ = cheerio.load(html);

    // Remove unwanted elements
    this._removeUnwantedElements($);

    // Extract main content
    const content = this._extractContent($);

    if (!content || !content.html()) {
      throw new Error('Failed to extract main content');
    }

    // Extract metadata
    const metadata = this._extractMetadata($, url);

    // Clean content HTML
    const cleanHtml = this._cleanContent(content);

    return {
      url,
      platform: this.platform,
      html: cleanHtml,
      metadata,
      raw_html: html  // Keep original for reference
    };
  }

  /**
   * Remove unwanted elements from DOM
   */
  _removeUnwantedElements($) {
    this.removeSelectors.forEach(selector => {
      try {
        $(selector).remove();
      } catch (_e) {
        // Ignore invalid selectors
      }
    });
  }

  /**
   * Extract main content element
   * Tries selectors in order until content is found
   */
  _extractContent($) {
    for (const selector of this.contentSelectors) {
      const content = $(selector).first();
      if (content.length > 0 && content.text().trim().length > 100) {
        return content;
      }
    }

    // Fallback to body
    return $('body');
  }

  /**
   * Clean content HTML
   * Removes inline styles, empty elements, etc.
   */
  _cleanContent(content) {
    const $ = cheerio.load(content.html());

    // Remove inline styles
    $('[style]').removeAttr('style');

    // Remove empty paragraphs
    $('p').each((i, el) => {
      const $el = $(el);
      if ($el.text().trim() === '' && $el.find('img, code').length === 0) {
        $el.remove();
      }
    });

    // Remove empty divs
    $('div').each((i, el) => {
      const $el = $(el);
      if ($el.text().trim() === '' && $el.find('img, p, code, pre').length === 0) {
        $el.remove();
      }
    });

    // Clean up images (keep alt text)
    $('img').each((i, img) => {
      const $img = $(img);
      const alt = $img.attr('alt');

      if (alt && alt.trim()) {
        $img.replaceWith(`<p><em>[Image: ${alt.trim()}]</em></p>`);
      } else {
        $img.remove();
      }
    });

    // Remove iframes, embeds
    $('iframe, embed, object').remove();

    return $.html();
  }

  /**
   * Extract metadata from page
   */
  _extractMetadata($, url) {
    const metadata = {
      url,
      platform: this.platform,
      title: this._extractField($, this.metadataSelectors.title),
      author: this._extractField($, this.metadataSelectors.author),
      date: this._extractField($, this.metadataSelectors.date),
      excerpt: this._extractField($, this.metadataSelectors.excerpt),
      categories: this._extractList($, '.category, .categories a'),
      tags: this._extractList($, '.tag, .tags a, [rel="tag"]')
    };

    // Clean up metadata
    if (metadata.title) {
      metadata.title = this._cleanText(metadata.title);
    }

    if (metadata.author) {
      metadata.author = this._cleanText(metadata.author);
    }

    if (metadata.excerpt) {
      metadata.excerpt = this._cleanText(metadata.excerpt);
    }

    return metadata;
  }

  /**
   * Extract field using multiple selectors
   */
  _extractField($, selectors) {
    for (const selector of selectors) {
      try {
        let value;

        if (selector.startsWith('meta[')) {
          // Meta tag - get content attribute
          value = $(selector).attr('content');
        } else if (selector === 'time[datetime]') {
          // Time tag - get datetime attribute
          value = $('time').attr('datetime');
        } else {
          // Regular element - get text
          value = $(selector).first().text();
        }

        if (value && value.trim()) {
          return value.trim();
        }
      } catch (_e) {
        // Continue to next selector
      }
    }

    return null;
  }

  /**
   * Extract list of items (categories, tags)
   */
  _extractList($, selector) {
    const items = [];

    try {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text) {
          items.push(text);
        }
      });
    } catch (_e) {
      // Return empty array
    }

    return items;
  }

  /**
   * Clean text (remove extra whitespace, newlines)
   */
  _cleanText(text) {
    return text
      .replace(/\s+/g, ' ')  // Multiple spaces to single space
      .replace(/\n/g, ' ')    // Newlines to spaces
      .trim();
  }

  /**
   * Convert to markdown
   */
  toMarkdown(extractedData) {
    const markdown = this.converter.convert(extractedData.html);

    return this.converter.addFrontmatter(markdown, {
      ...extractedData.metadata,
      extraction_method: this.platform,
      source_type: 'blog'
    });
  }

  /**
   * Validate extraction quality
   */
  validate(extractedData) {
    const issues = [];
    let score = 100;

    // Check if content exists
    if (!extractedData.html || extractedData.html.length < 500) {
      issues.push('Content too short (< 500 chars)');
      score -= 30;
    }

    // Check metadata
    if (!extractedData.metadata.title) {
      issues.push('Missing title');
      score -= 20;
    }

    if (!extractedData.metadata.author && !extractedData.metadata.date) {
      issues.push('Missing author and date');
      score -= 10;
    }

    // Convert to markdown and check quality
    const markdown = this.converter.convert(extractedData.html);
    const markdownQuality = this.converter.validateQuality(markdown);

    if (markdownQuality.score < 60) {
      issues.push(`Low markdown quality: ${markdownQuality.score}`);
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      acceptable: score >= 70,
      issues,
      markdownQuality
    };
  }

  /**
   * Get platform name
   */
  getPlatform() {
    return this.platform;
  }
}

export default ArticleExtractor;
