
import { useAppStore } from "../lib/app-store";
import AppLayout from "../components/app-layout";

export default function DashboardPage() {
    const { store } = useAppStore();

    return (
        <AppLayout>
            <div>

                {store.isAuthenticated && (
                    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                        <h3 class="text-lg font-bold text-white mb-4">Your Session Overview</h3>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-neutral-500">User ID</span>
                                <p class="text-neutral-200 font-mono text-xs mt-1">{store.user?.id}</p>
                            </div>
                            <div>
                                <span class="text-neutral-500">Tenant ID</span>
                                <p class="text-neutral-200 font-mono text-xs mt-1">{store.tenant?.id}</p>
                            </div>
                            <div>
                                <span class="text-neutral-500">Email</span>
                                <p class="text-neutral-200 mt-1">{store.user?.email}</p>
                            </div>
                            <div>
                                <span class="text-neutral-500">Workspace</span>
                                <p class="text-neutral-200 mt-1">{store.tenant?.domain}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
