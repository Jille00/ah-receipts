import { MonthlySpending } from "@/types/MonthlyData";
import { formatAmount } from "@/utils/formatting";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const ShoppingSummaryMonth = ({ monthlyData }: { monthlyData: MonthlySpending[] }) => {
    if (monthlyData.length === 0) {
        return null;
    }
    const totalSpent = monthlyData.reduce((sum, month) => sum + month.total, 0);
    const totalSaved = monthlyData.reduce((sum, month) => sum + month.discount, 0);
    const totalVisits = monthlyData.reduce((sum, month) => sum + month.count, 0);
    const avgPerVisit = totalSpent / totalVisits;

    const highestSpent = Math.max(...monthlyData.map((month) => month.total));
    const highestDiscount = Math.max(...monthlyData.map((month) => month.discount));
    const mostVisits = Math.max(...monthlyData.map((month) => month.count));

    const highestSpentMonth = monthlyData.find((month) => month.total === highestSpent);
    const highestDiscountMonth = monthlyData.find((month) => month.discount === highestDiscount);
    const mostVisitsMonth = monthlyData.find((month) => month.count === mostVisits);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Shopping Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Total Visits</p>
                        <p className="text-2xl font-bold">{totalVisits}</p>
                    </div>
                    
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Highest Spent Month</p>
                        <p className="text-2xl font-bold">
                            {highestSpentMonth ? `${formatAmount(highestSpent)}` : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                            {highestSpentMonth ? highestSpentMonth.month : ""}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Highest Discount Month</p>
                        <p className="text-2xl font-bold text-green-600">
                            {highestDiscountMonth ? `${formatAmount(highestDiscount)}` : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                            {highestDiscountMonth ? highestDiscountMonth.month : ""}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Most Visits in a Month</p>
                        <p className="text-2xl font-bold">
                            {mostVisitsMonth ? `${mostVisits} visits` : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                            {mostVisitsMonth ? mostVisitsMonth.month : ""}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ShoppingSummaryMonth;