import { AuthTokens } from "@/types/AuthTokens";
import { fetchWithRefresh } from "@/utils/fetch-refresh";

export const fetchReceiptDetails = async (
    transactionId: string,
    tokens: AuthTokens,
    setTokens: (tokens: AuthTokens | null) => void,
) => {
    try {
        const response = await fetchWithRefresh(
            `https://api.ah.nl/mobile-services/v2/receipts/${transactionId}`,
            tokens,
            setTokens,
        );
        if (!response) return;

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching receipt details:", error);
    }
};
