import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3001/');
  await page.getByRole('button', { name: 'Continue With Email' }).click();
  await page.getByPlaceholder('Email').click();
  await page.getByPlaceholder('Email').fill('tim@apple.dev');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('Applecar2025');
  await page.getByRole('button', { name: 'Sign in' }).click();
});
