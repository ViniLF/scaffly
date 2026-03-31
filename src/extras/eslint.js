/**
 * Scaffly — ESLint + Prettier extra
 * Adds code linting (ESLint) and formatting (Prettier) to the generated project.
 * Config is tailored to the selected stack.
 */

import path from 'path';
import { writeFile, writeJson, updatePackageJson, runCommand } from '../utils/index.js';

// ── ESLint configs per stack (JavaScript) ─────────────────────────────────────

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

// ── ESLint configs per stack (TypeScript) ─────────────────────────────────────

const ESLINT_TS_CONFIGS = {
  nextjs: {
    env: { browser: true, es2021: true, node: true },
    extends: [
      'next/core-web-vitals',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {},
  },
  vite: {
    env: { browser: true, es2021: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
      'plugin:react-hooks/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  express: {
    env: { node: true, es2021: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {},
  },
  fastify: {
    env: { node: true, es2021: true },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
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

const TS_PACKAGES = ['@typescript-eslint/eslint-plugin', '@typescript-eslint/parser'];

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

const LINT_TS_SCRIPTS = {
  nextjs: {
    lint: 'next lint',
    'lint:fix': 'next lint --fix',
  },
  vite: {
    lint: 'eslint . --ext .ts,.tsx --max-warnings 0',
    'lint:fix': 'eslint . --ext .ts,.tsx --fix',
  },
  express: {
    lint: 'eslint . --ext .ts --max-warnings 0',
    'lint:fix': 'eslint . --ext .ts --fix',
  },
  fastify: {
    lint: 'eslint . --ext .ts --max-warnings 0',
    'lint:fix': 'eslint . --ext .ts --fix',
  },
};

/**
 * Applies ESLint + Prettier configuration to the project.
 *
 * @param {string}  projectPath   - Absolute path to the project root
 * @param {string}  stack         - Selected stack identifier
 * @param {boolean} useTypescript - Whether to apply TypeScript-aware ESLint config
 */
export async function apply(projectPath, stack, useTypescript = false) {
  // Write .eslintrc.json
  const config = useTypescript ? ESLINT_TS_CONFIGS[stack] : ESLINT_CONFIGS[stack];
  await writeJson(path.join(projectPath, '.eslintrc.json'), config);

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
  const lintScripts = useTypescript ? LINT_TS_SCRIPTS[stack] : LINT_SCRIPTS[stack];
  await updatePackageJson(projectPath, {
    scripts: {
      ...lintScripts,
      format: 'prettier --write .',
      'format:check': 'prettier --check .',
    },
  });

  // Install ESLint + Prettier packages as dev dependencies
  const pkgs = useTypescript ? [...PACKAGES[stack], ...TS_PACKAGES] : PACKAGES[stack];
  await runCommand('npm', ['install', '--save-dev', ...pkgs], projectPath);
}
