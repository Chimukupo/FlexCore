import { Page } from '@playwright/test';

export async function loginTestUser(page: Page) {
  // Go to the app
  await page.goto('/');
  
  // Wait for login form to be visible
  await page.waitForSelector('input[placeholder="Enter your email"]', { timeout: 10000 });
  
  // Fill in test credentials (these should be test-specific)
  await page.fill('input[placeholder="Enter your email"]', 'test@example.com');
  await page.fill('input[placeholder="Enter your password"]', 'testpassword123');
  
  // Click sign in
  await page.click('button:has-text("Sign in")');
  
  // Wait for navigation to search screen (authenticated state)
  await page.waitForSelector('input[placeholder="Search by exercise name"]', { timeout: 15000 });
}

export async function mockAuthenticatedState(page: Page) {
  // Set a global flag that our AuthContext can detect
  await page.addInitScript(() => {
    (window as any).__PLAYWRIGHT_TEST_MODE__ = true;
  });
  
  // Navigate to the app
  await page.goto('/');
  
  // Wait for search interface to be visible (should appear due to mocked auth)
  await page.waitForSelector('input[placeholder="Search by exercise name"]', { timeout: 10000 });
} 