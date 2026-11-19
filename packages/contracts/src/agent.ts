/**
 * /api/v1/agent/*
 * Owner: AI agent orchestration. STATUS: DRAFT.
 * The frontend only displays tasks and sends user intents; it never runs agents.
 */
import type { ID, ISODate } from "./common";

export const AGENT_TASK_STATUSES = [
  "queued",
  "planning",
  "analyzing",
  "generating",
  "reviewing",
  "building",
  "testing",
  "repairing",
  "completed",
  "failed",
  "blocked",
  "cancelled",
] as const;

export type AgentTaskStatus = (typeof AGENT_TASK_STATUSES)[number];

export const TERMINAL_AGENT_STATUSES: readonly AgentTaskStatus[] = [
  "completed",
  "failed",
  "blocked",
  "cancelled",
];

export type AgentIntent =
  | "chat"
  | "explain"
  | "generate"
  | "modify"
  | "fix"
  | "refactor";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AgentTask {
  id: ID;
  projectId: ID;
  title: string;
  description: string;
  intent: AgentIntent;
  status: AgentTaskStatus;
  /** Human-readable label of the step in progress, e.g. "Updating LoginScreen.kt". */
  currentStep: string | null;
  filesAnalyzing: string[];
  filesModifying: string[];
  buildProgress: { percent: number; phase: string } | null;
  repairIterations: number;
  maxRepairIterations: number;
  tokenUsage: TokenUsage;
  /** Cost recorded by the backend, in USD. Never computed by the frontend. */
  recordedCostUsd: number;
  blockedReason: string | null;
  errorMessage: string | null;
  createdAt: ISODate;
  startedAt: ISODate | null;
  finishedAt: ISODate | null;
}

export interface AgentTimelineEvent {
  id: ID;
  taskId: ID;
  at: ISODate;
  status: AgentTaskStatus;
  title: string;
  detail?: string;
  files?: string[];
}

export interface ImplementationPlan {
  summary: string;
  steps: { id: ID; title: string; detail: string; files: string[] }[];
}

export type ChangeType = "add" | "modify" | "delete";
export type ChangeDecision = "pending" | "accepted" | "rejected";

export interface FileChange {
  path: string;
  changeType: ChangeType;
  originalContent: string | null;
  proposedContent: string | null;
  decision: ChangeDecision;
}

export interface ChangeSet {
  id: ID;
  taskId: ID;
  summary: string;
  files: FileChange[];
  status: "pending" | "applied" | "rejected" | "partially_applied";
}

export interface ChatMessage {
  id: ID;
  role: "user" | "assistant" | "system";
  content: string;
  intent?: AgentIntent;
  createdAt: ISODate;
  taskId?: ID;
  plan?: ImplementationPlan;
  changeSetId?: ID;
}

export interface EditorContext {
  activeFile?: string;
  selection?: { startLine: number; endLine: number; text: string };
  openFiles?: string[];
  diagnostics?: { path: string; line: number; message: string }[];
}

/** POST /agent/projects/{projectId}/messages */
export interface SendAgentMessageRequest {
  intent: AgentIntent;
  prompt: string;
  context: EditorContext;
}

export interface SendAgentMessageResponse {
  message: ChatMessage;
  task: AgentTask | null;
}

/** POST /agent/change-sets/{id}/decision */
export interface ChangeSetDecisionRequest {
  /** Paths to accept; every other pending file is rejected. */
  acceptPaths: string[];
}

/**
 * GET /agent/tasks/{id}/events (SSE). Event name = `type`.
 */
export type AgentStreamEvent =
  | { type: "task.updated"; task: AgentTask }
  | { type: "timeline.appended"; event: AgentTimelineEvent }
  | { type: "message.delta"; messageId: ID; delta: string }
  | { type: "message.completed"; message: ChatMessage }
  | { type: "changeset.ready"; changeSet: ChangeSet };
