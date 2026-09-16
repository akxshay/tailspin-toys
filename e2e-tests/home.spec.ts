import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Tailspin Toys - Crowdfunding your new favorite game!');
  });

  test('should display the main heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to Tailspin Toys', exact: true })).toBeVisible();
  });

  test('should display the site branding in header', async ({ page }) => {
    await expect(page.getByText('Tailspin Toys').first()).toBeVisible();
  });

  test('should display the welcome message', async ({ page }) => {
    await expect(page.getByText('Find your next game! And maybe even back one! Explore our collection!')).toBeVisible();
  });

  test('should filter games by category and publisher', async ({ page }) => {
    await test.step('apply category and publisher filters', async () => {
      await page.getByRole('checkbox', { name: 'Strategy' }).check();
      await page.getByLabel('Filter games by publisher').selectOption({ label: 'CodeForge Studios' });
    });

    await test.step('verify matching games remain visible', async () => {
      await expect(page.getByRole('link', { name: /DevOps Dominion/ })).toBeVisible();
      await expect(page.getByRole('link', { name: /Pipeline Conquest/ })).toBeHidden();
      await expect(page.getByRole('link', { name: /Code Puzzle Chronicles/ })).toBeHidden();
    });

    await test.step('clear the filters and confirm the catalog restores', async () => {
      await page.getByRole('button', { name: 'Clear filters' }).click();
      await expect(page.getByRole('link', { name: /Pipeline Conquest/ })).toBeVisible();
    });
  });
});
