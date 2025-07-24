import { useQuery } from '@tanstack/react-query';
import { fetchExercises } from '../api/exerciseApi';
import type { Exercise } from '@flexcore/shared';

export const useExercises = (query: string = '', target?: string, equipment?: string) => {
  return useQuery<Exercise[], Error>({
    queryKey: ['exercises', query, target, equipment],
    queryFn: () => fetchExercises(query, target, equipment),
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => {
      const cached = localStorage.getItem('exercises');
      if (!cached) return undefined;
      try {
        return JSON.parse(cached) as Exercise[];
      } catch {
        // Clear invalid JSON from localStorage
        localStorage.removeItem('exercises');
        return undefined;
      }
    },
  });
}; 