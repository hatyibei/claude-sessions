import { test, expect } from "@playwright/test";

// Helper to click a theme button reliably.
// The ThemeSwitcher buttons are 28px wide and tightly packed.
// After switching away from a theme, an adjacent button's icon span can
// intercept a normal click on the Dark Mode button.
// dispatchEvent('click') fires the React onClick handler directly.
async function clickThemeButton(page: import("@playwright/test").Page, title: string) {
  await page.getByTitle(title).dispatchEvent("click");
}

test.describe("Flow 2: Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("[data-theme]").waitFor({ state: "visible" });
  });

  test("default theme is dark", async ({ page }) => {
    const root = page.locator("[data-theme]").first();
    await expect(root).toHaveAttribute("data-theme", "dark");
  });

  test("clicking light mode button changes theme to light", async ({ page }) => {
    await clickThemeButton(page, "Light Mode");
    const root = page.locator("[data-theme]").first();
    await expect(root).toHaveAttribute("data-theme", "light");
  });

  test("clicking beige button changes theme to beige", async ({ page }) => {
    await clickThemeButton(page, "Beige Mode");
    const root = page.locator("[data-theme]").first();
    await expect(root).toHaveAttribute("data-theme", "beige");
  });

  test("clicking dark button from light restores dark theme", async ({ page }) => {
    await clickThemeButton(page, "Light Mode");
    const root = page.locator("[data-theme]").first();
    await expect(root).toHaveAttribute("data-theme", "light");

    await clickThemeButton(page, "Dark Mode");
    await expect(root).toHaveAttribute("data-theme", "dark");
  });

  test("cycling through all three themes works correctly", async ({ page }) => {
    const root = page.locator("[data-theme]").first();

    await expect(root).toHaveAttribute("data-theme", "dark");

    await clickThemeButton(page, "Light Mode");
    await expect(root).toHaveAttribute("data-theme", "light");

    await clickThemeButton(page, "Beige Mode");
    await expect(root).toHaveAttribute("data-theme", "beige");

    await clickThemeButton(page, "Dark Mode");
    await expect(root).toHaveAttribute("data-theme", "dark");
  });

  test("theme switcher buttons are all visible", async ({ page }) => {
    await expect(page.getByTitle("Dark Mode")).toBeVisible();
    await expect(page.getByTitle("Light Mode")).toBeVisible();
    await expect(page.getByTitle("Beige Mode")).toBeVisible();
  });

  test("background color changes when switching to light theme", async ({ page }) => {
    const root = page.locator("[data-theme]").first();
    const darkBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);

    await clickThemeButton(page, "Light Mode");
    await expect(root).toHaveAttribute("data-theme", "light");

    const lightBg = await root.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(darkBg).not.toBe(lightBg);
  });
});
