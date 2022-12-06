import connectionPool from "../../config/db";
import routeHandler from "../../pages/api/urls";
import {
    createMocks,
    RequestMethod,
    MockRequest,
    MockResponse,
} from "node-mocks-http";
import { NextApiRequest, NextApiResponse } from "next";

const originalUrl = "http://www.example.com";

describe("on POST", () => {
    describe("validation", () => {
        it("returns http status code 400 on originalUrl undefined", async () => {
            const { req: request, res: response } =
                mockRequestAndResponse("POST");
            await routeHandler(request, response);
            const { message } = getFromBody(response);

            expect(response.statusCode).toBe(400);
            expect(message).toBe("originalUrl field must be provided");
        });
        it("returns http status code 400 on empty originalUrl", async () => {
            const { req: request, res: response } =
                mockRequestAndResponse("POST");
            request.body = { originalUrl: "" };

            await routeHandler(request, response);
            const { message } = getFromBody(response);

            expect(response.statusCode).toBe(400);
            expect(message).toBe("originalUrl field can not be empty");
        });
        it("returns http status code 400 on originalUrl longer than max length", async () => {
            const { req: request, res: response } =
                mockRequestAndResponse("POST");
            request.body = { originalUrl: createMaxLengthUrl(originalUrl) };

            await routeHandler(request, response);
            const { message } = getFromBody(response);

            expect(response.statusCode).toBe(400);
            expect(message).toBe("originalUrl field is too long");
        });
        it("returns http status code 400 on invalid originalUrl", async () => {
            const { req: request, res: response } =
                mockRequestAndResponse("POST");
            request.body = { originalUrl: "not a url" };

            await routeHandler(request, response);
            const { message } = getFromBody(response);

            expect(response.statusCode).toBe(400);
            expect(message).toBe("originalUrl field is invalid");
        });
    });

    describe("behaviour", () => {
        let request: MockRequest<NextApiRequest>;
        let response: MockResponse<NextApiResponse<any>>;
        beforeAll(async () => {
            await connectionPool.query("TRUNCATE TABLE urls");
        });
        beforeEach(async () => {
            const { req, res } = mockRequestAndResponse("POST");
            request = req;
            response = res;
            request.body = { originalUrl };
            await routeHandler(request, response);
        });
        afterEach(async () => {
            await connectionPool.query("TRUNCATE TABLE urls");
        });

        it("returns http status code 201", async () => {
            expect(response.statusCode).toBe(201);
        });
        it("inserts into db.urls table", async () => {
            const [selectRows, _] = await connectionPool.query(
                "SELECT original_url AS originalUrl FROM urls WHERE original_url = ?;",
                originalUrl
            );
            expect(selectRows).toEqual([
                {
                    originalUrl,
                },
            ]);
        });
        it("creates a new shortened URL with new row id on db.urls table", async () => {
            const { shortenedUrl } = getFromBody(response);

            const domainNameLength = process.env.DOMAIN_NAME?.length!;
            const expectedLength = domainNameLength + 4;
            expect(shortenedUrl.length).toBe(expectedLength);
            expect(shortenedUrl).toMatch(
                new RegExp(`${process.env.DOMAIN_NAME}[a-zA-Z0-9]{4}`)
            );
        });
        it("updates `shortened_url` field on new row on db.urls table with the new shortened URL", async () => {
            const { shortenedUrl } = getFromBody(response);
            const [selectRows, _] = await connectionPool.query(
                "SELECT shortened_url AS `shortenedUrl` FROM urls WHERE shortened_url = ?;",
                shortenedUrl
            );
            expect(selectRows).toEqual([{ shortenedUrl }]);
        });
        it("creates different urls for two consecutive requests", async () => {
            const { shortenedUrl: shortenedUrl1 } = getFromBody(response);
            const { req: request2, res: response2 } =
                mockRequestAndResponse("POST");
            request2.body = {
                originalUrl: "https://www.example2.com",
            };
            await routeHandler(request2, response2);
            const { shortenedUrl: shortenedUrl2 } = getFromBody(response2);

            expect(shortenedUrl1).not.toEqual(shortenedUrl2);
        });
    });
});

function mockRequestAndResponse(method: RequestMethod = "GET") {
    return createMocks<NextApiRequest, NextApiResponse>({
        method: method,
        headers: {
            "content-type": "application/json",
        },
    });
}
//TODO refactor these helper methods
function getFromBody(res: MockResponse<NextApiResponse<any>>) {
    return res._getJSONData();
}

function createMaxLengthUrl(url: string) {
    const MAX_LENGTH = 2048;
    return (
        url +
        "/" +
        Array.from(Array(MAX_LENGTH))
            .map(() => "a")
            .join("")
    );
}
