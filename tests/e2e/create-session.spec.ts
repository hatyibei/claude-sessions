import { test, expect } from "@playwright/test";

// GlobalCommandBar placeholder is a JSX string attribute with literal escapes
const PLACEHOLDER_NEW_SESSION = "\\u65B0\\u898F\\u30BB\\u30C3\\u30B7\\u30E7\\u30F3...";
// The 起動 button text is also a literal escape in the DOM
const BTN_START_TEXT = "\\u8D77\\u52D5";

test.describe("Flow 5: Create New Session", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(PLACEHOLDER_NEW_SESSION).waitFor({ state: "visible" });
  });

  test("GlobalCommandBar input is present and enabled", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test("typing in GlobalCommandBar updates the input value", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("my-new-feature");
    await expect(input).toHaveValue("my-new-feature");
  });

  test("pressing Enter in GlobalCommandBar creates a new session card", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("feature/new-test-session");
    await input.press("Enter");

    // Use getByRole to target the card heading specifically (avoids strict mode violation)
    await expect(page.getByRole("heading", { name: "feature/new-test-session" })).toBeVisible();
  });

  test("clicking launch button creates a new session card", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("feature/button-created-session");

    await page.getByText(BTN_START_TEXT).click();

    await expect(page.getByRole("heading", { name: "feature/button-created-session" })).toBeVisible();
  });

  test("toast notification appears after session creation", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("notify-test");
    await input.press("Enter");

    // Toast message: セッション「notify-test」を作成しました
    // The toast container is fixed at top-4 right-4
    const toastContainer = page.locator(".fixed.top-4.right-4");
    await expect(toastContainer).toBeVisible();
    await expect(toastContainer).toContainText("notify-test");
  });

  test("input is cleared after session creation via Enter", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("session-to-clear");
    await input.press("Enter");

    await expect(input).toHaveValue("");
  });

  test("input is cleared after session creation via launch button", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("session-button-clear");

    await page.getByText(BTN_START_TEXT).click();

    await expect(input).toHaveValue("");
  });

  test("new session appears in the queued column", async ({ page }) => {
    // The queued column (待機中) is rendered with literal unicode escape
    const queuedColumn = page.locator("section").filter({ hasText: "\\u5F85\\u6A5F\\u4E2D" }).first();
    const initialCount = await queuedColumn.locator(".rounded-lg").count();

    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.fill("queue-column-test");
    await input.press("Enter");

    await expect(queuedColumn.locator(".rounded-lg")).toHaveCount(initialCount + 1);
  });

  test("empty input does not create a session or show a toast", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);
    await input.click();
    await input.press("Enter");

    const toastContainer = page.locator(".fixed.top-4.right-4");
    await expect(toastContainer).not.toBeVisible();
  });

  test("two sessions can be created back to back", async ({ page }) => {
    const input = page.getByPlaceholder(PLACEHOLDER_NEW_SESSION);

    await input.click();
    await input.fill("session-alpha-unique");
    await input.press("Enter");

    await input.fill("session-beta-unique");
    await input.press("Enter");

    // Use heading role to avoid strict mode violation (session name appears in h3 + task p)
    await expect(page.getByRole("heading", { name: "session-alpha-unique" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "session-beta-unique" })).toBeVisible();
  });
});
