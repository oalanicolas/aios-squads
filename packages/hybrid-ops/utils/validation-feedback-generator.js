/**
 * Validation Feedback Generator Module
 * Story: 1.8 - Phase 3 Workflow Orchestration (Phase B.6)
 *
 * Generates clear, actionable feedback for validation failures.
 * Provides context-specific suggestions and documentation links.
 */

/**
 * Documentation base URL for PV heuristics and validators
 */
const DOCS_BASE_URL = '.claude/commands/hybridOps/docs';

/**
 * Documentation references for each validation type
 */
const DOCUMENTATION_LINKS = {
  'PV_BS_001': {
    heuristic: `${DOCS_BASE_URL}/heuristics/PV_BS_001-future-back-casting.md`,
    guide: `${DOCS_BASE_URL}/guides/strategic-alignment-guide.md`,
    description: 'Future System Back-Casting (Strategic Alignment)'
  },
  'PV_PA_001': {
    heuristic: `${DOCS_BASE_URL}/heuristics/PV_PA_001-coherence-scan.md`,
    guide: `${DOCS_BASE_URL}/guides/executor-coherence-guide.md`,
    description: 'Systemic Coherence Scan (Executor Truthfulness)'
  },
  'PV_PM_001': {
    heuristic: `${DOCS_BASE_URL}/heuristics/PV_PM_001-automation-tipping-point.md`,
    guide: `${DOCS_BASE_URL}/guides/automation-readiness-guide.md`,
    description: 'Automation Tipping Point Assessment'
  },
  'axioma-validator': {
    validator: `${DOCS_BASE_URL}/validators/axioma-validator.md`,
    guide: `${DOCS_BASE_URL}/guides/axioma-compliance-guide.md`,
    description: 'Axioma 10-Dimensional Quality Framework'
  },
  'task-anatomy': {
    validator: `${DOCS_BASE_URL}/validators/task-anatomy-validator.md`,
    guide: `${DOCS_BASE_URL}/guides/task-anatomy-guide.md`,
    description: 'Task Anatomy 8-Field Structure'
  },
  'strategic-alignment': {
    checkpoint: `${DOCS_BASE_URL}/checkpoints/strategic-alignment.md`,
    description: 'Strategic Alignment Checkpoint'
  },
  'coherence-scan': {
    checkpoint: `${DOCS_BASE_URL}/checkpoints/coherence-scan.md`,
    description: 'Coherence Scan Checkpoint'
  },
  'automation-readiness': {
    checkpoint: `${DOCS_BASE_URL}/checkpoints/automation-readiness.md`,
    description: 'Automation Readiness Checkpoint'
  },
  'axioma-compliance': {
    checkpoint: `${DOCS_BASE_URL}/checkpoints/axioma-compliance.md`,
    description: 'Axioma Compliance Checkpoint'
  },
  'task-anatomy-check': {
    checkpoint: `${DOCS_BASE_URL}/checkpoints/task-anatomy-check.md`,
    description: 'Task Anatomy Checkpoint'
  }
};

/**
 * Generate enhanced validation failure feedback
 *
 * @param {Object} validationResult - The validation result from executeValidationGate
 * @param {Object} context - Additional context (phase info, previous outputs, etc.)
 * @returns {string} Formatted feedback with suggestions and documentation links
 */
function generateValidationFeedback(validationResult, context = {}) {
  const { gate, passed, veto, vetoes, criteriaResults, recommendation, severity } = validationResult;

  if (passed) {
    return generateSuccessFeedback(gate, validationResult);
  }

  if (veto) {
    return generateVetoFeedback(gate, vetoes, validationResult, context);
  }

  return generateCriteriaFailureFeedback(gate, criteriaResults, validationResult, context);
}

/**
 * Generate success feedback
 */
function generateSuccessFeedback(checkpoint, validationResult) {
  const { score } = validationResult;

  let feedback = `\n✅ ${formatCheckpointName(checkpoint)} validation passed\n`;

  if (score !== undefined) {
    feedback += `   Score: ${score.toFixed(2)}/10.0\n`;
  }

  feedback += `   All criteria met. Proceeding to next phase.\n`;

  return feedback;
}

/**
 * Generate VETO failure feedback
 */
function generateVetoFeedback(checkpoint, vetoes, validationResult, context) {
  let feedback = `\n${'='.repeat(80)}\n`;
  feedback += `🛑 ${formatCheckpointName(checkpoint).toUpperCase()} - VETO TRIGGERED\n`;
  feedback += `${'='.repeat(80)}\n`;

  feedback += `\n⚠️  CRITICAL: Non-negotiable validation failure detected.\n`;
  feedback += `    These conditions MUST be fixed before proceeding.\n\n`;

  // List all vetoes
  feedback += `📋 VETO CONDITIONS:\n`;
  vetoes.forEach((veto, idx) => {
    feedback += `   ${idx + 1}. ${veto.message}\n`;

    if (veto.value !== undefined && veto.threshold !== undefined) {
      feedback += `      • Current value: ${veto.value}\n`;
      feedback += `      • Required threshold: ${veto.threshold}\n`;
    }

    if (veto.type) {
      feedback += `      • Type: ${veto.type}\n`;
    }
  });

  // Generate context-specific fix suggestions
  feedback += `\n🔧 REQUIRED FIXES:\n`;
  feedback += generateVetoFixSuggestions(checkpoint, vetoes, context);

  // Add documentation links
  feedback += `\n📚 DOCUMENTATION:\n`;
  feedback += generateDocumentationLinks(checkpoint, validationResult);

  feedback += `\n${'='.repeat(80)}\n`;
  feedback += `Choose: [FIX VETOES] [ABORT WORKFLOW]\n`;
  feedback += `${'='.repeat(80)}\n`;

  return feedback;
}

/**
 * Generate criteria failure feedback
 */
function generateCriteriaFailureFeedback(checkpoint, criteriaResults, validationResult, context) {
  const failedCriteria = criteriaResults.filter(cr => !cr.passed);

  let feedback = `\n${'='.repeat(80)}\n`;
  feedback += `❌ ${formatCheckpointName(checkpoint)} validation failed\n`;
  feedback += `${'='.repeat(80)}\n`;

  // List failed criteria
  feedback += `\n📋 FAILED CRITERIA:\n`;
  failedCriteria.forEach((cr, idx) => {
    feedback += `   ${idx + 1}. ${cr.criterion}\n`;
    feedback += `      • Expected: ${cr.expected}\n`;
    feedback += `      • Actual: ${cr.actual}\n`;
    if (cr.message && cr.message !== cr.criterion) {
      feedback += `      • Details: ${cr.message}\n`;
    }
  });

  if (validationResult.recommendation) {
    feedback += `\n💡 RECOMMENDATION: ${validationResult.recommendation}\n`;
  }

  // Generate context-specific fix suggestions
  feedback += `\n🔧 SUGGESTED FIXES:\n`;
  feedback += generateCriteriaFixSuggestions(checkpoint, failedCriteria, validationResult, context);

  // Add documentation links
  feedback += `\n📚 DOCUMENTATION:\n`;
  feedback += generateDocumentationLinks(checkpoint, validationResult);

  feedback += `\n${'='.repeat(80)}\n`;
  feedback += `Choose: [FIX] [SKIP VALIDATION] [ABORT WORKFLOW]\n`;
  feedback += `${'='.repeat(80)}\n`;

  return feedback;
}

/**
 * Generate fix suggestions for VETO conditions
 */
function generateVetoFixSuggestions(checkpoint, vetoes, context) {
  let suggestions = '';
  let suggestionNum = 1;

  vetoes.forEach(veto => {
    if (veto.type === 'truthfulness') {
      suggestions += `   ${suggestionNum}. Replace executor "${veto.executor}" with higher truthfulness\n`;
      suggestions += `      • Current: ${veto.value.toFixed(2)}, Required: ≥${veto.threshold}\n`;
      suggestions += `      • Action: Re-evaluate executor selection or provide additional training\n`;
      suggestions += `      • Consider: Review executor's past performance and alignment\n`;
      suggestionNum++;
    }

    else if (veto.type === 'guardrails') {
      suggestions += `   ${suggestionNum}. Define safety guardrails before automation\n`;
      suggestions += `      • Add error handling procedures\n`;
      suggestions += `      • Create validation checkpoints\n`;
      suggestions += `      • Establish rollback mechanisms\n`;
      suggestions += `      • Document edge cases and failure modes\n`;
      suggestionNum++;
    }

    else if (veto.type === 'axioma_minimum') {
      suggestions += `   ${suggestionNum}. Improve dimension "${veto.dimension}"\n`;
      suggestions += `      • Current score: ${veto.value.toFixed(2)}/10.0\n`;
      suggestions += `      • Required minimum: ${veto.threshold}/10.0\n`;
      suggestions += `      • Action: ${getAxiomaImprovementSuggestion(veto.dimension)}\n`;
      suggestionNum++;
    }

    else if (veto.type === 'missing_fields') {
      suggestions += `   ${suggestionNum}. Complete Task Anatomy for "${veto.task}"\n`;
      suggestions += `      • Missing fields: ${veto.missing.join(', ')}\n`;
      suggestions += `      • All 8 fields are required before ClickUp creation\n`;
      suggestions += `      • Review Task Anatomy documentation for field definitions\n`;
      suggestionNum++;
    }

    else {
      suggestions += `   ${suggestionNum}. Address ${veto.type}: ${veto.message}\n`;
      suggestions += `      • Review veto condition details above\n`;
      suggestions += `      • Consult validation documentation\n`;
      suggestionNum++;
    }
  });

  return suggestions;
}

/**
 * Generate fix suggestions for criteria failures
 */
function generateCriteriaFixSuggestions(checkpoint, failedCriteria, validationResult, context) {
  let suggestions = '';

  // Checkpoint-specific suggestions
  if (checkpoint === 'strategic-alignment' || validationResult.heuristicId === 'PV_BS_001') {
    suggestions += `   1. Clarify end-state vision and long-term goals\n`;
    suggestions += `      • What does success look like in 3-5 years?\n`;
    suggestions += `      • Document strategic architecture explicitly\n`;
    suggestions += `      • Align team understanding of future state\n`;
    suggestions += `\n   2. Improve strategic priority alignment\n`;
    suggestions += `      • Reassess market signals vs vision alignment\n`;
    suggestions += `      • Prioritize strategic value over tactical urgency\n`;
    suggestions += `      • Review stakeholder requirements\n`;
    suggestions += `\n   3. Re-evaluate recommendation criteria\n`;
    suggestions += `      • If DEFER: clarify why strategic fit is weak\n`;
    suggestions += `      • Consider alternative approaches that align better\n`;
    suggestions += `      • Document strategic assumptions\n`;
  }

  else if (checkpoint === 'coherence-scan' || validationResult.heuristicId === 'PV_PA_001') {
    suggestions += `   1. Address executor coherence issues\n`;
    suggestions += `      • Replace executors with low truthfulness (<0.7)\n`;
    suggestions += `      • Provide coherence training or onboarding\n`;
    suggestions += `      • Re-assess system alignment and understanding\n`;
    suggestions += `\n   2. Improve primary executor weighted coherence\n`;
    suggestions += `      • Ensure executor has deep understanding of process\n`;
    suggestions += `      • Validate executor's alignment with goals\n`;
    suggestions += `      • Consider pairing with mentor/coach\n`;
    suggestions += `\n   3. Document and address concerns\n`;
    suggestions += `      • Record specific coherence gaps\n`;
    suggestions += `      • Create improvement plan\n`;
    suggestions += `      • Request manual override with justification if needed\n`;
  }

  else if (checkpoint === 'automation-readiness' || validationResult.heuristicId === 'PV_PM_001') {
    suggestions += `   1. Increase task frequency to reach tipping point\n`;
    suggestions += `      • Current frequency below 2x/month threshold\n`;
    suggestions += `      • Wait for sufficient volume before automating\n`;
    suggestions += `      • Consider batching or scheduling changes\n`;
    suggestions += `\n   2. Add safety guardrails (REQUIRED)\n`;
    suggestions += `      • Define error handling procedures\n`;
    suggestions += `      • Create validation checkpoints\n`;
    suggestions += `      • Establish rollback mechanisms\n`;
    suggestions += `      • Document edge cases\n`;
    suggestions += `\n   3. Improve process standardization\n`;
    suggestions += `      • Reduce variability in execution\n`;
    suggestions += `      • Document standard operating procedures\n`;
    suggestions += `      • Train team on consistent approach\n`;
  }

  else if (checkpoint === 'axioma-compliance' || validationResult.validatorName === 'axioma-validator') {
    suggestions += `   1. Improve overall Axioma score\n`;
    if (validationResult.score !== undefined) {
      suggestions += `      • Current: ${validationResult.score.toFixed(2)}/10.0, Required: ≥7.0/10.0\n`;
    }
    suggestions += `      • Focus on dimensions scoring below 7.0\n`;
    suggestions += `      • Review Axioma framework for improvement strategies\n`;
    suggestions += `\n   2. Address low-scoring dimensions\n`;
    if (validationResult.dimensions) {
      const lowScoring = Object.entries(validationResult.dimensions)
        .filter(([dim, score]) => score < 7.0)
        .sort((a, b) => a[1] - b[1]);

      lowScoring.slice(0, 3).forEach(([dim, score]) => {
        suggestions += `      • ${dim}: ${score.toFixed(2)}/10.0 - ${getAxiomaImprovementSuggestion(dim)}\n`;
      });
    }
    suggestions += `\n   3. Ensure no dimension falls below minimum\n`;
    if (validationResult.minScore !== undefined) {
      suggestions += `      • Lowest score: ${validationResult.minScore.toFixed(2)}/10.0 (must be ≥6.0)\n`;
    }
    suggestions += `      • Bring all dimensions to acceptable baseline\n`;
    suggestions += `      • Document systemic dependencies\n`;
  }

  else if (checkpoint === 'task-anatomy-check' || validationResult.validatorName === 'task-anatomy') {
    suggestions += `   1. Complete missing Task Anatomy fields\n`;
    if (validationResult.missingFields) {
      Object.entries(validationResult.missingFields).forEach(([task, fields]) => {
        suggestions += `      • ${task}: missing ${fields.join(', ')}\n`;
      });
    }
    suggestions += `\n   2. Review Task Anatomy requirements\n`;
    suggestions += `      • All 8 fields required: task_name, status, responsible_executor,\n`;
    suggestions += `        execution_type, estimated_time, input, output, action_items\n`;
    suggestions += `      • Each field serves critical role in task execution\n`;
    suggestions += `\n   3. Validate automation decisions\n`;
    suggestions += `      • Ensure automation flags align with Checkpoint 3 results\n`;
    suggestions += `      • Verify guardrails for automated tasks\n`;
  }

  else {
    // Generic suggestions
    suggestions += `   1. Review failed criteria listed above\n`;
    suggestions += `      • Address each specific failure point\n`;
    suggestions += `      • Update phase outputs to meet requirements\n`;
    suggestions += `\n   2. Consult validation documentation\n`;
    suggestions += `      • Review checkpoint criteria definition\n`;
    suggestions += `      • Understand threshold rationale\n`;
    suggestions += `      • Follow best practices guide\n`;
    suggestions += `\n   3. Request team review if needed\n`;
    suggestions += `      • Discuss failures with stakeholders\n`;
    suggestions += `      • Align on improvement approach\n`;
    suggestions += `      • Document decisions and trade-offs\n`;
  }

  return suggestions;
}

/**
 * Get improvement suggestion for specific Axioma dimension
 */
function getAxiomaImprovementSuggestion(dimension) {
  const suggestions = {
    'Truthfulness': 'Improve data accuracy and executor honesty assessment',
    'Coherence': 'Align system components and team understanding',
    'Strategic Alignment': 'Clarify long-term vision and priorities',
    'Operational Excellence': 'Standardize processes and improve efficiency',
    'Innovation Capacity': 'Foster creativity and experimentation',
    'Risk Management': 'Identify and mitigate potential risks',
    'Resource Optimization': 'Improve resource allocation and utilization',
    'Stakeholder Value': 'Enhance value delivery to stakeholders',
    'Sustainability': 'Ensure long-term viability and maintenance',
    'Adaptability': 'Increase system flexibility and resilience'
  };

  return suggestions[dimension] || 'Review dimension definition and improvement strategies';
}

/**
 * Generate documentation links for validation type
 */
function generateDocumentationLinks(checkpoint, validationResult) {
  let links = '';

  // Get documentation for the specific validation type
  const heuristicId = validationResult.heuristicId;
  const validatorName = validationResult.validatorName;

  // Add heuristic/validator-specific docs
  if (heuristicId && DOCUMENTATION_LINKS[heuristicId]) {
    const docs = DOCUMENTATION_LINKS[heuristicId];
    links += `   • ${docs.description}\n`;
    if (docs.heuristic) {
      links += `     Heuristic: ${docs.heuristic}\n`;
    }
    if (docs.guide) {
      links += `     Guide: ${docs.guide}\n`;
    }
  } else if (validatorName && DOCUMENTATION_LINKS[validatorName]) {
    const docs = DOCUMENTATION_LINKS[validatorName];
    links += `   • ${docs.description}\n`;
    if (docs.validator) {
      links += `     Validator: ${docs.validator}\n`;
    }
    if (docs.guide) {
      links += `     Guide: ${docs.guide}\n`;
    }
  }

  // Add checkpoint-specific docs
  if (DOCUMENTATION_LINKS[checkpoint]) {
    const docs = DOCUMENTATION_LINKS[checkpoint];
    links += `   • ${docs.description}\n`;
    if (docs.checkpoint) {
      links += `     Checkpoint: ${docs.checkpoint}\n`;
    }
  }

  // Add general workflow docs
  links += `   • Workflow Orchestration Guide\n`;
  links += `     ${DOCS_BASE_URL}/guides/workflow-orchestration-guide.md\n`;
  links += `   • PV Validation Reference\n`;
  links += `     ${DOCS_BASE_URL}/reference/pv-validation-reference.md\n`;

  return links;
}

/**
 * Format checkpoint name for display
 */
function formatCheckpointName(checkpoint) {
  return checkpoint
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generate quick summary of validation result
 *
 * @param {Object} validationResult - The validation result
 * @returns {string} One-line summary
 */
function generateValidationSummary(validationResult) {
  const { gate, passed, veto, severity } = validationResult;

  if (passed) {
    return `✅ ${formatCheckpointName(gate)} - PASSED`;
  }

  if (veto) {
    return `🛑 ${formatCheckpointName(gate)} - VETO TRIGGERED (${severity})`;
  }

  return `❌ ${formatCheckpointName(gate)} - FAILED (${severity})`;
}

module.exports = {
  generateValidationFeedback,
  generateSuccessFeedback,
  generateVetoFeedback,
  generateCriteriaFailureFeedback,
  generateVetoFixSuggestions,
  generateCriteriaFixSuggestions,
  generateDocumentationLinks,
  generateValidationSummary,
  DOCUMENTATION_LINKS
};
