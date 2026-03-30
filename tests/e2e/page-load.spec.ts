import { test, expect } from "@playwright/test";

test.describe("ページ読み込み", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("ページが正常にロードされる", async ({ page }) => {
    await expect(page).toHaveTitle(/claude-sessions/);
  });

  test("ヘッダーにタイトルが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("claude-sessions");
  });

  test("3つのカンバンカラムが日本語で表示される", async ({ page }) => {
    await expect(page.getByText("待機中")).toBeVisible();
    await expect(page.getByText("実行中")).toBeVisible();
    await expect(page.getByText("完了")).toBeVisible();
  });

  test("セッション数カウンターが表示される", async ({ page }) => {
    await expect(page.getByText(/\d+ RUNNING/)).toBeVisible();
    await expect(page.getByText(/\d+ QUEUED/)).toBeVisible();
    await expect(page.getByText(/\d+ DONE/)).toBeVisible();
  });

  test("グローバルコマンドバーが日本語で表示される", async ({ page }) => {
    await expect(page.getByPlaceholder("新規セッション...")).toBeVisible();
    await expect(page.getByText("起動")).toBeVisible();
  });

  test("テーマスイッチャーが3つ表示される", async ({ page }) => {
    await expect(page.getByTitle("Dark Mode")).toBeVisible();
    await expect(page.getByTitle("Light Mode")).toBeVisible();
    await expect(page.getByTitle("Beige Mode")).toBeVisible();
  });

  test("WS接続インジケータが表示される", async ({ page }) => {
    await expect(page.locator("[title*='WS']")).toBeVisible();
  });
});
