const { test, expect } = require("@playwright/test");

test.describe("Authentication Flow", () => {
  test("should allow a user to register and login", async ({ page }) => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";

    // Register
    await page.goto("/register");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to home/shop
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sweet Shop")).toBeVisible();
  });
});
