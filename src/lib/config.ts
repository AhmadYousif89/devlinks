import { z } from "zod";

const ENVSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  USER_SESSION_KEY: z.string(),
  CURRENT_USER_KEY: z.string(),
  GUEST_SESSION_KEY: z.string(),
  SESSION_EXPIRE_TIME: z.string(),
  GUEST_LINK_EXPIRE_TIME: z.string(),
  GUEST_SESSION_EXPIRE_TIME: z.string(),
  EXPIRED_NOTIFICATION_TIME: z.string(),
  MONGODB_URI: z.string(),
  MONGODB_NAME: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_API_KEY: z.string(),
});

export const config = ENVSchema.parse(process.env);
