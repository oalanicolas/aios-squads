/**
 * Sample Process Mapping - PV Mode Example
 *
 * This example demonstrates how to use Hybrid-Ops in PV mode
 * to map a simple business process with cognitive validation.
 *
 * Usage:
 *   node examples/sample-process-mapping.js
 *
 * Prerequisites:
 *   - Mind artifacts available in outputs/minds/pedro_valerio/
 *   - Hybrid-Ops dependencies installed (npm install)
 */

const { loadMind } = require('../utils/mind-loader');
const { getSessionManager } = require('../utils/session-manager');
const { AxiomaValidator } = require('../utils/axioma-validator');

/**
 * Sample process: Onboarding a new client
 */
const sampleProcess = {
  name: 'Client Onboarding Process',
  description: 'Standard procedure for onboarding new enterprise clients',
  steps: [
    {
      id: 'step-1',
      name: 'Initial consultation',
      description: 'Discovery call to understand client needs and requirements',
      estimatedDuration: '2 hours',
      owner: 'Sales Team'
    },
    {
      id: 'step-2',
      name: 'Contract negotiation',
      description: 'Review and finalize service agreement and pricing',
      estimatedDuration: '1 week',
      owner: 'Legal + Sales'
    },
    {
      id: 'step-3',
      name: 'Kickoff meeting',
      description: 'Introduce team, establish timeline, confirm deliverables',
      estimatedDuration: '1 hour',
      owner: 'Project Manager'
    },
    {
      id: 'step-4',
      name: 'System setup',
      description: 'Configure client account, access permissions, and integrations',
      estimatedDuration: '3 days',
      owner: 'Technical Team'
    },
    {
      id: 'step-5',
      name: 'Training sessions',
      description: 'Conduct user training for client team members',
      estimatedDuration: '2 days',
      owner: 'Customer Success'
    }
  ]
};

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║  Hybrid-Ops PV Mode - Sample Process Mapping          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Load PV Mind (with cognitive heuristics)
    console.log('🧠 Loading Pedro Valério Mind...');
    const sessionManager = getSessionManager();
    const session = await sessionManager.getSession('sample-process-session');
    const mind = session.mind;
    console.log('   ✅ Mind loaded with compiled heuristics\n');

    // Step 2: Initialize Axioma Validator
    console.log('🔍 Initializing validation system...');
    const validator = new AxiomaValidator(mind.metaAxiomas);
    console.log('   ✅ Validator ready (4-level axiom hierarchy)\n');

    // Step 3: Process each step through cognitive validation
    console.log(`📋 Processing: ${sampleProcess.name}\n`);
    console.log(`   Steps to validate: ${sampleProcess.steps.length}\n`);

    for (const step of sampleProcess.steps) {
      console.log(`─────────────────────────────────────────────────────────`);
      console.log(`Processing Step: ${step.name}`);
      console.log(`─────────────────────────────────────────────────────────\n`);

      // Apply heuristics
      console.log('⚡ Applying PV heuristics...');

      // Heuristic 1: Future Back-Casting (PV_BS_001)
      const visionScore = mind.futureBackCasting({
        endStateClarity: 0.85,  // Clear desired outcome
        marketAlignment: 0.80    // Well-aligned with market needs
      });
      console.log(`   PV_BS_001 (Future Back-Casting): ${visionScore.recommendation}`);

      // Heuristic 2: Coherence Scan (PV_PA_001)
      const coherenceScore = mind.coherenceScan({
        person: {
          truthfulness: 0.90,      // High trustworthiness
          systemAdherence: 0.85,   // Follows process
          skillMatch: 0.90         // Qualified for role
        }
      });
      console.log(`   PV_PA_001 (Coherence Scan): ${coherenceScore.recommendation}`);

      // Heuristic 3: Automation Check (PV_PM_001)
      const automationScore = mind.automationCheck({
        frequency: 20,            // Runs frequently (20x/month)
        standardization: 0.75,    // Moderately standardized
        riskLevel: 'medium',      // Medium risk
        automationReadiness: 0.70 // Good automation candidate
      });
      console.log(`   PV_PM_001 (Automation Check): ${automationScore.recommendation}\n`);

      // Axioma validation
      console.log('🔍 Validating against META_AXIOMAS...');
      const validationResult = await validator.validate({
        taskName: step.name,
        description: step.description,
        completeness: 0.85,
        actionOrientation: 0.90,
        progressIndicators: 0.80,
        riskMitigation: 0.75
      });

      console.log(`   Overall Score: ${validationResult.overall_score.toFixed(2)}/10`);
      console.log(`   Recommendation: ${validationResult.recommendation}`);
      console.log(`   Veto: ${validationResult.veto ? '❌ YES' : '✅ NO'}\n`);

      if (validationResult.violations.length > 0) {
        console.log('   ⚠️  Violations detected:');
        validationResult.violations.forEach(v => {
          console.log(`      - ${v}`);
        });
        console.log();
      }

      if (validationResult.strengths.length > 0) {
        console.log('   ✅ Strengths:');
        validationResult.strengths.slice(0, 2).forEach(s => {
          console.log(`      - ${s}`);
        });
        console.log();
      }
    }

    // Step 4: Summary
    console.log('═════════════════════════════════════════════════════════');
    console.log('VALIDATION SUMMARY');
    console.log('═════════════════════════════════════════════════════════\n');
    console.log(`✅ Process: ${sampleProcess.name}`);
    console.log(`✅ Steps validated: ${sampleProcess.steps.length}`);
    console.log(`✅ Mode: PV (Pedro Valério Cognitive Architecture)`);
    console.log(`✅ Validation: Axioma 4-level hierarchy + 3 heuristics\n`);

    console.log('This sample demonstrates:');
    console.log('  1. Mind loading and session management');
    console.log('  2. Heuristic execution (PV_BS_001, PV_PA_001, PV_PM_001)');
    console.log('  3. Axioma validation (4-level quality gates)');
    console.log('  4. Cognitive decision transparency\n');

    // Cleanup
    sessionManager.endSession('sample-process-session');
    console.log('✅ Sample execution complete!\n');

  } catch (error) {
    console.error('❌ Error during sample execution:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Verify mind artifacts exist: ls outputs/minds/pedro_valerio/');
    console.error('  2. Check dependencies installed: npm install');
    console.error('  3. Review error details above\n');
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { sampleProcess, main };
