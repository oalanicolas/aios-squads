#!/usr/bin/env node
/**
 * CLI wrapper for ParallelCollector
 * Usage: node run-collection.js --config <config> --sources <sources> --output <output>
 */

import { ParallelCollector } from '../orchestrator/parallel-collector.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let configPath, sourcesPath, outputDir;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' && args[i + 1]) {
      configPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--sources' && args[i + 1]) {
      sourcesPath = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputDir = path.resolve(args[i + 1]);
      i++;
    }
  }

  // Validate arguments
  if (!configPath || !sourcesPath || !outputDir) {
    console.error('Usage: node run-collection.js --config <config> --sources <sources> --output <output>');
    process.exit(1);
  }

  console.log('🚀 ETL Parallel Collector\n');
  console.log('Config:', configPath);
  console.log('Sources:', sourcesPath);
  console.log('Output:', outputDir);
  console.log('');

  try {
    // Initialize collector
    console.log('⚙️  Initializing collectors...');
    const collector = new ParallelCollector(configPath, {
      maxConcurrent: 5,
      allowResume: true,
      progressRefresh: 2000
    });

    await collector.initialize();
    console.log('✅ Collectors initialized\n');

    // Start collection
    console.log('📥 Starting parallel collection...\n');
    const report = await collector.collectAll(sourcesPath, outputDir);

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 COLLECTION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Sources: ${report.totals.total}`);
    console.log(`✅ Successful: ${report.totals.successful}`);
    console.log(`❌ Failed: ${report.totals.failed}`);
    console.log(`⏭️  Skipped: ${report.totals.skipped}`);
    console.log(`📈 Success Rate: ${report.totals.successRate}%`);
    console.log(`⏱️  Duration: ${report.duration_human}`);
    console.log('='.repeat(60));

    // Show details by type
    if (report.progress) {
      console.log('\n📦 By Type:');
      for (const [type, stats] of Object.entries(report.progress)) {
        console.log(`  ${type}: ${stats.completed}/${stats.total} (${stats.failed} failed)`);
      }
    }

    // Show failed sources if any
    if (report.results.failed.length > 0) {
      console.log('\n⚠️  Failed Sources:');
      report.results.failed.forEach(task => {
        console.log(`  - ${task.id}: ${task.error || 'Unknown error'}`);
      });
    }

    console.log('\n✨ Collection complete!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Collection failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Received SIGINT, shutting down gracefully...');
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log('\n\n⚠️  Received SIGTERM, shutting down gracefully...');
  process.exit(143);
});

main();
