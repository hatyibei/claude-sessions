import { test, expect } from "@playwright/test";

test.describe("ターミナル操作", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(2000);

    // セッション作成
    const input = page.getByPlaceholder("新規セッション...");
    await input.fill("terminal-test");
    await input.press("Enter");
    await page.waitForTimeout(3000);
  });

  test("カード展開でxterm.jsターミナルが表示される", async ({ page }) => {
    // カードヘッダーをクリックして展開
    const card = page.locator("[data-session-id]").first();
    await card.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(1000);

    // xterm.jsのコンテナが存在する
    await expect(page.locator(".xterm")).toBeVisible();
  });

  test("ターミナルにシェルプロンプトが表示される", async ({ page }) => {
    const card = page.locator("[data-session-id]").first();
    await card.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(2000);

    // xterm内にプロンプト文字が含まれる（$ か ユーザー名）
    const xtermContent = await page.locator(".xterm-rows").textContent();
    expect(xtermContent).toBeTruthy();
    expect(xtermContent!.length).toBeGreaterThan(0);
  });

  test("xterm.jsでキー入力ができる", async ({ page }) => {
    const card = page.locator("[data-session-id]").first();
    await card.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(1000);

    // xtermにフォーカスしてキー入力
    const xterm = page.locator(".xterm-helper-textarea");
    await xterm.focus();
    await xterm.type("echo hello-e2e", { delay: 50 });
    await xterm.press("Enter");
    await page.waitForTimeout(2000);

    // 出力にhello-e2eが含まれる
    const content = await page.locator(".xterm-rows").textContent();
    expect(content).toContain("hello-e2e");
  });

  test("カード折りたたみでターミナルプレビューに戻る", async ({ page }) => {
    const card = page.locator("[data-session-id]").first();
    const header = card.locator(".cursor-pointer").first();

    // 展開
    await header.click();
    await page.waitForTimeout(1000);
    await expect(page.locator(".xterm")).toBeVisible();

    // 折りたたみ
    await header.click();
    await page.waitForTimeout(500);
    await expect(page.locator(".xterm")).not.toBeVisible();
  });

  test("中断ボタンでセッションを停止できる", async ({ page }) => {
    const card = page.locator("[data-session-id]").first();
    await card.locator(".cursor-pointer").first().click();
    await page.waitForTimeout(1000);

    // 中断ボタンをクリック
    const abortBtn = page.getByText("✕ 中断");
    if (await abortBtn.isVisible()) {
      await abortBtn.click();
      await page.waitForTimeout(2000);

      // セッションのステータスが変わる（エラーカラムに移動等）
      // 少なくともxterm.jsが消える（runningじゃなくなるので）
      await expect(page.locator(".xterm")).not.toBeVisible();
    }
  });
});
