import { z } from "zod";

export const FIELDS = ["email", "password", "confirm"] as const;

type SignUpFieldNames = (typeof FIELDS)[number];

export const CUSTOM_VALIDATION_MESSAGES: Record<
  SignUpFieldNames,
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
        "Can't be empty": "Please enter your password",
        "Too short": "Password must be at least 8 characters",
        "No spaces allowed": "Password cannot contain spaces",
        "Passwords do not match": "Please check again",
      };
    } else if (field === "confirm") {
      acc[field] = {
        "Can't be empty": "Please confirm your password",
        "Too short": "Password must be at least 8 characters",
        "No spaces allowed": "Password cannot contain spaces",
        "Passwords do not match": "Please check again",
      };
    }
    return acc;
  },
  {} as Record<SignUpFieldNames, Record<string, string>>,
);

export const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, "Can't be empty")
      .trim()
      .min(1, "Can't be empty")
      .email("Email not valid"),
    password: z
      .string()
      .min(1, "Can't be empty")
      .min(8, "Too short")
      .refine((val) => !val.includes(" "), "No spaces allowed"),
    confirm: z
      .string()
      .min(1, "Can't be empty")
      .min(8, "Too short")
      .refine((val) => !val.includes(" "), "No spaces allowed"),
  })
  .refine(
    ({ password, confirm }) => {
      if (!password || !confirm) return true;
      return password === confirm;
    },
    {
      message: "Passwords do not match",
      path: ["password"],
    },
  )
  .refine(
    ({ password, confirm }) => {
      if (!password || !confirm) return true;
      return password === confirm;
    },
    {
      message: "Passwords do not match",
      path: ["confirm"],
    },
  );

export type SignUpFormData = z.infer<typeof signUpSchema>;
