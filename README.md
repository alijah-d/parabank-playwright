# ParaBank Playwright Test Automation

A comprehensive test automation framework for ParaBank banking application using Playwright with TypeScript.

## Test Scenarios

The main test covers:
1. User registration and login
2. Global navigation validation
3. Savings account creation
4. Account balance verification  
5. Fund transfers between accounts
6. Bill payment processing
7. Transaction search via API

## Setup

### Prerequisites
- Node.js (v16 or higher)
- pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run with UI (headed mode)
npx playwright test --headed

# Run specific test file
npx playwright test ui-scenarios.spec.ts
npx playwright test api-scenarios.spec.ts

# Run with debug mode
npx playwright test --debug
```

## Project Structure

```
├── pages/                          # Page Object Models
│   ├── Homepage.ts                 # Homepage interactions
│   ├── Register.ts                 # User registration
│   ├── Profile.ts                  # User profile management
│   ├── GlobalNavigation.ts         # Main navigation
│   └── AccountServices/            # Banking features
│       ├── OpenAccount.ts          # Account creation
│       ├── AccountsOverview.ts     # Balance validation
│       ├── TransferFunds.ts        # Money transfers
│       └── BillPay.ts              # Bill payment
├── tests/                          # Test specifications
│   └── ui-scenarios.spec.ts        # Main test suite
├── utils/                          # Utility functions
│   └── config.ts                   # Configuration
└── playwright.config.ts            # Playwright configuration
```

## Configuration

Environment variables can be set in `.env`:
```
BASE_URL=https://parabank.parasoft.com/parabank
```

## Reports

Test results and screenshots are saved in `test-results/` directory.