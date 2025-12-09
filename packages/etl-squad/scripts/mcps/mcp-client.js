/**
 * MCP Client
 * Generic Model Context Protocol client for calling MCP servers
 * Supports stdio communication with fallback to direct libraries
 */

import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export class MCPClient extends EventEmitter {
  constructor(configPath = null) {
    super();

    this.configPath = configPath || path.join(process.cwd(), 'config/mcp-config.yaml');
    this.config = null;
    this.activeMCPs = new Map();  // Map of MCP name -> process
    this.fallbackStrategies = new Map();
  }

  /**
   * Initialize client and load configuration
   */
  async initialize() {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf8');
      this.config = yaml.load(configContent);

      // Setup fallback strategies
      if (this.config.client?.fallback_strategy) {
        Object.entries(this.config.client.fallback_strategy).forEach(([mcp, fallbacks]) => {
          this.fallbackStrategies.set(mcp, fallbacks);
        });
      }

      this.emit('initialized');
      return true;
    } catch (_error) {
      this.emit('error', { phase: 'initialization', error });
      throw new Error(`Failed to initialize MCP client: ${error.message}`);
    }
  }

  /**
   * Check if MCP is available
   */
  isMCPAvailable(mcpName) {
    const mcpConfig = this.config?.mcps?.[mcpName];
    return mcpConfig && mcpConfig.enabled;
  }

  /**
   * Get MCP configuration
   */
  getMCPConfig(mcpName) {
    return this.config?.mcps?.[mcpName];
  }

  /**
   * Call MCP method
   * @param {string} mcpName - Name of MCP (e.g., 'assemblyai')
   * @param {string} method - Method to call (e.g., 'transcribe')
   * @param {object} params - Parameters for the method
   * @returns {Promise<any>} Result from MCP
   */
  async call(mcpName, method, params = {}) {
    const mcpConfig = this.getMCPConfig(mcpName);

    if (!mcpConfig) {
      throw new Error(`MCP '${mcpName}' not found in configuration`);
    }

    if (!mcpConfig.enabled) {
      return this._handleFallback(mcpName, method, params);
    }

    try {
      // Try MCP call
      const result = await this._callViaMCP(mcpName, mcpConfig, method, params);

      this.emit('call_success', { mcp: mcpName, method, params, result });
      return result;

    } catch (_error) {
      this.emit('call_error', { mcp: mcpName, method, params, error });

      // Try fallback if configured
      if (mcpConfig.priority === 'optional') {
        return this._handleFallback(mcpName, method, params);
      }

      throw error;
    }
  }

  /**
   * Call MCP via stdio communication
   */
  async _callViaMCP(mcpName, mcpConfig, method, params) {
    // Start MCP server if not already running
    if (!this.activeMCPs.has(mcpName)) {
      await this._startMCPServer(mcpName, mcpConfig);
    }

    const mcpProcess = this.activeMCPs.get(mcpName);

    // Create JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`MCP call timeout after ${mcpConfig.config?.timeout || 300}s`));
      }, (mcpConfig.config?.timeout || 300) * 1000);

      let responseData = '';

      // Listen for response
      const dataHandler = (data) => {
        responseData += data.toString();

        try {
          const response = JSON.parse(responseData);

          if (response.id === request.id) {
            clearTimeout(timeout);
            mcpProcess.stdout.off('data', dataHandler);

            if (response.error) {
              reject(new Error(response.error.message || 'MCP error'));
            } else {
              resolve(response.result);
            }
          }
        } catch (_e) {
          // Incomplete JSON, wait for more data
        }
      };

      mcpProcess.stdout.on('data', dataHandler);

      // Send request
      mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  /**
   * Start MCP server process
   */
  async _startMCPServer(mcpName, mcpConfig) {
    const command = mcpConfig.command;

    if (!command) {
      throw new Error(`No command specified for MCP '${mcpName}'`);
    }

    // Parse command (handle args)
    const parts = command.split(' ');
    const cmd = parts[0];
    const args = parts.slice(1);

    // Set environment variables
    const env = { ...process.env };

    // Add API keys if specified
    if (mcpConfig.config?.api_key_env) {
      const apiKey = process.env[mcpConfig.config.api_key_env];
      if (!apiKey && mcpConfig.priority === 'required') {
        throw new Error(`API key ${mcpConfig.config.api_key_env} not found in environment`);
      }
    }

    // Spawn process
    const mcpProcess = spawn(cmd, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env
    });

    // Handle process events
    mcpProcess.on('error', (_error) => {
      this.emit('mcp_error', { mcp: mcpName, error });
      this.activeMCPs.delete(mcpName);
    });

    mcpProcess.on('exit', (code) => {
      this.emit('mcp_exit', { mcp: mcpName, code });
      this.activeMCPs.delete(mcpName);
    });

    mcpProcess.stderr.on('data', (data) => {
      this.emit('mcp_stderr', { mcp: mcpName, data: data.toString() });
    });

    // Store process
    this.activeMCPs.set(mcpName, mcpProcess);

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.emit('mcp_started', { mcp: mcpName });
  }

  /**
   * Handle fallback when MCP is unavailable
   */
  async _handleFallback(mcpName, method, params) {
    const fallbacks = this.fallbackStrategies.get(mcpName) || [];

    for (const fallback of fallbacks) {
      if (fallback === 'none') {
        return null;  // Skip this operation
      }

      if (fallback === 'direct_library') {
        // Try to use direct library implementation
        return this._callDirectLibrary(mcpName, method, params);
      }

      // Try another MCP
      if (this.isMCPAvailable(fallback)) {
        try {
          return await this.call(fallback, method, params);
        } catch (_error) {
          // Continue to next fallback
          continue;
        }
      }
    }

    throw new Error(`No fallback available for MCP '${mcpName}' method '${method}'`);
  }

  /**
   * Call direct library instead of MCP
   * (Implementations specific to each MCP)
   */
  async _callDirectLibrary(mcpName, method, params) {
    switch (mcpName) {
      case 'pdf-reader':
        return this._directPDFRead(params);

      case 'web-fetch':
        return this._directWebFetch(params);

      case 'youtube-transcript':
        return this._directYouTubeTranscript(params);

      default:
        throw new Error(`No direct library fallback for MCP '${mcpName}'`);
    }
  }

  /**
   * Direct PDF reading using pdf-parse
   */
  async _directPDFRead(params) {
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = await fs.readFile(params.path);
    const pdf = await pdfParse(dataBuffer);

    return {
      text: pdf.text,
      numPages: pdf.numpages,
      metadata: pdf.metadata,
      info: pdf.info
    };
  }

  /**
   * Direct web fetch using axios
   */
  async _directWebFetch(params) {
    const axios = (await import('axios')).default;
    const response = await axios.get(params.url, {
      timeout: params.timeout || 30000,
      headers: params.headers || {}
    });

    return {
      data: response.data,
      status: response.status,
      headers: response.headers
    };
  }

  /**
   * Direct YouTube transcript using ytdl-core
   */
  async _directYouTubeTranscript(params) {
    const { YoutubeTranscript } = await import('youtube-transcript');
    const transcript = await YoutubeTranscript.fetchTranscript(params.videoId);

    return transcript;
  }

  /**
   * Cleanup - stop all MCP servers
   */
  async cleanup() {
    for (const [mcpName, mcpProcess] of this.activeMCPs.entries()) {
      try {
        mcpProcess.kill();
        this.emit('mcp_stopped', { mcp: mcpName });
      } catch (_error) {
        this.emit('error', { phase: 'cleanup', mcp: mcpName, error });
      }
    }

    this.activeMCPs.clear();
  }

  /**
   * Health check - verify MCP servers are running
   */
  async healthCheck() {
    const health = {};

    for (const [mcpName, mcpConfig] of Object.entries(this.config.mcps || {})) {
      if (!mcpConfig.enabled) {
        health[mcpName] = { status: 'disabled' };
        continue;
      }

      try {
        // Try a simple ping call
        await this.call(mcpName, 'ping', {});
        health[mcpName] = { status: 'healthy' };
      } catch (_error) {
        health[mcpName] = { status: 'unhealthy', error: error.message };
      }
    }

    return health;
  }

  /**
   * Get statistics about MCP usage
   */
  getStats() {
    return {
      activeMCPs: Array.from(this.activeMCPs.keys()),
      totalMCPs: Object.keys(this.config?.mcps || {}).length,
      enabledMCPs: Object.entries(this.config?.mcps || {})
        .filter(([_, config]) => config.enabled)
        .map(([name]) => name)
    };
  }
}

/**
 * Create and initialize singleton MCP client
 */
let globalClient = null;

export async function getMCPClient(configPath = null) {
  if (!globalClient) {
    globalClient = new MCPClient(configPath);
    await globalClient.initialize();
  }

  return globalClient;
}

/**
 * Cleanup on process exit
 */
process.on('exit', () => {
  if (globalClient) {
    globalClient.cleanup();
  }
});

process.on('SIGINT', () => {
  if (globalClient) {
    globalClient.cleanup();
  }
  process.exit();
});
