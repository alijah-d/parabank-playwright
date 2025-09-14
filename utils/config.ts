type commonConfig = {
    baseUrl: string;
}

type loginConfig = {
    user: string;
    password: string;
}

type AppConfig = {
    common: commonConfig;
    login: loginConfig;
}

// Configuration used to set up the base URL and login credentials for the application
export const config: AppConfig = {
    common: {
        baseUrl: process.env['BASE_URL'] || ''
    },
    login: {
        user: process.env['LOGIN'] || '',
        password: process.env['PASSWORD'] || ''
    }
};