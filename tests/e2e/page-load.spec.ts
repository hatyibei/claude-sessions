import { test, expect } from "@playwright/test";

// Column titles are rendered as literal unicode escapes in the HTML
// because they are JSX string attributes (not JS string literals)
const COL_QUEUED = "\\u5F85\\u6A5F\\u4E2D";   // 待機中
const COL_RUNNING = "\\u5B9F\\u884C\\u4E2D";   // 実行中
const COL_DONE = "\\u5B8C\\u4E86";             // 完了

// GlobalCommandBar placeholder and button text are also literal escapes
const PLACEHOLDER_NEW_SESSION = "\\u65B0\\u898F\\u30BB\\u30C3\\u30B7\\u30E7\\u30F3...";
const BTN_START = "\\u8D77\\u52D5";  // 起動

test.describe("Flow 1: Page Load & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads successfully with 200 status", async ({ page }) => {
    const response = await page.request.get("/");
    expect(response.status()).toBe(200);
  });

  test("header shows claude-sessions title", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("claude-sessions");
  });

  test("three kanban columns are visible", async ({ page }) => {
    await expect(page.getByText(COL_QUEUED)).toBeVisible();
    await expect(page.getByText(COL_RUNNING)).toBeVisible();
    await expect(page.getByText(COL_DONE)).toBeVisible();
  });

  test("session counts are displayed in header", async ({ page }) => {
    await expect(page.getByText(/\d+ RUNNING/)).toBeVisible();
    await expect(page.getByText(/\d+ QUEUED/)).toBeVisible();
    await expect(page.getByText(/\d+ DONE/)).toBeVisible();
  });

  test("running count shows 3 (three running mock sessions)", async ({ page }) => {
    await expect(page.getByText("3 RUNNING")).toBeVisible();
  });

  test("queued count shows 2 (two queued mock sessions)", async ({ page }) => {
    await expect(page.getByText("2 QUEUED")).toBeVisible();
  });

  test("done count shows 2 (two done mock sessions)", async ({ page }) => {
    await expect(page.getByText("2 DONE")).toBeVisible();
  });

  test("GlobalCommandBar is visible at the bottom", async ({ page }) => {
    const commandBar = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await expect(commandBar).toBeVisible();
  });

  test("GlobalCommandBar has launch button", async ({ page }) => {
    // The 起動 button text is also a literal unicode escape in the DOM
    await expect(page.getByText(BTN_START)).toBeVisible();
  });

  test("mock session cards are rendered in correct columns", async ({ page }) => {
    await expect(page.getByText("feature/auth-refactor")).toBeVisible();
    await expect(page.getByText("docs/api-reference")).toBeVisible();
    await expect(page.getByText("feat/dark-mode")).toBeVisible();
  });

  test("page title is set correctly", async ({ page }) => {
    await expect(page).toHaveTitle(/claude-sessions/);
  });
});
