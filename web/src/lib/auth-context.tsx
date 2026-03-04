import { createSignal, createContext, useContext } from "solid-js";
import type { JSX } from "solid-js";

type User = {
    id: string;
    email: string;
    full_name: string;
    tenant_id: string;
};

type Tenant = {
    id: string;
    name: string;
    domain: string;
};

type AuthState = {
    token: string | null;
    user: User | null;
    tenant: Tenant | null;
};

type AuthContextType = {
    auth: () => AuthState;
    setAuth: (state: AuthState) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
};

const AuthContext = createContext<AuthContextType>();

export function AuthProvider(props: { children: JSX.Element }) {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedTenant = localStorage.getItem("tenant");

    const [auth, setAuthSignal] = createSignal<AuthState>({
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
        tenant: storedTenant ? JSON.parse(storedTenant) : null,
    });

    const setAuth = (state: AuthState) => {
        if (state.token) {
            localStorage.setItem("token", state.token);
            localStorage.setItem("user", JSON.stringify(state.user));
            localStorage.setItem("tenant", JSON.stringify(state.tenant));
        }
        setAuthSignal(state);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("tenant");
        setAuthSignal({ token: null, user: null, tenant: null });
    };

    const isAuthenticated = () => !!auth().token;

    return (
        <AuthContext.Provider value={{ auth, setAuth, logout, isAuthenticated }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
