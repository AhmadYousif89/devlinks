import { ObjectId } from "mongodb";
import { LINKS_DATA } from "./data";

// Database document type (what the DB stores)
export type LinkDocument = {
  _id?: ObjectId;
  platform: PlatformNames | PlatformKey;
  url: string;
  order: number;
  createdAt: Date;
  userId?: string; // For registered users
  guestSessionId?: string; // For guest users
  expiresAt?: Date; // TTL index field for temp links only
};

export type Link = {
  id: string; // Converted from _id
  platform: PlatformNames | PlatformKey;
  url: string;
  order: number;
  createdAt?: Date;
};

export type UserDocument = {
  _id?: ObjectId;
  email: string;
  displayEmail: string;
  image?: string;
  username?: string;
  password?: string; // Optional for guest users
  salt?: string; // Optional for guest users
  createdAt: Date;
  registered: boolean;
  guestSessionId?: string; // Optional for guest users
  expiresAt?: Date; // TTL index field for temp links only
};

export type User = {
  id?: string; // Converted from _id
  email: string;
  displayEmail: string;
  image?: string;
  username?: string;
  registered: boolean; // Indicates if the user is registered or a guest
};

export type UserSessionDocument = {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
};

export type UserSession =
  | {
      sessionId?: string;
      userId?: string;
      createdAt?: string;
      expiresAt?: string;
    }
  | { expired: true }
  | null;

export type UserProfileDisplay = {
  firstName: string;
  lastName: string;
  displayEmail: string;
  image: string;
  registered: boolean;
};

export type PublicUserProfile = {
  username: string;
  displayEmail: string;
  image: string;
};

export type SessionExpirationDocument = {
  _id?: ObjectId;
  userId: string;
  sessionId: string;
  sessionExpiredAt: Date;
  expiresAt: Date; // This document will auto-delete after 24 hours
};

type ExtractPlatformNames<T> = {
  [K in keyof T]: T[K] extends { name: infer N } ? N : never;
}[keyof T];

export type PlatformKey = keyof typeof LINKS_DATA;
export type PlatformNames = ExtractPlatformNames<typeof LINKS_DATA>;
