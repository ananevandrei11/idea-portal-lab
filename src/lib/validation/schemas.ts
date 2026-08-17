import { z } from "zod";

// bcrypt silently truncates anything past 72 bytes, so that is the real ceiling
// for a password rather than an arbitrary limit.
const MAX_PASSWORD_LENGTH = 72;
const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(MAX_EMAIL_LENGTH, "Email is too long")
  .email("Enter a valid email address")
  .toLowerCase();

const password = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH, `Password must be at most ${MAX_PASSWORD_LENGTH} characters`);

export const registerSchema = z.object({ email, password });

// Login must not reveal the password policy, so it only checks presence — a
// stricter rule here would tell an attacker which passwords are impossible.
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(MAX_PASSWORD_LENGTH),
});

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password,
});

export const createIdeaSchema = z.object({
  title: z.string().trim().min(1, "Title and content are required").max(200, "Title is too long (max 200 chars)"),
  content: z.string().trim().min(1, "Title and content are required").max(10000, "Content is too long (max 10,000 chars)"),
  tags: z
    .string()
    .optional()
    .transform((raw) => (raw ? raw.split(",").map((t) => t.trim()).filter(Boolean) : [])),
});

export const deleteIdeaSchema = z.object({
  id: z.string().min(1, "Idea id is required"),
});

/**
 * Parses FormData against a schema and flattens the result into the
 * `{ error }` shape the server actions already return to the client.
 */
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): { success: true; data: z.output<T> } | { success: false; error: string } {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { success: false, error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { success: true, data: result.data };
}
