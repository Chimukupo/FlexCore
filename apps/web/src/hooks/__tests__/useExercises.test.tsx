import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useExercises } from '../useExercises';
import * as exerciseApi from '../../api/exerciseApi';
import type { Exercise } from '@flexcore/shared';
import type { ReactNode } from 'react';

// Mock the exercise API
vi.mock('../../api/exerciseApi');
const mockedExerciseApi = vi.mocked(exerciseApi);

describe('useExercises', () => {
  const mockExercises: Exercise[] = [
    {
      id: '0001',
      name: '3/4 sit-up',
      bodyPart: 'waist',
      equipment: 'body weight',
      gifUrl: 'https://v2.exercisedb.io/image/ByNV8nfLN3PKYL',
      target: 'abs',
      secondaryMuscles: ['hip flexors', 'obliques'],
      instructions: [
        'Lie flat on your back with your knees bent and feet flat on the ground.',
        'Place your hands behind your head with your elbows pointing outward.',
        'Engaging your core, lift your upper body towards your knees.',
        'Stop when your torso is at about a 45-degree angle.',
        'Lower your upper body back down with control.',
        'Repeat for the desired number of repetitions.'
      ],
    },
    {
      id: '0002',
      name: 'bicep curl',
      bodyPart: 'upper arms',
      equipment: 'dumbbell',
      gifUrl: 'https://v2.exercisedb.io/image/VyOgGzfLdVckqZ',
      target: 'biceps',
      secondaryMuscles: ['forearms'],
      instructions: [
        'Stand with feet shoulder-width apart, holding dumbbells at your sides.',
        'Keep your elbows close to your torso.',
        'Curl the weights up towards your shoulders.',
        'Squeeze your biceps at the top.',
        'Lower the weights back down with control.'
      ],
    },
  ];

  let queryClient: QueryClient;

  const createWrapper = () => {
    const Wrapper = ({ children }: { children: ReactNode }) => {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
    return Wrapper;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
    localStorage.clear();
  });

  it('should fetch exercises successfully', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(result.current.error).toBeNull();
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('', undefined, undefined);
  });

  it('should fetch exercises with query parameter', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises('bicep curl'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('bicep curl', undefined, undefined);
  });

  it('should fetch exercises with target muscle parameter', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises('', 'biceps'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('', 'biceps', undefined);
  });

  it('should fetch exercises with equipment parameter', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises('', '', 'dumbbell'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('', '', 'dumbbell');
  });

  it('should fetch exercises with all parameters', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises('bicep curl', 'biceps', 'dumbbell'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockExercises);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('bicep curl', 'biceps', 'dumbbell');
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockedExerciseApi.fetchExercises.mockRejectedValue(error);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toEqual(error);
  });

  it('should show loading state initially', () => {
    mockedExerciseApi.fetchExercises.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should use cached data as initial data when available', () => {
    const cachedExercises = mockExercises.slice(0, 1);
    localStorage.setItem('exercises', JSON.stringify(cachedExercises));
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    // Should immediately have cached data
    expect(result.current.data).toEqual(cachedExercises);
  });

  it('should not use cached data when localStorage is empty', () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    // Should not have initial data
    expect(result.current.data).toBeUndefined();
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('exercises', 'invalid-json');
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    // Should not crash and should not have initial data
    expect(result.current.data).toBeUndefined();
    // Should clean up invalid JSON from localStorage
    expect(localStorage.getItem('exercises')).toBeNull();
  });

  it('should use correct query key for caching', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result: result1 } = renderHook(() => useExercises('bicep', 'biceps', 'dumbbell'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
    });

    // Second hook with same parameters should use cached data
    const { result: result2 } = renderHook(() => useExercises('bicep', 'biceps', 'dumbbell'), {
      wrapper: createWrapper(),
    });

    expect(result2.current.data).toEqual(mockExercises);
    // Should only have been called once due to caching
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledTimes(1);
  });

  it('should create different queries for different parameters', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result: result1 } = renderHook(() => useExercises('bicep'), {
      wrapper: createWrapper(),
    });

    const { result: result2 } = renderHook(() => useExercises('tricep'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result1.current.isLoading).toBe(false);
      expect(result2.current.isLoading).toBe(false);
    });

    // Should have been called twice with different parameters
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledTimes(2);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('bicep', undefined, undefined);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledWith('tricep', undefined, undefined);
  });

  it('should respect staleTime configuration', async () => {
    mockedExerciseApi.fetchExercises.mockResolvedValue(mockExercises);

    const { result } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Query again immediately - should not refetch due to staleTime
    const { result: result2 } = renderHook(() => useExercises(), {
      wrapper: createWrapper(),
    });

    expect(result2.current.data).toEqual(mockExercises);
    expect(mockedExerciseApi.fetchExercises).toHaveBeenCalledTimes(1);
  });
}); 