import { chromium } from 'playwright';

async function testResponsive() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/local/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const brainDir = '/root/.gemini/antigravity-cli/brain/b128acce-5075-4f9d-831f-c71373c8f281';

  // 1. MOBILE PHONE TEST (iPhone 13 / 14: 390 x 844)
  console.log('Testing Mobile Phone (390x844)...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();
  await mobilePage.goto('https://prince-pharma.vercel.app', { waitUntil: 'networkidle' });
  await mobilePage.screenshot({ path: `${brainDir}/v3_mobile_01_pos.png`, fullPage: false });
  console.log('Saved v3_mobile_01_pos.png');

  // Open mobile menu
  await mobilePage.click('button[aria-label="Toggle Menu"]');
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: `${brainDir}/v3_mobile_02_drawer.png`, fullPage: false });
  console.log('Saved v3_mobile_02_drawer.png');

  // Close drawer
  await mobilePage.click('div.flex-1');
  await mobilePage.waitForTimeout(300);

  // Open mobile invoice view
  await mobilePage.click('button:has-text("Invoice")');
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: `${brainDir}/v3_mobile_03_invoice_sheet.png`, fullPage: false });
  console.log('Saved v3_mobile_03_invoice_sheet.png');

  // Close mobile invoice modal by clicking Close button or Escape
  await mobilePage.keyboard.press('Escape');
  await mobilePage.waitForTimeout(300);

  // Navigate to Stock on mobile
  await mobilePage.click('button:has-text("FEFO Stock")');
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: `${brainDir}/v3_mobile_04_stock.png`, fullPage: false });
  console.log('Saved v3_mobile_04_stock.png');

  // Navigate to Udhari on mobile
  await mobilePage.click('button:has-text("Udhari Ledger")');
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: `${brainDir}/v3_mobile_05_udhari.png`, fullPage: false });
  console.log('Saved v3_mobile_05_udhari.png');
  await mobileCtx.close();

  // 2. DESKTOP TEST (1440 x 900)
  console.log('Testing Desktop (1440x900)...');
  const deskCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const deskPage = await deskCtx.newPage();
  await deskPage.goto('https://prince-pharma.vercel.app', { waitUntil: 'networkidle' });
  await deskPage.screenshot({ path: `${brainDir}/v3_desk_01_pos.png`, fullPage: true });
  console.log('Saved v3_desk_01_pos.png');

  // Open Inward Purchases tab
  await deskPage.click('button:has-text("Inward Purchases")');
  await deskPage.waitForTimeout(400);
  await deskPage.screenshot({ path: `${brainDir}/v3_desk_02_purchases.png`, fullPage: true });
  console.log('Saved v3_desk_02_purchases.png');

  // Open Contract Matrix tab
  await deskPage.click('button:has-text("Contract Matrix")');
  await deskPage.waitForTimeout(400);
  await deskPage.screenshot({ path: `${brainDir}/v3_desk_03_contract_matrix.png`, fullPage: true });
  console.log('Saved v3_desk_03_contract_matrix.png');

  // Open Settings tab
  await deskPage.click('button:has-text("Settings")');
  await deskPage.waitForTimeout(400);
  await deskPage.screenshot({ path: `${brainDir}/v3_desk_04_settings.png`, fullPage: true });
  console.log('Saved v3_desk_04_settings.png');

  // Open POS and complete bill to test print modal
  await deskPage.click('button:has-text("POS Billing")');
  await deskPage.waitForTimeout(400);
  await deskPage.click('button:has-text("Complete & Print Invoice")');
  await deskPage.waitForTimeout(500);
  await deskPage.screenshot({ path: `${brainDir}/v3_desk_05_print_modal.png`, fullPage: true });
  console.log('Saved v3_desk_05_print_modal.png');

  await deskCtx.close();
  await browser.close();
  console.log('All responsive tests completed successfully!');
}

testResponsive().catch((e) => {
  console.error(e);
  process.exit(1);
});
