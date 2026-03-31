/**
 * Scaffly — Tailwind CSS extra
 * Adds Tailwind CSS (with PostCSS and Autoprefixer) to frontend projects.
 * Only applicable to Next.js and React + Vite stacks.
 */

import path from 'path';
import fse from 'fs-extra';
import { writeFile, runCommand } from '../utils/index.js';

// ── Tailwind config content per stack ─────────────────────────────────────────

const TAILWIND_CONFIGS = {
  nextjs: `/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`,
  vite: `/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
`,
};

// ── CSS file paths per stack ──────────────────────────────────────────────────

const CSS_PATHS = {
  nextjs: 'app/globals.css',
  vite: 'src/index.css',
};

// ── Tailwind directives to prepend ────────────────────────────────────────────

const TAILWIND_DIRECTIVES = `@tailwind base;
@tailwind components;
@tailwind utilities;

`;

/**
 * Applies Tailwind CSS configuration to the project.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {string} stack       - Selected stack ('nextjs' or 'vite')
 */
export async function apply(projectPath, stack) {
  // ── tailwind.config.js ────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'tailwind.config.js'),
    TAILWIND_CONFIGS[stack]
  );

  // ── postcss.config.js ─────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'postcss.config.js'),
    `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`
  );

  // ── Prepend Tailwind directives to the main CSS file ─────────────────────
  const cssFilePath = path.join(projectPath, CSS_PATHS[stack]);
  const existingCss = await fse.readFile(cssFilePath, 'utf-8').catch(() => '');

  // Only prepend if directives aren't already present
  if (!existingCss.includes('@tailwind base')) {
    await fse.writeFile(cssFilePath, TAILWIND_DIRECTIVES + existingCss, 'utf-8');
  }

  // ── Install packages ──────────────────────────────────────────────────────
  await runCommand(
    'npm',
    ['install', '--save-dev', 'tailwindcss', 'postcss', 'autoprefixer'],
    projectPath
  );
}
