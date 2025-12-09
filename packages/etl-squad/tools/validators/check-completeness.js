// TODO: EXPAND - Validate all sources were downloaded successfully

import fs from 'fs/promises';
import yaml from 'js-yaml';

export async function checkCompleteness(sourcesPath, downloadsDir) {
  const sources = yaml.load(await fs.readFile(sourcesPath, 'utf8')).sources;
  const downloaded = await scanDownloads(downloadsDir);

  const missing = sources.filter(s => !downloaded.includes(s.id));

  return {
    total: sources.length,
    downloaded: downloaded.length,
    missing: missing.length,
    missingIds: missing.map(s => s.id),
    complete: missing.length === 0
  };
}

async function scanDownloads(_dir) {
  // TODO: Implement recursive scan of downloads directory
  return [];
}
