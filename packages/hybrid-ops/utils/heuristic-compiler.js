/**
 * @fileoverview Heuristic Compiler
 *
 * Compiles Pedro Valério's decision heuristics from YAML/Markdown artifacts
 * into executable JavaScript functions that can be used by agents.
 *
 * Supports heuristics:
 * - PV_BS_001: Future System Back-Casting
 * - PV_PA_001: Systemic Coherence Scan
 * - PV_PM_001: Automation Tipping Point
 * - Custom heuristics following the same pattern
 *
 * @module utils/heuristic-compiler
 */

const { getLogger } = require('./logger');
const { getMetricsCollector } = require('./metrics-collector');

/**
 * Heuristic Registry
 *
 * Predefined compilation templates for known heuristics.
 * Each template defines how to transform heuristic config into executable code.
 */
const HEURISTIC_TEMPLATES = {
  /**
   * PV_BS_001: Future System Back-Casting
   *
   * Algorithm: Design from desired end-state backwards
   * Input: end_state_vision (0.9 weight), current_market_signals (0.1 weight)
   * Output: Priority (HIGH/MEDIUM/LOW), confidence, recommendation
   */
  PV_BS_001: {
    name: 'Future System Back-Casting',
    domain: 'business_strategy',
    compile: (config) => {
      const endStateWeight = config?.weights?.end_state_vision || 0.9;
      const marketWeight = config?.weights?.current_market_signals || 0.1;
      const confidenceThreshold = config?.thresholds?.confidence || 0.8;
      const priorityThreshold = config?.thresholds?.priority || 0.8;

      return (context) => {
        // Validate inputs
        if (!context) {
          return { error: 'Context required for back-casting' };
        }

        // Extract scores (0-1 scale)
        const endStateScore = context.endStateVision?.clarity || context.endStateClarity || 0;
        const marketScore = context.marketSignals?.alignment || context.marketAlignment || 0;

        // Calculate weighted priority
        const priorityScore = (endStateScore * endStateWeight) + (marketScore * marketWeight);

        // Determine priority level
        let priority = 'LOW';
        if (priorityScore >= priorityThreshold) {
          priority = 'HIGH';
        } else if (priorityScore >= priorityThreshold * 0.625) { // 0.5 midpoint
          priority = 'MEDIUM';
        }

        // Determine confidence based on end-state clarity
        const confidence = endStateScore >= confidenceThreshold ? 'high' :
                          endStateScore >= 0.5 ? 'medium' : 'low';

        // Generate recommendation
        let recommendation = 'REVIEW';
        if (priorityScore >= priorityThreshold && confidence === 'high') {
          recommendation = 'PROCEED';
        } else if (priorityScore < 0.4) {
          recommendation = 'DEFER';
        }

        return {
          heuristic: 'PV_BS_001',
          priority,
          score: priorityScore,
          confidence,
          recommendation,
          breakdown: {
            endStateContribution: endStateScore * endStateWeight,
            marketContribution: marketScore * marketWeight,
            endStateClarity: endStateScore,
            marketAlignment: marketScore
          },
          metadata: {
            decisionSpeed: priorityScore >= confidenceThreshold ? '< 1 hora' : '1-3 dias',
            accuracyEstimate: confidence === 'high' ? '85%' : confidence === 'medium' ? '70%' : '50%',
            timeHorizon: '3-5 anos'
          }
        };
      };
    }
  },

  /**
   * PV_PA_001: Systemic Coherence Scan
   *
   * Algorithm: Assess people based on coherence, system fit, and skills
   * Input: truthfulness (1.0 weight - VETO), system_adherence (0.8), skill (0.3)
   * Output: Coherence score, veto flag, recommendation (APPROVE/REVIEW/REJECT)
   */
  PV_PA_001: {
    name: 'Systemic Coherence Scan',
    domain: 'people_assessment',
    compile: (config) => {
      const truthfulnessWeight = config?.weights?.truthfulness || 1.0;
      const systemWeight = config?.weights?.system_adherence || 0.8;
      const skillWeight = config?.weights?.skill || 0.3;
      const vetoThreshold = config?.thresholds?.veto || 0.7;
      const approveThreshold = config?.thresholds?.approve || 0.8;
      const reviewThreshold = config?.thresholds?.review || 0.6;

      return (person) => {
        // Validate inputs
        if (!person) {
          return { error: 'Person object required for coherence scan' };
        }

        // Extract scores (0-1 scale)
        const truthfulness = person.truthfulness || person.truthfulnessCoherence || 0;
        const systemAdherence = person.systemAdherence || person.systemAdherencePotential || 0;
        const skill = person.skill || person.technicalSkill || 0;

        // Check VETO condition (truthfulness below threshold)
        if (truthfulness < vetoThreshold) {
          return {
            heuristic: 'PV_PA_001',
            score: 0,
            veto: true,
            vetoReason: `TRUTHFULNESS_BELOW_THRESHOLD (${truthfulness.toFixed(2)} < ${vetoThreshold})`,
            recommendation: 'REJECT',
            breakdown: {
              truthfulness,
              systemAdherence,
              skill
            },
            metadata: {
              vetoPower: 'TRUTHFULNESS',
              criticalFailure: true
            }
          };
        }

        // Calculate weighted coherence score
        const totalWeight = truthfulnessWeight + systemWeight + skillWeight;
        const coherenceScore = (
          (truthfulness * truthfulnessWeight) +
          (systemAdherence * systemWeight) +
          (skill * skillWeight)
        ) / totalWeight;

        // Determine recommendation
        let recommendation = 'REJECT';
        if (coherenceScore >= approveThreshold) {
          recommendation = 'APPROVE';
        } else if (coherenceScore >= reviewThreshold) {
          recommendation = 'REVIEW';
        }

        return {
          heuristic: 'PV_PA_001',
          score: coherenceScore,
          veto: false,
          recommendation,
          breakdown: {
            truthfulness: truthfulness,
            truthfulnessWeighted: truthfulness * truthfulnessWeight,
            systemAdherence: systemAdherence,
            systemAdherenceWeighted: systemAdherence * systemWeight,
            skill: skill,
            skillWeighted: skill * skillWeight
          },
          metadata: {
            hierarchyRank: coherenceScore >= 0.9 ? 'EXCELLENT' :
                           coherenceScore >= 0.8 ? 'GOOD' :
                           coherenceScore >= 0.6 ? 'ACCEPTABLE' : 'POOR',
            criticalFactors: [
              truthfulness >= 0.9 ? 'High truthfulness ✓' : truthfulness < vetoThreshold ? 'Low truthfulness ✗' : null,
              systemAdherence >= 0.8 ? 'Good system fit ✓' : systemAdherence < 0.5 ? 'Poor system fit ✗' : null,
              skill >= 0.8 ? 'Strong skills ✓' : null
            ].filter(Boolean)
          }
        };
      };
    }
  },

  /**
   * PV_PM_001: Automation Tipping Point
   *
   * Algorithm: Determine if task should be automated
   * Input: frequency (0.7 weight, >2 = tipping point), standardization (0.9), guardrails (1.0 - VETO)
   * Output: Automation readiness, tipping point flag, recommendation
   */
  PV_PM_001: {
    name: 'Automation Tipping Point',
    domain: 'process_management',
    compile: (config) => {
      const frequencyWeight = config?.weights?.frequency || 0.7;
      const standardizationWeight = config?.weights?.standardization || 0.9;
      const guardrailsWeight = config?.weights?.guardrails || 1.0;
      const tippingPointFrequency = config?.thresholds?.tipping_point || 2;
      const standardizationMinimum = config?.thresholds?.standardization || 0.7;
      const automateThreshold = config?.thresholds?.automate || 0.75;

      return (task) => {
        // Validate inputs
        if (!task) {
          return { error: 'Task object required for automation check' };
        }

        // Extract values
        const frequency = task.executionsPerMonth || task.frequency || 0;
        const standardizable = task.standardizable || task.standardization || 0;
        const hasGuardrails = task.hasGuardrails !== undefined ? task.hasGuardrails :
                             task.guardrails !== undefined ? task.guardrails : false;

        // Check VETO condition (missing guardrails)
        if (!hasGuardrails) {
          return {
            heuristic: 'PV_PM_001',
            readyToAutomate: false,
            tippingPoint: frequency > tippingPointFrequency,
            score: 0,
            veto: true,
            vetoReason: 'MISSING_GUARDRAILS - Cannot automate without safety mechanisms',
            recommendation: 'ADD_GUARDRAILS_FIRST',
            breakdown: {
              frequency,
              standardizable,
              hasGuardrails
            },
            metadata: {
              vetoPower: 'GUARDRAILS',
              criticalFailure: true,
              nextSteps: [
                'Define error handling procedures',
                'Create validation checkpoints',
                'Establish rollback mechanisms',
                'Document edge cases'
              ]
            }
          };
        }

        // Check tipping point
        const tippingPoint = frequency > tippingPointFrequency;

        // Calculate automation score
        // Normalize frequency (0-1 scale, assuming max 20 executions/month)
        const normalizedFrequency = Math.min(frequency / 20, 1);

        const totalWeight = frequencyWeight + standardizationWeight + guardrailsWeight;
        const automationScore = (
          (normalizedFrequency * frequencyWeight) +
          (standardizable * standardizationWeight) +
          (hasGuardrails ? guardrailsWeight : 0)
        ) / totalWeight;

        // Determine readiness
        const readyToAutomate = tippingPoint &&
                               standardizable >= standardizationMinimum &&
                               hasGuardrails;

        // Generate recommendation
        let recommendation = 'KEEP_MANUAL';
        if (automationScore >= automateThreshold && readyToAutomate) {
          recommendation = 'AUTOMATE_NOW';
        } else if (automationScore >= 0.5 && tippingPoint) {
          recommendation = 'PLAN_AUTOMATION';
        } else if (tippingPoint && !readyToAutomate) {
          recommendation = standardizable < standardizationMinimum ?
            'STANDARDIZE_FIRST' : 'ADD_GUARDRAILS';
        }

        return {
          heuristic: 'PV_PM_001',
          readyToAutomate,
          tippingPoint,
          score: automationScore,
          veto: false,
          recommendation,
          breakdown: {
            frequency,
            frequencyNormalized: normalizedFrequency,
            frequencyWeighted: normalizedFrequency * frequencyWeight,
            standardizable,
            standardizableWeighted: standardizable * standardizationWeight,
            hasGuardrails,
            guardrailsWeighted: hasGuardrails ? guardrailsWeight : 0
          },
          metadata: {
            roi_estimate: readyToAutomate ? 'HIGH' : tippingPoint ? 'MEDIUM' : 'LOW',
            timeToAutomate: standardizable >= 0.9 ? '1-2 weeks' :
                           standardizable >= 0.7 ? '2-4 weeks' : '1-2 months',
            riskLevel: hasGuardrails ? 'LOW' : 'HIGH',
            annualSavings: frequency * 12 // months saved per year if automated
          }
        };
      };
    }
  }
};

/**
 * Heuristic Compiler Class
 *
 * Compiles decision heuristics into executable functions.
 *
 * @class HeuristicCompiler
 */
class HeuristicCompiler {
  constructor() {
    this.compiledHeuristics = new Map();
    this.customTemplates = new Map();

    // Logger instance for compilation events
    this.logger = getLogger();

    // Metrics collector instance
    this.metrics = getMetricsCollector();
  }

  /**
   * Compile a heuristic from configuration
   *
   * @param {string} heuristicId - Heuristic ID (e.g., "PV_BS_001")
   * @param {Object} config - Heuristic configuration (weights, thresholds)
   * @returns {Function} Compiled heuristic function
   * @throws {Error} If heuristic ID is unknown and no custom template exists
   */
  compile(heuristicId, config = {}) {
    const startTime = Date.now();

    // Check cache
    if (this.compiledHeuristics.has(heuristicId)) {
      this.metrics.recordCacheHit({ component: 'heuristic-compiler', heuristic_id: heuristicId });
      this.logger.debug('heuristic-compiler', 'cache_hit', {
        heuristic_id: heuristicId
      });
      console.log(`✓ Using cached heuristic: ${heuristicId}`);
      return this.compiledHeuristics.get(heuristicId);
    }

    this.metrics.recordCacheMiss({ component: 'heuristic-compiler', heuristic_id: heuristicId });

    // Find template (predefined or custom)
    const template = HEURISTIC_TEMPLATES[heuristicId] || this.customTemplates.get(heuristicId);

    if (!template) {
      const duration_ms = Date.now() - startTime;
      this.logger.error('heuristic-compiler', 'compilation_failed', {
        heuristic_id: heuristicId,
        error: 'Unknown heuristic ID',
        duration_ms
      });
      throw new Error(`Unknown heuristic ID: ${heuristicId}. Register a custom template first.`);
    }

    // Log compilation with config source info
    const usingConfig = config && Object.keys(config).length > 0;
    const configSource = usingConfig ? 'file' : 'defaults';

    this.logger.info('heuristic-compiler', 'compilation_started', {
      heuristic_id: heuristicId,
      heuristic_name: template.name,
      domain: template.domain,
      config_source: configSource
    });

    console.log(`🔧 Compiling heuristic: ${heuristicId} (${template.name})`);
    console.log(`   Source: ${usingConfig ? 'Configuration file' : 'Hardcoded defaults'}`);

    try {
      // Compile using template
      const compiledFunction = template.compile(config);

      // Add metadata to function
      compiledFunction.heuristicId = heuristicId;
      compiledFunction.heuristicName = template.name;
      compiledFunction.domain = template.domain;
      compiledFunction.config = config;
      compiledFunction.compiledAt = new Date().toISOString();

      // Cache
      this.compiledHeuristics.set(heuristicId, compiledFunction);

      const duration_ms = Date.now() - startTime;

      this.logger.info('heuristic-compiler', 'compilation_completed', {
        heuristic_id: heuristicId,
        heuristic_name: template.name,
        config_source: configSource,
        cached: true,
        duration_ms
      });

      return compiledFunction;
    } catch (error) {
      const duration_ms = Date.now() - startTime;

      this.logger.error('heuristic-compiler', 'compilation_failed', {
        heuristic_id: heuristicId,
        error: error.message,
        stack: error.stack,
        duration_ms
      });

      throw error;
    }
  }

  /**
   * Compile multiple heuristics at once
   *
   * @param {Array<{id: string, config: Object}>} heuristics - Array of heuristic definitions
   * @returns {Map<string, Function>} Map of heuristic ID to compiled function
   */
  compileMultiple(heuristics) {
    const results = new Map();

    for (const { id, config } of heuristics) {
      try {
        const compiled = this.compile(id, config);
        results.set(id, compiled);
      } catch (error) {
        console.error(`Failed to compile ${id}:`, error.message);
        results.set(id, null);
      }
    }

    return results;
  }

  /**
   * Register a custom heuristic template
   *
   * @param {string} heuristicId - Unique heuristic ID
   * @param {Object} template - Template definition
   * @param {string} template.name - Human-readable name
   * @param {string} template.domain - Domain category
   * @param {Function} template.compile - Compilation function (config) => (context) => result
   */
  registerCustomTemplate(heuristicId, template) {
    if (!template.name || !template.domain || !template.compile) {
      throw new Error('Custom template must have name, domain, and compile function');
    }

    this.customTemplates.set(heuristicId, template);
    console.log(`✓ Registered custom heuristic template: ${heuristicId}`);
  }

  /**
   * Get all available heuristic IDs (predefined + custom)
   *
   * @returns {Array<string>} List of heuristic IDs
   */
  getAvailableHeuristics() {
    const predefined = Object.keys(HEURISTIC_TEMPLATES);
    const custom = Array.from(this.customTemplates.keys());
    return [...predefined, ...custom];
  }

  /**
   * Get heuristic metadata
   *
   * @param {string} heuristicId - Heuristic ID
   * @returns {Object|null} Heuristic metadata or null if not found
   */
  getHeuristicMetadata(heuristicId) {
    const template = HEURISTIC_TEMPLATES[heuristicId] || this.customTemplates.get(heuristicId);
    if (!template) return null;

    return {
      id: heuristicId,
      name: template.name,
      domain: template.domain,
      compiled: this.compiledHeuristics.has(heuristicId)
    };
  }

  /**
   * Clear all compiled heuristics (force recompilation)
   *
   * @param {string} reason - Optional reason for cache clear (for logging)
   */
  clearCache(reason = 'Manual cache clear') {
    const count = this.compiledHeuristics.size;
    this.compiledHeuristics.clear();

    this.logger.info('heuristic-compiler', 'cache_cleared', {
      heuristics_count: count,
      reason
    });

    console.log(`✓ Cleared heuristic compilation cache (${count} heuristics)`);
    console.log(`  Reason: ${reason}`);
  }

  /**
   * Invalidate cache on configuration change
   *
   * This method is called by config-loader when heuristics.yaml changes.
   * It clears the cache and optionally recompiles with new config.
   *
   * @param {Object} newConfig - New configuration object
   * @param {boolean} recompile - Whether to immediately recompile (default: false)
   * @returns {Map<string, Function>|null} Recompiled heuristics if recompile=true
   */
  invalidateOnConfigChange(newConfig, recompile = false) {
    const startTime = Date.now();

    this.logger.info('heuristic-compiler', 'config_change_detected', {
      recompile_requested: recompile,
      has_new_config: !!newConfig
    });

    console.log('🔄 Configuration change detected, invalidating heuristic cache...');

    const previousCount = this.compiledHeuristics.size;
    this.clearCache('Configuration file changed');

    if (!recompile || !newConfig) {
      this.logger.info('heuristic-compiler', 'cache_invalidated', {
        previous_count: previousCount,
        recompile: false,
        duration_ms: Date.now() - startTime
      });
      console.log('  Cache cleared. Heuristics will recompile on next use.');
      return null;
    }

    // Recompile all three main heuristics with new config
    console.log('  Recompiling all heuristics with new configuration...');

    const results = new Map();
    const heuristicIds = ['PV_BS_001', 'PV_PA_001', 'PV_PM_001'];
    let successCount = 0;

    heuristicIds.forEach(id => {
      try {
        const heuristicConfig = newConfig.heuristics?.[id];
        const compiled = this.compile(id, heuristicConfig || {});
        results.set(id, compiled);
        successCount++;
        console.log(`  ✓ Recompiled ${id}`);
      } catch (error) {
        console.error(`  ❌ Failed to recompile ${id}:`, error.message);
        results.set(id, null);
      }
    });

    const duration_ms = Date.now() - startTime;

    this.logger.info('heuristic-compiler', 'recompilation_completed', {
      total_heuristics: heuristicIds.length,
      successful: successCount,
      failed: heuristicIds.length - successCount,
      duration_ms
    });

    console.log(`✓ Recompilation complete (${results.size}/${heuristicIds.length} successful)`);
    return results;
  }

  /**
   * Get compilation statistics
   *
   * @returns {Object} Compilation stats
   */
  getStats() {
    return {
      predefinedHeuristics: Object.keys(HEURISTIC_TEMPLATES).length,
      customHeuristics: this.customTemplates.size,
      compiledCount: this.compiledHeuristics.size,
      availableTotal: this.getAvailableHeuristics().length
    };
  }
}

/**
 * Create a singleton compiler instance
 */
let compilerInstance = null;

/**
 * Get or create the heuristic compiler singleton
 *
 * @returns {HeuristicCompiler} Compiler instance
 */
function getCompiler() {
  if (!compilerInstance) {
    compilerInstance = new HeuristicCompiler();
  }
  return compilerInstance;
}

/**
 * Convenience function: Compile a heuristic
 *
 * @param {string} heuristicId - Heuristic ID
 * @param {Object} config - Configuration
 * @returns {Function} Compiled heuristic function
 */
function compileHeuristic(heuristicId, config = {}) {
  const compiler = getCompiler();
  return compiler.compile(heuristicId, config);
}

module.exports = {
  HeuristicCompiler,
  getCompiler,
  compileHeuristic,
  HEURISTIC_TEMPLATES
};
