import * as React from "react";
import { MessageCircle, Building2, Tags, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { fetchCheckinAnalytics } from "@/queries/analytics";
import { fetchCategories } from "@/queries/categories";
import { fetchHospitals } from "@/queries/hospitals";
import { fetchFeedbacks } from "@/queries/feedback";

interface Tile {
    label: string;
    value: number;
    icon: React.ElementType;
}

export default function Dashboard() {
    const [tiles, setTiles] = React.useState<Tile[] | null>(null);

    React.useEffect(() => {
        const load = async () => {
            const [analytics, categories, hospitals, feedbacks] = await Promise.all([
                fetchCheckinAnalytics(30),
                fetchCategories(),
                fetchHospitals({ limit: 1 }),
                fetchFeedbacks("new"),
            ]);

            setTiles([
                {
                    label: "Check-ins (30d)",
                    value: analytics.totals.total,
                    icon: MessageCircle,
                },
                {
                    label: "Active categories",
                    value: categories.filter((c) => c.isActive).length,
                    icon: Tags,
                },
                {
                    label: "Hospitals on record",
                    value: hospitals.pagination.total,
                    icon: Building2,
                },
                {
                    label: "New feedback",
                    value: feedbacks.length,
                    icon: Inbox,
                },
            ]);
        };
        load();
    }, []);

    if (!tiles) {
        return (
            <div className="flex justify-center py-12">
                <Spinner className="size-6" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map(({ label, value, icon: Icon }) => (
                <Card key={label}>
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {label}
                        </CardTitle>
                        <Icon className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{value}</div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
