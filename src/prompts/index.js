/**
 * Scaffly — Interactive prompts
 * Uses @clack/prompts to collect all project configuration from the user.
 */

import * as p from '@clack/prompts';

/**
 * Cancels the CLI if the user pressed Ctrl+C on a given prompt value.
 *
 * @param {unknown} value - The raw value returned by a @clack/prompts call
 * @returns {unknown} The value unchanged, if not cancelled
 */
function onCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Scaffolding cancelled. See you next time!');
    process.exit(0);
  }
  return value;
}

/**
 * Validates a project name: non-empty, starts with letter/number,
 * and contains only letters, numbers, hyphens, and underscores.
 *
 * @param {string} value
 * @returns {string|undefined} Error message, or undefined if valid
 */
function validateProjectName(value) {
  if (!value || value.trim().length === 0) {
    return 'Project name cannot be empty.';
  }
  if (!/^[a-z0-9][a-z0-9-_]*$/i.test(value.trim())) {
    return 'Must start with a letter/number and contain only letters, numbers, hyphens, and underscores.';
  }
}

/**
 * Runs the full interactive prompt sequence and returns the user's choices.
 *
 * @returns {Promise<{ projectName: string, stack: string, extras: string[] }>}
 */
export async function collectAnswers() {
  // ── 1. Project name ──────────────────────────────────────────────────────
  const projectName = onCancel(
    await p.text({
      message: 'What is your project name?',
      placeholder: 'my-awesome-app',
      validate: validateProjectName,
    })
  );

  // ── 2. Stack selection ────────────────────────────────────────────────────
  const stack = onCancel(
    await p.select({
      message: 'Which stack would you like to use?',
      options: [
        {
          value: 'nextjs',
          label: 'Next.js',
          hint: 'Full-stack React framework by Vercel',
        },
        {
          value: 'vite',
          label: 'React + Vite',
          hint: 'Blazing fast frontend build tool',
        },
        {
          value: 'express',
          label: 'Node.js + Express',
          hint: 'Minimal and flexible web framework',
        },
        {
          value: 'fastify',
          label: 'Fastify',
          hint: 'High-performance Node.js web framework',
        },
      ],
    })
  );

  // ── 3. Extras (multi-select) ──────────────────────────────────────────────
  // Tailwind CSS is only available for frontend stacks
  const isFrontend = stack === 'nextjs' || stack === 'vite';

  const extrasOptions = [
    {
      value: 'eslint',
      label: 'ESLint + Prettier',
      hint: 'Code linting and automatic formatting',
    },
    {
      value: 'husky',
      label: 'Husky + lint-staged',
      hint: 'Pre-commit hooks to enforce code quality',
    },
    ...(isFrontend
      ? [
          {
            value: 'tailwind',
            label: 'Tailwind CSS',
            hint: 'Utility-first CSS framework',
          },
        ]
      : []),
    {
      value: 'docker',
      label: 'Docker',
      hint: 'Dockerfile + docker-compose.yml',
    },
    {
      value: 'github-actions',
      label: 'GitHub Actions CI/CD',
      hint: 'Automated lint and test workflow',
    },
  ];

  const extras = onCancel(
    await p.multiselect({
      message: 'Which extras would you like to include?',
      options: extrasOptions,
      required: false,
    })
  );

  return {
    projectName: projectName.trim(),
    stack,
    extras: Array.isArray(extras) ? extras : [],
  };
}
