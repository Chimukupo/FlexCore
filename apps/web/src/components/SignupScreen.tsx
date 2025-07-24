import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupScreenProps {
  onSwitchToLogin: () => void;
}

export const SignupScreen = ({ onSwitchToLogin }: SignupScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const createUserProfile = async (user: any, displayName?: string) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName || user.displayName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });
      await createUserProfile(userCredential.user, data.name);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserProfile(result.user);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'An error occurred during Google sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              sign in to your existing account
            </button>
          </p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <FormMessage>{error}</FormMessage>
            </div>
          )}

          <FormItem>
            <FormLabel htmlFor="name">Full name</FormLabel>
            <Input
              {...register('name')}
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              disabled={isLoading}
            />
            {errors.name && <FormMessage>{errors.name.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="email">Email address</FormLabel>
            <Input
              {...register('email')}
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <FormMessage>{errors.email.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Input
              {...register('password')}
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
          </FormItem>

          <FormItem>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <Input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {errors.confirmPassword && <FormMessage>{errors.confirmPassword.message}</FormMessage>}
          </FormItem>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up with Google'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}; 