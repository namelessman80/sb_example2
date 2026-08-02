import * as React from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { fetchCheckinAnalytics, type CheckinAnalytics } from "@/queries/analytics";

// Categorical palette (validated for adjacent-pair CVD/contrast safety),
// assigned in fixed order — see the dataviz skill's reference palette.
const CATEGORY_COLORS = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"];
const LINE_COLOR = "#2a78d6";

export default function Analytics() {
    const [days, setDays] = React.useState("30");
    const [analytics, setAnalytics] = React.useState<CheckinAnalytics | null>(null);

    React.useEffect(() => {
        setAnalytics(null);
        fetchCheckinAnalytics(parseInt(days, 10)).then(setAnalytics);
    }, [days]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Check-in trends and category matches (anonymous, aggregate only —
                    no free-text is ever stored).
                </p>
                <Select value={days} onValueChange={setDays}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 90 days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {!analytics ? (
                <div className="flex justify-center py-12">
                    <Spinner className="size-6" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total check-ins
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold">
                                {analytics.totals.total}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Unique sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold">
                                {analytics.totals.uniqueSessions}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Fallback rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-2xl font-bold">
                                {(analytics.fallbackRate * 100).toFixed(0)}%
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Check-ins over time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {analytics.daily.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    No check-ins in this range yet.
                                </p>
                            ) : (
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={analytics.daily}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="var(--color-border)"
                                        />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                                        />
                                        <YAxis
                                            allowDecimals={false}
                                            tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                                        />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            name="Check-ins"
                                            stroke={LINE_COLOR}
                                            strokeWidth={2}
                                            dot={{ r: 3 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Matches by category</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {analytics.byCategory.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No category matches yet.
                                </p>
                            ) : (
                                (() => {
                                    const max = Math.max(
                                        ...analytics.byCategory.map((c) => c.matchCount)
                                    );
                                    return analytics.byCategory.map((category, index) => (
                                        <div key={category.categoryId} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>
                                                    {category.icon} {category.name}
                                                </span>
                                                <span className="font-medium">{category.matchCount}</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-muted">
                                                <div
                                                    className="h-2 rounded-full"
                                                    style={{
                                                        width: `${(category.matchCount / max) * 100}%`,
                                                        backgroundColor:
                                                            CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ));
                                })()
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
