const path = require('path');
const { expect } = require('@playwright/test');

const validMealPlan = require('../fixtures/valid-meal-plan.json');
const alternateMealPlan = require('../fixtures/alternate-meal-plan.json');
const bulkImportMealPlans = require('../fixtures/bulk-import-meal-plans.json');

const fixturePath = fileName => path.join(__dirname, '..', 'fixtures', fileName);
const mainTab = (page, name) => page.getByRole('button', { name, exact: true });

async function resetApp(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
}

async function loadPlanFromTextarea(page, plan) {
  await mainTab(page, 'Plan').click();
  await page.locator('#jsonInput').fill(JSON.stringify(plan, null, 2));
  await page.getByRole('button', { name: 'Load Plan' }).click();
}

async function uploadPlanFile(page, fileName) {
  await mainTab(page, 'Plan').click();
  await page.locator('#fileInput').setInputFiles(fixturePath(fileName));
}

async function openCookTab(page) {
  await mainTab(page, 'Cook').click();
}

async function expectNotification(page, message) {
  const notification = page.locator('.notification').filter({ hasText: message });
  await expect(notification).toBeVisible();
}

async function expectSavedPlanTitles(page, titles) {
  await mainTab(page, 'Plan').click();
  const savedPlans = page.locator('#saved-plans-container .plan-item .plan-title');
  await expect(savedPlans).toHaveCount(titles.length);
  for (const title of titles) {
    await expect(savedPlans.filter({ hasText: title })).toHaveCount(1);
  }
}

async function exportMealPlans(page) {
  await mainTab(page, 'Bulk Export').click();
  await page.getByRole('button', { name: 'Export Meal Plans' }).click();
  const exportValue = await page.locator('#recipe-export-area').inputValue();
  return JSON.parse(exportValue);
}

module.exports = {
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
};
