import { QueryClient, type QueryFunction } from "@tanstack/react-query";
import environments from "@/environments";

async function throwIfResNotOk(res: Response) {
    if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
    }
}

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown
): Promise<Response> {
    const res = await fetch(`${environments.serverOrigin}${url}`, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
    });

    await throwIfResNotOk(res);
    return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export function getQueryFn<T>(options: {
    on401: UnauthorizedBehavior;
}): QueryFunction<T> {
    return async ({ queryKey }) => {
        const res = await fetch(`${environments.serverOrigin}${queryKey.join("/")}`);

        if (options.on401 === "returnNull" && res.status === 401) {
            return null as T;
        }

        await throwIfResNotOk(res);
        return res.json();
    };
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            queryFn: getQueryFn({ on401: "throw" }),
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
        },
    },
});
