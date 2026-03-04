import { z } from "zod";

export const loginSchema = z.object({
    tenant_domain: z
        .string()
        .min(1, "Workspace domain is required")
        .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid domain (e.g. company.com)"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
    tenant_name: z
        .string()
        .min(1, "Company name is required")
        .min(2, "Company name must be at least 2 characters"),
    tenant_domain: z
        .string()
        .min(1, "Domain is required")
        .regex(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Enter a valid domain (e.g. company.com)"),
    full_name: z
        .string()
        .min(1, "Full name is required")
        .min(2, "Name must be at least 2 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address"),
    password: z
        .string()
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Helper to extract field errors from ZodError
export function getFieldErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
        const field = issue.path[0] as string;
        if (!errors[field]) {
            errors[field] = issue.message;
        }
    }
    return errors;
}
