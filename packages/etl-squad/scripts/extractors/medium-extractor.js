/**
 * Medium Extractor
 * Specialized extractor for Medium.com articles
 * Handles paywall notices, member-only content, and Medium-specific formatting
 */

import { ArticleExtractor } from './article-extractor.js';
import * as cheerio from 'cheerio';

export class MediumExtractor extends ArticleExtractor {
  constructor() {
    super('medium');

    // Medium-specific content selectors (priority order)
    this.contentSelectors = [
      'article',                           // Primary article tag
      '.postArticle-content',              // Classic Medium
      'section[data-field="body"]',        // New Medium editor
      '.section-content',                  // Alternative
      '[data-post-id] article'             // Fallback
    ];

    // Medium-specific elements to remove
    this.removeSelectors = [
      ...this.removeSelectors,             // Include base selectors

      // Medium UI elements
      '.metabar',
      '.footer',
      'aside',
      '.followState',
      '.readNext',
      '.postFooter',

      // Paywall and membership
      '.paywall',
      '.meter',
      '.meteredContent',
      '.membershipUpsell',
      '.limitedAccess',

      // Social/engagement elements
      '.responsesStreamWrapper',
      '.highlightMenu',
      '.inlineTooltip',
      '.aspectRatioPlaceholder',

      // Author/publication cruft
      '.authorInfo',
      '.u-flexCenter',
      '.buttonSet',

      // Clap/share buttons
      '[data-action="show-user-card"]',
      '[data-action="sign-in-prompt"]'
    ];

    // Medium metadata selectors
    this.metadataSelectors = {
      title: [
        'h1',
        'h1[data-field="title"]',
        '.graf--title',
        'meta[property="og:title"]',
        'title'
      ],
      author: [
        '[data-field="author"] a',
        '.authorName',
        '[rel="author"]',
        'meta[name="author"]',
        'meta[property="article:author"]'
      ],
      date: [
        'time[datetime]',
        '[data-field="publishedAt"]',
        'meta[property="article:published_time"]'
      ],
      excerpt: [
        'h2[data-field="subtitle"]',
        '.graf--subtitle',
        'meta[name="description"]',
        'meta[property="og:description"]'
      ],
      read_time: [
        '[data-field="readingTime"]',
        '.readingTime'
      ],
      claps: [
        '[data-action="show-recommends"]',
        '.js-multirecommendCountButton'
      ]
    };
  }

  /**
   * Detect if site is Medium
   */
  static detectMedium($) {
    // Check canonical URL
    const canonical = $('link[rel="canonical"]').attr('href') || '';
    if (canonical.includes('medium.com')) {
      return true;
    }

    // Check meta tags
    const appName = $('meta[property="al:android:app_name"]').attr('content');
    if (appName === 'Medium') {
      return true;
    }

    // Check for Medium-specific classes/attributes
    if ($('[data-post-id]').length > 0 || $('.postArticle').length > 0) {
      return true;
    }

    // Check generator meta tag
    const generator = $('meta[name="generator"]').attr('content') || '';
    if (generator.toLowerCase().includes('medium')) {
      return true;
    }

    return false;
  }

  /**
   * Extract Medium-specific metadata
   */
  _extractMetadata($, url) {
    const metadata = super._extractMetadata($, url);

    // Extract read time
    const readTimeEl = $('[data-field="readingTime"]').first();
    if (readTimeEl.length > 0) {
      metadata.read_time_minutes = parseInt(readTimeEl.text().match(/\d+/)?.[0] || 0);
    }

    // Extract claps/recommends
    const clapsEl = $('[data-action="show-recommends"]').first();
    if (clapsEl.length > 0) {
      const clapsText = clapsEl.text().trim();
      metadata.claps = parseInt(clapsText.match(/\d+/)?.[0] || 0);
    }

    // Extract publication info
    const publication = $('[data-action="show-publication"]').first();
    if (publication.length > 0) {
      metadata.publication = publication.text().trim();
    }

    // Detect member-only content
    metadata.member_only = this._isMemberOnly($);

    // Extract topics/tags
    const topics = [];
    $('a[href*="/tag/"]').each((i, el) => {
      const topic = $(el).text().trim();
      if (topic && !topics.includes(topic)) {
        topics.push(topic);
      }
    });
    metadata.topics = topics;

    return metadata;
  }

  /**
   * Detect if article is member-only
   */
  _isMemberOnly($) {
    // Check for paywall indicators
    if ($('.paywall').length > 0) return true;
    if ($('.meteredContent').length > 0) return true;
    if ($('.membershipUpsell').length > 0) return true;

    // Check meta tags
    const isAccessible = $('meta[property="article:accessible_for_free"]').attr('content');
    if (isAccessible === 'false') return true;

    return false;
  }

  /**
   * Clean Medium-specific content
   */
  _cleanContent(content) {
    const cleanedHtml = super._cleanContent(content);
    const $ = cheerio.load(cleanedHtml);

    // Remove Medium-specific embeds that didn't get caught
    $('[data-media-id]').each((i, el) => {
      const $el = $(el);

      // If it's a code embed, keep the content
      if ($el.find('pre, code').length > 0) {
        return;
      }

      // Otherwise remove
      $el.remove();
    });

    // Clean up figure captions
    $('figcaption').each((i, el) => {
      const $el = $(el);
      const text = $el.text().trim();

      if (text) {
        // Convert to italic paragraph
        $el.replaceWith(`<p><em>${text}</em></p>`);
      } else {
        $el.remove();
      }
    });

    // Remove empty sections
    $('section').each((i, el) => {
      const $el = $(el);
      if ($el.text().trim() === '' && $el.find('img, pre, code').length === 0) {
        $el.remove();
      }
    });

    // Clean up Medium's graf classes
    $('[class*="graf"]').each((i, el) => {
      const $el = $(el);
      $el.removeAttr('class');
      $el.removeAttr('data-paragraph-id');
    });

    return $.html();
  }

  /**
   * Handle paywall warning
   */
  _addPaywallWarning(extractedData) {
    if (extractedData.metadata.member_only) {
      const warning = '\n\n---\n\n**⚠️ Note:** This article is member-only on Medium. The extracted content may be incomplete.\n\n---\n\n';
      extractedData.html = warning + extractedData.html;
    }

    return extractedData;
  }

  /**
   * Override extract to add paywall handling
   */
  async extract(url, html) {
    let extractedData = await super.extract(url, html);

    // Add paywall warning if needed
    extractedData = this._addPaywallWarning(extractedData);

    return extractedData;
  }
}

export default MediumExtractor;
