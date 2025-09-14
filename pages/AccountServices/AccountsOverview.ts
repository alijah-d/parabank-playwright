import { expect, Locator, Page } from "@playwright/test";

export class AccountsOverview {
    readonly page: Page;
    readonly accountsOverviewLink: Locator;
    readonly accountTable: Locator;
    readonly pageHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.accountsOverviewLink = page.locator('a[href="overview.htm"]');
        this.accountTable = page.locator('#accountTable');
        this.pageHeading = page.locator('h1').filter({ hasText: /accounts overview/i });
    }

    async goToAccountsOverview() {
        await this.accountsOverviewLink.click();
        await expect(this.page).toHaveURL(/.*overview.*/);
    }

    async validateBalanceDetails() {
        // Verify table structure
        await expect(this.pageHeading).toBeVisible();
        await expect(this.accountTable).toBeVisible();
        
        // Verify headers
        await expect(this.accountTable.locator('th').filter({ hasText: 'Account' })).toBeVisible();
        await expect(this.accountTable.locator('th').filter({ hasText: 'Balance*' })).toBeVisible();
        await expect(this.accountTable.locator('th').filter({ hasText: 'Available Amount' })).toBeVisible();
        
        // Verify account rows exist
        const accountRows = this.accountTable.locator('tbody tr').filter({ hasNot: this.page.locator('b') });
        await expect(accountRows.first()).toBeVisible();
        
        // Verify balance format (contains $ symbol)
        const balances = this.accountTable.locator('td').filter({ hasText: /^\$\d+\.\d{2}$/ });
        await expect(balances.first()).toBeVisible();
        
        // Verify total row
        await expect(this.accountTable.locator('b').filter({ hasText: 'Total' })).toBeVisible();
        
        return {
            accountCount: await accountRows.count(),
            hasValidBalances: await balances.count() > 0
        };
    }

    async getAccountBalance(accountNumber: string): Promise<string | null> {
        const accountRow = this.accountTable.locator(`a[href*="${accountNumber}"]`).locator('../..');
        const balanceCell = accountRow.locator('td').nth(1);
        return await balanceCell.textContent();
    }
}