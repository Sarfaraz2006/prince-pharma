import { chromium } from 'playwright';

async function verifyProd() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to live production site https://prince-pharma.vercel.app ...');
  await page.goto('https://prince-pharma.vercel.app', { waitUntil: 'networkidle' });

  await page.screenshot({ path: '/root/.gemini/antigravity-cli/brain/b128acce-5075-4f9d-831f-c71373c8f281/v2_prod_live_billing.png', fullPage: true });
  console.log('Captured v2_prod_live_billing.png');

  // Click Wholesale B2B
  await page.click('button:has-text("Wholesale B2B")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/root/.gemini/antigravity-cli/brain/b128acce-5075-4f9d-831f-c71373c8f281/v2_prod_live_wholesale.png', fullPage: true });
  console.log('Captured v2_prod_live_wholesale.png');

  // Click FEFO Physical Stock tab
  await page.click('button:has-text("FEFO Physical Stock")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/root/.gemini/antigravity-cli/brain/b128acce-5075-4f9d-831f-c71373c8f281/v2_prod_live_stock.png', fullPage: true });
  console.log('Captured v2_prod_live_stock.png');

  // Click Expiry Watch
  await page.click('button:has-text("Expiry Watch")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/root/.gemini/antigravity-cli/brain/b128acce-5075-4f9d-831f-c71373c8f281/v2_prod_live_expiry.png', fullPage: true });
  console.log('Captured v2_prod_live_expiry.png');

  await browser.close();
  console.log('All live production screenshots captured successfully!');
}

verifyProd().catch(err => {
  console.error(err);
  process.exit(1);
});
