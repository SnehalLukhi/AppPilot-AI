/**
 * /api/v1/usage/*  and  /api/v1/billing/*
 * Owner: backend billing. STATUS: DRAFT.
 * The frontend never handles card details: upgrades redirect to a
 * provider-hosted checkout/portal URL returned by the backend.
 */
import type { ByteQuota, CountQuota, ID, ISODate } from "./common";

export interface UsageSummary {
  periodStart: ISODate;
  periodEnd: ISODate;
  aiTokens: CountQuota;
  aiCostUsd: number;
  buildMinutes: CountQuota;
  storage: ByteQuota;
  projects: CountQuota;
  concurrentAgentTasks: CountQuota;
}

export interface UsageDailyPoint {
  date: string; // YYYY-MM-DD
  aiTokens: number;
  buildMinutes: number;
  aiCostUsd: number;
}

export interface Plan {
  id: ID;
  name: string;
  priceMonthlyUsd: number;
  limits: {
    aiTokensPerMonth: number | null;
    buildMinutesPerMonth: number | null;
    storageBytes: number | null;
    projects: number | null;
    concurrentAgentTasks: number;
  };
  features: string[];
}

export interface Subscription {
  planId: ID;
  status: "trialing" | "active" | "past_due" | "canceled";
  currentPeriodEnd: ISODate;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: ID;
  issuedAt: ISODate;
  amountUsd: number;
  status: "paid" | "open" | "void" | "uncollectible";
  pdfUrl: string | null;
}

/** POST /billing/checkout { planId } and POST /billing/portal -> redirect URL */
export interface RedirectUrl {
  url: string;
}
