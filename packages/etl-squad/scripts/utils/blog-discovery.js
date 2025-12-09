/**
 * Blog Discovery - Smart Rules for Blog Post Collection
 *
 * Rules:
 * 1. If blog has TOP/featured posts, capture them
 * 2. If no featured posts, capture last 3 years of posts
 * 3. If total posts < 50, capture 100% of posts
 *
 * All posts saved as slug.md
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

export class BlogDiscovery {
  constructor(options = {}) {
    this.options = {
      minPostsForFilter: options.minPostsForFilter || 50,
      yearsToCapture: options.yearsToCapture || 3,
      maxRetries: options.maxRetries || 2,
      timeout: options.timeout || 30000,
      userAgent: options.userAgent || 'AIOS-ETL-BlogDiscovery/1.0'
    };

    this.rssParser = new Parser({
      customFields: {
        item: [
          ['wp:post_date', 'wpPostDate'],
          ['featured', 'featured'],
          ['sticky', 'sticky']
        ]
      }
    });
  }

  /**
   * Discover blog posts using smart rules
   * @param {string} blogUrl - Root URL of the blog
   * @param {Object} options - Discovery options
   * @returns {Promise<Array>} - List of post URLs to collect
   */
  async discoverPosts(_blogUrl, options = {}) {
    const _strategy = options.strategy || 'auto';

    try {
      // Step 1: Try to find RSS/Atom feed
      const feedUrl = await this._findFeed(_blogUrl);

      if (feedUrl) {
        console.log(`📡 RSS feed found: ${feedUrl}`);
        return await this._discoverViaRSS(feedUrl, blogUrl);
      }

      // Step 2: Fallback to HTML scraping
      console.log('🔍 No RSS feed, using HTML scraping...');
      return await this._discoverViaHTML(_blogUrl);

    } catch (_error) {
      console.error(`❌ Blog discovery failed for ${_blogUrl}:`, error.message);
      throw error;
    }
  }

  /**
   * Discover posts via RSS/Atom feed (preferred method)
   */
  async _discoverViaRSS(feedUrl, blogUrl) {
    const feed = await this.rssParser.parseURL(feedUrl);
    const allPosts = feed.items || [];

    console.log(`📊 Total posts in feed: ${allPosts.length}`);

    // Extract post metadata
    const posts = allPosts.map(item => ({
      url: item.link || item.guid,
      title: item.title,
      published: new Date(item.pubDate || item.isoDate),
      isFeatured: this._isFeatured(item),
      isSticky: this._isSticky(item),
      categories: item.categories || [],
      slug: this._extractSlugFromUrl(item.link || item.guid)
    }));

    // Apply smart rules
    const selected = this._applySmartRules(posts);

    console.log(`✅ Selected ${selected.length} posts based on smart rules`);
    return selected;
  }

  /**
   * Discover posts via HTML scraping (fallback)
   */
  async _discoverViaHTML(_blogUrl) {
    const html = await this._fetchHTML(_blogUrl);
    const $ = cheerio.load(html);

    const posts = [];

    // Common blog post selectors
    const selectors = [
      'article a[href*="/blog/"]',
      'article a[href*="/post/"]',
      '.post a[href]',
      '.entry a[href]',
      'h2 a[href]',
      'h3 a[href]',
      '.blog-post a[href]',
      '[class*="post"] a[href]'
    ];

    for (const selector of selectors) {
      $(selector).each((i, elem) => {
        const url = $(elem).attr('href');
        const title = $(elem).text().trim();

        if (url && title && this._isValidPostUrl(url, blogUrl)) {
          const absoluteUrl = this._makeAbsolute(url, blogUrl);

          // Check if already added
          if (!posts.find(p => p.url === absoluteUrl)) {
            posts.push({
              url: absoluteUrl,
              title,
              published: null, // Unknown from HTML
              isFeatured: this._detectFeaturedFromHTML($, elem),
              isSticky: false,
              categories: [],
              slug: this._extractSlugFromUrl(absoluteUrl)
            });
          }
        }
      });

      if (posts.length > 0) break; // Found posts with this selector
    }

    console.log(`📊 Found ${posts.length} posts via HTML scraping`);

    // Apply smart rules
    const selected = this._applySmartRules(posts);

    console.log(`✅ Selected ${selected.length} posts based on smart rules`);
    return selected;
  }

  /**
   * Apply smart rules to select which posts to collect
   */
  _applySmartRules(posts) {
    const totalPosts = posts.length;

    // Rule 3: If total < 50 posts, capture 100%
    if (totalPosts < this.options.minPostsForFilter) {
      console.log(`📋 Rule 3: Total posts (${totalPosts}) < ${this.options.minPostsForFilter}, capturing 100%`);
      return posts;
    }

    // Rule 1: Check for TOP/featured posts
    const featuredPosts = posts.filter(p => p.isFeatured || p.isSticky);

    if (featuredPosts.length > 0) {
      console.log(`⭐ Rule 1: Found ${featuredPosts.length} featured/sticky posts`);
      return featuredPosts;
    }

    // Rule 2: Capture last 3 years
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - this.options.yearsToCapture);

    const recentPosts = posts.filter(p => {
      if (!p.published) return true; // Include if date unknown
      return p.published >= threeYearsAgo;
    });

    console.log(`📅 Rule 2: Found ${recentPosts.length} posts from last ${this.options.yearsToCapture} years`);
    return recentPosts;
  }

  /**
   * Find RSS/Atom feed URL
   */
  async _findFeed(_blogUrl) {
    try {
      const html = await this._fetchHTML(_blogUrl);
      const $ = cheerio.load(html);

      // Try standard feed autodiscovery
      const feedLinks = [
        $('link[type="application/rss+xml"]').attr('href'),
        $('link[type="application/atom+xml"]').attr('href'),
        $('link[rel="alternate"][type="application/rss+xml"]').attr('href'),
        $('link[rel="alternate"][type="application/atom+xml"]').attr('href')
      ].filter(Boolean);

      if (feedLinks.length > 0) {
        return this._makeAbsolute(feedLinks[0], blogUrl);
      }

      // Try common feed URLs
      const commonFeeds = [
        '/feed',
        '/rss',
        '/feed.xml',
        '/rss.xml',
        '/atom.xml',
        '/blog/feed',
        '/blog/rss'
      ];

      for (const feedPath of commonFeeds) {
        const feedUrl = new URL(feedPath, blogUrl).href;

        try {
          await axios.head(feedUrl, { timeout: 5000 });
          return feedUrl;
        } catch (_error) {
          // Feed doesn't exist, try next
        }
      }

      return null;

    } catch (_error) {
      console.warn(`⚠️ Could not find RSS feed for ${_blogUrl}`);
      return null;
    }
  }

  /**
   * Check if post is featured
   */
  _isFeatured(item) {
    return !!(
      item.featured === 'true' ||
      item.featured === '1' ||
      item.sticky === 'true' ||
      item.sticky === '1' ||
      (item.categories && item.categories.some(cat =>
        /featured|top|best|highlight/i.test(cat)
      ))
    );
  }

  /**
   * Check if post is sticky
   */
  _isSticky(item) {
    return !!(
      item.sticky === 'true' ||
      item.sticky === '1' ||
      item.wpPostDate // WordPress sticky indicator
    );
  }

  /**
   * Detect featured posts from HTML structure
   */
  _detectFeaturedFromHTML($, elem) {
    const $elem = $(elem);
    const $article = $elem.closest('article, .post, .entry');

    // Check for featured classes
    const featuredIndicators = [
      'featured',
      'sticky',
      'highlight',
      'top-post',
      'pinned'
    ];

    const classes = ($article.attr('class') || '').toLowerCase();

    return featuredIndicators.some(indicator => classes.includes(indicator));
  }

  /**
   * Extract slug from URL
   */
  _extractSlugFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Remove leading/trailing slashes and file extensions
      const slug = pathname
        .split('/')
        .filter(Boolean)
        .pop()
        .replace(/\.(html|php|aspx?)$/i, '');

      return slug || 'post';

    } catch (_error) {
      return 'post';
    }
  }

  /**
   * Check if URL is a valid blog post
   */
  _isValidPostUrl(url, blogUrl) {
    if (!url) return false;

    // Skip navigation, tags, categories, etc.
    const skipPatterns = [
      '/tag/',
      '/category/',
      '/author/',
      '/page/',
      '/search',
      '/archive',
      '#',
      'mailto:',
      'javascript:',
      '.jpg',
      '.png',
      '.gif',
      '.pdf'
    ];

    return !skipPatterns.some(pattern => url.includes(pattern));
  }

  /**
   * Make URL absolute
   */
  _makeAbsolute(url, baseUrl) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return new URL(url, baseUrl).href;
  }

  /**
   * Fetch HTML with retry
   */
  async _fetchHTML(url) {
    let lastError;

    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': this.options.userAgent,
            'Accept': 'text/html,application/xhtml+xml'
          },
          timeout: this.options.timeout
        });

        return response.data;

      } catch (_error) {
        lastError = error;

        if (attempt < this.options.maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Retry ${attempt}/${this.options.maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /**
   * Generate sources YAML from discovered posts
   */
  generateSourcesYAML(posts, options = {}) {
    const sources = posts.map((post, index) => ({
      id: options.idPrefix ? `${options.idPrefix}-${index + 1}` : `blog-${index + 1}`,
      title: post.title,
      type: 'blog',
      url: post.url,
      slug: post.slug,
      published: post.published ? post.published.toISOString() : null,
      featured: post.isFeatured || post.isSticky,
      categories: post.categories
    }));

    return {
      sources,
      metadata: {
        total_discovered: posts.length,
        discovery_date: new Date().toISOString(),
        rules_applied: this._getRulesApplied(posts)
      }
    };
  }

  /**
   * Get which rules were applied
   */
  _getRulesApplied(posts) {
    const rules = [];

    if (posts.length < this.options.minPostsForFilter) {
      rules.push('Rule 3: Capture 100% (total < 50)');
    } else if (posts.some(p => p.isFeatured || p.isSticky)) {
      rules.push('Rule 1: Capture featured/TOP posts');
    } else {
      rules.push(`Rule 2: Capture last ${this.options.yearsToCapture} years`);
    }

    return rules;
  }
}

export default BlogDiscovery;
