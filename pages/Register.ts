import { Page, Locator } from '@playwright/test';

interface UserCredentials {
    username: string;
    password: string;
}

export class RegisterPage {
    readonly page: Page;
    readonly submitButton: Locator;
    
    private savedCredentials: UserCredentials | null = null;
    
    private readonly fieldSelectors = {
        firstName: 'input[name="customer.firstName"]',
        lastName: 'input[name="customer.lastName"]',
        address: 'input[name="customer.address.street"]',
        city: 'input[name="customer.address.city"]',
        state: 'input[name="customer.address.state"]',
        zipCode: 'input[name="customer.address.zipCode"]',
        phone: 'input[name="customer.phoneNumber"]',
        ssn: 'input[name="customer.ssn"]',
        username: 'input[name="customer.username"]',
        password: 'input[name="customer.password"]',
        confirmPassword: 'input[name="repeatedPassword"]'
    };

    constructor(page: Page) {
        this.page = page;
        this.submitButton = page.locator('input[value="Register"]');
    }

    async fillRegistrationForm() {
        // Dynamic import for faker to handle ES module
        const { faker } = await import('@faker-js/faker');
        
        const randomSuffix = faker.string.alphanumeric(6); // Add a random suffix for uniqueness
        const data = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            address: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state(),
            zipCode: faker.location.zipCode(),
            phone: faker.phone.number(),
            ssn: faker.string.numeric(9),
            //username: `${faker.internet.username()}_${randomSuffix}`, // Append random suffix to username
            username: `user_${randomSuffix}`, // Simpler username format
            password: faker.internet.password(), 
        };
        
        const confirmPassword = data.password;

        // Fill all fields dynamically
        for (const [field, selector] of Object.entries(this.fieldSelectors)) {
            const value = field === 'confirmPassword' ? confirmPassword : data[field as keyof typeof data];
            if (value) {
                await this.page.locator(selector).fill(value);
            }
        }

        // Save credentials for later use
        this.savedCredentials = {
            username: data.username,
            password: data.password
        };
    }

    getSavedCredentials(): UserCredentials | null {
        return this.savedCredentials;
    }

    // Method to submit the registration form
    async submitForm() {
        await this.submitButton.click();
        const username = this.savedCredentials?.username;
        if (username) {
            await this.page.waitForSelector(`text=Welcome ${username}`);
        }
        await this.page.waitForSelector('text=Your account was created successfully. You are now logged in.');
    }
}