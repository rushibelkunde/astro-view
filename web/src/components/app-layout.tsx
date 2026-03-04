import type { JSX } from "solid-js";
import { useAppStore } from "../lib/app-store";

export default function AppLayout(props: { children: JSX.Element }) {
    const { store, logout } = useAppStore();

    return (
        <div class="min-h-screen bg-neutral-950 text-neutral-100">
            <header class="border-b border-neutral-800 px-6 py-4 flex justify-between items-center">
                <div class="flex items-center gap-8">
                    <a href="/" class="text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">
                        Corpo<span class="text-emerald-500">.</span>
                    </a>
                    <nav class="flex items-center gap-1">
                        <a href="/" class="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                            Dashboard
                        </a>
                        <a href="/roles" class="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                            Roles
                        </a>
                        <a href="/health" class="px-3 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-all">
                            Health
                        </a>
                    </nav>
                </div>
                <div class="flex items-center gap-4">
                    {store.isAuthenticated ? (
                        <>
                            <span class="text-sm text-neutral-400">
                                {store.user?.first_name} {store.user?.last_name}
                                <span class="text-neutral-600 mx-1">•</span>
                                <span class="text-neutral-500">{store.tenant?.name}</span>
                            </span>
                            <button
                                onClick={logout}
                                class="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <a href="/login" class="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                            Sign In
                        </a>
                    )}
                </div>
            </header>
            <main class="p-8 max-w-6xl mx-auto">
                {props.children}
            </main>
        </div>
    );
}
