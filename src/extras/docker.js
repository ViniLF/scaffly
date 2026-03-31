/**
 * Scaffly — Docker extra
 * Adds a Dockerfile, docker-compose.yml, and .dockerignore tailored to the stack.
 *
 * Strategy:
 *  - Next.js / Vite: multi-stage build (build → serve)
 *  - Express / Fastify: single-stage Node.js image (production deps only)
 */

import path from 'path';
import { writeFile } from '../utils/index.js';

// ── Dockerfiles per stack ─────────────────────────────────────────────────────

const DOCKERFILES = {
  nextjs: `# ── Stage 1: Install dependencies ────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Build the application ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ── Stage 3: Production image ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed to run the app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
`,

  vite: `# ── Stage 1: Build the app ────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom Nginx config for SPA routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`,

  express: `FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
`,

  fastify: `FROM node:20-alpine
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
`,
};

// ── docker-compose.yml per stack ─────────────────────────────────────────────

const COMPOSE_FILES = {
  nextjs: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
`,

  vite: `services:
  app:
    build: .
    ports:
      - "80:80"
    restart: unless-stopped
`,

  express: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
`,

  fastify: `services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    restart: unless-stopped
`,
};

// ── .dockerignore (shared across stacks) ──────────────────────────────────────

const DOCKERIGNORE = `# Source control
.git
.gitignore

# Dependencies (will be re-installed inside the container)
node_modules

# Build output (re-built inside the container)
dist
build
.next

# Environment files — never bake secrets into an image
.env
.env.local
.env.*.local

# Dev tooling
.eslintrc*
.prettierrc*
.husky

# OS artifacts
.DS_Store
Thumbs.db

# Docs
README.md
`;

/**
 * Adds Docker support files to the project.
 *
 * @param {string} projectPath - Absolute path to the project root
 * @param {string} stack       - Selected stack identifier
 */
export async function apply(projectPath, stack) {
  await writeFile(path.join(projectPath, 'Dockerfile'), DOCKERFILES[stack]);
  await writeFile(path.join(projectPath, 'docker-compose.yml'), COMPOSE_FILES[stack]);
  await writeFile(path.join(projectPath, '.dockerignore'), DOCKERIGNORE);
}
