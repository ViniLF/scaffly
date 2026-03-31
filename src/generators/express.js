/**
 * Scaffly — Express generator
 * Creates a Node.js REST API using Express with a layered folder structure.
 */

import path from 'path';
import { writeFile, writeJson, runCommand } from '../utils/index.js';

/**
 * Generates a complete Express REST API project at the given path.
 *
 * @param {string}  projectName   - Used as the package name and in welcome messages
 * @param {string}  projectPath   - Absolute path where the project will be created
 * @param {boolean} useTypescript - Whether to scaffold TypeScript files
 */
export async function generate(projectName, projectPath, useTypescript = false) {
  const ext = useTypescript ? 'ts' : 'js';

  // ── package.json ───────────────────────────────────────────────────────────
  await writeJson(path.join(projectPath, 'package.json'), {
    name: projectName,
    version: '1.0.0',
    type: 'module',
    description: 'A REST API built with Express',
    main: useTypescript ? 'dist/index.js' : 'src/index.js',
    scripts: {
      start: useTypescript ? 'node dist/index.js' : 'node src/index.js',
      dev: useTypescript ? `tsx watch src/index.ts` : 'node --watch src/index.js',
      ...(useTypescript && { build: 'tsc' }),
      test: 'echo "No tests yet" && exit 0',
    },
    dependencies: {
      express: '^4.19.2',
    },
    devDependencies: useTypescript
      ? {
          typescript: '^5.5.3',
          '@types/node': '^20.14.10',
          '@types/express': '^4.17.21',
          tsx: '^4.16.2',
        }
      : {},
  });

  // ── tsconfig.json (TypeScript only) ───────────────────────────────────────
  if (useTypescript) {
    await writeJson(path.join(projectPath, 'tsconfig.json'), {
      compilerOptions: {
        target: 'ES2020',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        outDir: 'dist',
        rootDir: 'src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist'],
    });
  }

  // ── src/index ─────────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, `src/index.${ext}`),
    useTypescript
      ? `import express, { Application } from 'express';
import { router } from './routes/index.js';
import { errorHandler } from './middleware/error-handler.js';

const app: Application = express();
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
      : `import express from 'express';
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

  // ── src/routes/index ──────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, `src/routes/index.${ext}`),
    useTypescript
      ? `import { Router, Request, Response } from 'express';

export const router = Router();

/**
 * GET /api/health
 * Health-check endpoint — used by load balancers and uptime monitors.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/hello
 * Example endpoint — replace or remove this in your real project.
 */
router.get('/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from ${projectName}!' });
});
`
      : `import { Router } from 'express';

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

  // ── src/middleware/error-handler ──────────────────────────────────────────
  await writeFile(
    path.join(projectPath, `src/middleware/error-handler.${ext}`),
    useTypescript
      ? `import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

/**
 * Global error-handling middleware.
 * Must have exactly 4 parameters so Express recognises it as an error handler.
 */
export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
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
      : `/**
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
