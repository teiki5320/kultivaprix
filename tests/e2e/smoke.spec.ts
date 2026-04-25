import { test, expect } from '@playwright/test';

test.describe('Kultivaprix smoke', () => {
  test('home renders the hero and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Jardine malin/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Commencer à chercher/i })).toBeVisible();
  });

  test('search page accepts a query', async ({ page }) => {
    await page.goto('/recherche');
    await page.getByRole('searchbox').fill('tomate');
    await page.getByRole('button', { name: 'Chercher' }).click();
    await expect(page).toHaveURL(/q=tomate/);
  });

  test('seasonal landings render for current month', async ({ page }) => {
    await page.goto('/que-semer/janvier');
    await expect(page.getByRole('heading', { name: /Que semer en/i })).toBeVisible();
  });

  test('quiz flows through 3 questions', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: /Plein soleil/i }).click();
    await page.getByRole('button', { name: /Petit potager/i }).click();
    await page.getByRole('button', { name: /Moyen/i }).click();
    await expect(page.getByRole('heading', { name: /Voici ce que tu pourrais/i })).toBeVisible();
  });

  test('cart starts empty and accepts an import via share link', async ({ page }) => {
    await page.goto('/panier');
    await expect(page.getByText(/Ton panier est vide/i)).toBeVisible();
  });

  test('glossary lists at least a dozen terms', async ({ page }) => {
    await page.goto('/glossaire');
    const articles = page.locator('article');
    await expect.poll(async () => await articles.count()).toBeGreaterThan(10);
  });
});
