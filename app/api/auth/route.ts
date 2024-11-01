// app/api/auth/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password are required" },
                { status: 400 },
            );
        }

        console.log("Starting login process for:", username);

        const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: { width: 1280, height: 800 },
        });

        try {
            const page = await browser.newPage();
            await page.setViewport({ width: 1280, height: 800 });

            // Set headers
            await page.setExtraHTTPHeaders({
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9,nl;q=0.8",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                "sec-ch-ua":
                    '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
            });

            // Create a promise to capture the code from console
            const codePromise = new Promise<string>((resolve, reject) => {
                page.on("console", (msg) => {
                    const text = msg.text();
                    console.log("Browser console:", text);

                    if (text.includes("appie://login-exit?code=")) {
                        const code = text.match(/code=([^'"\s&]+)/)?.[1];
                        if (code) {
                            resolve(code);
                        }
                    }
                });

                // Set a timeout
                setTimeout(() => {
                    reject(new Error("Timeout waiting for authorization code"));
                }, 120000); // 2 minutes timeout
            });

            await page.goto(
                "https://login.ah.nl/secure/oauth/authorize?client_id=appie&redirect_uri=appie://login-exit&response_type=code",
                { waitUntil: "networkidle0" },
            );

            await page.waitForSelector("#username", { visible: true });
            await page.waitForSelector("#password", { visible: true });

            await page.type("#username", username);
            await page.type("#password", password);

            console.log("Clicking submit button...");
            await page.click('button[type="submit"]');

            // Wait for either captcha or success
            try {
                await Promise.race([
                    page.waitForSelector('iframe[src*="hcaptcha.com"]', {
                        timeout: 5000,
                    }),
                    page.waitForNavigation({
                        waitUntil: "networkidle0",
                        timeout: 5000,
                    }),
                ]);
            } catch (error) {
                // Timeout is okay
                console.log("No captcha or navigation, continuing...", error);
            }

            // Check if captcha is present
            const captchaFrame = await page.$('iframe[src*="hcaptcha.com"]');
            if (captchaFrame) {
                console.log("Captcha detected, waiting for user to solve...");

                // Wait for navigation after captcha
                await page.waitForNavigation({
                    waitUntil: "networkidle0",
                    timeout: 120000,
                });
            }

            console.log("Waiting for code from console...");
            const code = await codePromise;
            console.log("Code captured:", code);

            // Get the access token
            const tokenResponse = await fetch(
                "https://api.ah.nl/mobile-auth/v1/auth/token",
                {
                    method: "POST",
                    headers: {
                        "User-Agent": "Appie/8.22.3",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        clientId: "appie",
                        code: code,
                    }),
                },
            );

            const tokenData = await tokenResponse.json();
            console.log("Successfully got access token");

            return NextResponse.json(tokenData);
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error("Error during login automation:", error);
        return NextResponse.json(
            {
                error: "Failed to authenticate",
                details: (error as Error).message,
            },
            { status: 500 },
        );
    }
}
