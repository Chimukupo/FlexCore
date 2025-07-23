# TECHNICAL DESIGN DOCUMENT: FlexCore

**Onesentence pitch**: FlexCore is a simple fitness web app that allows users to search and visually select exercises, track workout time, and plan weekly routines using a modern, scalable tech stack.

---

## 1. OVERVIEW

**Goal**:
- Solve the problem of fitness enthusiasts needing an intuitive app to discover exercises, track workout duration, and plan weekly routines with offline support.
- Deliver a Minimum Viable Product (MVP) focused on core functionality with a clean, responsive UI.

**Key features**:
- Search and filter exercises using the ExerciseDB API with visual previews (GIFs).
- Track workout duration with a client-side timer and log sessions in Firestore.
- Plan and view weekly routines in a calendar-like interface.
- Support offline exercise browsing, routine viewing, and time tracking.
- Secure user authentication with Firebase (email/password, Google Sign-In).

**Target users & success criteria**:
- **Users**: Fitness enthusiasts (beginners to advanced) who want a straightforward app to plan and track workouts.
- **Success criteria**:
  - Users can search and add exercises to a workout in under 30 seconds.
  - 90% of workout logs sync successfully to Firestore within 5 seconds of reconnecting online.
  - App achieves a Lighthouse performance score of 90+ on mobile devices.
  - Positive user feedback on UI simplicity and offline functionality (target: 4+ stars in initial beta reviews).

---

## 2. TECH STACK (GOLDEN PATH)

**Runtime**: Node LTS v22  
**Language**: TypeScript (strict)  
**Frontend**: React v19 + Vite (created with `npm create vite@latest -- --template react-ts`)  
**UI kit**: shadcn/ui (Radix primitives + Tailwind source-copy model)  
**Styling**: Tailwind CSS v4 (with design token file)  
**State / data fetching**: TanStack Query  
**Forms & validation**: React Hook Form + Zod resolver  
**Shared validation**: Zod (client-side validation for forms and API responses)  
**Backend services**: Firebase Authentication, Firestore, Hosting  
**Package manager / mono**: PNPM workspaces  
**Build orchestration**: Turborepo (remote caching)  
**Component workshop**: Storybook (UI in isolation)  
**Unit / component tests**: Vitest + Testing Library  
**Visual / interaction**: Storybook + @storybook/testing-library  
**End-to-end tests**: Playwright  
**Linting**: ESLint (typescript-eslint) + eslint-plugin-perfectionist  
**Formatting**: Prettier  
**Typesafe env vars**: T3 Env (Zod-validated)  
**Versioning / publishing**: Changesets (monorepo changelogs & releases)  
**CI / CD**: GitHub Actions (Turbo-aware pipeline; see §8)

---

## 3. MONOREPO LAYOUT (PNPM)

```
.
├── apps/
│   └── web/            ← React frontend (+ .storybook)
├── packages/
│   ├── shared/         ← Zod schemas, utilities, common types
│   └── seeding/        ← Data-seeding helpers (Firestore emulator)
├── docs/               ← Project docs (this TDD, ADRs, API notes)
└── .github/            ← CI workflows
```

---

## 4. ARCHITECTURE

**Client (React + TanStack Query)** ⇄ **Firebase HTTPS APIs** ⇄ **Firestore**  
**Client** fetches exercise data from **ExerciseDB API (RapidAPI)** and caches responses in `localStorage`.  
**Firestore** stores user-specific data (routines, workout logs).  
**Firebase Authentication** handles user login (email/password, Google Sign-In).  
**Firebase Hosting** serves the single-page React app.

**Diagram**:
```
[React Web App] <-> [Firebase Hosting] <-> [Firebase APIs]
   |                            |               |
[localStorage]           [Auth Service]   [Firestore] <-> [ExerciseDB API]
```

---

## 5. DATA MODEL

| Entity   | Key fields                              | Notes                              |
|----------|-----------------------------------------|------------------------------------|
| User     | `uid`, `email`, `displayName`          | Managed by Firebase Auth           |
| Routine  | `user_id`, `day`, `exercises: [{ id, name, target, gifUrl }], completed` | Weekly routine per day |
| Workout  | `user_id`, `date`, `exercises: [{ id, name, duration }], total_duration` | Log of completed workouts |

**Security rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /routines/{routineId} {
      allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
    }
    match /workouts/{workoutId} {
      allow read, write: if request.auth != null && resource.data.user_id == request.auth.uid;
    }
  }
}
```

**Index strategy**:
- Composite indexes:
  - `routines`: `user_id ASC, day ASC` (for fetching user routines by day).
  - `workouts`: `user_id ASC, date DESC` (for retrieving workout history).
- Configured via `firestore.indexes.json` and deployed with `firebase deploy --only firestore:indexes`.

---

## 6. API DESIGN

**ExerciseDB API (RapidAPI)**:
| Endpoint                     | Input (Query Params) | Output                              |
|------------------------------|----------------------|-------------------------------------|
| `GET /exercises`             | `name` (optional)    | Array of `{ id, name, target, equipment, gifUrl }` |
| `GET /exercises/target/{muscle}` | Muscle group (e.g., `biceps`) | Array of exercises |
| `GET /exercises/equipment/{equipment}` | Equipment (e.g., `dumbbell`) | Array of exercises |

**Firebase Firestore APIs** (via client SDK):
| Operation         | Input (Zod schema)                       | Output                          |
|-------------------|------------------------------------------|---------------------------------|
| `getUser`         | `uid`                                    | `{ uid, email, displayName }`   |
| `addRoutine`      | `{ user_id, day, exercises, completed }` | Routine document ID             |
| `getRoutines`     | `user_id, day?`                          | Array of routines              |
| `addWorkout`      | `{ user_id, date, exercises, total_duration }` | Workout document ID       |
| `getWorkouts`     | `user_id, date?`                         | Array of workouts              |

**Error-handling conventions**:
- **Auth errors**: Catch Firebase Auth errors (e.g., `auth/invalid-credential`) and display user-friendly messages (e.g., “Invalid login credentials”).
- **Validation errors**: Use Zod to validate inputs client-side; display errors in forms via React Hook Form.
- **API errors**: Handle ExerciseDB rate limits (HTTP 429) by falling back to cached `localStorage` data.

---

## 7. USER STORIES AND EPICS

**Epic 1: Exercise Search and Selection**
- **User Story**: As a fitness enthusiast, I want to search for exercises by name or muscle group so I can find relevant workouts.
  - Acceptance: Search returns results in <2 seconds; displays exercise cards with GIFs.
- **User Story**: As a user, I want to see visual previews of exercises so I can confirm proper form before adding them.
  - Acceptance: Each exercise card shows name, muscle group, and GIF.

**Epic 2: Workout Time Tracking**
- **User Story**: As a user, I want to track the duration of my workouts so I can monitor my effort.
  - Acceptance: Timer starts/stops accurately; total duration is saved to Firestore.
- **User Story**: As a user, I want my workout logs saved even if I’m offline, syncing when I reconnect.
  - Acceptance: Offline logs sync within 5 seconds of reconnecting.

**Epic 3: Weekly Routine Planning**
- **User Story**: As a user, I want to plan my workouts for the week so I can stay organized.
  - Acceptance: Calendar view shows 7 days; I can assign exercises to a day.
- **User Story**: As a user, I want to mark workouts as completed to track my progress.
  - Acceptance: Completed workouts are saved and displayed in history.

**Epic 4: User Authentication**
- **User Story**: As a user, I want to log in with email or Google to access my routines securely.
  - Acceptance: Login completes in <3 seconds; unauthorized access is blocked.

---

## 8. TESTING STRATEGY

| Level / focus        | Toolset                              | Scope                          |
|----------------------|--------------------------------------|--------------------------------|
| Unit                 | Vitest                               | Pure functions, hooks          |
| Component            | Vitest + Testing Library             | React components (e.g., ExerciseCard) |
| Visual / interaction | Storybook + @storybook/testing-library | UI snapshots, interactions    |
| End-to-end           | Playwright                           | Auth flows, search, workout logging |

**Coverage target**: 80% statements.  
**Fixtures / seeding**: `pnpm seed` runs scripts in `packages/seeding` to populate Firestore emulator with sample exercises and routines.

---

## 9. CI / CD PIPELINE (GITHUB ACTIONS)

1. **Setup**: Install PNPM, restore Turbo remote cache.
2. **Lint & Typecheck**: `pnpm exec turbo run lint typecheck` (ESLint, `tsc --noEmit`).
3. **Unit Tests**: `pnpm exec turbo run test` (Vitest, Turbo skips untouched packages).
4. **Storybook Build**: `pnpm exec turbo run build-storybook` (generates static Storybook).
5. **End-to-End Tests**: `pnpm exec turbo run e2e` (Playwright, headless).
6. **Deploy**:
   - **Staging**: `pnpm run deploy:staging` (deploys to Firebase Hosting `staging` target).
   - **Production**: `pnpm run deploy:prod` (promotes to `prod` target on merge to `main`).
7. **Release**: Changesets generates changelogs and publishes packages.

**Deploy Scripts** (in `apps/web/package.json`):
```json
{
  "scripts": {
    "deploy:staging": "firebase deploy --only hosting:staging",
    "deploy:prod": "firebase deploy --only hosting:prod"
  }
}
```

**Firebase Targets** (configured via `firebase.json`):
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

---

## 10. ENVIRONMENTS & SECRETS

| Env      | URL / target                          | Notes                              |
|----------|---------------------------------------|------------------------------------|
| local    | localhost:5173                        | .env + Firebase emulators; T3 Env |
| staging  | https://flexcore-staging.web.app      | Deployed per PR via CI            |
| prod     | https://flexcore-prod.web.app         | Promoted on merge to `main`       |

**Secrets**:
- Stored in `.env` (local) and GitHub repo secrets (CI).
- Validated with T3 Env (Zod schemas).
- Example `.env`:
  ```env
  VITE_FIREBASE_API_KEY=your-api-key
  VITE_FIREBASE_AUTH_DOMAIN=flexcore.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=flexcore
  VITE_RAPIDAPI_KEY=your-rapidapi-key
  ```

---

## 11. PERFORMANCE & SCALABILITY

- **Firestore**: Denormalize routines and workouts to avoid hot-document writes (e.g., one document per routine/day).
- **TanStack Query**: Set `staleTime: 5 * 60 * 1000` (5 minutes) for ExerciseDB API responses to reduce calls.
- **Code-splitting**: Use Vite dynamic imports for lazy-loading components (e.g., `RoutineScreen`).
- **GIF Optimization**: Lazy-load ExerciseDB GIFs with `IntersectionObserver` and cache in `localStorage`.

---

## 12. MONITORING & LOGGING

| Concern        | Tool                     | Notes                        |
|----------------|--------------------------|------------------------------|
| Runtime errors | Firebase Crashlytics     | Frontend error capture       |
| Analytics      | Google Analytics 4 (GA4) | Track search, workout events |

---

## 13. ACCESSIBILITY & I18N

- **Accessibility**:
  - shadcn/ui components ensure ARIA compliance and keyboard navigation.
  - Storybook a11y addon for contrast and focus audits.
  - Target WCAG 2.1 AA (e.g., 4.5:1 contrast ratio).
- **I18N plan**: Implement `react-intl` for multi-language support (English default, add Spanish post-MVP).

---

## 14. CODE QUALITY & FORMATTING

- **Prettier**: Formats on save/commit (via `lint-staged`).
- **ESLint**: Enforces rules with `typescript-eslint` and `eslint-plugin-perfectionist` (sorts imports/keys).
- **Husky**: Pre-commit hook runs `lint-staged` for linting and formatting.

---

## 15. OPEN QUESTIONS / RISKS

| Item                            | Owner | Resolution date |
|---------------------------------|-------|-----------------|
| ExerciseDB API rate limit handling | Dev   | 2025-08-15      |
| Offline sync reliability        | Dev   | 2025-08-20      |

---

## 16. APPENDICES

- **Setup script**: `pnpm exec turbo run setup` (installs dependencies, sets up Firebase emulators).
- **Branching model**: Conventional commits (`feat`, `fix`, etc.) + Changesets for versioning.
- **Links**:
  - Product spec: TBD
  - Figma: TBD
  - Storybook URL: Deployed via CI (staging/prod)
  - ADR index: `docs/adrs/`

---

**Last updated**: 20250723