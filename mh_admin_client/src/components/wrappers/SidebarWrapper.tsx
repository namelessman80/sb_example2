import { Sidebar } from "@/components/navigation/Sidebar";

export function SidebarWrapper({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="border-b px-6 py-4">
                    <h1 className="text-lg font-semibold">{title}</h1>
                </header>
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
