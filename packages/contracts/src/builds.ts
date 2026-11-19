/**
 * /api/v1/builds/*  and  /api/v1/artifacts/*
 * Owner: build workers. STATUS: DRAFT.
 */
import type { ID, ISODate } from "./common";

export type BuildOutputType = "apk" | "aab";
export type BuildVariant = "debug" | "release";
export type BuildStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface BuildError {
  path: string | null;
  line: number | null;
  column: number | null;
  severity: "error" | "warning";
  message: string;
  task: string | null;
}

export interface Build {
  id: ID;
  projectId: ID;
  number: number;
  outputType: BuildOutputType;
  variant: BuildVariant;
  status: BuildStatus;
  /** Gradle task actually executed, e.g. ":app:assembleDebug". */
  gradleTask: string;
  commitSha: string | null;
  triggeredBy: "user" | "agent";
  agentTaskId: ID | null;
  queuedAt: ISODate;
  startedAt: ISODate | null;
  finishedAt: ISODate | null;
  durationMs: number | null;
  errorSummary: string | null;
  errors: BuildError[];
  artifactIds: ID[];
}

/** POST /builds  */
export interface StartBuildRequest {
  projectId: ID;
  outputType: BuildOutputType;
  variant: BuildVariant;
}

/**
 * GET /builds/{id}/logs        -> text/plain full log
 * GET /builds/{id}/logs/stream -> SSE, event "log" with { line: string, seq: number }
 */
export interface BuildLogLine {
  seq: number;
  line: string;
}

/* ---------- Artifacts ---------- */

export type ArtifactKind = "apk" | "aab" | "mapping" | "lint_report" | "test_report";

export interface Artifact {
  id: ID;
  projectId: ID;
  buildId: ID;
  kind: ArtifactKind;
  fileName: string;
  sizeBytes: number;
  sha256: string;
  createdAt: ISODate;
  expiresAt: ISODate | null;
}

/** GET /artifacts/{id}/download -> short-lived signed URL. */
export interface ArtifactDownload {
  url: string;
  expiresAt: ISODate;
}
