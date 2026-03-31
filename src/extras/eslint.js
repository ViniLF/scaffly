/**
 * Scaffly — ESLint + Prettier extra
 * Adds code linting (ESLint) and formatting (Prettier) to the generated project.
 * Config is tailored to the selected stack.
 */

import path from 'path';
import { writeFile, writeJson, updatePackageJson, runCommand } from '../utils/index.js';

// ── ESLint configs per stack ──────────────────────────────────────────────────

const ESLINT_CONFIGS = {
  nextjs: {
    env: { browser: true, es2021: true, node: true },
    extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
    rules: {},
  },
  vite: {
    env: { browser: true, es2021: true },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:prettier/recommended',
    ],
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off',
    },
  },
  express: {
    env: { node: true, es2021: true },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {},
  },
  fastify: {
    env: { node: true, es2021: true },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {},
  },
};

// ── Packages to install per stack ─────────────────────────────────────────────

const PACKAGES = {
  nextjs: [
    'eslint',
    'eslint-config-next',
    'prettier',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
  ],
  vite: [
    'eslint',
    'prettier',
    'eslint-config-prettier',
    'eslint-plugin-prettier',
    'eslint-plugin-react',
    'eslint-plugin-react-hooks',
  ],
  express: ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'],
  fastify: ['eslint', 'prettier', 'eslint-config-prettier', 'eslint-plugin-prettier'],
};

// ── Lint scripts per stack ────────────────────────────────────────────────────

const LINT_SCRIPTS = {
  nextjs: {
    lint: 'next lint',
    'lint:fix': 'next lint --fix',
  },
  vite: {
    lint: 'eslint . --ext .js,.jsx --max-warnings 0',
    'lint:fix': 'eslint . --ext .js,.jsx --fix',
  },
  express: {
    lint: 'eslint . --ext .js --max-warnings 0',
    'lint:fix': 'eslint . --ext .js --fix',
  },
  fastify: {
    lint: 'eslint . --ext .js --max-warnings 0',
    'lint:fix': 'eslint . --ext .js --fix',
  },
};

/**
 * Applies ESLint + Prettier configuration to the project.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {string} stack       - Selected stack identifier
 */
export async function apply(projectPath, stack) {
  // Write .eslintrc.json
  await writeJson(path.join(projectPath, '.eslintrc.json'), ESLINT_CONFIGS[stack]);

  // Write .prettierrc
  await writeJson(path.join(projectPath, '.prettierrc'), {
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    printWidth: 80,
    arrowParens: 'always',
  });

  // Write .eslintignore
  await writeFile(
    path.join(projectPath, '.eslintignore'),
    `node_modules
dist
build
.next
out
`
  );

  // Write .prettierignore
  await writeFile(
    path.join(projectPath, '.prettierignore'),
    `node_modules
dist
build
.next
out
package-lock.json
`
  );

  // Add lint and format scripts to package.json
  await updatePackageJson(projectPath, {
    scripts: {
      ...LINT_SCRIPTS[stack],
      format: 'prettier --write .',
      'format:check': 'prettier --check .',
    },
  });

  // Install ESLint + Prettier packages as dev dependencies
  await runCommand('npm', ['install', '--save-dev', ...PACKAGES[stack]], projectPath);
}
