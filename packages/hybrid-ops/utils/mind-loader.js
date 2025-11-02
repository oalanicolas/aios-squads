/**
 * @fileoverview Pedro Valério Mind Loader
 *
 * Core infrastructure for loading Pedro Valério's cognitive architecture
 * and applying it to hybrid-ops agents for authentic task execution.
 *
 * Architecture Shift: Conversational Clone → Task-Executing Mind
 * - FROM: Personality emulation for dialogue
 * - TO: Operational algorithms driving agent decisions
 *
 * @module utils/mind-loader
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('yaml');
const { getConfig, watchConfig } = require('./config-loader');
const { validateConfig, formatValidationErrors } = require('./config-validator');
const { getCompiler } = require('./heuristic-compiler');
const { getLogger } = require('./logger');
const { getMetricsCollector } = require('./metrics-collector');

/**
 * Prioritized paths for Pedro Valério's mind components
 *
 * Priority 1: Co-located within hybrid-ops expansion pack (NEW)
 * Priority 2: External outputs/minds/ directory (LEGACY - backward compatibility)
 */
const MINDS_BASE_PATHS = [
  path.resolve(__dirname, '../minds/pedro_valerio'),           // NEW: Co-located (priority 1)
  path.resolve(__dirname, '../../../../outputs/minds/pedro_valerio')  // OLD: External (fallback)
];

/**
 * Relative paths to Pedro Valério's mind components
 */
const MIND_PATHS = {
  META_AXIOMAS: 'artifacts/META_AXIOMAS_DE_PEDRO_VALÉRIO.md',
  HEURISTICAS: 'artifacts/heurísticas_de_decisão_e_algoritmos_mentais_únicos.md',
  CLICKUP_PLAYBOOK: 'sources/documentos/Gestão ClickUp.md',
  SYSTEM_PROMPT: 'system_prompts/System_Prompt.md'
};

/**
 * Resolves the base path for Pedro Valério's mind using prioritized path resolution
 *
 * Priority 1: Co-located within hybrid-ops expansion pack (NEW)
 * Priority 2: External outputs/minds/ directory (LEGACY - backward compatibility)
 *
 * @returns {string} The resolved base path
 * @throws {Error} If mind not found in any location
 */
function resolveMindBasePath() {
  for (const basePath of MINDS_BASE_PATHS) {
    if (require('fs').existsSync(basePath)) {
      // Deprecation warning for legacy path (normalize path separators for cross-platform compatibility)
      const normalizedPath = basePath.replace(/\\/g, '/');
      if (normalizedPath.includes('outputs/minds')) {
        console.warn('⚠️  DEPRECATION: Mind loaded from external path (outputs/minds/pedro_valerio/).');
        console.warn('   Consider migrating to co-located path: hybrid-ops/minds/pedro_valerio/');
        console.warn('   See MIGRATION-REPORT.md for details.');
      }
      return basePath;
    }
  }

  // Clear error message when neither location exists
  throw new Error(
    `Mind 'pedro_valerio' not found in any location.\n` +
    `Searched paths:\n` +
    `  1. ${MINDS_BASE_PATHS[0]} (co-located)\n` +
    `  2. ${MINDS_BASE_PATHS[1]} (legacy)\n` +
    `Please ensure mind artifacts are installed. See INSTALLATION.md for setup instructions.`
  );
}

/**
 * Pedro Valério Mind Class
 *
 * Encapsulates the cognitive architecture extracted from 49 mind files.
 * Provides methods to load, compile, and apply PV's thinking patterns to agents.
 *
 * @class PedroValerioMind
 */
class PedroValerioMind {
  constructor() {
    this.loaded = false;
    this.metaAxiomas = null;
    this.heuristicas = null;
    this.clickupPlaybook = null;
    this.systemPrompt = null;

    // Configuration (loaded from heuristics.yaml)
    this.config = null;
    this.configSource = 'defaults'; // 'file', 'env', or 'defaults'

    // Compiled executable heuristics (via external compiler)
    this.futureBackCasting = null;
    this.coherenceScan = null;
    this.automationCheck = null;

    // Cache for performance
    this.cache = {
      artifacts: new Map(),
      compiledHeuristics: new Map()
    };

    // Heuristic compiler instance
    this.compiler = getCompiler();

    // Logger instance
    this.logger = getLogger();

    // Metrics collector instance
    this.metrics = getMetricsCollector();

    // Set up hot-reload for config changes
    this.setupConfigHotReload();
  }

  /**
   * Load all mind components from disk
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} If mind files cannot be loaded
   */
  async load() {
    const startTime = Date.now();
    const operationId = `mind_load_${Date.now()}`;

    if (this.loaded) {
      this.logger.debug('mind-loader', 'mind_already_loaded', { cached: true });
      this.metrics.recordCacheHit({ component: 'mind-loader', operation: 'load' });
      console.log('✅ Pedro Valério mind already loaded (using cache)');
      return;
    }

    // Start metrics timer for mind loading
    this.metrics.startTimer(operationId, 'mind_load', { cached: false });

    this.logger.info('mind-loader', 'mind_loading_started', {});
    console.log('🧠 Loading Pedro Valério mind components...');

    try {
      // STEP 1: Load configuration FIRST (before compiling heuristics)
      await this.loadConfiguration();

      // STEP 2: Load core artifacts
      this.metaAxiomas = await this.loadArtifact(MIND_PATHS.META_AXIOMAS);
      this.heuristicas = await this.loadArtifact(MIND_PATHS.HEURISTICAS);
      this.clickupPlaybook = await this.loadSource(MIND_PATHS.CLICKUP_PLAYBOOK);
      this.systemPrompt = await this.loadSystemPrompt(MIND_PATHS.SYSTEM_PROMPT);

      // STEP 3: Compile heuristics with configuration
      await this.compileHeuristics();

      this.loaded = true;
      const duration_ms = Date.now() - startTime;

      // End metrics timer
      this.metrics.endTimer(operationId, {
        config_source: this.configSource,
        compiled_heuristics: this.compiler.getStats().compiledCount,
        cached_artifacts: this.cache.artifacts.size
      });

      this.logger.info('mind-loader', 'mind_loaded', {
        success: true,
        duration_ms,
        config_source: this.configSource,
        compiled_heuristics: this.compiler.getStats().compiledCount,
        cached_artifacts: this.cache.artifacts.size
      });

      console.log('✅ Pedro Valério mind loaded successfully');
      console.log(`   - Configuration Source: ${this.configSource}`);
      console.log(`   - META_AXIOMAS: ${this.metaAxiomas ? '✓' : '✗'}`);
      console.log(`   - Heurísticas: ${this.heuristicas ? '✓' : '✗'}`);
      console.log(`   - ClickUp Playbook: ${this.clickupPlaybook ? '✓' : '✗'}`);
      console.log(`   - Compiled Heuristics: ${this.compiler.getStats().compiledCount}`);
    } catch (error) {
      const duration_ms = Date.now() - startTime;

      // End metrics timer with error
      this.metrics.endTimer(operationId, {
        error: error.message,
        success: false
      });

      this.logger.error('mind-loader', 'mind_loading_failed', {
        error: error.message,
        stack: error.stack,
        duration_ms
      });

      console.error('❌ Failed to load Pedro Valério mind:', error);
      throw new Error(`Mind loading failed: ${error.message}`);
    }
  }

  /**
   * Load and validate heuristics configuration
   *
   * @private
   * @async
   * @returns {Promise<void>}
   */
  async loadConfiguration() {
    console.log('   Loading heuristics configuration...');

    // Try to load config from file
    const fileConfig = getConfig();

    // Check for environment variable overrides
    const envConfig = this.applyEnvironmentOverrides(fileConfig);

    // Use env-overridden config if present, otherwise file config
    const config = envConfig || fileConfig;

    // Determine source
    if (envConfig) {
      this.configSource = 'env+file';
    } else if (fileConfig) {
      this.configSource = 'file';
    } else {
      this.configSource = 'defaults';
    }

    // Validate configuration if present
    if (config) {
      const validation = validateConfig(config);

      if (!validation.valid) {
        this.metrics.recordFallback('config_validation_failed', {
          component: 'mind-loader',
          errors_count: validation.errors.length,
          config_source: this.configSource
        });

        this.logger.warn('mind-loader', 'config_validation_failed', {
          errors: validation.errors,
          fallback: 'defaults'
        });

        console.error('❌ Configuration validation failed:');
        console.error(formatValidationErrors(validation.errors));
        console.log('⚠️  Falling back to hardcoded defaults');
        this.config = null;
        this.configSource = 'defaults';
      } else {
        this.logger.info('mind-loader', 'config_validated', {
          source: this.configSource
        });

        console.log('✓ Configuration validated successfully');
        this.config = config;
      }
    } else {
      this.logger.info('mind-loader', 'config_using_defaults', {
        reason: 'no_file_found'
      });

      console.log('  No configuration file found, using hardcoded defaults');
      this.config = null;
    }

    console.log(`  Configuration source: ${this.configSource}`);
  }

  /**
   * Apply environment variable overrides to configuration
   *
   * @private
   * @param {Object|null} baseConfig - Base configuration from file
   * @returns {Object|null} Configuration with env overrides applied
   */
  applyEnvironmentOverrides(baseConfig) {
    const env = process.env;

    // If no env vars are set, return null (no overrides)
    const hasEnvOverrides = Object.keys(env).some(key => key.startsWith('HEURISTIC_'));

    if (!hasEnvOverrides) {
      return null;
    }

    // Start with base config or empty structure
    const config = baseConfig ? JSON.parse(JSON.stringify(baseConfig)) : {
      version: '1.0',
      heuristics: {
        PV_BS_001: { weights: {}, thresholds: {} },
        PV_PA_001: { weights: {}, thresholds: {} },
        PV_PM_001: { weights: {}, thresholds: {} }
      },
      validation: {}
    };

    console.log('  Applying environment variable overrides...');

    // Example: HEURISTIC_BS001_END_STATE_WEIGHT=0.95
    // Maps to: config.heuristics.PV_BS_001.weights.end_state_vision
    const envMappings = {
      // PV_BS_001
      'HEURISTIC_BS001_END_STATE_WEIGHT': ['PV_BS_001', 'weights', 'end_state_vision'],
      'HEURISTIC_BS001_MARKET_WEIGHT': ['PV_BS_001', 'weights', 'current_market_signals'],
      'HEURISTIC_BS001_CONFIDENCE_THRESHOLD': ['PV_BS_001', 'thresholds', 'confidence'],
      'HEURISTIC_BS001_PRIORITY_THRESHOLD': ['PV_BS_001', 'thresholds', 'priority'],

      // PV_PA_001
      'HEURISTIC_PA001_TRUTHFULNESS_WEIGHT': ['PV_PA_001', 'weights', 'truthfulness'],
      'HEURISTIC_PA001_SYSTEM_WEIGHT': ['PV_PA_001', 'weights', 'system_adherence'],
      'HEURISTIC_PA001_SKILL_WEIGHT': ['PV_PA_001', 'weights', 'skill'],
      'HEURISTIC_PA001_VETO_THRESHOLD': ['PV_PA_001', 'thresholds', 'veto'],
      'HEURISTIC_PA001_APPROVE_THRESHOLD': ['PV_PA_001', 'thresholds', 'approve'],
      'HEURISTIC_PA001_REVIEW_THRESHOLD': ['PV_PA_001', 'thresholds', 'review'],

      // PV_PM_001
      'HEURISTIC_PM001_FREQUENCY_WEIGHT': ['PV_PM_001', 'weights', 'frequency'],
      'HEURISTIC_PM001_STANDARDIZATION_WEIGHT': ['PV_PM_001', 'weights', 'standardization'],
      'HEURISTIC_PM001_GUARDRAILS_WEIGHT': ['PV_PM_001', 'weights', 'guardrails'],
      'HEURISTIC_PM001_TIPPING_POINT': ['PV_PM_001', 'thresholds', 'tipping_point'],
      'HEURISTIC_PM001_STANDARDIZATION_THRESHOLD': ['PV_PM_001', 'thresholds', 'standardization'],
      'HEURISTIC_PM001_AUTOMATE_THRESHOLD': ['PV_PM_001', 'thresholds', 'automate'],

      // Validation
      'VALIDATION_STRICT_MODE': ['validation', 'strict_mode'],
      'VALIDATION_MINIMUM_SCORE': ['validation', 'minimum_score']
    };

    let overrideCount = 0;

    for (const [envKey, path] of Object.entries(envMappings)) {
      const value = env[envKey];

      if (value !== undefined) {
        // Parse value (handle boolean, number, string)
        let parsedValue;
        if (value === 'true') parsedValue = true;
        else if (value === 'false') parsedValue = false;
        else if (!isNaN(value)) parsedValue = parseFloat(value);
        else parsedValue = value;

        // Navigate to the target location and set value
        let target = config;
        for (let i = 0; i < path.length - 1; i++) {
          if (!target[path[i]]) {
            target[path[i]] = {};
          }
          target = target[path[i]];
        }
        target[path[path.length - 1]] = parsedValue;

        console.log(`    ${envKey} = ${parsedValue}`);
        overrideCount++;
      }
    }

    console.log(`  Applied ${overrideCount} environment variable override(s)`);
    return config;
  }

  /**
   * Set up hot-reload for configuration changes
   *
   * @private
   */
  setupConfigHotReload() {
    watchConfig((newConfig, oldConfig) => {
      this.logger.info('mind-loader', 'config_change_detected', {
        has_new_config: !!newConfig
      });

      console.log('🔄 Configuration changed, reloading heuristics...');

      // Validate new config
      if (newConfig) {
        const validation = validateConfig(newConfig);

        if (!validation.valid) {
          this.logger.warn('mind-loader', 'config_reload_validation_failed', {
            errors: validation.errors,
            action: 'keeping_old_config'
          });

          console.error('❌ New configuration is invalid:');
          console.error(formatValidationErrors(validation.errors));
          console.log('  Keeping old configuration');
          return;
        }
      }

      // Update config
      this.config = newConfig;
      this.configSource = newConfig ? 'file' : 'defaults';

      this.logger.info('mind-loader', 'config_reloaded', {
        source: this.configSource
      });

      // Invalidate compiler cache and recompile with new config
      if (this.loaded) {
        this.compiler.invalidateOnConfigChange(newConfig, true);

        // Recompile mind's heuristics
        this.compileHeuristics().catch(err => {
          this.logger.error('mind-loader', 'hot_reload_recompile_failed', {
            error: err.message
          });

          console.error('❌ Failed to recompile heuristics:', err.message);
        });
      }
    });
  }

  /**
   * Load an artifact file from the mind base directory
   *
   * @private
   * @param {string} relativePath - Path relative to mind base
   * @returns {Promise<Object>} Parsed artifact content
   */
  async loadArtifact(relativePath) {
    const cacheKey = `artifact:${relativePath}`;
    if (this.cache.artifacts.has(cacheKey)) {
      this.metrics.recordCacheHit({ component: 'mind-loader', artifact: relativePath });
      return this.cache.artifacts.get(cacheKey);
    }

    this.metrics.recordCacheMiss({ component: 'mind-loader', artifact: relativePath });

    const basePath = resolveMindBasePath();
    const fullPath = path.join(basePath, relativePath);
    console.log(`   Loading: ${relativePath}`);

    const content = await fs.readFile(fullPath, 'utf-8');
    const parsed = this.parseMarkdownArtifact(content);

    this.cache.artifacts.set(cacheKey, parsed);
    return parsed;
  }

  /**
   * Load a source document (not an artifact)
   *
   * @private
   * @param {string} relativePath - Path relative to mind base
   * @returns {Promise<Object>} Parsed document content
   */
  async loadSource(relativePath) {
    const cacheKey = `source:${relativePath}`;
    if (this.cache.artifacts.has(cacheKey)) {
      this.metrics.recordCacheHit({ component: 'mind-loader', source: relativePath });
      return this.cache.artifacts.get(cacheKey);
    }

    this.metrics.recordCacheMiss({ component: 'mind-loader', source: relativePath });

    const basePath = resolveMindBasePath();
    const fullPath = path.join(basePath, relativePath);
    console.log(`   Loading: ${relativePath}`);

    const content = await fs.readFile(fullPath, 'utf-8');
    const parsed = this.parseMarkdownArtifact(content);

    this.cache.artifacts.set(cacheKey, parsed);
    return parsed;
  }

  /**
   * Load system prompt
   *
   * @private
   * @param {string} relativePath - Path relative to mind base
   * @returns {Promise<string>} System prompt content
   */
  async loadSystemPrompt(relativePath) {
    const basePath = resolveMindBasePath();
    const fullPath = path.join(basePath, relativePath);
    console.log(`   Loading: ${relativePath}`);

    return await fs.readFile(fullPath, 'utf-8');
  }

  /**
   * Parse markdown artifact into structured data
   *
   * @private
   * @param {string} content - Raw markdown content
   * @returns {Object} Parsed structure
   */
  parseMarkdownArtifact(content) {
    const sections = {};
    let currentSection = null;
    let currentContent = [];

    const lines = content.split('\n');
    for (const line of lines) {
      // Detect headers
      if (line.startsWith('# ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.substring(2).trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }

    // Save last section
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    // Try to parse YAML blocks
    for (const [key, value] of Object.entries(sections)) {
      if (value.includes('```yaml') || value.includes('```yml')) {
        try {
          const yamlMatch = value.match(/```ya?ml\n([\s\S]*?)\n```/);
          if (yamlMatch) {
            sections[key] = yaml.parse(yamlMatch[1]);
          }
        } catch (e) {
          // Keep as string if YAML parsing fails
          console.warn(`   Warning: Could not parse YAML in section "${key}"`);
        }
      }
    }

    return sections;
  }

  /**
   * Compile heuristics using external heuristic-compiler with configuration
   *
   * @private
   * @async
   * @returns {Promise<void>}
   */
  async compileHeuristics() {
    const startTime = Date.now();
    const operationId = `heuristic_compilation_${Date.now()}`;

    console.log('   Compiling heuristics with configuration...');

    // Start metrics timer
    this.metrics.startTimer(operationId, 'heuristic_exec', {
      phase: 'compilation',
      count: 3
    });

    try {
      // Get heuristic configs from loaded configuration or use empty for defaults
      const bs001Config = this.config?.heuristics?.PV_BS_001 || {};
      const pa001Config = this.config?.heuristics?.PV_PA_001 || {};
      const pm001Config = this.config?.heuristics?.PV_PM_001 || {};

      // Compile using external heuristic-compiler
      // The compiler will use config values if provided, otherwise fall back to hardcoded defaults
      this.futureBackCasting = this.compiler.compile('PV_BS_001', bs001Config);
      this.coherenceScan = this.compiler.compile('PV_PA_001', pa001Config);
      this.automationCheck = this.compiler.compile('PV_PM_001', pm001Config);

      // Store in cache for backwards compatibility
      this.cache.compiledHeuristics.set('PV_BS_001', this.futureBackCasting);
      this.cache.compiledHeuristics.set('PV_PA_001', this.coherenceScan);
      this.cache.compiledHeuristics.set('PV_PM_001', this.automationCheck);

      const duration_ms = Date.now() - startTime;

      // End metrics timer
      this.metrics.endTimer(operationId, {
        source: this.configSource,
        heuristics: ['PV_BS_001', 'PV_PA_001', 'PV_PM_001']
      });

      this.logger.info('mind-loader', 'heuristics_compiled', {
        count: 3,
        source: this.configSource,
        duration_ms,
        heuristics: ['PV_BS_001', 'PV_PA_001', 'PV_PM_001']
      });

      console.log(`   ✓ Compiled 3 core heuristics (source: ${this.configSource})`);
    } catch (error) {
      const duration_ms = Date.now() - startTime;

      // End metrics timer with error
      this.metrics.endTimer(operationId, {
        error: error.message,
        success: false
      });

      this.logger.error('mind-loader', 'heuristic_compilation_failed', {
        error: error.message,
        duration_ms
      });

      throw error;
    }
  }

  /**
   * Apply Pedro Valério's mind to an agent
   *
   * Injects cognitive architecture into agent's decision-making logic.
   *
   * @param {Object} agent - Agent object to enhance
   * @returns {Object} Enhanced agent with PV cognitive layer
   */
  applyToAgent(agent) {
    if (!this.loaded) {
      throw new Error('Mind must be loaded before applying to agent. Call load() first.');
    }

    // Inject cognitive layer
    agent.cognitiveLayer = {
      metaAxiomas: this.metaAxiomas,
      heuristicas: this.heuristicas,
      clickupPlaybook: this.clickupPlaybook,
      systemPrompt: this.systemPrompt
    };

    // Inject decision functions
    agent.decisionFunctions = {
      futureBackCasting: this.futureBackCasting,
      coherenceScan: this.coherenceScan,
      automationCheck: this.automationCheck
    };

    // Inject validation rules
    agent.validationRules = {
      clickup: this.extractClickUpRules(),
      taskAnatomy: this.extractTaskAnatomyRules()
    };

    console.log(`✅ Applied Pedro Valério mind to agent: ${agent.id || agent.name || 'unknown'}`);

    return agent;
  }

  /**
   * Extract ClickUp rules from playbook
   *
   * @private
   * @returns {Object} ClickUp validation rules
   */
  extractClickUpRules() {
    // Extract anti-patterns and best practices from ClickUp playbook
    return {
      antiPatterns: [
        'multiple_assignees_single_task',
        'missing_time_estimate',
        'vague_acceptance_criteria',
        'lack_of_documentation'
      ],
      taskAnatomy: [
        'task_name',
        'status',
        'responsible_executor',
        'execution_type',
        'estimated_time',
        'input',
        'output',
        'action_items',
        'acceptance_criteria'
      ]
    };
  }

  /**
   * Extract task anatomy validation rules
   *
   * @private
   * @returns {Object} Task anatomy rules
   */
  extractTaskAnatomyRules() {
    return {
      required_fields: [
        'task_name',
        'status',
        'responsible_executor',
        'execution_type',
        'estimated_time',
        'input',
        'output',
        'action_items',
        'acceptance_criteria'
      ],
      executor_types: ['Humano', 'Agente', 'Clone'],
      execution_types: ['100% Humano', 'Híbrido', '100% Agente'],
      rules: [
        'one_task_one_executor',
        'must_have_time_estimate',
        'clear_input_output',
        'actionable_items',
        'measurable_criteria'
      ]
    };
  }

  /**
   * Get mind metadata
   *
   * @returns {Object} Mind metadata and status
   */
  getMetadata() {
    return {
      loaded: this.loaded,
      components: {
        metaAxiomas: !!this.metaAxiomas,
        heuristicas: !!this.heuristicas,
        clickupPlaybook: !!this.clickupPlaybook,
        systemPrompt: !!this.systemPrompt
      },
      compiledHeuristics: {
        futureBackCasting: !!this.futureBackCasting,
        coherenceScan: !!this.coherenceScan,
        automationCheck: !!this.automationCheck
      },
      cacheSize: {
        artifacts: this.cache.artifacts.size,
        compiledHeuristics: this.cache.compiledHeuristics.size
      }
    };
  }
}

/**
 * Singleton instance
 */
let mindInstance = null;

/**
 * Get or create the Pedro Valério mind singleton
 *
 * @returns {PedroValerioMind} Mind instance
 */
function getMind() {
  if (!mindInstance) {
    mindInstance = new PedroValerioMind();
  }
  return mindInstance;
}

/**
 * Load and get the Pedro Valério mind (convenience function)
 *
 * @async
 * @returns {Promise<PedroValerioMind>} Loaded mind instance
 */
async function loadMind() {
  const mind = getMind();
  await mind.load();
  return mind;
}

module.exports = {
  PedroValerioMind,
  getMind,
  loadMind,
  MIND_PATHS
};
