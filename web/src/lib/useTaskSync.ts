import { createSignal, onCleanup } from "solid-js";

// Hook to capture WebSocket events
export function useTaskSync(tenantId: string, userId: string) {
    const [lastEvent, setLastEvent] = createSignal<any>(null);

    // Note: in dev, hardcode port; in prod use dynamic
    const wsUrl = `ws://localhost:8080/ws?user_id=${userId}&tenant_id=${tenantId}`;

    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        try {
            const parsed = JSON.parse(event.data);
            if (parsed.event === "TASK_MOVED") {
                setLastEvent(parsed.data);
            }
        } catch (e) {
            console.error("Failed to parse WS message", e);
        }
    };

    onCleanup(() => {
        ws.close();
    });

    return { lastEvent };
}
