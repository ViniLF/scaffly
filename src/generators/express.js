/**
 * Scaffly — Express generator
 * Creates a Node.js REST API using Express with a layered folder structure.
 */

import path from 'path';
import { writeFile, writeJson, runCommand } from '../utils/index.js';

/**
 * Generates a complete Express REST API project at the given path.
 *
 * @param {string} projectName - Used as the package name and in welcome messages
 * @param {string} projectPath - Absolute path where the project will be created
 */
export async function generate(projectName, projectPath) {
  // ── package.json ───────────────────────────────────────────────────────────
  await writeJson(path.join(projectPath, 'package.json'), {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    description: 'A REST API built with Express',
    main: 'src/index.js',
    scripts: {
      start: 'node src/index.js',
      dev: 'node --watch src/index.js',
      test: 'echo "No tests yet" && exit 0',
    },
    dependencies: {
      express: '^4.19.2',
    },
    devDependencies: {},
  });

  // ── src/index.js ──────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/index.js'),
    `import express from 'express';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── Error handling (must be the last middleware) ───────────────────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});

export default app;
`
  );

  // ── src/routes/index.js ───────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/routes/index.js'),
    `import { Router } from 'express';

export const router = Router();

/**
 * GET /api/health
 * Health-check endpoint — used by load balancers and uptime monitors.
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/hello
 * Example endpoint — replace or remove this in your real project.
 */
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from ${projectName}!' });
});
`
  );

  // ── src/middleware/error-handler.js ───────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/middleware/error-handler.js'),
    `/**
 * Global error-handling middleware.
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 *
 * @param {Error}                err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(\`[Error] \${req.method} \${req.path} → \${status}: \${message}\`);

  res.status(status).json({
    error: {
      message,
      // Include stack trace in development only
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
`
  );

  // ── .env ──────────────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, '.env'),
    `# Local environment variables — do NOT commit this file
NODE_ENV=development
PORT=3000
`
  );

  // ── .env.example ─────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, '.env.example'),
    `# Copy this file to .env and fill in your own values
NODE_ENV=development
PORT=3000
`
  );

  // ── .gitignore ────────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, '.gitignore'),
    `# Dependencies
node_modules/

# Environment — never commit secrets
.env
.env.local
.env.*.local

# Build artifacts
dist/
build/

# Debug
npm-debug.log*
yarn-debug.log*

# Editor
.vscode/
.idea/

# Misc
.DS_Store
`
  );

  // ── Install dependencies ──────────────────────────────────────────────────
  await runCommand('npm', ['install'], projectPath);
}
