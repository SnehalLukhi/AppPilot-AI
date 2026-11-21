/**
 * Every endpoint the frontend calls, with its owner and contract status.
 * This is the single registry the API client, the "waiting for backend"
 * UI and docs/API_CONTRACTS_PENDING.md are built from.
 *
 * When an owner confirms or ships an endpoint, update `status` here.
 */
import type { ContractStatus } from "./common";

export type EndpointOwner =
  | "backend"
  | "agent-orchestration"
  | "build-workers"
  | "code-generation";

export interface EndpointSpec {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "SSE" | "WS";
  path: string;
  owner: EndpointOwner;
  status: ContractStatus;
  purpose: string;
}

const d = (
  method: EndpointSpec["method"],
  path: string,
  owner: EndpointOwner,
  purpose: string,
  status: ContractStatus = "draft",
): EndpointSpec => ({ method, path, owner, status, purpose });

export const ENDPOINTS = {
  // ---------- auth ----------
  "auth.login": d("POST", "/api/v1/auth/login", "backend", "Sign in, sets session cookie"),
  "auth.register": d("POST", "/api/v1/auth/register", "backend", "Create account"),
  "auth.logout": d("POST", "/api/v1/auth/logout", "backend", "Clear session"),
  "auth.session": d("GET", "/api/v1/auth/session", "backend", "Current session or 401"),
  "auth.forgotPassword": d("POST", "/api/v1/auth/forgot-password", "backend", "Send reset email"),
  "auth.resetPassword": d("POST", "/api/v1/auth/reset-password", "backend", "Set new password from token"),

  // ---------- users ----------
  "users.me": d("GET", "/api/v1/users/me", "backend", "Profile"),
  "users.updateMe": d("PATCH", "/api/v1/users/me", "backend", "Update profile"),
  "users.changePassword": d("POST", "/api/v1/users/me/password", "backend", "Change password"),
  "users.preferences": d("GET", "/api/v1/users/me/preferences", "backend", "Read preferences"),
  "users.updatePreferences": d("PUT", "/api/v1/users/me/preferences", "backend", "Save preferences"),
  "users.apiKeys": d("GET", "/api/v1/users/me/api-keys", "backend", "List API keys"),

  // ---------- projects ----------
  "projects.list": d("GET", "/api/v1/projects", "backend", "List projects"),
  "projects.get": d("GET", "/api/v1/projects/{projectId}", "backend", "Project detail"),
  "projects.createFromPrompt": d("POST", "/api/v1/projects", "backend", "Create project + generation task"),
  "projects.update": d("PATCH", "/api/v1/projects/{projectId}", "backend", "Update settings"),
  "projects.delete": d("DELETE", "/api/v1/projects/{projectId}", "backend", "Delete project"),
  "projects.activity": d("GET", "/api/v1/projects/activity", "backend", "Recent activity across projects"),
  "projects.envVars": d("GET", "/api/v1/projects/{projectId}/env", "backend", "Build env vars"),
  "projects.updateEnvVars": d("PUT", "/api/v1/projects/{projectId}/env", "backend", "Save env vars"),
  "projects.uploads.create": d("POST", "/api/v1/projects/uploads", "backend", "Start ZIP/APK upload"),
  "projects.uploads.complete": d("POST", "/api/v1/projects/uploads/{uploadId}/complete", "backend", "Finish upload, start validation"),
  "projects.uploads.get": d("GET", "/api/v1/projects/uploads/{uploadId}", "backend", "Upload/analysis status"),
  "projects.files.tree": d("GET", "/api/v1/projects/{projectId}/files/tree", "backend", "Recursive file tree"),
  "projects.files.read": d("GET", "/api/v1/projects/{projectId}/files/content?path=", "backend", "Read a file"),
  "projects.files.save": d("PUT", "/api/v1/projects/{projectId}/files/content?path=", "backend", "Save a file (optimistic concurrency)"),
  "projects.files.create": d("POST", "/api/v1/projects/{projectId}/files", "backend", "Create file/folder"),
  "projects.files.move": d("POST", "/api/v1/projects/{projectId}/files/move", "backend", "Rename/move"),
  "projects.files.delete": d("DELETE", "/api/v1/projects/{projectId}/files?path=", "backend", "Delete file/folder"),
  "projects.files.search": d("GET", "/api/v1/projects/{projectId}/files/search?q=", "backend", "Full-text search"),
  "projects.git.log": d("GET", "/api/v1/projects/{projectId}/git/log", "backend", "Commit history"),
  "projects.diagnostics": d("GET", "/api/v1/projects/{projectId}/diagnostics", "build-workers", "Problems from last build/lint"),
  "projects.terminal.create": d("POST", "/api/v1/projects/{projectId}/terminal/sessions", "backend", "Isolated sandbox terminal session"),
  "projects.terminal.socket": d("WS", "{wsUrl from terminal session}", "backend", "Terminal I/O"),
  "projects.events": d("SSE", "/api/v1/projects/{projectId}/events", "backend", "Project-level live events"),

  // ---------- agent ----------
  "agent.tasks.list": d("GET", "/api/v1/agent/tasks?projectId=&status=", "agent-orchestration", "List tasks"),
  "agent.tasks.get": d("GET", "/api/v1/agent/tasks/{taskId}", "agent-orchestration", "Task detail"),
  "agent.tasks.timeline": d("GET", "/api/v1/agent/tasks/{taskId}/timeline", "agent-orchestration", "Execution timeline"),
  "agent.tasks.cancel": d("POST", "/api/v1/agent/tasks/{taskId}/cancel", "agent-orchestration", "Cancel task"),
  "agent.tasks.events": d("SSE", "/api/v1/agent/tasks/{taskId}/events", "agent-orchestration", "Live task stream"),
  "agent.messages.list": d("GET", "/api/v1/agent/projects/{projectId}/messages", "agent-orchestration", "Chat history"),
  "agent.messages.send": d("POST", "/api/v1/agent/projects/{projectId}/messages", "agent-orchestration", "Send prompt with editor context"),
  "agent.changeSets.get": d("GET", "/api/v1/agent/change-sets/{changeSetId}", "agent-orchestration", "Proposed multi-file change"),
  "agent.changeSets.decide": d("POST", "/api/v1/agent/change-sets/{changeSetId}/decision", "agent-orchestration", "Accept/reject files"),

  // ---------- builds / artifacts ----------
  "builds.list": d("GET", "/api/v1/builds?projectId=", "build-workers", "Build history"),
  "builds.get": d("GET", "/api/v1/builds/{buildId}", "build-workers", "Build detail"),
  "builds.start": d("POST", "/api/v1/builds", "build-workers", "Queue a build"),
  "builds.retry": d("POST", "/api/v1/builds/{buildId}/retry", "build-workers", "Retry build"),
  "builds.cancel": d("POST", "/api/v1/builds/{buildId}/cancel", "build-workers", "Cancel build"),
  "builds.logs": d("GET", "/api/v1/builds/{buildId}/logs", "build-workers", "Full log text"),
  "builds.logs.stream": d("SSE", "/api/v1/builds/{buildId}/logs/stream", "build-workers", "Live log lines"),
  "artifacts.list": d("GET", "/api/v1/artifacts?buildId=", "build-workers", "Artifacts for a build"),
  "artifacts.download": d("GET", "/api/v1/artifacts/{artifactId}/download", "build-workers", "Signed download URL"),

  // ---------- tests ----------
  "tests.list": d("GET", "/api/v1/tests?projectId=", "build-workers", "Test jobs"),
  "tests.get": d("GET", "/api/v1/tests/{jobId}", "build-workers", "Test job"),
  "tests.start": d("POST", "/api/v1/tests", "build-workers", "Queue test job"),
  "tests.cases": d("GET", "/api/v1/tests/{jobId}/cases", "build-workers", "Test cases"),
  "tests.screenshots": d("GET", "/api/v1/tests/{jobId}/screenshots", "build-workers", "Emulator screenshots"),
  "tests.logs": d("GET", "/api/v1/tests/{jobId}/logs", "build-workers", "Test log text"),

  // ---------- usage / billing ----------
  "usage.summary": d("GET", "/api/v1/usage/summary", "backend", "Current period usage"),
  "usage.daily": d("GET", "/api/v1/usage/daily?days=", "backend", "Daily usage series"),
  "billing.plans": d("GET", "/api/v1/billing/plans", "backend", "Available plans"),
  "billing.subscription": d("GET", "/api/v1/billing/subscription", "backend", "Current subscription"),
  "billing.invoices": d("GET", "/api/v1/billing/invoices", "backend", "Invoices"),
  "billing.checkout": d("POST", "/api/v1/billing/checkout", "backend", "Hosted checkout URL"),
  "billing.portal": d("POST", "/api/v1/billing/portal", "backend", "Hosted billing portal URL"),

  // ---------- admin ----------
  "admin.overview": d("GET", "/api/v1/admin/overview", "backend", "Platform stats"),
  "admin.users": d("GET", "/api/v1/admin/users", "backend", "User list"),
  "admin.workers": d("GET", "/api/v1/admin/workers", "backend", "Worker pool status"),
  "admin.audit": d("GET", "/api/v1/admin/audit", "backend", "Audit log"),

  // ---------- live preview ----------
  "preview.start": d("POST", "/api/v1/projects/{projectId}/preview/session", "build-workers", "Start an emulator stream session for the latest build"),
  "preview.stop": d("DELETE", "/api/v1/projects/{projectId}/preview/session/{sessionId}", "build-workers", "End an emulator stream session (frees the emulator)"),

  // ---------- visual editor (optional) ----------
  "ui.screens": d("GET", "/api/v1/projects/{projectId}/ui/screens", "code-generation", "Parsed UI screens"),
  "ui.screen": d("GET", "/api/v1/projects/{projectId}/ui/screens/{screenId}", "code-generation", "Component tree + preview"),
  "ui.edits": d("POST", "/api/v1/projects/{projectId}/ui/screens/{screenId}/edits", "code-generation", "Apply edits -> ChangeSet"),
} as const satisfies Record<string, EndpointSpec>;

export type EndpointKey = keyof typeof ENDPOINTS;
