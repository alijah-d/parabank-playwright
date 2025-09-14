import { expect, Locator, Page } from "@playwright/test";

export class MainNavigation {
    readonly page: Page;

    // Global Navigation Elements
    readonly homeLink: Locator;
    readonly aboutLink: Locator;
    readonly contactLink: Locator;

    // Brand/Logo
    readonly parabankLogo: Locator;
    readonly adminIcon: Locator;

    constructor(page: Page) {
        this.page = page;

        // Global Navigation
        this.homeLink = page.locator('li.home > a').filter({ hasText: /^home$/i });
        this.aboutLink = page.locator('li.aboutus > a').filter({ hasText: /^about$/i });
        this.contactLink = page.locator('li.contact > a').filter({ hasText: /^contact$/i });

        // Brand/Logo elements
        this.parabankLogo = page.locator('img[alt="ParaBank"]');
        this.adminIcon = page.locator('img[src="images/clear.gif"]');
    }

    async clickHome() {
        await expect(this.homeLink).toBeVisible();
        await this.homeLink.click();
        await expect(this.page).toHaveURL(/.*index.*|.*\/$|.*parabank\/$|.*parabank$/);
    }

    async clickAbout() {
        await expect(this.aboutLink).toBeVisible();
        await this.aboutLink.click();
        await expect(this.page).toHaveURL(/.*about.*/);
    }

    async clickContact() {
        await expect(this.contactLink).toBeVisible();
        await this.contactLink.click();
        await expect(this.page).toHaveURL(/.*contact.*/);
    }

    async clickParaBankLogo() {
        await expect(this.parabankLogo).toBeVisible();
        await this.parabankLogo.click();
        await expect(this.page).toHaveURL(/.*index.*|.*\/$|.*parabank\/$|.*parabank$/);
    }
}
