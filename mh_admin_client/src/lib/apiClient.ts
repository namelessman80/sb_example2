import axios from "axios";
import { toast } from "sonner";
import environments from "@/environments";

const TOKEN_KEY = "mh_admin_auth_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

let sessionExpiredHandler: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: () => void) => {
    sessionExpiredHandler = handler;
};

export const apiClient = axios.create({
    baseURL: environments.serverOrigin,
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 && error.config?.headers?.Authorization) {
            clearToken();
            sessionExpiredHandler?.();
        } else {
            toast.error(error.response?.data?.message || "Something went wrong");
        }
        return Promise.reject(error);
    }
);
