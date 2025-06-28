"use server";

import crypto from "node:crypto";
import cloudinary from "@/lib/cloudinary";

async function getFileHash(file: File) {
  const buffer = await file.arrayBuffer();
  return crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex");
}

async function checkIfImageExists(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "image",
    });
    return result.secure_url;
  } catch {
    console.log("Image not found, uploading new image.");
    return null;
  }
}

export async function uploadToCloudinary(file: File) {
  const fileHash = await getFileHash(file);
  const publicId = `devlinks/profiles/${fileHash}`;

  try {
    const existingImageUrl = await checkIfImageExists(publicId);
    if (existingImageUrl) {
      console.log("Using existing image from Cloudinary");
      return existingImageUrl;
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            overwrite: true,
            public_id: publicId,
            resource_type: "image",
            transformation: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
              { format: "webp" },
            ],
            eager: [
              { width: 400, height: 400, crop: "fill", gravity: "face" },
              { quality: "auto" },
              { format: "webp" },
            ],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(new Error("Failed to upload image"));
            } else if (result) {
              resolve(result.secure_url);
            } else {
              reject(new Error("No result from Cloudinary"));
            }
          },
        )
        .end(buffer);
    }) as Promise<string>;
  } catch (e) {
    console.error("File processing error:", e);
    throw new Error("Failed to process image file");
  }
}
