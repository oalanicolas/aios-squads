/**
 * Social Media Collector
 * Collects Twitter threads, Reddit AMAs, LinkedIn posts
 */

import fs from 'fs/promises';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';
import axios from 'axios';
import sanitizeFilename from 'sanitize-filename';
import { randomUUID } from 'crypto';
import TurndownService from 'turndown';
import { MarkdownConverter } from '../utils/markdown-converter.js';
import { getMCPClient } from '../mcps/mcp-client.js';

const DEFAULT_HEADERS = {
  'User-Agent': 'AIOS-ETL-SocialCollector/1.0'
};

export class SocialCollector extends EventEmitter {
  constructor(downloadRules, httpClient = axios) {
    super();
    this.downloadRules = downloadRules;
    this.httpClient = httpClient;
    this.turndown = new TurndownService({
      codeBlockStyle: 'fenced',
      bulletListMarker: '-'
    });
    this.converter = new MarkdownConverter();
    this.mcpClientPromise = null;
  }

  async collect(source, outputDir) {
    this.emit('start', { source });

    const baseDir = this._resolveBaseDir(outputDir);
    const sourceSlug = sanitizeFilename(source.id || this._slugify(source.title || source.url));
    const sourceDir = path.join(baseDir, sourceSlug);
    await fs.mkdir(sourceDir, { recursive: true });

    try {
      const normalized = this._normalizeSource(source);
      const handler = this._resolveHandler(normalized.platform);

      this.emit('status', { source, phase: 'fetch', message: `Fetching data from ${normalized.platform}` });
      const content = await handler.call(this, normalized);

      this.emit('status', { source, phase: 'format', message: 'Formatting markdown output' });
      const markdown = this._formatAsMarkdown(content, normalized);

      const markdownPath = path.join(sourceDir, 'content.md');
      await fs.writeFile(markdownPath, markdown, 'utf-8');

      // Metadata already in YAML front matter of content.md

      const result = {
        source_id: normalized.id,
        platform: normalized.platform,
        markdown_path: markdownPath,
        stats: content.stats
      };

      this.emit('completed', { source, result });
      return result;
    } catch (error) {
      this.emit('error', { source, error });
      throw error;
    }
  }

  _resolveBaseDir(outputDir) {
    const savePath = this.downloadRules.social?.output?.save_path;
    if (savePath) {
      const dir = savePath.replace('{source_id}', '');
      return path.isAbsolute(dir) ? dir : path.join(outputDir, dir);
    }
    return path.join(outputDir, 'social');
  }

  _normalizeSource(source) {
    const url = source.url || '';
    const platform = source.platform
      || (url.includes('twitter.com') || url.includes('x.com') ? 'twitter'
        : url.includes('reddit.com') ? 'reddit'
          : url.includes('linkedin.com') ? 'linkedin'
            : 'unknown');

    if (platform === 'unknown') {
      throw new Error(`Unsupported social platform for URL: ${url}`);
    }

    return {
      ...source,
      platform,
      id: source.id || randomUUID(),
      url,
      max_items: source.max_items || this._defaultMaxItems(platform)
    };
  }

  _defaultMaxItems(platform) {
    const _rules = this.downloadRules.social || {};
    switch (platform) {
      case 'twitter':
        return rules.twitter?.max_tweets_per_thread || 100;
      case 'reddit':
        return rules.reddit?.max_comments || 1000;
      case 'linkedin':
        return rules.linkedin?.max_posts || 10;
      default:
        return 100;
    }
  }

  _resolveHandler(platform) {
    const handlers = {
      twitter: this._fetchTwitterThread,
      reddit: this._fetchRedditThread,
      linkedin: this._fetchLinkedInPost
    };

    const handler = handlers[platform];
    if (!handler) {
      throw new Error(`No handler implemented for platform ${platform}`);
    }
    return handler;
  }

  async _fetchTwitterThread(source) {
    const _rules = this.downloadRules.social?.twitter || {};
    const apifyEnabled = rules.prefer_apify !== false && await this._canUseApify();
    const useAPI = rules.prefer_api !== false && process.env.TWITTER_BEARER_TOKEN;

    if (apifyEnabled) {
      try {
        return await this._fetchTwitterViaApify(source, rules);
      } catch (apifyError) {
        this.emit('warning', { source, message: 'Apify actor failed, falling back to API/web', error: apifyError });
      }
    }

    try {
      if (useAPI) {
        return await this._fetchTwitterViaAPI(source, rules);
      }
    } catch (apiError) {
      this.emit('warning', { source, message: 'Twitter API failed, falling back to web scrape', error: apiError });
    }

    return this._fetchTwitterViaScraper(source, rules);
  }

  async _fetchTwitterViaApify(source, rules) {
    const match = source.url.match(/status\/(\d+)/);
    const tweetId = match ? match[1] : null;

    const actorId = rules.apify?.actor
      || this.downloadRules.social?.apify?.twitter_actor
      || 'apify/twitter-scraper';

    const input = {
      tweetId,
      tweetUrl: source.url,
      maxItems: source.max_items,
      maxTweets: source.max_items,
      includeReplies: rules.include_replies || false
    };

    const apifyResult = await this._runApifyActor(actorId, input, rules.apify);
    const datasetItems = (apifyResult?.items || apifyResult?.defaultDatasetItems || apifyResult || [])
      .slice(0, source.max_items);

    if (!datasetItems.length) {
      throw new Error('Apify actor returned no tweets for this URL');
    }

    const items = datasetItems.map(tweet => ({
      id: tweet.id_str || tweet.id,
      text: tweet.full_text || tweet.text || '',
      created_at: tweet.created_at || tweet.date || null,
      metrics: {
        retweets: tweet.retweet_count,
        likes: tweet.favorite_count,
        replies: tweet.reply_count
      },
      author: {
        username: tweet.user?.screen_name || tweet.username,
        name: tweet.user?.name || tweet.displayName,
        verified: tweet.user?.verified || tweet.verified
      }
    }));

    return {
      platform: 'twitter',
      url: source.url,
      items,
      metadata: {
        author: items[0]?.author?.username,
        display_name: items[0]?.author?.name,
        verified: items[0]?.author?.verified,
        total_tweets: items.length,
        collected_at: new Date().toISOString(),
        method: 'apify'
      },
      stats: {
        total_items: items.length,
        mentions: items.flatMap(tweet => tweet.text.match(/@[\w_]+/g) || [])
      }
    };
  }

  async _fetchTwitterViaAPI(source, rules) {
    const match = source.url.match(/status\/(\d+)/);
    if (!match) {
      throw new Error('Unable to determine tweet ID from URL');
    }

    const tweetId = match[1];
    const endpoint = `https://api.twitter.com/2/tweets/${tweetId}`;
    const params = {
      expansions: 'author_id,referenced_tweets.id',
      'tweet.fields': 'created_at,conversation_id,in_reply_to_user_id,public_metrics',
      'user.fields': 'name,username,verified'
    };

    const response = await this.httpClient.get(endpoint, {
      params,
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });

    const conversationId = response.data.data?.conversation_id;
    if (!conversationId) {
      throw new Error('Twitter API response missing conversation_id');
    }

    const conversationEndpoint = 'https://api.twitter.com/2/tweets/search/recent';
    const conversationParams = {
      query: `conversation_id:${conversationId}`,
      max_results: Math.min(source.max_items, 100),
      expansions: 'attachments.media_keys,author_id',
      'tweet.fields': 'created_at,public_metrics,referenced_tweets',
      'user.fields': 'name,username,verified'
    };

    const threadResponse = await this.httpClient.get(conversationEndpoint, {
      params: conversationParams,
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
      }
    });

    const tweets = threadResponse.data.data || [];
    const users = Object.fromEntries((threadResponse.data.includes?.users || []).map(user => [user.id, user]));

    const chain = tweets
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(tweet => ({
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        metrics: tweet.public_metrics,
        author: users[tweet.author_id]
      }));

    return {
      platform: 'twitter',
      url: source.url,
      items: chain,
      metadata: {
        author: chain[0]?.author?.username,
        display_name: chain[0]?.author?.name,
        verified: chain[0]?.author?.verified,
        total_tweets: chain.length,
        collected_at: new Date().toISOString(),
        method: 'api'
      },
      stats: {
        total_items: chain.length,
        mentions: chain.flatMap(tweet => tweet.text.match(/@[\w_]+/g) || [])
      }
    };
  }

  async _fetchTwitterViaScraper(source, rules) {
    if (!this.downloadRules.social?.twitter?.allow_scrape) {
      throw new Error('Twitter scraping is disabled in download rules');
    }

    const { data } = await this.httpClient.get(source.url, { headers: DEFAULT_HEADERS });
    const html = data;

    const tweets = this._extractTweetChainFromHTML(html, source.max_items);
    if (!tweets.length) {
      throw new Error('Unable to extract tweet chain from HTML');
    }

    return {
      platform: 'twitter',
      url: source.url,
      items: tweets,
      metadata: {
        author: tweets[0]?.author,
        verified: tweets[0]?.verified,
        total_tweets: tweets.length,
        collected_at: new Date().toISOString(),
        method: 'web'
      },
      stats: {
        total_items: tweets.length,
        mentions: tweets.flatMap(tweet => tweet.text.match(/@[\w_]+/g) || [])
      }
    };
  }

  _extractTweetChainFromHTML(html, maxItems) {
    const tweetRegex = /<article[^>]*>(.*?)<\/article>/gs;
    const authorRegex = /data-testid="User-Name"[^>]*>.*?<span[^>]*>(.*?)<\/span>/s;
    const textRegex = /data-testid="tweetText"[^>]*>(.*?)<\/div>/s;

    const tweets = [];
    let match;
    while ((match = tweetRegex.exec(html)) !== null && tweets.length < maxItems) {
      const article = match[1];
      const authorMatch = authorRegex.exec(article);
      const textMatch = textRegex.exec(article);

      if (!textMatch) continue;

      const text = this._cleanHtml(textMatch[1]);
      const author = authorMatch ? this._cleanHtml(authorMatch[1]) : 'Unknown';

      tweets.push({
        text,
        author,
        created_at: null
      });
    }

    return tweets;
  }

  async _fetchRedditThread(source) {
    const _rules = this.downloadRules.social?.reddit || {};
    const apifyEnabled = rules.prefer_apify !== false && await this._canUseApify();
    const preferAPI = rules.prefer_api !== false && process.env.REDDIT_CLIENT_ID;

    if (apifyEnabled) {
      try {
        return await this._fetchRedditViaApify(source, rules);
      } catch (apifyError) {
        this.emit('warning', { source, message: 'Apify Reddit actor falhou, usando API/JSON', error: apifyError });
      }
    }

    try {
      if (preferAPI) {
        return await this._fetchRedditViaAPI(source, rules);
      }
    } catch (apiError) {
      this.emit('warning', { source, message: 'Reddit API failed, falling back to JSON endpoint', error: apiError });
    }

    return this._fetchRedditViaJSON(source, rules);
  }

  async _fetchRedditViaApify(source, rules) {
    const actorId = rules.apify?.actor
      || this.downloadRules.social?.apify?.reddit_actor
      || 'apify/reddit-scraper';

    const input = {
      postUrl: source.url,
      maxDepth: 2,
      maxComments: source.max_items
    };

    const apifyResult = await this._runApifyActor(actorId, input, rules.apify);
    const commentsRaw = apifyResult?.comments
      || apifyResult?.items
      || apifyResult?.defaultDatasetItems
      || [];

    if (!commentsRaw.length) {
      throw new Error('Apify actor returned no Reddit comments');
    }

    const comments = commentsRaw.slice(0, source.max_items).map(comment => ({
      id: comment.id,
      author: comment.author,
      text: comment.text || comment.body || '',
      score: comment.score,
      created_at: comment.createdAt || comment.created_at || null,
      parent_id: comment.parentId || comment.parent_id || null
    }));

    const meta = apifyResult.post || apifyResult;

    return {
      platform: 'reddit',
      url: source.url,
      items: comments,
      metadata: {
        thread_title: meta.title,
        subreddit: meta.subreddit,
        author: meta.author,
        score: meta.score,
        total_comments: meta.totalComments || comments.length,
        collected_at: new Date().toISOString(),
        method: 'apify'
      },
      stats: {
        total_items: comments.length
      }
    };
  }

  async _fetchRedditViaAPI(source, rules) {
    const url = new URL(source.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const postId = pathParts[pathParts.indexOf('comments') + 1];

    const token = await this._getRedditToken();
    const endpoint = `https://oauth.reddit.com/comments/${postId}`;

    const response = await this.httpClient.get(endpoint, {
      headers: {
        ...DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`
      },
      params: {
        depth: 2,
        limit: Math.min(source.max_items, 500)
      }
    });

    return this._normalizeRedditResponse(response.data, source);
  }

  async _fetchRedditViaJSON(source, rules) {
    const jsonUrl = `${source.url.replace(/\/$/, '')}.json`;
    const response = await this.httpClient.get(jsonUrl, { headers: DEFAULT_HEADERS });
    return this._normalizeRedditResponse(response.data, source);
  }

  _normalizeRedditResponse(data, source) {
    const [postData, commentsData] = data;
    const post = postData.data.children[0].data;
    const comments = commentsData.data.children
      .filter(child => child.kind === 't1')
      .slice(0, source.max_items)
      .map(comment => ({
        id: comment.data.id,
        author: comment.data.author,
        text: comment.data.body,
        score: comment.data.score,
        created_at: new Date(comment.data.created_utc * 1000).toISOString(),
        parent_id: comment.data.parent_id
      }));

    return {
      platform: 'reddit',
      url: source.url,
      items: comments,
      metadata: {
        thread_title: post.title,
        subreddit: post.subreddit,
        author: post.author,
        score: post.score,
        total_comments: post.num_comments,
        collected_at: new Date().toISOString(),
        method: 'api'
      },
      stats: {
        total_items: comments.length
      }
    };
  }

  async _getRedditToken() {
    const auth = Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64');
    const response = await this.httpClient.post('https://www.reddit.com/api/v1/access_token', 'grant_type=client_credentials', {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': DEFAULT_HEADERS['User-Agent']
      }
    });

    return response.data.access_token;
  }

  async _fetchLinkedInPost(source) {
    const _rules = this.downloadRules.social?.linkedin || {};
    const apifyEnabled = rules.prefer_apify !== false && await this._canUseApify();

    if (apifyEnabled) {
      try {
        return await this._fetchLinkedInViaApify(source, rules);
      } catch (apifyError) {
        this.emit('warning', { source, message: 'Apify LinkedIn actor falhou, usando scraper local', error: apifyError });
      }
    }

    if (!rules.allow_scrape) {
      throw new Error('LinkedIn scraping is disabled in download rules');
    }

    const { data } = await this.httpClient.get(source.url, { headers: DEFAULT_HEADERS });
    const markdown = this.turndown.turndown(data);

    return {
      platform: 'linkedin',
      url: source.url,
      items: [{
        text: markdown,
        author: source.author || 'LinkedIn Author',
        created_at: null
      }],
      metadata: {
        author: source.author,
        collected_at: new Date().toISOString(),
        method: 'web'
      },
      stats: {
        total_items: 1
      }
    };
  }

  async _fetchLinkedInViaApify(source, rules) {
    const actorId = rules.apify?.actor
      || this.downloadRules.social?.apify?.linkedin_actor
      || 'apify/linkedin-profile-scraper';

    const input = {
      startUrls: [{ url: source.url }],
      maxResults: 1,
      includeComments: rules.include_comments || false
    };

    const apifyResult = await this._runApifyActor(actorId, input, rules.apify);
    const entries = apifyResult?.items
      || apifyResult?.defaultDatasetItems
      || apifyResult?.posts
      || [];

    if (!entries.length) {
      throw new Error('Apify actor returned no LinkedIn posts');
    }

    const post = entries[0];
    const text = post.text || post.summary || JSON.stringify(post, null, 2);
    const markdown = this.turndown.turndown(text);

    return {
      platform: 'linkedin',
      url: source.url,
      items: [{
        text: markdown,
        author: post.author || source.author || post.profileName,
        created_at: post.publishedAt || post.date || null
      }],
      metadata: {
        author: post.author || source.author,
        collected_at: new Date().toISOString(),
        method: 'apify'
      },
      stats: {
        total_items: 1
      }
    };
  }

  _formatAsMarkdown(content, source) {
    const frontmatter = this.converter.addFrontmatter('', {
      platform: content.platform,
      url: content.url,
      collected_at: content.metadata.collected_at,
      author: content.metadata.author,
      method: content.metadata.method,
      total_items: content.stats.total_items
    });

    const lines = [frontmatter, ''];

    if (content.metadata.thread_title) {
      lines.push(`# ${content.metadata.thread_title}`, '');
    } else if (source.title) {
      lines.push(`# ${source.title}`, '');
    }

    content.items.forEach((item, index) => {
      lines.push(`## Item ${index + 1}`, '');
      if (item.author) {
        lines.push(`**Author:** @${item.author}`, '');
      }
      if (item.created_at) {
        lines.push(`**Timestamp:** ${item.created_at}`, '');
      }
      if (item.score !== undefined) {
        lines.push(`**Score:** ${item.score}`, '');
      }

      lines.push(item.text.trim(), '');
    });

    return lines.join('\n');
  }

  _cleanHtml(html) {
    return this.turndown.turndown(html);
  }

  _slugify(value = '') {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'social-thread';
  }

  async _canUseApify() {
    if (this.downloadRules.social?.apify?.enabled === false) {
      return false;
    }

    if (!process.env.APIFY_TOKEN) {
      return false;
    }

    try {
      const client = await this._ensureMCPClient();
      return typeof client.isMCPAvailable === 'function' && client.isMCPAvailable('apify');
    } catch (error) {
      this.emit('warning', { source: null, message: 'Apify MCP unavailable', error });
      return false;
    }
  }

  async _ensureMCPClient() {
    if (!this.mcpClientPromise) {
      this.mcpClientPromise = getMCPClient();
    }
    return this.mcpClientPromise;
  }

  async _runApifyActor(actorId, input = {}, options = {}) {
    const client = await this._ensureMCPClient();

    if (typeof client.isMCPAvailable === 'function' && !client.isMCPAvailable('apify')) {
      throw new Error('Apify MCP is not enabled');
    }

    const timeout = options?.timeout_seconds
      || this.downloadRules.social?.apify?.timeout_seconds
      || 300;

    return client.call('apify', 'runActor', {
      actorId,
      input,
      options: {
        timeout
      }
    });
  }
}

export default SocialCollector;
