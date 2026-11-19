/**
 * /api/v1/users/*
 * Owner: backend. STATUS: DRAFT.
 */
import type { ID, ISODate } from "./common";

export type UserRole = "user" | "admin";

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: ISODate;
}

export interface UpdateProfileRequest {
  name?: string;
  avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserPreferences {
  theme: "system" | "dark" | "light";
  defaultLanguage: "kotlin" | "java";
  defaultUiToolkit: "compose" | "xml";
  emailNotifications: {
    buildFailed: boolean;
    agentTaskCompleted: boolean;
    usageThreshold: boolean;
  };
}

export interface ApiKeySummary {
  id: ID;
  name: string;
  /** Only the last 4 characters; the secret is shown once at creation. */
  lastFour: string;
  createdAt: ISODate;
  lastUsedAt: ISODate | null;
}
