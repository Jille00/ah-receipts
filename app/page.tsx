"use client";

import LoginForm from "@/components/login-form";
import MonthlySpendingOverview from "@/components/monthly-spending-overview";
import MonthlyVisitCount from "@/components/monthly-visit-count";
import ReceiptList from "@/components/receipts-list";
import { AuthTokens } from "@/types/AuthTokens";
import { MonthlySpending } from "@/types/MonthlyData";
import { Receipt } from "@/types/Receipt";
import { formatMonth } from "@/utils/formatting";
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

import { fetchReceipts } from "./queries/get-receipts";
import ReceiptStatistics from "@/components/shopping-summary";
import ShoppingSummaryMonth from "@/components/shopping-summary-month";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
);

export default function Home() {
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);

    // Load tokens from localStorage on mount
    useEffect(() => {
        const savedTokens = localStorage.getItem("ah_tokens");
        if (savedTokens) {
            setTokens(JSON.parse(savedTokens));
        }
    }, []);

    // Save tokens to localStorage when they change
    useEffect(() => {
        if (tokens) {
            localStorage.setItem("ah_tokens", JSON.stringify(tokens));
        }
    }, [tokens]);

    // Add the logout function in Home
const logout = () => {
    setTokens(null);
    localStorage.removeItem("ah_tokens");
};

    const processMonthlyData = (receipts: Receipt[]): MonthlySpending[] => {
        const monthlyMap = new Map<string, MonthlySpending>();

        receipts.forEach((receipt) => {
            const date = new Date(receipt.transactionMoment);
            const sortKey = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, "0")}`;

            const existing = monthlyMap.get(sortKey) || {
                month: formatMonth(date),
                sortKey,
                total: 0,
                discount: 0,
                count: 0,
                timestamp: new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    1,
                ).getTime(),
            };

            existing.total = Number(
                (existing.total + receipt.total.amount.amount).toFixed(2),
            );
            existing.discount = Number(
                (existing.discount + receipt.totalDiscount.amount).toFixed(2),
            );
            existing.count += 1;

            monthlyMap.set(sortKey, existing);
        });

        return Array.from(monthlyMap.values()).sort(
            (a, b) => a.timestamp - b.timestamp,
        );
    };

    useEffect(() => {
        const fetchReceiptDetails = async () => {
            if (tokens?.access_token) {
                const receipts = await fetchReceipts(tokens, setTokens);
                if (receipts) {
                    setReceipts(receipts);
                    setMonthlyData(processMonthlyData(receipts));
                }
            }
        };
        fetchReceiptDetails();
    }, [tokens?.access_token]);

    return (
        <div className="container mx-auto p-4">
            <Header onLogout={logout} loggedIn={!!tokens} /> 

            {!tokens ? (
                <LoginForm onLogin={(newTokens) => setTokens(newTokens)} />
            ) : (
                <div className="space-y-8">
                    {/* Monthly Spending Charts */}
                    <div className="grid grid-cols-1 gap-4">
                        <MonthlySpendingOverview monthlyData={monthlyData} />

                        {/* Monthly Visit Count */}
                        <MonthlyVisitCount monthlyData={monthlyData} />

                        {/* Shopping Summary */}
                        <ShoppingSummaryMonth monthlyData={monthlyData} />

                        <ReceiptStatistics receipts={receipts} />
                    </div>

                    {/* Receipts List and Details */}
                    <ReceiptList
                        receipts={receipts}
                        tokens={tokens}
                        setTokens={setTokens}
                    />
                </div>
            )}
        </div>
    );
}
