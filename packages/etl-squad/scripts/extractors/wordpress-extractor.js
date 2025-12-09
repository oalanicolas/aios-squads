/**
 * WordPress Extractor
 * Specialized extractor for WordPress sites
 * Handles common WordPress themes and structures
 */

import { ArticleExtractor } from './article-extractor.js';

export class WordPressExtractor extends ArticleExtractor {
  constructor() {
    super('wordpress');

    // WordPress-specific content selectors (in priority order)
    this.contentSelectors = [
      '.entry-content',          // Twenty Twenty, Twenty Twenty-One
      '.post-content',           // Common custom themes
      '.article-content',        // Semantic themes
      'article .content',        // Semantic HTML5
      '#content article',        // Common structure
      '.site-content article',   // Modern WordPress
      '.post',                   // Fallback
      'article'                  // Final fallback
    ];

    // WordPress-specific elements to remove
    this.removeSelectors = [
      ...this.removeSelectors,  // Include base selectors

      // WordPress-specific
      '.wp-block-navigation',
      '.wp-block-post-comments',
      '.wp-block-tag-cloud',
      '.wp-block-categories',
      '.wp-block-latest-posts',
      '.entry-meta',             // Sometimes contains cruft
      '.post-navigation',
      '.site-info',
      '.sharedaddy',             // Jetpack sharing
      '.jp-relatedposts',        // Jetpack related posts
      '[class*="wp-embed"]',
      '[class*="jetpack"]'
    ];

    // WordPress metadata selectors
    this.metadataSelectors = {
      title: [
        'h1.entry-title',
        'h1.post-title',
        '.entry-header h1',
        'article h1',
        'meta[property="og:title"]',
        'title'
      ],
      author: [
        '.author.vcard a',
        '.entry-author a',
        '[rel="author"]',
        '.author-name',
        'meta[name="author"]'
      ],
      date: [
        'time.entry-date[datetime]',
        'time.published[datetime]',
        '.entry-date time[datetime]',
        'time[datetime]',
        'meta[property="article:published_time"]'
      ],
      excerpt: [
        '.entry-summary',
        'meta[name="description"]',
        'meta[property="og:description"]'
      ],
      categories: [
        '.cat-links a',
        '[rel="category tag"]',
        '.entry-categories a'
      ],
      tags: [
        '.tag-links a',
        '[rel="tag"]',
        '.entry-tags a'
      ]
    };
  }

  /**
   * Detect if site is WordPress (before extraction)
   * @param {CheerioAPI} $ - Cheerio instance
   * @returns {boolean}
   */
  static detectWordPress($) {
    // Check for WordPress meta generator
    const generator = $('meta[name="generator"]').attr('content');
    if (generator && generator.toLowerCase().includes('wordpress')) {
      return true;
    }

    // Check for wp-content links
    if ($('link[href*="wp-content"]').length > 0) {
      return true;
    }

    // Check for WordPress classes
    if ($('[class*="wp-"]').length > 5) {
      return true;
    }

    // Check for common WordPress body classes
    const bodyClasses = $('body').attr('class') || '';
    if (bodyClasses.includes('wordpress') ||
        bodyClasses.includes('wp-') ||
        bodyClasses.includes('single-post')) {
      return true;
    }

    return false;
  }

  /**
   * Extract WordPress-specific metadata
   */
  _extractMetadata($, url) {
    const metadata = super._extractMetadata($, url);

    // Extract WordPress-specific data
    metadata.wordpress = {
      version: this._extractWPVersion($),
      theme: this._extractTheme($),
      postId: this._extractPostId($)
    };

    // Extract featured image alt text (if image removed)
    const featuredImage = $('.wp-post-image, .post-thumbnail img').first();
    if (featuredImage.length > 0) {
      metadata.featured_image_alt = featuredImage.attr('alt');
    }

    return metadata;
  }

  /**
   * Extract WordPress version
   */
  _extractWPVersion($) {
    const generator = $('meta[name="generator"]').attr('content');
    if (generator) {
      const match = generator.match(/WordPress ([\d.]+)/);
      return match ? match[1] : null;
    }
    return null;
  }

  /**
   * Extract theme name
   */
  _extractTheme($) {
    // Try to detect from stylesheet URLs
    const stylesheet = $('link[rel="stylesheet"]').filter((i, el) => {
      const href = $(el).attr('href');
      return href && href.includes('/themes/');
    }).first();

    if (stylesheet.length > 0) {
      const href = stylesheet.attr('href');
      const match = href.match(/\/themes\/([^\/]+)\//);
      return match ? match[1] : null;
    }

    // Try body class
    const bodyClass = $('body').attr('class') || '';
    const themeMatch = bodyClass.match(/theme-(\w+)/);
    return themeMatch ? themeMatch[1] : null;
  }

  /**
   * Extract post ID
   */
  _extractPostId($) {
    // Try body class first
    const bodyClass = $('body').attr('class') || '';
    const postIdMatch = bodyClass.match(/postid-(\d+)/);
    if (postIdMatch) {
      return postIdMatch[1];
    }

    // Try article ID
    const articleId = $('article').first().attr('id');
    if (articleId) {
      const match = articleId.match(/post-(\d+)/);
      return match ? match[1] : null;
    }

    return null;
  }

  /**
   * Clean WordPress-specific content
   */
  _cleanContent(content) {
    const cleanedHtml = super._cleanContent(content);

    const $ = cheerio.load(cleanedHtml);

    // Remove WordPress shortcodes that weren't processed
    $('*').each((i, el) => {
      const $el = $(el);
      const html = $el.html();

      if (html && html.match(/\[[\w\s-]+\]/)) {
        // Remove shortcode
        const cleaned = html.replace(/\[[\w\s-]+[^\]]*\]/g, '');
        $el.html(cleaned);
      }
    });

    // Remove Gutenberg blocks cruft
    $('[class*="wp-block-"]').each((i, el) => {
      const $el = $(el);

      // Keep content, remove wrapper
      if ($el.text().trim()) {
        $el.replaceWith($el.html());
      } else {
        $el.remove();
      }
    });

    return $.html();
  }
}

export default WordPressExtractor;
