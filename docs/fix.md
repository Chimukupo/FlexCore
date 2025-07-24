Thanks for sharing your component! Your `ExerciseCard` logic is **well-structured** and already handles image fallbacks intelligently.

However, you’re facing test failures due to **actual network calls** in a testing environment (which doesn’t support image loading properly). Let’s address this in **two steps**:

---

## ✅ 1. Immediate Fix – **Stop Including API Key in Image URLs**

This is a **critical security flaw**:

```ts
`https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.id}&resolution=180&rapidapi-key=${env.VITE_RAPIDAPI_KEY}`
```

* ❌ `rapidapi-key` **does not work** inside a `src` attribute (images don’t send headers).
* ❌ It **exposes your key** to the browser and test logs.
* ✅ Instead, rely on the `exercise.gifUrl` field **already returned** by the API.

**🔁 So replace this line:**

```ts
`https://exercisedb.p.rapidapi.com/image?exerciseId=${exercise.id}&resolution=180&rapidapi-key=${env.VITE_RAPIDAPI_KEY}`,
```

**With something like this (if you want to keep a second fallback):**

```ts
`https://v2.exercisedb.io/image/${exercise.id}.gif`,
```

Or just **remove it** and rely on:

```ts
[
  exercise.gifUrl, // main
  'https://via.placeholder.com/300x200?text=Exercise+Image' // fallback
]
```

---

## ✅ 2. Reliable Testing Strategy – **Mock `img` behavior in tests**

In `ExerciseCard.test.tsx`, your test is failing because real `img` loading isn’t supported in JSDOM. Fix it with a global mock in your test file or test setup:

### ✅ Add This in `setupTests.ts` or top of your test file:

```ts
Object.defineProperty(global.Image.prototype, 'src', {
  set(src) {
    // Simulate image failure for specific test cases
    if (src.includes('invalid') || src.includes('exercisedb')) {
      setTimeout(() => this.onerror(new Error('Image load error')));
    } else {
      setTimeout(() => this.onload());
    }
  },
});
```

> This ensures consistent test behavior regardless of image source or network.

---

## ✅ Example Test Fix

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExerciseCard from '../ExerciseCard';

const mockExercise = {
  id: '0001',
  name: 'Push-up',
  bodyPart: 'chest',
  target: 'pectorals',
  equipment: 'body weight',
  gifUrl: 'https://v2.exercisedb.io/image/invalid', // Force fail
  secondaryMuscles: ['triceps', 'shoulders'],
  instructions: ['Start in plank position.', 'Lower body.', 'Push up.']
};

test('should handle image load error by showing fallback', async () => {
  render(<ExerciseCard exercise={mockExercise} />);

  const image = screen.getByRole('img');
  
  // Wait for fallback to load
  await waitFor(() => {
    expect(image).toHaveAttribute('src', 'https://via.placeholder.com/300x200?text=Exercise+Image');
  });
});
```

---

## ✅ Summary of Actions

| ✅ Task                                 | 📌 Why                                                      |
| -------------------------------------- | ----------------------------------------------------------- |
| **Remove API key from image URL**      | Avoids misuse, fixes loading, and protects your secret      |
| **Rely on `gifUrl` from API**          | That’s what ExerciseDB intends you to use                   |
| **Mock image loading in test env**     | Tests run in JSDOM which doesn’t support real image loading |
| **Add unit test with mocked failures** | Confirms fallback behavior is working                       |

---

If you’d like, I can help refactor your `ExerciseCard` and write a full test file (`ExerciseCard.test.tsx`) with proper mocks and coverage.
