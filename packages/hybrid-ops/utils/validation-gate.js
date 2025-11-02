/**
 * Validation Gate Module
 * Story: 1.8 - Phase 3 Workflow Orchestration
 *
 * Executes validation checkpoints using PV heuristics and validators.
 * Provides actionable feedback when validation fails.
 */

const { getCompiler } = require('./heuristic-compiler');
const feedbackGenerator = require('./validation-feedback-generator');
const path = require('path');
const fs = require('fs');

/**
 * Execute a validation gate for a workflow phase
 *
 * @param {Object} phase - The workflow phase containing validation configuration
 * @param {Object} context - The phase execution context/output to validate
 * @returns {Promise<Object>} Validation result with pass/fail and feedback
 */
async function executeValidationGate(phase, context) {
  const { validation } = phase;

  // No validation configured
  if (!validation || validation === 'none') {
    return {
      gate: phase.name,
      passed: true,
      skipped: true,
      message: 'No validation configured for this phase'
    };
  }

  const { checkpoint, heuristic, validator, criteria, veto_conditions } = validation;

  console.log(`🔍 Executing validation gate: ${checkpoint}`);

  try {
    // Load appropriate validator
    let validationResult;

    if (heuristic) {
      // Use PV heuristic (PV_BS_001, PV_PA_001, PV_PM_001)
      validationResult = await validateWithHeuristic(heuristic, context, validation);
    } else if (validator) {
      // Use special validator (Axioma, Task Anatomy)
      validationResult = await validateWithValidator(validator, context, validation);
    } else {
      throw new Error(`Validation gate ${checkpoint} has neither heuristic nor validator configured`);
    }

    // Check veto conditions first (highest priority)
    if (veto_conditions && validationResult.vetoes && validationResult.vetoes.length > 0) {
      const result = {
        gate: checkpoint,
        passed: false,
        veto: true,
        vetoes: validationResult.vetoes,
        recommendation: 'FIX_REQUIRED',
        severity: 'CRITICAL',
        heuristicId: validationResult.heuristicId,
        validatorName: validationResult.validatorName,
        score: validationResult.score
      };

      // Use enhanced feedback generator
      result.feedback = feedbackGenerator.generateVetoFeedback(checkpoint, validationResult.vetoes, result, context);

      return result;
    }

    // Check criteria
    const criteriaResults = evaluateCriteria(criteria, validationResult, context);
    const passed = criteriaResults.every(cr => cr.passed);

    if (!passed) {
      const result = {
        gate: checkpoint,
        passed: false,
        veto: false,
        criteriaResults,
        recommendation: 'REVIEW_AND_FIX',
        severity: 'MAJOR',
        heuristicId: validationResult.heuristicId,
        validatorName: validationResult.validatorName,
        score: validationResult.score,
        dimensions: validationResult.dimensions,
        minScore: validationResult.minScore,
        missingFields: validationResult.missingFields
      };

      // Use enhanced feedback generator
      result.feedback = feedbackGenerator.generateCriteriaFailureFeedback(checkpoint, criteriaResults, result, context);

      return result;
    }

    // All checks passed
    const result = {
      gate: checkpoint,
      passed: true,
      criteriaResults,
      score: validationResult.score,
      heuristicId: validationResult.heuristicId,
      validatorName: validationResult.validatorName
    };

    // Use enhanced feedback generator for success message
    result.message = feedbackGenerator.generateSuccessFeedback(checkpoint, result);

    return result;

  } catch (error) {
    console.error(`❌ Validation gate execution error:`, error);
    return {
      gate: checkpoint,
      passed: false,
      error: true,
      message: error.message,
      recommendation: 'CHECK_CONFIGURATION',
      severity: 'CRITICAL'
    };
  }
}

/**
 * Validate using a PV heuristic (PV_BS_001, PV_PA_001, PV_PM_001)
 */
async function validateWithHeuristic(heuristicId, context, validationConfig) {
  const compiler = getCompiler();
  const heuristic = compiler.compile(heuristicId);

  if (!heuristic) {
    throw new Error(`Heuristic ${heuristicId} not found or failed to compile`);
  }

  // Execute heuristic with phase context
  const result = heuristic(context);

  // Check for veto conditions
  const vetoes = [];

  if (heuristicId === 'PV_PA_001') {
    // Coherence scan - check truthfulness veto
    if (context.executors) {
      context.executors.forEach((executor, idx) => {
        if (executor.truthfulness < 0.7) {
          vetoes.push({
            type: 'truthfulness',
            executor: executor.name || `Executor ${idx + 1}`,
            value: executor.truthfulness,
            threshold: 0.7,
            message: `Executor "${executor.name}" has truthfulness ${executor.truthfulness} < 0.7 (VETO)`
          });
        }
      });
    }
  }

  if (heuristicId === 'PV_PM_001') {
    // Automation readiness - check guardrails veto
    if (!context.guardrails || context.guardrails.length === 0) {
      vetoes.push({
        type: 'guardrails',
        message: 'Missing safety guardrails (VETO)',
        required: 'At least one guardrail must be defined before automation'
      });
    }
  }

  return {
    recommendation: result.recommendation,
    score: result.weighted_score || result.score,
    details: result,
    vetoes,
    heuristicId
  };
}

/**
 * Validate using a special validator (Axioma, Task Anatomy)
 */
async function validateWithValidator(validatorName, context, validationConfig) {
  if (validatorName === 'axioma-validator') {
    return validateAxiomaCompliance(context, validationConfig);
  }

  if (validatorName === 'task-anatomy') {
    return validateTaskAnatomy(context, validationConfig);
  }

  throw new Error(`Unknown validator: ${validatorName}`);
}

/**
 * Validate Axioma compliance (10 dimensions)
 */
function validateAxiomaCompliance(context, validationConfig) {
  const { criteria } = validationConfig;

  // Parse criteria for thresholds
  const overallThreshold = parseFloat(criteria.find(c => c.includes('Overall score'))?.match(/≥(\d+\.?\d*)/)?.[1] || '7.0');
  const minLevelThreshold = parseFloat(criteria.find(c => c.includes('below'))?.match(/below (\d+\.?\d*)/)?.[1] || '6.0');

  // Expected Axioma dimensions
  const dimensions = validationConfig.dimensions || [
    'Truthfulness', 'Coherence', 'Strategic Alignment',
    'Operational Excellence', 'Innovation Capacity', 'Risk Management',
    'Resource Optimization', 'Stakeholder Value', 'Sustainability', 'Adaptability'
  ];

  // Calculate scores (from context.axioma or mock for testing)
  const axioma = context.axioma || {};
  const scores = dimensions.map(dim => axioma[dim] || 7.0);
  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);

  const vetoes = [];
  if (minScore < minLevelThreshold) {
    vetoes.push({
      type: 'axioma_minimum',
      dimension: dimensions[scores.indexOf(minScore)],
      value: minScore,
      threshold: minLevelThreshold,
      message: `Dimension "${dimensions[scores.indexOf(minScore)]}" scored ${minScore} < ${minLevelThreshold} (VETO)`
    });
  }

  return {
    score: overallScore,
    minScore,
    dimensions: Object.fromEntries(dimensions.map((dim, idx) => [dim, scores[idx]])),
    vetoes,
    validatorName: 'axioma-validator'
  };
}

/**
 * Validate Task Anatomy (8 required fields)
 */
function validateTaskAnatomy(context, validationConfig) {
  const requiredFields = validationConfig.required_fields || [
    'Name', 'Description', 'Status', 'Assignee',
    'Due Date', 'Dependencies', 'Automation Trigger', 'Validation Criteria'
  ];

  const tasks = context.tasks || [];
  const vetoes = [];
  const missingFields = {};

  tasks.forEach((task, idx) => {
    const taskMissing = requiredFields.filter(field => !task[field] && !task[field.toLowerCase()]);
    if (taskMissing.length > 0) {
      missingFields[task.name || `Task ${idx + 1}`] = taskMissing;
      vetoes.push({
        type: 'missing_fields',
        task: task.name || `Task ${idx + 1}`,
        missing: taskMissing,
        message: `Task "${task.name}" missing ${taskMissing.length} required fields`
      });
    }
  });

  return {
    score: tasks.length > 0 ? ((tasks.length - vetoes.length) / tasks.length) * 10 : 0,
    totalTasks: tasks.length,
    compliantTasks: tasks.length - vetoes.length,
    missingFields,
    vetoes,
    validatorName: 'task-anatomy'
  };
}

/**
 * Evaluate all criteria against validation result
 */
function evaluateCriteria(criteria, validationResult, context) {
  if (!criteria || criteria.length === 0) {
    return [];
  }

  return criteria.map(criterion => {
    const result = evaluateSingleCriterion(criterion, validationResult, context);
    return {
      criterion,
      passed: result.passed,
      actual: result.actual,
      expected: result.expected,
      message: result.message
    };
  });
}

/**
 * Evaluate a single criterion
 */
function evaluateSingleCriterion(criterion, validationResult, context) {
  // Parse criterion string (e.g., "End-state vision clarity ≥0.8")
  const match = criterion.match(/(.+?)\s*([≥>=<≤]+)\s*(\d+\.?\d*)/);

  if (!match) {
    // Non-numeric criterion (e.g., "Guardrails present (VETO)")
    if (criterion.includes('Guardrails present')) {
      const hasGuardrails = context.guardrails && context.guardrails.length > 0;
      return {
        passed: hasGuardrails,
        actual: hasGuardrails ? 'Present' : 'Missing',
        expected: 'Present',
        message: hasGuardrails ? 'Guardrails defined' : 'No guardrails found'
      };
    }

    if (criterion.includes('Task Anatomy fields present')) {
      const compliant = validationResult.vetoes?.length === 0;
      return {
        passed: compliant,
        actual: `${validationResult.compliantTasks}/${validationResult.totalTasks} tasks`,
        expected: 'All tasks compliant',
        message: compliant ? 'All tasks have required fields' : 'Some tasks missing fields'
      };
    }

    // Default: assume passed if no veto
    return {
      passed: !validationResult.vetoes || validationResult.vetoes.length === 0,
      actual: 'Evaluated',
      expected: 'No vetoes',
      message: 'Criterion evaluated'
    };
  }

  const [, field, operator, thresholdStr] = match;
  const threshold = parseFloat(thresholdStr);

  // Get actual value from context or validation result
  let actualValue = getNestedValue(context, field) || getNestedValue(validationResult, field) || validationResult.score;

  // Handle specific field mappings
  if (field.includes('Overall score')) actualValue = validationResult.score;
  if (field.includes('level')) actualValue = validationResult.minScore;

  const passed = compareValues(actualValue, operator, threshold);

  return {
    passed,
    actual: actualValue,
    expected: `${operator} ${threshold}`,
    message: passed ?
      `${field}: ${actualValue} ${operator} ${threshold}` :
      `${field}: ${actualValue} does not meet ${operator} ${threshold}`
  };
}

/**
 * Compare values based on operator
 */
function compareValues(actual, operator, threshold) {
  switch (operator) {
    case '≥':
    case '>=':
      return actual >= threshold;
    case '>':
      return actual > threshold;
    case '≤':
    case '<=':
      return actual <= threshold;
    case '<':
      return actual < threshold;
    case '=':
    case '==':
      return actual === threshold;
    default:
      return false;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  // Handle various path formats
  const cleanPath = path.toLowerCase().replace(/[^\w.]/g, '_');
  const keys = cleanPath.split(/[.\s]+/);

  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * Generate actionable feedback for failed validation
 *
 * @deprecated Use validation-feedback-generator module instead (Phase B.6)
 * This function is kept for backward compatibility only.
 */
function generateActionableFeedback(checkpoint, criteriaResults, validationConfig, context) {
  const failedCriteria = criteriaResults.filter(cr => !cr.passed);

  let feedback = `\n❌ ${checkpoint} validation failed:\n`;

  failedCriteria.forEach(cr => {
    feedback += `  • ${cr.message}\n`;
    feedback += `    Expected: ${cr.expected}, Got: ${cr.actual}\n`;
  });

  feedback += `\n🔧 Suggested fixes:\n`;

  // Use feedback_on_failure from validation config
  if (validationConfig.feedback_on_failure) {
    validationConfig.feedback_on_failure.forEach((suggestion, idx) => {
      feedback += `  ${idx + 1}. ${suggestion}\n`;
    });
  } else {
    // Generic suggestions based on checkpoint
    if (checkpoint === 'strategic-alignment') {
      feedback += `  1. Clarify end-state vision and long-term goals\n`;
      feedback += `  2. Align architecture with strategic priorities\n`;
      feedback += `  3. Review market signals but prioritize vision\n`;
    } else if (checkpoint === 'coherence-scan') {
      feedback += `  1. Replace executors with low truthfulness\n`;
      feedback += `  2. Provide coherence training or onboarding\n`;
      feedback += `  3. Re-assess system alignment\n`;
    } else if (checkpoint === 'automation-readiness') {
      feedback += `  1. Add safety guardrails and error handling\n`;
      feedback += `  2. Increase process standardization\n`;
      feedback += `  3. Wait until tipping point reached\n`;
    } else {
      feedback += `  1. Review failed criteria above\n`;
      feedback += `  2. Update phase outputs to meet requirements\n`;
      feedback += `  3. Consult validation documentation\n`;
    }
  }

  feedback += `\nChoose: [FIX] [SKIP VALIDATION] [ABORT WORKFLOW]`;

  return feedback;
}

/**
 * Generate feedback for veto conditions
 *
 * @deprecated Use validation-feedback-generator module instead (Phase B.6)
 * This function is kept for backward compatibility only.
 */
function generateVetoFeedback(checkpoint, vetoes, validationConfig) {
  let feedback = `\n🛑 ${checkpoint} VETO TRIGGERED:\n`;

  vetoes.forEach(veto => {
    feedback += `  • ${veto.message}\n`;
    if (veto.value !== undefined) {
      feedback += `    Value: ${veto.value}, Threshold: ${veto.threshold}\n`;
    }
  });

  feedback += `\n⚠️ VETO conditions are non-negotiable. You MUST fix these issues.\n`;

  feedback += `\n🔧 Required fixes:\n`;

  vetoes.forEach((veto, idx) => {
    if (veto.type === 'truthfulness') {
      feedback += `  ${idx + 1}. Replace ${veto.executor} with executor having truthfulness ≥0.7\n`;
    } else if (veto.type === 'guardrails') {
      feedback += `  ${idx + 1}. Define safety guardrails before automation\n`;
    } else if (veto.type === 'axioma_minimum') {
      feedback += `  ${idx + 1}. Improve "${veto.dimension}" to at least ${veto.threshold}\n`;
    } else {
      feedback += `  ${idx + 1}. Address ${veto.type}: ${veto.message}\n`;
    }
  });

  feedback += `\nChoose: [FIX VETOES] [ABORT WORKFLOW]`;

  return feedback;
}

module.exports = {
  executeValidationGate,
  validateWithHeuristic,
  validateWithValidator,
  evaluateCriteria,
  generateActionableFeedback,
  generateVetoFeedback
};
