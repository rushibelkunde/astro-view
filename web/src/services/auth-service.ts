import { request } from "../lib/http-client";

export type AuthResponse = {
    token: string;
    tenant: { id: string; name: string; domain: string; status: string };
    user: { id: string; email: string; first_name: string; last_name: string; tenant_id: string };
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
