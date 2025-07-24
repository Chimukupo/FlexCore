import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {
  onSwitchToSignup: () => void;
}

export const LoginScreen = ({ onSwitchToSignup }: LoginScreenProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
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
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <FormMessage>{errors.password.message}</FormMessage>}
          </FormItem>

          <div className="space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
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
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}; 