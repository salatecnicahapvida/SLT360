import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser', timeout:45000, workers:1, reporter:'list',
  use:{baseURL:process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:4173/',headless:true,channel:process.env.PLAYWRIGHT_BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined),viewport:{width:1440,height:1000}},
  webServer:process.env.PLAYWRIGHT_BASE_URL?undefined:{command:'node scripts/serve.mjs dist 4173',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI},
});
