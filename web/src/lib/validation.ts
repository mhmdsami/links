import { z } from "zod";

export const createLinkSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Destination URL is required")
    .max(2048, "Destination URL is too long")
    .url("Enter a valid URL, including https://"),
  code: z
    .string()
    .trim()
    .min(1, "Short code is required")
    .max(64, "Short code must be 64 characters or fewer")
    .regex(/^[a-zA-Z0-9_-]+$/, "Use letters, numbers, hyphens, and underscores only"),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;

export const updateLinkSchema = z.object({
  url: createLinkSchema.shape.url,
});

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
