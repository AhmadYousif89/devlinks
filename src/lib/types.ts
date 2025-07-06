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
  expiresAt?: Date; // TTL index field for temp links only
};

export type Link = {
  id: string; // Converted from _id
  platform: PlatformNames | PlatformKey;
  url: string;
  order: number;
  createdAt?: Date;
};

export type DeleteLinkState = {
  success: boolean;
  deletedId?: string;
  error?: string;
};

export type UserDocument = {
  _id?: ObjectId;
  email?: string; // Optional for guest users
  displayEmail?: string;
  image?: string;
  username?: string;
  password?: string; // Optional for guest users
  salt?: string; // Optional for guest users
  createdAt: Date;
  registered: boolean;
  guestSessionId?: string; // For guest users only
  expiresAt?: Date; // TTL index field for temp users only
  isNotified?: boolean; // For guest users - indicates if they've been shown the welcome notification
  links?: LinkDocument[]; // For guest users only - embedded links
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

export type UserSession = {
  sessionId?: string;
  userId?: string;
  expired?: boolean;
};

export type UserProfileDisplay = {
  firstName: string;
  lastName: string;
  displayEmail: string;
  image: string;
  registered: boolean;
  links?: Link[]; // For guest users's embbeded link list
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
