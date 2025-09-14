import { expect, Locator, Page } from "@playwright/test";

export class OpenAccountPage {
    readonly page: Page;
    private capturedAccountNumber: string | null = null;

    // Navigation
    readonly openAccountLink: Locator;

    // Form elements
    readonly accountTypeDropdown: Locator;
    readonly fromAccountDropdown: Locator;
    readonly openAccountButton: Locator;

    // Success elements
    readonly successMessage: Locator;
    readonly newAccountId: Locator;
    readonly pageHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation
        this.openAccountLink = page.locator('a[href="openaccount.htm"]');

        // Form elements
        this.accountTypeDropdown = page.locator('#type');
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.openAccountButton = page.locator('input[value="Open New Account"]');

        // Success elements
        this.successMessage = page.locator('#openAccountResult > p:nth-child(2)');
        this.newAccountId = page.locator('#newAccountId');
        this.pageHeading = page.locator('h1').filter({ hasText: /open.*account/i });
    }

    // Navigate to Open New Account page
    async goToOpenAccountPage() {
        await this.openAccountLink.click();
        await expect(this.page).toHaveURL(/.*openaccount.*/);
        await expect(this.pageHeading).toBeVisible();
    }

    // Create a Savings account and capture account number
    async createSavingsAccount(): Promise<string | null> {
        // Select Savings account type (value "1")
        await expect(this.accountTypeDropdown).toBeVisible();
        await this.accountTypeDropdown.selectOption('1');

        // Select the first available account to transfer from
        await expect(this.fromAccountDropdown).toBeVisible();
        const accountOptions = await this.fromAccountDropdown.locator('option').all();
        if (accountOptions.length > 1) {
            const firstAccountValue = await accountOptions[1].getAttribute('value');
            if (firstAccountValue) {
                await this.fromAccountDropdown.selectOption(firstAccountValue);
            }
        }

        // Click Open New Account button with long click
        await expect(this.openAccountButton).toBeVisible();
        await expect(this.openAccountButton).toBeEnabled();
        
        // Workaround - simple click doesn't work due to JS issues
        await this.openAccountButton.click({ delay: 1000 });
        
        // Wait a moment for the form submission to process
        await this.page.waitForTimeout(1000);

        // Wait for success and capture account number
        await expect(this.successMessage).toBeVisible({ timeout: 10000 });
        
        if (await this.newAccountId.isVisible()) {
            const accountNumber = await this.newAccountId.textContent();
            if (accountNumber) {
                this.capturedAccountNumber = accountNumber.trim();
                return this.capturedAccountNumber;
            }
        }

        return null;
    }

    // Get the captured account number
    getCapturedAccountNumber(): string | null {
        return this.capturedAccountNumber;
    }

    // Verify the savings account was created successfully
    async verifySavingsAccountCreated(): Promise<boolean> {
        try {
            await expect(this.successMessage).toBeVisible();
            return this.capturedAccountNumber !== null;
        } catch {
            return false;
        }
    }
}