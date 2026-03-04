import { createSignal, createResource, For, Show } from "solid-js";
import AppLayout from "../components/app-layout";
import { useAppStore } from "../lib/app-store";
import {
    listRoles,
    createRole,
    deleteRole,
    getPermissionMatrix,
    getRolePermissions,
    setRolePermissions as apiSetRolePermissions,
    type PermissionInput,
} from "../services/rbac-service";

export default function RolesPage() {
    const { store } = useAppStore();
    const tenantId = () => store.tenant?.id || "";

    // Fetch roles and permission matrix
    const [roles, { refetch: refetchRoles }] = createResource(tenantId, (tid) =>
        tid ? listRoles(tid) : Promise.resolve([])
    );
    const [matrix] = createResource(getPermissionMatrix);

    // Create role form
    const [newRoleName, setNewRoleName] = createSignal("");
    const [newRoleDesc, setNewRoleDesc] = createSignal("");
    const [createLoading, setCreateLoading] = createSignal(false);
    const [createError, setCreateError] = createSignal("");

    // Selected role for permission editing
    const [selectedRoleId, setSelectedRoleId] = createSignal<string | null>(null);

    const [editedPerms, setEditedPerms] = createSignal<Set<string>>(new Set());
    const [saving, setSaving] = createSignal(false);

    const handleCreateRole = async (e: Event) => {
        e.preventDefault();
        if (!newRoleName().trim()) return;
        setCreateLoading(true);
        setCreateError("");
        try {
            await createRole(tenantId(), newRoleName(), newRoleDesc());
            setNewRoleName("");
            setNewRoleDesc("");
            refetchRoles();
        } catch (err: any) {
            setCreateError(err.error || "Failed to create role");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDeleteRole = async (roleId: string) => {
        try {
            await deleteRole(roleId);
            if (selectedRoleId() === roleId) {
                setSelectedRoleId(null);
                setEditedPerms(new Set<string>());
            }
            refetchRoles();
        } catch (err: any) {
            console.error("Delete failed:", err);
        }
    };

    const selectRole = async (roleId: string) => {
        setSelectedRoleId(roleId);
        try {
            const perms = await getRolePermissions(roleId);
            setEditedPerms(new Set(perms.map((p) => `${p.feature_code}:${p.action}`)));
        } catch {
            setEditedPerms(new Set<string>());
        }
    };

    const togglePerm = (feature: string, action: string) => {
        const key = `${feature}:${action}`;
        const current = new Set(editedPerms());
        if (current.has(key)) {
            current.delete(key);
        } else {
            current.add(key);
        }
        setEditedPerms(current);
    };

    const savePermissions = async () => {
        const roleId = selectedRoleId();
        if (!roleId) return;
        setSaving(true);
        try {
            const permissions: PermissionInput[] = Array.from(editedPerms()).map((key) => {
                const [feature, action] = key.split(":");
                return { feature, action };
            });
            await apiSetRolePermissions(roleId, tenantId(), permissions);
            // Refresh
            const perms = await getRolePermissions(roleId);
            setEditedPerms(new Set(perms.map((p) => `${p.feature_code}:${p.action}`)));
        } catch (err: any) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const selectedRole = () => roles()?.find((r) => r.id === selectedRoleId());

    return (
        <AppLayout>
            <div>
                <h2 class="text-xl font-bold mb-6 text-neutral-200">Roles & Permissions</h2>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Role List + Create */}
                    <div class="space-y-4">
                        {/* Create Role */}
                        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 class="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Create Role</h3>
                            <form onSubmit={handleCreateRole} class="space-y-3">
                                <input
                                    type="text"
                                    value={newRoleName()}
                                    onInput={(e) => setNewRoleName(e.currentTarget.value)}
                                    placeholder="Role name"
                                    class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                    required
                                />
                                <input
                                    type="text"
                                    value={newRoleDesc()}
                                    onInput={(e) => setNewRoleDesc(e.currentTarget.value)}
                                    placeholder="Description (optional)"
                                    class="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                                />
                                {createError() && (
                                    <p class="text-rose-400 text-xs">{createError()}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={createLoading()}
                                    class="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50"
                                >
                                    {createLoading() ? "Creating..." : "Create Role"}
                                </button>
                            </form>
                        </div>

                        {/* Role List */}
                        <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                            <h3 class="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Roles</h3>
                            <Show when={!roles.loading} fallback={<p class="text-neutral-500 text-sm">Loading...</p>}>
                                <Show when={roles()?.length} fallback={<p class="text-neutral-500 text-sm">No roles yet</p>}>
                                    <div class="space-y-1">
                                        <For each={roles()}>
                                            {(role) => (
                                                <div
                                                    class={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all ${selectedRoleId() === role.id
                                                        ? "bg-emerald-500/10 border border-emerald-500/30"
                                                        : "hover:bg-neutral-800 border border-transparent"
                                                        }`}
                                                    onClick={() => selectRole(role.id)}
                                                >
                                                    <div>
                                                        <p class="text-sm font-medium text-white">{role.name}</p>
                                                        {role.description && (
                                                            <p class="text-xs text-neutral-500 mt-0.5">{role.description}</p>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteRole(role.id);
                                                        }}
                                                        class="text-neutral-600 hover:text-rose-400 transition-colors p-1"
                                                        title="Delete role"
                                                    >
                                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </For>
                                    </div>
                                </Show>
                            </Show>
                        </div>
                    </div>

                    {/* Right: Permission Matrix */}
                    <div class="lg:col-span-2">
                        <Show
                            when={selectedRoleId() && matrix()}
                            fallback={
                                <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-12 flex items-center justify-center">
                                    <p class="text-neutral-500">Select a role to edit permissions</p>
                                </div>
                            }
                        >
                            <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                                <div class="flex justify-between items-center mb-5">
                                    <div>
                                        <h3 class="text-lg font-semibold text-white">{selectedRole()?.name}</h3>
                                        <p class="text-sm text-neutral-500 mt-0.5">Configure feature permissions</p>
                                    </div>
                                    <button
                                        onClick={savePermissions}
                                        disabled={saving()}
                                        class="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                                    >
                                        {saving() ? "Saving..." : "Save Permissions"}
                                    </button>
                                </div>

                                {/* Matrix Table */}
                                <div class="overflow-x-auto">
                                    <table class="w-full text-sm">
                                        <thead>
                                            <tr class="border-b border-neutral-800">
                                                <th class="text-left py-3 px-3 text-neutral-500 font-medium uppercase tracking-wider text-xs">Feature</th>
                                                <For each={matrix()!.actions}>
                                                    {(action) => (
                                                        <th class="text-center py-3 px-2 text-neutral-500 font-medium uppercase tracking-wider text-xs w-20">{action}</th>
                                                    )}
                                                </For>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <For each={matrix()!.features}>
                                                {(feature) => {
                                                    const allowed = matrix()!.feature_action_map[feature] || [];
                                                    return (
                                                        <tr class="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                                                            <td class="py-3 px-3">
                                                                <span class="text-neutral-200 font-medium capitalize">{feature}</span>
                                                            </td>
                                                            <For each={matrix()!.actions}>
                                                                {(action) => {
                                                                    const isAllowed = allowed.includes(action);
                                                                    const key = `${feature}:${action}`;
                                                                    const isChecked = editedPerms().has(key);
                                                                    return (
                                                                        <td class="text-center py-3 px-2">
                                                                            {isAllowed ? (
                                                                                <button
                                                                                    onClick={() => togglePerm(feature, action)}
                                                                                    class={`w-8 h-8 rounded-lg border-2 transition-all duration-150 flex items-center justify-center mx-auto ${isChecked
                                                                                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                                                        : "border-neutral-700 hover:border-neutral-600 text-transparent hover:text-neutral-600"
                                                                                        }`}
                                                                                >
                                                                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                </button>
                                                                            ) : (
                                                                                <span class="w-8 h-8 rounded-lg bg-neutral-800/30 border border-neutral-800 flex items-center justify-center mx-auto">
                                                                                    <span class="text-neutral-700 text-xs">—</span>
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                }}
                                                            </For>
                                                        </tr>
                                                    );
                                                }}
                                            </For>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Show>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
