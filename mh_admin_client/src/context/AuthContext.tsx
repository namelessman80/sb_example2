import * as React from "react";
import { toast } from "sonner";
import {
    apiClient,
    clearToken,
    getToken,
    setSessionExpiredHandler,
    setToken,
} from "@/lib/apiClient";

export interface Admin {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthContextValue {
    admin: Admin | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const ADMIN_KEY = "mh_admin_data";

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [admin, setAdmin] = React.useState<Admin | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const token = getToken();
        const storedAdmin = localStorage.getItem(ADMIN_KEY);
        if (token && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch {
                clearToken();
                localStorage.removeItem(ADMIN_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        setSessionExpiredHandler(() => {
            setAdmin(null);
            localStorage.removeItem(ADMIN_KEY);
            toast.error("Your session has expired. Please log in again.");
        });
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.post("/api/admin/login", { email, password });
        const { token, admin: loggedInAdmin } = response.data.data;
        setToken(token);
        localStorage.setItem(ADMIN_KEY, JSON.stringify(loggedInAdmin));
        setAdmin(loggedInAdmin);
    };

    const logout = () => {
        clearToken();
        localStorage.removeItem(ADMIN_KEY);
        setAdmin(null);
        toast.success("Logged out successfully");
    };

    return (
        <AuthContext.Provider
            value={{ admin, isLoading, isAuthenticated: !!admin, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
