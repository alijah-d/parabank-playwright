import { expect, Locator, Page } from "@playwright/test";

interface BillPayFormData {
    payeeName: string;
    amount: string;
    accountNumber: string;
}

export class BillPayPage {
    readonly page: Page;

    private savedFormData: BillPayFormData | null = null;

    // Form elements
    private readonly fieldLocators = {
        payeeName: "input[name='payee.name']",
        address: "input[name='payee.address.street']", 
        city: "input[name='payee.address.city']",
        state: "input[name='payee.address.state']",
        zipCode: "input[name='payee.address.zipCode']",
        phone: "input[name='payee.phoneNumber']",
        accountNumber: "input[name='payee.accountNumber']",
        verifyAccount: "input[name='verifyAccount']",
        amount: "input[name='amount']"
    };

    readonly billPayLink: Locator;
    readonly sendPaymentButton: Locator;
    readonly fromAccountDropdown: Locator;

    // Heading and messages
    readonly paymentCompleteTitle: Locator;
    readonly paymentAmountResult: Locator;
    readonly paymentAccountResult: Locator;

    constructor(page: Page) {
        this.page = page;
        this.billPayLink = page.locator('a[href="billpay.htm"]');
        this.sendPaymentButton = page.locator('input[value="Send Payment"]');
        this.fromAccountDropdown = page.locator(".fromAccountId");

        // Heading and messages
        this.paymentCompleteTitle = page.locator('h1').filter({ hasText: 'Bill Payment Complete' });
        this.paymentAmountResult = page.locator('#amount');
        this.paymentAccountResult = page.locator('#fromAccountId');
    }

    async goToBillPayLink() {
        await this.billPayLink.click();
        await expect(this.page).toHaveURL(/.*billpay.*/);
    }

    async fillBillPayForm() {
        const { faker } = await import('@faker-js/faker');

        const data = {
            payeeName: faker.person.fullName(),
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            phone: faker.phone.number(),
            accountNumber: faker.string.numeric(10),
            amount: faker.finance.amount({ min: 5, max: 50 }), // Random amount between 5 and 50
        };
        const verifyAccount = data.accountNumber;

        // Fill all fields dynamically
        for (const [field, selector] of Object.entries(this.fieldLocators)) {
            const value = field === 'verifyAccount' ? verifyAccount : data[field as keyof typeof data];
            if (value) {
                await this.page.locator(selector).fill(value);
            }
        }

        // Save form data for later assertions
        this.savedFormData = {
            payeeName: data.payeeName,
            amount: data.amount,
            accountNumber: data.accountNumber
        };
    }

    getSavedFormData(): BillPayFormData | null {
        return this.savedFormData;
    }

    /**
     * Selects an account from the "fromAccountId" dropdown by its value.
     * @param accountId The account number to select (e.g. "15342").
     */
    async selectFromAccount(accountId: string) {
        await this.page.locator('select').selectOption(accountId);
    }

    async submitBillPayForm() {
        await this.sendPaymentButton.click({ delay: 1000 });
    }

    async assertPaymentSuccess(accountId: string) {
        await expect(this.paymentCompleteTitle).toBeVisible();
        await expect(this.paymentAmountResult).toHaveText(`$${this.getSavedFormData()!.amount}`);
        await expect(this.paymentAccountResult).toHaveText(accountId);
    }
}