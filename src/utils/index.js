/**
 * Scaffly — Shared utilities
 * Common file system helpers and command runner used across generators and extras.
 */

import fse from 'fs-extra';
import path from 'path';
import { execa } from 'execa';

/**
 * Writes content to a file, creating parent directories as needed.
 *
 * @param {string} filePath - Absolute path to the target file
 * @param {string} content  - UTF-8 string content to write
 */
export async function writeFile(filePath, content) {
  await fse.ensureDir(path.dirname(filePath));
  await fse.writeFile(filePath, content, 'utf-8');
}

/**
 * Writes a JavaScript object to a JSON file with 2-space indentation.
 *
 * @param {string} filePath - Absolute path to the target JSON file
 * @param {object} data     - Object to serialize
 */
export async function writeJson(filePath, data) {
  await fse.ensureDir(path.dirname(filePath));
  await fse.writeJson(filePath, data, { spaces: 2 });
}

/**
 * Deep-merges `updates` into the project's package.json.
 * Existing keys are preserved; conflicting nested objects are merged recursively.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {object} updates     - Partial package.json fields to merge in
 */
export async function updatePackageJson(projectPath, updates) {
  const pkgPath = path.join(projectPath, 'package.json');
  const existing = await fse.readJson(pkgPath);
  const merged = deepMerge(existing, updates);
  await fse.writeJson(pkgPath, merged, { spaces: 2 });
}

/**
 * Recursively merges source into target, combining plain objects deeply
 * and overwriting all other values.
 *
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (isPlainObject(source[key]) && isPlainObject(target[key])) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Runs a shell command inside the given directory.
 * Stdout/stderr are piped (suppressed); throws on non-zero exit code.
 *
 * @param {string}   command - Executable name (e.g. 'npm', 'npx')
 * @param {string[]} args    - Arguments to pass
 * @param {string}   cwd     - Working directory
 */
export async function runCommand(command, args, cwd) {
  await execa(command, args, {
    cwd,
    stdio: 'pipe',
  });
}
