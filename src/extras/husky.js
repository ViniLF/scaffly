/**
 * Scaffly — Husky + lint-staged extra
 * Sets up pre-commit Git hooks that run linting and formatting before each commit.
 *
 * Requires ESLint + Prettier to be installed to fully leverage lint-staged.
 * If the ESLint extra was not selected, the hooks will still run but may warn
 * about missing binaries.
 */

import path from 'path';
import { writeFile, updatePackageJson, runCommand } from '../utils/index.js';

/**
 * Applies Husky + lint-staged configuration to the project.
 *
 * @param {string}  projectPath   - Absolute path to the project root
 * @param {string}  stack         - Selected stack identifier (unused but kept for API consistency)
 * @param {boolean} useTypescript - Whether to configure lint-staged for TypeScript files
 */
export async function apply(projectPath, stack, useTypescript = false) {
  // ── Install packages ──────────────────────────────────────────────────────
  await runCommand(
    'npm',
    ['install', '--save-dev', 'husky', 'lint-staged'],
    projectPath
  );

  // ── Initialize Husky ──────────────────────────────────────────────────────
  // Creates .husky/ directory and wires up git hooks via the prepare script.
  // Note: requires an initialised git repository to take full effect.
  await runCommand('npx', ['husky', 'init'], projectPath);

  // ── Update package.json ───────────────────────────────────────────────────
  // husky init already adds "prepare": "husky"; we add lint-staged config here.
  await updatePackageJson(projectPath, {
    'lint-staged': {
      // Source files: lint then format
      [useTypescript ? '*.{ts,tsx}' : '*.{js,jsx}']: [
        'eslint --fix --max-warnings 0',
        'prettier --write',
      ],
      // Other files: format only
      '*.{json,md,css,html}': ['prettier --write'],
    },
  });

  // ── Write pre-commit hook ─────────────────────────────────────────────────
  // Override the default hook created by `husky init` (which runs `npm test`)
  // with our lint-staged runner.
  await writeFile(
    path.join(projectPath, '.husky/pre-commit'),
    'npx lint-staged\n'
  );
}
