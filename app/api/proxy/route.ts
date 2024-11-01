import { NextRequest, NextResponse } from "next/server";

const AH_BASE_URL = "https://api.ah.nl";
const LOGIN_URL = "https://login.ah.nl";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { url, method = "GET", data } = body;

    const targetUrl = url.startsWith("http") ? url : `${AH_BASE_URL}${url}`;

    try {
        const response = await fetch(targetUrl, {
            method,
            headers: {
                "User-Agent": "Appie/8.22.3",
                "Content-Type": "application/json",
                ...(body.headers || {}),
            },
            ...(data ? { body: JSON.stringify(data) } : {}),
        });

        const responseData = await response.json();
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Proxy request failed" },
            { status: 500 },
        );
    }
}
