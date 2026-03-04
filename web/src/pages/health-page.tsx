import { createQuery } from "@tanstack/solid-query";
import { getHealth } from "../services/health-service";
import AppLayout from "../components/app-layout";

export default function HealthPage() {
    const query = createQuery(() => ({
        queryKey: ["health"],
        queryFn: getHealth,
        refetchInterval: 5000,
    }));

    return (
        <AppLayout>
            <div>
                <h2 class="text-xl font-bold mb-6 text-neutral-200">System Status</h2>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-medium text-neutral-400">HTTP API</span>
                            <span class={`w-2.5 h-2.5 rounded-full ${query.isSuccess ? "bg-emerald-500" : "bg-neutral-600"}`} />
                        </div>
                        <p class="text-2xl font-bold">
                            {query.isLoading ? "..." : query.isSuccess ? query.data?.status?.toUpperCase() : "DOWN"}
                        </p>
                    </div>

                    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-medium text-neutral-400">PostgreSQL</span>
                            <span class={`w-2.5 h-2.5 rounded-full ${query.data?.db === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                        <p class="text-2xl font-bold capitalize">
                            {query.isLoading ? "..." : query.data?.db || "unknown"}
                        </p>
                    </div>

                    <div class="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-sm font-medium text-neutral-400">Redis</span>
                            <span class={`w-2.5 h-2.5 rounded-full ${query.data?.redis === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        </div>
                        <p class="text-2xl font-bold capitalize">
                            {query.isLoading ? "..." : query.data?.redis || "unknown"}
                        </p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
