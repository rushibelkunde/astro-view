import { createStore } from "solid-js/store";

type User = {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    tenant_id: string;
};

type Tenant = {
    id: string;
    name: string;
    domain: string;
};

type AppState = {
    token: string | null;
    user: User | null;
    tenant: Tenant | null;
    isAuthenticated: boolean;
};

function loadInitialState(): AppState {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const tenant = localStorage.getItem("tenant");

    return {
        token,
        user: user ? JSON.parse(user) : null,
        tenant: tenant ? JSON.parse(tenant) : null,
        isAuthenticated: !!token,
    };
}

const [store, setStore] = createStore<AppState>(loadInitialState());

export function useAppStore() {
    const login = (token: string, user: User, tenant: Tenant) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("tenant", JSON.stringify(tenant));
        setStore({
            token,
            user,
            tenant,
            isAuthenticated: true,
        });
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tenant");
        setStore({
            token: null,
            user: null,
            tenant: null,
            isAuthenticated: false,
        });
    };

    return { store, login, logout };
}
