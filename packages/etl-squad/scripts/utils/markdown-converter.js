/**
 * Markdown Converter
 * Converts HTML to clean, minimal markdown without images/videos
 * Based on ArticleScraperAgent Python script patterns
 */

import TurndownService from 'turndown';
import { JSDOM } from 'jsdom';

export class MarkdownConverter {
  constructor(options = {}) {
    this.options = {
      headingStyle: 'atx',
      hr: '---',
      bulletListMarker: '-',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**',
      linkStyle: 'inlined',
      ...options
    };

    this.turndown = new TurndownService(this.options);
    this._setupRules();
  }

  /**
   * Setup custom Turndown rules
   */
  _setupRules() {
    // ⭐ RULE 1: Remove ALL images (keep alt text as placeholder)
    this.turndown.addRule('removeImages', {
      filter: ['img', 'picture', 'figure', 'svg'],
      replacement: (content, node) => {
        // For <img> tags, keep alt text as placeholder
        if (node.nodeName === 'IMG') {
          const alt = node.getAttribute('alt');
          if (alt && alt.trim()) {
            return `\n\n*[Image: ${alt.trim()}]*\n\n`;
          }
        }
        // Remove everything else (figures, svgs, etc)
        return '';
      }
    });

    // ⭐ RULE 2: Remove videos and iframes
    this.turndown.addRule('removeVideos', {
      filter: ['video', 'iframe', 'embed', 'object'],
      replacement: () => ''  // Complete removal
    });

    // ⭐ RULE 3: Clean links (preserve but format consistently)
    this.turndown.addRule('cleanLinks', {
      filter: (node) => {
        return node.nodeName === 'A' && node.getAttribute('href');
      },
      replacement: (content, node) => {
        const href = node.getAttribute('href');

        // Skip anchor links
        if (!href || href.startsWith('#')) {
          return content;
        }

        // Skip empty links
        if (!content.trim()) {
          return '';
        }

        return `[${content}](${href})`;
      }
    });

    // ⭐ RULE 4: Clean paragraphs (remove empty ones)
    this.turndown.addRule('cleanParagraphs', {
      filter: 'p',
      replacement: (content) => {
        const cleaned = content.trim();
        if (!cleaned) return '';
        return `\n\n${cleaned}\n\n`;
      }
    });

    // ⭐ RULE 5: Preserve code blocks properly
    this.turndown.addRule('codeBlocks', {
      filter: (node) => {
        return node.nodeName === 'PRE' && node.querySelector('code');
      },
      replacement: (content, node) => {
        const codeNode = node.querySelector('code');
        const language = codeNode?.className.match(/language-(\w+)/)?.[1] || '';
        const code = codeNode?.textContent || content;

        return `\n\n\`\`\`${language}\n${code}\n\`\`\`\n\n`;
      }
    });

    // ⭐ RULE 6: Clean tables (preserve as markdown tables)
    this.turndown.addRule('cleanTables', {
      filter: 'table',
      replacement: (content, node) => {
        try {
          return this._convertTableToMarkdown(node);
        } catch {
          // If table conversion fails, return content as is
          return content;
        }
      }
    });

    // ⭐ RULE 7: Remove script and style tags
    this.turndown.addRule('removeScriptsAndStyles', {
      filter: ['script', 'style', 'noscript'],
      replacement: () => ''
    });

    // ⭐ RULE 8: Clean blockquotes
    this.turndown.addRule('cleanBlockquotes', {
      filter: 'blockquote',
      replacement: (content) => {
        const cleaned = content.trim();
        if (!cleaned) return '';
        return `\n\n> ${cleaned.split('\n').join('\n> ')}\n\n`;
      }
    });
  }

  /**
   * Convert HTML table to markdown table
   */
  _convertTableToMarkdown(tableNode) {
    const rows = Array.from(tableNode.querySelectorAll('tr'));
    if (rows.length === 0) return '';

    let markdown = '\n\n';

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td'));
      const cellContents = cells.map(cell => cell.textContent.trim().replace(/\|/g, '\\|'));

      markdown += '| ' + cellContents.join(' | ') + ' |\n';

      // Add separator after header row
      if (rowIndex === 0) {
        markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
      }
    });

    markdown += '\n';
    return markdown;
  }

  /**
   * Convert HTML to clean markdown
   * @param {string} html - HTML content
   * @returns {string} Clean markdown
   */
  convert(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Pre-process HTML
    const cleanedHtml = this._preProcess(html);

    // Convert to markdown
    let markdown = this.turndown.turndown(cleanedHtml);

    // Post-process markdown
    markdown = this._postProcess(markdown);

    return markdown;
  }

  /**
   * Pre-process HTML before conversion
   */
  _preProcess(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove unwanted elements
    const unwantedSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.sidebar', '.widget', '.social-share',
      '.related-posts', '.comments', '.cookie-notice',
      '.advertisement', '[class*="ad-"]', '[class*="banner"]',
      'script', 'style', 'noscript', 'meta', 'link'
    ];

    unwantedSelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove());
      } catch (_e) {
        // Ignore selector errors
      }
    });

    // Remove inline styles
    document.querySelectorAll('[style]').forEach(el => {
      el.removeAttribute('style');
    });

    // Remove empty elements
    document.querySelectorAll('*').forEach(el => {
      if (el.textContent.trim() === '' &&
          !el.querySelector('img') &&
          !el.querySelector('code') &&
          el.tagName !== 'BR') {
        el.remove();
      }
    });

    return document.body.innerHTML;
  }

  /**
   * Post-process markdown for final cleanup
   */
  _postProcess(markdown) {
    return markdown
      // Max 2 consecutive newlines
      .replace(/\n{3,}/g, '\n\n')

      // Remove leading/trailing whitespace per line
      .replace(/^[ \t]+|[ \t]+$/gm, '')

      // Remove multiple spaces
      .replace(/ {2,}/g, ' ')

      // Remove image markdown (belt and suspenders - shouldn't exist but just in case)
      .replace(/!\[.*?\]\(.*?\)/g, '')

      // Clean up link formatting
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']')

      // Remove empty links
      .replace(/\[\]\(.*?\)/g, '')

      // Clean up list formatting
      .replace(/^-\s*$/gm, '')  // Empty list items

      // Remove excessive horizontal rules
      .replace(/(---\n){2,}/g, '---\n')

      // Final trim
      .trim();
  }

  /**
   * Add YAML frontmatter to markdown
   * @param {string} markdown - Markdown content
   * @param {object} metadata - Metadata object
   * @returns {string} Markdown with frontmatter
   */
  addFrontmatter(markdown, metadata = {}) {
    const frontmatterLines = ['---'];

    // Essential fields
    if (metadata.title) {
      frontmatterLines.push(`title: "${this._escapeFrontmatter(metadata.title)}"`);
    }

    if (metadata.url) {
      frontmatterLines.push(`url: ${metadata.url}`);
    }

    if (metadata.date || metadata.publish_date) {
      frontmatterLines.push(`date: ${metadata.date || metadata.publish_date}`);
    }

    if (metadata.author) {
      frontmatterLines.push(`author: ${this._escapeFrontmatter(metadata.author)}`);
    }

    // Optional fields
    if (metadata.platform) {
      frontmatterLines.push(`platform: ${metadata.platform}`);
    }

    if (metadata.source_type) {
      frontmatterLines.push(`source_type: ${metadata.source_type}`);
    }

    if (metadata.tags && Array.isArray(metadata.tags) && metadata.tags.length > 0) {
      frontmatterLines.push(`tags: [${metadata.tags.join(', ')}]`);
    }

    if (metadata.categories && Array.isArray(metadata.categories) && metadata.categories.length > 0) {
      frontmatterLines.push(`categories: [${metadata.categories.join(', ')}]`);
    }

    if (metadata.word_count) {
      frontmatterLines.push(`word_count: ${metadata.word_count}`);
    }

    // Extraction metadata
    frontmatterLines.push(`extracted: ${new Date().toISOString()}`);

    if (metadata.extraction_method) {
      frontmatterLines.push(`extraction_method: ${metadata.extraction_method}`);
    }

    frontmatterLines.push('---');
    frontmatterLines.push('');

    return frontmatterLines.join('\n') + '\n' + markdown;
  }

  /**
   * Escape special characters in frontmatter values
   */
  _escapeFrontmatter(value) {
    if (typeof value !== 'string') return value;

    return value
      .replace(/"/g, '\\"')  // Escape quotes
      .replace(/\n/g, ' ')   // Replace newlines with spaces
      .trim();
  }

  /**
   * Calculate word count from markdown
   */
  getWordCount(markdown) {
    // Remove frontmatter
    const withoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/m, '');

    // Remove code blocks
    const withoutCode = withoutFrontmatter.replace(/```[\s\S]*?```/g, '');

    // Remove markdown syntax
    const plainText = withoutCode
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')  // Links
      .replace(/[*_~`#>\-]/g, '')                 // Formatting
      .replace(/!\[.*?\]\(.*?\)/g, '');          // Images

    // Count words
    const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
    return words.length;
  }

  /**
   * Validate markdown quality
   * @returns {object} Quality report
   */
  validateQuality(markdown) {
    const wordCount = this.getWordCount(markdown);
    const lineCount = markdown.split('\n').length;
    const hasHeadings = /^#{1,6}\s+/m.test(markdown);
    const hasLinks = /\[.+?\]\(.+?\)/.test(markdown);
    const hasFrontmatter = /^---\n/.test(markdown);

    // Check for issues
    const issues = [];

    if (wordCount < 100) {
      issues.push('Very short content (< 100 words)');
    }

    if (!hasHeadings) {
      issues.push('No headings found');
    }

    if (markdown.includes('![')) {
      issues.push('Image markdown found (should be removed)');
    }

    if (markdown.match(/\n{4,}/)) {
      issues.push('Excessive whitespace found');
    }

    const score = Math.min(100,
      (wordCount > 100 ? 40 : 0) +
      (hasHeadings ? 20 : 0) +
      (hasLinks ? 15 : 0) +
      (hasFrontmatter ? 15 : 0) +
      (issues.length === 0 ? 10 : 0)
    );

    return {
      score,
      wordCount,
      lineCount,
      hasHeadings,
      hasLinks,
      hasFrontmatter,
      issues,
      acceptable: score >= 60
    };
  }
}

/**
 * Convenience function for quick conversion
 */
export function htmlToMarkdown(html, metadata = {}) {
  const converter = new MarkdownConverter();
  const markdown = converter.convert(html);

  if (metadata && Object.keys(metadata).length > 0) {
    return converter.addFrontmatter(markdown, metadata);
  }

  return markdown;
}

/**
 * Export singleton instance
 */
export const converter = new MarkdownConverter();
