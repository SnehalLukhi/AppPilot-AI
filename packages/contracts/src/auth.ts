/**
 * /api/v1/auth/*
 * Owner: backend (authentication). STATUS: DRAFT.
 *
 * Assumption to confirm: the backend issues an httpOnly, Secure, SameSite=Lax
 * session cookie. The frontend never stores tokens in localStorage. The
 * Next.js app proxies /api/v1/* to the backend so cookies stay first-party.
 */
import type { ISODate } from "./common";
import type { User } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  acceptTerms: true;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface Session {
  user: User;
  expiresAt: ISODate;
}

/** POST /auth/forgot-password always returns 202 to avoid account enumeration. */
export interface ForgotPasswordResponse {
  accepted: true;
}
