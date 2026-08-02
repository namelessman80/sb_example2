import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BarChart3,
    Database,
    ScrollText,
    MessageSquare,
    LogOut,
    Brain,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/manage-data", label: "Manage Data", icon: Database },
    { to: "/logs", label: "Logs", icon: ScrollText },
    { to: "/feedback", label: "Feedback", icon: MessageSquare },
];

export function Sidebar() {
    const { admin, logout } = useAuth();

    return (
        <aside className="flex h-screen w-60 shrink-0 flex-col border-r bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-4">
                <Brain className="size-5" />
                <span className="font-semibold">MH Admin</span>
            </div>

            <nav className="flex-1 space-y-1 p-3">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                isActive && "bg-accent text-accent-foreground"
                            )
                        }
                    >
                        <Icon className="size-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t p-3">
                <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
                    {admin?.name} · {admin?.email}
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                    <LogOut className="size-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
