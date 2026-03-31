/**
 * Scaffly — GitHub Actions CI/CD extra
 * Adds a CI workflow that runs on every push/PR to main.
 *
 * Steps:
 *  1. Checkout code
 *  2. Set up Node.js with npm cache
 *  3. Install dependencies (npm ci)
 *  4. Run linter (if a lint script is present)
 *  5. Run tests (if a test script is present)
 *  6. Build the project (if a build script is present)
 */

import path from 'path';
import { writeFile } from '../utils/index.js';

const CI_WORKFLOW = `name: CI

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  ci:
    name: Lint, Test & Build
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [20.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint --if-present

      - name: Run tests
        run: npm test --if-present

      - name: Build
        run: npm run build --if-present
`;

/**
 * Adds a GitHub Actions CI workflow to the project.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {string} stack       - Selected stack identifier (unused but kept for API consistency)
 */
export async function apply(projectPath, stack) {
  await writeFile(
    path.join(projectPath, '.github/workflows/ci.yml'),
    CI_WORKFLOW
  );
}
