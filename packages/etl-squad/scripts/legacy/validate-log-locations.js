#!/usr/bin/env node
/**
 * Validation Script - Log Location Standard Enforcement
 *
 * Scans a mind directory and validates that all files follow the standard:
 * - ONLY sources_master.yaml in sources/
 * - ALL logs, reports, configs in docs/logs/
 * - Content (blogs, downloads, manual) in appropriate directories
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateLogPath, _getSourcesMasterPath } from './scripts/utils/path-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LogLocationValidator {
  constructor(mindDir) {
    this.mindDir = mindDir;
    this.violations = [];
    this.validFiles = [];
  }

  async validate() {
    console.log('🔍 Validating Log Locations\n');
    console.log(`Mind Directory: ${this.mindDir}\n`);

    const sourcesDir = path.join(this.mindDir, 'sources');

    try {
      await fs.access(sourcesDir);
    } catch (_error) {
      console.error(`❌ Sources directory not found: ${sourcesDir}`);
      return false;
    }

    await this._scanDirectory(sourcesDir, sourcesDir);

    this._printReport();

    return this.violations.length === 0;
  }

  async _scanDirectory(dir, rootDir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        // Skip node_modules, .git, etc.
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await this._scanDirectory(fullPath, rootDir);
        }
      } else {
        // Validate file location
        const validation = validateLogPath(fullPath, this.mindDir);

        if (validation.valid) {
          this.validFiles.push({
            path: relativePath,
            reason: validation.reason
          });
        } else {
          this.violations.push({
            path: relativePath,
            fullPath,
            reason: validation.reason
          });
        }
      }
    }
  }

  _printReport() {
    console.log('📊 Validation Report\n');
    console.log('=' .repeat(80));

    if (this.violations.length === 0) {
      console.log('✅ All files follow the log location standard!\n');
      console.log(`Total files checked: ${this.validFiles.length}`);
      console.log(`Violations found: 0\n`);
    } else {
      console.log(`❌ Found ${this.violations.length} violation(s):\n`);

      for (const violation of this.violations) {
        console.log(`  ❌ ${violation.path}`);
        console.log(`     ${violation.reason}`);
        console.log(`     Suggested: Move to docs/logs/\n`);
      }

      console.log('=' .repeat(80));
      console.log('\n🔧 Fix suggestions:\n');
      console.log('Move violations to docs/logs/:');
      for (const violation of this.violations) {
        const filename = path.basename(violation.path);
        const logsPath = path.join('docs/logs', filename);
        console.log(`  mv sources/${violation.path} ${logsPath}`);
      }
      console.log('');
    }

    console.log('=' .repeat(80));
    console.log('\n📋 Summary by type:\n');

    const summary = {
      'sources_master.yaml': 0,
      'Content (blogs/downloads/manual)': 0,
      'Logs/Reports (docs/logs)': 0,
      'Violations': this.violations.length
    };

    for (const file of this.validFiles) {
      if (file.reason.includes('sources_master')) {
        summary['sources_master.yaml']++;
      } else if (file.reason.includes('Content')) {
        summary['Content (blogs/downloads/manual)']++;
      } else if (file.reason.includes('logs directory')) {
        summary['Logs/Reports (docs/logs)']++;
      }
    }

    for (const [type, count] of Object.entries(summary)) {
      const icon = type === 'Violations' && count > 0 ? '❌' : '✅';
      console.log(`  ${icon} ${type}: ${count}`);
    }
    console.log('');
  }

  getSuggestions() {
    if (this.violations.length === 0) return [];

    return this.violations.map(v => ({
      file: v.path,
      from: v.fullPath,
      to: path.join(this.mindDir, 'docs/logs', path.basename(v.path)),
      command: `mv "${v.fullPath}" "${path.join(this.mindDir, 'docs/logs', path.basename(v.path))}"`
    }));
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('Usage: node validate-log-locations.js <mind-directory>');
    console.log('');
    console.log('Example:');
    console.log('  node validate-log-locations.js ../../docs/minds/sam_altman');
    console.log('');
    console.log('Options:');
    console.log('  --fix    Automatically move violations to docs/logs/');
    process.exit(0);
  }

  const mindDir = path.resolve(args[0]);
  const autoFix = args.includes('--fix');

  const validator = new LogLocationValidator(mindDir);
  const isValid = await validator.validate();

  if (!isValid && autoFix) {
    console.log('🔧 Auto-fix enabled, moving violations...\n');

    const suggestions = validator.getSuggestions();
    const logsDir = path.join(mindDir, 'docs/logs');

    await fs.mkdir(logsDir, { recursive: true });

    for (const suggestion of suggestions) {
      try {
        await fs.rename(suggestion.from, suggestion.to);
        console.log(`✅ Moved: ${suggestion.file}`);
      } catch (_error) {
        console.error(`❌ Failed to move ${suggestion.file}: ${error.message}`);
      }
    }

    console.log('\n✅ Auto-fix complete!\n');
  }

  process.exit(isValid ? 0 : 1);
}

main().catch((_error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
