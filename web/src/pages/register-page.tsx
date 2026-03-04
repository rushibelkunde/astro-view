import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { registerTenant } from "../services/auth-service";
import { useAppStore } from "../lib/app-store";
import { registerSchema, getFieldErrors } from "../lib/validators";

export default function RegisterPage() {
    const [tenantName, setTenantName] = createSignal("");
    const [tenantDomain, setTenantDomain] = createSignal("");
    const [fullName, setFullName] = createSignal("");
    const [email, setEmail] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [error, setError] = createSignal("");
    const [fieldErrors, setFieldErrors] = createSignal<Record<string, string>>({});
    const [loading, setLoading] = createSignal(false);
    const navigate = useNavigate();
    const { login } = useAppStore();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const formData = {
            tenant_name: tenantName(),
            tenant_domain: tenantDomain(),
            full_name: fullName(),
            email: email(),
            password: password(),
        };

        const result = registerSchema.safeParse(formData);
        if (!result.success) {
            setFieldErrors(getFieldErrors(result.error));
            return;
        }

        setLoading(true);
        try {
            const data = await registerTenant(result.data);
            login(data.token, data.user, data.tenant);
            navigate("/");
        } catch (err: any) {
            setError(err.error || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <div class="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                <div class="absolute -bottom-16 -right-16 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

                <h1 class="text-3xl font-extrabold text-white mb-2">
                    Corpo<span class="text-emerald-500">.</span>
                </h1>
                <p class="text-neutral-400 text-sm mb-8">Create your workspace</p>

                {error() && (
                    <div class="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl mb-6">
                        {error()}
                    </div>
                )}

                <form onSubmit={handleSubmit} class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Company Name</label>
                            <input
                                type="text"
                                value={tenantName()}
                                onInput={(e) => setTenantName(e.currentTarget.value)}
                                placeholder="Acme Inc"
                                class={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all text-sm ${fieldErrors().tenant_name ? "border-rose-500/50 focus:ring-rose-500/40" : "border-neutral-800 focus:ring-emerald-500/40"}`}
                            />
                            {fieldErrors().tenant_name && (
                                <p class="text-rose-400 text-xs mt-1">{fieldErrors().tenant_name}</p>
                            )}
                        </div>
                        <div>
                            <label class="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Domain</label>
                            <input
                                type="text"
                                value={tenantDomain()}
                                onInput={(e) => setTenantDomain(e.currentTarget.value)}
                                placeholder="acme.com"
                                class={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all text-sm ${fieldErrors().tenant_domain ? "border-rose-500/50 focus:ring-rose-500/40" : "border-neutral-800 focus:ring-emerald-500/40"}`}
                            />
                            {fieldErrors().tenant_domain && (
                                <p class="text-rose-400 text-xs mt-1">{fieldErrors().tenant_domain}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            value={fullName()}
                            onInput={(e) => setFullName(e.currentTarget.value)}
                            placeholder="Jane Doe"
                            class={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all ${fieldErrors().full_name ? "border-rose-500/50 focus:ring-rose-500/40" : "border-neutral-800 focus:ring-emerald-500/40"}`}
                        />
                        {fieldErrors().full_name && (
                            <p class="text-rose-400 text-xs mt-1.5">{fieldErrors().full_name}</p>
                        )}
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            value={email()}
                            onInput={(e) => setEmail(e.currentTarget.value)}
                            placeholder="jane@acme.com"
                            class={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all ${fieldErrors().email ? "border-rose-500/50 focus:ring-rose-500/40" : "border-neutral-800 focus:ring-emerald-500/40"}`}
                        />
                        {fieldErrors().email && (
                            <p class="text-rose-400 text-xs mt-1.5">{fieldErrors().email}</p>
                        )}
                    </div>

                    <div>
                        <label class="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider">Password</label>
                        <input
                            type="password"
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            placeholder="••••••••"
                            class={`w-full bg-neutral-950 border rounded-xl px-4 py-3 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 transition-all ${fieldErrors().password ? "border-rose-500/50 focus:ring-rose-500/40" : "border-neutral-800 focus:ring-emerald-500/40"}`}
                        />
                        {fieldErrors().password && (
                            <p class="text-rose-400 text-xs mt-1.5">{fieldErrors().password}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading()}
                        class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                        {loading() ? "Creating workspace..." : "Create Workspace"}
                    </button>
                </form>

                <p class="text-center text-neutral-500 text-sm mt-6">
                    Already have a workspace?{" "}
                    <a href="/login" class="text-emerald-400 hover:text-emerald-300 transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
