import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function testV2App() {
  console.log('Testing Prince Pharma V2 on http://localhost:3006 ...');
  const shotsDir = path.resolve(process.cwd(), 'screenshots_v2');
  if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:3006', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(shotsDir, 'v2_01_billing_pos.png'), fullPage: true });

  // Test adding product to cart
  const quickAdd = page.locator('button:has-text("+ Augmentin")');
  if (await quickAdd.isVisible()) {
    await quickAdd.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(shotsDir, 'v2_02_augmentin_added.png') });
  }

  // Switch to Wholesale mode
  await page.click('button:has-text("Wholesale B2B")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'v2_03_wholesale_mode.png') });

  // Switch to Inventory
  await page.click('button:has-text("FEFO Physical Stock")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'v2_04_inventory.png') });

  // Switch to Customers
  await page.click('button:has-text("Wholesale Pricing Matrix")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'v2_05_pricing_matrix.png') });

  // Switch to Udhari Ledger
  await page.click('button:has-text("Udhari Ledger")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'v2_06_udhari_ledger.png') });

  // Switch to Expiry Watch
  await page.click('button:has-text("Expiry Watch")');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shotsDir, 'v2_07_expiry_watch.png') });

  console.log('V2 Screenshots saved successfully!');
  await browser.close();
}

testV2App();
