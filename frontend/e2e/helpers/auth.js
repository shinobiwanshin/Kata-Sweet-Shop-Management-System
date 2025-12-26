// frontend/e2e/helpers/auth.js
async function fillAuthForm(page, email, password) {
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
  const submitSelectors = [
    'button[type="submit"]:not([aria-hidden="true"])',
    'button:has-text("Sign up")',
    'button:has-text("Sign in")',
    'button:has-text("Continue")',
    'button:has-text("Submit")',
    'button[type="submit"]', // fallback to any submit button
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
  } else {
    // Fill password for regular forms
    for (const sel of passwordSelectors) {
      if ((await page.locator(sel).count()) > 0) {
        await page.fill(sel, password);
        break;
      }
    }
  }

  // Click submit button
  for (const sel of submitSelectors) {
    if ((await page.locator(sel).count()) > 0) {
      await page.click(sel);
      break;
    }
  }
}

module.exports = { fillAuthForm };
