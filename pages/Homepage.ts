import { expect, Locator, Page } from "@playwright/test";
import { config } from "../utils/config";

export class Homepage {
    readonly page: Page;

    readonly usernameInputBox: Locator;
    readonly passwordInputBox: Locator;
    readonly loginButton: Locator;
    readonly registerLink: Locator;

    constructor(page: Page) {
        this.page = page;

        this.usernameInputBox = page.locator('input[name="username"]');
        this.passwordInputBox = page.locator('input[name="password"]');
        this.loginButton = page.locator('input[value="Log In"]');
        this.registerLink = page.locator('text=Register');
    }

    // Method to navigate to the base URL
    async goToBaseUrl() {
        // Navigate to the base URL
        await this.page.goto(`${config.common.baseUrl}`);
    }

    // Method to login account
    async loginAccount({ login, password }: { login: string; password: string; }) {
        await expect(this.usernameInputBox).toBeVisible(); 
        await this.usernameInputBox.fill(login);
        await this.passwordInputBox.fill(password);
        await this.loginButton.click();
        await expect(this.page).toHaveURL(/.*overview.*/);
    }

    // Method to click on the register link
    async clickRegisterLink() {
        await expect(this.registerLink).toBeVisible();
        await this.registerLink.click();
        await expect(this.page).toHaveURL(/.*register.*/);
    }
}