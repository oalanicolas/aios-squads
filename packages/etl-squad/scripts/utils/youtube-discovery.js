/**
 * YouTube Discovery - Smart Video Collection
 *
 * Discovers videos from:
 * - Single video URLs
 * - Channel URLs (fetches all videos or recent)
 * - Playlist URLs (fetches all videos)
 *
 * Smart Rules:
 * 1. Single video → collect that video
 * 2. Channel with < 50 videos → collect 100%
 * 3. Channel with >= 50 videos → collect last 3 years
 * 4. Playlist → collect all videos in playlist
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class YouTubeDiscovery {
  constructor(options = {}) {
    this.options = {
      minVideosForFilter: options.minVideosForFilter || 50,
      yearsToCapture: options.yearsToCapture || 3,
      maxRetries: options.maxRetries || 2,
      timeout: options.timeout || 60000, // 1 minute for yt-dlp
      ...options
    };
  }

  /**
   * Discover videos from URL (single, channel, or playlist)
   */
  async discoverVideos(url) {
    console.log(`🔍 Analyzing YouTube URL: ${url}\n`);

    const urlType = this._identifyUrlType(url);
    console.log(`📊 Type detected: ${urlType.type}\n`);

    let videos = [];

    switch (urlType.type) {
      case 'video':
        videos = await this._fetchSingleVideo(url);
        break;

      case 'channel':
        videos = await this._fetchChannelVideos(url, urlType.channelId);
        break;

      case 'playlist':
        videos = await this._fetchPlaylistVideos(url, urlType.playlistId);
        break;

      default:
        throw new Error(`Unsupported YouTube URL type: ${url}`);
    }

    console.log(`📊 Total videos found: ${videos.length}\n`);

    // Apply smart rules
    const selectedVideos = this._applySmartRules(videos, urlType.type);

    console.log(`✅ Selected ${selectedVideos.length} videos after applying smart rules\n`);

    return selectedVideos;
  }

  /**
   * Identify URL type (video, channel, or playlist)
   */
  _identifyUrlType(url) {
    // Single video: youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID
    const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (videoMatch) {
      return { type: 'video', videoId: videoMatch[1] };
    }

    // Channel: youtube.com/@channelname or youtube.com/c/channelname or youtube.com/channel/CHANNEL_ID
    const channelMatch = url.match(/youtube\.com\/(?:@|c\/|channel\/)([^/?]+)/);
    if (channelMatch) {
      return { type: 'channel', channelId: channelMatch[1] };
    }

    // Playlist: youtube.com/playlist?list=PLAYLIST_ID
    const playlistMatch = url.match(/youtube\.com\/playlist\?list=([^&]+)/);
    if (playlistMatch) {
      return { type: 'playlist', playlistId: playlistMatch[1] };
    }

    return { type: 'unknown' };
  }

  /**
   * Fetch single video metadata
   */
  async _fetchSingleVideo(url) {
    console.log('⏬ Fetching single video metadata...');

    try {
      const cmd = `yt-dlp --dump-json --no-playlist "${url}"`;
      const { stdout } = await execPromise(cmd, {
        timeout: this.options.timeout,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      const metadata = JSON.parse(stdout);
      const video = this._parseVideoMetadata(metadata);

      console.log(`   ✅ ${video.title}\n`);

      return [video];
    } catch (error) {
      throw new Error(`Failed to fetch video metadata: ${error.message}`);
    }
  }

  /**
   * Fetch channel videos
   */
  async _fetchChannelVideos(url, channelId) {
    console.log(`⏬ Fetching channel videos for: ${channelId}...`);

    try {
      // Use yt-dlp to get all videos from channel (JSON format)
      const cmd = `yt-dlp --dump-json --flat-playlist --playlist-end 500 "${url}/videos"`;
      const { stdout } = await execPromise(cmd, {
        timeout: this.options.timeout * 3, // 3x timeout for channels
        maxBuffer: 50 * 1024 * 1024 // 50MB buffer
      });

      // Parse NDJSON (one JSON per line)
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const videos = lines.map(line => {
        try {
          const metadata = JSON.parse(line);
          return this._parseVideoMetadata(metadata);
        } catch (parseError) {
          console.warn(`   ⚠️  Failed to parse video metadata: ${parseError.message}`);
          return null;
        }
      }).filter(v => v !== null);

      console.log(`   ✅ Found ${videos.length} videos\n`);

      return videos;
    } catch (error) {
      throw new Error(`Failed to fetch channel videos: ${error.message}`);
    }
  }

  /**
   * Fetch playlist videos
   */
  async _fetchPlaylistVideos(url, playlistId) {
    console.log(`⏬ Fetching playlist videos for: ${playlistId}...`);

    try {
      // Use yt-dlp to get all videos from playlist (JSON format)
      const cmd = `yt-dlp --dump-json --flat-playlist "${url}"`;
      const { stdout } = await execPromise(cmd, {
        timeout: this.options.timeout * 2, // 2x timeout for playlists
        maxBuffer: 30 * 1024 * 1024 // 30MB buffer
      });

      // Parse NDJSON
      const lines = stdout.trim().split('\n').filter(line => line.trim());
      const videos = lines.map(line => {
        try {
          const metadata = JSON.parse(line);
          return this._parseVideoMetadata(metadata);
        } catch (parseError) {
          console.warn(`   ⚠️  Failed to parse video metadata: ${parseError.message}`);
          return null;
        }
      }).filter(v => v !== null);

      console.log(`   ✅ Found ${videos.length} videos\n`);

      return videos;
    } catch (error) {
      throw new Error(`Failed to fetch playlist videos: ${error.message}`);
    }
  }

  /**
   * Parse video metadata from yt-dlp JSON output
   */
  _parseVideoMetadata(metadata) {
    const videoId = metadata.id || metadata.url?.match(/(?:v=|\/)([\w-]{11})/)?.[1];
    const uploadDate = metadata.upload_date || metadata.timestamp;

    // Parse upload_date from YYYYMMDD format
    let publishedDate = null;
    if (uploadDate) {
      if (typeof uploadDate === 'string' && uploadDate.length === 8) {
        const year = uploadDate.substring(0, 4);
        const month = uploadDate.substring(4, 6);
        const day = uploadDate.substring(6, 8);
        publishedDate = new Date(`${year}-${month}-${day}`);
      } else if (typeof uploadDate === 'number') {
        publishedDate = new Date(uploadDate * 1000);
      }
    }

    return {
      url: metadata.webpage_url || metadata.url || `https://www.youtube.com/watch?v=${videoId}`,
      title: metadata.title || `YouTube Video ${videoId}`,
      videoId,
      published: publishedDate,
      duration: metadata.duration || 0,
      channel: metadata.channel || metadata.uploader || 'Unknown',
      channelId: metadata.channel_id || metadata.uploader_id,
      viewCount: metadata.view_count || 0,
      description: metadata.description || '',
      isFeatured: false // YouTube doesn't have featured videos concept
    };
  }

  /**
   * Apply smart rules to filter videos
   */
  _applySmartRules(videos, urlType) {
    // Rule 1: Single video → always return it
    if (urlType === 'video') {
      console.log(`📋 Rule 1: Single video, collecting 1 video`);
      return videos;
    }

    // Rule 4: Playlist → collect all videos
    if (urlType === 'playlist') {
      console.log(`📋 Rule 4: Playlist, collecting all ${videos.length} videos`);
      return videos;
    }

    // Rules for channels:
    const totalVideos = videos.length;

    // Rule 2: If total < 50, capture 100%
    if (totalVideos < this.options.minVideosForFilter) {
      console.log(`📋 Rule 2: Channel has ${totalVideos} videos (< ${this.options.minVideosForFilter}), capturing 100%`);
      return videos;
    }

    // Rule 3: Capture last N years
    const yearsAgo = new Date();
    yearsAgo.setFullYear(yearsAgo.getFullYear() - this.options.yearsToCapture);

    const recentVideos = videos.filter(v => {
      if (!v.published) return true; // Include if date unknown
      return v.published >= yearsAgo;
    });

    console.log(`📋 Rule 3: Channel has ${totalVideos} videos, capturing ${recentVideos.length} from last ${this.options.yearsToCapture} years`);

    return recentVideos;
  }

  /**
   * Generate sources YAML for ETL collection
   */
  generateSourcesYAML(videos, options = {}) {
    const idPrefix = options.idPrefix || 'youtube';

    const sources = videos.map((video, index) => ({
      id: `${idPrefix}-${video.videoId}`,
      title: video.title,
      type: 'youtube',
      url: video.url,
      slug: this._slugify(video.title),
      published: video.published ? video.published.toISOString() : null,
      video_id: video.videoId,
      channel: video.channel,
      channel_id: video.channelId,
      duration: video.duration,
      view_count: video.viewCount,
      language: options.language || 'en',
      diarization: options.diarization || {
        expected_speakers: 2
      }
    }));

    const rulesApplied = this._getRulesApplied(videos);

    return {
      sources,
      metadata: {
        total_discovered: videos.length,
        discovery_date: new Date().toISOString(),
        rules_applied: rulesApplied
      }
    };
  }

  /**
   * Get rules that were applied (for metadata)
   */
  _getRulesApplied(videos) {
    const rules = [];

    if (videos.length === 1) {
      rules.push('Rule 1: Single video');
    } else if (videos.length < this.options.minVideosForFilter) {
      rules.push(`Rule 2: Capture 100% (total < ${this.options.minVideosForFilter})`);
    } else {
      rules.push(`Rule 3: Last ${this.options.yearsToCapture} years`);
    }

    return rules;
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

export default YouTubeDiscovery;
