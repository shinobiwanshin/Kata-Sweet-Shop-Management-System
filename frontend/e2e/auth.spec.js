const { test, expect } = require("@playwright/test");

test.describe("Authentication Flow", () => {
  test("should allow a user to register and login", async ({ page }) => {
    const email = `testuser_${Date.now()}@example.com`;
    const password = "password123";

    // Register
    await page.goto("/register");

    // Support both the old dev form and Clerk SignUp UI by trying multiple selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="emailAddress"]',
      'input[aria-label*="Email"]',
    ];
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[aria-label*="Password"]',
    ];

    let emailFound = false;
    for (const sel of emailSelectors) {
      if ((await page.locator(sel).count()) > 0) {
        await page.fill(sel, email);
        emailFound = true;
        break;
      }
    }

    if (!emailFound) {
      // Try Clerk flows - wait for Clerk inputs to mount and then fill
      const clerkEmail = page.locator('input[name="emailAddress"]');
      const clerkPassword = page.locator('input[name="password"]');
      await clerkEmail.waitFor({ timeout: 10000 });
      await clerkPassword.waitFor({ timeout: 10000 });
      await clerkEmail.fill(email);
      await clerkPassword.fill(password);
      // Click the primary form button
      await page.click('button[type="submit"]');
    } else {
      // Old dev form path
      for (const sel of passwordSelectors) {
        if ((await page.locator(sel).count()) > 0) {
          await page.fill(sel, password);
          break;
        }
      }
      await page.click('button[type="submit"]');
    }

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login - same adaptive approach
    await page.goto("/login");

    emailFound = false;
    for (const sel of emailSelectors) {
      if ((await page.locator(sel).count()) > 0) {
        await page.fill(sel, email);
        emailFound = true;
        break;
      }
    }

    if (!emailFound) {
      const clerkEmail = page.locator('input[name="emailAddress"]');
      const clerkPassword = page.locator('input[name="password"]');
      if ((await clerkEmail.count()) > 0) {
        await clerkEmail.fill(email);
        await clerkPassword.fill(password);
        await page.click('button[type="submit"]');
      } else {
        throw new Error("No email input found for login");
      }
    } else {
      for (const sel of passwordSelectors) {
        if ((await page.locator(sel).count()) > 0) {
          await page.fill(sel, password);
          break;
        }
      }
      await page.click('button[type="submit"]');
    }

    // Should redirect to home/shop
    await expect(page).toHaveURL("/");
    await expect(page.getByText("Sweet Shop")).toBeVisible();
  });
});
