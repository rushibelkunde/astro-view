// Centralized API service with error handling
const API_BASE = "/api";

type ApiError = {
    error: string;
    status: number;
};

async function request<T>(
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

// ---- Health ----
export type HealthResponse = {
    status: string;
    db: string;
    redis: string;
};

export function getHealth() {
    return request<HealthResponse>("/health");
}

// ---- Auth ----
export type AuthResponse = {
    token: string;
    tenant: { id: string; name: string; domain: string };
    user: { id: string; email: string; full_name: string; tenant_id: string };
};

export type RegisterPayload = {
    tenant_name: string;
    tenant_domain: string;
    email: string;
    password: string;
    full_name: string;
};

export type LoginPayload = {
    tenant_domain: string;
    email: string;
    password: string;
};

export function registerTenant(payload: RegisterPayload) {
    return request<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export function loginUser(payload: LoginPayload) {
    return request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
