import { test, expect } from '@playwright/test';
import { mockAuthenticatedState } from './helpers/auth';

test.describe('Exercise Search', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state to bypass login
    await mockAuthenticatedState(page);
  });

  test('should display search interface', async ({ page }) => {
    // Check that all search elements are present
    await expect(page.getByPlaceholder('Search by exercise name')).toBeVisible();
    await expect(page.getByText('Select target muscle')).toBeVisible();
    await expect(page.getByText('Select equipment')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear Filters' })).toBeVisible();
  });

  test('should search exercises by name', async ({ page }) => {
    // Fill in search query
    await page.fill('input[placeholder="Search by exercise name"]', 'sit-up');
    
    // Click search button
    await page.click('button:has-text("Search")');
    
    // Wait for results to load
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Check that results are displayed
    await expect(page.getByText(/Found \d+ exercise/)).toBeVisible();
    
    // Check that at least one exercise card is visible
    const exerciseCards = page.locator('[data-testid="exercise-card"]');
    await expect(exerciseCards.first()).toBeVisible();
    
    // Check that the results contain "sit-up" exercises
    await expect(page.locator('text=sit-up').first()).toBeVisible();
  });

  test('should filter exercises by target muscle', async ({ page }) => {
    // Click on target muscle dropdown
    await page.getByText('Select target muscle').click();
    
    // Select a target muscle (be more specific to avoid strict mode violation)
    await page.getByRole('option', { name: 'biceps' }).click();
    
    // Click search
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Check that results are for biceps
    await expect(page.locator('text=biceps').first()).toBeVisible();
  });

  test('should filter exercises by equipment', async ({ page }) => {
    // Click on equipment dropdown
    await page.getByText('Select equipment').click();
    
    // Select equipment (be more specific)
    await page.getByRole('option', { name: 'dumbbell' }).click();
    
    // Click search
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Check that results show dumbbell exercises
    await expect(page.locator('text=dumbbell').first()).toBeVisible();
  });

  test('should clear filters', async ({ page }) => {
    // Fill in some search criteria
    await page.fill('input[placeholder="Search by exercise name"]', 'bicep');
    await page.getByText('Select target muscle').click();
    await page.getByRole('option', { name: 'biceps' }).click();
    
    // Click clear filters
    await page.click('button:has-text("Clear Filters")');
    
    // Check that inputs are cleared
    await expect(page.getByPlaceholder('Search by exercise name')).toHaveValue('');
    await expect(page.getByText('Select target muscle')).toBeVisible();
    await expect(page.getByText('Select equipment')).toBeVisible();
  });

  test('should show loading state during search', async ({ page }) => {
    // Clear all storage to ensure clean state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Use a more specific route pattern and longer delay
    await page.route('**/exercisedb.p.rapidapi.com/exercises/**', async (route) => {
      // Longer delay to ensure loading state is visible
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Fill in search query
    await page.fill('input[placeholder="Search by exercise name"]', 'bicep');
    
    // Click search and immediately check for loading state
    const searchPromise = page.click('button:has-text("Search")');
    
    // Check that loading state appears quickly after clicking
    await expect(page.getByText('Loading exercises...')).toBeVisible({ timeout: 1000 });
    
    // Wait for search to complete
    await searchPromise;
    
    // Wait for loading to finish
    await expect(page.getByText('Loading exercises...')).not.toBeVisible({ timeout: 15000 });
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Clear all storage including React Query cache
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear any IndexedDB that React Query might use
      if ('indexedDB' in window) {
        indexedDB.deleteDatabase('react-query-cache');
      }
    });
    
    // Reload page to ensure completely clean state
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Mock API error for the specific exercises endpoint pattern
    await page.route('**/exercisedb.p.rapidapi.com/exercises/name/**', async (route) => {
      console.log('Exercises API intercepted:', route.request().url());
      await route.abort('failed');
    });
    
    // Also handle other possible exercise endpoints
    await page.route('**/exercisedb.p.rapidapi.com/exercises/target/**', async (route) => {
      console.log('Target API intercepted:', route.request().url());
      await route.abort('failed');
    });
    
    await page.route('**/exercisedb.p.rapidapi.com/exercises/equipment/**', async (route) => {
      console.log('Equipment API intercepted:', route.request().url());
      await route.abort('failed');
    });
    
    // Use a completely unique search term to force a new API call
    await page.fill('input[placeholder="Search by exercise name"]', 'xyztestexercise999');
    
    // Click search
    await page.click('button:has-text("Search")');
    
    // Wait for error processing
    await page.waitForTimeout(3000);
    
    // Check that error message is shown
    await expect(page.getByText(/Error:/)).toBeVisible({ timeout: 10000 });
  });

  test('should display exercise details in cards', async ({ page }) => {
    // Search for exercises
    await page.fill('input[placeholder="Search by exercise name"]', 'sit-up');
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    const firstCard = page.locator('[data-testid="exercise-card"]').first();
    
    // Check that exercise card contains expected elements
    await expect(firstCard.locator('img')).toBeVisible();
    await expect(firstCard.getByText('Body Part:')).toBeVisible();
    await expect(firstCard.getByText('Target:')).toBeVisible();
    await expect(firstCard.getByText('Equipment:')).toBeVisible();
  });

  test('should show no results message when search returns empty', async ({ page }) => {
    // Mock empty response with correct route pattern
    await page.route('**/exercisedb.p.rapidapi.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    
    // Search for non-existent exercise
    await page.fill('input[placeholder="Search by exercise name"]', 'nonexistentexercise');
    await page.click('button:has-text("Search")');
    
    // Check that no results message is shown
    await expect(page.getByText('No exercises found. Try adjusting your search criteria.')).toBeVisible({ timeout: 10000 });
  });

  test('should handle offline mode with cached data', async ({ page }) => {
    // First, search for exercises to cache them
    await page.fill('input[placeholder="Search by exercise name"]', 'sit-up');
    await page.click('button:has-text("Search")');
    
    // Wait for results to load and be cached
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Go offline by intercepting network requests
    await page.route('**/exercisedb.p.rapidapi.com/**', async (route) => {
      await route.abort('failed');
    });
    
    // Search again (this should trigger an error and show cached results)
    await page.fill('input[placeholder="Search by exercise name"]', 'bicep');
    await page.click('button:has-text("Search")');
    
    // Should show error message and cached results message
    await expect(page.getByText(/Error:/)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Showing cached results')).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that search form is still usable
    await expect(page.getByPlaceholder('Search by exercise name')).toBeVisible();
    await expect(page.getByText('Select target muscle')).toBeVisible();
    await expect(page.getByText('Select equipment')).toBeVisible();
    
    // Search for exercises
    await page.fill('input[placeholder="Search by exercise name"]', 'push-up');
    await page.click('button:has-text("Search")');
    
    // Wait for results and check they display properly on mobile
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    const exerciseCards = page.locator('[data-testid="exercise-card"]');
    await expect(exerciseCards.first()).toBeVisible();
  });

  test('should navigate and maintain state', async ({ page }) => {
    // Search for exercises
    await page.fill('input[placeholder="Search by exercise name"]', 'curl');
    await page.click('button:has-text("Search")');
    
    // Wait for results
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Check that search term is still in input
    await expect(page.getByPlaceholder('Search by exercise name')).toHaveValue('curl');
    
    // Check that results are still displayed
    await expect(page.getByText(/Found \d+ exercise/)).toBeVisible();
  });

  test('should handle multiple quick searches', async ({ page }) => {
    // Perform multiple quick searches
    await page.fill('input[placeholder="Search by exercise name"]', 'bicep');
    await page.click('button:has-text("Search")');
    
    await page.fill('input[placeholder="Search by exercise name"]', 'tricep');
    await page.click('button:has-text("Search")');
    
    await page.fill('input[placeholder="Search by exercise name"]', 'chest');
    await page.click('button:has-text("Search")');
    
    // Wait for final results
    await page.waitForSelector('[data-testid="exercise-card"]', { timeout: 10000 });
    
    // Should show results for the last search
    await expect(page.getByText(/Found \d+ exercise/)).toBeVisible();
  });

  test('should show proper header and navigation', async ({ page }) => {
    // Check that header elements are present
    await expect(page.getByText('FlexCore')).toBeVisible();
    await expect(page.getByText('Exercise Search')).toBeVisible();
    await expect(page.getByText(/Welcome/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
  });
}); 