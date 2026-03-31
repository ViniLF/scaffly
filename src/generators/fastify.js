/**
 * Scaffly — Fastify generator
 * Creates a high-performance Node.js REST API using Fastify with plugin architecture.
 */

import path from 'path';
import { writeFile, writeJson, runCommand } from '../utils/index.js';

/**
 * Generates a complete Fastify REST API project at the given path.
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
    description: 'A REST API built with Fastify',
    main: 'src/index.js',
    scripts: {
      start: 'node src/index.js',
      dev: 'node --watch src/index.js',
      test: 'echo "No tests yet" && exit 0',
    },
    dependencies: {
      fastify: '^4.28.1',
      '@fastify/cors': '^9.0.1',
    },
    devDependencies: {},
  });

  // ── src/index.js ──────────────────────────────────────────────────────────
  // Uses top-level await (available in ES modules, Node 18+)
  await writeFile(
    path.join(projectPath, 'src/index.js'),
    `import Fastify from 'fastify';
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

  // ── src/routes/health.js ──────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/routes/health.js'),
    `/**
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

  // ── src/routes/hello.js ───────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/routes/hello.js'),
    `/**
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
