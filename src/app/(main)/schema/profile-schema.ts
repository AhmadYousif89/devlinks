import { z } from "zod";

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

export type ProfileFieldNames = keyof ProfileFormData;

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
};

export type ProfileDataToSave = {
  username: string;
  displayEmail: string;
  image?: string;
};
