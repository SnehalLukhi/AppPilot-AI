/**
 * /api/v1/admin/*
 * Owner: backend. STATUS: DRAFT. Requires role = "admin".
 */
import type { ID, ISODate } from "./common";
import type { User } from "./users";

export interface AdminOverview {
  users: number;
  activeUsers7d: number;
  projects: number;
  buildsToday: number;
  buildFailureRate24h: number; // 0–1
  agentTasksRunning: number;
  queueDepth: { builds: number; agent: number; tests: number };
  aiCostTodayUsd: number;
}

export interface AdminUser extends User {
  planId: ID;
  status: "active" | "suspended";
  projectCount: number;
  lastActiveAt: ISODate | null;
}

export interface WorkerStatus {
  id: ID;
  pool: "build" | "agent" | "emulator";
  state: "idle" | "busy" | "draining" | "offline";
  currentJobId: ID | null;
  lastHeartbeatAt: ISODate;
}

export interface AdminAuditEvent {
  id: ID;
  actorEmail: string;
  action: string;
  target: string;
  at: ISODate;
}
