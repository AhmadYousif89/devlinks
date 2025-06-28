import crypto from "node:crypto";

export function hashPassword(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString("hex").normalize());
      }
    });
  });
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize();
}

export async function verifyPassword(
  hashedPassword: string,
  password: string,
  salt: string,
) {
  const hash = await hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(hashedPassword, "hex"),
    Buffer.from(hash, "hex"),
  );
}
