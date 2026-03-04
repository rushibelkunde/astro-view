import type { JSX } from "solid-js";
import { createEffect, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { useAppStore } from "../lib/app-store";

export function ProtectedRoute(props: { children: JSX.Element }) {
    const { store } = useAppStore();
    const navigate = useNavigate();

    createEffect(() => {
        if (!store.isAuthenticated) {
            navigate("/login", { replace: true });
        }
    });

    return (
        <Show when={store.isAuthenticated} fallback={<div class="bg-neutral-950 min-h-screen"></div>}>
            {props.children}
        </Show>
    );
}
