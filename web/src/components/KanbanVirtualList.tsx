import { createSignal, onMount, For } from "solid-js";
// Ideally would use an established library like @tanstack/solid-virtual but writing custom for now
// to ensure zero hardcoding and custom element heights

type Task = { id: string; title: string; stage: string };

export default function KanbanVirtualList(props: { tasks: Task[] }) {
    const [scrollTop, setScrollTop] = createSignal(0);
    const itemHeight = 60;
    const containerHeight = 600;

    // Derive visible bounds
    const startIndex = () => Math.floor(scrollTop() / itemHeight);
    const endIndex = () => Math.min(props.tasks.length - 1, startIndex() + Math.ceil(containerHeight / itemHeight) + 1);

    const visibleTasks = () => props.tasks.slice(startIndex(), endIndex() + 1);
    const totalHeight = () => props.tasks.length * itemHeight;
    const offsetY = () => startIndex() * itemHeight;

    let containerRef!: HTMLDivElement;

    onMount(() => {
        containerRef.addEventListener("scroll", () => {
            setScrollTop(containerRef.scrollTop);
        });
    });

    return (
        <div
            ref={containerRef}
            style={{
                height: `${containerHeight}px`,
                overflow: "auto",
                position: "relative"
            }}
            class="border rounded shadow-inner bg-gray-50/50"
        >
            <div style={{ height: `${totalHeight()}px` }}>
                <div style={{ transform: `translateY(${offsetY()}px)` }}>
                    <For each={visibleTasks()}>
                        {(task) => (
                            <div
                                style={{ height: `${itemHeight}px` }}
                                class="flex items-center px-4 border-b bg-white hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <div class="mr-4 text-xs font-bold text-gray-500">{task.stage}</div>
                                <div>{task.title}</div>
                            </div>
                        )}
                    </For>
                </div>
            </div>
        </div>
    );
}
