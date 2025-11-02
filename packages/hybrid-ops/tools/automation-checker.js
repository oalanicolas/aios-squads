#!/usr/bin/env node

/**
 * @fileoverview Automation Checker CLI Tool
 *
 * Standalone CLI wrapper for PV_PM_001 (Automation Tipping Point) heuristic.
 * Determines if a task should be automated based on frequency, standardization, and guardrails.
 *
 * Usage:
 *   node automation-checker.js --input task.json
 *   node automation-checker.js --json '{"frequency": 5, ...}'
 *   echo '{"frequency": 5, ...}' | node automation-checker.js --stdin
 *
 * Exit Codes:
 *   0 - Success
 *   1 - Invalid input (malformed JSON, missing required fields)
 *   2 - Validation error (input schema mismatch)
 *   3 - Mind loading failure
 *
 * @module tools/automation-checker
 */

const fs = require('fs');
const path = require('path');

// Version information
const VERSION = '1.0.0';
const HEURISTIC_ID = 'PV_PM_001';

/**
 * Parse command-line arguments
 *
 * @returns {Object} Parsed arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    help: false,
    version: false,
    input: null,
    json: null,
    stdin: false,
    mode: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        parsed.help = true;
        break;

      case '--version':
      case '-v':
        parsed.version = true;
        break;

      case '--input':
        if (i + 1 >= args.length) {
          throw new Error('--input requires a file path argument');
        }
        parsed.input = args[++i];
        parsed.mode = 'file';
        break;

      case '--json':
        if (i + 1 >= args.length) {
          throw new Error('--json requires a JSON string argument');
        }
        parsed.json = args[++i];
        parsed.mode = 'json';
        break;

      case '--stdin':
        parsed.stdin = true;
        parsed.mode = 'stdin';
        break;

      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return parsed;
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Automation Checker v${VERSION}
Standalone CLI tool for PV_PM_001 (Automation Tipping Point)

USAGE:
  node automation-checker.js --input <file.json>
  node automation-checker.js --json '<json-string>'
  echo '<json>' | node automation-checker.js --stdin
  node automation-checker.js --help
  node automation-checker.js --version

OPTIONS:
  --input <file>    Read input from JSON file
  --json <string>   Parse inline JSON string
  --stdin           Read input from stdin
  --help, -h        Show this help message
  --version, -v     Show version information

INPUT SCHEMA:
  {
    "frequency": <number>,                // REQUIRED - Executions per month
    "standardizable": <number 0-1>,       // REQUIRED - Standardization potential
    "hasGuardrails": <boolean>            // REQUIRED - Safety mechanisms present
  }

  OR ALTERNATIVE FIELD NAMES:
  {
    "executionsPerMonth": <number>,       // Alternative to "frequency"
    "standardization": <number 0-1>,      // Alternative to "standardizable"
    "guardrails": <boolean>               // Alternative to "hasGuardrails"
  }

OUTPUT SCHEMA:
  {
    "heuristic": "PV_PM_001",
    "readyToAutomate": <boolean>,
    "tippingPoint": <boolean>,
    "score": <number 0-1>,
    "veto": <boolean>,
    "recommendation": "AUTOMATE_NOW" | "PLAN_AUTOMATION" | "STANDARDIZE_FIRST" | "ADD_GUARDRAILS" | "KEEP_MANUAL",
    "breakdown": { ... },
    "metadata": { ... }
  }

EXIT CODES:
  0 - Success
  1 - Invalid input (malformed JSON, missing fields)
  2 - Validation error (input schema mismatch)
  3 - Mind loading failure

EXAMPLES:
  # From file
  node automation-checker.js --input task.json

  # Inline JSON
  node automation-checker.js --json '{"frequency": 5, "standardizable": 0.8, "hasGuardrails": true}'

  # From stdin
  echo '{"frequency": 3, "standardizable": 0.9, "hasGuardrails": true}' | node automation-checker.js --stdin

  # Example with alternative field names
  node automation-checker.js --json '{"executionsPerMonth": 5, "standardization": 0.8, "guardrails": true}'
`);
}

/**
 * Display version information
 */
function showVersion() {
  console.log(`Automation Checker v${VERSION}`);
  console.log(`Heuristic: ${HEURISTIC_ID} (Automation Tipping Point)`);
}

/**
 * Read input from file
 *
 * @param {string} filePath - Path to input file
 * @returns {Object} Parsed JSON input
 */
function readInputFile(filePath) {
  try {
    const absolutePath = path.resolve(filePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Read input from stdin
 *
 * @returns {Promise<Object>} Parsed JSON input
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';

    process.stdin.setEncoding('utf-8');

    process.stdin.on('data', (chunk) => {
      data += chunk;
    });

    process.stdin.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Invalid JSON from stdin: ${error.message}`));
      }
    });

    process.stdin.on('error', (error) => {
      reject(new Error(`Failed to read stdin: ${error.message}`));
    });
  });
}

/**
 * Validate input schema
 *
 * @param {Object} input - Input to validate
 * @throws {Error} If validation fails
 */
function validateInput(input) {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be a JSON object');
  }

  // Support alternative field names
  const frequency = input.frequency !== undefined ? input.frequency : input.executionsPerMonth;
  const standardizable = input.standardizable !== undefined ? input.standardizable : input.standardization;
  const hasGuardrails = input.hasGuardrails !== undefined ? input.hasGuardrails : input.guardrails;

  // Validate frequency
  if (frequency === undefined) {
    throw new Error('Missing required field: frequency or executionsPerMonth');
  }

  if (typeof frequency !== 'number') {
    throw new Error('Frequency must be a number (executions per month)');
  }

  if (frequency < 0) {
    throw new Error(`Frequency must be non-negative (received: ${frequency})`);
  }

  // Validate standardizable
  if (standardizable === undefined) {
    throw new Error('Missing required field: standardizable or standardization');
  }

  if (typeof standardizable !== 'number') {
    throw new Error('Standardizable must be a number between 0 and 1');
  }

  if (standardizable < 0 || standardizable > 1) {
    throw new Error(`Standardizable must be between 0 and 1 (received: ${standardizable})`);
  }

  // Validate hasGuardrails
  if (hasGuardrails === undefined) {
    throw new Error('Missing required field: hasGuardrails or guardrails');
  }

  if (typeof hasGuardrails !== 'boolean') {
    throw new Error('hasGuardrails must be a boolean (true/false)');
  }
}

/**
 * Format error output
 *
 * @param {string} errorCode - Error code
 * @param {string} message - Human-readable message
 * @param {Object} details - Additional error details
 * @returns {string} Formatted JSON error
 */
function formatError(errorCode, message, details = {}) {
  return JSON.stringify({
    error: errorCode,
    message,
    details
  }, null, 2);
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Parse arguments
    const args = parseArgs();

    // Handle --help
    if (args.help) {
      showHelp();
      process.exit(0);
    }

    // Handle --version
    if (args.version) {
      showVersion();
      process.exit(0);
    }

    // Require input mode
    if (!args.mode) {
      console.error('Error: No input method specified. Use --input, --json, or --stdin');
      console.error('Run with --help for usage information');
      process.exit(1);
    }

    // Load input based on mode
    let input;

    try {
      switch (args.mode) {
        case 'file':
          input = readInputFile(args.input);
          break;

        case 'json':
          input = JSON.parse(args.json);
          break;

        case 'stdin':
          input = await readStdin();
          break;
      }
    } catch (error) {
      console.error(formatError('INVALID_INPUT', error.message));
      process.exit(1);
    }

    // Validate input
    try {
      validateInput(input);
    } catch (error) {
      const details = {
        field: error.message.includes('field') ?
          error.message.match(/field: ([^\s]+)/)?.[1] : undefined,
        error: error.message
      };
      console.error(formatError('VALIDATION_ERROR', error.message, details));
      process.exit(2);
    }

    // Load heuristic compiler
    let compileHeuristic;
    try {
      const compilerPath = path.join(__dirname, '..', 'utils', 'heuristic-compiler.js');
      ({ compileHeuristic } = require(compilerPath));
    } catch (error) {
      console.error(formatError(
        'MIND_LOADING_FAILURE',
        `Failed to load heuristic compiler: ${error.message}`,
        { compilerPath: '../utils/heuristic-compiler.js' }
      ));
      process.exit(3);
    }

    // Compile and execute heuristic
    try {
      const heuristic = compileHeuristic(HEURISTIC_ID);
      const result = heuristic(input);

      // Check for execution errors
      if (result.error) {
        console.error(formatError('EXECUTION_ERROR', result.error));
        process.exit(1);
      }

      // Output successful result
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);

    } catch (error) {
      console.error(formatError(
        'EXECUTION_ERROR',
        `Heuristic execution failed: ${error.message}`,
        { heuristicId: HEURISTIC_ID }
      ));
      process.exit(1);
    }

  } catch (error) {
    // Catch-all for unexpected errors
    console.error(formatError(
      'UNEXPECTED_ERROR',
      error.message,
      { stack: error.stack }
    ));
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { parseArgs, validateInput, formatError };
