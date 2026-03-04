import { request } from "../lib/http-client";

export type Role = {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
};

export type Permission = {
    id: string;
    feature_id: string;
    feature_code: string;
    action: string;
    conditions: Record<string, unknown> | null;
    created_at: string;
};

export type PermissionMatrix = {
    features: string[];
    actions: string[];
    feature_action_map: Record<string, string[]>;
};

export type PermissionInput = {
    feature: string;
    action: string;
};

// Permission matrix (system constants)
export function getPermissionMatrix() {
    return request<PermissionMatrix>("/rbac/matrix");
}

// Roles
export function listRoles(tenantId: string) {
    return request<Role[]>("/rbac/roles", {
        headers: { "X-Tenant-ID": tenantId },
    });
}

export function createRole(tenantId: string, name: string, description: string) {
    return request<Role>("/rbac/roles", {
        method: "POST",
        headers: { "X-Tenant-ID": tenantId },
        body: JSON.stringify({ name, description }),
    });
}

export function deleteRole(roleId: string) {
    return request<void>(`/rbac/roles/${roleId}`, { method: "DELETE" });
}

// Permissions
export function getRolePermissions(roleId: string) {
    return request<Permission[]>(`/rbac/roles/${roleId}/permissions`);
}

export function setRolePermissions(roleId: string, tenantId: string, permissions: PermissionInput[]) {
    return request<{ status: string }>(`/rbac/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: { "X-Tenant-ID": tenantId },
        body: JSON.stringify(permissions),
    });
}

// User-Role assignments
export function assignUserRole(tenantId: string, userId: string, roleId: string) {
    return request<{ status: string }>("/rbac/user-roles", {
        method: "POST",
        headers: { "X-Tenant-ID": tenantId },
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
    });
}

export function revokeUserRole(userId: string, roleId: string) {
    return request<{ status: string }>("/rbac/user-roles", {
        method: "DELETE",
        body: JSON.stringify({ user_id: userId, role_id: roleId }),
    });
}

export function getUserRoles(userId: string) {
    return request<Role[]>(`/rbac/users/${userId}/roles`);
}
