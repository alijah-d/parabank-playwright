import { test, expect, type APIRequestContext } from "@playwright/test";
import { config } from "../utils/config";
import postRequest from "./api-test-data/post_request.json";
import tokenRequest from "./api-test-data/token_request.json";

test.use({
  baseURL: `${config.api.baseUrl}`
})

test.describe("API Tests for Booking", () => {
    test("should create, retrieve, update, and delete a booking", async ({ request }: { request: APIRequestContext }) => {
        let tokenNo: string | null = null;

        const postAPIResponse = await test.step('Create booking', async () => {
            return await request.post("/booking", {
                data: postRequest,
            });
        });

        const bookingId = await postAPIResponse.json();
        const bId = bookingId.bookingid;

        let getAPIResponse = await test.step('Get booking details', async () => {
            return await request.get("/booking/", {
                params: {
                    firstname: "First Ever Tester",
                    lastname: "Last Ever Tester",
                }
            });
        });

        await test.step('Validate status code of get booking details', async () => {
            console.log(await getAPIResponse.json());
            expect(getAPIResponse.ok()).toBeTruthy();
            expect(getAPIResponse.status()).toBe(200);
        });

        const tokenAPIResponse = await test.step('Generate token', async () => {
            return await request.post("/auth", {
                data: tokenRequest,
            });
        });

        await test.step('Validate status code of generated token', async () => {
            const tokenBody = await tokenAPIResponse.json();
            expect(tokenAPIResponse.status()).toBe(200);
            expect(tokenBody).toHaveProperty('token');
            expect(typeof tokenBody.token).toBe('string');
            expect(tokenBody.token.length).toBeGreaterThan(0);

            console.log(await tokenAPIResponse.json());
            const tokenResponseBody = await tokenAPIResponse.json();
            tokenNo = tokenResponseBody.token;
        });

        const patchAPIResponse = await test.step('Partial update booking details & Validate status code', async () => {
            return await request.patch(`/booking/${bId}`, {
                headers: {
                    "Content-Type": "application/json",
                    Cookie: `token=${tokenNo}`,
                },
                data: {
                    firstname: "First Ever Tester",
                    lastname: "Last Ever Testerd",
                },
            });
        });

        await test.step('Validate status code of partial update booking details', async () => {
            expect(patchAPIResponse.status()).toBe(200);
            expect(patchAPIResponse.statusText()).toBe("OK");
            console.log(await patchAPIResponse.json());
        });

        const deleteAPIResponse = await test.step('Delete booking', async () => {
            return await request.delete(`/booking/${bId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Cookie": `token=${tokenNo}`,
                },
            });
        });

        await test.step('Validate status code of delete booking', async () => {
            expect(deleteAPIResponse.status()).toBe(201);
            expect(deleteAPIResponse.statusText()).toBe("Created");
            console.log(await deleteAPIResponse.text());
        });
    });
});