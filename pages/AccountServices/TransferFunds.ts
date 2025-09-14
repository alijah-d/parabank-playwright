import { expect, Locator, Page } from "@playwright/test";

export class TransferFundsPage {
    readonly page: Page;
    
    // Form elements
    readonly amountInputBox: Locator;
    readonly fromAccountDropdown: Locator;
    readonly toAccountDropdown: Locator;
    readonly transferButton: Locator;

    // Heading and messages
    readonly pageHeading: Locator;
    readonly successMessage: Locator;
    readonly errorMessage: Locator;
    readonly transferCompleteTitle: Locator;
    readonly transferAmountResult: Locator;

    constructor(page: Page) {
        this.page = page;

        // Form elements
        this.amountInputBox = page.locator('#amount');
        this.fromAccountDropdown = page.locator('#fromAccountId');
        this.toAccountDropdown = page.locator('#toAccountId');
        this.transferButton = page.locator('input[value="Transfer"]');

        // Heading and messages
        this.pageHeading = page.locator('h1').filter({ hasText: /transfer.*funds/i });
        this.transferCompleteTitle = page.locator('h1.title').filter({ hasText: 'Transfer Complete!' });
        this.transferAmountResult = page.locator('#amountResult');
    }

    // Navigate to Transfer Funds page
    async goToTransferFundsPage() {
        await this.page.locator('a[href="transfer.htm"]').click();
        await expect(this.page).toHaveURL(/.*transfer.*/);
        await expect(this.pageHeading).toBeVisible();
    }

    // Transfer $50 from old account to new account
    async transferFiftyDollarsToNewAccount(newAccountNumber: string) {
        // Enter amount
        await this.amountInputBox.fill('50');

        // Select old account as source (first account with value)
        const oldAccount = await this.fromAccountDropdown.locator('option[value]:not([value=""])').first().getAttribute('value');
        await this.fromAccountDropdown.selectOption(oldAccount);

        // Select new account as destination
        await this.toAccountDropdown.selectOption(newAccountNumber);

        // Click transfer
        await this.transferButton.click();

        // Wait for confirmation
        await expect(this.transferCompleteTitle).toBeVisible();
    }

    // Simple assertion for successful transfer
    async assertTransferComplete() {
        await expect(this.transferCompleteTitle).toBeVisible();
        await expect(this.transferAmountResult).toHaveText('$50.00');
    }
}