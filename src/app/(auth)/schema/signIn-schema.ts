import { z } from "zod";

export const FIELDS = ["email", "password"] as const;
const MIN_CHARS = 8;
const MAX_CHARS = 32;

type SignInFieldNames = (typeof FIELDS)[number];

export const CUSTOM_VALIDATION_MESSAGES: Record<
  SignInFieldNames,
  Record<string, string>
> = FIELDS.reduce(
  (acc, field) => {
    if (field === "email") {
      acc[field] = {
        "Can't be empty": "Please enter your email address",
        "Email not valid": "Please enter a valid email address",
      };
    } else if (field === "password") {
      acc[field] = {
        "Can't be empty": "Please enter your account password",
        "Too long": `Password must not exceed ${MAX_CHARS} characters long`,
        "Too short": `Password must be at least ${MIN_CHARS} characters long`,
        "No spaces allowed": "Password cannot contain spaces",
      };
    }
    return acc;
  },
  {} as Record<SignInFieldNames, Record<string, string>>,
);

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Can't be empty")
    .trim()
    .min(1, "Can't be empty")
    .email("Email not valid"),
  password: z
    .string()
    .min(1, "Can't be empty")
    .min(MIN_CHARS, "Too short")
    .max(MAX_CHARS, "Too long")
    .refine((val) => !val.includes(" "), "No spaces allowed"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
