import { Page, Locator } from "@playwright/test";

export class ProfilePage {
    readonly page: Page;
    readonly logoutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.logoutButton = page.locator('text=Log Out');
    }

    // Method to logout
    async logout() {
        await this.logoutButton.click();
        await this.page.waitForSelector('input[value="Log In"]');
    }
}