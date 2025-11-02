/**
 * Workflow Orchestrator Module
 * Story: 1.8 - Phase 3 Workflow Orchestration
 *
 * Orchestrates the 9-phase Hybrid-Ops workflow with embedded PV validation gates.
 * Supports two modes:
 * - PV Mode: Full validation with strategic alignment, coherence, and quality gates
 * - Generic Mode: Bypasses validation for faster execution
 */

const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
const { executeValidationGate } = require('./validation-gate');

/**
 * Load workflow configuration from YAML file
 *
 * @param {string} workflowPath - Path to workflow YAML file
 * @returns {Object} Parsed workflow configuration
 */
function loadWorkflowConfig(workflowPath = null) {
  const defaultPath = path.join(__dirname, '..', 'workflows', 'hybrid-ops-pv.yaml');
  const configPath = workflowPath || defaultPath;

  if (!fs.existsSync(configPath)) {
    throw new Error(`Workflow configuration not found: ${configPath}`);
  }

  try {
    const yamlContent = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.parse(yamlContent);

    if (!config.workflow) {
      throw new Error('Invalid workflow config: missing "workflow" root key');
    }

    console.log(`✓ Loaded workflow: ${config.workflow.name} v${config.workflow.version}`);
    console.log(`  Mode: ${config.workflow.mode || 'PV'}`);
    console.log(`  Phases: ${config.workflow.phases.length}`);
    console.log(`  Validation Checkpoints: ${config.workflow.metadata?.validation_checkpoints || 0}`);

    return config.workflow;

  } catch (error) {
    throw new Error(`Failed to load workflow config: ${error.message}`);
  }
}

/**
 * Prompt user to select workflow execution mode
 *
 * @param {boolean} interactive - Whether to show interactive prompt
 * @returns {Promise<string>} Selected mode ('PV' or 'Generic')
 */
async function promptModeSelection(interactive = true) {
  if (!interactive) {
    // Non-interactive: default to PV mode
    return 'PV';
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔀 WORKFLOW MODE SELECTION`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`Choose workflow execution mode:\n`);

  console.log(`📋 [1] PV Mode (RECOMMENDED)`);
  console.log(`   • Full Pedro Valério validation gates`);
  console.log(`   • Strategic alignment (PV_BS_001)`);
  console.log(`   • Coherence scan (PV_PA_001) with VETO power`);
  console.log(`   • Automation readiness (PV_PM_001)`);
  console.log(`   • Axioma compliance (≥7.0/10.0)`);
  console.log(`   • Quality assurance by construction`);
  console.log(`   • May abort if critical validation fails\n`);

  console.log(`⚡ [2] Generic Mode (FAST)`);
  console.log(`   • No validation gates`);
  console.log(`   • Faster execution`);
  console.log(`   • Suitable for prototyping/exploration`);
  console.log(`   • Lower quality assurance`);
  console.log(`   • No VETO enforcement\n`);

  // In real implementation, this would use readline or inquirer
  // For now, we'll simulate the prompt with a default
  // TODO: Replace with actual CLI prompt library (inquirer, prompts, etc.)

  console.log(`Enter choice [1/2] (default: 1 for PV Mode):`);

  // Simulated user input - in real implementation, would read from stdin
  // const readline = require('readline');
  // const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  // const answer = await new Promise(resolve => rl.question('> ', resolve));
  // rl.close();

  const choice = '1'; // Default to PV mode for safety

  if (choice === '2') {
    console.log(`\n✅ Selected: Generic Mode (validation disabled)\n`);
    return 'Generic';
  } else {
    console.log(`\n✅ Selected: PV Mode (full validation enabled)\n`);
    return 'PV';
  }
}

/**
 * Run the complete Hybrid-Ops workflow
 *
 * @param {Object} options - Workflow execution options
 * @param {string} options.workflowPath - Path to workflow YAML (optional)
 * @param {string} options.mode - Execution mode: 'PV' or 'Generic' (optional, prompts if not provided)
 * @param {Object} options.initialContext - Initial context data (optional)
 * @param {boolean} options.interactive - Enable interactive prompts (default: true)
 * @returns {Promise<Object>} Workflow execution result
 */
async function runWorkflow(options = {}) {
  const {
    workflowPath = null,
    mode = null,
    initialContext = {},
    interactive = true
  } = options;

  // Load workflow configuration
  const workflowConfig = loadWorkflowConfig(workflowPath);

  // Determine execution mode
  // Priority: 1. Provided mode parameter, 2. Interactive prompt, 3. Workflow config, 4. Default 'PV'
  let executionMode = mode;

  if (!executionMode && interactive) {
    // No mode provided - prompt user to select
    executionMode = await promptModeSelection(interactive);
  }

  if (!executionMode) {
    // Still no mode - use workflow config or default
    executionMode = workflowConfig.mode || 'PV';
  }

  console.log(`\n🚀 Starting Hybrid-Ops Workflow (${executionMode} mode)\n`);

  // Workflow execution state
  const state = {
    mode: executionMode,
    startTime: Date.now(),
    results: [],
    validationResults: [],
    currentPhase: null,
    context: { ...initialContext },
    status: 'RUNNING'
  };

  try {
    // Execute each phase sequentially
    for (const phase of workflowConfig.phases) {
      state.currentPhase = phase;

      console.log(`\n${'='.repeat(80)}`);
      console.log(`📍 Phase ${phase.id}: ${phase.name}`);
      console.log(`   Agent: ${phase.agent}`);
      console.log(`   Estimated Duration: ${phase.estimated_duration}`);
      console.log(`${'='.repeat(80)}\n`);

      // Execute phase
      const phaseResult = await executePhase(phase, state);
      state.results.push(phaseResult);

      // Update context with phase outputs
      state.context[`phase_${phase.id}`] = phaseResult;

      console.log(`\n✓ Phase ${phase.id} completed`);

      // Run validation gate if configured and mode is PV
      if (phase.validation && phase.validation !== 'none' && executionMode === 'PV') {
        console.log(`\n🔍 Running validation checkpoint...`);

        const gateResult = await executeValidationGate(phase, phaseResult.output);
        state.validationResults.push({
          phase: phase.id,
          checkpoint: gateResult.gate,
          result: gateResult
        });

        if (!gateResult.passed) {
          // Validation failed
          console.error(`\n❌ Validation gate failed: ${gateResult.gate}`);
          console.log(gateResult.feedback);

          // Handle validation failure
          const action = await handleValidationFailure(
            gateResult,
            phase,
            workflowConfig.settings,
            interactive
          );

          if (action === 'ABORT') {
            state.status = 'ABORTED';
            state.abortedAt = phase.id;
            state.abortReason = `Validation gate "${gateResult.gate}" failed`;
            break;
          } else if (action === 'SKIP') {
            console.log(`⚠️  Skipping validation for ${gateResult.gate} (manual override)`);
            state.validationResults[state.validationResults.length - 1].overridden = true;
          } else if (action === 'RETRY') {
            // Re-execute phase after fixes
            console.log(`\n🔄 Retrying phase ${phase.id} after fixes...`);
            const retryResult = await executePhase(phase, state);
            state.results[state.results.length - 1] = retryResult;
            state.context[`phase_${phase.id}`] = retryResult;
          }

        } else {
          // Validation passed
          console.log(`✅ Validation gate passed: ${gateResult.gate}`);
          if (gateResult.score !== undefined) {
            console.log(`   Score: ${gateResult.score.toFixed(2)}`);
          }
        }
      }
    }

    // Workflow completion
    if (state.status === 'RUNNING') {
      state.status = 'COMPLETED';
    }

  } catch (error) {
    console.error(`\n❌ Workflow execution error:`, error);
    state.status = 'ERROR';
    state.error = error.message;
  }

  // Calculate metrics
  state.endTime = Date.now();
  state.duration = state.endTime - state.startTime;
  state.phasesCompleted = state.results.length;
  state.validationsExecuted = state.validationResults.length;
  state.validationsPassed = state.validationResults.filter(v => v.result.passed).length;
  state.validationsFailed = state.validationResults.filter(v => !v.result.passed && !v.overridden).length;
  state.validationsOverridden = state.validationResults.filter(v => v.overridden).length;

  // Generate completion summary
  printWorkflowSummary(state, workflowConfig);

  // Generate validation report if configured
  if (workflowConfig.settings?.generate_validation_reports && state.validationResults.length > 0) {
    await generateValidationReport(state, workflowConfig);
  }

  return state;
}

/**
 * Execute a single workflow phase
 *
 * @param {Object} phase - Phase configuration
 * @param {Object} state - Current workflow state
 * @returns {Promise<Object>} Phase execution result
 */
async function executePhase(phase, state) {
  const startTime = Date.now();

  // Build agent context
  const agentContext = buildAgentContext(phase, state);

  // Note: Actual agent activation would happen here
  // For now, we return a mock result structure
  console.log(`   Activating agent: ${phase.agent}`);
  console.log(`   Workflow context provided: phase=${phase.id}, mode=${state.mode}`);

  // Mock phase execution (in real implementation, this would activate the agent)
  const output = {
    phase_id: phase.id,
    phase_name: phase.name,
    agent: phase.agent,
    agentContext,
    outputs: phase.outputs || [],
    executed_at: new Date().toISOString(),
    // In real implementation, agent would populate this with actual outputs
    data: {}
  };

  const duration = Date.now() - startTime;

  return {
    phase_id: phase.id,
    phase_name: phase.name,
    agent: phase.agent,
    status: 'completed',
    duration,
    output
  };
}

/**
 * Build context object for agent activation
 *
 * @param {Object} phase - Current phase configuration
 * @param {Object} state - Current workflow state
 * @returns {Object} Agent context with workflow information
 */
function buildAgentContext(phase, state) {
  // Get previous phases
  const previousPhases = state.results.map(r => ({
    id: r.phase_id,
    name: r.phase_name,
    status: r.status,
    output: r.output
  }));

  // Build validation context
  let validationContext = null;
  if (phase.validation && phase.validation !== 'none') {
    validationContext = {
      next_checkpoint: phase.validation.checkpoint,
      heuristic: phase.validation.heuristic,
      validator: phase.validation.validator,
      criteria: phase.validation.criteria,
      veto_conditions: phase.validation.veto_conditions
    };
  }

  return {
    workflow: {
      phase: {
        id: phase.id,
        name: phase.name,
        description: phase.description
      },
      validation: validationContext,
      mode: state.mode,
      previous_phases: previousPhases
    }
  };
}

/**
 * Handle validation failure
 *
 * @param {Object} gateResult - Validation gate result
 * @param {Object} phase - Current phase
 * @param {Object} settings - Workflow settings
 * @param {boolean} interactive - Enable user prompts
 * @returns {Promise<string>} Action: 'FIX', 'SKIP', 'ABORT', 'RETRY'
 */
async function handleValidationFailure(gateResult, phase, settings, interactive) {
  // Check fail_fast setting
  if (settings?.fail_fast && gateResult.veto) {
    console.log(`\n🛑 VETO condition triggered - workflow cannot continue`);
    return 'ABORT';
  }

  // Check manual override allowed
  const allowOverride = settings?.allow_manual_override !== false;

  if (!interactive) {
    // Non-interactive mode: use defaults
    if (gateResult.veto) {
      return 'ABORT';
    }
    return allowOverride ? 'SKIP' : 'ABORT';
  }

  // Interactive prompt
  console.log(`\n⚠️  Validation failure requires your decision:`);

  if (gateResult.veto) {
    console.log(`\nOptions:`);
    console.log(`  [1] FIX - Address veto conditions and retry this phase`);
    console.log(`  [2] ABORT - Stop workflow execution`);
    console.log(`\nVETO conditions cannot be skipped.`);

    // In real implementation, this would prompt the user
    // For now, return default action
    return 'ABORT';
  } else {
    console.log(`\nOptions:`);
    console.log(`  [1] FIX - Address issues and retry this phase`);
    if (allowOverride) {
      console.log(`  [2] SKIP - Continue workflow (document override)`);
    }
    console.log(`  [3] ABORT - Stop workflow execution`);

    // In real implementation, this would prompt the user
    // For now, return default action
    return allowOverride ? 'SKIP' : 'ABORT';
  }
}

/**
 * Print workflow execution summary
 *
 * @param {Object} state - Final workflow state
 * @param {Object} config - Workflow configuration
 */
function printWorkflowSummary(state, config) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 WORKFLOW EXECUTION SUMMARY`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nWorkflow: ${config.name}`);
  console.log(`Status: ${state.status}`);
  console.log(`Duration: ${(state.duration / 1000).toFixed(1)}s`);
  console.log(`\nPhases:`);
  console.log(`  Total: ${config.phases.length}`);
  console.log(`  Completed: ${state.phasesCompleted}`);

  if (state.status === 'ABORTED') {
    console.log(`  Aborted at: Phase ${state.abortedAt}`);
    console.log(`  Reason: ${state.abortReason}`);
  }

  if (state.validationResults.length > 0) {
    console.log(`\nValidation Gates:`);
    console.log(`  Executed: ${state.validationsExecuted}`);
    console.log(`  Passed: ${state.validationsPassed} ✓`);
    console.log(`  Failed: ${state.validationsFailed} ✗`);
    if (state.validationsOverridden > 0) {
      console.log(`  Overridden: ${state.validationsOverridden} ⚠️`);
    }

    console.log(`\nValidation Details:`);
    state.validationResults.forEach(v => {
      const icon = v.result.passed ? '✓' : (v.overridden ? '⚠️' : '✗');
      const veto = v.result.veto ? ' (VETO)' : '';
      console.log(`  ${icon} Phase ${v.phase}: ${v.checkpoint}${veto}`);
    });
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

/**
 * Generate validation report
 *
 * @param {Object} state - Workflow execution state
 * @param {Object} config - Workflow configuration
 */
async function generateValidationReport(state, config) {
  const reportDir = path.join(
    __dirname,
    '..',
    config.settings.validation_report_path || 'logs/validation/'
  );

  // Ensure directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `validation-report-${timestamp}.json`);

  const report = {
    workflow: config.name,
    version: config.version,
    mode: state.mode,
    execution: {
      status: state.status,
      duration_ms: state.duration,
      started_at: new Date(state.startTime).toISOString(),
      ended_at: new Date(state.endTime).toISOString()
    },
    phases: {
      total: config.phases.length,
      completed: state.phasesCompleted,
      aborted_at: state.abortedAt || null
    },
    validation: {
      executed: state.validationsExecuted,
      passed: state.validationsPassed,
      failed: state.validationsFailed,
      overridden: state.validationsOverridden,
      details: state.validationResults
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Validation report generated: ${reportPath}`);
}

/**
 * Get workflow status
 *
 * @param {string} workflowPath - Path to workflow YAML
 * @returns {Object} Workflow configuration status
 */
function getWorkflowStatus(workflowPath = null) {
  const config = loadWorkflowConfig(workflowPath);

  const validationPhases = config.phases.filter(p => p.validation && p.validation !== 'none');

  return {
    name: config.name,
    version: config.version,
    mode: config.mode,
    total_phases: config.phases.length,
    validation_checkpoints: validationPhases.length,
    estimated_duration: config.metadata?.total_estimated_duration,
    settings: config.settings
  };
}

module.exports = {
  runWorkflow,
  loadWorkflowConfig,
  executePhase,
  getWorkflowStatus,
  buildAgentContext,
  promptModeSelection
};
