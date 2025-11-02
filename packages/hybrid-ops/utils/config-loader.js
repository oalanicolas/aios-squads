/**
 * @fileoverview Configuration Loader with Hot-Reload Support
 *
 * Loads heuristic configuration from YAML file and provides:
 * - Singleton configuration cache
 * - Hot-reload monitoring via fs.watch()
 * - Callback notifications when config changes
 * - Fallback to defaults on load failure
 *
 * Usage:
 *   const { getConfig, watchConfig } = require('./config-loader');
 *
 *   const config = getConfig();  // Load or get cached config
 *
 *   watchConfig((newConfig, oldConfig) => {
 *     console.log('Config changed!');
 *     // Recompile heuristics, invalidate caches, etc.
 *   });
 *
 * @module utils/config-loader
 */

const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

// Configuration file path (relative to this file)
const CONFIG_PATH = path.join(__dirname, '..', 'config', 'heuristics.yaml');

// Singleton configuration cache
let configCache = null;

// File system watcher for hot-reload
let configWatcher = null;

// Callbacks to invoke when config changes
const callbacks = [];

/**
 * Load configuration from YAML file
 *
 * @returns {Object|null} Parsed configuration or null if loading fails
 * @throws Does not throw - returns null on error and logs warning
 *
 * @example
 * const config = loadConfig();
 * if (!config) {
 *   console.warn('Using hardcoded defaults');
 * }
 */
function loadConfig() {
  try {
    // Check if config file exists
    if (!fs.existsSync(CONFIG_PATH)) {
      console.warn(`⚠️  Configuration file not found: ${CONFIG_PATH}`);
      console.log('⚠️  Falling back to hardcoded defaults');
      return null;
    }

    // Read file content
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');

    // Parse YAML
    configCache = yaml.parse(content);

    console.log('✓ Loaded configuration from:', CONFIG_PATH);

    // Log config version
    if (configCache?.version) {
      console.log(`  Config version: ${configCache.version}`);
    }

    return configCache;

  } catch (error) {
    console.error('❌ Failed to load configuration:', error.message);

    if (error.name === 'YAMLParseError') {
      console.error('  YAML syntax error at line:', error.linePos);
    }

    console.log('⚠️  Falling back to hardcoded defaults');
    configCache = null;
    return null;
  }
}

/**
 * Get current configuration (cached or load fresh)
 *
 * This is the primary function to use for accessing configuration.
 * It uses the cached config if available, or loads fresh if not.
 *
 * @returns {Object|null} Configuration object or null if unavailable
 *
 * @example
 * const config = getConfig();
 * if (config) {
 *   const weights = config.heuristics.PV_BS_001.weights;
 * }
 */
function getConfig() {
  if (!configCache) {
    return loadConfig();
  }
  return configCache;
}

/**
 * Watch configuration file for changes and trigger callbacks
 *
 * Enables hot-reload: when heuristics.yaml changes, all registered
 * callbacks are invoked with the new and old configurations.
 *
 * This allows the system to:
 * - Invalidate compiled heuristic caches
 * - Re-validate configuration
 * - Update agent behaviors without restart
 *
 * @param {Function} callback - Called when config changes: (newConfig, oldConfig) => void
 *
 * @example
 * watchConfig((newConfig, oldConfig) => {
 *   console.log('Config changed!');
 *   compiler.clearCache();  // Invalidate compiled heuristics
 * });
 */
function watchConfig(callback) {
  if (!callback || typeof callback !== 'function') {
    throw new Error('watchConfig requires a callback function');
  }

  // Add callback to list
  callbacks.push(callback);

  // If already watching, just add callback and return
  if (configWatcher) {
    console.log('⚠️  Config watcher already active (callback added)');
    return;
  }

  // Check if config file exists before watching
  if (!fs.existsSync(CONFIG_PATH)) {
    console.warn(`⚠️  Cannot watch non-existent file: ${CONFIG_PATH}`);
    console.log('  Callback registered but not actively watching');
    return;
  }

  // Start watching
  try {
    configWatcher = fs.watch(CONFIG_PATH, (eventType, filename) => {
      if (eventType === 'change') {
        console.log('🔄 Configuration file changed, reloading...');

        const oldConfig = configCache;
        configCache = null;  // Invalidate cache

        try {
          const newConfig = loadConfig();

          // Notify all callbacks
          callbacks.forEach(cb => {
            try {
              cb(newConfig, oldConfig);
            } catch (err) {
              console.error('❌ Config callback error:', err.message);
            }
          });

        } catch (error) {
          console.error('❌ Failed to reload config:', error.message);
          // Keep old config on reload failure
          configCache = oldConfig;
        }
      }
    });

    console.log('👁️  Watching configuration file for changes');

  } catch (error) {
    console.error('❌ Failed to start config watcher:', error.message);
  }
}

/**
 * Stop watching configuration file
 *
 * Cleans up file system watcher and clears all callbacks.
 * Useful for testing or graceful shutdown.
 *
 * @example
 * // Cleanup on shutdown
 * process.on('SIGINT', () => {
 *   unwatchConfig();
 *   process.exit(0);
 * });
 */
function unwatchConfig() {
  if (configWatcher) {
    configWatcher.close();
    configWatcher = null;
    callbacks.length = 0;
    console.log('✓ Stopped watching configuration file');
  }
}

/**
 * Reload configuration immediately (for testing)
 *
 * Forces a fresh load from disk, bypassing cache.
 * Useful for testing config changes without hot-reload.
 *
 * @returns {Object|null} Newly loaded configuration
 *
 * @example
 * // In tests
 * await writeTestConfig();
 * const config = reloadConfig();
 * assert(config.heuristics.PV_BS_001.weights.end_state_vision === 0.95);
 */
function reloadConfig() {
  configCache = null;
  return loadConfig();
}

/**
 * Get configuration file path (for testing/debugging)
 *
 * @returns {string} Absolute path to configuration file
 */
function getConfigPath() {
  return CONFIG_PATH;
}

/**
 * Check if configuration is currently loaded
 *
 * @returns {boolean} True if config is cached, false otherwise
 */
function isConfigLoaded() {
  return configCache !== null;
}

module.exports = {
  loadConfig,
  getConfig,
  watchConfig,
  unwatchConfig,
  reloadConfig,
  getConfigPath,
  isConfigLoaded
};
