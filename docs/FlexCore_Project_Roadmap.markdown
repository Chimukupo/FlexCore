# FlexCore Project Roadmap

This document outlines the development roadmap for **FlexCore**, a fitness web app for searching and selecting exercises, tracking workout time, and planning weekly routines. The roadmap is divided into milestones, each with specific tasks, deliverables, and estimated durations, ensuring a clear path to the Minimum Viable Product (MVP).

---

## Milestone 1: Project Initialization and Setup
**Goal**: Set up the monorepo structure, install dependencies, configure Firebase (staging and production), and secure environment variables with `.env.stage` and `.env.prod`.  
**Duration**: 1 week (2025-07-28 to 2025-08-01)  
**Tasks**:
1. **Initialize Monorepo**:
   - Create a PNPM workspace with `pnpm init`.
   - Set up directory structure:
     ```
     .
     ├── apps/
     │   └── web/            ← React frontend (+ .storybook)
     ├── packages/
     │   ├── shared/         ← Zod schemas, utilities, types
     │   └── seeding/        ← Firestore emulator seeding
     ├── docs/               ← TDD, roadmap, ADRs
     └── .github/            ← CI workflows
     ```
   - Configure `pnpm-workspace.yaml`:
     ```yaml
     packages:
       - 'apps/*'
       - 'packages/*'
     ```
2. **Set Up React Frontend**:
   - Initialize `apps/web` with Vite: `npm create vite@latest web -- --template react-ts`.
   - Install core dependencies:
     ```bash
     pnpm add react@19 react-dom@19 @tanstack/react-query react-hook-form zod @hookform/resolvers axios
     ```
   - Install dev dependencies:
     ```bash
     pnpm add -D vite typescript tailwindcss@4 postcss autoprefixer shadcn-ui vitest @testing-library/react @testing-library/jest-dom playwright storybook @storybook/react @storybook/testing-library eslint typescript-eslint eslint-plugin-perfectionist prettier t3-env
     ```
   - Configure Tailwind CSS in `apps/web/tailwind.config.js` and `postcss.config.js`.
   - Initialize shadcn/ui: `npx shadcn-ui@latest init`.
3. **Configure Tooling**:
   - Set up ESLint with `typescript-eslint` and `eslint-plugin-perfectionist`:
     ```bash
     pnpm add -D eslint typescript-eslint eslint-plugin-perfectionist
     ```
     Create `.eslintrc.cjs` with strict TypeScript rules and perfectionist sorting.
   - Configure Prettier: Create `.prettierrc` and `.prettierignore`.
   - Set up Husky and lint-staged for pre-commit hooks:
     ```bash
     pnpm add -D husky lint-staged
     npx husky init
     ```
   - Initialize Storybook: `npx storybook@latest init`.
   - Configure Turborepo: `pnpm add -D turbo`.
     Create `turbo.json`:
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
4. **Set Up Firebase**:
   - Firebase projects (`flexcore-staging` and `flexcore-prod`) created with Authentication (email/password, Google Sign-In), Firestore, and Hosting enabled.
   - Configure Firestore security rules (from TDD §5).
   - Set up Firebase Hosting targets:
     ```bash
     firebase target:apply hosting staging flexcore-staging
     firebase target:apply hosting prod flexcore-prod
     ```
     Update `firebase.json`:
     ```json
     {
       "hosting": [
         {
           "target": "staging",
           "site": "flexcore-staging",
           "public": "build",
           "rewrites": [{ "source": "**", "destination": "/index.html" }]
         },
         {
           "target": "prod",
           "site": "flexcore-prod",
           "public": "build",
           "rewrites": [{ "source": "**", "destination": "/index.html" }]
         }
       ]
     }
     ```
5. **Secure Environment Variables**:
   - Create `.env.stage` and `.env.prod` in `apps/web`:
     ```
     # apps/web/.env.stage
     VITE_FIREBASE_API_KEY=AIzaSyA_Z2wVBJOSbl21hJj7m-Kcvy-89bkj1RU
     VITE_FIREBASE_AUTH_DOMAIN=flexcore-stage.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=flexcore-stage
     VITE_FIREBASE_STORAGE_BUCKET=flexcore-stage.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=840053696526
     VITE_FIREBASE_APP_ID=1:840053696526:web:083162045cdb2d788eb45f
     VITE_FIREBASE_MEASUREMENT_ID=G-RLQTVKK076
     VITE_RAPIDAPI_KEY=your-rapidapi-key-here
     ```
     ```
     # apps/web/.env.prod
     VITE_FIREBASE_API_KEY=AIzaSyDDl8FFdpnb2kJeMAflrHQshVYjFUUlyrQ
     VITE_FIREBASE_AUTH_DOMAIN=flexcore-prod.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=flexcore-prod
     VITE_FIREBASE_STORAGE_BUCKET=flexcore-prod.firebasestorage.app
     VITE_FIREBASE_MESSAGING_SENDER_ID=17594107666
     VITE_FIREBASE_APP_ID=1:17594107666:web:d228c0ba0cceed5e1d15cb
     VITE_FIREBASE_MEASUREMENT_ID=G-C8M3E8NDDQ
     VITE_RAPIDAPI_KEY=your-rapidapi-key-here
     ```
   - Update `.gitignore` to exclude `.env*`:
     ```gitignore
     node_modules/
     dist/
     .env
     .env.*
     ```
   - Configure T3 Env in `apps/web/env.js`:
     ```javascript
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
   - Add RapidAPI key to `.env.stage` and `.env.prod` after obtaining it from RapidAPI.
6. **Set Up CI Pipeline**:
   - Create `.github/workflows/ci.yml` for GitHub Actions:
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
   - Add deploy scripts to `apps/web/package.json`:
     ```json
     {
       "scripts": {
         "deploy:staging": "firebase deploy --only hosting:staging",
         "deploy:prod": "firebase deploy --only hosting:prod"
       }
     }
     ```

**Deliverables**:
- Monorepo structure with `apps/web`, `packages/shared`, `packages/seeding`, and `docs`.
- Initialized React app with Vite, Tailwind CSS, shadcn/ui, TanStack Query, and Axios.
- Configured ESLint, Prettier, Husky, Storybook, and Turborepo.
- Firebase project setup with Authentication, Firestore, and Hosting.
- `.env.stage` and `.env.prod` files in `apps/web`, gitignored via `.gitignore`.
- CI pipeline configured for linting, type-checking, and testing.

---

## Milestone 2: Authentication and User Management
**Goal**: Implement Firebase Authentication and user profile management.  
**Duration**: 1.5 weeks (2025-08-04 to 2025-08-13)  
**Tasks**:
1. **Set Up Firebase Authentication**:
   - Initialize Firebase in `apps/web/src/firebase.ts`:
     ```javascript
     import { initializeApp } from 'firebase/app';
     import { getAuth } from 'firebase/auth';
     import { getFirestore } from 'firebase/firestore';
     import { env } from './env';

     const firebaseConfig = {
       apiKey: env.VITE_FIREBASE_API_KEY,
       authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
       projectId: env.VITE_FIREBASE_PROJECT_ID,
       storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
       messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
       appId: env.VITE_FIREBASE_APP_ID,
     };

     const app = initializeApp(firebaseConfig);
     export const auth = getAuth(app);
     export const db = getFirestore(app);
     ```
   - Create `AuthContext` for user state:
     ```javascript
     import { createContext, useEffect, useState } from 'react';
     import { auth } from './firebase';
     import { onAuthStateChanged } from 'firebase/auth';

     export const AuthContext = createContext();
     export const AuthProvider = ({ children }) => {
       const [user, setUser] = useState(null);
       useEffect(() => {
         const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user));
         return unsubscribe;
       }, []);
       return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
     };
     ```
2. **Implement Login/Signup**:
   - Create `LoginScreen` and `SignupScreen` using shadcn/ui components (`Button`, `Input`).
   - Use React Hook Form with Zod for form validation:
     ```javascript
     import { useForm } from 'react-hook-form';
     import { zodResolver } from '@hookform/resolvers/zod';
     import { z } from 'zod';
     import { signInWithEmailAndPassword } from 'firebase/auth';
     import { auth } from './firebase';
     import { Button, Input } from '@/components/ui';

     const schema = z.object({
       email: z.string().email(),
       password: z.string().min(6),
     });

     const LoginScreen = () => {
       const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) });
       const onSubmit = async (data) => {
         try {
           await signInWithEmailAndPassword(auth, data.email, data.password);
         } catch (error) {
           console.error(error.message);
         }
       };
       return (
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           <Input {...register('email')} placeholder="Email" />
           <Input {...register('password')} type="password" placeholder="Password" />
           <Button type="submit">Login</Button>
         </form>
       );
     };
     ```
   - Add Google Sign-In using `signInWithPopup`.
3. **Create ProfileScreen**:
   - Display user info (`email`, `displayName`) and logout button.
   - Fetch user data from Firestore `users` collection.
4. **Test Authentication**:
   - Write Vitest unit tests for `AuthContext`.
   - Write Playwright E2E tests for login, signup, and Google Sign-In flows.

**Deliverables**:
- Functional login/signup flows with email/password and Google Sign-In.
- `AuthContext` for managing user state across the app.
- `ProfileScreen` showing user info.
- Unit and E2E tests for authentication.

---

## Milestone 3: Exercise Search and Selection
**Goal**: Integrate ExerciseDB API for searching and selecting exercises with visual previews.  
**Duration**: 2 weeks (2025-08-14 to 2025-08-27)  
**Tasks**:
1. **Integrate ExerciseDB API**:
   - Create `api/exerciseApi.ts`:
     ```javascript
     import axios from 'axios';
     import { env } from '../env';

     export const fetchExercises = async (query = '') => {
       const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
         headers: {
           'X-RapidAPI-Key': env.VITE_RAPIDAPI_KEY,
           'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
         },
         params: { name: query },
       });
       localStorage.setItem('exercises', JSON.stringify(response.data));
       return response.data;
     };
     ```
   - Use TanStack Query for data fetching:
     ```javascript
     import { useQuery } from '@tanstack/react-query';
     import { fetchExercises } from './exerciseApi';

     const useExercises = (query) => {
       return useQuery({
         queryKey: ['exercises', query],
         queryFn: () => fetchExercises(query),
         staleTime: 5 * 60 * 1000,
         initialData: () => {
           const cached = localStorage.getItem('exercises');
           return cached ? JSON.parse(cached) : undefined;
         },
       });
     };
     ```
2. **Build SearchScreen**:
   - Create `SearchScreen` with shadcn/ui `Input` and `Select` for filters (muscle group, equipment).
   - Display results in a Tailwind grid (`grid grid-cols-1 md:grid-cols-3 gap-4`).
   - Use `ExerciseCard` component for each exercise (name, muscle group, GIF).
3. **Implement Offline Support**:
   - Load cached exercises from `localStorage` if offline.
   - Use TanStack Query’s `initialData` for cached data.
4. **Test Search Functionality**:
   - Write Vitest tests for `fetchExercises` and `useExercises`.
   - Write Storybook stories for `ExerciseCard`.
   - Write Playwright E2E tests for search and filter flows.

**Deliverables**:
- Functional `SearchScreen` with ExerciseDB API integration.
- `ExerciseCard` component with GIF previews.
- Offline support for cached exercise data.
- Unit, component, and E2E tests for search functionality.

---

## Milestone 4: Workout Time Tracking
**Goal**: Implement workout timer and logging to Firestore.  
**Duration**: 1.5 weeks (2025-08-28 to 2025-09-07)  
**Tasks**:
1. **Build WorkoutScreen**:
   - Create `WorkoutScreen` with a list of selected exercises and a timer:
     ```javascript
     import { useState, useEffect } from 'react';
     import { Button } from '@/components/ui';

     const WorkoutScreen = ({ exercises }) => {
       const [time, setTime] = useState(0);
       useEffect(() => {
         const interval = setInterval(() => setTime((t) => t + 1), 1000);
         return () => clearInterval(interval);
       }, []);
       return (
         <div className="space-y-4">
           {exercises.map((ex) => (
             <div key={ex.id}>{ex.name}</div>
           ))}
           <div>{Math.floor(time / 60)}:{time % 60}</div>
           <Button>Complete Workout</Button>
         </div>
       );
     };
     ```
2. **Log Workouts to Firestore**:
   - Save workout data:
     ```javascript
     import { db } from '../firebase';
     import { addDoc, collection } from 'firebase/firestore';

     const logWorkout = async (userId, exercises, totalDuration) => {
       await addDoc(collection(db, 'workouts'), {
         user_id: userId,
         date: new Date(),
         exercises,
         total_duration: totalDuration,
       });
     };
     ```
3. **Implement Offline Logging**:
   - Store workout logs in `localStorage` if offline.
   - Sync to Firestore when online using `onAuthStateChanged` and `navigator.onLine`.
4. **Test Time Tracking**:
   - Write Vitest tests for timer logic.
   - Write Playwright E2E tests for workout logging and offline syncing.

**Deliverables**:
- `WorkoutScreen` with functional timer and exercise list.
- Workout logging to Firestore with offline support.
- Unit and E2E tests for time tracking and logging.

---

## Milestone 5: Weekly Routine Planning
**Goal**: Implement weekly routine creation and viewing with a calendar interface.  
**Duration**: 2 weeks (2025-09-08 to 2025-09-21)  
**Tasks**:
1. **Build RoutineScreen**:
   - Create `RoutineScreen` with a 7-day calendar view using Tailwind (`grid grid-cols-7 gap-2`).
   - Allow drag-and-drop or button-based exercise assignment to days.
   - Use shadcn/ui `Button` and `Checkbox` for marking workouts as completed.
2. **Manage Routines in Firestore**:
   - Save routines:
     ```javascript
     import { db } from '../firebase';
     import { addDoc, collection } from 'firebase/firestore';

     const addRoutine = async (userId, day, exercises) => {
       await addDoc(collection(db, 'routines'), {
         user_id: userId,
         day,
         exercises,
         completed: false,
       });
     };
     ```
   - Fetch routines with TanStack Query:
     ```javascript
     import { useQuery } from '@tanstack/react-query';
     import { db } from '../firebase';
     import { collection, query, where, getDocs } from 'firebase/firestore';

     const fetchRoutines = async (userId) => {
       const q = query(collection(db, 'routines'), where('user_id', '==', userId));
       const snapshot = await getDocs(q);
       return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
     };
     ```
3. **Implement Offline Support**:
   - Cache routines in `localStorage`.
   - Sync updates to Firestore when online.
4. **Test Routine Features**:
   - Write Vitest tests for routine CRUD operations.
   - Write Storybook stories for `RoutineScreen` components.
   - Write Playwright E2E tests for routine creation and completion.

**Deliverables**:
- `RoutineScreen` with 7-day calendar and exercise assignment.
- Routine management in Firestore with offline support.
- Unit, component, and E2E tests for routine features.

---

## Milestone 6: Testing, Deployment, and Polish
**Goal**: Finalize testing, deploy to staging and production, and polish UI/UX.  
**Duration**: 2 weeks (2025-09-22 to 2025-10-05)  
**Tasks**:
1. **Complete Testing**:
   - Achieve 80% test coverage with Vitest (unit/component tests).
   - Run Playwright E2E tests for all user flows (auth, search, workout, routine).
   - Use Storybook a11y addon to ensure WCAG 2.1 AA compliance.
2. **Deploy to Staging**:
   - Build app: `pnpm build` in `apps/web`.
   - Deploy: `pnpm run deploy:staging`.
   - Test on `https://flexcore-staging.web.app`.
3. **Polish UI/UX**:
   - Optimize GIF loading with `IntersectionObserver`.
   - Add Tailwind animations (e.g., `hover:scale-105` for exercise cards).
   - Ensure mobile responsiveness (`sm:`, `md:` breakpoints).
4. **Deploy to Production**:
   - Promote staging to production: `pnpm run deploy:prod`.
   - Verify on `https://flexcore-prod.web.app`.
5. **Set Up Monitoring**:
   - Enable Firebase Crashlytics for error tracking.
   - Configure GA4 for usage analytics (e.g., track search queries, workout completions).

**Deliverables**:
- Fully tested app with 80% coverage and WCAG 2.1 AA compliance.
- Deployed staging environment (`flexcore-staging.web.app`).
- Deployed production environment (`flexcore-prod.web.app`).
- Monitoring setup with Crashlytics and GA4.

---

## Notes
- **Firebase Config**: `.env.stage` and `.env.prod` have been created using the provided Firebase JSON configs for `flexcore-stage` and `flexcore-prod`. Replace `your-rapidapi-key-here` in both files with your actual RapidAPI key for the ExerciseDB API.
- **Environment Security**: `.env` and `.env.*` are gitignored to prevent committing sensitive data, as confirmed in the `.gitignore` configuration.
- **Timeline**: Total estimated duration is 10 weeks (2025-07-28 to 2025-10-05). Parallel tasks (e.g., UI polish during testing) can reduce this to ~8 weeks.
- **Next Steps**:
  - Add your RapidAPI key to `.env.stage` and `.env.prod`.
  - Run `pnpm install` and `pnpm exec turbo run setup` to initialize the project.
  - Verify Firebase setup by testing Authentication and Firestore locally with the emulator (`firebase emulators:start`).
  - Review this roadmap and confirm or adjust milestones as needed.