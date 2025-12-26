const { test, expect } = require("@playwright/test");
const { fillAuthForm } = require("./helpers/auth");

test.describe("Authentication Flow", () => {
  test("should allow a user to register and login", async ({ page }) => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";

    // Register
    await page.goto("/register");
    await fillAuthForm(page, email, password);

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login - same adaptive approach
    await page.goto("/login");
    await fillAuthForm(page, email, password);

    // Should redirect to home/shop
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sweet Shop")).toBeVisible();
  });
});
