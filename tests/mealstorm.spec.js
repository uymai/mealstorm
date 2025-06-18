const { test, expect } = require('@playwright/test');

test.describe('Mealstorm Application', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the index page for each test
    await page.goto('http://localhost:3000');
  });

  test('should load the application and show about page by default', async ({ page }) => {
    // Check if the main title is visible
    await expect(page.getByText('Welcome to Mealstorm!')).toBeVisible();
    
    // Verify the main tabs are present
    await expect(page.getByRole('button', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plan' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cook' })).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Click on Plan tab
    await page.getByRole('button', { name: 'Plan' }).click();
    await expect(page.getByText('Create a New Meal Plan')).toBeVisible();
    
    // Click on Cook tab
    await page.getByRole('button', { name: 'Cook' }).click();
    await expect(page.getByRole('heading', { name: 'Mealstorm' })).toBeVisible();
    
    // Click on About tab
    await page.getByRole('button', { name: 'About' }).click();
    await expect(page.getByText('Welcome to Mealstorm!')).toBeVisible();
  });

  test('should load a meal plan from JSON input', async ({ page }) => {
    // Navigate to Plan tab
    await page.getByRole('button', { name: 'Plan' }).click();
    
    // Input sample meal plan JSON
    const samplePlan = {
      title: "Test Dinner Plan",
      tasks: [
        {
          time: "4:00 PM",
          task: "Start preheating oven"
        },
        {
          time: "4:30 PM",
          task: "Prepare ingredients"
        }
      ]
    };
    
    await page.fill('#jsonInput', JSON.stringify(samplePlan));
    await page.click('button:has-text("Load Plan")');
    
    // Switch to Cook tab and verify the plan was loaded
    await page.getByRole('button', { name: 'Cook' }).click();
    await expect(page.getByRole('heading', { name: 'Test Dinner Plan' })).toBeVisible();
    await expect(page.getByText('4:00 PM')).toBeVisible();
    await expect(page.getByText('Start preheating oven')).toBeVisible();
  });

  test('should handle the screen wake lock feature', async ({ page }) => {
    // Navigate to Cook tab
    await page.getByRole('button', { name: 'Cook' }).click();
    
    // Click the screen wake lock button
    const wakeLockButton = page.getByRole('button', { name: /Keep Screen On/i });
    await wakeLockButton.click();
    
    // Verify the button text changes
    await expect(wakeLockButton).toContainText('Screen On');
  });

  test('should have splash screen configuration', async ({ page }) => {
    // Check for splash screen meta tags
    const splashScreenMeta = await page.evaluate(() => {
      const metaTags = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
      return Array.from(metaTags).map(tag => ({
        href: tag.getAttribute('href'),
        media: tag.getAttribute('media')
      }));
    });

    // Verify that splash screen images are configured for different devices
    expect(splashScreenMeta.length).toBeGreaterThan(0);
    
    // Verify default splash screen is configured
    const hasDefaultSplash = splashScreenMeta.some(meta => 
      meta.href && meta.href.includes('splashscreen/mealstorm_splash_') && !meta.media
    );
    expect(hasDefaultSplash).toBeTruthy();

    // Verify device-specific splash screens are configured
    const hasDeviceSpecificSplash = splashScreenMeta.some(meta => 
      meta.href && meta.href.includes('splashscreen/mealstorm_splash_') && meta.media
    );
    expect(hasDeviceSpecificSplash).toBeTruthy();
  });
}); 