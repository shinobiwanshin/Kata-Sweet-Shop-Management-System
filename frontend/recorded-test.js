const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://poetic-elk-16.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F');
  await page.getByRole('textbox', { name: 'Email address or username' }).click();
  await page.getByRole('textbox', { name: 'Email address or username' }).fill('AmitabhaNat');
  await page.getByRole('textbox', { name: 'Email address or username' }).press('ControlOrMeta+a');
  await page.getByRole('textbox', { name: 'Email address or username' }).fill('');
  await page.getByRole('button', { name: 'Sign in with Google' }).click();
  await page.goto('https://poetic-elk-16.accounts.dev/sign-in?redirect_url=http%3A%2F%2Flocalhost%3A3000%2F');
  await page.getByRole('textbox', { name: 'Email address or username' }).click();
  await page.getByRole('textbox', { name: 'Email address or username' }).fill('supersaiyan2k03@gmail.com');
  await page.getByRole('textbox', { name: 'Email address or username' }).press('Enter');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Enter verification code' }).fill('');
  await page.getByRole('textbox', { name: 'Enter verification code' }).click();
  await page.getByRole('textbox', { name: 'Enter verification code' }).fill('466819');
  await page.getByRole('button', { name: 'Admin Dashboard' }).click();
  await page.getByRole('button', { name: 'Add New Sweet' }).click();
  await page.getByRole('textbox', { name: 'Name *' }).click();
  await page.getByRole('textbox', { name: 'Name *' }).fill('Chocolate Bar');
  await page.getByRole('spinbutton', { name: 'Price ($) *' }).click();
  await page.getByRole('spinbutton', { name: 'Price ($) *' }).fill('10');
  await page.getByRole('spinbutton', { name: 'Quantity *' }).click();
  await page.getByRole('spinbutton', { name: 'Quantity *' }).fill('20');
  await page.getByRole('textbox', { name: 'Description' }).click();
  await page.getByRole('textbox', { name: 'Description' }).fill('A Dark Chocolate made in Swiss Alps');
  await page.getByRole('button', { name: 'Add Sweet' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.close();

  // ---------------------
  await context.close();
  await browser.close();
})();