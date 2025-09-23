import { z } from "zod";

export const FIELDS = ["firstName", "lastName", "displayEmail"] as const;

export type InputFieldNames = (typeof FIELDS)[number];

export const CUSTOM_VALIDATION_MESSAGES = FIELDS.reduce(
  (acc, field) => {
    if (field === "firstName") {
      acc[field] = {
        "Can't be empty": "Please enter your first name",
        "Too long": "First name must be 50 characters or less",
      };
    } else if (field === "lastName") {
      acc[field] = {
        "Can't be empty": "Please enter your last name",
        "Too long": "Last name must be 50 characters or less",
      };
    } else if (field === "displayEmail") {
      acc[field] = {
        "Email not valid": "Please enter a valid email address (e.g., name@example.com)",
      };
    }
    return acc;
  },
  {} as Record<InputFieldNames, Record<string, string>>,
);

export const IMAGE_VALIDATION = {
  MAX_SIZE: 1024 * 1024 * 5, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  MESSAGES: {
    SIZE: "File size must be less than 5MB",
    TYPE: "Only PNG, JPG, JPEG and WebP files are supported",
  },
} as const;

export type ImageTypes = (typeof IMAGE_VALIDATION.ALLOWED_TYPES)[number];

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Can't be empty").max(50, "Too long"),
  lastName: z.string().trim().min(1, "Can't be empty").max(50, "Too long"),
  displayEmail: z.string().trim().email("Email not valid").optional().or(z.literal("")),
  image: z
    .instanceof(File)
    .refine(
      (file) => file.size === 0 || file.size <= IMAGE_VALIDATION.MAX_SIZE,
      IMAGE_VALIDATION.MESSAGES.SIZE,
    )
    .refine(
      (file) => file.size === 0 || IMAGE_VALIDATION.ALLOWED_TYPES.includes(file.type as ImageTypes),
      IMAGE_VALIDATION.MESSAGES.TYPE,
    )
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export type ProfileServerState = {
  success: boolean;
  message: string;
  errors?: {
    firstName?: string[] | undefined;
    lastName?: string[] | undefined;
    displayEmail?: string[] | undefined;
    image?: string[] | undefined;
  };
  data?: {
    firstName: string;
    lastName: string;
    displayEmail?: string;
    image?: string | File;
  };
  imageUploaded?: boolean;
};

export type ProfileDataToSave = {
  username: string;
  displayEmail: string;
  image?: string;
};
