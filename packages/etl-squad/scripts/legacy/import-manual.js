#!/usr/bin/env node
/**
 * Manual Import Tool for ETL Data Collector
 * Processes manually collected transcripts/content
 *
 * Usage:
 *   node import-manual.js --source s001 --file /path/to/transcript.txt --mind sam_altman
 *   node import-manual.js --batch --mind sam_altman
 */

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ManualImporter {
  constructor(mindName) {
    this.mindName = mindName;
    this.mindDir = path.join(__dirname, '../../docs/minds', mindName);
    this.manualDir = path.join(this.mindDir, 'sources/manual');
    this.outputDir = path.join(this.mindDir, 'sources/downloads/youtube');
    this.logsDir = path.join(this.mindDir, 'docs/logs');
  }

  async initialize() {
    await fs.mkdir(this.manualDir, { recursive: true });
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(this.logsDir, { recursive: true });
  }

  async importSingle(sourceId, manualFilePath) {
    console.log(`\n📥 Importing manual collection for source: ${sourceId}`);

    // Read manual file
    const rawContent = await fs.readFile(manualFilePath, 'utf-8');

    // Load source metadata
    const sourcesPath = path.join(this.mindDir, 'sources/sources_master.yaml');
    const sourcesData = yaml.load(await fs.readFile(sourcesPath, 'utf-8'));
    const source = this._findSource(sourcesData, sourceId);

    if (!source) {
      throw new Error(`Source ${sourceId} not found in sources_master.yaml`);
    }

    // Process and format
    const processed = this._processManualContent(rawContent, source);

    // Save to output directory
    const sourceDir = path.join(this.outputDir, sourceId);
    await fs.mkdir(sourceDir, { recursive: true });

    const transcriptPath = path.join(sourceDir, 'transcript.md');
    const metadataPath = path.join(sourceDir, 'metadata.json');

    await fs.writeFile(transcriptPath, processed.markdown, 'utf-8');
    await fs.writeFile(metadataPath, JSON.stringify(processed.metadata, null, 2), 'utf-8');

    console.log(`✅ Imported successfully`);
    console.log(`   📄 Transcript: ${transcriptPath}`);
    console.log(`   📋 Metadata: ${metadataPath}`);

    // Log import
    await this._logImport(sourceId, manualFilePath, 'SUCCESS');

    return processed;
  }

  async importBatch() {
    console.log(`\n🔄 Batch import mode: processing all files in ${this.manualDir}`);

    const files = await fs.readdir(this.manualDir);
    const results = { successful: [], failed: [] };

    for (const file of files) {
      if (!file.endsWith('.txt') && !file.endsWith('.md')) continue;

      const sourceId = path.basename(file, path.extname(file));
      const filePath = path.join(this.manualDir, file);

      try {
        await this.importSingle(sourceId, filePath);
        results.successful.push(sourceId);
      } catch (error) {
        console.error(`❌ Failed to import ${sourceId}: ${error.message}`);
        results.failed.push({ sourceId, error: error.message });
        await this._logImport(sourceId, filePath, 'FAILED', error.message);
      }
    }

    console.log(`\n📊 Batch Import Summary:`);
    console.log(`   Successful: ${results.successful.length}`);
    console.log(`   Failed: ${results.failed.length}`);

    return results;
  }

  _findSource(sourcesData, sourceId) {
    const allSources = [
      ...(sourcesData.sources_by_tier?.tier_1_critical?.sources || []),
      ...(sourcesData.sources_by_tier?.tier_2_important?.sources || []),
      ...(sourcesData.sources_by_tier?.tier_3_supplementary?.sources || [])
    ];

    return allSources.find(s => s.id === sourceId);
  }

  _processManualContent(rawContent, source) {
    // Format as markdown with metadata
    let markdown = `# ${source.title}\n\n`;
    markdown += `**Source ID:** ${source.id}\n`;
    markdown += `**URL:** ${source.url}\n`;
    markdown += `**Collection Method:** Manual Import\n`;
    markdown += `**Import Date:** ${new Date().toISOString()}\n`;
    markdown += `**Layers:** ${source.layers.join(', ')}\n\n`;

    if (source.layer_8_evidence) {
      markdown += `**Layer 8 Evidence:** ${source.layer_8_evidence}\n\n`;
    }

    markdown += `---\n\n## Content\n\n`;
    markdown += rawContent;

    const metadata = {
      source_id: source.id,
      title: source.title,
      url: source.url,
      collection_method: 'manual_import',
      import_timestamp: new Date().toISOString(),
      layers: source.layers,
      word_count: rawContent.split(/\s+/).length,
      char_count: rawContent.length
    };

    return { markdown, metadata };
  }

  async _logImport(sourceId, filePath, status, errorMessage = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const logPath = path.join(this.logsDir, `${timestamp}-manual-import-${sourceId}.yaml`);

    const logEntry = {
      source_id: sourceId,
      manual_file: filePath,
      status,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    await fs.writeFile(logPath, yaml.dump(logEntry, { indent: 2 }), 'utf-8');
  }

  async createTemplate(sourceId) {
    console.log(`\n📝 Creating manual collection template for: ${sourceId}`);

    const templatePath = path.join(this.manualDir, `${sourceId}.txt`);

    const template = `# Manual Collection Template
# Source: ${sourceId}
# Instructions:
# 1. Watch/listen to the source
# 2. Paste transcript or detailed notes below
# 3. Run: node import-manual.js --source ${sourceId} --mind ${this.mindName}
#
# Delete these comment lines before importing

[PASTE TRANSCRIPT OR NOTES HERE]
`;

    await fs.writeFile(templatePath, template, 'utf-8');
    console.log(`✅ Template created: ${templatePath}`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Open file and paste content`);
    console.log(`   2. Run: node import-manual.js --source ${sourceId} --mind ${this.mindName}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const mind = args[args.indexOf('--mind') + 1] || 'sam_altman';
  const sourceId = args[args.indexOf('--source') + 1];
  const filePath = args[args.indexOf('--file') + 1];
  const batch = args.includes('--batch');
  const template = args.includes('--template');

  const importer = new ManualImporter(mind);
  await importer.initialize();

  if (template && sourceId) {
    await importer.createTemplate(sourceId);
  } else if (batch) {
    await importer.importBatch();
  } else if (sourceId && filePath) {
    await importer.importSingle(sourceId, filePath);
  } else {
    console.log(`
📥 ETL Manual Import Tool

Usage:
  Import single source:
    node import-manual.js --source s001 --file /path/to/transcript.txt --mind sam_altman

  Batch import all files in manual/ directory:
    node import-manual.js --batch --mind sam_altman

  Create template file:
    node import-manual.js --template --source s001 --mind sam_altman

Manual File Location:
  docs/minds/{mind}/sources/manual/{source_id}.txt

Output Location:
  docs/minds/{mind}/sources/downloads/youtube/{source_id}/transcript.md

Logs Location:
  docs/minds/{mind}/docs/logs/{timestamp}-manual-import-{source_id}.yaml
    `);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 Fatal error:', error.message);
  process.exit(1);
});
