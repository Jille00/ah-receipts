export const formatMonth = (date: Date) => {
    return date.toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "long",
    });
};

export const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
    }).format(amount);
};