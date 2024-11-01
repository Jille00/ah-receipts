import { fetchReceiptDetails } from "@/app/queries/get-receipt-details";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AuthTokens } from "@/types/AuthTokens";
import { DetailedReceipt, Receipt } from "@/types/Receipt";
import { formatAmount, formatDate } from "@/utils/formatting";
import { useState } from "react";

export default function ReceiptList({
    receipts,
    tokens,
    setTokens,
}: {
    receipts: Receipt[];
    tokens: AuthTokens;
    setTokens: (tokens: AuthTokens | null) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] =
        useState<DetailedReceipt | null>(null);

    const openModal = (receipt: DetailedReceipt) => {
        setSelectedReceipt(receipt);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedReceipt(null);
    };

    async function getReceipt(transactionId: string) {
        const data = await fetchReceiptDetails(
            transactionId,
            tokens,
            setTokens,
        );
        if (data) {
            openModal(data);
        }
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            <h2 className="text-xl font-semibold mb-4 col-span-2">
                Your Receipts
            </h2>

            {receipts.map((receipt) => (
                <Card
                    key={receipt.transactionId}
                    className="cursor-pointer hover:bg-gray-50 p-4 border rounded-lg shadow"
                    onClick={() => getReceipt(receipt.transactionId)}
                >
                    <CardHeader>
                        <CardTitle className="text-lg font-medium text-gray-800">
                            {formatDate(receipt.transactionMoment)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-between items-center">
                        <div>
                            <p>
                                Total:{" "}
                                {formatAmount(receipt.total.amount.amount)}
                            </p>
                            <p className="text-green-600">
                                Discount:{" "}
                                {formatAmount(receipt.totalDiscount.amount)}
                            </p>
                        </div>
                        <span className="text-gray-400">→</span>
                    </CardContent>
                </Card>
            ))}

            {/* Receipt Details Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                        <DialogClose onClick={closeModal} />
                    </DialogHeader>
                    <div className="space-y-2">
                        {selectedReceipt?.receiptUiItems.map((item, index) => {
                            if (item.type === "product" && item.description) {
                                return (
                                    <div
                                        key={index}
                                        className="flex justify-between"
                                    >
                                        <span>
                                            {item.quantity &&
                                                `${item.quantity}x `}
                                            {item.description}
                                        </span>
                                        {item.amount && (
                                            <span>{item.amount}</span>
                                        )}
                                    </div>
                                );
                            }
                            if (item.type === "total" && item.label) {
                                return (
                                    <div
                                        key={index}
                                        className="flex justify-between font-bold"
                                    >
                                        <span>{item.label}</span>
                                        <span>{item.price}</span>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
