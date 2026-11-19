/**
 * Shared primitives for every AppPilot AI API group.
 *
 * STATUS: DRAFT — proposed by the frontend (Person 1). Not yet confirmed by
 * the owning backend developers. See docs/API_CONTRACTS_PENDING.md.
 */

export type ID = string;
/** ISO-8601 timestamp, e.g. "2026-11-18T12:00:00.000Z" */
export type ISODate = string;

export const API_PREFIX = "/api/v1" as const;

/** Lifecycle of a contract between the frontend and the owning team. */
export type ContractStatus =
  /** Proposed by the frontend; owner has not reviewed it. */
  | "draft"
  /** Owner agreed the shape; endpoint not deployed yet. */
  | "agreed"
  /** Endpoint is live and matches this type. */
  | "live";

export interface Paginated<T> {
  items: T[];
  /** Opaque cursor for the next page, null when there are no more items. */
  nextCursor: string | null;
  total?: number;
}

export interface PageQuery {
  cursor?: string;
  limit?: number;
}

/** Error envelope returned by every endpoint on non-2xx responses. */
export interface ApiErrorBody {
  error: {
    /** Machine-readable code, e.g. "auth.invalid_credentials". */
    code: string;
    /** Human-readable message safe to show to end users. */
    message: string;
    /** Field-level validation errors keyed by field name. */
    fields?: Record<string, string>;
    requestId?: string;
  };
}

export interface ByteQuota {
  usedBytes: number;
  limitBytes: number | null;
}

export interface CountQuota {
  used: number;
  limit: number | null;
}
