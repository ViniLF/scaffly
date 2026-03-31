#!/usr/bin/env node

/**
 * Scaffly — CLI entry point
 *
 * Flow:
 *  1. Display intro banner
 *  2. Collect project configuration via interactive prompts
 *  3. Validate the target directory doesn't already exist
 *  4. Run the selected stack generator (creates files + installs base deps)
 *  5. Apply each selected extra (adds tooling on top)
 *  6. Display a success message with next steps
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import path from 'path';
import fse from 'fs-extra';

import { collectAnswers } from '../src/prompts/index.js';
import { generate as generateNextjs } from '../src/generators/nextjs.js';
import { generate as generateVite } from '../src/generators/vite.js';
import { generate as generateExpress } from '../src/generators/express.js';
import { generate as generateFastify } from '../src/generators/fastify.js';
import { apply as applyEslint } from '../src/extras/eslint.js';
import { apply as applyHusky } from '../src/extras/husky.js';
import { apply as applyTailwind } from '../src/extras/tailwind.js';
import { apply as applyDocker } from '../src/extras/docker.js';
import { apply as applyGithubActions } from '../src/extras/github-actions.js';

// ── Registry maps ─────────────────────────────────────────────────────────────

const GENERATORS = {
  nextjs: generateNextjs,
  vite: generateVite,
  express: generateExpress,
  fastify: generateFastify,
};

const EXTRAS = {
  eslint: applyEslint,
  husky: applyHusky,
  tailwind: applyTailwind,
  docker: applyDocker,
  'github-actions': applyGithubActions,
};

const STACK_LABELS = {
  nextjs: 'Next.js',
  vite: 'React + Vite',
  express: 'Node.js + Express',
  fastify: 'Fastify',
};

const DEV_COMMANDS = {
  nextjs: 'npm run dev',
  vite: 'npm run dev',
  express: 'npm run dev',
  fastify: 'npm run dev',
};

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.clear();

  // Welcome banner
  p.intro(
    `${chalk.bgCyan.black(' scaffly ')} ${chalk.dim('— scaffold modern projects in seconds')}`
  );

  // ── Step 1: Collect answers ───────────────────────────────────────────────
  const { projectName, stack, extras } = await collectAnswers();

  const projectPath = path.resolve(process.cwd(), projectName);

  // ── Step 2: Guard against existing directory ──────────────────────────────
  if (await fse.pathExists(projectPath)) {
    p.cancel(
      `Directory ${chalk.cyan(projectName)} already exists. Choose a different project name.`
    );
    process.exit(1);
  }

  const s = p.spinner();

  // ── Step 3: Generate base project ────────────────────────────────────────
  s.start(`Scaffolding ${chalk.cyan(STACK_LABELS[stack])} project...`);

  try {
    await GENERATORS[stack](projectName, projectPath);
  } catch (err) {
    s.stop(chalk.red('Failed to scaffold project'));
    p.cancel(`Generator error: ${err.message}`);
    process.exit(1);
  }

  // ── Step 4: Apply extras ──────────────────────────────────────────────────
  for (const extra of extras) {
    s.message(`Applying ${chalk.cyan(extra)}...`);

    try {
      await EXTRAS[extra](projectPath, stack);
    } catch (err) {
      // Extras are non-fatal — warn and continue
      s.message(chalk.yellow(`Warning: ${extra} could not be fully applied`));
      p.log.warn(`${extra} failed: ${err.message}`);
    }
  }

  s.stop(chalk.green('Done!'));

  // ── Step 5: Show next steps ───────────────────────────────────────────────
  const note = buildNextSteps(projectName, stack, extras);
  p.note(note, chalk.bold('Next steps'));

  p.outro(
    `Built something cool? Give Scaffly a star on GitHub! ${chalk.dim('github.com/ViniLF/scaffly')}`
  );
}

/**
 * Builds the formatted "next steps" message shown after a successful scaffold.
 *
 * @param {string}   projectName
 * @param {string}   stack
 * @param {string[]} extras
 * @returns {string}
 */
function buildNextSteps(projectName, stack, extras) {
  const steps = [
    `${chalk.dim('1.')} cd ${chalk.cyan(projectName)}`,
    `${chalk.dim('2.')} ${chalk.cyan(DEV_COMMANDS[stack])}`,
  ];

  if (stack === 'nextjs' || stack === 'vite') {
    steps.push(`${chalk.dim('3.')} Open ${chalk.cyan('http://localhost:3000')}`);
  } else {
    steps.push(`${chalk.dim('3.')} Test: ${chalk.cyan('curl http://localhost:3000/api/health')}`);
  }

  if (extras.includes('husky')) {
    steps.push('');
    steps.push(
      `${chalk.dim('Tip:')} Run ${chalk.cyan('git init && npm run prepare')} to activate Husky hooks`
    );
  }

  if (extras.includes('docker')) {
    steps.push('');
    steps.push(`${chalk.dim('Docker:')} ${chalk.cyan('docker compose up --build')}`);
  }

  return steps.join('\n');
}

// ── Run ───────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error(chalk.red('\nUnexpected error:'), err);
  process.exit(1);
});
