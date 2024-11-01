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
                <DialogContent className="h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Receipt Details</DialogTitle>
                        <DialogClose onClick={closeModal} />
                    </DialogHeader>
                    <div className="space-y-2">
                        {selectedReceipt?.receiptUiItems.map((item, index) => {
                            switch (item.type) {
                                case "ah-logo":
                                    return (
                                        <div key={index} className="text-center text-lg font-semibold">
                                            {item.style}
                                        </div>
                                    );
                                case "text":
                                    return (
                                        <p
                                            key={index}
                                            className={`text-${
                                                (item.alignment?.toLowerCase() || "left")
                                            } ${item.isBold ? "font-bold" : ""}`}
                                        >
                                            {item.value}
                                        </p>
                                    );
                                case "spacer":
                                    return <div key={index} className="my-2" />;
                                case "products-header":
                                    return (
                                        <p key={index} className="text-lg font-semibold border-t pt-2">
                                            Products
                                        </p>
                                    );
                                case "divider":
                                    return <hr key={index} className="border-gray-300" />;
                                case "product":
                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span>
                                                {item.quantity && `${item.quantity}x `}
                                                {item.description}
                                            </span>
                                            {item.amount && <span>{item.amount}</span>}
                                        </div>
                                    );
                                case "subtotal":
                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between font-semibold border-t pt-2"
                                        >
                                            <span>{item.text}</span>
                                            <span>{item.amount}</span>
                                        </div>
                                    );
                                case "total":
                                    return (
                                        <div
                                            key={index}
                                            className="flex justify-between text-lg font-bold border-t border-b py-2"
                                        >
                                            <span>{item.label}</span>
                                            <span>{item.price}</span>
                                        </div>
                                    );
                                case "four-text-column":
                                    return (
                                        <div
                                            key={index}
                                            className="grid grid-cols-4 gap-2 text-xs text-gray-700"
                                        >
                                            <span>{item.first}</span>
                                            <span>{item.second}</span>
                                            <span>{item.third}</span>
                                            <span>{item.fourth}</span>
                                        </div>
                                    );
                                case "vat":
                                    return (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span>{item.left}</span>
                                            <span>{item.center}</span>
                                            <span>{item.right}</span>
                                        </div>
                                    );
                                case "tech-info":
                                    return (
                                        <div key={index} className="text-xs text-gray-500 mt-2">
                                            <p>Store: {item.store}</p>
                                            <p>Lane: {item.lane}</p>
                                            <p>Transaction: {item.transaction}</p>
                                            {item.operator && <p>Operator: {item.operator}</p>}
                                        </div>
                                    );
                                default:
                                    return null;
                            }
                        })}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}