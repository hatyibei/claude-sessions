import { test, expect } from "@playwright/test";

async function clickThemeButton(page: import("@playwright/test").Page, title: string) {
  await page.getByTitle(title).dispatchEvent("click");
}

test.describe("テーマ切り替え", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-theme]").waitFor({ state: "visible" });
  });

  test("デフォルトテーマはダーク", async ({ page }) => {
    await expect(page.locator("[data-theme]").first()).toHaveAttribute("data-theme", "dark");
  });

  test("ライトモードに切り替え", async ({ page }) => {
    await clickThemeButton(page, "Light Mode");
    await expect(page.locator("[data-theme]").first()).toHaveAttribute("data-theme", "light");
  });

  test("ベージュモードに切り替え", async ({ page }) => {
    await clickThemeButton(page, "Beige Mode");
    await expect(page.locator("[data-theme]").first()).toHaveAttribute("data-theme", "beige");
  });

  test("全テーマを順番に切り替え", async ({ page }) => {
    const root = page.locator("[data-theme]").first();
    await expect(root).toHaveAttribute("data-theme", "dark");

    await clickThemeButton(page, "Light Mode");
    await expect(root).toHaveAttribute("data-theme", "light");

    await clickThemeButton(page, "Beige Mode");
    await expect(root).toHaveAttribute("data-theme", "beige");

    await clickThemeButton(page, "Dark Mode");
    await expect(root).toHaveAttribute("data-theme", "dark");
  });

  test("テーマ切り替えで背景色が変わる", async ({ page }) => {
    const root = page.locator("[data-theme]").first();
    const darkBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);

    await clickThemeButton(page, "Light Mode");
    const lightBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(darkBg).not.toBe(lightBg);
  });
});
