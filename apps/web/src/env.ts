import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

// Debug: Log what environment variables we're seeing
console.log('🔍 Debug: Environment variables from import.meta.env:', import.meta.env);

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
    VITE_RAPIDAPI_HOST: z.string(),
  },
  runtimeEnv: import.meta.env,
  onValidationError: (error) => {
    console.error('🚨 T3 Env validation error:', error);
    console.error('🔍 Available env vars:', Object.keys(import.meta.env));
    console.error('🔍 Expected vars:', [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN', 
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_MEASUREMENT_ID',
      'VITE_RAPIDAPI_KEY',
      'VITE_RAPIDAPI_HOST'
    ]);
    throw error;
  },
});