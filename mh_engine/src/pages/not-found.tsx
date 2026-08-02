import { Link } from "wouter";

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center gap-2 text-center">
            <h1 className="text-2xl font-bold">404 — Page not found</h1>
            <Link href="/" className="text-sm text-primary hover:underline">
                Back to the check-in tool
            </Link>
        </div>
    );
}
