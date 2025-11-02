/**
 * @fileoverview Axioma Validator
 *
 * Validates outputs and decisions against Pedro Valério's META_AXIOMAS hierarchy.
 * Implements 4-level validation: Existential → Epistemological → Social → Operational
 *
 * Axiom Levels:
 * - NÍVEL -4: AXIOMAS EXISTENCIAIS (Core purpose and meaning)
 * - NÍVEL -3: AXIOMAS EPISTEMOLÓGICOS (Truth and knowledge)
 * - NÍVEL -2: AXIOMAS SOCIAIS (People and hierarchy)
 * - NÍVEL  0: AXIOMAS OPERACIONAIS (Execution patterns)
 *
 * @module utils/axioma-validator
 */

const { getLogger } = require('./logger');
const { getMetricsCollector } = require('./metrics-collector');

/**
 * Axiom Levels (from deepest to surface)
 */
const AXIOM_LEVELS = {
  EXISTENTIAL: -4,
  EPISTEMOLOGICAL: -3,
  SOCIAL: -2,
  OPERATIONAL: 0
};

/**
 * Core axioms extracted from META_AXIOMAS artifact
 *
 * These represent Pedro Valério's fundamental beliefs that should guide all decisions.
 */
const CORE_AXIOMS = {
  // NÍVEL -4: AXIOMAS EXISTENCIAIS
  existential: {
    sentido_existencia: {
      crenca_core: 'A existência é um projeto de construção contra o caos entrópico',
      manifestacoes: [
        'Propósito sem sistema é agonia',
        'Clareza sem execução é covardia',
        'Sistema sem propósito é mecanicismo morto'
      ],
      keywords: ['propósito', 'sistema', 'construção', 'ordem', 'caos', 'clareza', 'execução']
    },
    sobre_tempo: {
      crenca_core: 'Tempo é recurso não-renovável para construir ordem',
      manifestacoes: [
        'Fez duas vezes? Automatize',
        'Clareza antecede execução',
        'Decisão > Perfeição paralisante'
      ],
      keywords: ['tempo', 'automação', 'eficiência', 'decisão', 'ação']
    }
  },

  // NÍVEL -3: AXIOMAS EPISTEMOLÓGICOS
  epistemological: {
    definicao_verdade: {
      formula: 'Verdade = Coerência Sistêmica Verificada por Dados',
      hierarquia_confiabilidade: {
        arquitetura_sistemica: { peso: 1.0, rank: 1 },
        dados_quantitativos: { peso: 0.9, rank: 2 },
        principios_multidominio: { peso: 0.8, rank: 3 },
        circulo_confiavel: { peso: 0.6, rank: 4 },
        consenso_social: { peso: 0.1, rank: 5 }
      },
      keywords: ['verdade', 'dados', 'coerência', 'sistema', 'verificação', 'evidência']
    },
    aprendizado: {
      crenca_core: 'Aprendizado = Padrão + Aplicação + Refinamento iterativo',
      keywords: ['aprendizado', 'padrão', 'iteração', 'refinamento', 'aplicação']
    }
  },

  // NÍVEL -2: AXIOMAS SOCIAIS
  social: {
    sobre_hierarquia: {
      crenca_core: 'Única hierarquia legítima = competência sistêmica + execução',
      manifestacoes: [
        'Autoridade sem competência = tirania',
        'Competência sem execução = inutilidade',
        'Execução sem sistema = caos eficiente'
      ],
      keywords: ['competência', 'execução', 'hierarquia', 'autoridade', 'resultado']
    },
    sobre_pessoas: {
      crenca_core: 'Coerência sistêmica > habilidades técnicas',
      veto_power: 'Incoerência com axiomas = eliminação imediata',
      keywords: ['coerência', 'alinhamento', 'verdade', 'integridade', 'sistema']
    }
  },

  // NÍVEL 0: AXIOMAS OPERACIONAIS
  operational: {
    automacao_obsessiva: {
      regra: 'Fez duas vezes? Automatize',
      threshold: 2,
      keywords: ['automação', 'repetição', 'eficiência', 'escala']
    },
    clareza_radical: {
      regra: 'Clarity without execution is cowardice',
      manifestacoes: [
        'Decisão > Análise paralítica',
        'Ação > Perfeição teórica',
        'Sistema > Ad-hoc'
      ],
      keywords: ['clareza', 'execução', 'decisão', 'ação', 'coragem']
    },
    sistematizacao_compulsiva: {
      regra: 'Processo documentado > Conhecimento tácito',
      keywords: ['documentação', 'processo', 'sistema', 'padrão', 'replicabilidade']
    }
  }
};

/**
 * Axioma Validator Class
 *
 * Validates content, decisions, and outputs against Pedro Valério's axiom hierarchy.
 *
 * @class AxiomaValidator
 */
class AxiomaValidator {
  constructor(metaAxiomasArtifact = null) {
    this.metaAxiomas = metaAxiomasArtifact || CORE_AXIOMS;
    this.validationHistory = [];

    // Logger instance for validation events
    this.logger = getLogger();

    // Metrics collector instance
    this.metrics = getMetricsCollector();
  }

  /**
   * Validate content against all axiom levels
   *
   * @param {string|Object} content - Content to validate (text or structured data)
   * @param {Object} options - Validation options
   * @param {Array<number>} options.levels - Specific levels to validate against
   * @param {number} options.minScore - Minimum acceptable score (0-10)
   * @param {boolean} options.strict - Strict mode (fail on any veto)
   * @returns {Object} Validation result with scores and recommendations
   */
  validate(content, options = {}) {
    const startTime = Date.now();
    const operationId = `validation_${Date.now()}`;

    const {
      levels = [AXIOM_LEVELS.EXISTENTIAL, AXIOM_LEVELS.EPISTEMOLOGICAL, AXIOM_LEVELS.SOCIAL, AXIOM_LEVELS.OPERATIONAL],
      minScore = 7.0,
      strict = false
    } = options;

    const contentText = typeof content === 'string' ? content : JSON.stringify(content);
    const contentLower = contentText.toLowerCase();

    // Start metrics timer for validation
    this.metrics.startTimer(operationId, 'validation', {
      content_length: contentText.length,
      levels_count: levels.length,
      strict_mode: strict
    });

    this.logger.debug('axioma-validator', 'validation_started', {
      content_length: contentText.length,
      levels_count: levels.length,
      min_score: minScore,
      strict_mode: strict
    });

    const results = {
      overall_score: 0,
      level_scores: {},
      violations: [],
      strengths: [],
      recommendation: 'UNKNOWN',
      veto: false,
      timestamp: new Date().toISOString()
    };

    // Validate each requested level
    let totalScore = 0;
    let levelCount = 0;

    if (levels.includes(AXIOM_LEVELS.EXISTENTIAL)) {
      results.level_scores.existential = this.validateExistential(contentLower);
      totalScore += results.level_scores.existential.score;
      levelCount++;
    }

    if (levels.includes(AXIOM_LEVELS.EPISTEMOLOGICAL)) {
      results.level_scores.epistemological = this.validateEpistemological(contentLower);
      totalScore += results.level_scores.epistemological.score;
      levelCount++;
    }

    if (levels.includes(AXIOM_LEVELS.SOCIAL)) {
      results.level_scores.social = this.validateSocial(contentLower);
      totalScore += results.level_scores.social.score;
      levelCount++;

      // Check veto condition
      if (results.level_scores.social.veto) {
        results.veto = true;
        results.violations.push({
          level: 'SOCIAL',
          severity: 'CRITICAL',
          reason: results.level_scores.social.vetoReason
        });
      }
    }

    if (levels.includes(AXIOM_LEVELS.OPERATIONAL)) {
      results.level_scores.operational = this.validateOperational(contentLower);
      totalScore += results.level_scores.operational.score;
      levelCount++;
    }

    // Calculate overall score
    results.overall_score = levelCount > 0 ? totalScore / levelCount : 0;

    // Collect violations and strengths
    for (const [level, data] of Object.entries(results.level_scores)) {
      if (data.violations) {
        results.violations.push(...data.violations.map(v => ({ ...v, level })));
      }
      if (data.strengths) {
        results.strengths.push(...data.strengths.map(s => ({ ...s, level })));
      }
    }

    // Determine recommendation
    if (results.veto && strict) {
      results.recommendation = 'REJECT_VETO';
    } else if (results.overall_score >= minScore) {
      results.recommendation = 'APPROVE';
    } else if (results.overall_score >= minScore * 0.8) {
      results.recommendation = 'REVIEW';
    } else {
      results.recommendation = 'REJECT_LOW_SCORE';
    }

    // Save to history
    this.validationHistory.push({
      content: contentText.substring(0, 200), // First 200 chars
      results: results,
      timestamp: results.timestamp
    });

    const duration_ms = Date.now() - startTime;

    // End metrics timer
    this.metrics.endTimer(operationId, {
      score: results.overall_score,
      recommendation: results.recommendation,
      veto: results.veto,
      violations_count: results.violations.length
    });

    // Log validation completion
    this.logger.info('axioma-validator', 'validation_completed', {
      overall_score: results.overall_score.toFixed(1),
      recommendation: results.recommendation,
      veto: results.veto,
      violations_count: results.violations.length,
      strengths_count: results.strengths.length,
      duration_ms
    });

    // Special logging for veto condition (fallback trigger)
    if (results.veto) {
      const vetoViolation = results.violations.find(v => v.severity === 'CRITICAL');

      this.metrics.recordFallback('validation_veto_triggered', {
        component: 'axioma-validator',
        overall_score: results.overall_score,
        veto_reason: vetoViolation?.reason,
        veto_level: vetoViolation?.level
      });

      this.logger.warn('axioma-validator', 'validation_veto_triggered', {
        overall_score: results.overall_score.toFixed(1),
        veto_reason: vetoViolation?.reason,
        fallback_required: true,
        duration_ms
      });
    }

    return results;
  }

  /**
   * Validate against Existential axioms (Level -4)
   *
   * @private
   * @param {string} contentLower - Lowercase content
   * @returns {Object} Validation result for existential level
   */
  validateExistential(contentLower) {
    const axioms = CORE_AXIOMS.existential;
    let score = 5.0; // Neutral baseline
    const violations = [];
    const strengths = [];

    this.logger.debug('axioma-validator', 'level_validation_started', {
      level: 'existential',
      level_code: AXIOM_LEVELS.EXISTENTIAL
    });

    // Check for purpose/system alignment
    const hasProposito = this.containsKeywords(contentLower, axioms.sentido_existencia.keywords);
    if (hasProposito > 0) {
      score += Math.min(hasProposito * 0.5, 2.5);
      strengths.push({
        axiom: 'sentido_existencia',
        reason: 'Demonstrates purpose-driven thinking',
        score_impact: '+' + (hasProposito * 0.5).toFixed(1)
      });
    }

    // Check for time/efficiency consciousness
    const hasTempoConsciencia = this.containsKeywords(contentLower, axioms.sobre_tempo.keywords);
    if (hasTempoConsciencia > 0) {
      score += Math.min(hasTempoConsciencia * 0.5, 2.5);
      strengths.push({
        axiom: 'sobre_tempo',
        reason: 'Shows awareness of time as scarce resource',
        score_impact: '+' + (hasTempoConsciencia * 0.5).toFixed(1)
      });
    }

    // Check for violations
    if (contentLower.includes('sem propósito') || contentLower.includes('sem sistema')) {
      violations.push({
        axiom: 'sentido_existencia',
        reason: 'Content suggests purposeless or systemless approach',
        severity: 'MEDIUM'
      });
      score -= 2.0;
    }

    const finalScore = Math.max(0, Math.min(10, score));

    this.logger.debug('axioma-validator', 'level_validation_completed', {
      level: 'existential',
      score: finalScore.toFixed(1),
      violations_count: violations.length,
      strengths_count: strengths.length
    });

    return {
      score: finalScore,
      violations,
      strengths
    };
  }

  /**
   * Validate against Epistemological axioms (Level -3)
   *
   * @private
   * @param {string} contentLower - Lowercase content
   * @returns {Object} Validation result for epistemological level
   */
  validateEpistemological(contentLower) {
    const axioms = CORE_AXIOMS.epistemological;
    let score = 5.0;
    const violations = [];
    const strengths = [];

    this.logger.debug('axioma-validator', 'level_validation_started', {
      level: 'epistemological',
      level_code: AXIOM_LEVELS.EPISTEMOLOGICAL
    });

    // Check for data-driven thinking
    const hasVerdadeDados = this.containsKeywords(contentLower, axioms.definicao_verdade.keywords);
    if (hasVerdadeDados > 0) {
      score += Math.min(hasVerdadeDados * 0.6, 3.0);
      strengths.push({
        axiom: 'definicao_verdade',
        reason: 'Evidence-based and data-driven approach',
        score_impact: '+' + (hasVerdadeDados * 0.6).toFixed(1)
      });
    }

    // Check for learning/iteration patterns
    const hasAprendizado = this.containsKeywords(contentLower, axioms.aprendizado.keywords);
    if (hasAprendizado > 0) {
      score += Math.min(hasAprendizado * 0.4, 2.0);
      strengths.push({
        axiom: 'aprendizado',
        reason: 'Demonstrates iterative learning mindset',
        score_impact: '+' + (hasAprendizado * 0.4).toFixed(1)
      });
    }

    // Check for violations
    if (contentLower.includes('opinião') && !contentLower.includes('dados')) {
      violations.push({
        axiom: 'definicao_verdade',
        reason: 'Relies on opinion without data verification',
        severity: 'MEDIUM'
      });
      score -= 1.5;
    }

    const finalScore = Math.max(0, Math.min(10, score));

    this.logger.debug('axioma-validator', 'level_validation_completed', {
      level: 'epistemological',
      score: finalScore.toFixed(1),
      violations_count: violations.length,
      strengths_count: strengths.length
    });

    return {
      score: finalScore,
      violations,
      strengths
    };
  }

  /**
   * Validate against Social axioms (Level -2)
   *
   * @private
   * @param {string} contentLower - Lowercase content
   * @returns {Object} Validation result for social level
   */
  validateSocial(contentLower) {
    const axioms = CORE_AXIOMS.social;
    let score = 5.0;
    const violations = [];
    const strengths = [];
    let veto = false;
    let vetoReason = null;

    this.logger.debug('axioma-validator', 'level_validation_started', {
      level: 'social',
      level_code: AXIOM_LEVELS.SOCIAL,
      veto_power: true
    });

    // Check for competence+execution focus
    const hasHierarquia = this.containsKeywords(contentLower, axioms.sobre_hierarquia.keywords);
    if (hasHierarquia > 0) {
      score += Math.min(hasHierarquia * 0.5, 2.5);
      strengths.push({
        axiom: 'sobre_hierarquia',
        reason: 'Focus on competence and execution',
        score_impact: '+' + (hasHierarquia * 0.5).toFixed(1)
      });
    }

    // Check for systemic coherence (VETO POWER)
    const hasCoerencia = this.containsKeywords(contentLower, axioms.sobre_pessoas.keywords);
    if (hasCoerencia > 0) {
      score += Math.min(hasCoerencia * 0.5, 2.5);
      strengths.push({
        axiom: 'sobre_pessoas',
        reason: 'Demonstrates systemic coherence',
        score_impact: '+' + (hasCoerencia * 0.5).toFixed(1)
      });
    } else if (contentLower.includes('incoerente') || contentLower.includes('contraditório')) {
      // VETO CONDITION
      veto = true;
      vetoReason = 'Detected systemic incoherence - VETO applied per PV_PA_001';
      violations.push({
        axiom: 'sobre_pessoas',
        reason: vetoReason,
        severity: 'CRITICAL'
      });
      score = 0;
    }

    const finalScore = Math.max(0, Math.min(10, score));

    this.logger.debug('axioma-validator', 'level_validation_completed', {
      level: 'social',
      score: finalScore.toFixed(1),
      violations_count: violations.length,
      strengths_count: strengths.length,
      veto_triggered: veto,
      veto_reason: vetoReason
    });

    return {
      score: finalScore,
      violations,
      strengths,
      veto,
      vetoReason
    };
  }

  /**
   * Validate against Operational axioms (Level 0)
   *
   * @private
   * @param {string} contentLower - Lowercase content
   * @returns {Object} Validation result for operational level
   */
  validateOperational(contentLower) {
    const axioms = CORE_AXIOMS.operational;
    let score = 5.0;
    const violations = [];
    const strengths = [];

    this.logger.debug('axioma-validator', 'level_validation_started', {
      level: 'operational',
      level_code: AXIOM_LEVELS.OPERATIONAL
    });

    // Check for automation consciousness
    const hasAutomacao = this.containsKeywords(contentLower, axioms.automacao_obsessiva.keywords);
    if (hasAutomacao > 0) {
      score += Math.min(hasAutomacao * 0.7, 2.0);
      strengths.push({
        axiom: 'automacao_obsessiva',
        reason: 'Shows automation awareness',
        score_impact: '+' + (hasAutomacao * 0.7).toFixed(1)
      });
    }

    // Check for clarity + execution
    const hasClareza = this.containsKeywords(contentLower, axioms.clareza_radical.keywords);
    if (hasClareza > 0) {
      score += Math.min(hasClareza * 0.6, 2.0);
      strengths.push({
        axiom: 'clareza_radical',
        reason: 'Demonstrates clarity and action orientation',
        score_impact: '+' + (hasClareza * 0.6).toFixed(1)
      });
    }

    // Check for systematization
    const hasSistema = this.containsKeywords(contentLower, axioms.sistematizacao_compulsiva.keywords);
    if (hasSistema > 0) {
      score += Math.min(hasSistema * 0.5, 1.0);
      strengths.push({
        axiom: 'sistematizacao_compulsiva',
        reason: 'Demonstrates systematic thinking',
        score_impact: '+' + (hasSistema * 0.5).toFixed(1)
      });
    }

    // Check for violations
    if (contentLower.includes('manual') && contentLower.includes('repetitivo')) {
      violations.push({
        axiom: 'automacao_obsessiva',
        reason: 'Suggests manual repetitive work (should automate)',
        severity: 'LOW'
      });
      score -= 1.0;
    }

    const finalScore = Math.max(0, Math.min(10, score));

    this.logger.debug('axioma-validator', 'level_validation_completed', {
      level: 'operational',
      score: finalScore.toFixed(1),
      violations_count: violations.length,
      strengths_count: strengths.length
    });

    return {
      score: finalScore,
      violations,
      strengths
    };
  }

  /**
   * Count keyword occurrences in content
   *
   * @private
   * @param {string} content - Content to search
   * @param {Array<string>} keywords - Keywords to find
   * @returns {number} Count of keyword matches
   */
  containsKeywords(content, keywords) {
    let count = 0;
    for (const keyword of keywords) {
      if (content.includes(keyword.toLowerCase())) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get validation history
   *
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array} Validation history
   */
  getHistory(limit = 10) {
    return this.validationHistory.slice(-limit);
  }

  /**
   * Clear validation history
   */
  clearHistory() {
    this.validationHistory = [];
  }

  /**
   * Generate validation report
   *
   * @param {Object} validationResult - Result from validate()
   * @returns {string} Formatted report
   */
  generateReport(validationResult) {
    const { overall_score, level_scores, violations, strengths, recommendation, veto } = validationResult;

    let report = '=== AXIOMA VALIDATION REPORT ===\n\n';
    report += `Overall Score: ${overall_score.toFixed(1)}/10.0\n`;
    report += `Recommendation: ${recommendation}\n`;
    if (veto) {
      report += `⚠️  VETO APPLIED - Critical coherence violation detected\n`;
    }
    report += '\n';

    report += '--- Level Scores ---\n';
    for (const [level, data] of Object.entries(level_scores)) {
      report += `  ${level.toUpperCase()}: ${data.score.toFixed(1)}/10.0\n`;
    }
    report += '\n';

    if (strengths.length > 0) {
      report += '--- Strengths ---\n';
      for (const strength of strengths) {
        report += `  ✓ [${strength.level}] ${strength.reason} (${strength.score_impact})\n`;
      }
      report += '\n';
    }

    if (violations.length > 0) {
      report += '--- Violations ---\n';
      for (const violation of violations) {
        const icon = violation.severity === 'CRITICAL' ? '❌' : violation.severity === 'MEDIUM' ? '⚠️ ' : 'ℹ️ ';
        report += `  ${icon} [${violation.level}] ${violation.reason}\n`;
      }
      report += '\n';
    }

    report += '=================================\n';

    return report;
  }
}

module.exports = {
  AxiomaValidator,
  AXIOM_LEVELS,
  CORE_AXIOMS
};
