import { test, expect } from "@playwright/test";

// InlineCommandInput placeholders use actual Japanese text (from JSX expression `${sessionName} \u306B\u6307\u793A...`)
// The \u306B\u6307\u793A part is a JS string escape, so it renders as actual Unicode: に指示...

test.describe("Flow 4: Inline Command Input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByText("feature/auth-refactor").waitFor({ state: "visible" });
  });

  test("running session feature/auth-refactor has command input", async ({ page }) => {
    const commandInput = page.getByPlaceholder("feature/auth-refactor に指示...");
    await expect(commandInput).toBeVisible();
  });

  test("fix/memory-leak running session has command input", async ({ page }) => {
    await expect(page.getByPlaceholder("fix/memory-leak に指示...")).toBeVisible();
  });

  test("test/e2e-suite running session has command input", async ({ page }) => {
    await expect(page.getByPlaceholder("test/e2e-suite に指示...")).toBeVisible();
  });

  test("queued session docs/api-reference has command input", async ({ page }) => {
    await expect(page.getByPlaceholder("docs/api-reference に指示...")).toBeVisible();
  });

  test("queued session maintenance/dep-update has command input", async ({ page }) => {
    await expect(page.getByPlaceholder("maintenance/dep-update に指示...")).toBeVisible();
  });

  test("typing a command and pressing Enter appends it to terminal output", async ({ page }) => {
    const commandInput = page.getByPlaceholder("feature/auth-refactor に指示...");
    await commandInput.click();
    await commandInput.fill("git status");
    await commandInput.press("Enter");

    // Mock mode appends "> command" to the session output
    await expect(page.getByText("> git status")).toBeVisible();
  });

  test("input field is cleared after submitting a command", async ({ page }) => {
    const commandInput = page.getByPlaceholder("feature/auth-refactor に指示...");
    await commandInput.click();
    await commandInput.fill("test command");
    await commandInput.press("Enter");

    await expect(commandInput).toHaveValue("");
  });

  test("empty/whitespace-only command does not submit", async ({ page }) => {
    const commandInput = page.getByPlaceholder("feature/auth-refactor に指示...");
    await commandInput.click();

    // Count visible terminal output lines before
    const outputBefore = await page.locator(".text-th-term-cmd, .text-th-term-ok, .text-th-term-run, .text-th-term-info").count();

    await commandInput.fill("   ");
    await commandInput.press("Enter");

    // Output count should be unchanged (empty trimmed string rejected)
    const outputAfter = await page.locator(".text-th-term-cmd, .text-th-term-ok, .text-th-term-run, .text-th-term-info").count();
    expect(outputAfter).toBe(outputBefore);
  });

  test("multiple commands can be submitted sequentially", async ({ page }) => {
    const commandInput = page.getByPlaceholder("feature/auth-refactor に指示...");

    await commandInput.click();
    await commandInput.fill("first command");
    await commandInput.press("Enter");

    await commandInput.fill("second command");
    await commandInput.press("Enter");

    await expect(page.getByText("> first command")).toBeVisible();
    await expect(page.getByText("> second command")).toBeVisible();
  });

  test("command for one session does not appear in another session", async ({ page }) => {
    // Send a command to feature/auth-refactor
    const authInput = page.getByPlaceholder("feature/auth-refactor に指示...");
    await authInput.click();
    await authInput.fill("unique-command-xyz");
    await authInput.press("Enter");

    await expect(page.getByText("> unique-command-xyz")).toBeVisible();

    // The memory-leak terminal should NOT show this command
    // (It's a different session's output area)
    const memLeakCard = page.locator(".rounded-lg").filter({ hasText: "fix/memory-leak" }).first();
    await expect(memLeakCard.getByText("> unique-command-xyz")).not.toBeVisible();
  });
});
