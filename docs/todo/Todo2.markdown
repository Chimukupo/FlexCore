# FlexCore Milestone 2: Authentication and User Management

**Goal**: Implement Firebase Authentication with email/password and Google Sign-In, create a user profile screen, and add tests to ensure functionality.  
**Duration**: 1.5 weeks (2025-08-04 to 2025-08-13)  
**Objective**: Build a secure and user-friendly authentication system for FlexCore, showcasing modern React practices and testing for your coding bootcamp submission.

---

## Prerequisites
- **Milestone 1 Completed**: Monorepo with `apps/web`, `packages/shared`, Firebase setup (`flexcore-staging` and `flexcore-prod`), and `.env.stage`/`.env.prod` files with RapidAPI key added.
- **Node.js**: LTS v22 (verify with `node -v`).
- **PNPM**: Version 8 (verify with `pnpm -v`).
- **Firebase CLI**: Installed and logged in (`firebase login`).
- **Editor**: VS Code with TypeScript, ESLint, and Prettier extensions.
- **Firebase Console**: Ensure Authentication is enabled for email/password and Google Sign-In in both `flexcore-staging` and `flexcore-prod` projects.

---

## Tasks and Implementation

### 1. Set Up Firebase Authentication
**Objective**: Initialize Firebase Authentication in the React app and create an `AuthContext` for managing user state.

1. **Create Firebase Configuration**:
   - In `apps/web/src`, create `firebase.ts`:
     ```typescript
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
   - Explanation: This initializes Firebase with the environment variables from `env.ts` (set up in Milestone 1) and exports `auth` and `db` for use across the app.

2. **Create AuthContext**:
   - In `apps/web/src/context`, create `AuthContext.tsx`:
     ```typescript
     import { createContext, useEffect, useState, ReactNode } from 'react';
     import { auth } from '../firebase';
     import { onAuthStateChanged, User } from 'firebase/auth';

     export const AuthContext = createContext<{ user: User | null }>({ user: null });

     export const AuthProvider = ({ children }: { children: ReactNode }) => {
       const [user, setUser] = useState<User | null>(null);

       useEffect(() => {
         const unsubscribe = onAuthStateChanged(auth, (user) => {
           setUser(user);
         });
         return () => unsubscribe();
       }, []);

       return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
     };
     ```
   - Explanation: `AuthContext` manages the authenticated user state, updating when the user logs in or out. `onAuthStateChanged` listens for auth changes.

3. **Wrap App with AuthProvider**:
   - Update `apps/web/src/main.tsx`:
     ```typescript
     import React from 'react';
     import ReactDOM from 'react-dom/client';
     import App from './App.tsx';
     import './index.css';
     import { AuthProvider } from './context/AuthContext.tsx';

     ReactDOM.createRoot(document.getElementById('root')!).render(
       <React.StrictMode>
         <AuthProvider>
           <App />
         </AuthProvider>
       </React.StrictMode>,
     );
     ```
   - Explanation: Wraps the app with `AuthProvider` to make the user state available everywhere.

**Deliverable**: Firebase Authentication initialized with `AuthContext` for user state management.

---

### 2. Implement Login/Signup
**Objective**: Create login and signup screens with email/password and Google Sign-In, using React Hook Form, Zod, and shadcn/ui.

1. **Create Zod Schemas**:
   - In `packages/shared/src`, create `schemas/auth.ts`:
     ```typescript
     import { z } from 'zod';

     export const loginSchema = z.object({
       email: z.string().email({ message: 'Invalid email address' }),
       password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
     });

     export const signupSchema = z.object({
       email: z.string().email({ message: 'Invalid email address' }),
       password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
       displayName: z.string().min(1, { message: 'Name is required' }),
     });

     export type LoginFormData = z.infer<typeof loginSchema>;
     export type SignupFormData = z.infer<typeof signupSchema>;
     ```
   - Explanation: Shared Zod schemas ensure consistent validation for login and signup forms.

2. **Create LoginScreen**:
   - In `apps/web/src/components`, create `LoginScreen.tsx`:
     ```typescript
     import { useForm } from 'react-hook-form';
     import { zodResolver } from '@hookform/resolvers/zod';
     import { loginSchema, LoginFormData } from '@flexcore/shared';
     import { Button, Input } from '@/components/ui';
     import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
     import { auth } from '../firebase';
     import { useState } from 'react';

     const LoginScreen = () => {
       const [error, setError] = useState<string | null>(null);
       const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
         resolver: zodResolver(loginSchema),
       });

       const onSubmit = async (data: LoginFormData) => {
         try {
           await signInWithEmailAndPassword(auth, data.email, data.password);
         } catch (err: any) {
           setError(err.message);
         }
       };

       const handleGoogleSignIn = async () => {
         try {
           const provider = new GoogleAuthProvider();
           await signInWithPopup(auth, provider);
         } catch (err: any) {
           setError(err.message);
         }
       };

       return (
         <div className="max-w-md mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Login to FlexCore</h2>
           {error && <p className="text-red-500 mb-4">{error}</p>}
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div>
               <Input {...register('email')} placeholder="Email" />
               {errors.email && <p className="text-red-500">{errors.email.message}</p>}
             </div>
             <div>
               <Input {...register('password')} type="password" placeholder="Password" />
               {errors.password && <p className="text-red-500">{errors.password.message}</p>}
             </div>
             <Button type="submit" className="w-full">Login</Button>
           </form>
           <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4">
             Sign in with Google
           </Button>
         </div>
       );
     };

     export default LoginScreen;
     ```
   - Explanation: Uses React Hook Form with Zod for validation, shadcn/ui for UI, and Firebase for email/password and Google Sign-In.

3. **Create SignupScreen**:
   - In `apps/web/src/components`, create `SignupScreen.tsx`:
     ```typescript
     import { useForm } from 'react-hook-form';
     import { zodResolver } from '@hookform/resolvers/zod';
     import { signupSchema, SignupFormData } from '@flexcore/shared';
     import { Button, Input } from '@/components/ui';
     import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
     import { auth } from '../firebase';
     import { useState } from 'react';

     const SignupScreen = () => {
       const [error, setError] = useState<string | null>(null);
       const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
         resolver: zodResolver(signupSchema),
       });

       const onSubmit = async (data: SignupFormData) => {
         try {
           const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
           await updateProfile(userCredential.user, { displayName: data.displayName });
         } catch (err: any) {
           setError(err.message);
         }
       };

       const handleGoogleSignIn = async () => {
         try {
           const provider = new GoogleAuthProvider();
           await signInWithPopup(auth, provider);
         } catch (err: any) {
           setError(err.message);
         }
       };

       return (
         <div className="max-w-md mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Sign Up for FlexCore</h2>
           {error && <p className="text-red-500 mb-4">{error}</p>}
           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <div>
               <Input {...register('displayName')} placeholder="Name" />
               {errors.displayName && <p className="text-red-500">{errors.displayName.message}</p>}
             </div>
             <div>
               <Input {...register('email')} placeholder="Email" />
               {errors.email && <p className="text-red-500">{errors.email.message}</p>}
             </div>
             <div>
               <Input {...register('password')} type="password" placeholder="Password" />
               {errors.password && <p className="text-red-500">{errors.password.message}</p>}
             </div>
             <Button type="submit" className="w-full">Sign Up</Button>
           </form>
           <Button onClick={handleGoogleSignIn} variant="outline" className="w-full mt-4">
             Sign up with Google
           </Button>
         </div>
       );
     };

     export default SignupScreen;
     ```
   - Explanation: Similar to `LoginScreen`, but includes `displayName` and uses `createUserWithEmailAndPassword`.

4. **Update App Routing**:
   - Install React Router: `pnpm add react-router-dom`.
   - Update `apps/web/src/App.tsx`:
     ```typescript
     import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
     import { useContext } from 'react';
     import { AuthContext } from './context/AuthContext';
     import LoginScreen from './components/LoginScreen';
     import SignupScreen from './components/SignupScreen';

     const App = () => {
       const { user } = useContext(AuthContext);

       return (
         <BrowserRouter>
           <Routes>
             <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
             <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupScreen />} />
             <Route path="/" element={user ? <div>Home</div> : <Navigate to="/login" />} />
           </Routes>
         </BrowserRouter>
       );
     };

     export default App;
     ```
   - Explanation: Adds basic routing to redirect authenticated users to the home page and unauthenticated users to the login page.

**Deliverable**: Functional `LoginScreen` and `SignupScreen` with email/password and Google Sign-In, integrated with React Router.

---

### 3. Create ProfileScreen
**Objective**: Build a profile screen to display user information and allow logout.

1. **Create ProfileScreen**:
   - In `apps/web/src/components`, create `ProfileScreen.tsx`:
     ```typescript
     import { useContext } from 'react';
     import { AuthContext } from '../context/AuthContext';
     import { signOut } from 'firebase/auth';
     import { auth } from '../firebase';
     import { Button } from '@/components/ui';

     const ProfileScreen = () => {
       const { user } = useContext(AuthContext);

       const handleLogout = async () => {
         try {
           await signOut(auth);
         } catch (err: any) {
           console.error(err.message);
         }
       };

       if (!user) return <div>Loading...</div>;

       return (
         <div className="max-w-md mx-auto p-4">
           <h2 className="text-2xl font-bold mb-4">Profile</h2>
           <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
           <p><strong>Email:</strong> {user.email}</p>
           <Button onClick={handleLogout} className="mt-4">Logout</Button>
         </div>
       );
     };

     export default ProfileScreen;
     ```
   - Explanation: Displays user info from `AuthContext` and includes a logout button.

2. **Add Profile Route**:
   - Update `apps/web/src/App.tsx`:
     ```typescript
     import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
     import { useContext } from 'react';
     import { AuthContext } from './context/AuthContext';
     import LoginScreen from './components/LoginScreen';
     import SignupScreen from './components/SignupScreen';
     import ProfileScreen from './components/ProfileScreen';

     const App = () => {
       const { user } = useContext(AuthContext);

       return (
         <BrowserRouter>
           <Routes>
             <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
             <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupScreen />} />
             <Route path="/profile" element={user ? <ProfileScreen /> : <Navigate to="/login" />} />
             <Route path="/" element={user ? <div>Home</div> : <Navigate to="/login" />} />
           </Routes>
         </BrowserRouter>
       );
     };

     export default App;
     ```

**Deliverable**: `ProfileScreen` displaying user info and logout functionality, integrated with routing.

---

### 4. Test Authentication
**Objective**: Write unit and end-to-end tests to ensure authentication works reliably.

1. **Unit Tests for AuthContext**:
   - In `apps/web/src/context/__tests__`, create `AuthContext.test.tsx`:
     ```typescript
     import { render, screen } from '@testing-library/react';
     import { AuthContext, AuthProvider } from '../AuthContext';
     import { vi } from 'vitest';

     vi.mock('../firebase', () => ({
       auth: {},
     }));

     describe('AuthProvider', () => {
       it('provides user state', () => {
         const mockUser = { uid: '123', email: 'test@example.com' };
         vi.mocked(onAuthStateChanged).mockImplementation((auth, callback) => {
           callback(mockUser);
           return () => {};
         });

         render(
           <AuthProvider>
             <AuthContext.Consumer>
               {({ user }) => <div>{user?.email}</div>}
             </AuthContext.Consumer>
           </AuthProvider>,
         );

         expect(screen.getByText('test@example.com')).toBeInTheDocument();
       });
     });
     ```
   - Explanation: Mocks Firebase’s `onAuthStateChanged` to test `AuthContext` user state.

2. **Storybook Stories**:
   - In `apps/web/src/components`, create `LoginScreen.stories.tsx`:
     ```typescript
     import type { Meta, StoryObj } from '@storybook/react';
     import LoginScreen from './LoginScreen';

     const meta: Meta<typeof LoginScreen> = {
       component: LoginScreen,
       title: 'Components/LoginScreen',
     };

     export default meta;
     type Story = StoryObj<typeof LoginScreen>;

     export const Default: Story = {};
     ```
   - Repeat for `SignupScreen` and `ProfileScreen`.

3. **End-to-End Tests with Playwright**:
   - In `apps/web/tests`, create `auth.spec.ts`:
     ```typescript
     import { test, expect } from '@playwright/test';

     test('login with email and password', async ({ page }) => {
       await page.goto('/login');
       await page.fill('input[placeholder="Email"]', 'test@example.com');
       await page.fill('input[placeholder="Password"]', 'password123');
       await page.click('button:has-text("Login")');
       await expect(page).toHaveURL('/');
     });

     test('signup with email and password', async ({ page }) => {
       await page.goto('/signup');
       await page.fill('input[placeholder="Name"]', 'Test User');
       await page.fill('input[placeholder="Email"]', 'new@example.com');
       await page.fill('input[placeholder="Password"]', 'password123');
       await page.click('button:has-text("Sign Up")');
       await expect(page).toHaveURL('/');
     });

     test('google sign-in', async ({ page }) => {
       await page.goto('/login');
       await page.click('button:has-text("Sign in with Google")');
       await expect(page).toHaveURL('/');
     });
     ```
   - Explanation: Tests login, signup, and Google Sign-In flows. Note: Google Sign-In requires Firebase emulator or mocking for E2E tests.

4. **Run Tests**:
   ```bash
   cd apps/web
   pnpm test
   pnpm e2e
   pnpm storybook
   ```

**Deliverable**: Unit tests for `AuthContext`, Storybook stories for UI components, and Playwright E2E tests for authentication flows.

---

## Verification Steps
1. **Test Locally**:
   ```bash
   cd apps/web
   pnpm dev
   ```
   Open `http://localhost:5173/login` and test login/signup with:
   - Email: `test@example.com`, Password: `password123`
   - Google Sign-In (use Firebase emulator or real Google account).
2. **Test Firebase Emulator**:
   ```bash
   firebase emulators:start
   ```
   Verify Authentication works in the emulator (check Firebase Console for user creation).
3. **Test Storybook**:
   ```bash
   pnpm storybook
   ```
   Open `http://localhost:6006` to verify `LoginScreen`, `SignupScreen`, and `ProfileScreen` stories.
4. **Run Tests**:
   ```bash
   pnpm test
   pnpm e2e
   ```
   Ensure all unit and E2E tests pass.
5. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: implement authentication and user management"
   git push origin main
   ```
   Verify CI pipeline runs successfully in GitHub Actions.

---

## Deliverables
- Firebase Authentication initialized with `firebase.ts` and `AuthContext`.
- `LoginScreen` and `SignupScreen` with email/password and Google Sign-In, using React Hook Form, Zod, and shadcn/ui.
- `ProfileScreen` displaying user info and logout functionality.
- React Router setup for authentication routes.
- Unit tests for `AuthContext`, Storybook stories for UI components, and Playwright E2E tests for authentication flows.

---

## Notes for Bootcamp
- **Instructor Appeal**: This milestone showcases:
  - Modern React with hooks (`useContext`, `useForm`) and TypeScript.
  - Secure authentication with Firebase, including Google Sign-In.
  - Form validation with Zod and React Hook Form, integrated with shadcn/ui for a polished UI.
  - Comprehensive testing (unit, component, E2E) to demonstrate quality.
- **Tips for Execution**:
  - Test with the Firebase emulator first to avoid creating real users during development.
  - If Google Sign-In fails, ensure the Google provider is enabled in the Firebase Console and your domain is added to OAuth redirect URIs.
  - Use Storybook to preview UI components and ensure they meet WCAG 2.1 AA (e.g., keyboard navigation).
  - Document any challenges in `docs/notes.md` to show problem-solving skills.
- **Submission Prep**:
  - Include a `README.md` in `apps/web` with instructions to run the app (`pnpm dev`) and emulator (`firebase emulators:start`).
  - Record a short video demo of login/signup for your instructor.
  - Share the GitHub repo with the [TDD](xaiArtifact://fcf7cde1-ea84-48d8-aa78-5edf9ff52cd6/9bc96a1a-fb47-41ae-9ee6-53f3997d325a) and roadmap in `docs`.

---

## Next Steps
- Complete the tasks above and verify locally with `pnpm dev` and `firebase emulators:start`.
- Run tests (`pnpm test`, `pnpm e2e`) to ensure functionality.
- Push to GitHub and check the CI pipeline.
- Share any issues or questions for debugging (e.g., Firebase errors, test failures).
- Once Milestone 2 is complete, we can move to Milestone 3 (Exercise Search and Selection) or adjust based on your feedback.