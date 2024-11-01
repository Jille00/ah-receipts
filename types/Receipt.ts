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
    }>;
}