/**
 * /api/v1/projects/*  (projects, uploads, files, git, terminal sessions, events)
 * Owner: backend (projects/storage). STATUS: DRAFT.
 */
import type { ID, ISODate } from "./common";
import type { BuildStatus } from "./builds";

export type ProjectLanguage = "kotlin" | "java";
export type UiToolkit = "compose" | "xml";
export type ProjectSource = "prompt" | "android_zip" | "apk";
export type ProjectStatus =
  | "creating"
  | "analyzing"
  | "ready"
  | "error"
  | "archived";

export interface Project {
  id: ID;
  name: string;
  description: string;
  source: ProjectSource;
  status: ProjectStatus;
  language: ProjectLanguage;
  uiToolkit: UiToolkit;
  packageName: string | null;
  minSdk: number | null;
  targetSdk: number | null;
  /**
   * True for projects created from an APK. These hold decompiled analysis
   * output, not original source, and must be presented as such.
   */
  isApkAnalysis: boolean;
  activeTaskCount: number;
  lastBuild: { id: ID; status: BuildStatus; finishedAt: ISODate | null } | null;
  storageBytes: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

/* ---------- Creation: A. generate from prompt ---------- */

export interface CreateProjectFromPromptRequest {
  name: string;
  description: string;
  requirements: string[];
  language: ProjectLanguage;
  uiToolkit: UiToolkit;
  packageName?: string;
  minSdk?: number;
  targetSdk?: number;
  /** Free-form extra configuration, e.g. { "navigation": "compose-navigation" }. */
  config?: Record<string, string>;
}

/** Response: the project plus the agent task generating it. */
export interface CreateProjectResponse {
  project: Project;
  taskId: ID | null;
}

/* ---------- Creation: B/C. uploads ---------- */

export type UploadKind = "android_zip" | "apk";
export type UploadStatus =
  | "uploading"
  | "validating"
  | "analyzing"
  | "ready"
  | "failed";

/**
 * Upload flow (to confirm with owner):
 *   1. POST /projects/uploads  { kind, fileName, sizeBytes } -> UploadSession
 *   2. PUT  file bytes to UploadSession.uploadUrl (pre-signed; progress tracked by the browser)
 *   3. POST /projects/uploads/{id}/complete -> UploadSession (status: validating)
 *   4. GET  /projects/uploads/{id} (poll) or SSE until ready/failed
 */
export interface CreateUploadRequest {
  kind: UploadKind;
  fileName: string;
  sizeBytes: number;
  projectName?: string;
}

export interface UploadSession {
  id: ID;
  kind: UploadKind;
  status: UploadStatus;
  uploadUrl: string;
  /** 0–100, set by the server during analysis. */
  analysisProgress: number;
  validationErrors: string[];
  projectId: ID | null;
  zipAnalysis: ZipAnalysis | null;
  apkAnalysis: ApkAnalysis | null;
}

export interface ZipAnalysis {
  gradleWrapper: boolean;
  buildSystem: "gradle-kts" | "gradle-groovy" | "unknown";
  modules: string[];
  language: ProjectLanguage | "mixed";
  uiToolkit: UiToolkit | "mixed";
  agpVersion: string | null;
  kotlinVersion: string | null;
  fileCount: number;
  warnings: string[];
}

export interface ApkAnalysis {
  packageName: string;
  versionName: string | null;
  versionCode: number | null;
  minSdk: number | null;
  targetSdk: number | null;
  sizeBytes: number;
  permissions: string[];
  activities: string[];
  services: string[];
  receivers: string[];
  nativeAbis: string[];
  detectedLibraries: string[];
  obfuscated: boolean;
  /** Plain-language findings from the analysis pipeline. */
  findings: { severity: "info" | "warning" | "risk"; message: string }[];
}

/* ---------- Settings ---------- */

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  packageName?: string;
  minSdk?: number;
  targetSdk?: number;
}

export interface ProjectEnvVar {
  key: string;
  /** Secrets are write-only; the API returns null for their value. */
  value: string | null;
  secret: boolean;
}

/* ---------- Files ---------- */

export type GitFileStatus = "modified" | "added" | "deleted" | "untracked";

export interface FileNode {
  /** Path relative to the project root, POSIX separators, no leading slash. */
  path: string;
  name: string;
  type: "file" | "dir";
  children?: FileNode[];
  sizeBytes?: number;
  gitStatus?: GitFileStatus | null;
  /** True when the last change to this file came from an AI agent. */
  aiModified?: boolean;
}

export interface FileContent {
  path: string;
  content: string;
  /** Opaque version (e.g. blob sha). Sent back on save for conflict detection. */
  version: string;
  /** Line ranges most recently written by an agent, 1-based inclusive. */
  aiRanges?: { startLine: number; endLine: number; taskId: ID }[];
  binary?: boolean;
}

export interface SaveFileRequest {
  content: string;
  baseVersion: string;
}

export interface CreateFileRequest {
  path: string;
  type: "file" | "dir";
  content?: string;
}

export interface MoveFileRequest {
  from: string;
  to: string;
}

export interface FileSearchResult {
  path: string;
  line: number;
  column: number;
  preview: string;
}

/* ---------- Git ---------- */

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  authoredAt: ISODate;
  filesChanged: number;
  aiTaskId: ID | null;
}

/* ---------- Problems (diagnostics from the last build/lint) ---------- */

export interface Diagnostic {
  path: string;
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  source: "kotlinc" | "javac" | "aapt" | "lint" | "gradle";
}

/* ---------- Terminal (isolated sandbox only) ---------- */

/**
 * POST /projects/{id}/terminal/sessions
 * The backend provisions an isolated, per-project sandbox and returns a
 * short-lived WebSocket URL. The frontend only ever connects to this URL.
 *
 * WS protocol (JSON text frames):
 *   client -> { type: "input", data: string } | { type: "resize", cols, rows }
 *   server -> { type: "output", data: string } | { type: "exit", code: number }
 */
export interface TerminalSession {
  id: ID;
  wsUrl: string;
  expiresAt: ISODate;
}

export type TerminalClientFrame =
  | { type: "input"; data: string }
  | { type: "resize"; cols: number; rows: number };

export type TerminalServerFrame =
  | { type: "output"; data: string }
  | { type: "exit"; code: number };

/* ---------- Activity feed ---------- */

export interface ActivityEvent {
  id: ID;
  projectId: ID;
  projectName: string;
  kind:
    | "project_created"
    | "agent_task_started"
    | "agent_task_completed"
    | "agent_task_failed"
    | "build_succeeded"
    | "build_failed"
    | "tests_passed"
    | "tests_failed"
    | "files_changed";
  message: string;
  at: ISODate;
}

/**
 * GET /projects/{id}/events (SSE) — project-level stream used by the IDE.
 */
export type ProjectStreamEvent =
  | { type: "files.changed"; paths: string[]; byAgent: boolean }
  | { type: "task.updated"; taskId: ID; status: string }
  | { type: "build.updated"; buildId: ID; status: BuildStatus }
  | { type: "diagnostics.updated" };
