// Base HTTP client with token injection and error handling
const API_BASE = "/api";

export type ApiError = {
    error: string;
    status: number;
};

export async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        let errorMessage = `Request failed with status ${res.status}`;
        try {
            const errorBody = await res.json();
            errorMessage = errorBody.error || errorMessage;
        } catch {
            // response wasn't JSON
        }
        throw { error: errorMessage, status: res.status } as ApiError;
    }

    return res.json();
}
