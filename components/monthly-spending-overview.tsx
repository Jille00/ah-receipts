import { MonthlySpending } from "@/types/MonthlyData";
import { Line } from "react-chartjs-2";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const MonthlySpendingOverview = ({
    monthlyData,
}: {
    monthlyData: MonthlySpending[];
}) => {
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Monthly Spending Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] w-full max-w-none">
                <Line
                    data={lineData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Months",
                                },
                                ticks: {
                                    autoSkip: true,
                                    maxTicksLimit: 10,
                                },
                            },
                            y: {
                                display: true,
                                title: {
                                    display: true,
                                    text: "Amount (€)",
                                },
                            },
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
};

export default MonthlySpendingOverview;
