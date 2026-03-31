# Scaffly

[![npm version](https://img.shields.io/npm/v/scaffly.svg?style=flat-square)](https://www.npmjs.com/package/scaffly)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![GitHub Stars](https://img.shields.io/github/stars/ViniLF/scaffly?style=flat-square)](https://github.com/ViniLF/scaffly/stargazers)
[![Node.js Version](https://img.shields.io/node/v/scaffly.svg?style=flat-square)](https://nodejs.org)

> A fast, interactive CLI tool for scaffolding modern web and Node.js projects.

---

## Features

- **Interactive prompts** — beautiful terminal UI powered by `@clack/prompts`
- **4 supported stacks** — Next.js, React + Vite, Express, and Fastify
- **Optional extras** — pick and choose: ESLint, Prettier, Husky, Tailwind CSS, Docker, GitHub Actions
- **Production-ready boilerplate** — sensible defaults, clean folder structure
- **Zero config required** — just run and go

---

## Usage

Run without installing (always uses the latest version):

```bash
npx scaffly
```

Or install globally for repeated use:

```bash
npm install -g scaffly
scaffly
```

### What happens next

1. Enter your **project name**
2. Choose a **stack**
3. Pick any **extras**
4. Scaffly creates the project, installs dependencies, and configures your tooling

---

## Supported Stacks

| Stack | Language | Best For |
|---|---|---|
| **Next.js** | React / JSX | Full-stack web applications, SSR, SSG |
| **React + Vite** | React / JSX | SPAs, client-side frontends |
| **Node.js + Express** | JavaScript (ESM) | REST APIs, microservices |
| **Fastify** | JavaScript (ESM) | High-performance APIs |

---

## Extras

| Extra | Description | Stacks |
|---|---|---|
| **ESLint + Prettier** | Linting and code formatting with zero-config defaults | All |
| **Husky + lint-staged** | Pre-commit hooks that run linting before each commit | All |
| **Tailwind CSS** | Utility-first CSS framework with PostCSS | Next.js, Vite |
| **Docker** | `Dockerfile` + `docker-compose.yml` optimised per stack | All |
| **GitHub Actions CI/CD** | Workflow that runs lint, test, and build on push/PR | All |

---

## Generated Project Structure

### Next.js
```
my-app/
├── app/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── next.config.mjs
├── package.json
└── .gitignore
```

### React + Vite
```
my-app/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── package.json
└── .gitignore
```

### Express / Fastify
```
my-app/
├── src/
│   ├── index.js
│   ├── routes/
│   └── middleware/     (Express only)
├── .env
├── .env.example
├── package.json
└── .gitignore
```

---

## Requirements

- **Node.js** `>= 18.0.0`
- **npm** `>= 8.0.0`

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/ViniLF/scaffly.git`
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feat/your-feature`
5. **Make** your changes and test them: `node bin/scaffly.js`
6. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/): `git commit -m "feat: add awesome feature"`
7. **Push** to your branch: `git push origin feat/your-feature`
8. **Open** a Pull Request

### Adding a new stack

1. Create `src/generators/your-stack.js` and export a `generate(projectName, projectPath)` function
2. Register it in `bin/scaffly.js` under `GENERATORS`
3. Add a prompt option in `src/prompts/index.js`
4. Update this README

### Adding a new extra

1. Create `src/extras/your-extra.js` and export an `apply(projectPath, stack)` function
2. Register it in `bin/scaffly.js` under `EXTRAS`
3. Add a prompt option in `src/prompts/index.js`
4. Update this README

---

## License

[MIT](./LICENSE) © ViniLF
