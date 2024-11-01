import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Receipt } from "@/types/Receipt";
import { formatAmount } from "@/utils/formatting";

const ReceiptStatistics = ({ receipts }: { receipts: Receipt[] }) => {
    if (receipts.length === 0) {
        return null;
    }
    const totalSpent = receipts.reduce((sum, receipt) => sum + receipt.total.amount.amount, 0);
    const totalSaved = receipts.reduce((sum, receipt) => sum + receipt.totalDiscount.amount, 0);
    const avgReceiptValue = totalSpent / receipts.length;

    const highestReceipt = receipts.reduce((prev, current) =>
        current.total.amount.amount > prev.total.amount.amount ? current : prev
    );

    const highestDiscount = receipts.reduce((prev, current) =>
        current.totalDiscount.amount > prev.totalDiscount.amount ? current : prev
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Receipt Statistics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                        <p className="text-2xl font-bold">{formatAmount(totalSpent)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Saved</p>
                        <p className="text-2xl font-bold text-green-600">{formatAmount(totalSaved)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Average Receipt Value</p>
                        <p className="text-2xl font-bold">{formatAmount(avgReceiptValue)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Highest Receipt</p>
                        <p className="text-2xl font-bold">
                            {formatAmount(highestReceipt.total.amount.amount)}
                        </p>
                        <p className="text-xs text-gray-600">
                            {new Date(highestReceipt.transactionMoment).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Highest Discount</p>
                        <p className="text-2xl font-bold text-green-600">
                            {formatAmount(highestDiscount.totalDiscount.amount)}
                        </p>
                        <p className="text-xs text-gray-600">
                            {new Date(highestDiscount.transactionMoment).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReceiptStatistics;