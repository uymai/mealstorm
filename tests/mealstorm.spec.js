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

  test('should have iPhone 16 Pro splash screen configuration', async ({ page }) => {
    // Check for iPhone 16 Pro specific splash screen configuration
    const iphone16ProSplash = await page.evaluate(() => {
      const metaTags = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
      const foundTag = Array.from(metaTags).find(tag => {
        const media = tag.getAttribute('media');
        return media && media.includes('device-width: 393px') && media.includes('device-height: 852px');
      });
      
      if (foundTag) {
        return {
          href: foundTag.getAttribute('href'),
          media: foundTag.getAttribute('media')
        };
      }
      return null;
    });

    // Verify iPhone 16 Pro splash screen is configured
    expect(iphone16ProSplash).toBeTruthy();
    
    // Verify the correct image file is referenced
    expect(iphone16ProSplash.href).toBe('splashscreen/mealstorm_splash_1179x2556.png');
    
    // Verify the media query is correct for iPhone 16 Pro
    expect(iphone16ProSplash.media).toBe('(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)');
  });

  test('should have PWA manifest with iPhone 16 Pro screenshot', async ({ page }) => {
    // Check if manifest.json is properly configured
    const manifest = await page.evaluate(async () => {
      const response = await fetch('/manifest.json');
      return await response.json();
    });

    // Verify manifest has screenshots section
    expect(manifest.screenshots).toBeDefined();
    expect(Array.isArray(manifest.screenshots)).toBeTruthy();
    
    // Verify iPhone 16 Pro screenshot is configured
    const iphone16ProScreenshot = manifest.screenshots.find(screenshot => 
      screenshot.sizes === '1179x2556' && screenshot.form_factor === 'narrow'
    );
    
    expect(iphone16ProScreenshot).toBeDefined();
    expect(iphone16ProScreenshot.src).toBe('splashscreen/mealstorm_splash_1179x2556.png');
    expect(iphone16ProScreenshot.type).toBe('image/png');
    expect(iphone16ProScreenshot.label).toBe('Mealstorm App Screenshot');
  });

  test('should work correctly on iPhone 16 Pro viewport', async ({ page }) => {
    // Set viewport to iPhone 16 Pro dimensions (393x852 points)
    await page.setViewportSize({ width: 393, height: 852 });
    
    // Set user agent to simulate iPhone
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    });

    // Navigate to the page
    await page.goto('http://localhost:3000');
    
    // Verify the page loads correctly on iPhone 16 Pro viewport
    await expect(page.getByText('Welcome to Mealstorm!')).toBeVisible();
    
    // Check that splash screen meta tag is present for iPhone 16 Pro
    const iphone16ProMeta = await page.evaluate(() => {
      const metaTags = document.querySelectorAll('link[rel="apple-touch-startup-image"]');
      return Array.from(metaTags).find(tag => {
        const media = tag.getAttribute('media');
        return media && media.includes('device-width: 393px') && media.includes('device-height: 852px');
      });
    });
    
    expect(iphone16ProMeta).toBeTruthy();
    
    // Verify the splash screen image file exists and is accessible
    const splashImageResponse = await page.request.get('http://localhost:3000/splashscreen/mealstorm_splash_1179x2556.png');
    expect(splashImageResponse.status()).toBe(200);
    expect(splashImageResponse.headers()['content-type']).toBe('image/png');
  });
}); 