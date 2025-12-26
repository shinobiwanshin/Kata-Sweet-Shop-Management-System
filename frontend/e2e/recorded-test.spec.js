import { test, expect } from "@playwright/test";
const ADMIN_USERNAME = process.env.TEST_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const USER_USERNAME = process.env.TEST_USER_USERNAME;
const USER_PASSWORD = process.env.TEST_USER_PASSWORD;
const CLERK_SIGN_IN_URL =
  "https://poetic-elk-16.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F";

test("test", async ({ page }) => {
  await page.goto(
    "https://poetic-elk-16.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F"
  );
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(ADMIN_USERNAME);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Admin Dashboard" }).click();
  await page.getByRole("button", { name: "Add New Sweet" }).click();
  await page.getByRole("textbox", { name: "Name *" }).click();
  await page.getByRole("textbox", { name: "Name *" }).fill("Bar");
  await page.getByRole("spinbutton", { name: "Price ($) *" }).click();
  await page.getByRole("spinbutton", { name: "Price ($) *" }).fill("2");
  await page.getByRole("spinbutton", { name: "Quantity *" }).click();
  await page.getByRole("spinbutton", { name: "Quantity *" }).fill("3");
  await page.getByRole("textbox", { name: "Description" }).click();
  await page
    .getByRole("textbox", { name: "Description" })
    .fill("Sweet Caramel");
  await page.getByRole("button", { name: "Add Sweet" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Restock" }).nth(2).click();
  await page
    .getByRole("spinbutton", { name: "Enter quantity to restock" })
    .click();
  await page
    .getByRole("spinbutton", { name: "Enter quantity to restock" })
    .fill("2");
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "OK" }).click();
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(USER_USERNAME);
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(USER_USERNAME);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(USER_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Purchase" }).nth(3).click();
  await page.getByRole("button", { name: "Increase quantity" }).dblclick();
  await page.getByRole("button", { name: "Decrease quantity" }).click();
  await page.getByRole("button", { name: "Confirm Purchase" }).click();
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(ADMIN_USERNAME);
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .click();
  await page
    .getByRole("textbox", { name: "Email address or username" })
    .fill(ADMIN_USERNAME);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("textbox", { name: "Password" }).click();
  await page.getByRole("textbox", { name: "Password" }).fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Admin Dashboard" }).click();
  await page.getByRole("button", { name: "Delete Bar" }).click();
  await page.getByRole("button", { name: "Yes, delete it!" }).click();
  await page.getByRole("button", { name: "OK" }).click();
});
