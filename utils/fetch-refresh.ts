import { AuthTokens } from "@/types/AuthTokens";

export const fetchWithRefresh = async (
    url: string,
    tokens: AuthTokens,
    setTokens: (tokens: AuthTokens | null) => void,
) => {
    if (!tokens) return null;

    try {
        const response = await fetch(url, {
            headers: {
                "User-Agent": "Appie/8.22.3",
                Authorization: `Bearer ${tokens.access_token}`,
            },
        });

        if (response.status === 401) {
            const newToken = await refreshAccessToken(tokens, setTokens);
            if (!newToken) return null;

            return fetch(url, {
                headers: {
                    "User-Agent": "Appie/8.22.3",
                    Authorization: `Bearer ${newToken}`,
                },
            });
        }

        return response;
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
};

const refreshAccessToken = async (
    tokens: AuthTokens,
    setTokens: (tokens: AuthTokens | null) => void,
) => {
    if (!tokens?.refresh_token) return null;

    try {
        const response = await fetch(
            "https://api.ah.nl/mobile-auth/v1/auth/token/refresh",
            {
                method: "POST",
                headers: {
                    "User-Agent": "Appie/8.22.3",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientId: "appie",
                    refreshToken: tokens.refresh_token,
                }),
            },
        );

        if (!response.ok) {
            throw new Error("Token refresh failed");
        }

        const newTokens = await response.json();
        setTokens(newTokens);
        return newTokens.access_token;
    } catch (error) {
        console.error("Error refreshing token:", error);
        setTokens(null);
        localStorage.removeItem("ah_tokens");
        return null;
    }
};
