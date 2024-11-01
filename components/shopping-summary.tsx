import { formatAmount } from "@/utils/formatting";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { MonthlySpending } from "@/types/MonthlyData";

const ShoppingSummary = ({monthlyData}: {monthlyData: MonthlySpending[]}) => {
    return (
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
    )
}

export default ShoppingSummary