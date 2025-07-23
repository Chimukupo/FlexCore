# FlexCore System Design Document

## 1. Overview
**FlexCore** is a Minimum Viable Product (MVP) fitness web app designed to allow users to search and visually select exercises, track workout time, and plan weekly routines. The app prioritizes simplicity, usability, and offline support for fitness enthusiasts.

### 1.1 Objectives
- Enable users to search for exercises using the ExerciseDB API.
- Display exercises with images/GIFs for visual selection.
- Track workout duration and log sessions.
- Support weekly routine planning with a calendar view.
- Ensure basic offline functionality and scalability.

### 1.2 Tech Stack
- **Frontend**: React v19 (functional components, hooks), Tailwind CSS v4.
- **Backend**: Firebase (Firestore for database, Authentication for user management, Hosting for deployment).
- **External API**: ExerciseDB via RapidAPI for exercise data (name, muscle group, equipment, GIFs).
- **Local Storage**: `localStorage` or IndexedDB for offline caching.
- **Deployment**: Firebase Hosting.

---

## 2. Functional Requirements
1. **Exercise Search**:
   - Search exercises by name, muscle group, or equipment via ExerciseDB API.
   - Display results with images/GIFs in a responsive grid.
   - Allow users to add exercises to a workout or routine.
2. **Visual Exercise Selection**:
   - Show exercise details (name, muscle group, equipment, GIF) on selection.
   - Provide a button to add to a workout or routine.
3. **Time Tracking**:
   - Client-side timer for tracking workout or exercise duration.
   - Log sessions in Firestore and cache locally for offline use.
4. **Weekly Routine**:
   - Create and view a 7-day routine in a calendar-like interface.
   - Assign exercises to specific days and mark workouts as completed.
   - Store routines in Firestore, linked to user ID.
5. **User Management**:
   - Support email/password and Google Sign-In via Firebase Authentication.
   - Store user-specific data (routines, workout history) in Firestore.
6. **Offline Support**:
   - Cache ExerciseDB API responses for offline exercise browsing.
   - Store routines and workout logs locally, syncing with Firestore when online.

---

## 3. Non-Functional Requirements
- **Performance**: Fast exercise search and GIF loading (use caching and lazy-loading).
- **Scalability**: Support thousands of users with Firebase’s managed infrastructure.
- **Usability**: Intuitive, mobile-responsive UI with Tailwind CSS.
- **Reliability**: Ensure accurate data syncing between local storage and Firestore.
- **Offline Support**: View cached exercises, routines, and track time offline.

---

## 4. System Architecture

### 4.1 High-Level Diagram
```
[React Web App] <-> [Firebase Hosting] <-> [Firebase APIs]
   |                            |               |
[Local Storage]          [Auth Service]   [Firestore] <-> [ExerciseDB API]
```
- **React Web App**: Handles UI, local storage, and API requests.
- **Firebase Hosting**: Serves the single-page app.
- **Firebase APIs**: Authentication and Firestore for user data and routines.
- **ExerciseDB API**: Provides exercise data (name, muscle group, equipment, GIFs).

### 4.2 Frontend (React v19 + Tailwind CSS v4)
- **Components**:
  - **SearchScreen**: Input field, filters (muscle group, equipment), and exercise grid (`grid grid-cols-1 md:grid-cols-3 gap-4`).
  - **ExerciseCard**: Displays exercise name, muscle group, equipment, and GIF (`shadow-md rounded-lg p-4`).
  - **WorkoutScreen**: Lists exercises, includes a timer (`useState`, `setInterval`), and “Complete” button.
  - **RoutineScreen**: 7-day calendar view (`grid grid-cols-7 gap-2`) for routine planning.
  - **ProfileScreen**: Shows user info and workout history.
- **Styling**: Tailwind CSS v4 for responsive, utility-first design.
- **Offline Support**: Cache ExerciseDB responses in `localStorage` or IndexedDB.

### 4.3 Backend (Firebase)
- **Authentication**:
  - Firebase Authentication for email/password and Google Sign-In.
  - Configuration:
    ```javascript
    import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';

    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    export const auth = getAuth(app);
    export const db = getFirestore(app);
    ```
- **Firestore Database**:
  - **Collections**:
    - `users`: `{ uid, email, routines, workout_history }`
    - `routines`: `{ user_id, day, exercises: [{ id, name, target, gifUrl }], completed }`
    - `workouts`: `{ user_id, date, exercises: [{ id, name, duration }], total_duration }`
  - Example: Save a workout:
    ```javascript
    import { db } from '../firebase';
    import { addDoc, collection } from 'firebase/firestore';

    const addToWorkout = async (exercise, userId) => {
      await addDoc(collection(db, 'workouts'), {
        user_id: userId,
        date: new Date(),
        exercises: [{ id: exercise.id, name: exercise.name, duration: 0 }],
        total_duration: 0,
      });
    };
    ```
- **Security Rules**:
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

### 4.4 ExerciseDB API (RapidAPI)
- **Endpoints**:
  - `GET /exercises?name={query}`: Search by exercise name.
  - `GET /exercises/target/{muscle}`: Filter by muscle group (e.g., `biceps`).
  - `GET /exercises/equipment/{equipment}`: Filter by equipment (e.g., `dumbbell`).
- **Integration**:
  - Use `axios` for requests:
    ```javascript
    const options = {
      method: 'GET',
      url: 'https://exercisedb.p.rapidapi.com/exercises',
      headers: {
        'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    };
    ```
  - Cache responses in `localStorage` to support offline mode and reduce API calls.
  - Store minimal data (`id`, `name`, `target`, `gifUrl`) in Firestore for routines.
- **Rate Limits**: Free tier (500 requests/month). Cache responses to minimize calls.

### 4.5 Deployment (Firebase Hosting)
- **Setup**:
  - Install Firebase CLI: `npm install -g firebase-tools`.
  - Initialize: `firebase init hosting`.
  - Build React app: `npm run build`.
  - Deploy: `firebase deploy --only hosting`.
- **Configuration**:
  - Update `firebase.json`:
    ```json
    {
      "hosting": {
        "public": "build",
        "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
        "rewrites": [
          {
            "source": "**",
            "destination": "/index.html"
          }
        ]
      }
    }
    ```

---

## 5. User Flow
1. User logs in via Firebase Authentication (email or Google).
2. On **SearchScreen**, user searches for “bicep curl” or filters by “biceps”.
3. App queries ExerciseDB API, displays exercise cards with GIFs (cached for offline).
4. User adds “Dumbbell Bicep Curl” to a workout, saved to Firestore.
5. On **RoutineScreen**, user assigns the workout to Wednesday in a Tailwind-styled calendar.
6. On **WorkoutScreen**, user starts the timer, completes exercises, and marks the workout as done.
7. Workout duration is saved to `localStorage` (offline) and synced to Firestore when online.

---

## 6. Development Plan
1. **Phase 1: Setup and Core Features (4-6 weeks)**:
   - Initialize Firebase (Authentication, Firestore, Hosting).
   - Set up React v19 with Tailwind CSS v4 (use Vite or Create React App).
   - Integrate ExerciseDB API with `axios`, test search, and cache responses.
   - Build **SearchScreen** and **ExerciseCard** components.
   - Implement Firebase Authentication (email, Google).
2. **Phase 2: Workout and Routine Features (2-3 weeks)**:
   - Build **WorkoutScreen** with timer and Firestore logging.
   - Create **RoutineScreen** with 7-day calendar view.
   - Implement offline support with `localStorage`.
3. **Phase 3: Testing and Deployment (2 weeks)**:
   - Test ExerciseDB integration (rate limits, errors).
   - Verify Firestore security rules and offline syncing.
   - Deploy to Firebase Hosting and test responsiveness.
   - Refine UI with Tailwind (e.g., animations, mobile layout).

---

## 7. Challenges and Solutions
- **ExerciseDB Rate Limits**:
  - Cache responses in `localStorage` and limit searches to user actions.
  - Display cached data when offline or rate-limited.
- **GIF Loading Performance**:
  - Use low-res thumbnails from ExerciseDB, lazy-load GIFs with `IntersectionObserver`.
- **Firestore Costs**:
  - Store minimal exercise data in Firestore, rely on ExerciseDB for details.
  - Use batched writes for workout logs.
- **Tailwind CSS Complexity**:
  - Use Tailwind’s documentation and pre-built components (e.g., Flowbite) for rapid development.

---

## 8. Future Enhancements
- Advanced search filters (difficulty, duration).
- Video support for exercise demos.
- Progress tracking (weights, reps, sets).
- Social features (share routines, challenges).
- Wearable integrations (e.g., Apple Watch).