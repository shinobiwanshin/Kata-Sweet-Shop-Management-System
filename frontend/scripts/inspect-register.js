const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("http://localhost:3000/register", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  const inputs = await page.$$eval("input", (els) =>
    els.map((e) => ({
      type: e.getAttribute("type"),
      name: e.getAttribute("name"),
      id: e.id,
      ariaLabel: e.getAttribute("aria-label"),
      placeholder: e.getAttribute("placeholder"),
      outerHTML: e.outerHTML,
    }))
  );
  console.log("Inputs found:", inputs.length);
  console.dir(inputs, { depth: null, maxArrayLength: null });
  await browser.close();
})();
