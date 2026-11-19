/**
 * /api/v1/tests/*
 * Owner: build/test workers. STATUS: DRAFT.
 */
import type { ID, ISODate } from "./common";

/**
 * Validation status of a test or job.
 * - unverified: the result could not be confirmed (e.g. no emulator available).
 * - blocked: a precondition failed (e.g. build failed) so the test never ran.
 */
export type ValidationStatus =
  | "passed"
  | "failed"
  | "blocked"
  | "unverified"
  | "skipped";

export type TestJobKind = "unit" | "instrumentation" | "emulator";
export type TestJobState = "queued" | "running" | "finished" | "cancelled";

export interface TestSummary {
  passed: number;
  failed: number;
  blocked: number;
  unverified: number;
  skipped: number;
}

export interface TestJob {
  id: ID;
  projectId: ID;
  buildId: ID | null;
  kind: TestJobKind;
  state: TestJobState;
  result: ValidationStatus | null;
  summary: TestSummary;
  device: { name: string; apiLevel: number; abi: string } | null;
  startedAt: ISODate | null;
  finishedAt: ISODate | null;
  durationMs: number | null;
  triggeredBy: "user" | "agent";
}

export interface TestCase {
  id: ID;
  jobId: ID;
  suite: string;
  name: string;
  status: ValidationStatus;
  durationMs: number | null;
  failureMessage: string | null;
  stackTrace: string | null;
}

export interface TestScreenshot {
  id: ID;
  jobId: ID;
  testCaseId: ID | null;
  url: string;
  caption: string;
  takenAt: ISODate;
}

/** POST /tests */
export interface StartTestJobRequest {
  projectId: ID;
  kind: TestJobKind;
  buildId?: ID;
}
