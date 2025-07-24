# FlexCore Milestone 3: Exercise Search and Selection

**Goal**: Integrate the ExerciseDB API for searching and filtering exercises, display results with GIF previews in a responsive grid, implement offline support, and add tests.  
**Duration**: 2 weeks (2025-08-14 to 2025-08-27)  
**Objective**: Build a user-friendly exercise search feature with visual previews, optimized for performance and offline use, to impress your coding bootcamp instructor.

---

## Prerequisites
- **Milestone 1 & 2 Completed**: Monorepo with `apps/web`, Firebase setup (`flexcore-staging` and `flexcore-prod`), `.env.stage`/`.env.prod` with RapidAPI key, and authentication implemented.
- **Node.js**: LTS v22 (verify: `node -v`).
- **PNPM**: Version 8 (verify: `pnpm -v`).
- **Firebase CLI**: Installed and logged in (`firebase login`).
- **RapidAPI Key**: Added to `.env.stage` and `.env.prod` for ExerciseDB API.
- **Editor**: VS Code with TypeScript, ESLint, and Prettier extensions.
- **Firebase Emulator**: Running for local testing (`firebase emulators:start`).

---

## Tasks and Implementation

### 1. Integrate ExerciseDB API
**Objective**: Set up API calls to ExerciseDB using Axios and TanStack Query, with caching for offline support.

1. **Create Exercise Types**:
   - In `packages/shared/src/types`, create `exercise.ts`:
     ```typescript
     export interface Exercise {
       id: string;
       name: string;
       target: string;
       equipment: string;
       gifUrl: string;
     }
     ```
   - Explanation: Defines the shape of ExerciseDB API responses for type safety.

2. **Create API Client**:
   - In `apps/web/src/api`, create `exerciseApi.ts`:
     ```typescript
     import axios from 'axios';
     import { env } from '../env';
     import { Exercise } from '@flexcore/shared';

     export const fetchExercises = async (query: string = '', target?: string, equipment?: string): Promise<Exercise[]> => {
       try {
         const response = await axios.get('https://exercisedb.p.rapidapi.com/exercises', {
           headers: {
             'X-RapidAPI-Key': env.VITE_RAPIDAPI_KEY,
             'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
           },
           params: { name: query, target, equipment },
         });
         const exercises = response.data as Exercise[];
         localStorage.setItem('exercises', JSON.stringify(exercises));
         return exercises;
       } catch (error) {
         const cached = localStorage.getItem('exercises');
         if (cached) return JSON.parse(cached) as Exercise[];
         throw error;
       }
     };
     ```
   - Explanation: Fetches exercises with optional query parameters, caches results in `localStorage` for offline use, and falls back to cached data on error (e.g., rate limit).

3. **Create TanStack Query Hook**:
   - In `apps/web/src/hooks`, create `useExercises.ts`:
     ```typescript
     import { useQuery } from '@tanstack/react-query';
     import { fetchExercises } from '../api/exerciseApi';
     import { Exercise } from '@flexcore/shared';

     export const useExercises = (query: string = '', target?: string, equipment?: string) => {
       return useQuery<Exercise[], Error>({
         queryKey: ['exercises', query, target, equipment],
         queryFn: () => fetchExercises(query, target, equipment),
         staleTime: 5 * 60 * 1000, // 5 minutes
         initialData: () => {
           const cached = localStorage.getItem('exercises');
           return cached ? JSON.parse(cached) as Exercise[] : undefined;
         },
       });
     };
     ```
   - Explanation: Uses TanStack Query to manage API calls, caching, and offline data with a 5-minute `staleTime`.

**Deliverable**: ExerciseDB API integration with Axios and TanStack Query, including offline caching.

---

### 2. Build SearchScreen
**Objective**: Create a search interface with filters and a responsive exercise grid using shadcn/ui and Tailwind CSS.

1. **Create Search Form Schema**:
   - In `packages/shared/src/schemas`, create `search.ts`:
     ```typescript
     import { z } from 'zod';

     export const searchSchema = z.object({
       query: z.string().optional(),
       target: z.string().optional(),
       equipment: z.string().optional(),
     });

     export type SearchFormData = z.infer<typeof searchSchema>;
     ```
   - Explanation: Defines the form schema for search inputs.

2. **Create ExerciseCard Component**:
   - In `apps/web/src/components`, create `ExerciseCard.tsx`:
     ```typescript
     import { Exercise } from '@flexcore/shared';
     import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

     interface ExerciseCardProps {
       exercise: Exercise;
     }

     const ExerciseCard = ({ exercise }: ExerciseCardProps) => {
       return (
         <Card className="shadow-md hover:scale-105 transition-transform">
           <CardHeader>
             <CardTitle>{exercise.name}</CardTitle>
           </CardHeader>
           <CardContent>
             <img
               src={exercise.gifUrl}
               alt={exercise.name}
               className="w-full h-48 object-cover rounded-md"
               loading="lazy"
             />
             <p className="mt-2"><strong>Muscle:</strong> {exercise.target}</p>
             <p><strong>Equipment:</strong> {exercise.equipment}</p>
           </CardContent>
         </Card>
       );
     };

     export default ExerciseCard;
     ```
   - Explanation: Displays exercise details with a lazy-loaded GIF and Tailwind styling.

3. **Create SearchScreen**:
   - In `apps/web/src/components`, create `SearchScreen.tsx`:
     ```typescript
     import { useForm } from 'react-hook-form';
     import { zodResolver } from '@hookform/resolvers/zod';
     import { searchSchema, SearchFormData } from '@flexcore/shared';
     import { useExercises } from '../hooks/useExercises';
     import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
     import ExerciseCard from './ExerciseCard';

     const muscleGroups = ['biceps', 'triceps', 'chest', 'back', 'legs'];
     const equipmentList = ['dumbbell', 'barbell', 'bodyweight', 'cable'];

     const SearchScreen = () => {
       const { register, handleSubmit } = useForm<SearchFormData>({
         resolver: zodResolver(searchSchema),
       });
       const [searchParams, setSearchParams] = useState<SearchFormData>({});
       const { data: exercises, isLoading, error } = useExercises(
         searchParams.query,
         searchParams.target,
         searchParams.equipment,
       );

       const onSubmit = (data: SearchFormData) => {
         setSearchParams(data);
       };

       return (
         <div className="max-w-7xl mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Search Exercises</h2>
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
             <Input {...register('query')} placeholder="Search by exercise name" />
             <Select {...register('target')}>
               <SelectTrigger>
                 <SelectValue placeholder="Select muscle group" />
               </SelectTrigger>
               <SelectContent>
                 {muscleGroups.map((muscle) => (
                   <SelectItem key={muscle} value={muscle}>{muscle}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Select {...register('equipment')}>
               <SelectTrigger>
                 <SelectValue placeholder="Select equipment" />
               </SelectTrigger>
               <SelectContent>
                 {equipmentList.map((equip) => (
                   <SelectItem key={equip} value={equip}>{equip}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Button type="submit">Search</Button>
           </form>
           {isLoading && <p>Loading...</p>}
           {error && <p className="text-red-500">Error: {error.message}</p>}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {exercises?.map((exercise) => (
               <ExerciseCard key={exercise.id} exercise={exercise} />
             ))}
           </div>
         </div>
       );
     };

     export default SearchScreen;
     ```
   - Explanation: Uses React Hook Form for search input, shadcn/ui for form components, and Tailwind for a responsive grid. Displays `ExerciseCard` components for results.

4. **Update Routing**:
   - Update `apps/web/src/App.tsx` to include `SearchScreen`:
     ```typescript
     import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
     import { useContext } from 'react';
     import { AuthContext } from './context/AuthContext';
     import LoginScreen from './components/LoginScreen';
     import SignupScreen from './components/SignupScreen';
     import ProfileScreen from './components/ProfileScreen';
     import SearchScreen from './components/SearchScreen';

     const App = () => {
       const { user } = useContext(AuthContext);

       return (
         <BrowserRouter>
           <Routes>
             <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
             <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupScreen />} />
             <Route path="/profile" element={user ? <ProfileScreen /> : <Navigate to="/login" />} />
             <Route path="/" element={user ? <SearchScreen /> : <Navigate to="/login" />} />
           </Routes>
         </BrowserRouter>
       );
     };

     export default App;
     ```
   - Explanation: Sets `SearchScreen` as the default route for authenticated users.

**Deliverable**: `SearchScreen` with search form, filters, and responsive exercise grid, integrated with routing.

---

### 3. Implement Offline Support
**Objective**: Ensure exercises can be viewed offline using cached data.

1. **Update `useExercises` Hook**:
   - Already implemented in `useExercises.ts` with `initialData` to load cached exercises from `localStorage`.
   - Ensure `fetchExercises` in `exerciseApi.ts` saves to `localStorage` and falls back to cached data on error.

2. **Test Offline Behavior**:
   - Simulate offline mode in browser dev tools (Network → Offline).
   - Verify cached exercises load when API calls fail.

**Deliverable**: Offline support for exercise browsing using `localStorage`.

---

### 4. Test Search Functionality
**Objective**: Write unit, component, and end-to-end tests to ensure reliability.

1. **Unit Tests for API and Hook**:
   - In `apps/web/src/api/__tests__`, create `exerciseApi.test.ts`:
     ```typescript
     import { vi, describe, it, expect } from 'vitest';
     import { fetchExercises } from '../exerciseApi';
     import axios from 'axios';

     vi.mock('axios');

     describe('fetchExercises', () => {
       it('fetches exercises from API and caches them', async () => {
         const mockExercises = [{ id: '1', name: 'Bicep Curl', target: 'biceps', equipment: 'dumbbell', gifUrl: 'url' }];
         vi.mocked(axios.get).mockResolvedValue({ data: mockExercises });
         localStorage.clear();

         const result = await fetchExercises('bicep');
         expect(result).toEqual(mockExercises);
         expect(localStorage.getItem('exercises')).toEqual(JSON.stringify(mockExercises));
       });

       it('returns cached exercises on API failure', async () => {
         const mockExercises = [{ id: '1', name: 'Bicep Curl', target: 'biceps', equipment: 'dumbbell', gifUrl: 'url' }];
         localStorage.setItem('exercises', JSON.stringify(mockExercises));
         vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

         const result = await fetchExercises('bicep');
         expect(result).toEqual(mockExercises);
       });
     });
     ```
   - In `apps/web/src/hooks/__tests__`, create `useExercises.test.ts`:
     ```typescript
     import { renderHook } from '@testing-library/react';
     import { useExercises } from '../useExercises';
     import { vi, describe, it, expect } from 'vitest';
     import * as exerciseApi from '../api/exerciseApi';

     vi.mock('../api/exerciseApi');

     describe('useExercises', () => {
       it('fetches exercises with query', async () => {
         const mockExercises = [{ id: '1', name: 'Bicep Curl', target: 'biceps', equipment: 'dumbbell', gifUrl: 'url' }];
         vi.mocked(exerciseApi.fetchExercises).mockResolvedValue(mockExercises);

         const { result } = renderHook(() => useExercises('bicep'));
         expect(result.current.data).toEqual(mockExercises);
       });
     });
     ```
   - Explanation: Tests API calls and caching behavior.

2. **Storybook Stories**:
   - In `apps/web/src/components`, create `ExerciseCard.stories.tsx`:
     ```typescript
     import type { Meta, StoryObj } from '@storybook/react';
     import ExerciseCard from './ExerciseCard';

     const meta: Meta<typeof ExerciseCard> = {
       component: ExerciseCard,
       title: 'Components/ExerciseCard',
     };

     export default meta;
     type Story = StoryObj<typeof ExerciseCard>;

     export const Default: Story = {
       args: {
         exercise: {
           id: '1',
           name: 'Bicep Curl',
           target: 'biceps',
           equipment: 'dumbbell',
           gifUrl: 'https://example.com/bicep-curl.gif',
         },
       },
     };
     ```
   - Create `SearchScreen.stories.tsx`:
     ```typescript
     import type { Meta, StoryObj } from '@storybook/react';
     import SearchScreen from './SearchScreen';

     const meta: Meta<typeof SearchScreen> = {
       component: SearchScreen,
       title: 'Components/SearchScreen',
     };

     export default meta;
     type Story = StoryObj<typeof SearchScreen>;

     export const Default: Story = {};
     ```

3. **End-to-End Tests with Playwright**:
   - In `apps/web/tests`, create `search.spec.ts`:
     ```typescript
     import { test, expect } from '@playwright/test';

     test('search exercises by name', async ({ page }) => {
       await page.goto('/');
       await page.fill('input[placeholder="Search by exercise name"]', 'bicep curl');
       await page.click('button:has-text("Search")');
       await expect(page.getByText('Bicep Curl')).toBeVisible();
     });

     test('filter exercises by muscle group', async ({ page }) => {
       await page.goto('/');
       await page.getByText('Select muscle group').click();
       await page.getByText('biceps').click();
       await page.click('button:has-text("Search")');
       await expect(page.getByText('biceps')).toBeVisible();
     });

     test('offline mode shows cached exercises', async ({ page }) => {
       await page.goto('/');
       await page.route('**/*', (route) => route.abort());
       await page.reload();
       await expect(page.getByText('Bicep Curl')).toBeVisible();
     });
     ```
   - Explanation: Tests search, filtering, and offline mode (requires mocked API responses or emulator setup).

4. **Run Tests**:
   ```bash
   cd apps/web
   pnpm test
   pnpm e2e
   pnpm storybook
   ```

**Deliverable**: Unit tests for API and hooks, Storybook stories for UI components, and Playwright E2E tests for search functionality.

---

## Verification Steps
1. **Test Locally**:
   ```bash
   cd apps/web
   pnpm dev
   ```
   Open `http://localhost:5173`, log in, and test searching for "bicep curl" or filtering by "biceps" or "dumbbell".
2. **Test Offline Mode**:
   - Cache exercises by searching once, then enable offline mode in browser dev tools (Network → Offline).
   - Reload and verify exercises load from `localStorage`.
3. **Test Firebase Emulator**:
   ```bash
   firebase emulators:start
   ```
   Ensure Authentication works and `SearchScreen` loads.
4. **Run Tests**:
   ```bash
   pnpm test
   pnpm e2e
   ```
   Verify all unit and E2E tests pass.
5. **Test Storybook**:
   ```bash
   pnpm storybook
   ```
   Open `http://localhost:6006` to verify `ExerciseCard` and `SearchScreen` stories.
6. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: implement exercise search and selection"
   git push origin main
   ```
   Verify CI pipeline runs successfully in GitHub Actions.

---

## Deliverables
- ExerciseDB API integration with `exerciseApi.ts` and `useExercises.ts`, supporting search and filtering.
- `SearchScreen` with form, filters, and responsive grid using shadcn/ui and Tailwind CSS.
- `ExerciseCard` component with GIF previews and lazy loading.
- Offline support via `localStorage` caching.
- Unit tests for API and hooks, Storybook stories for UI components, and Playwright E2E tests for search flows.

---

## Notes for Bootcamp
- **Instructor Appeal**: This milestone showcases:
  - API integration with Axios and TanStack Query for efficient data fetching.
  - Responsive, accessible UI with shadcn/ui and Tailwind CSS.
  - Offline support with `localStorage`, demonstrating thoughtful UX.
  - Comprehensive testing (unit, component, E2E) for reliability.
- **Tips for Execution**:
  - Test API calls with your RapidAPI key in the Firebase emulator first to avoid rate limits.
  - If GIFs load slowly, verify `loading="lazy"` is applied to `<img>` tags.
  - Use Storybook to preview `ExerciseCard` and ensure accessibility (e.g., alt text, keyboard navigation).
  - Document challenges in `docs/notes.md` (e.g., handling API rate limits) to show problem-solving.
- **Submission Prep**:
  - Update `README.md` with instructions to test the search feature (`pnpm dev`, search for "bicep curl").
  - Record a video demo of searching and filtering exercises to show your instructor.
  - Include the [TDD](xaiArtifact://fcf7cde1-ea84-48d8-aa78-5edf9ff52cd6/9bc96a1a-fb47-41ae-9ee6-53f3997d325a) and roadmap in `docs` for context.
- **RapidAPI Key**: Ensure your ExerciseDB API key is in `.env.stage` and `.env.prod`. If you hit rate limits (500 requests/month on free tier), rely on cached data for testing.

---

## Next Steps
- Complete the tasks above and verify locally with `pnpm dev` and `firebase emulators:start`.
- Run tests (`pnpm test`, `pnpm e2e`) to ensure functionality.
- Push to GitHub and check the CI pipeline.
- Share any issues (e.g., API errors, test failures) for debugging.
- Once Milestone 3 is complete, we can move to Milestone 4 (Workout Time Tracking) or adjust based on your feedback.

FlexCore is coming together beautifully, and this search feature will really shine for your bootcamp! Let me know if you need help with any step or want to tweak the UI (e.g., add more filters).