import { defineConfig, devices } from "@playwright/test";
import process from "node:process";

const baseURL = "http://localhost:4178";
const apiURL = process.env.SILVERBOX_E2E_API_URL ?? "http://localhost:18008";

export default defineConfig({
  testDir: "./test/browser",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    acceptDownloads: true,
    timezoneId: "America/Campo_Grande",
    trace: "retain-on-failure",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
    },
  },
  webServer: {
    command: "node node_modules/vite/bin/vite.js --host localhost --port 4178 --strictPort",
    url: baseURL,
    env: { VITE_API_URL: apiURL },
  },
});
