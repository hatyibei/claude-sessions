import { test, expect } from "@playwright/test";

test.describe("セッションライフサイクル", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000); // WS接続待ち
  });

  test("新規セッションを作成できる", async ({ page }) => {
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("e2e-test-session");
    await input.press("Enter");

    // セッションカードが表示される（バックエンドがtask/プレフィックスを付ける）
    await expect(page.locator("[data-session-id]").first()).toBeVisible({ timeout: 5000 });
  });

  test("セッション作成時にトースト通知が表示される", async ({ page }) => {
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("toast-test");
    await input.press("Enter");

    const toast = page.locator(".fixed.top-4.right-4");
    await expect(toast).toContainText("toast-test", { timeout: 3000 });
  });

  test("起動ボタンでもセッション作成できる", async ({ page }) => {
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("button-test");
    await page.getByText("起動").click();

    await expect(page.locator("[data-session-id]").first()).toBeVisible({ timeout: 5000 });
  });

  test("作成後に入力欄がクリアされる", async ({ page }) => {
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("clear-test");
    await input.press("Enter");

    await expect(input).toHaveValue("");
  });

  test("空入力ではセッションが作成されない", async ({ page }) => {
    const countBefore = await page.locator("[data-session-id]").count();
    const input = page.getByPlaceholder("新規セッション...");
    await input.press("Enter");

    // カード数が変わらない
    await expect(page.locator("[data-session-id]")).toHaveCount(countBefore);
  });

  test("作成されたセッションは実行中カラムに表示される", async ({ page }) => {
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("running-test");
    await input.press("Enter");
    await page.waitForTimeout(3000);

    // ヘッダーのRUNNINGカウントが1以上
    await expect(page.getByText(/[1-9]\d* RUNNING/)).toBeVisible();
  });
});
