/**
 * Path Helpers - Standard paths for ETL system
 *
 * STANDARD ENFORCEMENT:
 * - ONLY sources_master.yaml belongs in {mind}/sources/
 * - ALL logs, reports, configs go to {mind}/docs/logs/
 */

import path from 'path';

/**
 * Get the logs directory for a mind
 * @param {string} mindDir - Absolute path to mind directory (e.g., docs/minds/sam_altman)
 * @returns {string} Absolute path to logs directory
 * @example
 * getLogsDir('/path/to/docs/minds/sam_altman')
 * // Returns: '/path/to/docs/minds/sam_altman/docs/logs'
 */
export function getLogsDir(mindDir) {
  return path.join(mindDir, 'docs/logs');
}

/**
 * Get timestamped filename for logs
 * @param {string} baseName - Base name without extension (e.g., 'collection-report')
 * @param {string} extension - File extension (e.g., 'yaml', 'json', 'md')
 * @returns {string} Timestamped filename
 * @example
 * getTimestampedLogName('collection-report', 'yaml')
 * // Returns: '2025-10-11T21-10-48-collection-report.yaml'
 */
export function getTimestampedLogName(baseName, extension = 'yaml') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${timestamp}-${baseName}.${extension}`;
}

/**
 * Get full path for timestamped log file
 * @param {string} mindDir - Absolute path to mind directory
 * @param {string} baseName - Base name without extension
 * @param {string} extension - File extension (default: 'yaml')
 * @returns {string} Full path to log file
 * @example
 * getLogPath('/path/to/docs/minds/sam_altman', 'collection-report', 'json')
 * // Returns: '/path/to/docs/minds/sam_altman/docs/logs/2025-10-11T21-10-48-collection-report.json'
 */
export function getLogPath(mindDir, baseName, extension = 'yaml') {
  const logsDir = getLogsDir(mindDir);
  const filename = getTimestampedLogName(baseName, extension);
  return path.join(logsDir, filename);
}

/**
 * Get the sources master file path
 * @param {string} mindDir - Absolute path to mind directory
 * @returns {string} Absolute path to sources_master.yaml
 * @example
 * getSourcesMasterPath('/path/to/docs/minds/sam_altman')
 * // Returns: '/path/to/docs/minds/sam_altman/sources/sources_master.yaml'
 */
export function getSourcesMasterPath(mindDir) {
  return path.join(mindDir, 'sources/sources_master.yaml');
}

/**
 * Get the downloads directory for a mind
 * @param {string} mindDir - Absolute path to mind directory
 * @returns {string} Absolute path to downloads directory
 * @example
 * getDownloadsDir('/path/to/docs/minds/sam_altman')
 * // Returns: '/path/to/docs/minds/sam_altman/sources/downloads'
 */
export function getDownloadsDir(mindDir) {
  return path.join(mindDir, 'sources/downloads');
}

/**
 * Get the blogs directory for a mind
 * @param {string} mindDir - Absolute path to mind directory
 * @returns {string} Absolute path to blogs directory
 * @example
 * getBlogsDir('/path/to/docs/minds/sam_altman')
 * // Returns: '/path/to/docs/minds/sam_altman/sources/blogs'
 */
export function getBlogsDir(mindDir) {
  return path.join(mindDir, 'sources/blogs');
}

/**
 * Get the manual import directory for a mind
 * @param {string} mindDir - Absolute path to mind directory
 * @returns {string} Absolute path to manual directory
 * @example
 * getManualDir('/path/to/docs/minds/sam_altman')
 * // Returns: '/path/to/docs/minds/sam_altman/sources/manual'
 */
export function getManualDir(mindDir) {
  return path.join(mindDir, 'sources/manual');
}

/**
 * Validate that a file path follows log location standards
 * @param {string} filePath - Path to validate
 * @param {string} mindDir - Mind directory to check against
 * @returns {object} Validation result with { valid: boolean, reason: string }
 */
export function validateLogPath(filePath, mindDir) {
  const logsDir = getLogsDir(mindDir);
  const sourcesDir = path.join(mindDir, 'sources');
  const sourcesMaster = getSourcesMasterPath(mindDir);

  // Allow anything in logs directory
  if (filePath.startsWith(logsDir)) {
    return { valid: true, reason: 'File in logs directory' };
  }

  // Allow sources_master.yaml in sources/
  if (filePath === sourcesMaster) {
    return { valid: true, reason: 'sources_master.yaml in correct location' };
  }

  // Allow content directories (blogs, downloads, manual)
  const allowedContentDirs = ['blogs', 'downloads', 'manual'].map(dir =>
    path.join(sourcesDir, dir)
  );

  for (const contentDir of allowedContentDirs) {
    if (filePath.startsWith(contentDir)) {
      return { valid: true, reason: `Content file in ${path.basename(contentDir)}/` };
    }
  }

  // Check if it's a log/config file in wrong location
  const filename = path.basename(filePath);
  const ext = path.extname(filePath);
  const logExtensions = ['.yaml', '.yml', '.json', '.log', '.md'];
  const isLogType = logExtensions.includes(ext) || filename.includes('report') || filename.includes('log');

  if (filePath.startsWith(sourcesDir) && isLogType) {
    return {
      valid: false,
      reason: `Log/config file should be in ${logsDir}, not sources/`
    };
  }

  return { valid: true, reason: 'File outside managed directories' };
}

export default {
  getLogsDir,
  getTimestampedLogName,
  getLogPath,
  getSourcesMasterPath,
  getDownloadsDir,
  getBlogsDir,
  getManualDir,
  validateLogPath
};
