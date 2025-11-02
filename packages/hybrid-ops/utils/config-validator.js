/**
 * @fileoverview Configuration Validator
 *
 * Validates heuristic configuration files to ensure:
 * - All required fields are present
 * - All values are correct types (number, boolean, string)
 * - Weights and thresholds are within valid ranges
 * - Configuration structure matches expected schema
 *
 * Used by config-loader.js before applying configuration changes.
 *
 * @module utils/config-validator
 */

/**
 * Validate heuristic configuration
 *
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validation result with {valid: boolean, errors: string[]}
 *
 * @example
 * const { validateConfig } = require('./config-validator');
 * const config = loadConfigFile();
 * const result = validateConfig(config);
 *
 * if (!result.valid) {
 *   console.error('Config validation failed:', result.errors);
 *   // Fall back to defaults
 * }
 */
function validateConfig(config) {
  const errors = [];

  // Check for null/undefined config
  if (!config) {
    return { valid: false, errors: ['Configuration object is required'] };
  }

  // Validate version field
  if (!config.version) {
    errors.push('Missing required field: version');
  } else if (typeof config.version !== 'string') {
    errors.push('version: Must be a string (e.g., "1.0")');
  }

  // Validate heuristics section exists
  if (!config.heuristics) {
    errors.push('Missing required field: heuristics');
    return { valid: false, errors }; // Can't continue without heuristics
  }

  // Validate each heuristic (PV_BS_001, PV_PA_001, PV_PM_001)
  const requiredHeuristics = ['PV_BS_001', 'PV_PA_001', 'PV_PM_001'];

  requiredHeuristics.forEach(heuristicId => {
    const h = config.heuristics[heuristicId];

    if (!h) {
      errors.push(`Missing required heuristic: ${heuristicId}`);
      return; // Skip further validation for this heuristic
    }

    // Validate weights section
    if (!h.weights) {
      errors.push(`${heuristicId}: Missing weights section`);
    } else {
      // Check each weight is a number and non-negative
      Object.entries(h.weights).forEach(([key, value]) => {
        if (typeof value !== 'number') {
          errors.push(`${heuristicId}.weights.${key}: Must be a number (got ${typeof value})`);
        } else if (value < 0) {
          errors.push(`${heuristicId}.weights.${key}: Cannot be negative (got ${value})`);
        }
      });
    }

    // Validate thresholds section
    if (!h.thresholds) {
      errors.push(`${heuristicId}: Missing thresholds section`);
    } else {
      // Check each threshold is a number and within valid range
      Object.entries(h.thresholds).forEach(([key, value]) => {
        if (typeof value !== 'number') {
          errors.push(`${heuristicId}.thresholds.${key}: Must be a number (got ${typeof value})`);
        } else {
          // Most thresholds are 0-1 range (except tipping_point which is integer ≥1)
          if (key === 'tipping_point') {
            if (value < 1 || !Number.isInteger(value)) {
              errors.push(`${heuristicId}.thresholds.${key}: Must be integer ≥ 1 (got ${value})`);
            }
          } else {
            // Standard 0-1 threshold range
            if (value < 0 || value > 1) {
              errors.push(`${heuristicId}.thresholds.${key}: Must be between 0 and 1 (got ${value})`);
            }
          }
        }
      });
    }
  });

  // Validate specific heuristic requirements
  validateHeuristicSpecifics(config, errors);

  // Validate validation section (if present)
  if (config.validation) {
    const v = config.validation;

    if (v.strict_mode !== undefined && typeof v.strict_mode !== 'boolean') {
      errors.push('validation.strict_mode: Must be boolean (true/false)');
    }

    if (v.minimum_score !== undefined) {
      if (typeof v.minimum_score !== 'number') {
        errors.push('validation.minimum_score: Must be number');
      } else if (v.minimum_score < 0 || v.minimum_score > 10) {
        errors.push('validation.minimum_score: Must be between 0 and 10 (Axioma scale)');
      }
    }

    if (v.enable_veto !== undefined && typeof v.enable_veto !== 'boolean') {
      errors.push('validation.enable_veto: Must be boolean (true/false)');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Validate heuristic-specific requirements
 *
 * Checks domain-specific rules that apply to individual heuristics:
 * - PV_BS_001: Weight sum validation
 * - PV_PA_001: Veto threshold consistency
 * - PV_PM_001: Standardization vs automate threshold relationship
 *
 * @param {Object} config - Configuration object
 * @param {Array<string>} errors - Errors array to append to
 * @private
 */
function validateHeuristicSpecifics(config, errors) {
  const heuristics = config.heuristics;
  if (!heuristics) return;

  // PV_BS_001: Validate weight sum (should total to 1.0 for proper normalization)
  if (heuristics.PV_BS_001?.weights) {
    const weights = heuristics.PV_BS_001.weights;
    const sum = (weights.end_state_vision || 0) + (weights.current_market_signals || 0);

    if (Math.abs(sum - 1.0) > 0.01) { // Allow small floating point error
      errors.push(`PV_BS_001.weights: Sum should equal 1.0 for proper weighting (got ${sum.toFixed(2)})`);
    }
  }

  // PV_PA_001: Validate veto threshold is lower than approve threshold
  if (heuristics.PV_PA_001?.thresholds) {
    const thresholds = heuristics.PV_PA_001.thresholds;
    const veto = thresholds.veto;
    const review = thresholds.review;
    const approve = thresholds.approve;

    if (veto !== undefined && review !== undefined && veto >= review) {
      errors.push(`PV_PA_001.thresholds: veto (${veto}) must be < review (${review})`);
    }

    if (review !== undefined && approve !== undefined && review >= approve) {
      errors.push(`PV_PA_001.thresholds: review (${review}) must be < approve (${approve})`);
    }
  }

  // PV_PM_001: Validate standardization threshold <= automate threshold
  if (heuristics.PV_PM_001?.thresholds) {
    const thresholds = heuristics.PV_PM_001.thresholds;
    const standardization = thresholds.standardization;
    const automate = thresholds.automate;

    if (standardization !== undefined && automate !== undefined && standardization > automate) {
      errors.push(`PV_PM_001.thresholds: standardization (${standardization}) should be ≤ automate (${automate})`);
    }
  }
}

/**
 * Get a human-readable validation error report
 *
 * @param {Array<string>} errors - Array of validation errors
 * @returns {string} Formatted error report
 */
function formatValidationErrors(errors) {
  if (!errors || errors.length === 0) {
    return '✓ Configuration is valid';
  }

  const header = `❌ Configuration validation failed with ${errors.length} error(s):\n`;
  const errorList = errors.map((err, idx) => `  ${idx + 1}. ${err}`).join('\n');

  return header + errorList;
}

module.exports = {
  validateConfig,
  formatValidationErrors
};
