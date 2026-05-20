import { test, expect } from '@playwright/test';

/**
 * E2E test script for the Login flow.
 * Ensures critical authentication paths remain unbreakable in CI/CD.
 */
test.describe('Login Flow', () => {
  // Navigate before each test if actual URL resolves
  test.beforeEach(async ({ page }) => {
    // Note: Replacing with realistic local app URL for standard environments
    await page.goto('http://localhost:3000/login'); 
  });

  test('should display validation errors on empty submission', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: /sign in/i });
    await submitBtn.click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill credentials using accessible locators
    await page.getByLabel(/email address/i).fill('admin@neurolinkx.com');
    await page.getByLabel(/password/i).fill('StrictlySecret123!');
    
    // Intercept API call to mock a successful return for pure frontend E2E
    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'mock_jwt_token', user: { id: 1, role: 'admin' } }),
      });
    });

    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify reroute to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shipment Tracking');
  });

  test('should display error toast on invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('fake@neurolinkx.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    await page.route('**/api/auth/login', route => {
      route.fulfill({
        status: 401,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.getByRole('button', { name: /sign in/i }).click();

    // Validate global UI Store / Toast reaction
    const toast = page.locator('.toast-notification'); // Assuming custom class
    await expect(toast).toContainText('Invalid credentials');
  });
});
