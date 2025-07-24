import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login screen by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });

  test('should switch to signup screen', async ({ page }) => {
    await page.getByRole('button', { name: 'create a new account' }).click();
    
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByPlaceholder('Confirm your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('should switch back to login from signup', async ({ page }) => {
    await page.getByRole('button', { name: 'create a new account' }).click();
    await page.getByRole('button', { name: 'sign in to your existing account' }).click();
    
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('should validate login form fields', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check for validation messages
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should validate signup form fields', async ({ page }) => {
    await page.getByRole('button', { name: 'create a new account' }).click();
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Create account' }).click();
    
    // Check for validation messages
    await expect(page.getByText('Name must be at least 2 characters')).toBeVisible();
    await expect(page.getByText('Please enter a valid email address')).toBeVisible();
    await expect(page.getByText('Password must be at least 6 characters')).toBeVisible();
  });

  test('should validate password confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'create a new account' }).click();
    
    await page.getByPlaceholder('Enter your full name').fill('Test User');
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your password').fill('password123');
    await page.getByPlaceholder('Confirm your password').fill('differentpassword');
    
    await page.getByRole('button', { name: 'Create account' }).click();
    
    await expect(page.getByText("Passwords don't match")).toBeVisible();
  });

  test('should show loading state during form submission', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your password').fill('password123');
    
    // Mock network delay to see loading state
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Should show loading text
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('invalid@example.com');
    await page.getByPlaceholder('Enter your password').fill('wrongpassword');
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Wait for error message to appear
    await expect(page.getByText(/An error occurred during login|Firebase:/)).toBeVisible();
  });

  test('should handle Google sign-in button click', async ({ page }) => {
    // Note: In a real E2E test, you'd need to mock the Google OAuth flow
    // For now, we just test that the button is clickable and triggers some action
    await page.getByRole('button', { name: 'Sign in with Google' }).click();
    
    // Should show loading state
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
  });

  test('should disable form elements during loading', async ({ page }) => {
    await page.getByPlaceholder('Enter your email').fill('test@example.com');
    await page.getByPlaceholder('Enter your password').fill('password123');
    
    // Mock network delay
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Form elements should be disabled during loading
    await expect(page.getByPlaceholder('Enter your email')).toBeDisabled();
    await expect(page.getByPlaceholder('Enter your password')).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeDisabled();
  });

  test('should have proper form accessibility', async ({ page }) => {
    // Check for proper labels and form structure
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    
    // Check signup form accessibility
    await page.getByRole('button', { name: 'create a new account' }).click();
    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
  });
}); 