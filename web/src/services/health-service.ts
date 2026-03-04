import { request } from "../lib/http-client";

export type HealthResponse = {
    status: string;
    db: string;
    redis: string;
};

export function getHealth() {
    return request<HealthResponse>("/health");
}
