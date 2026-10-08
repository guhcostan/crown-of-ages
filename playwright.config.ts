import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4174";
// Quando PLAYWRIGHT_BASE_URL aponta para producao (ou outra URL remota), nao subimos servidor local.
const useProd = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 4,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1600, height: 900 } } },
  ],
  webServer: useProd
    ? undefined
    : {
        command: "pnpm run build && pnpm run preview",
        port: 4174,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
