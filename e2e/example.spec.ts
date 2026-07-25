import { test, expect } from "@playwright/test"

test.describe("TrustFlow AI", () => {
  test("homepage redirects to signin when unauthenticated", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveURL(/\/auth\/signin/)
  })

  test("signin page loads", async ({ page }) => {
    await page.goto("/auth/signin")
    await expect(page.locator("h1")).toContainText(/sign.?in/i)
  })
})
