import { test, expect } from "@playwright/test";

// The todo items text (OAuth分離, 型ガード追加) is rendered directly in JSX as actual
// Unicode characters (not escape sequences), so we can use them directly.
// But let's verify by checking the snapshot - the error-context showed them as actual chars.

test.describe("Flow 3: Card Expand/Collapse", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByText("feature/auth-refactor").waitFor({ state: "visible" });
  });

  test("feature/auth-refactor card is expanded by default", async ({ page }) => {
    // When expanded, the todo chips section renders a "todo.md" label
    await expect(page.getByText("todo.md")).toBeVisible();
  });

  test("OAuth分離 todo chip is visible when auth-refactor card is expanded", async ({ page }) => {
    await expect(page.getByText("OAuth分離")).toBeVisible();
  });

  test("型ガード追加 todo chip is visible when auth-refactor card is expanded", async ({ page }) => {
    await expect(page.getByText("型ガード追加")).toBeVisible();
  });

  test("clicking card header collapses the card", async ({ page }) => {
    const card = page.locator(".rounded-lg").filter({ hasText: "feature/auth-refactor" }).first();
    const cardHeader = card.locator(".cursor-pointer").first();

    await expect(page.getByText("todo.md")).toBeVisible();

    await cardHeader.click();

    await expect(page.getByText("todo.md")).not.toBeVisible();
  });

  test("clicking card header again re-expands it", async ({ page }) => {
    const card = page.locator(".rounded-lg").filter({ hasText: "feature/auth-refactor" }).first();
    const cardHeader = card.locator(".cursor-pointer").first();

    // Collapse
    await cardHeader.click();
    await expect(page.getByText("todo.md")).not.toBeVisible();

    // Expand again
    await cardHeader.click();
    await expect(page.getByText("todo.md")).toBeVisible();
  });

  test("chevron icon is rotated 180deg when card is expanded", async ({ page }) => {
    const card = page.locator(".rounded-lg").filter({ hasText: "feature/auth-refactor" }).first();
    const chevron = card.locator(".material-symbols-outlined").filter({ hasText: "expand_more" });

    // When expanded (rotate 180deg), the transform matrix has a negative cosine
    const transform = await chevron.evaluate((el) => (el as HTMLElement).style.transform);
    expect(transform).toBe("rotate(180deg)");
  });

  test("chevron icon is not rotated when card is collapsed", async ({ page }) => {
    const card = page.locator(".rounded-lg").filter({ hasText: "feature/auth-refactor" }).first();
    const cardHeader = card.locator(".cursor-pointer").first();
    const chevron = card.locator(".material-symbols-outlined").filter({ hasText: "expand_more" });

    // Collapse the card
    await cardHeader.click();

    const transform = await chevron.evaluate((el) => (el as HTMLElement).style.transform);
    expect(transform).toBe("rotate(0deg)");
  });

  test("other running cards start collapsed (no extra todo.md labels)", async ({ page }) => {
    // Only auth-refactor is expanded by default; only it has todo items
    // So only one "todo.md" label should be visible
    await expect(page.getByText("todo.md")).toHaveCount(1);
  });

  test("expand/collapse does not affect other cards", async ({ page }) => {
    const authCard = page.locator(".rounded-lg").filter({ hasText: "feature/auth-refactor" }).first();
    const authHeader = authCard.locator(".cursor-pointer").first();

    // Collapse auth-refactor
    await authHeader.click();

    // The fix/memory-leak card should still be present and unchanged
    await expect(page.getByText("fix/memory-leak")).toBeVisible();
  });
});
