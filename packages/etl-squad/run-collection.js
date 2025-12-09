#!/usr/bin/env node
/**
 * ETL Collection Runner - Sam Altman Tier 1 Sources
 * Simple CLI to execute parallel collection
 */

import { ParallelCollector } from './scripts/orchestrator/parallel-collector.js';
import { _getLogPath, _getSourcesMasterPath, _getDownloadsDir } from './scripts/utils/path-helpers.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🚀 ETL Data Collector - Universal Source Collection\n');

  // Parse CLI arguments (AIOS-compliant: no hardcoded paths)
  const sourcesPath = process.argv[2];
  const outputDir = process.argv[3];
  const configPath = process.argv[4] || path.join(__dirname, 'config/download-rules.yaml');

  // Validate required arguments
  if (!sourcesPath || !outputDir) {
    console.error('❌ Usage: node run-collection.js <sources-path> <output-dir> [config-path]');
    console.error('\nExample:');
    console.error('  node run-collection.js \\');
    console.error('    /path/to/sources.yaml \\');
    console.error('    /path/to/output \\');
    console.error('    ./config/download-rules.yaml');
    console.error('\nAIOS Pattern:');
    console.error('  Invoke from MMOS via task with explicit parameters');
    process.exit(1);
  }

  // Check if sources file exists
  try {
    await fs.access(sourcesPath);
  } catch (_error) {
    console.error(`❌ Sources file not found: ${sourcesPath}`);
    console.error('   Please provide a valid path to sources.yaml');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (_error) {
    console.warn(`⚠️  Could not create output directory: ${error.message}`);
  }

  // Initialize collector
  console.log('📋 Configuration:');
  console.log(`   Sources: ${sourcesPath}`);
  console.log(`   Output:  ${outputDir}`);
  console.log(`   Config:  ${configPath}\n`);

  const collector = new ParallelCollector(configPath, {
    outputDir,  // Pass outputDir instead of mindDir
    maxConcurrent: 3,
    allowResume: true
  });

  try {
    await collector.initialize();
    console.log('✅ Collector initialized\n');

    console.log('⏳ Starting parallel collection...\n');
    const report = await collector.collectAll(sourcesPath, outputDir);

    console.log('\n📊 Collection Report:');
    console.log(`   Total:      ${report.totals.total}`);
    console.log(`   Successful: ${report.totals.successful} (${report.totals.successRate}%)`);
    console.log(`   Failed:     ${report.totals.failed}`);
    console.log(`   Skipped:    ${report.totals.skipped}`);
    console.log(`   Duration:   ${report.duration_human}\n`);

    // Save report - derive log path from output directory structure
    // If outputDir is {something}/sources/downloads, logs should be at {something}/docs/logs
    // Otherwise, save in outputDir parent with 'logs' subdirectory
    const logsDir = outputDir.includes('/sources/downloads')
      ? path.join(outputDir, '../../docs/logs')
      : path.join(path.dirname(outputDir), 'logs');

    await fs.mkdir(logsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportPath = path.join(logsDir, `${timestamp}-collection-report.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    console.log(`💾 Report saved: ${reportPath}\n`);

    if (report.totals.failed > 0) {
      console.log('⚠️  Some sources failed to collect:');
      for (const failed of report.results.failed) {
        console.log(`   - ${failed.id}: ${failed.error || 'Unknown error'}`);
      }
      console.log('');
    }

    console.log('✅ Collection complete!\n');
    process.exit(0);

  } catch (_error) {
    console.error(`\n❌ Collection failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch((_error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
