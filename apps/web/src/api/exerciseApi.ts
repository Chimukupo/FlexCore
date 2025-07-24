import axios from 'axios';
import { env } from '../env';
import type { Exercise } from '@flexcore/shared';

export const fetchExercises = async (query: string = '', target?: string, equipment?: string): Promise<Exercise[]> => {
  try {
    let url = 'https://exercisedb.p.rapidapi.com/exercises';
    const params: any = { limit: 10 };
    
    // Use different endpoints based on filters (prioritize query > target > equipment)
    if (query) {
      url = `https://exercisedb.p.rapidapi.com/exercises/name/${query}`;
    } else if (target) {
      url = `https://exercisedb.p.rapidapi.com/exercises/target/${target}`;
    } else if (equipment) {
      url = `https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`;
    }

    const response = await axios.get(url, {
      headers: {
        'X-RapidAPI-Key': env.VITE_RAPIDAPI_KEY,
        'X-RapidAPI-Host': env.VITE_RAPIDAPI_HOST,
      },
      params,
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