import { test, expect, Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { Homepage } from '../pages/Homepage';
import { RegisterPage } from '../pages/Register';
import { ProfilePage } from '../pages/Profile';
import { MainNavigation } from '../pages/GlobalNavigation';
import { OpenAccountPage } from '../pages/AccountServices/OpenAccount';
import { AccountsOverview } from '../pages/AccountServices/AccountsOverview';
import { TransferFundsPage } from '../pages/AccountServices/TransferFunds';
import { BillPayPage } from '../pages/AccountServices/BillPay';

let browser: Browser;
let context: BrowserContext;
let page: Page;

test.beforeAll(async () => {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
});

test.afterEach(async ({ }, testInfo) => {
  // Take screenshot if test failed
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshot = await page.screenshot({ path: `test-results/failure-${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}.png`, fullPage: true });
    await testInfo.attach('screenshot', { body: screenshot, contentType: 'image/png' });
  }
});

test.afterAll(async () => {
  await context.close();
  await browser.close();
});

test.describe('UI Test Scenarios', () => {
    test('should register a new user and transfer funds then pay the bill with account created', async () => {
        // Initialize page objects using shared page
        const homepage = new Homepage(page);
        const registerPage = new RegisterPage(page);
        const profilePage = new ProfilePage(page);

        const globalNav = new MainNavigation(page);

        const openAccountPage = new OpenAccountPage(page);
        const accountsOverviewPage = new AccountsOverview(page);
        const transferFundsPage = new TransferFundsPage(page);
        const billPayPage = new BillPayPage(page);

        // Step 1: Navigate to Para bank application.
        await homepage.goToBaseUrl();
        
        // Go to register link
        await homepage.clickRegisterLink();
        
        // Step 2: Create a new user from user registration page
        await registerPage.fillRegistrationForm();
        await registerPage.submitForm();
        
        // Verify registration was successful (wait for redirect or success message)
        await page.waitForSelector('text=Your account was created successfully. You are now logged in.');

        await profilePage.logout();
        
        // Go back to homepage
        await homepage.goToBaseUrl();
        
        // Get saved credentials from registration
        const credentials = registerPage.getSavedCredentials();
        expect(credentials).not.toBeNull();
        
        if (credentials) {
            // Step 3: Login with the registered credentials
            await homepage.loginAccount({
                login: credentials.username,
                password: credentials.password
            });
            
            // Verify login was successful
            await expect(page).toHaveURL(/.*overview.*|.*account.*/);
        }

        // Step 4: Verify if the Global navigation menu in home page is working as expected.
        await globalNav.clickContact();
        await expect(page).toHaveURL(/.*contact.*/);
        
        await globalNav.clickAbout();
        await expect(page).toHaveURL(/.*about.*/);

        await globalNav.clickHome();
        await expect(page).toHaveURL(/.*index.*|.*\/$|.*parabank\/$|.*parabank$/);
        
        // Navigate to Open New Account page
        await openAccountPage.goToOpenAccountPage();

        // Step 5: Create a Savings account from “Open New Account Page” and capture the account number.
        const newAccountNumber = await openAccountPage.createSavingsAccount();

        // Step 6: Validate if Accounts overview page is displaying the balance details as expected.
        await accountsOverviewPage.goToAccountsOverview();
        await accountsOverviewPage.validateBalanceDetails();

        // Step 7: Transfer funds from account created in step 5 to another account.
        if (newAccountNumber) {
            // Navigate to Transfer Funds page
            await transferFundsPage.goToTransferFundsPage();
            
            // Transfer $50 to the new account
            await transferFundsPage.transferFiftyDollarsToNewAccount(newAccountNumber);
            await transferFundsPage.assertTransferComplete();

            // Step 8: Pay a bill to the newly created account in step 5 and verify the payment is successful.
            await billPayPage.goToBillPayLink();
            await billPayPage.fillBillPayForm();
            await billPayPage.selectFromAccount(newAccountNumber);
            await billPayPage.submitBillPayForm();
            await billPayPage.assertPaymentSuccess(newAccountNumber);

            // Step 9: Search transactions using API request by amount
            const paymentData = billPayPage.getSavedFormData();
            if (paymentData) {
                const apiResponse = await page.request.get(
                    `https://parabank.parasoft.com/parabank/services_proxy/bank/accounts/${newAccountNumber}/transactions/amount/${paymentData.amount}?timeout=30000`
                );
                
                expect(apiResponse.status()).toBe(200);
                const transactions = await apiResponse.json();
                expect(Array.isArray(transactions)).toBe(true);
                expect(transactions.length).toBeGreaterThan(0);
            }
        }
    });
});