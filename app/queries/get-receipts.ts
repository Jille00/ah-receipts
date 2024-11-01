import { AuthTokens } from "@/types/AuthTokens";
import { fetchWithRefresh } from "@/utils/fetch-refresh";

export const fetchReceipts = async (
    tokens: AuthTokens,
    setTokens: (tokens: AuthTokens | null) => void,
) => {
    if (!tokens) return;

    try {
        const response = await fetchWithRefresh(
            "https://api.ah.nl/mobile-services/v1/receipts",
            tokens,
            setTokens,
        );
        if (!response) return;

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching receipts:", error);
    }
};
