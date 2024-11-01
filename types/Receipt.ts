export interface Receipt {
    transactionId: string;
    transactionMoment: string;
    total: {
        amount: {
            amount: number;
            currency: string;
        };
    };
    totalDiscount: {
        amount: number;
        currency: string;
    };
}

export interface DetailedReceipt {
    receiptUiItems: Array<{
        type: string;
        description?: string;
        amount?: string;
        quantity?: string;
        value?: string;
        label?: string;
        price?: string;
        alignment?: "LEFT" | "CENTER" | "RIGHT";
        isBold?: boolean;
        style?: string; // for items like "ah-logo"
        text?: string; // for subtotal text
        first?: string; // for four-text-column items
        second?: string;
        third?: string;
        fourth?: string;
        left?: string; // for VAT and similar fields
        center?: string;
        right?: string;
        store?: number; // for tech-info fields
        lane?: number;
        transaction?: number;
        operator?: string | null;
    }>;
    storeId?: number;
    transactionMoment?: string;
}