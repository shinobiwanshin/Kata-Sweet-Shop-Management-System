const { test, expect } = require("@playwright/test");

test.describe("Purchase Flow", () => {
  test("should allow a user to purchase a sweet", async ({ page }) => {
    const email = `buyer_${Date.now()}@example.com`;
    const password = "password123";

    // 1. Register and Login
    await page.goto("/register");
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/login/);

    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");

    // 2. Browse Shop and Select Item
    // Wait for sweets to load
    await expect(page.locator(".grid > div").first()).toBeVisible();

    // Click Purchase on the first item
    await page.click('button:has-text("Purchase") >> nth=0');

    // 3. Confirm Purchase in Modal
    await expect(page.getByText("Confirm Purchase")).toBeVisible();

    // Select quantity (optional, default is 1)
    // Let's just confirm for now
    await page.click('button:has-text("Confirm Purchase")');

    // 4. Verify Success Message
    await expect(page.getByText("Purchase Successful!")).toBeVisible();

    // 5. Verify in Profile
    await page.click("text=Profile");
    await expect(page).toHaveURL("/profile");

    // Check if purchase history table exists and has rows
    await expect(page.getByText("Purchase History")).toBeVisible();
    // We might need to be more specific, but checking for the table is a good start
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });
});
