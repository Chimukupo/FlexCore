# FlexCore Milestone 1: Project Initialization and Setup

**Goal**: Set up the monorepo structure, initialize the React frontend with Vite, install dependencies, configure Firebase for staging and production environments, secure environment variables, and set up CI with GitHub Actions.  
**Duration**: 1 week (2025-07-28 to 2025-08-01)  
**Objective**: Create a robust project foundation for FlexCore, ensuring all tools and configurations are in place for your coding bootcamp submission.

---

## Prerequisites
- **Node.js**: Install Node LTS v22 (use [nvm](https://github.com/nvm-sh/nvm): `nvm install 22 && nvm use 22`).
- **PNPM**: Install globally: `npm install -g pnpm@8`.
- **Firebase CLI**: Install globally: `npm install -g firebase-tools`.
- **Git**: Ensure Git is installed and you have a GitHub repository for FlexCore.
- **RapidAPI Key**: Sign up for [RapidAPI](https://rapidapi.com) and get an API key for the ExerciseDB API (you’ll add this to `.env` files).
- **Editor**: Use VS Code or similar with Prettier and ESLint extensions for TypeScript.

---

## Tasks and Implementation

### 1. Initialize Monorepo
**Objective**: Create a PNPM workspace with the directory structure for FlexCore.

1. **Create Project Directory**:
   ```bash
   mkdir flexcore
   cd flexcore
   git init
   ```
2. **Initialize PNPM Workspace**:
   ```bash
   pnpm init
   ```
   Edit `package.json`:
   ```json
   {
     "name": "flexcore",
     "version": "0.0.0",
     "private": true
   }
   ```
3. **Set Up Directory Structure**:
   ```bash
   mkdir -p apps/web packages/shared packages/seeding docs .github/workflows
   ```
4. **Configure PNPM Workspace**:
   Create `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```

**Deliverable**: Monorepo structure with `apps/web`, `packages/shared`, `packages/seeding`, `docs`, and `.github/workflows`.

---

### 2. Set Up React Frontend
**Objective**: Initialize the React app with Vite, Tailwind CSS, shadcn/ui, and core dependencies.

1. **Initialize Vite Project**:
   ```bash
   cd apps/web
   npm create vite@latest . -- --template react-ts
   ```
   Select TypeScript when prompted.
2. **Install Core Dependencies**:
   ```bash
   pnpm add react@19 react-dom@19 @tanstack/react-query react-hook-form zod @hookform/resolvers axios firebase
   ```
3. **Install Dev Dependencies**:
   ```bash
   pnpm add -D vite typescript tailwindcss@4 postcss autoprefixer shadcn-ui vitest @testing-library/react @testing-library/jest-dom playwright storybook @storybook/react @storybook/testing-library eslint typescript-eslint eslint-plugin-perfectionist prettier t3-env
   ```
4. **Configure Tailwind CSS**:
   - Initialize Tailwind:
     ```bash
     npx tailwindcss init -p
     ```
   - Edit `tailwind.config.js`:
     ```javascript
     /** @type {import('tailwindcss').Config} */
     export default {
       content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
       theme: {
         extend: {},
       },
       plugins: [],
     };
     ```
   - Edit `src/index.css`:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```
5. **Initialize shadcn/ui**:
   ```bash
   npx shadcn-ui@latest init
   ```
   Accept defaults or customize (e.g., use TypeScript, Tailwind CSS).
   Add common components:
   ```bash
   npx shadcn-ui@latest add button input select
   ```

**Deliverable**: React app in `apps/web` with Vite, Tailwind CSS, shadcn/ui, and core dependencies installed.

---

### 3. Configure Tooling
**Objective**: Set up ESLint, Prettier, Husky, Storybook, and Turborepo for code quality and development.

1. **Configure ESLint**:
   - Create `.eslintrc.cjs`:
     ```javascript
     module.exports = {
       env: { browser: true, es2021: true },
       extends: [
         'eslint:recommended',
         'plugin:@typescript-eslint/recommended',
         'plugin:perfectionist/recommended-natural',
       ],
       parser: '@typescript-eslint/parser',
       plugins: ['@typescript-eslint', 'perfectionist'],
       rules: {
         'perfectionist/sort-imports': 'error',
         '@typescript-eslint/explicit-function-return-type': 'warn',
       },
     };
     ```
   - Add `.eslintignore`:
     ```
     node_modules
     dist
     .env
     .env.*
     ```
2. **Configure Prettier**:
   - Create `.prettierrc`:
     ```json
     {
       "semi": true,
       "trailingComma": "es5",
       "singleQuote": true,
       "printWidth": 80,
       "tabWidth": 2
     }
     ```
   - Create `.prettierignore`:
     ```
     node_modules
     dist
     .env
     .env.*
     ```
3. **Set Up Husky and lint-staged**:
   - Initialize Husky:
     ```bash
     pnpm add -D husky lint-staged
     npx husky init
     ```
   - Edit `.husky/pre-commit`:
     ```bash
     #!/bin/sh
     . "$(dirname "$0")/_/husky.sh"
     pnpm exec lint-staged
     ```
   - Create `.lintstagedrc`:
     ```json
     {
       "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,md}": ["prettier --write"]
     }
     ```
4. **Initialize Storybook**:
   ```bash
   cd apps/web
   npx storybook@latest init
   ```
5. **Configure Turborepo**:
   - Install: `pnpm add -D turbo -w` (workspace-wide).
   - Create `turbo.json` in root:
     ```json
     {
       "pipeline": {
         "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
         "lint": { "dependsOn": ["^lint"] },
         "typecheck": { "dependsOn": ["^typecheck"] },
         "test": { "dependsOn": ["^build"] },
         "e2e": { "dependsOn": ["build"] },
         "build-storybook": { "dependsOn": ["build"] }
       }
     }
     ```
   - Add scripts to root `package.json`:
     ```json
     {
       "scripts": {
         "build": "turbo run build",
         "lint": "turbo run lint",
         "typecheck": "turbo run typecheck",
         "test": "turbo run test",
         "e2e": "turbo run e2e",
         "build-storybook": "turbo run build-storybook"
       }
     }
     ```

**Deliverable**: Configured ESLint, Prettier, Husky, Storybook, and Turborepo for consistent code quality and development workflow.

---

### 4. Set Up Firebase
**Objective**: Configure Firebase for staging and production, including Authentication, Firestore, and Hosting.

1. **Initialize Firebase**:
   ```bash
   firebase login
   firebase init
   ```
   Select Hosting and Firestore; link to `flexcore-staging` and `flexcore-prod`.
2. **Configure Hosting Targets**:
   ```bash
   firebase target:apply hosting staging flexcore-staging
   firebase target:apply hosting prod flexcore-prod
   ```
   Update `firebase.json` in root:
   ```json
   {
     "hosting": [
       {
         "target": "staging",
         "site": "flexcore-staging",
         "public": "apps/web/build",
         "rewrites": [{ "source": "**", "destination": "/index.html" }]
       },
       {
         "target": "prod",
         "site": "flexcore-prod",
         "public": "apps/web/build",
         "rewrites": [{ "source": "**", "destination": "/index.html" }]
       }
     ],
     "firestore": {
       "rules": "firestore.rules",
       "indexes": "firestore.indexes.json"
     }
   }
   ```
3. **Configure Firestore Security Rules**:
   Create `firestore.rules`:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /routines/{routineId} {
         allow read, write: if request.auth != null && resource.data.user_id == request Jonah
       }
       match /workouts/{workoutId} {
         allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
       }
     }
   }
   ```
4. **Configure Firestore Indexes**:
   Create `firestore.indexes.json`:
   ```json
   {
     "indexes": [
       {
         "collectionGroup": "routines",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "user_id", "order": "ASCENDING" },
           { "fieldPath": "day", "order": "ASCENDING" }
         ]
       },
       {
         "collectionGroup": "workouts",
         "queryScope": "COLLECTION",
         "fields": [
           { "fieldPath": "user_id", "order": "ASCENDING" },
           { "fieldPath": "date", "order": "DESCENDING" }
         ]
       }
     ]
   }
   ```
5. **Test Firebase Locally**:
   ```bash
   firebase emulators:start
   ```

**Deliverable**: Firebase configured for `flexcore-staging` and `flexcore-prod` with Authentication, Firestore, and Hosting enabled; security rules and indexes set up.

---

### 5. Secure Environment Variables
**Objective**: Create `.env.stage` and `.env.prod` with Firebase and RapidAPI keys, ensure they are gitignored, and configure T3 Env.

1. **Create Environment Files**:
   - In `apps/web`, create `.env.stage`:
     ```
     VITE_FIREBASE_API_KEY=AIzaSyA_Z2wVBJOSbl21hJj7m-Kcvy-89bkj1RU
     VITE_FIREBASE_AUTH_DOMAIN=flexcore-stage.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=flexcore-stage
     VITE_FIREBASE_STORAGE_BUCKET=flexcore-stage.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=840053696526
     VITE_FIREBASE_APP_ID=1:840053696526:web:083162045cdb2d788eb45f
     VITE_FIREBASE_MEASUREMENT_ID=G-RLQTVKK076
     VITE_RAPIDAPI_KEY=your-rapidapi-key-here
     ```
   - Create `.env.prod`:
     ```
     VITE_FIREBASE_API_KEY=AIzaSyDDl8FFdpnb2kJeMAflrHQshVYjFUUlyrQ
     VITE_FIREBASE_AUTH_DOMAIN=flexcore-prod.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=flexcore-prod
     VITE_FIREBASE_STORAGE_BUCKET=flexcore-prod.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=17594107666
     VITE_FIREBASE_APP_ID=1:17594107666:web:d228c0ba0cceed5e1d15cb
     VITE_FIREBASE_MEASUREMENT_ID=G-C8M3E8NDDQ
     VITE_RAPIDAPI_KEY=your-rapidapi-key-here
     ```
   - Replace `your-rapidapi-key-here` with your actual RapidAPI key for ExerciseDB.
2. **Update `.gitignore`**:
   Create or edit `.gitignore` in root:
   ```gitignore
   node_modules/
   dist/
   .env
   .env.*
   ```
3. **Configure T3 Env**:
   Create `apps/web/src/env.ts`:
   ```typescript
   import { createEnv } from '@t3-oss/env-core';
   import { z } from 'zod';

   export const env = createEnv({
     clientPrefix: 'VITE_',
     client: {
       VITE_FIREBASE_API_KEY: z.string(),
       VITE_FIREBASE_AUTH_DOMAIN: z.string(),
       VITE_FIREBASE_PROJECT_ID: z.string(),
       VITE_FIREBASE_STORAGE_BUCKET: z.string(),
       VITE_FIREBASE_MESSAGING_SENDER_ID: z.string(),
       VITE_FIREBASE_APP_ID: z.string(),
       VITE_FIREBASE_MEASUREMENT_ID: z.string(),
       VITE_RAPIDAPI_KEY: z.string(),
     },
     runtimeEnv: import.meta.env,
   });
   ```

**Deliverable**: `.env.stage` and `.env.prod` files in `apps/web`, gitignored, and T3 Env configured for type-safe environment variables.

---

### 6. Set Up CI Pipeline
**Objective**: Configure GitHub Actions for linting, type-checking, and testing.

1. **Create CI Workflow**:
   Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on: [push, pull_request]
   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v4
           with: { version: 8 }
         - uses: actions/setup-node@v4
           with: { node-version: 22 }
         - run: pnpm install
         - run: pnpm exec turbo run lint typecheck test
         - run: pnpm exec turbo run build-storybook
         - run: pnpm exec turbo run e2e
   ```
2. **Add Deploy Scripts**:
   Update `apps/web/package.json`:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "lint": "eslint src --ext .js,.ts,.jsx,.tsx",
       "typecheck": "tsc --noEmit",
       "test": "vitest run",
       "e2e": "playwright test",
       "build-storybook": "storybook build",
       "deploy:staging": "firebase deploy --only hosting:staging",
       "deploy:prod": "firebase deploy --only hosting:prod"
     }
   }
   ```

**Deliverable**: GitHub Actions CI pipeline configured for linting, type-checking, and testing.

---

## Verification Steps
1. **Test Local Setup**:
   ```bash
   cd apps/web
   pnpm dev
   ```
   Open `http://localhost:5173` to verify the React app runs.
2. **Test Firebase Emulator**:
   ```bash
   firebase emulators:start
   ```
   Ensure Authentication and Firestore work locally.
3. **Test Linting and Formatting**:
   ```bash
   pnpm lint
   pnpm exec prettier --check .
   ```
4. **Test Storybook**:
   ```bash
   cd apps/web
   pnpm storybook
   ```
   Open `http://localhost:6006` to verify Storybook.
5. **Verify `.env` Security**:
   ```bash
   git status
   ```
   Ensure `.env.stage` and `.env.prod` are not staged.
6. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: initialize FlexCore monorepo"
   git push origin main
   ```
   Verify CI pipeline runs successfully in GitHub Actions.

---

## Deliverables
- Monorepo structure: `apps/web`, `packages/shared`, `packages/seeding`, `docs`, `.github/workflows`.
- React app initialized with Vite, React v19, Tailwind CSS v4, shadcn/ui, TanStack Query, Axios, and Firebase SDK.
- Tooling configured: ESLint, Prettier, Husky, Storybook, Turborepo.
- Firebase setup for `flexcore-staging` and `flexcore-prod` with Authentication, Firestore, and Hosting.
- `.env.stage` and `.env.prod` in `apps/web`, gitignored, with T3 Env validation.
- GitHub Actions CI pipeline for linting, type-checking, and testing.

---

## Notes for Bootcamp
- **Instructor Appeal**: This setup showcases modern web development practices (monorepo, TypeScript, Tailwind, Firebase) and best practices (linting, testing, CI). Include the `docs` folder with the [TDD](xaiArtifact://fcf7cde1-ea84-48d8-aa78-5edf9ff52cd6/9bc96a1a-fb47-41ae-9ee6-53f3997d325a) and this roadmap in your submission to demonstrate planning.
- **RapidAPI Key**: Add your ExerciseDB API key to `.env.stage` and `.env.prod` before proceeding to Milestone 3.
- **Next Steps**: After completing Milestone 1, proceed to Milestone 2 (Authentication) or let me know if you need help debugging setup issues.