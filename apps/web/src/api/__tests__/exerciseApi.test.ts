import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { fetchExercises } from '../exerciseApi';
import type { Exercise } from '@flexcore/shared';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Create proper mock functions
mockedAxios.get = vi.fn();

// Mock environment
vi.mock('../../env', () => ({
  env: {
    VITE_RAPIDAPI_KEY: 'test-api-key',
    VITE_RAPIDAPI_HOST: 'exercisedb.p.rapidapi.com',
  },
}));

describe('exerciseApi', () => {
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

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('fetchExercises', () => {
    it('should fetch exercises from default endpoint when no filters provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises();

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises',
        {
          headers: {
            'X-RapidAPI-Key': 'test-api-key',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
          params: { limit: 10 },
        }
      );
      expect(result).toEqual(mockExercises);
    });

    it('should fetch exercises by name when query provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises('bicep curl');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises/name/bicep curl',
        {
          headers: {
            'X-RapidAPI-Key': 'test-api-key',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
          params: { limit: 10 },
        }
      );
      expect(result).toEqual(mockExercises);
    });

    it('should fetch exercises by target muscle when target provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises('', 'biceps');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises/target/biceps',
        {
          headers: {
            'X-RapidAPI-Key': 'test-api-key',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
          params: { limit: 10 },
        }
      );
      expect(result).toEqual(mockExercises);
    });

    it('should fetch exercises by equipment when equipment provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises('', '', 'dumbbell');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises/equipment/dumbbell',
        {
          headers: {
            'X-RapidAPI-Key': 'test-api-key',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
          params: { limit: 10 },
        }
      );
      expect(result).toEqual(mockExercises);
    });

    it('should prioritize target over equipment when both provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises('', 'biceps', 'dumbbell');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises/target/biceps',
        expect.any(Object)
      );
      expect(result).toEqual(mockExercises);
    });

    it('should prioritize query over target and equipment when all provided', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      const result = await fetchExercises('bicep curl', 'biceps', 'dumbbell');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://exercisedb.p.rapidapi.com/exercises/name/bicep curl',
        expect.any(Object)
      );
      expect(result).toEqual(mockExercises);
    });

    it('should cache exercises in localStorage on successful fetch', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockExercises });

      await fetchExercises();

      expect(localStorage.getItem('exercises')).toEqual(JSON.stringify(mockExercises));
    });

    it('should return cached exercises when API call fails', async () => {
      const cachedExercises = mockExercises.slice(0, 1);
      localStorage.setItem('exercises', JSON.stringify(cachedExercises));
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      const result = await fetchExercises();

      expect(result).toEqual(cachedExercises);
    });

    it('should throw error when API fails and no cached data exists', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(fetchExercises()).rejects.toThrow('API Error');
    });

    it('should handle empty response from API', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await fetchExercises();

      expect(result).toEqual([]);
      expect(localStorage.getItem('exercises')).toEqual('[]');
    });

    it('should handle network timeout errors', async () => {
      const cachedExercises = mockExercises.slice(0, 1);
      localStorage.setItem('exercises', JSON.stringify(cachedExercises));
      mockedAxios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      const result = await fetchExercises();

      expect(result).toEqual(cachedExercises);
    });

    it('should handle rate limit errors', async () => {
      const cachedExercises = mockExercises;
      localStorage.setItem('exercises', JSON.stringify(cachedExercises));
      const rateLimitError = new Error('Request failed with status code 429');
      mockedAxios.get.mockRejectedValue(rateLimitError);

      const result = await fetchExercises();

      expect(result).toEqual(cachedExercises);
    });
  });
}); 