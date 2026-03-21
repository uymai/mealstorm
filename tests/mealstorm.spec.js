const { test, expect } = require('@playwright/test');
const {
  alternateMealPlan,
  bulkImportMealPlans,
  expectNotification,
  expectSavedPlanTitles,
  exportMealPlans,
  loadPlanFromTextarea,
  mainTab,
  openCookTab,
  resetApp,
  uploadPlanFile,
  validMealPlan,
} = require('./helpers/mealstorm.helpers');

test.describe('Mealstorm regression suite', () => {
  test.beforeEach(async ({ page }) => {
    await resetApp(page);
  });

  test('boots on the About tab and supports tab navigation', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Welcome to Mealstorm!' })).toBeVisible();

    await mainTab(page, 'Plan').click();
    await expect(page.getByRole('heading', { name: 'Create a New Meal Plan' })).toBeVisible();

    await mainTab(page, 'Cook').click();
    await expect(page.getByRole('heading', { name: 'Mealstorm' })).toBeVisible();

    await mainTab(page, 'Bulk Import').click();
    await expect(page.getByRole('heading', { name: 'Bulk Import Meal Plans' })).toBeVisible();
  });

  test('loads a valid meal plan from pasted JSON and renders tasks and recipes', async ({ page }) => {
    await loadPlanFromTextarea(page, validMealPlan);
    await openCookTab(page);

    await expect(page.getByRole('heading', { name: validMealPlan.title })).toBeVisible();
    await expect(page.locator('#checklist .checklist-item')).toHaveCount(validMealPlan.tasks.length);
    await expect(page.locator('.recipe-tab', { hasText: validMealPlan.recipes[0].name })).toBeVisible();
    await expect(page.locator('.recipe-tab', { hasText: validMealPlan.recipes[1].name })).toBeVisible();
  });

  test('loads a valid meal plan from file upload', async ({ page }) => {
    await uploadPlanFile(page, 'valid-meal-plan.json');
    await openCookTab(page);

    await expect(page.getByRole('heading', { name: validMealPlan.title })).toBeVisible();
    await expect(page.getByText(validMealPlan.tasks[0].text)).toBeVisible();
  });

  test('shows an error for invalid JSON without corrupting saved state', async ({ page }) => {
    await loadPlanFromTextarea(page, validMealPlan);
    await expectSavedPlanTitles(page, [validMealPlan.title]);

    await page.locator('#jsonInput').fill('{not valid json');
    await page.getByRole('button', { name: 'Load Plan' }).click();

    await expectNotification(page, 'Error parsing JSON. Please check the format.');
    await expectSavedPlanTitles(page, [validMealPlan.title]);
  });

  test('persists the current plan across reload and allows loading from saved plans', async ({ page }) => {
    await loadPlanFromTextarea(page, validMealPlan);
    await expectSavedPlanTitles(page, [validMealPlan.title]);

    await page.reload();
    await openCookTab(page);
    await expect(page.getByRole('heading', { name: validMealPlan.title })).toBeVisible();

    await mainTab(page, 'Plan').click();
    await page.locator('#saved-plans-container .plan-item').filter({ hasText: validMealPlan.title }).getByRole('button', { name: 'Load' }).click();
    await expect(page.getByRole('heading', { name: validMealPlan.title })).toBeVisible();
  });

  test('persists checkbox progress per active meal plan without bleeding across plans', async ({ page }) => {
    await loadPlanFromTextarea(page, validMealPlan);
    await openCookTab(page);

    const firstPlanCheckbox = page.locator('#task0');
    await firstPlanCheckbox.check();
    await expect(firstPlanCheckbox).toBeChecked();

    await page.reload();
    await openCookTab(page);
    await expect(page.locator('#task0')).toBeChecked();

    await loadPlanFromTextarea(page, alternateMealPlan);
    await openCookTab(page);
    await expect(page.locator('#task0')).not.toBeChecked();

    await page.getByRole('button', { name: 'Plan' }).click();
    const savedPlans = page.locator('#saved-plans-container .plan-item');
    await savedPlans.filter({ hasText: validMealPlan.title }).getByRole('button', { name: 'Load' }).click();
    await expect(page.locator('#task0')).toBeChecked();
  });

  test('adjusts the timeline and ignores an empty target time', async ({ page }) => {
    await loadPlanFromTextarea(page, validMealPlan);
    await openCookTab(page);

    const firstTime = page.locator('#checklist .checklist-item .time').first();
    await expect(firstTime).toHaveText('4:00 PM');

    await page.locator('#target-time').fill('17:30');
    await page.getByRole('button', { name: 'Adjust Timeline' }).click();
    await expect(firstTime).toHaveText('4:30 PM');

    await page.locator('#target-time').evaluate(node => {
      node.value = '';
    });
    await page.getByRole('button', { name: 'Adjust Timeline' }).click();
    await expect(firstTime).toHaveText('4:30 PM');
  });

  test('imports selected meal plans and exports the saved plan set', async ({ page }) => {
    await mainTab(page, 'Bulk Import').click();
    await page.locator('#recipe-import-area').fill(JSON.stringify(bulkImportMealPlans, null, 2));
    await page.getByRole('button', { name: 'Import Meal Plans' }).click();

    await expect(page.locator('#recipe-selection-area')).toBeVisible();
    await page.locator('#meal-plan-1').uncheck();
    await page.getByRole('button', { name: 'Import Selected Meal Plans' }).click();

    await expectNotification(page, 'Successfully imported 1 meal plan(s)!');
    await expectSavedPlanTitles(page, [bulkImportMealPlans[0].title]);

    const exportedPlans = await exportMealPlans(page);
    expect(exportedPlans).toHaveLength(1);
    expect(exportedPlans[0].title).toBe(bulkImportMealPlans[0].title);
  });

  test('updates an existing saved plan during duplicate-title import instead of duplicating it', async ({ page }) => {
    const updatedDinnerParty = {
      ...bulkImportMealPlans[0],
      tasks: [
        { time: '5:15 PM', text: 'Light the candles' },
        { time: '6:45 PM', text: 'Serve dinner' }
      ]
    };

    await mainTab(page, 'Bulk Import').click();
    await page.locator('#recipe-import-area').fill(JSON.stringify([bulkImportMealPlans[0]], null, 2));
    await page.getByRole('button', { name: 'Import Meal Plans' }).click();
    await page.getByRole('button', { name: 'Import Selected Meal Plans' }).click();

    await page.locator('#recipe-import-area').fill(JSON.stringify([updatedDinnerParty], null, 2));
    await page.getByRole('button', { name: 'Import Meal Plans' }).click();
    await page.getByRole('button', { name: 'Import Selected Meal Plans' }).click();

    await expectSavedPlanTitles(page, [bulkImportMealPlans[0].title]);
    await page.locator('#saved-plans-container .plan-item').filter({ hasText: bulkImportMealPlans[0].title }).getByRole('button', { name: 'Load' }).click();
    await expect(page.getByText('Light the candles')).toBeVisible();
  });

  test('exposes a valid manifest and keeps navigation usable on a mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');

    const manifest = await page.evaluate(async () => {
      const response = await fetch('/manifest.json');
      return response.json();
    });

    expect(manifest.name).toBe('Mealstorm');
    expect(manifest.icons.length).toBeGreaterThan(0);

    const startupImages = await page.locator('link[rel="apple-touch-startup-image"]').count();
    expect(startupImages).toBeGreaterThan(0);

    await mainTab(page, 'Plan').click();
    await expect(page.getByRole('heading', { name: 'Create a New Meal Plan' })).toBeVisible();
  });
});
