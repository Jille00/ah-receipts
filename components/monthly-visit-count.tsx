import { MonthlySpending } from "@/types/MonthlyData";
import { Bar } from "react-chartjs-2";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const MonthlyVisitCount = ({
    monthlyData,
}: {
    monthlyData: MonthlySpending[];
}) => {
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
        <Card>
            <CardHeader>
                <CardTitle>Monthly Visit Count</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px] w-full">
                <CardContent className="h-[400px] w-full max-w-none">
                    <Bar
                        data={barData}
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
                                        text: "Visits",
                                    },
                                },
                            },
                        }}
                    />
                </CardContent>
            </CardContent>
        </Card>
    );
};

export default MonthlyVisitCount;
