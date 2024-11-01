"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/login-form";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { AuthTokens } from "@/types/AuthTokens";
import { DetailedReceipt, Receipt } from "@/types/Receipt";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlySpending {
  month: string;
  sortKey: string;
  timestamp: number;
  total: number;
  discount: number;
  count: number;
}

export default function Home() {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] =
    useState<DetailedReceipt | null>(null);
  const [loading, setLoading] = useState(false);
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

  const refreshAccessToken = async () => {
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
        }
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

  const fetchWithRefresh = async (url: string) => {
    if (!tokens) return null;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Appie/8.22.3",
          Authorization: `Bearer ${tokens.access_token}`,
        },
      });

      if (response.status === 401) {
        const newToken = await refreshAccessToken();
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

  const fetchReceipts = async () => {
    if (!tokens) return;

    setLoading(true);
    try {
      const response = await fetchWithRefresh(
        "https://api.ah.nl/mobile-services/v1/receipts"
      );
      if (!response) return;

      const data = await response.json();
      setReceipts(data);

      // Process monthly data
      const monthlyStats = processMonthlyData(data);
      setMonthlyData(monthlyStats);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (receipts: Receipt[]): MonthlySpending[] => {
    const monthlyMap = new Map<string, MonthlySpending>();

    receipts.forEach((receipt) => {
      const date = new Date(receipt.transactionMoment);
      const sortKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const existing = monthlyMap.get(sortKey) || {
        month: formatMonth(date),
        sortKey,
        total: 0,
        discount: 0,
        count: 0,
        timestamp: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
      };

      existing.total = Number(
        (existing.total + receipt.total.amount.amount).toFixed(2)
      );
      existing.discount = Number(
        (existing.discount + receipt.totalDiscount.amount).toFixed(2)
      );
      existing.count += 1;

      monthlyMap.set(sortKey, existing);
    });

    return Array.from(monthlyMap.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
  };

  const fetchReceiptDetails = async (transactionId: string) => {
    try {
      const response = await fetchWithRefresh(
        `https://api.ah.nl/mobile-services/v2/receipts/${transactionId}`
      );
      if (!response) return;

      const data = await response.json();
      setSelectedReceipt(data);
    } catch (error) {
      console.error("Error fetching receipt details:", error);
    }
  };

  useEffect(() => {
    if (tokens?.access_token) {
      fetchReceipts();
    }
  }, [tokens?.access_token]);

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  console.log(monthlyData);

  const lineData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Total Spent",
        data: monthlyData.map((item) => item.total),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
      {
        label: "Total Savings",
        data: monthlyData.map((item) => item.discount),
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
      },
    ],
  };

  const barData = {
    labels: monthlyData.map((item) => item.month),
    datasets: [
      {
        label: "Visit Count",
        data: monthlyData.map((item) => item.count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Albert Heijn Receipts Viewer</h1>

      {!tokens ? (
        <LoginForm onLogin={(newTokens) => setTokens(newTokens)} />
      ) : (
        <div className="space-y-8">
          {/* Monthly Spending Charts */}
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] w-full">
                <Line data={lineData} options={{ responsive: true }} />
              </CardContent>
            </Card>

            {/* Monthly Visit Count */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Visit Count</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px] w-full">
                <Bar data={barData} options={{ responsive: true }} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shopping Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">
                      {formatAmount(
                        monthlyData.reduce((sum, month) => sum + month.total, 0)
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Saved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatAmount(
                        monthlyData.reduce(
                          (sum, month) => sum + month.discount,
                          0
                        )
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Total Visits
                    </p>
                    <p className="text-2xl font-bold">
                      {monthlyData.reduce((sum, month) => sum + month.count, 0)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Avg. Per Visit
                    </p>
                    <p className="text-2xl font-bold">
                      {formatAmount(
                        monthlyData.reduce(
                          (sum, month) => sum + month.total,
                          0
                        ) /
                          monthlyData.reduce(
                            (sum, month) => sum + month.count,
                            0
                          )
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Receipts List and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Receipts</h2>
              {loading ? (
                <p>Loading receipts...</p>
              ) : (
                <div className="space-y-4">
                  {receipts.map((receipt) => (
                    <Card
                      key={receipt.transactionId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => fetchReceiptDetails(receipt.transactionId)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {formatDate(receipt.transactionMoment)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>
                          Total: {formatAmount(receipt.total.amount.amount)}
                        </p>
                        <p>
                          Discount: {formatAmount(receipt.totalDiscount.amount)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {selectedReceipt && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Receipt Details</h2>
                <Card>
                  <CardContent className="space-y-2">
                    {selectedReceipt.receiptUiItems.map((item, index) => {
                      if (item.type === "product" && item.description) {
                        return (
                          <div key={index} className="flex justify-between">
                            <span>
                              {item.quantity && `${item.quantity}x `}
                              {item.description}
                            </span>
                            {item.amount && <span>{item.amount}</span>}
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
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
