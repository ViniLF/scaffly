/**
 * Scaffly — React + Vite generator
 * Creates a React SPA using Vite as the build tool and dev server.
 */

import path from 'path';
import { writeFile, writeJson, runCommand } from '../utils/index.js';

/**
 * Generates a complete React + Vite project at the given path.
 *
 * @param {string} projectName - Used as the package name and HTML title
 * @param {string} projectPath - Absolute path where the project will be created
 */
export async function generate(projectName, projectPath) {
  // ── package.json ───────────────────────────────────────────────────────────
  await writeJson(path.join(projectPath, 'package.json'), {
    name: projectName,
    version: '0.0.0',
    type: 'module',
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
    },
    devDependencies: {
      '@vitejs/plugin-react': '^4.3.1',
      vite: '^5.3.4',
    },
  });

  // ── vite.config.js ────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'vite.config.js'),
    `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
`
  );

  // ── index.html ────────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`
  );

  // ── src/main.jsx ──────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/main.jsx'),
    `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
`
  );

  // ── src/App.jsx ───────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/App.jsx'),
    `import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Welcome to ${projectName}</h1>
      <p>Built with React + Vite &mdash; scaffolded by Scaffly</p>
    </div>
  );
}

export default App;
`
  );

  // ── src/App.css ───────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/App.css'),
    `.app {
  max-width: 960px;
  margin: 4rem auto;
  padding: 0 1.5rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #111;
}

p {
  color: #555;
  font-size: 1.125rem;
}
`
  );

  // ── src/index.css ─────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, 'src/index.css'),
    `*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #ffffff;
  color: #111111;
  line-height: 1.6;
}
`
  );

  // ── .gitignore ────────────────────────────────────────────────────────────
  await writeFile(
    path.join(projectPath, '.gitignore'),
    `# Dependencies
node_modules/

# Build output
dist/
build/

# Environment
.env
.env.local
.env.*.local

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
