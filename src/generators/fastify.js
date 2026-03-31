/**
 * Scaffly — Fastify generator
 * Creates a high-performance Node.js REST API using Fastify with plugin architecture.
 */

import path from 'path';
import { writeFile, writeJson, runCommand } from '../utils/index.js';

/**
 * Generates a complete Fastify REST API project at the given path.
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
    description: 'A REST API built with Fastify',
    main: useTypescript ? 'dist/index.js' : 'src/index.js',
    scripts: {
      start: useTypescript ? 'node dist/index.js' : 'node src/index.js',
      dev: useTypescript ? `tsx watch src/index.ts` : 'node --watch src/index.js',
      ...(useTypescript && { build: 'tsc' }),
      test: 'echo "No tests yet" && exit 0',
    },
    dependencies: {
      fastify: '^4.28.1',
      '@fastify/cors': '^9.0.1',
    },
    devDependencies: useTypescript
      ? {
          typescript: '^5.5.3',
          '@types/node': '^20.14.10',
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
  // Uses top-level await (available in ES modules, Node 18+)
  await writeFile(
    path.join(projectPath, `src/index.${ext}`),
    useTypescript
      ? `import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { helloRoutes } from './routes/hello.js';

const fastify: FastifyInstance = Fastify({
  // Enable built-in logger (pretty-prints in development)
  logger: process.env.NODE_ENV !== 'production',
});

// ── Plugins ────────────────────────────────────────────────────────────────
await fastify.register(cors, { origin: true });

// ── Routes ─────────────────────────────────────────────────────────────────
await fastify.register(healthRoutes, { prefix: '/api' });
await fastify.register(helloRoutes, { prefix: '/api' });

// ── Start server ───────────────────────────────────────────────────────────
try {
  const PORT = Number(process.env.PORT) || 3000;
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(\`Server running at http://localhost:\${PORT}\`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
`
      : `import Fastify from 'fastify';
import cors from '@fastify/cors';
import { healthRoutes } from './routes/health.js';
import { helloRoutes } from './routes/hello.js';

const fastify = Fastify({
  // Enable built-in logger (pretty-prints in development)
  logger: process.env.NODE_ENV !== 'production',
});

// ── Plugins ────────────────────────────────────────────────────────────────
await fastify.register(cors, { origin: true });

// ── Routes ─────────────────────────────────────────────────────────────────
await fastify.register(healthRoutes, { prefix: '/api' });
await fastify.register(helloRoutes, { prefix: '/api' });

// ── Start server ───────────────────────────────────────────────────────────
try {
  const PORT = Number(process.env.PORT) || 3000;
  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(\`Server running at http://localhost:\${PORT}\`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
`
  );

  // ── src/routes/health ─────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, `src/routes/health.${ext}`),
    useTypescript
      ? `import { FastifyInstance } from 'fastify';

/**
 * Health-check route — used by load balancers and uptime monitors.
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
`
      : `/**
 * Health-check route — used by load balancers and uptime monitors.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
`
  );

  // ── src/routes/hello ──────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, `src/routes/hello.${ext}`),
    useTypescript
      ? `import { FastifyInstance } from 'fastify';

/**
 * Example route — replace or extend this in your real project.
 */
export async function helloRoutes(fastify: FastifyInstance): Promise<void> {
  const schema = {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  };

  fastify.get('/hello', { schema }, async () => {
    return { message: 'Hello from ${projectName}!' };
  });
}
`
      : `/**
 * Example route — replace or extend this in your real project.
 *
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function helloRoutes(fastify) {
  // Schema validates the response and enables Fastify's fast serialization
  const schema = {
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  };

  fastify.get('/hello', { schema }, async () => {
    return { message: 'Hello from ${projectName}!' };
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
